-- One persisted cart per signed-in user (guests use client-side
-- state until they log in). Persisting server-side, rather than
-- localStorage only, gives cross-device continuity and lets the
-- cart page re-validate live price/stock on load instead of trusting
-- whatever the client cached.
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index cart_items_cart_idx on cart_items (cart_id);

-- Deliberately no stock check constraint here: available stock
-- fluctuates constantly and a cart is allowed to (briefly) hold more
-- than is currently available — that's normal shopping, not a bug.
-- The one place stock is authoritatively enforced is the
-- create_order_for_checkout() RPC at the moment of payment, which is
-- also what satisfies "prevent checkout if stock changed after
-- adding to cart."
