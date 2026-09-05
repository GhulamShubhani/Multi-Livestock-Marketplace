'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItemLocal } from '@/types/api';

type WishlistState = {
  items: WishlistItemLocal[];
  addItem: (item: WishlistItemLocal) => void;
  removeItem: (listingId: string) => void;
  has: (listingId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.listingId === item.listingId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (listingId) =>
        set((state) => ({ items: state.items.filter((i) => i.listingId !== listingId) })),
      has: (listingId) => get().items.some((i) => i.listingId === listingId),
      clear: () => set({ items: [] }),
    }),
    { name: 'livestock-marketplace-wishlist' },
  ),
);
