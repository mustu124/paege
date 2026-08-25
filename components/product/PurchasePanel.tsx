"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import type { ProductVariantAvailability } from "@/lib/data/product-detail";
import { useCartStore } from "@/lib/store/cart";
import { cn, formatPaise } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const GENERIC_MAX_QUANTITY = 10;

interface PurchasePanelProps {
  productId: string;
  productSlug: string;
  productName: string;
  unitPricePaise: number;
  primaryImagePath: string | null;
  variants: ProductVariantAvailability[];
  isSoldOut: boolean;
}

export function PurchasePanel({
  productId,
  productSlug,
  productName,
  unitPricePaise,
  primaryImagePath,
  variants,
  isSoldOut,
}: PurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length === 1 ? variants[0]!.id : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const maxQuantity =
    selectedVariant?.status === "low_stock" && selectedVariant.lowStockQuantity
      ? selectedVariant.lowStockQuantity
      : GENERIC_MAX_QUANTITY;

  function selectVariant(variant: ProductVariantAvailability) {
    if (variant.status === "out_of_stock") return;
    setSelectedVariantId(variant.id);
    setSizeError(false);
    setQuantity(1);
  }

  function addToBag(): boolean {
    if (isSoldOut) return false;
    if (!selectedVariant) {
      setSizeError(true);
      return false;
    }
    addItem(
      {
        variantId: selectedVariant.id,
        productId,
        productSlug,
        productName,
        size: selectedVariant.size,
        unitPricePaise,
        imagePath: primaryImagePath,
      },
      quantity,
    );
    return true;
  }

  function handleAddToCart() {
    if (!addToBag()) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  function handleBuyNow() {
    if (!addToBag()) return;
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="font-sans text-xs uppercase tracking-wider text-charcoal-900">
            Size {selectedVariant ? `— ${selectedVariant.size}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Select a size">
          {variants.map((variant) => {
            const outOfStock = variant.status === "out_of_stock";
            const active = variant.id === selectedVariantId;
            return (
              <button
                key={variant.id}
                type="button"
                disabled={outOfStock}
                aria-pressed={active}
                aria-label={outOfStock ? `${variant.size}, out of stock` : variant.size}
                onClick={() => selectVariant(variant)}
                className={cn(
                  "relative min-w-[3rem] border px-4 py-2.5 font-sans text-sm transition-colors duration-200",
                  outOfStock
                    ? "cursor-not-allowed border-border text-charcoal-500/40 line-through"
                    : active
                      ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
                      : "border-border text-charcoal-900 hover:border-charcoal-900",
                )}
              >
                {variant.size}
              </button>
            );
          })}
        </div>

        {sizeError && <p className="mt-2 font-sans text-xs text-burgundy">Please select a size.</p>}

        {selectedVariant?.status === "low_stock" && (
          <p className="mt-2 font-sans text-xs text-burgundy">
            Low stock{selectedVariant.lowStockQuantity ? ` — only ${selectedVariant.lowStockQuantity} left` : ""}.
          </p>
        )}

        {isSoldOut && <p className="mt-2 font-sans text-xs uppercase tracking-wider text-charcoal-500">Out of Stock</p>}
      </div>

      {!isSoldOut && (
        <div>
          <p className="mb-3 font-sans text-xs uppercase tracking-wider text-charcoal-900">Quantity</p>
          <div className="flex w-fit items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-3 text-charcoal-900 disabled:text-charcoal-500/40"
            >
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <span className="w-10 text-center font-sans text-sm tabular-nums text-charcoal-900">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              className="p-3 text-charcoal-900 disabled:text-charcoal-500/40"
            >
              <Plus size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg" disabled={isSoldOut} onClick={handleAddToCart}>
          {isSoldOut ? "Out of Stock" : justAdded ? "Added to Bag" : `Add to Cart — ${formatPaise(unitPricePaise * quantity)}`}
        </Button>
        {!isSoldOut && (
          <Button variant="outline" size="lg" onClick={handleBuyNow}>
            Buy It Now
          </Button>
        )}
      </div>
    </div>
  );
}
