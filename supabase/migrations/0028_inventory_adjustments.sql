-- Append-only record of every stock change an admin makes, in the
-- same spirit as admin_audit_log but purpose-built for inventory:
-- richer structured fields (old/new/delta) instead of a freeform
-- jsonb blob, since this is the one admin action explicit auditing
-- was specifically called out for. No client write policy exists —
-- the only way a row is created is via adjust_inventory() below,
-- which writes it in the same transaction as the actual stock
-- change, so the two can never drift apart.
create table inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete restrict,
  old_quantity int not null,
  new_quantity int not null,
  adjustment_amount int not null,
  reason text,
  created_at timestamptz not null default now()
);

create index inventory_adjustments_variant_idx on inventory_adjustments (variant_id, created_at desc);

alter table inventory_adjustments enable row level security;

create policy "inventory_adjustments_admin_read" on inventory_adjustments
  for select using (is_admin());

-- ===================================================================
-- adjust_inventory
--
-- Sole write path for stock changes made through the admin panel.
-- Locks the inventory row, computes the delta, updates the quantity
-- (the table's own `check (quantity >= 0)` is the hard backstop
-- against negative stock — this function also checks explicitly so
-- the admin gets a clear error instead of a raw constraint
-- violation), and records the adjustment — all in one transaction.
-- ===================================================================
create or replace function adjust_inventory(
  p_variant_id uuid,
  p_new_quantity int,
  p_reason text default null
) returns table (old_quantity int, new_quantity int) as $$
declare
  v_old_quantity int;
begin
  if not is_admin() then
    raise exception 'not_authorized';
  end if;

  if p_new_quantity < 0 then
    raise exception 'negative_stock';
  end if;

  select quantity into v_old_quantity from inventory where variant_id = p_variant_id for update;

  if v_old_quantity is null then
    raise exception 'variant_not_found';
  end if;

  update inventory set quantity = p_new_quantity where variant_id = p_variant_id;

  insert into inventory_adjustments (variant_id, admin_id, old_quantity, new_quantity, adjustment_amount, reason)
  values (p_variant_id, auth.uid(), v_old_quantity, p_new_quantity, p_new_quantity - v_old_quantity, p_reason);

  return query select v_old_quantity, p_new_quantity;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function adjust_inventory(uuid, int, text) to authenticated;
