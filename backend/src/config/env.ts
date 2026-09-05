import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

/** One URL or comma-separated list (local + production origins). */
const originListSchema = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url()).min(1));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().default('/api/v1'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  FRONTEND_URL: originListSchema,
  ADMIN_URL: originListSchema,

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional().default(''),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  BODY_LIMIT: z.string().default('100kb'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  DEFAULT_CURRENCY: z.string().length(3).default('INR'),

  SUPER_ADMIN_EMAIL: z.string().email(),
  SUPER_ADMIN_PASSWORD: z.string().min(12),
  SEED_ON_BOOT: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER: z.string().default('livestock-marketplace'),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),
  UPLOAD_MAX_FILES: z.coerce.number().int().positive().default(10),

  TAX_RATE_BPS: z.coerce.number().int().min(0).default(0),
  SHIPPING_FLAT_CENTS: z.coerce.number().int().min(0).default(0),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  MAIL_FROM: z.string().optional().default(''),
  /** Windows antivirus TLS interception often needs this in local development */
  SMTP_TLS_ALLOW_INVALID_CERTS: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:\n' + details);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';

/** All allowed browser origins (local + deployed). */
export const corsOrigins = [...env.FRONTEND_URL, ...env.ADMIN_URL];

function pickPrimaryOrigin(origins: string[]): string {
  if (isDevelopment) {
    const local = origins.find(
      (origin) => origin.includes('localhost') || origin.includes('127.0.0.1'),
    );
    if (local) return local;
  }
  return origins.find((origin) => origin.startsWith('https://')) ?? origins[0];
}

/** True when SMTP credentials are configured for real email delivery. */
export const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

/** Allow SMTP TLS with intercepted/self-signed certs (common on Windows AV). */
export const smtpAllowInvalidCerts =
  env.SMTP_TLS_ALLOW_INVALID_CERTS ?? (isDevelopment ? true : false);

/** Primary storefront URL for emails / redirects (prefers https). */
export const primaryFrontendUrl = pickPrimaryOrigin(env.FRONTEND_URL);

/** Primary admin URL (prefers https). */
export const primaryAdminUrl = pickPrimaryOrigin(env.ADMIN_URL);
