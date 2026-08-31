"use client";

import { Heart } from "lucide-react";

import { useWishlistStore, type WishlistItem } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  item: WishlistItem;
  className?: string;
  size?: number;
}

// Rendered as a sibling of the product image's <Link>, never nested
// inside one — a button-inside-anchor would fire both the toggle and
// the navigation on a single tap. Callers position it absolutely
// within a shared `relative` wrapper instead.
export function WishlistButton({ item, className, size = 16 }: WishlistButtonProps) {
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);
  const bookmarked = useWishlistStore((s) => s.items.some((i) => i.productId === item.productId));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-label={bookmarked ? `Remove ${item.productName} from Almost Yours` : `Add ${item.productName} to Almost Yours`}
      aria-pressed={hasHydrated && bookmarked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center bg-cream/90 text-charcoal-900 backdrop-blur-sm transition-colors duration-200 hover:text-burgundy",
        className,
      )}
    >
      <Heart size={size} strokeWidth={1.5} className={hasHydrated && bookmarked ? "fill-burgundy text-burgundy" : ""} />
    </button>
  );
}
