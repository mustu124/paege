import "server-only";

import { createClient } from "@/lib/supabase/server";
import { sortSizes } from "@/lib/utils";
import {
  PRODUCT_SUMMARY_SELECT,
  attachSoldOutStatus,
  toSummaryBase,
  type ProductSummary,
  type ProductSummaryRow,
} from "@/lib/data/products";

export type ShopSort = "newest" | "price-asc" | "price-desc" | "featured";
export type ShopSpecialFilter = "new-arrivals" | "bestsellers";

export interface ShopFilters {
  categorySlug?: string;
  specialFilter?: ShopSpecialFilter;
  sizes?: string[];
  colours?: string[];
  minPricePaise?: number;
  maxPricePaise?: number;
  sort?: ShopSort;
}

export interface ShopResult {
  products: ProductSummary[];
  total: number;
  categoryName: string | null;
}

export async function getShopProducts(filters: ShopFilters): Promise<ShopResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { products: [], total: 0, categoryName: null };
  }

  const supabase = await createClient();

  let categoryName: string | null = null;
  let categoryId: string | null = null;
  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id, name")
      .eq("slug", filters.categorySlug)
      .eq("is_active", true)
      .single();

    if (!category) return { products: [], total: 0, categoryName: null };
    categoryId = category.id;
    categoryName = category.name;
  }

  // Size filtering is resolved as a separate lookup (rather than an
  // `!inner` embed + `.in('product_variants.size', ...)` filter) to
  // avoid PostgREST returning one duplicate product row per matching
  // variant — simpler to just pre-collect matching product ids.
  let productIdsForSize: string[] | null = null;
  if (filters.sizes && filters.sizes.length > 0) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("product_id")
      .in("size", filters.sizes);

    productIdsForSize = [...new Set((variants ?? []).map((v) => v.product_id))];
    if (productIdsForSize.length === 0) return { products: [], total: 0, categoryName };
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.specialFilter === "new-arrivals") query = query.eq("is_new_arrival", true);
  if (filters.specialFilter === "bestsellers") query = query.eq("is_bestseller", true);
  if (filters.colours && filters.colours.length > 0) query = query.in("colour", filters.colours);
  if (productIdsForSize) query = query.in("id", productIdsForSize);
  if (filters.minPricePaise != null) query = query.gte("price_paise", filters.minPricePaise);
  if (filters.maxPricePaise != null) query = query.lte("price_paise", filters.maxPricePaise);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price_paise", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_paise", { ascending: false });
      break;
    case "featured":
      query = query
        .order("is_bestseller", { ascending: false })
        .order("is_new_arrival", { ascending: false })
        .order("display_order", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("getShopProducts:", error.message);
    return { products: [], total: 0, categoryName };
  }

  const products = (data ?? []).map((row) => toSummaryBase(row as unknown as ProductSummaryRow));
  const withStock = await attachSoldOutStatus(supabase, products);

  return { products: withStock, total: count ?? withStock.length, categoryName };
}

export interface ShopFilterOptions {
  sizes: string[];
  colours: string[];
  minPricePaise: number;
  maxPricePaise: number;
}

export async function getShopFilterOptions(): Promise<ShopFilterOptions> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { sizes: [], colours: [], minPricePaise: 0, maxPricePaise: 0 };
  }

  const supabase = await createClient();

  const [variantsRes, productsRes, minRes, maxRes] = await Promise.all([
    supabase.from("product_variants").select("size"),
    supabase.from("products").select("colour").eq("is_active", true).not("colour", "is", null),
    supabase.from("products").select("price_paise").eq("is_active", true).order("price_paise", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("products").select("price_paise").eq("is_active", true).order("price_paise", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const sizes = sortSizes([...new Set((variantsRes.data ?? []).map((v) => v.size))]);
  const colours = [...new Set((productsRes.data ?? []).map((p) => p.colour).filter((c): c is string => Boolean(c)))].sort();

  return {
    sizes,
    colours,
    minPricePaise: minRes.data?.price_paise ?? 0,
    maxPricePaise: maxRes.data?.price_paise ?? 0,
  };
}
