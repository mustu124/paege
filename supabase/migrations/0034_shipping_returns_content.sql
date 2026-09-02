-- Two more site_images slots for the Shipping & Return Policy page's
-- two photos (shipping, returns) — same generic table as migration
-- 0033, just new rows. Left with a null storage_path (renders the
-- placeholder image) until the admin uploads real photos.
insert into site_images (key, storage_path, alt_text) values
  ('shipping_policy', null, null),
  ('returns_policy', null, null);

-- Customer-support contact details shown on the Shipping & Return
-- Policy page — reuses the existing generic site_settings key/value
-- store (migration 0029) rather than a new table. Empty string means
-- "not set yet"; the storefront only renders a contact line once the
-- admin fills one in.
insert into site_settings (key, value) values
  ('support_email', '""'),
  ('support_instagram', '""');
