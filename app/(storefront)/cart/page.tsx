"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import { cartSubtotalPaise, useCartStore } from "@/lib/store/cart";
import { getStorageUrl } from "@/lib/storage";
import { formatPaise } from "@/lib/utils";
import { SiteImage } from "@/components/ui/SiteImage";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { validateCartAction, type CartValidationItem } from "@/app/(storefront)/cart/actions";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [validation, setValidation] = useState<Map<string, CartValidationItem> | null>(null);
  const [validating, setValidating] = useState(false);

  const variantKey = items.map((i) => i.variantId).join(",");

  useEffect(() => {
    if (!hasHydrated || items.length === 0) {
      setValidation(null);
      return;
    }

    let cancelled = false;
    setValidating(true);

    validateCartAction(items.map((i) => i.variantId)).then((results) => {
      if (cancelled) return;
      const map = new Map(results.map((r) => [r.variantId, r]));

      // Auto-cap quantities that now exceed live low-stock counts —
      // otherwise the checkout attempt would just fail server-side
      // for a case we can already see coming.
      for (const item of items) {
        const result = map.get(item.variantId);
        if (result?.status === "low_stock" && result.lowStockQuantity && item.quantity > result.lowStockQuantity) {
          setQuantity(item.variantId, result.lowStockQuantity);
        }
      }

      setValidation(map);
      setValidating(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, variantKey]);

  if (!hasHydrated) {
    return (
      <Container className="py-10 md:py-14">
        <Skeleton className="h-8 w-40" />
        <div className="mt-8 flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-10 md:py-14">
        <h1 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">Your Cart</h1>
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            description="Browse the collection and add something you love."
            action={
              <Link href="/shop">
                <Button variant="primary">Continue Shopping</Button>
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  const subtotal = cartSubtotalPaise(items);
  const hasBlockingIssue = items.some((item) => {
    const result = validation?.get(item.variantId);
    return result && (!result.found || !result.productActive || result.status === "out_of_stock");
  });

  return (
    <Container className="py-10 md:py-14">
      <h1 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">Your Cart</h1>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="flex-1 divide-y divide-border border-y border-border">
          {items.map((item) => {
            const result = validation?.get(item.variantId);
            const unavailable = result && (!result.found || !result.productActive || result.status === "out_of_stock");
            const priceChanged =
              result?.currentPricePaise != null && result.currentPricePaise !== item.unitPricePaise;

            return (
              <div key={item.variantId} className="flex gap-4 py-6">
                <Link
                  href={`/product/${item.productSlug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden bg-cream-100"
                >
                  <SiteImage
                    src={getStorageUrl("product-images", item.imagePath)}
                    alt={item.productName}
                    fill
                    sizes="96px"
                    className={`object-cover ${unavailable ? "opacity-50" : ""}`}
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/product/${item.productSlug}`} className="font-sans text-sm text-charcoal-900">
                        {item.productName}
                      </Link>
                      <p className="mt-1 font-sans text-xs text-charcoal-500">Size {item.size}</p>
                      {unavailable && (
                        <p className="mt-1 font-sans text-xs text-burgundy">
                          No longer available — please remove this item.
                        </p>
                      )}
                      {!unavailable && result?.status === "low_stock" && (
                        <p className="mt-1 font-sans text-xs text-burgundy">
                          Low stock{result.lowStockQuantity ? ` — only ${result.lowStockQuantity} left` : ""}.
                        </p>
                      )}
                      {!unavailable && priceChanged && (
                        <p className="mt-1 font-sans text-xs text-charcoal-500">
                          Price updated to {formatPaise(result.currentPricePaise!)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.productName} from cart`}
                      onClick={() => removeItem(item.variantId)}
                      className="text-charcoal-500 hover:text-charcoal-900"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || unavailable}
                        className="p-2 text-charcoal-900 disabled:text-charcoal-500/40"
                      >
                        <Minus size={12} strokeWidth={1.5} />
                      </button>
                      <span className="w-8 text-center font-sans text-xs tabular-nums text-charcoal-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                        disabled={
                          unavailable || (result?.status === "low_stock" && item.quantity >= (result.lowStockQuantity ?? 1))
                        }
                        className="p-2 text-charcoal-900 disabled:text-charcoal-500/40"
                      >
                        <Plus size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="font-sans text-sm text-charcoal-900">
                      {formatPaise((result?.currentPricePaise ?? item.unitPricePaise) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <div className="border border-border p-6">
            <p className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Order Summary</p>
            <div className="mt-4 flex justify-between font-sans text-sm text-charcoal-700">
              <span>Subtotal</span>
              <span>{formatPaise(subtotal)}</span>
            </div>
            <p className="mt-1 font-sans text-xs text-charcoal-500">Shipping calculated at checkout.</p>

            {hasBlockingIssue && (
              <p className="mt-4 font-sans text-xs text-burgundy">
                Remove unavailable items before checking out.
              </p>
            )}

            {validating ? (
              <Skeleton className="mt-6 h-12 w-full" />
            ) : (
              <Link href={hasBlockingIssue ? "#" : "/checkout"} aria-disabled={hasBlockingIssue}>
                <Button variant="primary" size="lg" disabled={hasBlockingIssue} className="mt-6 w-full">
                  Checkout
                </Button>
              </Link>
            )}
          </div>
          <Link
            href="/shop"
            className="link-underline mt-4 block text-center font-sans text-xs uppercase tracking-wider text-charcoal-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </Container>
  );
}
