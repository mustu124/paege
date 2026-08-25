"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";

import type { NewArrivalCandidate, NewArrivalRow } from "@/lib/data/admin/new-arrivals";
import { getStorageUrl } from "@/lib/storage";
import { markNewArrivalAction, reorderNewArrivalAction, unmarkNewArrivalAction } from "@/app/(admin)/admin/new-arrivals/actions";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { Button } from "@/components/ui/Button";
import { SiteImage } from "@/components/ui/SiteImage";

interface NewArrivalsManagerProps {
  rows: NewArrivalRow[];
  candidates: NewArrivalCandidate[];
}

export function NewArrivalsManager({ rows, candidates }: NewArrivalsManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");

  function onAdd() {
    if (pending || !selectedCandidate) return;
    setError(null);
    startTransition(async () => {
      const result = await markNewArrivalAction(selectedCandidate);
      if (result?.error) setError(result.error);
      else setSelectedCandidate("");
    });
  }

  function onRemove(productId: string) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await unmarkNewArrivalAction(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end gap-3 border-b border-border pb-8">
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Add Product</span>
          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            className="min-w-[16rem] border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          >
            <option value="">Select a product…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="outline" disabled={pending || !selectedCandidate} onClick={onAdd}>
          Mark as New Arrival
        </Button>
      </div>

      {error && <p className="mb-4 font-sans text-xs text-burgundy">{error}</p>}

      {rows.length === 0 ? (
        <p className="font-sans text-sm text-charcoal-500">No new arrivals marked yet.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-11 overflow-hidden bg-cream-100">
                  <SiteImage src={getStorageUrl("product-images", row.primaryImagePath)} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm text-charcoal-900">{row.name}</span>
                  {!row.isActiveProduct && (
                    <span className="border border-border px-1.5 py-0.5 font-sans text-[10px] uppercase text-charcoal-500">
                      Archived — hidden from storefront
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ReorderButtons id={row.id} disableUp={i === 0} disableDown={i === rows.length - 1} action={reorderNewArrivalAction} />
                <button
                  type="button"
                  aria-label={`Unmark ${row.name} as new arrival`}
                  disabled={pending}
                  onClick={() => onRemove(row.id)}
                  className="p-1 text-charcoal-500 hover:text-burgundy"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
