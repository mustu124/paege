type Bucket = "product-images" | "homepage-slides" | "category-images";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1200x1500/f7f3ec/262220.png?text=PAEGE%0APlaceholder+Image";

// True for a stored value that's an actual bucket object key rather
// than an absolute external URL. Used both by getStorageUrl (to
// decide whether to prefix it with the Supabase Storage base) and by
// admin actions (to decide whether a stored value has a real Storage
// object that needs deleting when replaced/removed).
export function isStoragePath(value: string): boolean {
  return !/^https?:\/\//i.test(value);
}

// Google Drive "share" links (drive.google.com/file/d/…/view,
// drive.google.com/open?id=…, docs.google.com/…) are not reliable
// direct-access image URLs — Drive rate-limits and sometimes blocks
// hotlinking, and share links can require the viewer to be signed
// in. Rather than silently accepting a link that will eventually
// break in production, this flags it so the admin UI can reject it
// with guidance (download the file and upload it, or use a real
// direct-hosting/CDN URL instead).
export function isUnreliableExternalImageUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "drive.google.com" || hostname === "docs.google.com";
  } catch {
    return false;
  }
}

// Centralized image-URL resolution for the whole app: a stored image
// field (product_images.storage_path, homepage_slides.image_path,
// categories.image_path) is either a Supabase Storage object key or
// an already-absolute external URL — this is the one place that
// distinction is resolved into something an <Image> can render.
// Nothing outside this function should know or care which case it
// is; product/homepage components never hard-code a path or bucket
// URL directly. Falls back to a clearly labeled placeholder so every
// page renders sensibly before real photos exist.
export function getStorageUrl(bucket: Bucket, path: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!path) {
    return PLACEHOLDER_IMAGE_URL;
  }

  if (!isStoragePath(path)) {
    return path;
  }

  if (!base) {
    return PLACEHOLDER_IMAGE_URL;
  }

  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
