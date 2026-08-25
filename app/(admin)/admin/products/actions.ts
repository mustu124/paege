"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { productSchema, altTextSchema } from "@/lib/validation/admin.schema";
import { resolveImageInput } from "@/lib/admin/resolve-image-input";
import { isStoragePath } from "@/lib/storage";
import type { ActionResult } from "@/lib/types/admin-actions";

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    productType: formData.get("productType") || undefined,
    colour: formData.get("colour") || undefined,
    fabric: formData.get("fabric") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    washCareInstructions: formData.get("washCareInstructions") || undefined,
    pricePaise: formData.get("pricePaise"),
    compareAtPricePaise: formData.get("compareAtPricePaise") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
    isActive: formData.get("isActive") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    isNewArrival: formData.get("isNewArrival") === "on",
  });
}

function productRowFromInput(data: ReturnType<typeof parseProductForm>["data"]) {
  if (!data) throw new Error("unreachable");
  return {
    name: data.name,
    slug: data.slug,
    category_id: data.categoryId,
    product_type: data.productType ?? null,
    colour: data.colour ?? null,
    fabric: data.fabric ?? null,
    short_description: data.shortDescription ?? null,
    description: data.description ?? null,
    wash_care_instructions: data.washCareInstructions ?? null,
    price_paise: data.pricePaise,
    compare_at_price_paise: data.compareAtPricePaise ?? null,
    display_order: data.displayOrder,
    is_active: data.isActive,
    is_bestseller: data.isBestseller,
    is_new_arrival: data.isNewArrival,
  };
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("products").insert(productRowFromInput(parsed.data)).select("id").single();

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  await logAdminAction("product.create", "product", data.id, { name: parsed.data.name });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProductAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();
  const { error } = await admin.from("products").update(productRowFromInput(parsed.data)).eq("id", id);

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  await logAdminAction("product.update", "product", id, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${parsed.data.slug}`);
  return {};
}

// "Delete" is always archival — is_active=false. order_items references
// products with ON DELETE RESTRICT specifically so a hard delete can
// never silently orphan order history; this action doesn't attempt one.
export async function setProductActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(isActive ? "product.activate" : "product.archive", "product", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return {};
}

export async function setProductFlagAction(
  id: string,
  flag: "is_bestseller" | "is_new_arrival",
  value: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const update = flag === "is_bestseller" ? { is_bestseller: value } : { is_new_arrival: value };
  const { error } = await admin.from("products").update(update).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(`product.${flag}`, "product", id, { value });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  revalidatePath("/shop");
  return {};
}

const SIZE_PATTERN = /^[A-Za-z0-9.]{1,10}$/;

export async function addVariantAction(productId: string, size: string): Promise<ActionResult> {
  await requireAdmin();

  const trimmed = size.trim().toUpperCase();
  if (!SIZE_PATTERN.test(trimmed)) return { error: "Enter a short size label (e.g. XS, M, 32)." };

  const admin = createAdminClient();
  const { data: variant, error } = await admin
    .from("product_variants")
    .insert({ product_id: productId, size: trimmed })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "That size already exists for this product." : error.message };
  }

  const { error: invError } = await admin.from("inventory").insert({ variant_id: variant.id, quantity: 0 });
  if (invError) return { error: invError.message };

  await logAdminAction("product.variant_add", "product", productId, { size: trimmed });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
  return {};
}

// Hard-deletes only if the variant has never been ordered (order_items
// has ON DELETE RESTRICT on variant_id, so the DB itself refuses a
// delete that would orphan order history) — this is caught and
// turned into a clear message rather than a raw DB error.
export async function removeVariantAction(productId: string, variantId: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("product_variants").delete().eq("id", variantId);

  if (error) {
    if (error.code === "23503") {
      return { error: "This size has order history and can't be removed — set its stock to 0 to discontinue it instead." };
    }
    return { error: error.message };
  }

  await logAdminAction("product.variant_remove", "product", productId, { variantId });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
  return {};
}

export async function uploadProductImageAction(productId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const resolved = resolveImageInput(formData);
  if ("error" in resolved) return { error: resolved.error };
  if (resolved.input.kind === "none") return { error: "Choose an image file or paste an image URL." };

  const altParsed = altTextSchema.safeParse(formData.get("altText") || undefined);
  if (!altParsed.success) return { error: altParsed.error.issues[0]?.message ?? "Invalid alt text." };

  const admin = createAdminClient();

  let storedPath: string;
  if (resolved.input.kind === "file") {
    const file = resolved.input.file;
    const ext = file.name.split(".").pop() || "jpg";
    storedPath = `${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(storedPath, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
  } else {
    storedPath = resolved.input.url;
  }

  const { count } = await admin.from("product_images").select("*", { count: "exact", head: true }).eq("product_id", productId);

  const { error: insertError } = await admin.from("product_images").insert({
    product_id: productId,
    storage_path: storedPath,
    alt_text: altParsed.data ?? null,
    display_order: count ?? 0,
    is_primary: (count ?? 0) === 0,
  });
  if (insertError) return { error: insertError.message };

  await logAdminAction("product.image_upload", "product", productId, { path: storedPath });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return {};
}

// Swaps an existing image's underlying file/URL in place — keeps the
// same row (id, display_order, is_primary, alt_text unless a new one
// is given), so a replacement doesn't disturb gallery ordering or
// which image is primary. The old Storage object is deleted only if
// it really was one (not an external URL, which has nothing to
// delete from our bucket).
export async function replaceProductImageAction(
  productId: string,
  imageId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const resolved = resolveImageInput(formData);
  if ("error" in resolved) return { error: resolved.error };
  if (resolved.input.kind === "none") return { error: "Choose a new image file or paste an image URL." };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("product_images").select("storage_path").eq("id", imageId).single();
  if (!existing) return { error: "Image not found." };

  let storedPath: string;
  if (resolved.input.kind === "file") {
    const file = resolved.input.file;
    const ext = file.name.split(".").pop() || "jpg";
    storedPath = `${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(storedPath, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
  } else {
    storedPath = resolved.input.url;
  }

  const { error } = await admin.from("product_images").update({ storage_path: storedPath }).eq("id", imageId);
  if (error) return { error: error.message };

  if (isStoragePath(existing.storage_path)) {
    await admin.storage.from("product-images").remove([existing.storage_path]);
  }

  await logAdminAction("product.image_replace", "product", productId, { imageId, path: storedPath });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return {};
}

export async function updateProductImageAltTextAction(
  productId: string,
  imageId: string,
  altText: string,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = altTextSchema.safeParse(altText || undefined);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid alt text." };

  const admin = createAdminClient();
  const { error } = await admin.from("product_images").update({ alt_text: parsed.data ?? null }).eq("id", imageId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function deleteProductImageAction(productId: string, imageId: string, storagePath: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  if (isStoragePath(storagePath)) {
    await admin.storage.from("product-images").remove([storagePath]);
  }
  const { error } = await admin.from("product_images").delete().eq("id", imageId);
  if (error) return { error: error.message };

  await logAdminAction("product.image_delete", "product", productId, { imageId });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return {};
}

export async function setPrimaryImageAction(productId: string, imageId: string): Promise<ActionResult> {
  await requireAdmin();

  // Uses the RPC (atomic unset-all-then-set-one) rather than two
  // sequential admin-client updates.
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_primary_product_image", { p_product_id: productId, p_image_id: imageId });
  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return {};
}

export async function reorderImageAction(productId: string, imageId: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: images } = await admin
    .from("product_images")
    .select("id, display_order")
    .eq("product_id", productId)
    .order("display_order");
  if (!images) return { error: "Couldn't load images." };

  const index = images.findIndex((img) => img.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= images.length) return {};

  const current = images[index]!;
  const swap = images[swapIndex]!;

  await admin.from("product_images").update({ display_order: swap.display_order }).eq("id", current.id);
  await admin.from("product_images").update({ display_order: current.display_order }).eq("id", swap.id);

  revalidatePath(`/admin/products/${productId}`);
  return {};
}
