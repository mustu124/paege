"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import { categorySchema } from "@/lib/validation/admin.schema";
import { resolveImageInput } from "@/lib/admin/resolve-image-input";
import { isStoragePath } from "@/lib/storage";
import type { ActionResult } from "@/lib/types/admin-actions";

// Shared by create/update — uploads a new file (or accepts a pasted
// URL) and returns the path to store, or null if the admin didn't
// submit a new image this time (existing image stays untouched).
// `existingPath` (when replacing) gets removed from Storage after a
// successful swap, same convention as product images.
async function resolveCategoryImage(
  admin: ReturnType<typeof createAdminClient>,
  categoryId: string,
  formData: FormData,
  existingPath?: string | null,
): Promise<{ path?: string } | { error: string }> {
  const resolved = resolveImageInput(formData);
  if ("error" in resolved) return { error: resolved.error };
  if (resolved.input.kind === "none") return {};

  let storedPath: string;
  if (resolved.input.kind === "file") {
    const file = resolved.input.file;
    const ext = file.name.split(".").pop() || "jpg";
    storedPath = `${categoryId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("category-images")
      .upload(storedPath, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
  } else {
    storedPath = resolved.input.url;
  }

  if (existingPath && isStoragePath(existingPath)) {
    await admin.storage.from("category-images").remove([existingPath]);
  }

  return { path: storedPath };
}

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

  // Image is optional and resolved after the insert — a category can
  // exist without a tile photo, filled in later from the same form.
  const image = await resolveCategoryImage(admin, data.id, formData);
  if ("error" in image) return { error: image.error };
  if (image.path) {
    await admin.from("categories").update({ image_storage_path: image.path }).eq("id", data.id);
  }

  await logAdminAction("category.create", "category", data.id, { name: parsed.data.name });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();

  const { data: existing } = await admin.from("categories").select("image_storage_path").eq("id", id).single();
  const image = await resolveCategoryImage(admin, id, formData, existing?.image_storage_path);
  if ("error" in image) return { error: image.error };

  const { error } = await admin
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
      ...(image.path ? { image_storage_path: image.path } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  await logAdminAction("category.update", "category", id, parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
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
