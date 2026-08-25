-- Small generic key/value store for lightweight site-wide config —
-- currently just the Bestsellers rail's max display count, but
-- structured to hold future single-value settings without a new
-- table each time.
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();

alter table site_settings enable row level security;

create policy "site_settings_public_read" on site_settings
  for select using (true);

create policy "site_settings_admin_write" on site_settings
  for all using (is_admin()) with check (is_admin());

insert into site_settings (key, value) values ('bestsellers_display_count', '4');
