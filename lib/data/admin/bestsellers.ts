import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface AdminBestsellerRow {
  id: string;
  productId: string;
  productName: string;
  primaryImagePath: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface BestsellerJoinRow {
  id: string;
  product_id: string;
  display_order: number;
  is_active: boolean;
  product: {
    name: string;
    product_images: { storage_path: string; is_primary: boolean; display_order: number }[];
  } | null;
}

export async function getAllBestsellersAdmin(): Promise<AdminBestsellerRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bestsellers")
    .select(`
      id,
      product_id,
      display_order,
      is_active,
      product:products ( name, product_images ( storage_path, is_primary, display_order ) )
    `)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getAllBestsellersAdmin:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as BestsellerJoinRow[])
    .filter((row) => row.product !== null)
    .map((row) => {
      const images = row.product!.product_images ?? [];
      const primary = images.find((img) => img.is_primary) ?? [...images].sort((a, b) => a.display_order - b.display_order)[0];
      return {
        id: row.id,
        productId: row.product_id,
        productName: row.product!.name,
        primaryImagePath: primary?.storage_path ?? null,
        displayOrder: row.display_order,
        isActive: row.is_active,
      };
    });
}

export interface BestsellerCandidate {
  id: string;
  name: string;
  primaryImagePath: string | null;
}

// Active products not already curated as a bestseller — the pool an
// admin picks from to add a new one.
export async function getBestsellerCandidates(): Promise<BestsellerCandidate[]> {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("bestsellers").select("product_id");
  const excludeIds = (existing ?? []).map((row) => row.product_id);

  let query = supabase
    .from("products")
    .select("id, name, product_images ( storage_path, is_primary, display_order )")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getBestsellerCandidates:", error.message);
    return [];
  }

  interface CandidateRow {
    id: string;
    name: string;
    product_images: { storage_path: string; is_primary: boolean; display_order: number }[];
  }

  return ((data ?? []) as unknown as CandidateRow[]).map((row) => {
    const images = row.product_images ?? [];
    const primary = images.find((img) => img.is_primary) ?? [...images].sort((a, b) => a.display_order - b.display_order)[0];
    return { id: row.id, name: row.name, primaryImagePath: primary?.storage_path ?? null };
  });
}

export async function getBestsellersDisplayCountAdmin(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "bestsellers_display_count").single();
  const value = Number(data?.value);
  return Number.isFinite(value) && value > 0 ? value : 4;
}
