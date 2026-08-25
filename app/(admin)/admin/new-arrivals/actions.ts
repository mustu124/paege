"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types/admin-actions";

export async function markNewArrivalAction(productId: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: maxRow } = await admin
    .from("products")
    .select("display_order")
    .eq("is_new_arrival", true)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { error } = await admin
    .from("products")
    .update({ is_new_arrival: true, display_order: nextOrder })
    .eq("id", productId);

  if (error) return { error: error.message };

  await logAdminAction("new_arrival.mark", "product", productId);
  revalidatePath("/admin/new-arrivals");
  revalidatePath("/");
  revalidatePath("/shop");
  return {};
}

export async function unmarkNewArrivalAction(productId: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("products").update({ is_new_arrival: false }).eq("id", productId);
  if (error) return { error: error.message };

  await logAdminAction("new_arrival.unmark", "product", productId);
  revalidatePath("/admin/new-arrivals");
  revalidatePath("/");
  revalidatePath("/shop");
  return {};
}

export async function reorderNewArrivalAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("products")
    .select("id, display_order")
    .eq("is_new_arrival", true)
    .order("display_order", { ascending: true });
  if (!rows) return { error: "Couldn't load new arrivals." };

  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return {};

  const current = rows[index]!;
  const swap = rows[swapIndex]!;

  await admin.from("products").update({ display_order: swap.display_order }).eq("id", current.id);
  await admin.from("products").update({ display_order: current.display_order }).eq("id", swap.id);

  revalidatePath("/admin/new-arrivals");
  revalidatePath("/");
  return {};
}
