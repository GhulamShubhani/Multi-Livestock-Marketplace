export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Multi-Livestock Marketplace CRM';

const API_LOCAL = import.meta.env.VITE_API_LOCAL_URL ?? 'http://localhost:5000/api/v1';
const API_REMOTE =
  import.meta.env.VITE_API_REMOTE_URL ??
  import.meta.env.VITE_API_DEV_URL ??
  'https://multi-livestock-marketplace.onrender.com/api/v1';

/** Modes that point at the deployed API (`VITE_API_REMOTE_URL`). */
function usesRemoteApi(mode: string): boolean {
  return mode === 'remote' || mode === 'production' || mode === 'prod';
}

/**
 * Resolve API base URL.
 * - Explicit VITE_API_URL wins (use this on Vercel admin deploy)
 * - VITE_API_MODE=local → local URL (default)
 * - VITE_API_MODE=remote|production|prod → remote URL
 */
function resolveApiUrl(): string {
  const explicit = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const mode = String(import.meta.env.VITE_API_MODE ?? 'local').toLowerCase();
  const url = usesRemoteApi(mode) ? API_REMOTE : API_LOCAL;
  return url.replace(/\/$/, '');
}

export const API_URL = resolveApiUrl();
export const API_MODE = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  ? 'explicit'
  : String(import.meta.env.VITE_API_MODE ?? 'local').toLowerCase();

export const STAFF_ROLES = new Set(['super_admin', 'admin', 'manager', 'staff']);

export function hasPermission(userPermissions: string[] | undefined, required?: string | string[]) {
  if (!required) return true;
  if (!userPermissions?.length) return false;
  if (userPermissions.includes('*')) return true;
  const needed = Array.isArray(required) ? required : [required];
  return needed.some((p) => userPermissions.includes(p));
}

export function hasAnyPermission(userPermissions: string[] | undefined, required: string[]) {
  return hasPermission(userPermissions, required);
}

export function formatMoney(cents: number, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function namedRef(ref: { name?: string; _id?: string } | string | null | undefined) {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return ref.name ?? ref._id ?? '—';
}

export function idOf(ref: { _id?: string; id?: string } | string | null | undefined) {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  return ref._id ?? ref.id ?? '';
}
