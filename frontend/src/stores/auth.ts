'use client';

import { create } from 'zustand';
import type { PublicUser } from '@/types/api';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

type AuthState = {
  user: PublicUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  error: string | null;
  bootstrap: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<PublicUser>;
  logout: () => Promise<void>;
};

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
      set({ user: res.data.user, status: 'authenticated' });
    } catch {
      try {
        const refreshed = await authApi.refresh();
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
      set({ user: res.data.user, status: 'authenticated' });
      return res.data.user;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Login failed');
      set({ error: message });
      throw new Error(message);
    }
  },

  register: async (input) => {
    set({ error: null });
    try {
      const res = await authApi.register(input);
      set({ user: res.data.user, status: 'authenticated' });
      return res.data.user;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Registration failed');
      set({ error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // clear local session even if API fails
    }
    set({ user: null, status: 'anonymous', error: null });
  },
}));
