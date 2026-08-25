"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import { categorySchema } from "@/lib/validation/admin.schema";
import type { ActionResult } from "@/lib/types/admin-actions";

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    displayOrder: formData.get("displayOrder"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single();

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  await logAdminAction("category.create", "category", data.id, { name: parsed.data.name });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
    })
    .eq("id", id);

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  await logAdminAction("category.update", "category", id, parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("categories").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(isActive ? "category.activate" : "category.deactivate", "category", id);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return {};
}

export async function reorderCategoryAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("id, display_order").order("display_order");
  if (!categories) return { error: "Couldn't load categories." };

  const index = categories.findIndex((c) => c.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= categories.length) return {};

  const current = categories[index]!;
  const swap = categories[swapIndex]!;

  await admin.from("categories").update({ display_order: swap.display_order }).eq("id", current.id);
  await admin.from("categories").update({ display_order: current.display_order }).eq("id", swap.id);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return {};
}
