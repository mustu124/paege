import "server-only";

import { createClient } from "@/lib/supabase/server";

// Thin wrapper around the log_admin_action RPC (0017) — the sole
// write path into admin_audit_log. Uses the user-context client
// (not the service-role client) so auth.uid() inside the RPC
// reflects the actual admin performing the action.
export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string | null,
  changes?: Record<string, unknown> | null,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_admin_action", {
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_changes: changes ?? null,
  });

  if (error) {
    console.error("logAdminAction:", action, entityType, error.message);
  }
}
