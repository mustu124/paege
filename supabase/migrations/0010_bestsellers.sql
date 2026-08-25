-- products.is_bestseller (0003_products.sql) is a general tag: it
-- marks a product as belonging to the "Bestsellers" collection for
-- badges/filtering, and an admin can flip it on any product at any
-- time. This table is a separate concern — the curated, explicitly
-- ordered set of products actually featured in the homepage
-- Bestsellers rail. A product can be tagged is_bestseller=true
-- without being featured here (e.g. temporarily rotated out), and
-- the two are kept independent on purpose rather than collapsed
-- into one boolean-plus-order column.
create table bestsellers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references products(id) on delete cascade,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bestsellers_active_order_idx on bestsellers (is_active, display_order);

-- New Arrivals deliberately has no equivalent config table: it is
-- fully derived from products.is_new_arrival + created_at, which
-- already gives correct ordering (newest first) without needing
-- separate curation metadata.
