import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface NewArrivalRow {
  id: string;
  name: string;
  primaryImagePath: string | null;
  displayOrder: number;
  isActiveProduct: boolean;
}

interface ProductWithImages {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
  product_images: { storage_path: string; is_primary: boolean; display_order: number }[];
}

function toRow(row: ProductWithImages): NewArrivalRow {
  const images = row.product_images ?? [];
  const primary = images.find((img) => img.is_primary) ?? [...images].sort((a, b) => a.display_order - b.display_order)[0];
  return {
    id: row.id,
    name: row.name,
    primaryImagePath: primary?.storage_path ?? null,
    displayOrder: row.display_order,
    isActiveProduct: row.is_active,
  };
}

export async function getNewArrivalsAdmin(): Promise<NewArrivalRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, is_active, display_order, product_images ( storage_path, is_primary, display_order )")
    .eq("is_new_arrival", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getNewArrivalsAdmin:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as ProductWithImages[]).map(toRow);
}

export interface NewArrivalCandidate {
  id: string;
  name: string;
  primaryImagePath: string | null;
}

export async function getNewArrivalCandidates(): Promise<NewArrivalCandidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, product_images ( storage_path, is_primary, display_order )")
    .eq("is_active", true)
    .eq("is_new_arrival", false)
    .order("name", { ascending: true });

  if (error) {
    console.error("getNewArrivalCandidates:", error.message);
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
