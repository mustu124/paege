-- Seeds real category rows to prove the catalogue is fully dynamic.
-- "All" and "New Arrivals" are deliberately absent here — they are
-- UI-only pseudo-filters handled in the application query layer,
-- not database rows. Admins can add/rename/deactivate categories
-- (e.g. this is where "Jumpsuits" lives) without any code change.
insert into categories (name, slug, display_order) values
  ('Dresses', 'dresses', 1),
  ('Tops', 'tops', 2),
  ('Bottoms', 'bottoms', 3),
  ('Jumpsuits', 'jumpsuits', 4)
on conflict (slug) do nothing;
