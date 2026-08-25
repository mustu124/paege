-- ===================================================================
-- get_product_availability
--
-- Public accessor for stock STATUS (not raw quantity — see the
-- comment on the inventory table's RLS in 0016). Powers the
-- customer-facing size selector: In Stock / Low Stock / Out of Stock.
-- ===================================================================
create or replace function get_product_availability(p_product_id uuid)
returns table (variant_id uuid, size text, status text)
language sql
security definer
stable
set search_path = public
as $$
  select
    pv.id,
    pv.size,
    case
      when i.quantity <= 0 then 'out_of_stock'
      when i.quantity <= i.low_stock_threshold then 'low_stock'
      else 'in_stock'
    end
  from product_variants pv
  join inventory i on i.variant_id = pv.id
  where pv.product_id = p_product_id;
$$;

grant execute on function get_product_availability(uuid) to anon, authenticated;

-- ===================================================================
-- create_order_for_checkout
--
-- Called from server code (service-role client) when a signed-in
-- user proceeds to pay. Validates every requested variant has
-- enough stock, prices everything from LIVE product/variant data
-- (never trusts a client-sent price), and inserts orders +
-- order_items in a single transaction. Returns the new order id.
--
-- p_items shape: [{"variant_id": "<uuid>", "quantity": 2}, ...]
-- ===================================================================
create or replace function create_order_for_checkout(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_shipping_paise bigint
) returns uuid as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_variant product_variants%rowtype;
  v_product products%rowtype;
  v_inventory inventory%rowtype;
  v_unit_price bigint;
  v_line_total bigint;
  v_subtotal bigint := 0;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;

  v_order_id := gen_random_uuid();

  -- Pass 1: lock each variant's inventory row, validate stock, and
  -- accumulate the subtotal. Locking here (not just at confirm time)
  -- means two shoppers racing to check out the last unit of the same
  -- size serialize against each other instead of both getting a
  -- "successful" order that confirm_paid_order() would later have to
  -- reject.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_variant from product_variants
      where id = (v_item ->> 'variant_id')::uuid;

    if v_variant.id is null then
      raise exception 'variant_not_found:%', v_item ->> 'variant_id';
    end if;

    select * into v_inventory from inventory
      where variant_id = v_variant.id
      for update;

    if v_inventory.id is null or v_inventory.quantity < (v_item ->> 'quantity')::int then
      raise exception 'insufficient_stock:%', v_variant.id;
    end if;

    select * into v_product from products
      where id = v_variant.product_id and is_active = true;

    if v_product.id is null then
      raise exception 'product_unavailable:%', v_variant.product_id;
    end if;

    v_unit_price := coalesce(v_variant.price_override_paise, v_product.price_paise);
    v_line_total := v_unit_price * (v_item ->> 'quantity')::int;
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  insert into orders (
    id, user_id, status, subtotal_paise, shipping_paise, total_paise,
    shipping_address
  ) values (
    v_order_id, p_user_id, 'pending_payment', v_subtotal, p_shipping_paise,
    v_subtotal + p_shipping_paise, p_shipping_address
  );

  -- Pass 2: insert the snapshot line items (prices already computed above).
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_variant from product_variants where id = (v_item ->> 'variant_id')::uuid;
    select * into v_product from products where id = v_variant.product_id;
    v_unit_price := coalesce(v_variant.price_override_paise, v_product.price_paise);

    insert into order_items (
      order_id, product_id, variant_id, product_name, size,
      unit_price_paise, quantity, line_total_paise
    ) values (
      v_order_id, v_product.id, v_variant.id, v_product.name, v_variant.size,
      v_unit_price, (v_item ->> 'quantity')::int, v_unit_price * (v_item ->> 'quantity')::int
    );
  end loop;

  return v_order_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ===================================================================
-- confirm_paid_order
--
-- The single critical section for turning a Razorpay payment into a
-- confirmed, stock-decremented order. Called from BOTH the client
-- payment-verification route and the Razorpay webhook route, so it
-- must be fully idempotent: whichever call arrives first does the
-- work, the other is a safe no-op.
--
-- Idempotency layers:
--   1. razorpay_payment_id already present in `payments` -> no-op.
--   2. order already status='paid' -> no-op.
--   3. `select ... for update` on the order row serializes concurrent
--      callers for the SAME order (route handler vs webhook racing).
--   4. Per-item stock decrement is an atomic
--      `update inventory ... where quantity >= qty`, so concurrent
--      buyers of the last unit can't both succeed.
-- The whole function is one transaction: on any exception, nothing
-- is committed (no partial stock decrement) and the order stays
-- pending_payment for a subsequent retry or mark_order_payment_failed.
-- ===================================================================
create or replace function confirm_paid_order(
  p_order_id uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature text,
  p_amount_paise bigint
) returns table (already_processed boolean, order_status text) as $$
declare
  v_order orders%rowtype;
  v_item record;
  v_existing_payment_id uuid;
begin
  select id into v_existing_payment_id from payments
    where razorpay_payment_id = p_razorpay_payment_id;

  if v_existing_payment_id is not null then
    return query select true, (select status from orders where id = p_order_id);
    return;
  end if;

  select * into v_order from orders where id = p_order_id for update;

  if v_order.id is null then
    raise exception 'order_not_found';
  end if;

  if v_order.status = 'paid' then
    return query select true, v_order.status;
    return;
  end if;

  for v_item in
    select oi.variant_id, oi.quantity from order_items oi where oi.order_id = p_order_id
  loop
    update inventory
      set quantity = quantity - v_item.quantity
      where variant_id = v_item.variant_id and quantity >= v_item.quantity;

    if not found then
      raise exception 'insufficient_stock:%', v_item.variant_id;
    end if;
  end loop;

  update orders set status = 'paid', placed_at = now() where id = p_order_id;

  insert into payments (
    order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
    status, amount_paise, processed_at
  ) values (
    p_order_id, v_order.razorpay_order_id, p_razorpay_payment_id, p_razorpay_signature,
    'captured', p_amount_paise, now()
  );

  return query select false, 'paid';
end;
$$ language plpgsql security definer set search_path = public;

-- ===================================================================
-- mark_order_payment_failed
--
-- Called by the server when signature verification fails, the
-- insufficient_stock exception is caught, or Razorpay reports
-- payment.failed. Only transitions orders still awaiting payment,
-- so it can't clobber an order a concurrent call already confirmed.
-- ===================================================================
create or replace function mark_order_payment_failed(p_order_id uuid)
returns void as $$
begin
  update orders set status = 'payment_failed'
    where id = p_order_id and status = 'pending_payment';
end;
$$ language plpgsql security definer set search_path = public;

-- These three are only ever called from trusted server code (the
-- checkout/payment route handlers) using the service_role key, never
-- directly from the browser — revoke the default PUBLIC execute
-- grant and hand it only to service_role.
revoke execute on function create_order_for_checkout(uuid, jsonb, jsonb, bigint) from public;
revoke execute on function confirm_paid_order(uuid, text, text, bigint) from public;
revoke execute on function mark_order_payment_failed(uuid) from public;
grant execute on function create_order_for_checkout(uuid, jsonb, jsonb, bigint) to service_role;
grant execute on function confirm_paid_order(uuid, text, text, bigint) to service_role;
grant execute on function mark_order_payment_failed(uuid) to service_role;

-- ===================================================================
-- log_admin_action
--
-- Sole write path into admin_audit_log. Runs under the caller's own
-- session (not the service-role client) so auth.uid() reflects the
-- actual admin performing the action, and re-checks is_admin()
-- itself rather than trusting that only admin code paths call it —
-- an admin server action calls this immediately after each mutation
-- (product/category/inventory/order/slide/bestseller changes).
-- ===================================================================
create or replace function log_admin_action(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_changes jsonb default null
) returns void as $$
begin
  if not is_admin() then
    raise exception 'not_authorized';
  end if;

  insert into admin_audit_log (admin_id, action, entity_type, entity_id, changes)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_changes);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function log_admin_action(text, text, uuid, jsonb) to authenticated;
