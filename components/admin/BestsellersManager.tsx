"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";

import type { AdminBestsellerRow, BestsellerCandidate } from "@/lib/data/admin/bestsellers";
import { getStorageUrl } from "@/lib/storage";
import { SiteImage } from "@/components/ui/SiteImage";
import {
  addBestsellerAction,
  removeBestsellerAction,
  reorderBestsellerAction,
  setBestsellersDisplayCountAction,
  toggleBestsellerActiveAction,
} from "@/app/(admin)/admin/bestsellers/actions";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { Button } from "@/components/ui/Button";

interface BestsellersManagerProps {
  rows: AdminBestsellerRow[];
  candidates: BestsellerCandidate[];
  displayCount: number;
}

export function BestsellersManager({ rows, candidates, displayCount }: BestsellersManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [countInput, setCountInput] = useState(String(displayCount));

  function onAdd() {
    if (pending || !selectedCandidate) return;
    setError(null);
    startTransition(async () => {
      const result = await addBestsellerAction(selectedCandidate);
      if (result?.error) setError(result.error);
      else setSelectedCandidate("");
    });
  }

  function onRemove(id: string) {
    if (pending) return;
    if (!window.confirm("Remove this product from Bestsellers?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeBestsellerAction(id);
      if (result?.error) setError(result.error);
    });
  }

  function onSaveCount() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await setBestsellersDisplayCountAction(Number(countInput));
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end gap-3 border-b border-border pb-8">
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">
            Max Displayed on Storefront
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
            className="w-24 border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>
        <Button type="button" variant="outline" disabled={pending} onClick={onSaveCount}>
          Save
        </Button>
      </div>

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
          Add
        </Button>
      </div>

      {error && <p className="mb-4 font-sans text-xs text-burgundy">{error}</p>}

      {rows.length === 0 ? (
        <p className="font-sans text-sm text-charcoal-500">No bestsellers curated yet.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-11 overflow-hidden bg-cream-100">
                  <SiteImage src={getStorageUrl("product-images", row.primaryImagePath)} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <span className="font-sans text-sm text-charcoal-900">{row.productName}</span>
              </div>

              <div className="flex items-center gap-4">
                <ReorderButtons id={row.id} disableUp={i === 0} disableDown={i === rows.length - 1} action={reorderBestsellerAction} />
                <ToggleActiveButton id={row.id} isActive={row.isActive} action={toggleBestsellerActiveAction} />
                <button
                  type="button"
                  aria-label={`Remove ${row.productName} from bestsellers`}
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
