-- Generic updated_at maintenance, applied to every mutable table.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger trg_product_variants_updated_at before update on product_variants
  for each row execute function set_updated_at();
create trigger trg_inventory_updated_at before update on inventory
  for each row execute function set_updated_at();
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_homepage_slides_updated_at before update on homepage_slides
  for each row execute function set_updated_at();
create trigger trg_bestsellers_updated_at before update on bestsellers
  for each row execute function set_updated_at();
create trigger trg_carts_updated_at before update on carts
  for each row execute function set_updated_at();
create trigger trg_cart_items_updated_at before update on cart_items
  for each row execute function set_updated_at();
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- Auto-create a profiles row AND a default 'customer' user_roles row
-- whenever a new Supabase Auth user signs up. security definer is
-- required because this fires from the auth schema and must be able
-- to write into public tables regardless of the inserting session's
-- RLS — this is also the ONLY path that ever inserts into
-- user_roles besides a human with direct database access promoting
-- an admin; there is no client-facing way to grant a role.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Central admin check used by every RLS policy below. A `security
-- definer` function avoids the infinite-recursion trap of a
-- `user_roles` RLS policy that queries `user_roles` itself, and it
-- guarantees every table checks admin status the same trusted way
-- instead of trusting a client-supplied role claim.
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;
