import type { UserDocument } from '../../user/interface/user.interface';
import type { PublicUserDto } from '../dto/auth.dto';

interface PermissionLike {
  key?: string;
}

interface RoleLike {
  name?: string;
  permissions?: PermissionLike[] | unknown[];
}

export function extractRoleAndPermissions(user: UserDocument): {
  roleName: string;
  permissions: string[];
} {
  const role = user.role as unknown as RoleLike;
  const roleName = role?.name ?? 'customer';

  const fromRole = Array.isArray(role?.permissions)
    ? role.permissions
        .map((p) => (typeof p === 'object' && p !== null && 'key' in p ? String((p as PermissionLike).key) : ''))
        .filter(Boolean)
    : [];

  const overrides = user.permissionsOverride ?? [];
  const permissions = Array.from(new Set([...fromRole, ...overrides]));
  return { roleName, permissions };
}

export function toPublicUser(user: UserDocument): PublicUserDto {
  const { roleName, permissions } = extractRoleAndPermissions(user);
  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: roleName,
    permissions,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
  };
}
