import { Types } from 'mongoose';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { ALL_PERMISSION_KEYS, PERMISSIONS, ROLES, type PermissionKey } from '../constants/auth';
import { hashPassword, isStrongPassword } from '../utils/password';
import { permissionRepository } from '../modules/permission/repository/permission.repository';
import { roleRepository } from '../modules/role/repository/role.repository';
import { userRepository } from '../modules/user/repository/user.repository';
import { settingsRepository } from '../modules/settings/repository/settings.repository';
import { breedRepository } from '../modules/breed/repository/breed.repository';
import { categoryRepository } from '../modules/category/repository/category.repository';
import { attributeRepository } from '../modules/attribute/repository/attribute.repository';
import { homepageRepository } from '../modules/homepage/repository/homepage.repository';
import type { AttributeType } from '../modules/attribute/interface/attribute.interface';

function describePermission(key: PermissionKey): {
  module: string;
  action: string;
  description: string;
} {
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
  PERMISSIONS.LISTINGS_CREATE,
  PERMISSIONS.LISTINGS_READ,
  PERMISSIONS.LISTINGS_UPDATE,
  PERMISSIONS.LISTINGS_VERIFY,
  PERMISSIONS.ATTRIBUTES_CREATE,
  PERMISSIONS.ATTRIBUTES_READ,
  PERMISSIONS.ATTRIBUTES_UPDATE,
  PERMISSIONS.BREEDS_CREATE,
  PERMISSIONS.BREEDS_READ,
  PERMISSIONS.BREEDS_UPDATE,
  PERMISSIONS.CATEGORIES_CREATE,
  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.CATEGORIES_UPDATE,
  PERMISSIONS.ENQUIRIES_READ,
  PERMISSIONS.ENQUIRIES_UPDATE,
  PERMISSIONS.SELLERS_READ,
  PERMISSIONS.SELLERS_UPDATE,
  PERMISSIONS.HOMEPAGE_READ,
  PERMISSIONS.HOMEPAGE_UPDATE,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.PAYMENTS_READ,
  PERMISSIONS.PAYMENTS_VERIFY,
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
  PERMISSIONS.LISTINGS_READ,
  PERMISSIONS.LISTINGS_UPDATE,
  PERMISSIONS.ATTRIBUTES_READ,
  PERMISSIONS.BREEDS_READ,
  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.ENQUIRIES_READ,
  PERMISSIONS.ENQUIRIES_UPDATE,
  PERMISSIONS.SELLERS_READ,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.PAYMENTS_READ,
  PERMISSIONS.REVIEWS_MODERATE,
  PERMISSIONS.UPLOADS_CREATE,
  PERMISSIONS.DASHBOARD_READ,
];

const SELLER_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.LISTINGS_CREATE,
  PERMISSIONS.LISTINGS_READ,
  PERMISSIONS.LISTINGS_UPDATE,
  PERMISSIONS.ATTRIBUTES_READ,
  PERMISSIONS.BREEDS_READ,
  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.ENQUIRIES_READ,
  PERMISSIONS.ENQUIRIES_UPDATE,
  PERMISSIONS.SELLERS_READ,
  PERMISSIONS.UPLOADS_CREATE,
];

const BUYER_PERMISSIONS: PermissionKey[] = [];
const CUSTOMER_PERMISSIONS: PermissionKey[] = [];

const DEFAULT_CATEGORIES = [
  {
    name: 'Cats',
    slug: 'cats',
    group: 'companion',
    sortOrder: 1,
    description: 'Adult cats for sale',
  },
  {
    name: 'Kittens',
    slug: 'kittens',
    group: 'companion',
    sortOrder: 2,
    description: 'Young cats under 12 months',
  },
  {
    name: 'Cows',
    slug: 'cows',
    group: 'livestock',
    sortOrder: 3,
    description: 'Dairy and dual-purpose cows',
  },
  {
    name: 'Buffaloes',
    slug: 'buffaloes',
    group: 'livestock',
    sortOrder: 4,
    description: 'Buffalo livestock',
  },
  {
    name: 'Bulls',
    slug: 'bulls',
    group: 'livestock',
    sortOrder: 5,
    description: 'Breeding and draught bulls',
  },
  {
    name: 'Goats',
    slug: 'goats',
    group: 'livestock',
    sortOrder: 6,
    description: 'Goats for milk and meat',
  },
  {
    name: 'Khassi',
    slug: 'khassi',
    group: 'livestock',
    sortOrder: 7,
    description: 'Castrated male goats',
  },
  {
    name: 'Sheep',
    slug: 'sheep',
    group: 'livestock',
    sortOrder: 8,
    description: 'Sheep for wool and meat',
  },
  {
    name: 'Chickens',
    slug: 'chickens',
    group: 'poultry',
    sortOrder: 9,
    description: 'Broilers and layers',
  },
  { name: 'Ducks', slug: 'ducks', group: 'poultry', sortOrder: 10, description: 'Duck poultry' },
  {
    name: 'Poultry',
    slug: 'poultry',
    group: 'poultry',
    sortOrder: 11,
    description: 'General poultry listings',
  },
];

