import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];

export interface AdminProductListItem extends ProductRow {
  categoryName: string | null;
  primaryImagePath: string | null;
  variantCount: number;
}

export async function getAllProductsAdmin(): Promise<AdminProductListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories ( name ),
      product_images ( storage_path, is_primary ),
      product_variants ( id )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getAllProductsAdmin:", error?.message);
    return [];
  }

  return (data as unknown as (ProductRow & {
    category: { name: string } | null;
    product_images: { storage_path: string; is_primary: boolean }[];
    product_variants: { id: string }[];
  })[]).map((row) => {
    const primary = row.product_images.find((img) => img.is_primary) ?? row.product_images[0];
    const { category, product_images, product_variants, ...rest } = row;
    return {
      ...rest,
      categoryName: category?.name ?? null,
      primaryImagePath: primary?.storage_path ?? null,
      variantCount: product_variants.length,
    };
  });
}

export interface VariantWithStock extends ProductVariantRow {
  inventory: InventoryRow | null;
}

export interface AdminProductDetail extends ProductRow {
  variants: VariantWithStock[];
  images: ProductImageRow[];
}

export async function getProductForEdit(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !product) {
    if (error) console.error("getProductForEdit:", error.message);
    return null;
  }

  const [{ data: variants }, { data: images }] = await Promise.all([
    supabase.from("product_variants").select("*, inventory (*)").eq("product_id", id).order("size"),
    supabase.from("product_images").select("*").eq("product_id", id).order("display_order"),
  ]);

  return {
    ...product,
    variants: ((variants ?? []) as unknown as (ProductVariantRow & { inventory: InventoryRow[] })[]).map((v) => ({
      ...v,
      inventory: v.inventory?.[0] ?? null,
    })),
    images: images ?? [],
  };
}
