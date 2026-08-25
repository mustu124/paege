-- Desktop and mobile use distinct source images (not a CSS-only
-- crop) so the admin can art-direct each breakpoint separately.
-- Paths live in the 'homepage-slides' Supabase Storage bucket.
create table homepage_slides (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  desktop_image_path text not null,
  mobile_image_path text not null,
  link_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index homepage_slides_active_order_idx on homepage_slides (is_active, display_order);