const DEFAULT_BREEDS: Array<{
  name: string;
  slug: string;
  origin?: string;
  temperament?: string[];
  categorySlugs: string[];
}> = [
  {
    name: 'Persian',
    slug: 'persian',
    origin: 'Iran',
    temperament: ['Calm'],
    categorySlugs: ['cats', 'kittens'],
  },
  {
    name: 'Siamese',
    slug: 'siamese',
    origin: 'Thailand',
    temperament: ['Vocal'],
    categorySlugs: ['cats', 'kittens'],
  },
  {
    name: 'Maine Coon',
    slug: 'maine-coon',
    origin: 'USA',
    temperament: ['Gentle'],
    categorySlugs: ['cats', 'kittens'],
  },
  {
    name: 'Gir',
    slug: 'gir',
    origin: 'India',
    temperament: ['Docile'],
    categorySlugs: ['cows', 'bulls'],
  },
  {
    name: 'Sahiwal',
    slug: 'sahiwal',
    origin: 'Pakistan',
    temperament: ['Hardy'],
    categorySlugs: ['cows'],
  },
  {
    name: 'Murrah',
    slug: 'murrah',
    origin: 'India',
    temperament: ['Docile'],
    categorySlugs: ['buffaloes'],
  },
  {
    name: 'Jamunapari',
    slug: 'jamunapari',
    origin: 'India',
    temperament: ['Alert'],
    categorySlugs: ['goats', 'khassi'],
  },
  {
    name: 'Beetal',
    slug: 'beetal',
    origin: 'Pakistan',
    temperament: ['Hardy'],
    categorySlugs: ['goats'],
  },
  {
    name: 'Merino',
    slug: 'merino',
    origin: 'Spain',
    temperament: ['Calm'],
    categorySlugs: ['sheep'],
  },
  {
    name: 'Kadaknath',
    slug: 'kadaknath',
    origin: 'India',
    temperament: ['Active'],
    categorySlugs: ['chickens', 'poultry'],
  },
  {
    name: 'Aylesbury',
    slug: 'aylesbury',
    origin: 'UK',
    temperament: ['Calm'],
    categorySlugs: ['ducks', 'poultry'],
  },
];

type SeedAttribute = {
  name: string;
  key: string;
  label: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
  categorySlugs: string[];
  filterable?: boolean;
  showOnCard?: boolean;
  required?: boolean;
};

