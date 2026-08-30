import { z } from "zod";

import { isUnreliableExternalImageUrl } from "@/lib/storage";

// An admin-entered alternative to uploading a file — must be a valid
// absolute URL, and not a Google Drive "share" link (those aren't
// reliable for direct hotlinking; see isUnreliableExternalImageUrl).
export const externalImageUrlSchema = z
  .string()
  .trim()
  .url("Enter a full image URL, starting with https://")
  .refine((url) => !isUnreliableExternalImageUrl(url), {
    message:
      "Google Drive links aren't reliable for direct image hosting — download the file and upload it instead, or use a direct CDN/hosting URL.",
  });

export const altTextSchema = z.string().trim().max(200, "Keep alt text under 200 characters").optional();

// Shared admin-panel validation schemas. Slugs are kept intentionally
// simple (lowercase, digits, hyphens) since they double as URL
// segments throughout the storefront.
const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: slugSchema,
  description: z.string().trim().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.string().uuid("Select a category"),
  productType: z.string().trim().optional(),
  colour: z.string().trim().optional(),
  fabric: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  washCareInstructions: z.string().trim().optional(),
  pricePaise: z.coerce.number().int().min(0, "Price can't be negative"),
  compareAtPricePaise: z.coerce.number().int().min(0).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  isBestseller: z.coerce.boolean().default(false),
  isNewArrival: z.coerce.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

// Initial sizes + stock submitted alongside product creation — matches
// the same size-label pattern addVariantAction enforces on its own
// (short apparel-size-like label), so a size added here behaves
// exactly like one added later from the edit page.
export const initialVariantSchema = z.object({
  size: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Za-z0-9.]{1,10}$/, "Enter a short size label (e.g. XS, M, 32)"),
  quantity: z.coerce.number().int().min(0, "Stock can't be negative"),
});

export const initialVariantsSchema = z.array(initialVariantSchema).max(20);

export type InitialVariantInput = z.infer<typeof initialVariantSchema>;

// A slide's CTA destination is rendered directly as a <Link href> —
// must be a relative path or a real http(s) URL, never a
// javascript:/data: URI (which next/link would happily render as a
// clickable, script-executing link otherwise).
const ctaLinkSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value), {
    message: "Use a relative path (e.g. /shop) or a full https:// URL",
  })
  .optional();

export const homepageSlideSchema = z.object({
  device: z.enum(["desktop", "mobile"]),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  linkUrl: ctaLinkSchema,
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type HomepageSlideInput = z.infer<typeof homepageSlideSchema>;
