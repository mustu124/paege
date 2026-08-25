import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface ProductSummary extends ProductRow {
  primary_image_path: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_sold_out: boolean;
}

// select() with embedded relations; primary image and category are
// flattened onto the summary shape ProductCard expects.
export const PRODUCT_SUMMARY_SELECT = `
  *,
  category:categories ( name, slug ),
  product_images ( storage_path, is_primary, display_order )
`;

export interface ProductSummaryRow extends ProductRow {
  category: { name: string; slug: string } | null;
  product_images: { storage_path: string; is_primary: boolean; display_order: number }[];
}

export function toSummaryBase(row: ProductSummaryRow): Omit<ProductSummary, "is_sold_out"> {
  const images = row.product_images ?? [];
  const primary =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.display_order - b.display_order)[0];

  const { category, product_images: _productImages, ...rest } = row;

  return {
    ...rest,
    primary_image_path: primary?.storage_path ?? null,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
  };
}

// Batches the sold-out check for a whole list of products into one
// RPC call (get_products_sold_out_status, 0020) instead of an N+1
// per-card query. Products with no variants/inventory rows at all
// default to NOT sold out (nothing to report is not the same claim
// as "confirmed empty").
export async function attachSoldOutStatus(
  supabase: SupabaseClient<Database>,
  products: Omit<ProductSummary, "is_sold_out">[],
): Promise<ProductSummary[]> {
  if (products.length === 0) return [];

  const { data, error } = await supabase.rpc("get_products_sold_out_status", {
    p_product_ids: products.map((p) => p.id),
  });

  if (error) {
    console.error("attachSoldOutStatus:", error.message);
    return products.map((p) => ({ ...p, is_sold_out: false }));
  }

  const soldOutIds = new Set((data ?? []).filter((row) => row.is_sold_out).map((row) => row.product_id));

  return products.map((p) => ({ ...p, is_sold_out: soldOutIds.has(p.id) }));
}

// Bestsellers are read from the curated `bestsellers` placement
// table (admin-ordered), not the products.is_bestseller flag — see
// the comment at the top of 0010_bestsellers.sql for why those are
// kept as separate concerns. A left-embed (rather than `!inner` +
// a nested filter string) is used deliberately: RLS on `products`
// already hides inactive products from anon/authenticated readers,
// so an inactive product's embed simply comes back null and is
// filtered out here instead of relying on fragile embedded-filter
// query syntax.
interface BestsellerRow {
  display_order: number;
  product: ProductSummaryRow | null;
}

export async function getBestsellersDisplayCount(): Promise<number> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return 4;

  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "bestsellers_display_count").single();

  const value = Number(data?.value);
  return Number.isFinite(value) && value > 0 ? value : 4;
}

export async function getBestsellers(limit?: number): Promise<ProductSummary[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const resolvedLimit = limit ?? (await getBestsellersDisplayCount());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bestsellers")
    .select(`
      display_order,
      product:products ( ${PRODUCT_SUMMARY_SELECT} )
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(resolvedLimit);

  if (error) {
    console.error("getBestsellers:", error.message);
    return [];
  }

  const products = ((data ?? []) as unknown as BestsellerRow[])
    .map((row) => row.product)
    .filter((product): product is ProductSummaryRow => product !== null)
    .map(toSummaryBase);

  return attachSoldOutStatus(supabase, products);
}

export async function getNewArrivals(limit = 8): Promise<ProductSummary[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT)
    .eq("is_active", true)
    .eq("is_new_arrival", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getNewArrivals:", error.message);
    return [];
  }

  const products = (data ?? []).map((row) => toSummaryBase(row as unknown as ProductSummaryRow));
  return attachSoldOutStatus(supabase, products);
}
