import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

// Returns [] (not a throw) when Supabase isn't configured yet or the
// table is empty, so pages can render an empty state instead of
// crashing before the project owner provisions Supabase.
export async function getActiveCategories(): Promise<Category[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getActiveCategories:", error.message);
    return [];
  }

  return data ?? [];
}
