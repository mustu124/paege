-- order_items previously snapshotted product_name/size/price at
-- purchase time but not an image, so every order confirmation and
-- account order-history page always rendered the generic placeholder
-- for every line item, forever — not because no image existed, but
-- because nothing was ever captured to point back to one. Adds the
-- same snapshot treatment used for name/size/price: the product's
-- primary image path at the moment of purchase, so it stays correct
-- even if the product's images are later changed, reordered, or the
-- product itself is archived/deleted.
alter table order_items add column primary_image_path text;

drop function if exists create_order_for_checkout(uuid, jsonb, jsonb, bigint, text);

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
  v_image_path text;
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

    select storage_path into v_image_path from product_images
      where product_id = v_product.id
      order by is_primary desc, display_order asc
      limit 1;

    insert into order_items (
      order_id, product_id, variant_id, product_name, size,
      unit_price_paise, quantity, line_total_paise, primary_image_path
    ) values (
      v_order_id, v_product.id, v_variant.id, v_product.name, v_variant.size,
      v_unit_price, (v_item ->> 'quantity')::int, v_unit_price * (v_item ->> 'quantity')::int,
      v_image_path
    );
  end loop;

  return v_order_id;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function create_order_for_checkout(uuid, jsonb, jsonb, bigint, text) from public;
grant execute on function create_order_for_checkout(uuid, jsonb, jsonb, bigint, text) to service_role;
