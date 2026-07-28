export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Cat Marketplace Admin';
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';

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
