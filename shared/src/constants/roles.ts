export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  SELLER: 'seller',
  BUYER: 'buyer',
  /** @deprecated Prefer BUYER — kept for migration compatibility */
  CUSTOMER: 'customer',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const SYSTEM_ROLES: RoleName[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.STAFF,
  ROLES.SELLER,
  ROLES.BUYER,
  ROLES.CUSTOMER,
];
