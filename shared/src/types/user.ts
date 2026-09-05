import type { RoleName } from '../constants/roles';
import type { PermissionKey } from '../constants/permissions';
import type { MediaAsset } from './common';

export type UserStatus = 'active' | 'inactive' | 'banned' | 'pending';

export interface UserSummary {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: MediaAsset;
  role?: string | { _id: string; name: RoleName; displayName?: string };
  permissions?: PermissionKey[];
  isEmailVerified?: boolean;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}
