create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment', 'paid', 'processing', 'shipped',
      'delivered', 'cancelled', 'payment_failed'
    )),
  subtotal_paise bigint not null,
  shipping_paise bigint not null default 0,
  total_paise bigint not null,
  currency text not null default 'INR',
  shipping_address jsonb not null,
  razorpay_order_id text,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on orders (user_id);
create index orders_status_idx on orders (status);
-- Partial unique index: enforces one Razorpay order per row, but
-- allows many rows with a still-null razorpay_order_id (pre-payment).
create unique index orders_razorpay_order_id_idx
  on orders (razorpay_order_id) where razorpay_order_id is not null;

-- order_items snapshots product name/size/price at purchase time —
-- it never re-joins live product data, so historical orders stay
-- accurate even if a product is later renamed, repriced, or removed.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  variant_id uuid not null references product_variants(id) on delete restrict,
  product_name text not null,
  size text not null,
  unit_price_paise bigint not null,
  quantity int not null check (quantity > 0),
  line_total_paise bigint not null,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on order_items (order_id);
