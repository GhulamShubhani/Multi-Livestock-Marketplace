export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  SELLER: 'seller',
  BUYER: 'buyer',
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

/** Permission keys: module:action */
export const PERMISSIONS = {
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  ROLES_CREATE: 'roles:create',
  ROLES_READ: 'roles:read',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',

  PERMISSIONS_READ: 'permissions:read',

  LISTINGS_CREATE: 'listings:create',
  LISTINGS_READ: 'listings:read',
  LISTINGS_UPDATE: 'listings:update',
  LISTINGS_DELETE: 'listings:delete',
  LISTINGS_VERIFY: 'listings:verify',

  ATTRIBUTES_CREATE: 'attributes:create',
  ATTRIBUTES_READ: 'attributes:read',
  ATTRIBUTES_UPDATE: 'attributes:update',
  ATTRIBUTES_DELETE: 'attributes:delete',

  ENQUIRIES_READ: 'enquiries:read',
  ENQUIRIES_UPDATE: 'enquiries:update',

  SELLERS_READ: 'sellers:read',
  SELLERS_UPDATE: 'sellers:update',

  LOCATIONS_CREATE: 'locations:create',
  LOCATIONS_READ: 'locations:read',
  LOCATIONS_UPDATE: 'locations:update',
  LOCATIONS_DELETE: 'locations:delete',

  HOMEPAGE_CREATE: 'homepage:create',
  HOMEPAGE_READ: 'homepage:read',
  HOMEPAGE_UPDATE: 'homepage:update',
  HOMEPAGE_DELETE: 'homepage:delete',

  CONTENT_CREATE: 'content:create',
  CONTENT_READ: 'content:read',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',

  BREEDS_CREATE: 'breeds:create',
  BREEDS_READ: 'breeds:read',
  BREEDS_UPDATE: 'breeds:update',
  BREEDS_DELETE: 'breeds:delete',

  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  ORDERS_READ: 'orders:read',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',

  PAYMENTS_READ: 'payments:read',
  PAYMENTS_VERIFY: 'payments:verify',
  PAYMENTS_REFUND: 'payments:refund',

  COUPONS_CREATE: 'coupons:create',
  COUPONS_READ: 'coupons:read',
  COUPONS_UPDATE: 'coupons:update',
  COUPONS_DELETE: 'coupons:delete',

  REVIEWS_MODERATE: 'reviews:moderate',
  REVIEWS_DELETE: 'reviews:delete',

  UPLOADS_CREATE: 'uploads:create',
  UPLOADS_DELETE: 'uploads:delete',

  NOTIFICATIONS_CREATE: 'notifications:create',
  NOTIFICATIONS_READ: 'notifications:read',

  CMS_CREATE: 'cms:create',
  CMS_READ: 'cms:read',
  CMS_UPDATE: 'cms:update',
  CMS_DELETE: 'cms:delete',

  BANNERS_CREATE: 'banners:create',
  BANNERS_READ: 'banners:read',
  BANNERS_UPDATE: 'banners:update',
  BANNERS_DELETE: 'banners:delete',

  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  DASHBOARD_READ: 'dashboard:read',
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',

  ACTIVITY_LOGS_READ: 'activity_logs:read',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS);

export const COOKIE_NAMES = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  CSRF: 'csrf_token',
} as const;

export const AUTH_LIMITS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_MINUTES: 30,
  OTP_LENGTH: 6,
  OTP_EXPIRES_MINUTES: 10,
  OTP_MAX_ATTEMPTS: 5,
  EMAIL_VERIFY_EXPIRES_HOURS: 24,
  PASSWORD_RESET_EXPIRES_MINUTES: 60,
} as const;
