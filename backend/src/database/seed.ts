import { Types } from 'mongoose';
import { logger } from '../config/logger';
import { env } from '../config/env';
import {
  ALL_PERMISSION_KEYS,
  PERMISSIONS,
  ROLES,
  type PermissionKey,
} from '../constants/auth';
import { hashPassword, isStrongPassword } from '../utils/password';
import { permissionRepository } from '../modules/permission/repository/permission.repository';
import { roleRepository } from '../modules/role/repository/role.repository';
import { userRepository } from '../modules/user/repository/user.repository';
import { settingsRepository } from '../modules/settings/repository/settings.repository';

function describePermission(key: PermissionKey): { module: string; action: string; description: string } {
  const [module, action] = key.split(':');
  return {
    module,
    action,
    description: `${action} ${module}`,
  };
}

const ADMIN_PERMISSIONS: PermissionKey[] = ALL_PERMISSION_KEYS.filter(
  (k) => k !== PERMISSIONS.SETTINGS_UPDATE,
);

const MANAGER_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.CATS_CREATE,
  PERMISSIONS.CATS_READ,
  PERMISSIONS.CATS_UPDATE,
  PERMISSIONS.BREEDS_CREATE,
  PERMISSIONS.BREEDS_READ,
  PERMISSIONS.BREEDS_UPDATE,
  PERMISSIONS.CATEGORIES_CREATE,
  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.CATEGORIES_UPDATE,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.PAYMENTS_READ,
  PERMISSIONS.COUPONS_CREATE,
  PERMISSIONS.COUPONS_READ,
  PERMISSIONS.COUPONS_UPDATE,
  PERMISSIONS.REVIEWS_MODERATE,
  PERMISSIONS.UPLOADS_CREATE,
  PERMISSIONS.UPLOADS_DELETE,
  PERMISSIONS.CMS_READ,
  PERMISSIONS.CMS_UPDATE,
  PERMISSIONS.BANNERS_READ,
  PERMISSIONS.BANNERS_UPDATE,
  PERMISSIONS.DASHBOARD_READ,
  PERMISSIONS.REPORTS_READ,
  PERMISSIONS.REPORTS_EXPORT,
  PERMISSIONS.NOTIFICATIONS_CREATE,
  PERMISSIONS.NOTIFICATIONS_READ,
];

const STAFF_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.CATS_READ,
  PERMISSIONS.CATS_UPDATE,
  PERMISSIONS.BREEDS_READ,
  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.PAYMENTS_READ,
  PERMISSIONS.REVIEWS_MODERATE,
  PERMISSIONS.UPLOADS_CREATE,
  PERMISSIONS.DASHBOARD_READ,
];

const CUSTOMER_PERMISSIONS: PermissionKey[] = [];

async function seedPermissions(): Promise<Map<string, string>> {
  const items = ALL_PERMISSION_KEYS.map((key) => {
    const meta = describePermission(key);
    return { key, ...meta };
  });
  await permissionRepository.upsertMany(items);
  const docs = await permissionRepository.findAll();
  const map = new Map<string, string>();
  for (const doc of docs) {
    map.set(doc.key, String(doc._id));
  }
  return map;
}

async function seedRoles(permissionIds: Map<string, string>): Promise<void> {
  const toObjectIds = (keys: string[]) =>
    keys
      .map((k) => permissionIds.get(k))
      .filter((id): id is string => Boolean(id))
      .map((id) => new Types.ObjectId(id));

  await roleRepository.upsertByName({
    name: ROLES.SUPER_ADMIN,
    displayName: 'Super Admin',
    description: 'Full system access',
    isSystem: true,
    permissions: toObjectIds(ALL_PERMISSION_KEYS),
  });

  await roleRepository.upsertByName({
    name: ROLES.ADMIN,
    displayName: 'Admin',
    description: 'Administrative access excluding destructive system settings',
    isSystem: true,
    permissions: toObjectIds(ADMIN_PERMISSIONS),
  });

  await roleRepository.upsertByName({
    name: ROLES.MANAGER,
    displayName: 'Manager',
    description: 'Catalog, orders, and reports',
    isSystem: true,
    permissions: toObjectIds(MANAGER_PERMISSIONS),
  });

  await roleRepository.upsertByName({
    name: ROLES.STAFF,
    displayName: 'Staff',
    description: 'Limited operational access',
    isSystem: true,
    permissions: toObjectIds(STAFF_PERMISSIONS),
  });

  await roleRepository.upsertByName({
    name: ROLES.CUSTOMER,
    displayName: 'Customer',
    description: 'Customer account',
    isSystem: true,
    permissions: toObjectIds(CUSTOMER_PERMISSIONS),
  });
}

async function seedSuperAdmin(): Promise<void> {
  const email = env.SUPER_ADMIN_EMAIL.toLowerCase();
  const password = env.SUPER_ADMIN_PASSWORD;

  if (!isStrongPassword(password)) {
    throw new Error('SUPER_ADMIN_PASSWORD does not meet password policy');
  }

  const role = await roleRepository.findByName(ROLES.SUPER_ADMIN);
  if (!role) {
    throw new Error('Super admin role missing');
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    logger.info('Super admin already exists', { email });
    return;
  }

  await userRepository.create({
    email,
    passwordHash: await hashPassword(password),
    firstName: 'Super',
    lastName: 'Admin',
    role: role._id as Types.ObjectId,
    status: 'active',
    isEmailVerified: true,
  });

  logger.info('Super admin created', { email });
}

async function seedDefaultSettings(): Promise<void> {
  const existing = await settingsRepository.findByKey('general');
  if (existing) return;

  await settingsRepository.upsert('general', {
    siteName: 'Cat Marketplace',
    supportEmail: env.SUPER_ADMIN_EMAIL,
    defaultCurrency: env.DEFAULT_CURRENCY,
  });
  await settingsRepository.upsert('seo', {
    title: 'Cat Marketplace',
    description: 'Find your perfect feline companion',
  });
  await settingsRepository.upsert('storefront', {
    enableWishlist: true,
    enableReviews: true,
  });
  logger.info('Default settings seeded');
}

export async function runSeed(): Promise<void> {
  logger.info('Seeding RBAC data...');
  const permissionIds = await seedPermissions();
  await seedRoles(permissionIds);
  await seedSuperAdmin();
  await seedDefaultSettings();
  logger.info('Seed complete');
}
