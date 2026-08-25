-- Adds low_stock_quantity to get_product_availability's result: the
-- exact count IS revealed, but only when status = 'low_stock' (i.e.
-- only ever 1..low_stock_threshold, currently 2) — the status itself
-- already implicitly tells the client "this is 1 or 2 units", so
-- surfacing the exact small number doesn't meaningfully change what
-- competitive intelligence is exposed, while it lets the product
-- page cap the quantity selector precisely and show "Only N left"
-- messaging. in_stock quantities remain completely hidden, as
-- before — that number is never necessary for correct UX and the
-- checkout RPC is the real stock-authority regardless of what the
-- client is shown here.
--
-- CREATE OR REPLACE can't change a RETURNS TABLE shape, so this
-- drops and recreates.
drop function if exists get_product_availability(uuid);

create or replace function get_product_availability(p_product_id uuid)
returns table (variant_id uuid, size text, status text, low_stock_quantity int)
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
    end,
    case when i.quantity > 0 and i.quantity <= i.low_stock_threshold then i.quantity else null end
  from product_variants pv
  join inventory i on i.variant_id = pv.id
  where pv.product_id = p_product_id;
$$;

grant execute on function get_product_availability(uuid) to anon, authenticated;
