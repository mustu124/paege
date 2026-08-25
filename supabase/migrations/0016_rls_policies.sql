-- Every table has RLS enabled. Public (anon + authenticated) reads
-- are scoped to active/own rows; all writes outside of the checkout
-- RPCs and log_admin_action() (0017_rpc_checkout_functions.sql) are
-- admin-only via is_admin(). `payments`, `webhook_events`, and
-- `admin_audit_log` intentionally have NO client write policy at
-- all — payments/webhook_events are only ever touched by server code
-- using the service_role key (bypasses RLS entirely), and
-- admin_audit_log is only ever written through its logging function.

-- ---------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------
alter table categories enable row level security;

create policy "categories_public_read" on categories
  for select using (is_active = true or is_admin());

create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- products
-- ---------------------------------------------------------------
alter table products enable row level security;

create policy "products_public_read" on products
  for select using (is_active = true or is_admin());

create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------
alter table product_images enable row level security;

create policy "product_images_public_read" on product_images
  for select using (
    is_admin()
    or exists (
      select 1 from products p
      where p.id = product_images.product_id and p.is_active = true
    )
  );

create policy "product_images_admin_write" on product_images
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------
alter table product_variants enable row level security;

create policy "product_variants_public_read" on product_variants
  for select using (
    is_admin()
    or exists (
      select 1 from products p
      where p.id = product_variants.product_id and p.is_active = true
    )
  );

create policy "product_variants_admin_write" on product_variants
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- inventory — deliberately NO public read policy. Exact stock
-- counts are commercially sensitive (competitor scraping, "only 2
-- left" pressure tactics not authorized by the business) and the
-- customer-facing requirement is a STATUS ("In Stock" / "Low Stock"
-- / "Out of Stock"), not a number. The public accessor is the
-- get_product_availability() SECURITY DEFINER function
-- (0017_rpc_checkout_functions.sql), which exposes status only.
-- ---------------------------------------------------------------
alter table inventory enable row level security;

create policy "inventory_admin_read" on inventory
  for select using (is_admin());

create policy "inventory_admin_write" on inventory
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_read_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_admin_write" on profiles
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- user_roles — no client write policy of any kind, for anyone,
-- including admins. Roles are granted only by the handle_new_user()
-- trigger (customer, at signup) or direct database/service-role
-- access. This is what makes privilege escalation via a compromised
-- or buggy client request structurally impossible, not just
-- policy-guarded.
-- ---------------------------------------------------------------
alter table user_roles enable row level security;

create policy "user_roles_read_own_or_admin" on user_roles
  for select using (user_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------
-- homepage_slides
-- ---------------------------------------------------------------
alter table homepage_slides enable row level security;

create policy "homepage_slides_public_read" on homepage_slides
  for select using (is_active = true or is_admin());

create policy "homepage_slides_admin_write" on homepage_slides
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- bestsellers
-- ---------------------------------------------------------------
alter table bestsellers enable row level security;

create policy "bestsellers_public_read" on bestsellers
  for select using (
    is_admin()
    or (
      is_active = true
      and exists (select 1 from products p where p.id = bestsellers.product_id and p.is_active = true)
    )
  );

create policy "bestsellers_admin_write" on bestsellers
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- carts — a user manages their own cart directly; unlike checkout,
-- there is no stock-authority concern here (see 0011), so plain
-- ownership policies are sufficient without routing through an RPC.
-- ---------------------------------------------------------------
alter table carts enable row level security;

create policy "carts_own_or_admin_read" on carts
  for select using (user_id = auth.uid() or is_admin());

create policy "carts_own_write" on carts
  for insert with check (user_id = auth.uid());

create policy "carts_own_update" on carts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "carts_own_delete" on carts
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------
-- cart_items
-- ---------------------------------------------------------------
alter table cart_items enable row level security;

create policy "cart_items_own_or_admin_read" on cart_items
  for select using (
    is_admin()
    or exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );

create policy "cart_items_own_write" on cart_items
  for insert with check (
    exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );

create policy "cart_items_own_update" on cart_items
  for update using (
    exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );

create policy "cart_items_own_delete" on cart_items
  for delete using (
    exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );

-- ---------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------
alter table orders enable row level security;

create policy "orders_select_own_or_admin" on orders
  for select using (user_id = auth.uid() or is_admin());

-- Direct client insert is intentionally NOT granted: orders are
-- created exclusively through create_order_for_checkout() (0017),
-- which validates stock and computes prices server-side.
create policy "orders_admin_write" on orders
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------
alter table order_items enable row level security;

create policy "order_items_select_own_or_admin" on order_items
  for select using (
    is_admin()
    or exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- No client insert/update policy: rows are created only inside the
-- create_order_for_checkout() security definer RPC.
create policy "order_items_admin_write" on order_items
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------
-- payments / webhook_events: RLS enabled, zero policies.
-- Only the service_role key (which bypasses RLS) can read/write.
-- ---------------------------------------------------------------
alter table payments enable row level security;
alter table webhook_events enable row level security;

-- ---------------------------------------------------------------
-- admin_audit_log — admins can read; nobody (not even admins) can
-- write directly. See 0014_admin_audit_log.sql for the reasoning.
-- ---------------------------------------------------------------
alter table admin_audit_log enable row level security;

create policy "admin_audit_log_admin_read" on admin_audit_log
  for select using (is_admin());
