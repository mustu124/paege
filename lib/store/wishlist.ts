"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  productSlug: string;
  productName: string;
  pricePaise: number;
  imagePath: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  hasHydrated: boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  isBookmarked: (productId: string) => boolean;
  setHasHydrated: (value: boolean) => void;
}

// Guest-only site, same as the cart — no accounts to attach a
// wishlist to, so it's a localStorage-persisted, product-level list
// (no size/variant, unlike cart items — a bookmark isn't a purchase
// intent yet). Mirrors lib/store/cart.ts's shape/conventions.
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      isBookmarked: (productId) => get().items.some((i) => i.productId === productId),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "paege-wishlist",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function wishlistCount(items: WishlistItem[]): number {
  return items.length;
}
