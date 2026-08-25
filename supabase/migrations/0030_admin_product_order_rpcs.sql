-- ===================================================================
-- set_primary_product_image
--
-- Unsets any existing primary image for the product and sets the
-- given one, atomically — avoids a two-step client-side update
-- (unset all, then set one) racing against a concurrent admin edit.
-- ===================================================================
create or replace function set_primary_product_image(p_product_id uuid, p_image_id uuid)
returns void as $$
begin
  if not is_admin() then
    raise exception 'not_authorized';
  end if;

  update product_images set is_primary = false where product_id = p_product_id;
  update product_images set is_primary = true where id = p_image_id and product_id = p_product_id;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function set_primary_product_image(uuid, uuid) to authenticated;

-- ===================================================================
-- orders.customer_email
--
-- Denormalized at order-creation time (from the authenticated user's
-- email) so the admin order list can search/display it without an
-- admin-API round trip per row — auth.users isn't queryable via a
-- plain join from PostgREST, and calling the admin API once per
-- order in a list would be slow.
-- ===================================================================
alter table orders add column customer_email text;

drop function if exists create_order_for_checkout(uuid, jsonb, jsonb, bigint);

create or replace function create_order_for_checkout(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_shipping_paise bigint,
  p_customer_email text default null
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
    shipping_address, customer_email
  ) values (
    v_order_id, p_user_id, 'pending_payment', v_subtotal, p_shipping_paise,
    v_subtotal + p_shipping_paise, p_shipping_address, p_customer_email
  );

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

revoke execute on function create_order_for_checkout(uuid, jsonb, jsonb, bigint, text) from public;
grant execute on function create_order_for_checkout(uuid, jsonb, jsonb, bigint, text) to service_role;

-- ===================================================================
-- admin_force_confirm_order
--
-- The ONLY way an order still in pending_payment/payment_failed can
-- become confirmed without going through real Razorpay payment
-- verification — deliberately not a plain status dropdown option.
-- Requires a non-empty reason, decrements stock the same way a real
-- payment confirmation would (so this can't be used to bypass stock
-- tracking), and writes a detailed admin_audit_log entry recording
-- the previous status and the reason, in the same transaction as the
-- status change — this is what "not without a proper audited
-- mechanism" means here: the audit record cannot be skipped or
-- omitted by a caller, because it's inside the function itself.
-- ===================================================================
create or replace function admin_force_confirm_order(p_order_id uuid, p_reason text)
returns void as $$
declare
  v_order orders%rowtype;
  v_item record;
begin
  if not is_admin() then
    raise exception 'not_authorized';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason_required';
  end if;

  select * into v_order from orders where id = p_order_id for update;

  if v_order.id is null then
    raise exception 'order_not_found';
  end if;

  if v_order.status not in ('pending_payment', 'payment_failed') then
    raise exception 'invalid_status_for_override:%', v_order.status;
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

  update orders set status = 'confirmed', placed_at = now() where id = p_order_id;

  insert into admin_audit_log (admin_id, action, entity_type, entity_id, changes)
  values (
    auth.uid(), 'order.force_confirm', 'order', p_order_id,
    jsonb_build_object('previous_status', v_order.status, 'reason', p_reason)
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function admin_force_confirm_order(uuid, text) to authenticated;
