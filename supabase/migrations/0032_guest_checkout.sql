-- Removes the account requirement from checkout entirely: customers
-- order and pay without creating an account, and nothing about them
-- is persisted beyond the order itself (name/phone/address already
-- lived only in orders.shipping_address; there was never a separate
-- "customer profile" table to begin with). Accounts still exist for
-- ADMIN use only (Supabase Auth + is_admin()), unchanged.

-- orders.user_id becomes optional: guest orders carry no user_id at
-- all. create_order_for_checkout's SQL body needs no change — it
-- already just inserts whatever p_user_id it's given.
alter table orders alter column user_id drop not null;

-- "Your own orders via login" is no longer a real concept (there is
-- no login for customers) — simplify to admin-only table access.
-- Guest access to a single order (the confirmation page) goes through
-- get_order_public()/get_order_items_public() below instead, never
-- through a blanket RLS read policy — a "just return true" policy
-- here would let anyone list every order via a bare select, not just
-- look up the one they have a link to.
drop policy "orders_select_own_or_admin" on orders;
create policy "orders_select_admin_only" on orders
  for select using (is_admin());

drop policy "order_items_select_own_or_admin" on order_items;
create policy "order_items_select_admin_only" on order_items
  for select using (is_admin());

-- Narrow, safe guest lookup: returns at most the one order/items
-- matching an exact (128-bit random, unguessable) id — unlike a
-- table-level RLS policy, a SECURITY DEFINER function's result is
-- bounded by its own SQL body, not by whatever filter a client
-- chooses to send, so this can't be turned into "list every order".
create or replace function get_order_public(p_order_id uuid)
returns setof orders
language sql
security definer
stable
set search_path = public
as $$
  select * from orders where id = p_order_id;
$$;
grant execute on function get_order_public(uuid) to anon, authenticated;

create or replace function get_order_items_public(p_order_id uuid)
returns setof order_items
language sql
security definer
stable
set search_path = public
as $$
  select * from order_items where order_id = p_order_id order by created_at asc;
$$;
grant execute on function get_order_items_public(uuid) to anon, authenticated;

-- carts/cart_items were never actually used — the real cart has
-- always been the client-side (localStorage) store in
-- lib/store/cart.ts, never synced to these tables by any app code.
-- Dropping them removes dead schema/RLS surface rather than carrying
-- it forward into a guest-checkout world where "cross-device cart"
-- isn't a coherent feature without an account anyway.
drop table if exists cart_items;
drop table if exists carts;
