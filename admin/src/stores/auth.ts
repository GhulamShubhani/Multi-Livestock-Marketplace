import { create } from 'zustand';
import type { PublicUser } from '@/types/api';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { STAFF_ROLES } from '@/lib/utils';

type AuthState = {
  user: PublicUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  error: string | null;
  bootstrap: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
};

function assertStaff(user: PublicUser) {
  if (!STAFF_ROLES.has(user.role)) {
    throw new Error('This account does not have admin access');
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  setUser: (user) =>
    set({
      user,
      status: user ? 'authenticated' : 'anonymous',
      error: null,
    }),

  bootstrap: async () => {
    set({ status: 'loading', error: null });
    try {
      const res = await authApi.me();
      assertStaff(res.data.user);
      set({ user: res.data.user, status: 'authenticated' });
    } catch {
      try {
        const refreshed = await authApi.refresh();
        assertStaff(refreshed.data.user);
        set({ user: refreshed.data.user, status: 'authenticated' });
      } catch {
        set({ user: null, status: 'anonymous' });
      }
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await authApi.login({ email, password });
      assertStaff(res.data.user);
      set({ user: res.data.user, status: 'authenticated' });
      return res.data.user;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Login failed');
      set({ user: null, status: 'anonymous', error: message });
      try {
        await authApi.logout();
      } catch {
        // ignore
      }
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    set({ user: null, status: 'anonymous', error: null });
  },
}));
