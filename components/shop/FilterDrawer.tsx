"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import type { Category } from "@/lib/data/categories";
import type { ShopFilterOptions } from "@/lib/data/shop";
import { ShopFiltersPanel } from "@/components/shop/ShopFiltersPanel";
import { Button } from "@/components/ui/Button";

interface FilterDrawerProps {
  categories: Category[];
  filterOptions: ShopFilterOptions;
}

export function FilterDrawer({ categories, filterOptions }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-charcoal-900 px-4 py-2 font-sans text-xs uppercase tracking-wider text-charcoal-900"
      >
        <SlidersHorizontal size={14} strokeWidth={1.5} />
        Filters
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close filters"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-charcoal-900/30"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col bg-cream shadow-subtleLg"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="font-sans text-sm uppercase tracking-wider text-charcoal-900">Filters</p>
              <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="p-1 text-charcoal-900">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ShopFiltersPanel categories={categories} filterOptions={filterOptions} />
            </div>
            <div className="border-t border-border p-5">
              <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>
                Show Results
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
