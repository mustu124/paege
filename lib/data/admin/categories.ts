import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/data/categories";

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true });

  if (error) {
    console.error("getAllCategoriesAdmin:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();

  if (error) console.error("getCategoryById:", error.message);
  return data ?? null;
}
