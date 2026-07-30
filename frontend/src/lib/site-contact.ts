import { APP_NAME } from '@/lib/utils';

/** Public storefront contact — override via NEXT_PUBLIC_CONTACT_* env vars. */
export const SITE_CONTACT = {
  personName: process.env.NEXT_PUBLIC_CONTACT_NAME ?? 'Ghulam Shubhani',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'gulham@gfuturetech.com',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '',
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? '',
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? 'India',
  hours: process.env.NEXT_PUBLIC_CONTACT_HOURS ?? 'Mon–Sat, 10:00–18:00 IST',
  brand: APP_NAME,
} as const;
