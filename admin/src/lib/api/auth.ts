import { apiGet, apiMutate } from '@/lib/api/client';
import type { PublicUser } from '@/types/api';

export const authApi = {
  me: () => apiGet<{ user: PublicUser }>('/auth/me'),
  login: (body: { email: string; password: string }) =>
    apiMutate<{ user: PublicUser }>('post', '/auth/login', body),
  refresh: () => apiMutate<{ user: PublicUser }>('post', '/auth/refresh'),
  logout: () => apiMutate<null>('post', '/auth/logout'),
};
