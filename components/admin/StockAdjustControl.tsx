"use client";

import { useEffect, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";

import { adjustStockAction } from "@/app/(admin)/admin/inventory/actions";
import { cn } from "@/lib/utils";

export function StockAdjustControl({ variantId, quantity }: { variantId: string; quantity: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [setValue, setSetValue] = useState(String(quantity));
  const [reason, setReason] = useState("");

  // Keep the editable field in sync with the authoritative quantity —
  // it changes after every apply (server revalidates and passes a new
  // `quantity` prop down), including ones triggered by the +/- buttons.
  useEffect(() => {
    setSetValue(String(quantity));
  }, [quantity]);

  function apply(newQuantity: number, defaultReason: string) {
    if (pending) return;
    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      setError("Enter a valid, non-negative whole number.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await adjustStockAction(variantId, newQuantity, reason.trim() || defaultReason);
      if (result?.error) setError(result.error);
      else setReason("");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border">
          <button
            type="button"
            aria-label="Decrease stock by 1"
            disabled={pending || quantity <= 0}
            onClick={() => apply(quantity - 1, "Manual decrease")}
            className="p-2 text-charcoal-900 disabled:text-charcoal-500/40"
          >
            <Minus size={12} strokeWidth={1.5} />
          </button>
          <input
            type="number"
            min={0}
            value={setValue}
            disabled={pending}
            onChange={(e) => setSetValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply(Number(setValue), "Manual set");
            }}
            className={cn(
              "w-14 border-0 bg-transparent px-1 py-2 text-center font-sans text-sm tabular-nums text-charcoal-900 outline-none",
              pending && "opacity-50",
            )}
          />
          <button
            type="button"
            aria-label="Increase stock by 1"
            disabled={pending}
            onClick={() => apply(quantity + 1, "Manual increase")}
            className="p-2 text-charcoal-900"
          >
            <Plus size={12} strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() => apply(Number(setValue), "Manual set")}
          className="border border-charcoal-900 px-3 py-1.5 font-sans text-xs uppercase tracking-wider text-charcoal-900 hover:bg-charcoal-900 hover:text-cream-50"
        >
          Set
        </button>
      </div>

      <input
        type="text"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-64 border border-border bg-cream-50 px-2 py-1 font-sans text-xs text-charcoal-900 outline-none focus:border-charcoal-900"
      />

      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}
    </div>
  );
}
