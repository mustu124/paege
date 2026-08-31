"use client";

import Link from "next/link";

import { useWishlistStore } from "@/lib/store/wishlist";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WishlistProductCard } from "@/components/product/WishlistProductCard";
import { PRODUCT_GRID_CLASSES } from "@/components/shop/ProductGrid";

// Bookmarked products page — "Almost Yours" per the brand copy. No
// accounts on this site, so this is purely a localStorage list (see
// lib/store/wishlist.ts), same model as the cart.
export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <Container className="py-10 md:py-14">
        <Skeleton className="h-8 w-48" />
        <div className={`mt-10 ${PRODUCT_GRID_CLASSES}`}>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <h1 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">Almost Yours</h1>
      <p className="mt-2 font-sans text-sm text-charcoal-500">Pieces you&apos;ve bookmarked to keep an eye on.</p>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing bookmarked yet"
            description="Tap the heart on any piece to save it here."
            action={
              <Link href="/shop">
                <Button variant="primary">Browse The Edit</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className={`mt-10 ${PRODUCT_GRID_CLASSES}`}>
          {items.map((item) => (
            <WishlistProductCard key={item.productId} item={item} />
          ))}
        </div>
      )}
    </Container>
  );
}
