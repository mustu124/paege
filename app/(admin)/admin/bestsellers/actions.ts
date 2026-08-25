"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types/admin-actions";

export async function addBestsellerAction(productId: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: maxRow } = await admin
    .from("bestsellers")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { data, error } = await admin
    .from("bestsellers")
    .insert({ product_id: productId, display_order: nextOrder, is_active: true })
    .select("id")
    .single();

  if (error) return { error: error.code === "23505" ? "That product is already a bestseller." : error.message };

  await logAdminAction("bestseller.add", "bestseller", data.id, { product_id: productId });
  revalidatePath("/admin/bestsellers");
  revalidatePath("/");
  return {};
}

export async function removeBestsellerAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("bestsellers").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction("bestseller.remove", "bestseller", id);
  revalidatePath("/admin/bestsellers");
  revalidatePath("/");
  return {};
}

export async function toggleBestsellerActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("bestsellers").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(isActive ? "bestseller.activate" : "bestseller.deactivate", "bestseller", id);
  revalidatePath("/admin/bestsellers");
  revalidatePath("/");
  return {};
}

export async function reorderBestsellerAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: rows } = await admin.from("bestsellers").select("id, display_order").order("display_order");
  if (!rows) return { error: "Couldn't load bestsellers." };

  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return {};

  const current = rows[index]!;
  const swap = rows[swapIndex]!;

  await admin.from("bestsellers").update({ display_order: swap.display_order }).eq("id", current.id);
  await admin.from("bestsellers").update({ display_order: current.display_order }).eq("id", swap.id);

  revalidatePath("/admin/bestsellers");
  revalidatePath("/");
  return {};
}

export async function setBestsellersDisplayCountAction(count: number): Promise<ActionResult> {
  await requireAdmin();

  if (!Number.isFinite(count) || count < 1 || count > 20) {
    return { error: "Display count must be between 1 and 20." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .update({ value: count, updated_at: new Date().toISOString() })
    .eq("key", "bestsellers_display_count");

  if (error) return { error: error.message };

  await logAdminAction("site_settings.update", "site_settings", null, { key: "bestsellers_display_count", value: count });
  revalidatePath("/admin/bestsellers");
  revalidatePath("/");
  return {};
}
