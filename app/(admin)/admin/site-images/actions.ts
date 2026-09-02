"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/auth/log-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveImageInput } from "@/lib/admin/resolve-image-input";
import { altTextSchema, supportContactSchema } from "@/lib/validation/admin.schema";
import { isStoragePath } from "@/lib/storage";
import type { SiteImageKey } from "@/lib/data/site-images";
import type { ActionResult } from "@/lib/types/admin-actions";

// One row per named slot (site_images.key) — a slot's own storage
// path is only replaced when a new image/URL is actually submitted,
// same duality as every other admin image control (file upload or a
// pasted external URL). Alt text can be updated on its own without
// touching the image.
export async function setSiteImageAction(key: SiteImageKey, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const altParsed = altTextSchema.safeParse(formData.get("altText") || undefined);
  if (!altParsed.success) return { error: altParsed.error.issues[0]?.message ?? "Invalid alt text." };

  const resolved = resolveImageInput(formData);
  if ("error" in resolved) return { error: resolved.error };

  const admin = createAdminClient();

  const update: { alt_text: string | null; storage_path?: string } = { alt_text: altParsed.data ?? null };

  if (resolved.input.kind !== "none") {
    const { data: existing } = await admin.from("site_images").select("storage_path").eq("key", key).maybeSingle();

    let storedPath: string;
    if (resolved.input.kind === "file") {
      const file = resolved.input.file;
      const ext = file.name.split(".").pop() || "jpg";
      storedPath = `static/${key}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await admin.storage
        .from("homepage-slides")
        .upload(storedPath, file, { contentType: file.type });
      if (uploadError) return { error: uploadError.message };
    } else {
      storedPath = resolved.input.url;
    }
    update.storage_path = storedPath;

    if (existing?.storage_path && isStoragePath(existing.storage_path)) {
      await admin.storage.from("homepage-slides").remove([existing.storage_path]);
    }
  }

  const { error } = await admin.from("site_images").upsert({ key, ...update }, { onConflict: "key" });
  if (error) return { error: error.message };

  // entity_id is a uuid column — site_images.key is a plain slug, so
  // it goes in `changes` instead rather than trying to force it in.
  await logAdminAction("site_image.update", "site_image", null, { key });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/shipping-returns");
  revalidatePath("/admin/site-images");
  return {};
}

export async function setSupportContactAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = supportContactSchema.safeParse({
    email: formData.get("email"),
    instagram: formData.get("instagram"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    [
      { key: "support_email", value: parsed.data.email },
      { key: "support_instagram", value: parsed.data.instagram },
    ],
    { onConflict: "key" },
  );
  if (error) return { error: error.message };

  await logAdminAction("support_contact.update", "site_setting", null, parsed.data);
  revalidatePath("/shipping-returns");
  revalidatePath("/admin/site-images");
  return {};
}
