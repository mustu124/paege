"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/auth.schema";

function safeRedirectTarget(value: FormDataEntryValue | null, fallback: string): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export interface AuthActionResult {
  error?: string;
}

// The only account system in the app is for admins — customers check
// out as guests, no sign-in required (see lib/supabase/middleware.ts).
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  // Credentials can be valid for a real Supabase account that just
  // isn't an admin (e.g. leftover test/customer credentials) — check
  // here rather than letting requireAdmin() catch it after a redirect
  // to /admin, so the error shows up in this same request instead of
  // an extra hop through a page that then bounces again.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "That account doesn't have admin access." };
  }

  redirect(safeRedirectTarget(formData.get("redirectTo"), "/admin"));
}
