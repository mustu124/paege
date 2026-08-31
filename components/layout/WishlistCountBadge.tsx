"use client";

import { useWishlistStore } from "@/lib/store/wishlist";

export function WishlistCountBadge() {
  const items = useWishlistStore((s) => s.items);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);

  const count = hasHydrated ? items.length : 0;

  if (count === 0) return null;

  return <span className="ml-1 font-sans text-[10px] tabular-nums text-burgundy">{count}</span>;
}
