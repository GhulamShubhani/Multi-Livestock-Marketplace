import { AppError } from '../../../utils/AppError';
import {
  comparePassword,
  hashPassword,
  isStrongPassword,
  PASSWORD_POLICY_MESSAGE,
} from '../../../utils/password';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { refreshTokenRepository } from '../../auth/repository/refresh-token.repository';
import { toPublicUser } from '../../auth/helpers/user.mapper';
import { userRepository } from '../repository/user.repository';
import { toSessionView } from '../helpers/user.mapper';
import type {
  AddressDto,
  ChangePasswordDto,
  SessionView,
  UpdateProfileDto,
} from '../dto/user.dto';

function getAddressId(address: { _id?: { toString(): string } }): string {
  return address._id ? String(address._id) : '';
}

export class ProfileService {
  async getProfile(userId: string) {
    const user = await userRepository.findByIdWithRole(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return {
      ...toPublicUser(user),
      addresses: user.addresses ?? [],
      lastLoginAt: user.lastLoginAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, ip?: string) {
    const user = await userRepository.findByIdWithRole(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();

    await userRepository.save(user);
    const populated = await userRepository.findByIdWithRole(userId);

    await activityLogService.log({
      actor: userId,
      actorEmail: user.email,
      action: 'profile.update',
      module: 'profile',
      ip,
    });

    return {
      ...toPublicUser(populated!),
      addresses: populated!.addresses ?? [],
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, ip?: string) {
    if (!isStrongPassword(dto.newPassword)) {
      throw AppError.badRequest(PASSWORD_POLICY_MESSAGE);
    }

    const user = await userRepository.findByIdWithSecrets(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    user.passwordHash = await hashPassword(dto.newPassword);
    await userRepository.save(user);
    await refreshTokenRepository.revokeAllForUser(userId);

    await activityLogService.log({
      actor: userId,
      actorEmail: user.email,
      action: 'profile.password_change',
      module: 'profile',
      ip,
      severity: 'warn',
    });
  }

  async listAddresses(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user.addresses ?? [];
  }

  async addAddress(userId: string, dto: AddressDto) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (dto.isDefault) {
      for (const a of user.addresses) {
        a.isDefault = false;
      }
    }

    user.addresses.push({
      label: dto.label,
      line1: dto.line1,
      line2: dto.line2,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      isDefault: dto.isDefault ?? user.addresses.length === 0,
    });

    await userRepository.save(user);
    return user.addresses;
  }

  async updateAddress(userId: string, addressId: string, dto: Partial<AddressDto>) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const address = user.addresses.find((a) => getAddressId(a as { _id?: { toString(): string } }) === addressId);
    if (!address) {
      throw AppError.notFound('Address not found');
    }

    if (dto.label !== undefined) address.label = dto.label;
    if (dto.line1 !== undefined) address.line1 = dto.line1;
    if (dto.line2 !== undefined) address.line2 = dto.line2;
    if (dto.city !== undefined) address.city = dto.city;
    if (dto.state !== undefined) address.state = dto.state;
    if (dto.postalCode !== undefined) address.postalCode = dto.postalCode;
    if (dto.country !== undefined) address.country = dto.country;

    if (dto.isDefault === true) {
      for (const a of user.addresses) {
        a.isDefault = false;
      }
      address.isDefault = true;
    } else if (dto.isDefault === false) {
      address.isDefault = false;
    }

    await userRepository.save(user);
    return user.addresses;
  }

  async deleteAddress(userId: string, addressId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const index = user.addresses.findIndex(
      (a) => getAddressId(a as { _id?: { toString(): string } }) === addressId,
    );
    if (index === -1) {
      throw AppError.notFound('Address not found');
    }

    user.addresses.splice(index, 1);

    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await userRepository.save(user);
    return user.addresses;
  }

  async listSessions(userId: string): Promise<SessionView[]> {
    const sessions = await refreshTokenRepository.listActiveForUser(userId);
    return sessions.map(toSessionView);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const revoked = await refreshTokenRepository.revokeById(sessionId, userId);
    if (!revoked) {
      throw AppError.notFound('Session not found');
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId);
  }
}

export const profileService = new ProfileService();
