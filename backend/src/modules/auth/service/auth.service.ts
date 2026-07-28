import { Types } from 'mongoose';
import { env } from '../../../config/env';
import { AUTH_LIMITS, ROLES } from '../../../constants/auth';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/AppError';
import { comparePassword, hashPassword, isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../utils/password';
import {
  addDuration,
  generateNumericOtp,
  generateOpaqueToken,
  hashToken,
  signAccessToken,
} from '../../../utils/token';
import { emailService } from '../../../services/email.service';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { roleRepository } from '../../role/repository/role.repository';
import { userRepository } from '../../user/repository/user.repository';
import { refreshTokenRepository } from '../repository/refresh-token.repository';
import { extractRoleAndPermissions, toPublicUser } from '../helpers/user.mapper';
import type {
  AuthRequestContext,
  ForgotPasswordDto,
  LoginDto,
  OtpSendDto,
  OtpVerifyDto,
  PublicUserDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import type { UserDocument } from '../../user/interface/user.interface';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export interface AuthResult {
  user: PublicUserDto;
  tokens: AuthTokens;
}

export class AuthService {
  async register(dto: RegisterDto, ctx: AuthRequestContext): Promise<AuthResult> {
    if (!isStrongPassword(dto.password)) {
      throw AppError.badRequest(PASSWORD_POLICY_MESSAGE);
    }

    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    const customerRole = await roleRepository.findByName(ROLES.CUSTOMER);
    if (!customerRole) {
      throw AppError.internal('Customer role not seeded');
    }

    const emailToken = generateOpaqueToken(32);
    const user = await userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash: await hashPassword(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone?.trim(),
      role: customerRole._id as Types.ObjectId,
      status: 'active',
      isEmailVerified: false,
      emailVerificationTokenHash: hashToken(emailToken),
      emailVerificationExpires: addDuration(new Date(), `${AUTH_LIMITS.EMAIL_VERIFY_EXPIRES_HOURS}h`),
    });

    await emailService.sendEmailVerification(user.email, emailToken);

    const populated = await userRepository.findByIdWithRole(String(user._id));
    if (!populated) {
      throw AppError.internal('Failed to load user after registration');
    }

    const tokens = await this.issueSession(populated, ctx);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.register',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { user: toPublicUser(populated), tokens };
  }

  async login(dto: LoginDto, ctx: AuthRequestContext): Promise<AuthResult> {
    const user = await userRepository.findByEmailWithSecrets(dto.email.toLowerCase().trim());
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      throw new AppError('Account temporarily locked. Try again later.', HTTP_STATUS.LOCKED);
    }

    if (user.status === 'banned' || user.status === 'inactive') {
      throw AppError.forbidden('Account is not allowed to sign in');
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      await this.registerFailedLogin(user);
      throw AppError.unauthorized('Invalid email or password');
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ctx.ip;
    await userRepository.save(user);

    const populated = await userRepository.findByIdWithRole(String(user._id));
    if (!populated) {
      throw AppError.internal('Failed to load user');
    }

    const tokens = await this.issueSession(populated, ctx);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.login',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { user: toPublicUser(populated), tokens };
  }

  async refresh(rawRefreshToken: string | undefined, ctx: AuthRequestContext): Promise<AuthResult> {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Refresh token missing');
    }

    const existing = await refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken));
    if (!existing) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    if (existing.revokedAt) {
      await refreshTokenRepository.revokeFamily(existing.familyId);
      await activityLogService.log({
        actor: existing.user,
        action: 'auth.refresh_reuse_detected',
        module: 'auth',
        severity: 'critical',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        metadata: { familyId: existing.familyId },
      });
      throw AppError.unauthorized('Refresh token reuse detected. Please sign in again.');
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Refresh token expired');
    }

    const user = await userRepository.findByIdWithRole(String(existing.user));
    if (!user || user.status === 'banned' || user.status === 'inactive') {
      throw AppError.unauthorized('User session invalid');
    }

    const { roleName, permissions } = extractRoleAndPermissions(user);
    const newRawRefresh = generateOpaqueToken(48);
    const newTokenDoc = await refreshTokenRepository.create({
      user: user._id as Types.ObjectId,
      tokenHash: hashToken(newRawRefresh),
      familyId: existing.familyId,
      expiresAt: addDuration(new Date(), env.JWT_REFRESH_EXPIRES_IN),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    await refreshTokenRepository.revoke(existing, newTokenDoc._id as Types.ObjectId);

    const accessToken = signAccessToken({
      sub: String(user._id),
      role: roleName,
      permissions,
      sid: existing.familyId,
    });

    return {
      user: toPublicUser(user),
      tokens: {
        accessToken,
        refreshToken: newRawRefresh,
        csrfToken: generateOpaqueToken(24),
      },
    };
  }

  async logout(rawRefreshToken: string | undefined, userId: string, ctx: AuthRequestContext): Promise<void> {
    if (rawRefreshToken) {
      const existing = await refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken));
      if (existing && !existing.revokedAt) {
        await refreshTokenRepository.revoke(existing);
      }
    }

    await activityLogService.log({
      actor: userId,
      action: 'auth.logout',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  async logoutAll(userId: string, ctx: AuthRequestContext): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId);
    await activityLogService.log({
      actor: userId,
      action: 'auth.logout_all',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  async me(userId: string): Promise<PublicUserDto> {
    const user = await userRepository.findByIdWithRole(userId);
    if (!user) {
      throw AppError.unauthorized('User not found');
    }
    return toPublicUser(user);
  }

  async verifyEmail(dto: VerifyEmailDto, ctx: AuthRequestContext): Promise<PublicUserDto> {
    const user = await userRepository.findByEmailVerificationToken(hashToken(dto.token));
    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await userRepository.save(user);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.verify_email',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    const populated = await userRepository.findByIdWithRole(String(user._id));
    if (!populated) {
      throw AppError.internal('Failed to load user');
    }
    return toPublicUser(populated);
  }

  async resendVerification(email: string, ctx: AuthRequestContext): Promise<void> {
    const user = await userRepository.findByEmailWithSecrets(email.toLowerCase().trim());
    if (!user || user.isEmailVerified) {
      return;
    }

    const emailToken = generateOpaqueToken(32);
    user.emailVerificationTokenHash = hashToken(emailToken);
    user.emailVerificationExpires = addDuration(new Date(), `${AUTH_LIMITS.EMAIL_VERIFY_EXPIRES_HOURS}h`);
    await userRepository.save(user);
    await emailService.sendEmailVerification(user.email, emailToken);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.resend_verification',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto, ctx: AuthRequestContext): Promise<void> {
    const user = await userRepository.findByEmailWithSecrets(dto.email.toLowerCase().trim());
    if (!user) {
      return;
    }

    const resetToken = generateOpaqueToken(32);
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = addDuration(new Date(), `${AUTH_LIMITS.PASSWORD_RESET_EXPIRES_MINUTES}m`);
    await userRepository.save(user);
    await emailService.sendPasswordReset(user.email, resetToken);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.forgot_password',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  async resetPassword(dto: ResetPasswordDto, ctx: AuthRequestContext): Promise<void> {
    if (!isStrongPassword(dto.password)) {
      throw AppError.badRequest(PASSWORD_POLICY_MESSAGE);
    }

    const user = await userRepository.findByPasswordResetToken(hashToken(dto.token));
    if (!user) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    user.passwordHash = await hashPassword(dto.password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await userRepository.save(user);
    await refreshTokenRepository.revokeAllForUser(user._id);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.reset_password',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      severity: 'warn',
    });
  }

  async sendOtp(dto: OtpSendDto, ctx: AuthRequestContext): Promise<void> {
    const user = await userRepository.findByEmailWithSecrets(dto.email.toLowerCase().trim());
    if (!user) {
      return;
    }

    const otp = generateNumericOtp(AUTH_LIMITS.OTP_LENGTH);
    user.otpHash = hashToken(otp);
    user.otpExpires = addDuration(new Date(), `${AUTH_LIMITS.OTP_EXPIRES_MINUTES}m`);
    user.otpAttempts = 0;
    await userRepository.save(user);
    await emailService.sendOtp(user.email, otp);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.otp_send',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  async verifyOtp(dto: OtpVerifyDto, ctx: AuthRequestContext): Promise<{ verified: true }> {
    const user = await userRepository.findByEmailWithSecrets(dto.email.toLowerCase().trim());
    if (!user || !user.otpHash || !user.otpExpires) {
      throw AppError.badRequest('Invalid or expired OTP');
    }

    if (user.otpExpires.getTime() <= Date.now()) {
      throw AppError.badRequest('Invalid or expired OTP');
    }

    if (user.otpAttempts >= AUTH_LIMITS.OTP_MAX_ATTEMPTS) {
      throw AppError.tooManyRequests('Too many OTP attempts');
    }

    if (user.otpHash !== hashToken(dto.otp)) {
      user.otpAttempts += 1;
      await userRepository.save(user);
      throw AppError.badRequest('Invalid or expired OTP');
    }

    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.isEmailVerified = true;
    await userRepository.save(user);

    await activityLogService.log({
      actor: user._id,
      actorEmail: user.email,
      action: 'auth.otp_verify',
      module: 'auth',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { verified: true };
  }

  private async issueSession(user: UserDocument, ctx: AuthRequestContext): Promise<AuthTokens> {
    const { roleName, permissions } = extractRoleAndPermissions(user);
    const familyId = generateOpaqueToken(16);
    const rawRefresh = generateOpaqueToken(48);

    await refreshTokenRepository.create({
      user: user._id as Types.ObjectId,
      tokenHash: hashToken(rawRefresh),
      familyId,
      expiresAt: addDuration(new Date(), env.JWT_REFRESH_EXPIRES_IN),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    const accessToken = signAccessToken({
      sub: String(user._id),
      role: roleName,
      permissions,
      sid: familyId,
    });

    return {
      accessToken,
      refreshToken: rawRefresh,
      csrfToken: generateOpaqueToken(24),
    };
  }

  private async registerFailedLogin(user: UserDocument): Promise<void> {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= AUTH_LIMITS.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = addDuration(new Date(), `${AUTH_LIMITS.LOCK_MINUTES}m`);
      user.failedLoginAttempts = 0;
      await activityLogService.log({
        actor: user._id,
        actorEmail: user.email,
        action: 'auth.account_locked',
        module: 'auth',
        severity: 'warn',
      });
    }
    await userRepository.save(user);
  }
}

export const authService = new AuthService();
