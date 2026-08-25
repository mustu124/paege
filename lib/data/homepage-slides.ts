import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database, HeroDevice } from "@/lib/types/database";

export type HomepageSlide = Database["public"]["Tables"]["homepage_slides"]["Row"];

export async function getActiveHomepageSlides(device: HeroDevice): Promise<HomepageSlide[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_slides")
    .select("*")
    .eq("device", device)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getActiveHomepageSlides:", error.message);
    return [];
  }

  return data ?? [];
}
