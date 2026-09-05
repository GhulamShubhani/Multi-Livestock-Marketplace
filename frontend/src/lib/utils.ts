import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(cents: number, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Livestock Marketplace';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3005';

const API_LOCAL = process.env.NEXT_PUBLIC_API_LOCAL_URL ?? 'http://localhost:5000/api/v1';
const API_REMOTE =
  process.env.NEXT_PUBLIC_API_REMOTE_URL ??
  process.env.NEXT_PUBLIC_API_DEV_URL ??
  'https://cat-shop-backend.vercel.app/api/v1';

/**
 * Resolve API base URL.
 * - Production / explicit: NEXT_PUBLIC_API_URL wins
 * - Local: NEXT_PUBLIC_API_MODE=local|remote (default local)
 */
function resolveApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const mode = (process.env.NEXT_PUBLIC_API_MODE ?? 'local').toLowerCase();
  const url = mode === 'remote' ? API_REMOTE : API_LOCAL;
  return url.replace(/\/$/, '');
}

export const API_URL = resolveApiUrl();
export const API_MODE = process.env.NEXT_PUBLIC_API_URL?.trim()
  ? 'explicit'
  : (process.env.NEXT_PUBLIC_API_MODE ?? 'local').toLowerCase();
