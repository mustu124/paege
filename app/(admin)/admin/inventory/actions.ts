"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/admin-actions";

// Calls adjust_inventory (0028) via the user-context client — not the
// admin/service-role client — specifically so auth.uid() inside the
// RPC reflects the calling admin, which is what gets recorded as
// inventory_adjustments.admin_id. The RPC itself is the sole write
// path for stock (checks is_admin(), locks the row, guards against
// negative stock, and writes the adjustment record atomically), so
// this action is just a thin, validated wrapper around it.
export async function adjustStockAction(
  variantId: string,
  newQuantity: number,
  reason: string,
): Promise<ActionResult> {
  await requireAdmin();

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return { error: "Stock can't be negative." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("adjust_inventory", {
    p_variant_id: variantId,
    p_new_quantity: newQuantity,
    p_reason: reason || null,
  });

  if (error) {
    if (error.message.includes("negative_stock")) return { error: "Stock can't be negative." };
    return { error: error.message };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/shop");
  return {};
}
