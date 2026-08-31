"use client";

import Link from "next/link";
import { X } from "lucide-react";

import type { WishlistItem } from "@/lib/store/wishlist";
import { useWishlistStore } from "@/lib/store/wishlist";
import { getStorageUrl } from "@/lib/storage";
import { formatPaise } from "@/lib/utils";
import { SiteImage } from "@/components/ui/SiteImage";

// A lighter card than ProductCard — the wishlist only carries the
// slim WishlistItem shape (no live stock/badge data), and remove
// replaces the heart toggle since being on this page already implies
// "bookmarked".
export function WishlistProductCard({ item }: { item: WishlistItem }) {
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="group relative w-full shrink-0">
      <Link href={`/product/${item.productSlug}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
          <SiteImage
            src={getStorageUrl("product-images", item.imagePath)}
            alt={item.productName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 80vw"
            className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-3 flex flex-col gap-0.5">
          <p className="font-sans text-sm text-charcoal-900">{item.productName}</p>
          <p className="font-sans text-sm text-charcoal-700">{formatPaise(item.pricePaise)}</p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Remove ${item.productName} from Almost Yours`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          remove(item.productId);
        }}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-cream/90 text-charcoal-900 backdrop-blur-sm transition-colors duration-200 hover:text-burgundy"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
