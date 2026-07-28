import { apiGet, apiMutate } from '@/lib/api/client';
import type { PublicUser } from '@/types/api';

export const authApi = {
  me: () => apiGet<{ user: PublicUser }>('/auth/me'),
  login: (body: { email: string; password: string }) =>
    apiMutate<{ user: PublicUser }>('post', '/auth/login', body),
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => apiMutate<{ user: PublicUser }>('post', '/auth/register', body),
  refresh: () => apiMutate<{ user: PublicUser }>('post', '/auth/refresh'),
  logout: () => apiMutate<null>('post', '/auth/logout'),
  verifyEmail: (token: string) => apiMutate<{ user: PublicUser }>('post', '/auth/verify-email', { token }),
  resendVerification: (email: string) =>
    apiMutate<null>('post', '/auth/resend-verification', { email }),
  forgotPassword: (email: string) => apiMutate<null>('post', '/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    apiMutate<null>('post', '/auth/reset-password', { token, password }),
};
