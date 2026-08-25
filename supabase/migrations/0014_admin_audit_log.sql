-- Append-only by construction: no UPDATE/DELETE policy is ever
-- granted to any client role (see 0016_rls_policies.sql), and the
-- only INSERT path is the log_admin_action() SECURITY DEFINER
-- function (0017_rpc_checkout_functions.sql), which stamps
-- admin_id from auth.uid() itself rather than trusting a
-- client-supplied value. Even an admin session cannot edit or erase
-- a row here through the application.
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  changes jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_admin_idx on admin_audit_log (admin_id);
create index admin_audit_log_entity_idx on admin_audit_log (entity_type, entity_id);
create index admin_audit_log_created_idx on admin_audit_log (created_at desc);
