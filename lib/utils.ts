import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPaise(paise: number, currency: string = "INR") {
  const amount = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// Inverse of formatPaise's underlying conversion — turns a rupee
// amount an admin types (e.g. "499.50") into an integer paise value
// for storage. Blank/invalid input becomes 0 rather than NaN, so an
// empty field behaves the same as it always has for the required
// price field (server-side min(0) validation still catches it).
export function parseRupeesToPaise(value: string): number {
  const rupees = Number.parseFloat(value);
  if (!Number.isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

// Turns a product name into a URL-safe slug: lowercase, non-alphanumeric
// runs collapsed to a single hyphen, no leading/trailing hyphen. Doesn't
// guarantee uniqueness on its own — the caller is responsible for
// checking the result against existing rows and disambiguating
// (see createProductAction's collision handling).
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

// Canonical apparel-size ordering (not alphabetical, which would
// wrongly put "L" before "M" before "S").
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
