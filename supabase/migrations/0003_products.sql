-- Prices are stored as integer paise (bigint) to avoid floating point
-- rounding errors; Razorpay's API itself operates in paise.
--
-- Note what is deliberately NOT here: stock. Stock is size/variant
-- aware and lives in inventory (0006_inventory.sql), keyed off
-- product_variants, not products.
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  product_type text,
  colour text,
  fabric text,
  price_paise bigint not null check (price_paise >= 0),
  compare_at_price_paise bigint check (compare_at_price_paise >= 0),
  wash_care_instructions text,
  is_active boolean not null default true,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on products (category_id);
create index products_active_idx on products (is_active);
create index products_active_display_order_idx on products (is_active, display_order);
create index products_new_arrival_idx on products (is_new_arrival) where is_new_arrival = true;
create index products_bestseller_idx on products (is_bestseller) where is_bestseller = true;
create index products_search_idx on products
  using gin (to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(short_description, '')));
