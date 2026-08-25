-- Aligns order/payment status vocabulary with the shopping-flow spec.
--
-- orders.status: 'paid' -> 'confirmed' (matches the requested
-- pending_payment/confirmed/processing/shipped/delivered/cancelled/
-- payment_failed set exactly).
--
-- payments.status: adds 'pending' (a real Razorpay payment state —
-- initiated but not yet settled, relevant for methods like UPI
-- collect). Keeps 'captured' rather than renaming to 'paid': this
-- table mirrors Razorpay's own payment vocabulary verbatim (Razorpay
-- itself reports created/authorized/captured/failed/refunded), which
-- is more correct for a table whose whole purpose is recording what
-- the gateway actually reported — and avoids a confusing near-clash
-- with orders.status = 'confirmed', a different concept (fulfillment
-- stage vs. raw gateway state).

alter table orders drop constraint orders_status_check;
alter table orders add constraint orders_status_check
  check (status in (
    'pending_payment', 'confirmed', 'processing', 'shipped',
    'delivered', 'cancelled', 'payment_failed'
  ));
update orders set status = 'confirmed' where status = 'paid';

alter table payments drop constraint payments_status_check;
alter table payments add constraint payments_status_check
  check (status in ('created', 'pending', 'authorized', 'captured', 'failed', 'refunded'));

-- confirm_paid_order now flips orders.status to 'confirmed' instead
-- of 'paid'. Recreated in full since only the two literal status
-- values inside the function body change.
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

  if v_order.status = 'confirmed' then
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

  update orders set status = 'confirmed', placed_at = now() where id = p_order_id;

  insert into payments (
    order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
    status, amount_paise, processed_at
  ) values (
    p_order_id, v_order.razorpay_order_id, p_razorpay_payment_id, p_razorpay_signature,
    'captured', p_amount_paise, now()
  );

  return query select false, 'confirmed';
end;
$$ language plpgsql security definer set search_path = public;
