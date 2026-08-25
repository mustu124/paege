-- storage_path is a path inside the Supabase Storage bucket
-- 'product-images' (created via dashboard/CLI, see supabase/README.md).
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on product_images (product_id, display_order);
