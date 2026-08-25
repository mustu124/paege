-- Categories are real, admin-managed rows so the catalogue can grow
-- (e.g. Jumpsuits) without any code change. "All" and "New Arrivals"
-- are UI-only pseudo-filters and are never inserted as rows here.
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_active_order_idx on categories (is_active, display_order);
