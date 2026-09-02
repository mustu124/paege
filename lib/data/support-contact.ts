import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface SupportContact {
  email: string;
  instagram: string;
}

// Reuses the generic site_settings key/value store (see
// lib/data/products.ts's getBestsellersDisplayCount for the same
// pattern) rather than a dedicated table — just two more string
// settings. Empty string means "not set", and callers should treat
// that as "don't render this line" rather than showing a blank one.
export async function getSupportContact(): Promise<SupportContact> {
  const empty: SupportContact = { email: "", instagram: "" };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return empty;

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value").in("key", ["support_email", "support_instagram"]);

  if (error) {
    console.error("getSupportContact:", error.message);
    return empty;
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  return {
    email: typeof byKey.get("support_email") === "string" ? (byKey.get("support_email") as string) : "",
    instagram: typeof byKey.get("support_instagram") === "string" ? (byKey.get("support_instagram") as string) : "",
  };
}
