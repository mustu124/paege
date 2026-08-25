"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import { homepageSlideSchema } from "@/lib/validation/admin.schema";
import { resolveImageInput } from "@/lib/admin/resolve-image-input";
import { isStoragePath } from "@/lib/storage";
import type { HeroDevice } from "@/lib/types/database";
import type { ActionResult } from "@/lib/types/admin-actions";

const MAX_ACTIVE_PER_DEVICE = 5;

function parseSlideForm(formData: FormData) {
  return homepageSlideSchema.safeParse({
    device: formData.get("device"),
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
}

async function countActive(admin: ReturnType<typeof createAdminClient>, device: HeroDevice, excludeId?: string) {
  let query = admin.from("homepage_slides").select("id", { count: "exact", head: true }).eq("device", device).eq("is_active", true);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return count ?? 0;
}

export async function createHomepageSlideAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseSlideForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const resolved = resolveImageInput(formData);
  if ("error" in resolved) return { error: resolved.error };
  if (resolved.input.kind === "none") return { error: "Choose an image file or paste an image URL." };

  const admin = createAdminClient();

  if (parsed.data.isActive) {
    const activeCount = await countActive(admin, parsed.data.device);
    if (activeCount >= MAX_ACTIVE_PER_DEVICE) {
      return { error: `Only ${MAX_ACTIVE_PER_DEVICE} active ${parsed.data.device} slides are allowed. Deactivate one first.` };
    }
  }

  let imagePath: string;
  if (resolved.input.kind === "file") {
    const file = resolved.input.file;
    const ext = file.name.split(".").pop() || "jpg";
    imagePath = `${parsed.data.device}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("homepage-slides")
      .upload(imagePath, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
  } else {
    imagePath = resolved.input.url;
  }

  const { data, error } = await admin
    .from("homepage_slides")
    .insert({
      device: parsed.data.device,
      title: parsed.data.title ?? null,
      subtitle: parsed.data.subtitle ?? null,
      cta_label: parsed.data.ctaLabel ?? null,
      link_url: parsed.data.linkUrl ?? null,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
      image_path: imagePath,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAdminAction("homepage_slide.create", "homepage_slide", data.id, { device: parsed.data.device });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function updateHomepageSlideAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseSlideForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();

  if (parsed.data.isActive) {
    const activeCount = await countActive(admin, parsed.data.device, id);
    if (activeCount >= MAX_ACTIVE_PER_DEVICE) {
      return { error: `Only ${MAX_ACTIVE_PER_DEVICE} active ${parsed.data.device} slides are allowed. Deactivate one first.` };
    }
  }

  const resolved = resolveImageInput(formData);
  if ("error" in resolved) return { error: resolved.error };

  let imagePath: string | undefined;
  let previousImagePath: string | undefined;
  if (resolved.input.kind === "file") {
    const file = resolved.input.file;
    const ext = file.name.split(".").pop() || "jpg";
    imagePath = `${parsed.data.device}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("homepage-slides")
      .upload(imagePath, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
    const { data: existing } = await admin.from("homepage_slides").select("image_path").eq("id", id).single();
    previousImagePath = existing?.image_path;
  } else if (resolved.input.kind === "url") {
    imagePath = resolved.input.url;
    const { data: existing } = await admin.from("homepage_slides").select("image_path").eq("id", id).single();
    previousImagePath = existing?.image_path;
  }

  const { error } = await admin
    .from("homepage_slides")
    .update({
      device: parsed.data.device,
      title: parsed.data.title ?? null,
      subtitle: parsed.data.subtitle ?? null,
      cta_label: parsed.data.ctaLabel ?? null,
      link_url: parsed.data.linkUrl ?? null,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
      ...(imagePath ? { image_path: imagePath } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (imagePath && previousImagePath && isStoragePath(previousImagePath)) {
    await admin.storage.from("homepage-slides").remove([previousImagePath]);
  }

  await logAdminAction("homepage_slide.update", "homepage_slide", id, parsed.data);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function toggleHomepageSlideActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: slide } = await admin.from("homepage_slides").select("device").eq("id", id).single();
  if (!slide) return { error: "Slide not found." };

  if (isActive) {
    const activeCount = await countActive(admin, slide.device, id);
    if (activeCount >= MAX_ACTIVE_PER_DEVICE) {
      return { error: `Only ${MAX_ACTIVE_PER_DEVICE} active ${slide.device} slides are allowed. Deactivate one first.` };
    }
  }

  const { error } = await admin.from("homepage_slides").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(isActive ? "homepage_slide.activate" : "homepage_slide.deactivate", "homepage_slide", id);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return {};
}

export async function reorderHomepageSlideAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: slide } = await admin.from("homepage_slides").select("device").eq("id", id).single();
  if (!slide) return { error: "Slide not found." };

  const { data: slides } = await admin
    .from("homepage_slides")
    .select("id, display_order")
    .eq("device", slide.device)
    .order("display_order");
  if (!slides) return { error: "Couldn't load slides." };

  const index = slides.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= slides.length) return {};

  const current = slides[index]!;
  const swap = slides[swapIndex]!;

  await admin.from("homepage_slides").update({ display_order: swap.display_order }).eq("id", current.id);
  await admin.from("homepage_slides").update({ display_order: current.display_order }).eq("id", swap.id);

  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return {};
}

export async function deleteHomepageSlideAction(id: string, storagePath: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  if (isStoragePath(storagePath)) {
    await admin.storage.from("homepage-slides").remove([storagePath]);
  }
  const { error } = await admin.from("homepage_slides").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction("homepage_slide.delete", "homepage_slide", id);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return {};
}
