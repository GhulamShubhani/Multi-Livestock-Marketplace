'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItemLocal } from '@/types/api';

type WishlistState = {
  items: WishlistItemLocal[];
  addItem: (item: WishlistItemLocal) => void;
  removeItem: (catId: string) => void;
  has: (catId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.catId === item.catId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (catId) => set((state) => ({ items: state.items.filter((i) => i.catId !== catId) })),
      has: (catId) => get().items.some((i) => i.catId === catId),
      clear: () => set({ items: [] }),
    }),
    { name: 'cat-marketplace-wishlist' },
  ),
);
