'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/api';

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clear: () => void;
  totalCents: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.listingId === item.listingId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.listingId === item.listingId
                  ? { ...i, quantity: Math.min(10, i.quantity + item.quantity) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (listingId) =>
        set((state) => ({ items: state.items.filter((i) => i.listingId !== listingId) })),
      updateQuantity: (listingId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.listingId === listingId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalCents: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'livestock-marketplace-cart' },
  ),
);
