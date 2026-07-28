import type { UserStatus } from '../interface/user.interface';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: string;
  status?: UserStatus;
  isEmailVerified?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleName?: string;
  permissionsOverride?: string[];
}

export interface UpdateUserStatusDto {
  status: UserStatus;
}

export interface AddressDto {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUserView {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  roleId: string;
  permissions: string[];
  permissionsOverride: string[];
  isEmailVerified: boolean;
  status: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  addresses: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionView {
  id: string;
  familyId: string;
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}
