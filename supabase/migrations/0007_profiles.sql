-- Personal/contact info only. Authorization role lives in user_roles
-- (0008_user_roles.sql) — kept as a separate table, not a column
-- here, specifically so a compromised or buggy profile-update path
-- can never touch authorization state, and so a user can never
-- update their own role through the same RLS policy that lets them
-- edit their name/phone.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
