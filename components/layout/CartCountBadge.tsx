"use client";

import { cartTotalItems, useCartStore } from "@/lib/store/cart";

export function CartCountBadge() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const count = hasHydrated ? cartTotalItems(items) : 0;

  if (count === 0) return null;

  return (
    <span className="ml-1 font-sans text-[10px] tabular-nums text-burgundy">
      {count}
    </span>
  );
}
