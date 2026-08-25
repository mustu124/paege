-- One row per variant. This is the row that is atomically decremented
-- by the confirm_paid_order() RPC during checkout (see
-- 0017_rpc_checkout_functions.sql) and locked with `for update`
-- during create_order_for_checkout() to serialize concurrent buyers
-- of the same size.
--
-- low_stock_threshold default of 2 matches the worked example in the
-- product spec: quantity 3 -> "In Stock", quantity 2 -> "Low Stock".
create table inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references product_variants(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  low_stock_threshold int not null default 2 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);
