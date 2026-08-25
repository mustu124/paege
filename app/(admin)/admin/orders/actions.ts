"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types/database";
import type { ActionResult } from "@/lib/types/admin-actions";

// Routine fulfillment transitions only. 'confirmed' and
// 'payment_failed' are deliberately absent as destinations here — the
// only way into 'confirmed' from an unpaid state is the audited
// forceConfirmOrderAction below, and 'payment_failed' is set solely
// by the real Razorpay verification/webhook flow.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  payment_failed: [],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: order, error: fetchError } = await admin.from("orders").select("status").eq("id", orderId).single();
  if (fetchError || !order) return { error: "Order not found." };

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { error: `Can't move an order from "${order.status}" to "${newStatus}".` };
  }

  const { error } = await admin.from("orders").update({ status: newStatus }).eq("id", orderId);
  if (error) return { error: error.message };

  await logAdminAction("order.status_update", "order", orderId, {
    previous_status: order.status,
    new_status: newStatus,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}

export async function forceConfirmOrderAction(orderId: string, reason: string): Promise<ActionResult> {
  await requireAdmin();

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: "A reason is required to override payment status." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_force_confirm_order", {
    p_order_id: orderId,
    p_reason: trimmedReason,
  });

  if (error) {
    if (error.message.includes("invalid_status_for_override")) {
      return { error: "This order isn't in a state that can be force-confirmed." };
    }
    if (error.message.includes("insufficient_stock")) {
      return { error: "Can't confirm — one or more items are out of stock." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}
