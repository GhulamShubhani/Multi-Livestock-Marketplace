import { Types } from 'mongoose';
import { ROLES } from '../../../constants/auth';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { hashPassword, isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../utils/password';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { refreshTokenRepository } from '../../auth/repository/refresh-token.repository';
import { roleRepository } from '../../role/repository/role.repository';
import { userRepository } from '../repository/user.repository';
import { toAdminUserView, toSessionView } from '../helpers/user.mapper';
import type {
  CreateUserDto,
  SessionView,
  UpdateUserDto,
  UpdateUserStatusDto,
} from '../dto/user.dto';
import type { UserStatus } from '../interface/user.interface';

export class UserService {
  async list(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const status = query.status as UserStatus | undefined;
    const roleName = typeof query.role === 'string' ? query.role : undefined;
    let roleId: string | undefined;

    if (roleName) {
      const role = await roleRepository.findByName(roleName);
      if (!role) {
        return { items: [], meta: buildPaginationMeta(page, limit, 0) };
      }
      roleId = String(role._id);
    }

    const { items, total } = await userRepository.list({
      q: typeof query.q === 'string' ? query.q : undefined,
      status,
      roleId,
      skip,
      limit,
    });

    return {
      items: items.map(toAdminUserView),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getById(id: string) {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return toAdminUserView(user);
  }

  async create(dto: CreateUserDto, actorId: string, ip?: string) {
    if (!isStrongPassword(dto.password)) {
      throw AppError.badRequest(PASSWORD_POLICY_MESSAGE);
    }

    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    const role = await roleRepository.findByName(dto.roleName);
    if (!role) {
      throw AppError.badRequest('Invalid role');
    }

    if (role.name === ROLES.SUPER_ADMIN) {
      throw AppError.forbidden('Cannot create another super admin via API');
    }

    const user = await userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash: await hashPassword(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone?.trim(),
      role: role._id as Types.ObjectId,
      status: dto.status ?? 'active',
      isEmailVerified: dto.isEmailVerified ?? true,
    });

    const populated = await userRepository.findByIdWithRole(String(user._id));
    if (!populated) {
      throw AppError.internal('Failed to load created user');
    }

    await activityLogService.log({
      actor: actorId,
      action: 'users.create',
      module: 'users',
      resourceType: 'user',
      resourceId: user._id,
      ip,
      metadata: { email: user.email, role: role.name },
    });

    return toAdminUserView(populated);
  }

  async update(id: string, dto: UpdateUserDto, actorId: string, ip?: string) {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const currentRole = (user.role as unknown as { name?: string })?.name;

    if (dto.roleName) {
      if (currentRole === ROLES.SUPER_ADMIN) {
        throw AppError.forbidden('Cannot change super admin role');
      }
      const role = await roleRepository.findByName(dto.roleName);
      if (!role) {
        throw AppError.badRequest('Invalid role');
      }
      if (role.name === ROLES.SUPER_ADMIN) {
        throw AppError.forbidden('Cannot assign super admin role via API');
      }
      user.role = role._id as Types.ObjectId;
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.permissionsOverride !== undefined) {
      user.permissionsOverride = dto.permissionsOverride;
    }

    await userRepository.save(user);
    const populated = await userRepository.findByIdWithRole(id);
    if (!populated) {
      throw AppError.notFound('User not found');
    }

    await activityLogService.log({
      actor: actorId,
      action: 'users.update',
      module: 'users',
      resourceType: 'user',
      resourceId: id,
      ip,
    });

    return toAdminUserView(populated);
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, actorId: string, ip?: string) {
    if (id === actorId) {
      throw AppError.badRequest('Cannot change your own status');
    }

    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const currentRole = (user.role as unknown as { name?: string })?.name;
    if (currentRole === ROLES.SUPER_ADMIN) {
      throw AppError.forbidden('Cannot change super admin status');
    }

    user.status = dto.status;
    await userRepository.save(user);

    if (dto.status === 'banned' || dto.status === 'inactive') {
      await refreshTokenRepository.revokeAllForUser(id);
    }

    await activityLogService.log({
      actor: actorId,
      action: 'users.status_update',
      module: 'users',
      resourceType: 'user',
      resourceId: id,
      ip,
      metadata: { status: dto.status },
      severity: 'warn',
    });

    const populated = await userRepository.findByIdWithRole(id);
    return toAdminUserView(populated!);
  }

  async remove(id: string, actorId: string, ip?: string) {
    if (id === actorId) {
      throw AppError.badRequest('Cannot delete your own account');
    }

    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const currentRole = (user.role as unknown as { name?: string })?.name;
    if (currentRole === ROLES.SUPER_ADMIN) {
      throw AppError.forbidden('Cannot delete super admin');
    }

    await userRepository.softDelete(id);
    await refreshTokenRepository.revokeAllForUser(id);

    await activityLogService.log({
      actor: actorId,
      action: 'users.delete',
      module: 'users',
      resourceType: 'user',
      resourceId: id,
      ip,
      severity: 'warn',
    });
  }

  async listSessions(userId: string): Promise<SessionView[]> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    const sessions = await refreshTokenRepository.listActiveForUser(userId);
    return sessions.map(toSessionView);
  }

  async revokeAllSessions(userId: string, actorId: string, ip?: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    await refreshTokenRepository.revokeAllForUser(userId);
    await activityLogService.log({
      actor: actorId,
      action: 'users.sessions_revoke_all',
      module: 'users',
      resourceType: 'user',
      resourceId: userId,
      ip,
      severity: 'warn',
    });
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    actorId: string,
    ip?: string,
  ): Promise<void> {
    const revoked = await refreshTokenRepository.revokeById(sessionId, userId);
    if (!revoked) {
      throw AppError.notFound('Session not found');
    }

    await activityLogService.log({
      actor: actorId,
      action: 'users.session_revoke',
      module: 'users',
      resourceType: 'session',
      resourceId: sessionId,
      ip,
      metadata: { userId },
    });
  }
}

export const userService = new UserService();
