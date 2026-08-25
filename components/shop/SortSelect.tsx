"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "newest";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") params.delete("sort");
    else params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2">
      <span className="hidden font-sans text-xs uppercase tracking-wider text-charcoal-500 sm:inline">Sort</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort products"
        className="border border-border bg-cream-50 px-3 py-2 font-sans text-xs uppercase tracking-wide text-charcoal-900 outline-none focus:border-charcoal-900"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
