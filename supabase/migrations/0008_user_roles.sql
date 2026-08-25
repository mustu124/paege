-- Separate roles table (rather than a role column on profiles) is
-- the single source of truth every RLS policy and admin check reads
-- through the is_admin() function (0015_functions_triggers.sql).
-- Structuring it this way means: no client write policy ever exists
-- on this table (see 0016_rls_policies.sql) — the only way a role
-- is ever granted is the handle_new_user() trigger (customer, at
-- signup) or a human with direct database/service-role access
-- promoting an admin. A client can never elevate its own role,
-- because there is no code path that lets it write here at all.
create type app_role as enum ('customer', 'admin');

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index user_roles_user_idx on user_roles (user_id);