const DEFAULT_ATTRIBUTES: SeedAttribute[] = [
  {
    name: 'Breed',
    key: 'breed',
    label: 'Breed',
    type: 'select',
    options: [],
    categorySlugs: [
      'cats',
      'kittens',
      'cows',
      'buffaloes',
      'bulls',
      'goats',
      'khassi',
      'sheep',
      'chickens',
      'ducks',
      'poultry',
    ],
    filterable: true,
    showOnCard: true,
    required: false,
  },
  {
    name: 'Milk Capacity',
    key: 'milkCapacity',
    label: 'Milk Capacity',
    type: 'decimal',
    unit: 'L/day',
    categorySlugs: ['cows', 'buffaloes'],
    filterable: true,
    showOnCard: true,
  },
  {
    name: 'Lactation Number',
    key: 'lactationNumber',
    label: 'Lactation Number',
    type: 'number',
    categorySlugs: ['cows', 'buffaloes'],
    filterable: true,
  },
  {
    name: 'Horn Status',
    key: 'hornStatus',
    label: 'Horn Status',
    type: 'select',
    options: ['horned', 'polled', 'dehorned'],
    categorySlugs: ['cows', 'buffaloes', 'bulls', 'goats', 'sheep'],
    filterable: true,
  },
  {
    name: 'Vaccinated',
    key: 'vaccinated',
    label: 'Vaccinated',
    type: 'yes_no',
    categorySlugs: [
      'cats',
      'kittens',
      'cows',
      'buffaloes',
      'bulls',
      'goats',
      'khassi',
      'sheep',
      'chickens',
      'ducks',
      'poultry',
    ],
    filterable: true,
    showOnCard: true,
  },
  {
    name: 'Egg Production',
    key: 'eggProduction',
    label: 'Egg Production',
    type: 'number',
    unit: 'eggs/week',
    categorySlugs: ['chickens', 'ducks', 'poultry'],
    filterable: true,
    showOnCard: true,
  },
  {
    name: 'Purpose',
    key: 'purpose',
    label: 'Purpose',
    type: 'select',
    options: ['dairy', 'meat', 'breeding', 'draught', 'pets', 'dual'],
    categorySlugs: [
      'cows',
      'buffaloes',
      'bulls',
      'goats',
      'khassi',
      'sheep',
      'chickens',
      'ducks',
      'poultry',
    ],
    filterable: true,
    showOnCard: true,
  },
];

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
    name: ROLES.SELLER,
    displayName: 'Seller',
    description: 'Livestock seller account',
    isSystem: true,
    permissions: toObjectIds(SELLER_PERMISSIONS),
  });

  await roleRepository.upsertByName({
    name: ROLES.BUYER,
    displayName: 'Buyer',
    description: 'Livestock buyer account',
    isSystem: true,
    permissions: toObjectIds(BUYER_PERMISSIONS),
  });

  await roleRepository.upsertByName({
    name: ROLES.CUSTOMER,
    displayName: 'Customer',
    description: 'Legacy customer account (maps to buyer)',
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
  const general = await settingsRepository.findByKey('general');
  if (!general) {
    await settingsRepository.upsert('general', {
      siteName: 'Multi-Livestock Marketplace',
      supportEmail: env.SUPER_ADMIN_EMAIL,
      defaultCurrency: env.DEFAULT_CURRENCY,
      currencyMessage: `All prices are shown in ${env.DEFAULT_CURRENCY}`,
    });
  }

  const seo = await settingsRepository.findByKey('seo');
  if (!seo) {
    await settingsRepository.upsert('seo', {
      title: 'Multi-Livestock Marketplace',
      description: 'Buy and sell cats, cattle, goats, sheep, and poultry across India',
    });
  }

  const storefront = await settingsRepository.findByKey('storefront');
  if (!storefront) {
    await settingsRepository.upsert('storefront', {
      enableWishlist: true,
      enableReviews: true,
      enableEnquiries: true,
    });
  }

  const payment = await settingsRepository.findByKey('payment');
  if (!payment) {
    await settingsRepository.upsert('payment', {
      receiverName: 'Demo Livestock Marketplace',
      mobile: '9999999999',
      upiId: 'demo@upi',
      qrCode: null,
      bankName: 'Demo Bank',
      accountHolder: 'Demo Livestock Marketplace',
      accountNumber: '000000000000',
      ifsc: 'DEMO0000000',
      instructions:
        'DEMO ONLY — Do not send real money. Transfer via UPI to the demo ID and submit UTR/screenshot for admin verification.',
    });
  }

  logger.info('Default settings seeded');
}

async function seedCatalogDefaults(): Promise<Map<string, string>> {
  const categoryIds = new Map<string, string>();
  let categoriesCreated = 0;

  for (const category of DEFAULT_CATEGORIES) {
    let existing = await categoryRepository.findBySlug(category.slug);
    if (!existing) {
      existing = await categoryRepository.create({
        ...category,
        listingCount: 0,
        attributes: [],
        isActive: true,
      });
      categoriesCreated += 1;
    }
    categoryIds.set(category.slug, String(existing._id));
  }

  let breedsCreated = 0;
  for (const breed of DEFAULT_BREEDS) {
    const exists = await breedRepository.findBySlug(breed.slug);
    if (exists) continue;
    await breedRepository.create({
      name: breed.name,
      slug: breed.slug,
      origin: breed.origin,
      temperament: breed.temperament,
      categoryIds: breed.categorySlugs
        .map((slug) => categoryIds.get(slug))
        .filter(Boolean)
        .map((id) => new Types.ObjectId(id as string)),
      isActive: true,
    });
    breedsCreated += 1;
  }

  let attributesCreated = 0;
  for (const attr of DEFAULT_ATTRIBUTES) {
    const existing = await attributeRepository.findByKey(attr.key);
    if (existing) continue;
    await attributeRepository.create({
      name: attr.name,
      slug: attr.key,
      key: attr.key,
      label: attr.label,
      type: attr.type,
      unit: attr.unit,
      options: attr.options,
      required: attr.required ?? false,
      categoryIds: attr.categorySlugs
        .map((slug) => categoryIds.get(slug))
        .filter(Boolean)
        .map((id) => new Types.ObjectId(id as string)),
      sortOrder: attributesCreated,
      isActive: true,
      filterable: attr.filterable ?? false,
      showOnCard: attr.showOnCard ?? false,
    });
    attributesCreated += 1;
  }

  if (categoriesCreated || breedsCreated || attributesCreated) {
    logger.info('Catalog defaults seeded', { categoriesCreated, breedsCreated, attributesCreated });
  }

  return categoryIds;
}

async function seedHomepageSections(categoryIds: Map<string, string>): Promise<void> {
  const defaults = [
    {
      key: 'hero',
      type: 'hero' as const,
      title: 'Multi-Livestock Marketplace',
      subtitle: 'Find the right animal from trusted sellers',
      description: 'Cats, cattle, goats, sheep, and poultry — verified sellers, local deals.',
      ctaText: 'Browse animals',
      ctaUrl: '/animals',
      displayOrder: 1,
      config: {
        slides: [
          {
            src: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2400&q=80',
            alt: 'Dairy cows grazing in a green pasture',
            sourceType: 'external',
            sourceLabel: 'External · Unsplash',
          },
          {
            src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=2400&q=80',
            alt: 'A calm cat resting in soft natural light',
            sourceType: 'external',
            sourceLabel: 'External · Unsplash',
          },
          {
            src: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=2400&q=80',
            alt: 'Goats on a rural farm',
            sourceType: 'external',
            sourceLabel: 'External · Unsplash',
          },
          {
            src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=2400&q=80',
            alt: 'Poultry on a farmyard',
            sourceType: 'external',
            sourceLabel: 'External · Unsplash',
          },
        ],
      },
    },
    {
      key: 'categories',
      type: 'categories' as const,
      title: 'Shop by category',
      subtitle: 'Companion animals to poultry',
      displayOrder: 2,
      config: { categorySlugs: Array.from(categoryIds.keys()) },
    },
    {
      key: 'promo-dairy',
      type: 'promo' as const,
      title: 'Trusted livestock for your farm',
      subtitle: 'Cows & buffaloes with milk capacity details',
      description:
        'Compare milk capacity, breed, age, and location — then call or WhatsApp sellers directly.',
      ctaText: 'Explore cows',
      ctaUrl: '/animals/cows',
      category: categoryIds.get('cows') ? new Types.ObjectId(categoryIds.get('cows')) : undefined,
      displayOrder: 3,
      image: {
        url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=80',
        publicId: 'seed/promo-dairy',
      },
      config: {
        imageSourceType: 'external',
        imageSourceLabel: 'External · Unsplash',
      },
    },
    {
      key: 'cta-sell',
      type: 'cta' as const,
      title: 'Need help choosing?',
      subtitle: 'Our team can guide you to the right animal',
      description: 'Reach out with questions about listings, breeds, or the buying process.',
      ctaText: 'Contact us',
      ctaUrl: '/contact',
      displayOrder: 4,
    },
  ];

  let created = 0;
  for (const section of defaults) {
    const exists = await homepageRepository.findByKey(section.key);
    if (exists) continue;
    await homepageRepository.create({
      ...section,
      isActive: true,
      config: section.config ?? {},
    });
    created += 1;
  }

  if (created) logger.info('Homepage sections seeded', { created });
}

export async function runSeed(): Promise<void> {
  logger.info('Seeding Multi-Livestock Marketplace data...');
  const permissionIds = await seedPermissions();
  await seedRoles(permissionIds);
  await seedSuperAdmin();
  await seedDefaultSettings();
  const categoryIds = await seedCatalogDefaults();
  await seedHomepageSections(categoryIds);
  logger.info('Seed complete');
}
