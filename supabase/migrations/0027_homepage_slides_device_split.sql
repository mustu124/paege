-- Splits homepage_slides from "one row = a desktop image + a mobile
-- image sharing one title/subtitle/CTA/order" into two genuinely
-- independent hero sets, discriminated by `device` — each with its
-- own image, title, subtitle, CTA, order, and active state. This
-- matches an explicit admin requirement ("TWO hero sets", each with
-- its own full metadata, "exactly 5 active slots" per device) rather
-- than one paired set with shared copy.
--
-- "At most 5 active per device" is a business rule, not something a
-- plain CHECK constraint can express (it needs a row count across
-- the table) — it's enforced in the admin server action instead.

create table homepage_slides_new (
  id uuid primary key default gen_random_uuid(),
  device text not null check (device in ('desktop', 'mobile')),
  title text,
  subtitle text,
  image_path text not null,
  link_url text,
  cta_label text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate existing paired rows: each becomes one desktop + one
-- mobile row, preserving title/subtitle/cta/order/active and picking
-- the correct single image per device.
insert into homepage_slides_new (device, title, subtitle, image_path, link_url, cta_label, display_order, is_active, created_at)
select 'desktop', title, subtitle, desktop_image_path, link_url, cta_label, display_order, is_active, created_at
from homepage_slides;

insert into homepage_slides_new (device, title, subtitle, image_path, link_url, cta_label, display_order, is_active, created_at)
select 'mobile', title, subtitle, mobile_image_path, link_url, cta_label, display_order, is_active, created_at
from homepage_slides;

drop table homepage_slides;
alter table homepage_slides_new rename to homepage_slides;

create index homepage_slides_device_active_order_idx on homepage_slides (device, is_active, display_order);

create trigger trg_homepage_slides_updated_at before update on homepage_slides
  for each row execute function set_updated_at();

alter table homepage_slides enable row level security;

create policy "homepage_slides_public_read" on homepage_slides
  for select using (is_active = true or is_admin());

create policy "homepage_slides_admin_write" on homepage_slides
  for all using (is_admin()) with check (is_admin());
