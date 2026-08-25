import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";

// Service-role client. Bypasses RLS entirely. `import "server-only"`
// above makes Next.js fail the build if any Client Component ever
// imports this module transitively.
//
// Only import this from:
//   - app/api/** route handlers (payments/checkout endpoints)
//   - admin server actions, AFTER requireAdmin() has already passed
//
// Never import it from a shared/barrel file that a client component
// might also pull in.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
