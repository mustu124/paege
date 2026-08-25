import "server-only";

import { externalImageUrlSchema } from "@/lib/validation/admin.schema";

// Every admin image control (product image upload/replace, homepage
// slide image) accepts either an uploaded file OR a pasted external
// URL — never both, never a hard-coded path. This is the one place
// that duality is resolved, so every admin action handles it the
// same way and validates external URLs the same way (rejecting
// unreliable Google Drive share links).
export type ImageInput = { kind: "file"; file: File } | { kind: "url"; url: string } | { kind: "none" };

export function resolveImageInput(formData: FormData): { input: ImageInput } | { error: string } {
  const file = formData.get("file");
  const rawUrl = formData.get("imageUrl");
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "That file isn't an image." };
    return { input: { kind: "file", file } };
  }

  if (url) {
    const parsed = externalImageUrlSchema.safeParse(url);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid image URL." };
    return { input: { kind: "url", url: parsed.data } };
  }

  return { input: { kind: "none" } };
}
