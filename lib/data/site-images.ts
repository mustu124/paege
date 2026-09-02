import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type SiteImageKey = "featured_editorial" | "about_page" | "shipping_policy" | "returns_policy";
export type SiteImageRow = Database["public"]["Tables"]["site_images"]["Row"];

// Every named slot fetched in one query — there are only a handful,
// so this is simpler than a per-key round trip. Callers pass a
// SiteImageKey to look up the row they need; a missing/never-set key
// resolves to null storage_path, and getStorageUrl already falls
// back to the placeholder image for that.
export async function getSiteImages(): Promise<Record<SiteImageKey, SiteImageRow | null>> {
  const empty: Record<SiteImageKey, SiteImageRow | null> = {
    featured_editorial: null,
    about_page: null,
    shipping_policy: null,
    returns_policy: null,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return empty;

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_images").select("*");

  if (error) {
    console.error("getSiteImages:", error.message);
    return empty;
  }

  for (const row of data ?? []) {
    if (row.key in empty) empty[row.key as SiteImageKey] = row;
  }
  return empty;
}
