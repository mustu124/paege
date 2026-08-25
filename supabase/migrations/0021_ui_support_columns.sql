-- Supports the customer-facing UI build.
--
-- homepage_slides.cta_label: the slide already had link_url as the
-- CTA destination; this is the button text ("Shop Dresses", etc).
--
-- categories.image_storage_path: a representative image for the
-- homepage's category-discovery tiles. Same nullable-path-with-
-- placeholder-fallback convention as product/slide images
-- (lib/storage.ts) — admin-editable, not a fixed asset.
alter table categories add column image_storage_path text;
alter table homepage_slides add column cta_label text;
