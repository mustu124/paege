-- A variant is the sellable unit: one product + one size. Stock is
-- deliberately NOT a column here — it lives in inventory
-- (0006_inventory.sql) as its own 1:1 table, so counting/reservation
-- concerns stay separate from variant identity (SKU, size). This
-- also leaves room for multi-location inventory later without
-- touching this table.
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  sku text unique,
  price_override_paise bigint check (price_override_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create index product_variants_product_idx on product_variants (product_id);
