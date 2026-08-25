"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { Category } from "@/lib/data/categories";
import type { ShopFilterOptions } from "@/lib/data/shop";
import { cn } from "@/lib/utils";

interface ShopFiltersPanelProps {
  categories: Category[];
  filterOptions: ShopFilterOptions;
  onNavigate?: () => void;
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ShopFiltersPanel({ categories, filterOptions, onNavigate }: ShopFiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeSizes = searchParams.get("size")?.split(",").filter(Boolean) ?? [];
  const activeColours = searchParams.get("colour")?.split(",").filter(Boolean) ?? [];
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const hasActiveFilters =
    Boolean(activeCategory) || activeSizes.length > 0 || activeColours.length > 0 || Boolean(searchParams.get("minPrice")) || Boolean(searchParams.get("maxPrice"));

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onNavigate?.();
  }

  function setCategory(slug: string | null) {
    pushParams((params) => {
      if (slug) params.set("category", slug);
      else params.delete("category");
    });
  }

  function toggleSize(size: string) {
    pushParams((params) => {
      const next = toggleInList(activeSizes, size);
      if (next.length > 0) params.set("size", next.join(","));
      else params.delete("size");
    });
  }

  function toggleColour(colour: string) {
    pushParams((params) => {
      const next = toggleInList(activeColours, colour);
      if (next.length > 0) params.set("colour", next.join(","));
      else params.delete("colour");
    });
  }

  function applyPriceRange() {
    pushParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="link-underline self-start font-sans text-xs uppercase tracking-wider text-burgundy"
        >
          Clear Filters
        </button>
      )}

      <fieldset>
        <legend className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Category</legend>
        <div className="mt-3 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "text-left font-sans text-sm",
              !activeCategory ? "text-burgundy" : "text-charcoal-700 hover:text-charcoal-900",
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategory(category.slug)}
              className={cn(
                "text-left font-sans text-sm",
                activeCategory === category.slug ? "text-burgundy" : "text-charcoal-700 hover:text-charcoal-900",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </fieldset>

      {filterOptions.sizes.length > 0 && (
        <fieldset>
          <legend className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterOptions.sizes.map((size) => {
              const active = activeSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    "border px-3 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors duration-200",
                    active
                      ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
                      : "border-border text-charcoal-700 hover:border-charcoal-900",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {filterOptions.colours.length > 0 && (
        <fieldset>
          <legend className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Colour</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterOptions.colours.map((colour) => {
              const active = activeColours.includes(colour);
              return (
                <button
                  key={colour}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleColour(colour)}
                  className={cn(
                    "border px-3 py-1.5 font-sans text-xs transition-colors duration-200",
                    active
                      ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
                      : "border-border text-charcoal-700 hover:border-charcoal-900",
                  )}
                >
                  {colour}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Price (INR)</legend>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            className="w-full border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
          <span className="text-charcoal-500">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            className="w-full border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </div>
      </fieldset>
    </div>
  );
}
