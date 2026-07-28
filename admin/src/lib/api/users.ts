import { apiGet, apiMutate } from '@/lib/api/client';

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  roleId?: string;
  permissions: string[];
  permissionsOverride?: string[];
  isEmailVerified: boolean;
  status: string;
  lastLoginAt?: string;
  createdAt?: string;
};

export const usersApi = {
  list: (params?: Record<string, unknown>) => apiGet<{ users: AdminUser[] }>('/users', params),
  get: (id: string) => apiGet<{ user: AdminUser }>(`/users/${id}`),
  create: (body: Record<string, unknown>) => apiMutate<{ user: AdminUser }>('post', '/users', body),
  update: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ user: AdminUser }>('patch', `/users/${id}`, body),
  setStatus: (id: string, status: string) =>
    apiMutate<{ user: AdminUser }>('patch', `/users/${id}/status`, { status }),
  remove: (id: string) => apiMutate<null>('delete', `/users/${id}`),
};
