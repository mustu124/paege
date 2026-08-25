-- One row per Razorpay payment attempt (supports retries after a
-- failed attempt). The unique index on razorpay_payment_id is the
-- primary idempotency guard against double-processing a payment.
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'created'
    check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  amount_paise bigint not null,
  raw_webhook_payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index payments_razorpay_payment_id_idx
  on payments (razorpay_payment_id) where razorpay_payment_id is not null;
create index payments_order_idx on payments (order_id);

-- Dedupes Razorpay webhook deliveries: `id` is Razorpay's event id
-- from the payload, so a retried/replayed delivery hits the primary
-- key and is rejected before any side effect runs.
create table webhook_events (
  id text primary key,
  event_type text not null,
  received_at timestamptz not null default now(),
  payload jsonb not null
);
