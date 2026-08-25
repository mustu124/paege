import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Authoritative admin check — re-run at the top of the (admin)
// layout AND inside every individual admin server action (defense
// in depth). Always re-queries user_roles server-side via is_admin();
// a role is never trusted from a client-supplied value.
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated requests to
  // /admin/* before this ever runs; this is just a defense-in-depth
  // fallback for requireAdmin() being called from anywhere else.
  if (!user) {
    redirect("/login");
  }

  // Delegates to the same is_admin() SQL function every RLS policy
  // uses, rather than re-querying user_roles directly here — one
  // source of truth for "what counts as admin".
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    // A real, successfully-authenticated account that just isn't an
    // admin (e.g. old test/customer credentials) used to land here
    // silently on the homepage with zero explanation — signing out
    // and bouncing back to /login with a real error is what actually
    // tells the person what happened instead of looking like the
    // login attempt vanished.
    await supabase.auth.signOut();
    redirect("/login?error=not_admin");
  }

  return { user };
}
