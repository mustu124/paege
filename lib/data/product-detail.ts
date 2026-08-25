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
import type { AvailabilityStatus, Database } from "@/lib/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface ProductVariantAvailability {
  id: string;
  size: string;
  status: AvailabilityStatus;
  lowStockQuantity: number | null;
}

export interface ProductImage {
  storagePath: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductDetail extends ProductRow {
  categoryName: string | null;
  categorySlug: string | null;
  images: ProductImage[];
  variants: ProductVariantAvailability[];
  isSoldOut: boolean;
}

interface ProductDetailRow extends ProductRow {
  category: { name: string; slug: string } | null;
  product_images: { storage_path: string; alt_text: string | null; is_primary: boolean; display_order: number }[];
  product_variants: { id: string; size: string }[];
}

// Returns null for a missing slug AND for an inactive product —
// both are "this product isn't available", and the page treats them
// identically (notFound()). Distinguishing them in the UI would leak
// information about unpublished/retired products to visitors.
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories ( name, slug ),
      product_images ( storage_path, alt_text, is_primary, display_order ),
      product_variants ( id, size )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !row) {
    if (error) console.error("getProductBySlug:", error.message);
    return null;
  }

  const typedRow = row as unknown as ProductDetailRow;

  const { data: availability, error: availabilityError } = await supabase.rpc("get_product_availability", {
    p_product_id: typedRow.id,
  });

  if (availabilityError) {
    console.error("getProductBySlug availability:", availabilityError.message);
  }

  const availabilityByVariant = new Map((availability ?? []).map((a) => [a.variant_id, a]));

  const orderedSizes = sortSizes(typedRow.product_variants.map((v) => v.size));
  const variants: ProductVariantAvailability[] = orderedSizes.map((size) => {
    const variant = typedRow.product_variants.find((v) => v.size === size)!;
    const a = availabilityByVariant.get(variant.id);
    return {
      id: variant.id,
      size: variant.size,
      status: a?.status ?? "out_of_stock",
      lowStockQuantity: a?.low_stock_quantity ?? null,
    };
  });

  const images = [...typedRow.product_images]
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({ storagePath: img.storage_path, altText: img.alt_text, isPrimary: img.is_primary }));
  // Primary image first, if one is flagged, regardless of display_order.
  images.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const { category, product_images: _images, product_variants: _variants, ...rest } = typedRow;

  return {
    ...rest,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    images,
    variants,
    isSoldOut: variants.length === 0 || variants.every((v) => v.status === "out_of_stock"),
  };
}

// Same-category first, backfilled with other active products if the
// category doesn't have enough on its own — never shows the current
// product, and simply returns fewer (or zero) items if the catalogue
// is too small rather than padding with anything irrelevant.
export async function getRelatedProducts(
  currentProductId: string,
  categoryId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = await createClient();

  const { data: sameCategory, error: sameCategoryError } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", currentProductId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sameCategoryError) {
    console.error("getRelatedProducts (same category):", sameCategoryError.message);
  }

  const collected = (sameCategory ?? []) as unknown as ProductSummaryRow[];

  if (collected.length < limit) {
    const excludeIds = [currentProductId, ...collected.map((p) => p.id)];
    const { data: backfill, error: backfillError } = await supabase
      .from("products")
      .select(PRODUCT_SUMMARY_SELECT)
      .eq("is_active", true)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(limit - collected.length);

    if (backfillError) {
      console.error("getRelatedProducts (backfill):", backfillError.message);
    }

    collected.push(...((backfill ?? []) as unknown as ProductSummaryRow[]));
  }

  const products = collected.map(toSummaryBase);
  return attachSoldOutStatus(supabase, products);
}
