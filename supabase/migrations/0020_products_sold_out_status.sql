-- Bulk companion to get_product_availability() (0017): a product
-- listing page needs to know, for many products at once, whether
-- each is fully sold out (every variant at 0) so the grid can show
-- a "Sold Out" badge without an N+1 query per card or exposing any
-- raw quantity.
create or replace function get_products_sold_out_status(p_product_ids uuid[])
returns table (product_id uuid, is_sold_out boolean)
language sql
security definer
stable
set search_path = public
as $$
  select
    pv.product_id,
    bool_and(i.quantity = 0) as is_sold_out
  from product_variants pv
  join inventory i on i.variant_id = pv.id
  where pv.product_id = any(p_product_ids)
  group by pv.product_id;
$$;

grant execute on function get_products_sold_out_status(uuid[]) to anon, authenticated;
