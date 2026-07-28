import type { UserDocument } from '../interface/user.interface';
import { extractRoleAndPermissions } from '../../auth/helpers/user.mapper';
import type { AdminUserView, SessionView } from '../dto/user.dto';
import type { RefreshTokenDocument } from '../../auth/interface/refresh-token.interface';

export function toAdminUserView(user: UserDocument): AdminUserView {
  const { roleName, permissions } = extractRoleAndPermissions(user);
  const roleDoc = user.role as unknown as { _id?: { toString(): string }; name?: string };

  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: roleName,
    roleId: roleDoc?._id ? String(roleDoc._id) : String(user.role),
    permissions,
    permissionsOverride: user.permissionsOverride ?? [],
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    lastLoginIp: user.lastLoginIp,
    addresses: user.addresses ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toSessionView(token: RefreshTokenDocument): SessionView {
  return {
    id: String(token._id),
    familyId: token.familyId,
    ip: token.ip,
    userAgent: token.userAgent,
    expiresAt: token.expiresAt,
    createdAt: token.createdAt,
  };
}
