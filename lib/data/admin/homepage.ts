import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { HomepageSlide } from "@/lib/data/homepage-slides";
import type { HeroDevice } from "@/lib/types/database";

export async function getAllHomepageSlides(device: HeroDevice): Promise<HomepageSlide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_slides")
    .select("*")
    .eq("device", device)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getAllHomepageSlides:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getHomepageSlideById(id: string): Promise<HomepageSlide | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("homepage_slides").select("*").eq("id", id).maybeSingle();
  if (error) console.error("getHomepageSlideById:", error.message);
  return data ?? null;
}
