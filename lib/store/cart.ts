"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  unitPricePaise: number;
  quantity: number;
  imagePath: string | null;
}

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  syncPrice: (variantId: string, unitPricePaise: number) => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

// Client-side cart (localStorage-persisted). Real, working add-to-cart
// today, ahead of the DB-persisted `carts`/`cart_items` tables that
// will take over once auth/checkout (later phase) exists to sync
// this into. `hasHydrated` exists so components can avoid rendering
// a count before localStorage has actually been read on mount —
// otherwise server and first client render would mismatch.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      addItem: (item, quantity) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        })),
      // Corrects a price that went stale in localStorage since the item
      // was added (the admin changed it in the meantime) — called after
      // a live revalidation, so every price shown from here on (cart
      // subtotal, checkout summary/total) reflects the real current
      // price instead of whatever was cached at add-to-cart time.
      syncPrice: (variantId, unitPricePaise) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === variantId);
          if (!existing || existing.unitPricePaise === unitPricePaise) return state;
          return {
            items: state.items.map((i) => (i.variantId === variantId ? { ...i, unitPricePaise } : i)),
          };
        }),
      clear: () => set({ items: [] }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "paege-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function cartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotalPaise(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);
}
