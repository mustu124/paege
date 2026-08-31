-- Generic single-slot image store for the handful of marketing photos
-- that live directly in page components rather than any content
-- table (the homepage's "Our Approach" and "Slow Fashion" banner
-- photos, the About page's opener photo) — these were hard-coded
-- image URLs with no admin control at all. One row per named slot;
-- `key` is a stable identifier the component code references, never
-- shown to the admin (the admin page maps it to a human label).
create table site_images (
  key text primary key,
  storage_path text,
  alt_text text,
  updated_at timestamptz not null default now()
);

create trigger trg_site_images_updated_at before update on site_images
  for each row execute function set_updated_at();

alter table site_images enable row level security;

create policy "site_images_public_read" on site_images
  for select using (true);

create policy "site_images_admin_write" on site_images
  for all using (is_admin()) with check (is_admin());

-- Seeded with the photos already sitting in the homepage-slides
-- bucket's static/ prefix (uploaded earlier, just never wired to an
-- editable row) so nothing regresses to a placeholder on deploy.
insert into site_images (key, storage_path, alt_text) values
  ('brand_story', 'static/brand-story-1787622994725.jpg', 'Detail of fabric and stitching, representing PAEGE''s considered approach to craft'),
  ('featured_editorial', 'static/featured-editorial-1787622993739.jpg', 'Featured edit'),
  ('about_page', 'static/brand-story-1787622994725.jpg', 'Detail of fabric and stitching, representing PAEGE''s considered approach to craft');
