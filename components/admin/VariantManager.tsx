"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import type { VariantWithStock } from "@/lib/data/admin/products";
import { addVariantAction, removeVariantAction } from "@/app/(admin)/admin/products/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function VariantManager({ productId, variants }: { productId: string; variants: VariantWithStock[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onAdd(formData: FormData) {
    if (pending) return;
    setError(null);
    const size = String(formData.get("size") ?? "");
    if (!size.trim()) {
      setError("Enter a size.");
      return;
    }
    startTransition(async () => {
      const result = await addVariantAction(productId, size);
      if (result?.error) setError(result.error);
      else if (inputRef.current) inputRef.current.value = "";
    });
  }

  function onRemove(variantId: string) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await removeVariantAction(productId, variantId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="divide-y divide-border border-y border-border">
        {variants.length === 0 && (
          <p className="py-4 font-sans text-sm text-charcoal-500">No sizes yet — add one below.</p>
        )}
        {variants.map((variant) => (
          <div key={variant.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <span className="w-12 font-sans text-sm text-charcoal-900">{variant.size}</span>
              <span className="font-sans text-xs text-charcoal-500">
                Stock: {variant.inventory?.quantity ?? 0}
              </span>
            </div>
            <button
              type="button"
              aria-label={`Remove size ${variant.size}`}
              disabled={pending}
              onClick={() => onRemove(variant.id)}
              className={cn("p-1 text-charcoal-500 hover:text-burgundy", pending && "opacity-40")}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      <form action={onAdd} className="mt-4 flex items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Add Size</span>
          <input
            ref={inputRef}
            name="size"
            placeholder="e.g. XS"
            disabled={pending}
            className="w-32 border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900 disabled:opacity-50"
          />
        </label>
        <Button type="submit" variant="outline" disabled={pending}>
          Add
        </Button>
      </form>

      {error && <p className="mt-2 font-sans text-xs text-burgundy">{error}</p>}

      <p className="mt-4 font-sans text-xs text-charcoal-500">
        Adjust stock quantities from{" "}
        <Link href="/admin/inventory" className="link-underline">
          Inventory
        </Link>
        .
      </p>
    </div>
  );
}
