-- Placeholder content so the customer-facing UI has something real
-- to render and be verified against before the admin panel (Phase 4)
-- or real photography exist. Every value here is trivially
-- replaceable later: image paths through the admin panel once it
-- ships, or directly via SQL/dashboard now.

-- ---------------------------------------------------------------
-- Category tile images (distinct placeholder per category so the
-- homepage "Shop Collections" grid is visually distinguishable).
-- ---------------------------------------------------------------
update categories set image_storage_path = 'https://placehold.co/800x1000/6b1f2a/f7f3ec?text=Dresses' where slug = 'dresses';
update categories set image_storage_path = 'https://placehold.co/800x1000/e2d9c8/262220?text=Tops' where slug = 'tops';
update categories set image_storage_path = 'https://placehold.co/800x1000/1c1917/f7f3ec?text=Bottoms' where slug = 'bottoms';
update categories set image_storage_path = 'https://placehold.co/800x1000/f1ebe0/262220?text=Jumpsuits' where slug = 'jumpsuits';

-- ---------------------------------------------------------------
-- Homepage hero carousel: exactly 5 slides, desktop (1920x800
-- landscape) and mobile (750x1000 portrait) images configured
-- independently — not a CSS crop of one image.
-- ---------------------------------------------------------------
insert into homepage_slides (title, subtitle, desktop_image_path, mobile_image_path, link_url, cta_label, display_order, is_active) values
  ('The Dresses Edit', 'Cotton poplin, cut for movement',
   'https://placehold.co/1920x800/6b1f2a/f7f3ec?text=PAEGE',
   'https://placehold.co/750x1000/6b1f2a/f7f3ec?text=PAEGE',
   '/shop?category=dresses', 'Shop Dresses', 1, true),
  ('New Arrivals', 'Just landed',
   'https://placehold.co/1920x800/1c1917/f7f3ec?text=PAEGE',
   'https://placehold.co/750x1000/1c1917/f7f3ec?text=PAEGE',
   '/shop?filter=new-arrivals', 'Shop New Arrivals', 2, true),
  ('Tops, Reimagined', 'Linen blends for warmer days',
   'https://placehold.co/1920x800/e2d9c8/262220?text=PAEGE',
   'https://placehold.co/750x1000/e2d9c8/262220?text=PAEGE',
   '/shop?category=tops', 'Shop Tops', 3, true),
  ('Wide-Leg Silhouettes', 'Introducing Margot',
   'https://placehold.co/1920x800/5e1a24/f7f3ec?text=PAEGE',
   'https://placehold.co/750x1000/5e1a24/f7f3ec?text=PAEGE',
   '/shop?category=jumpsuits', 'Shop Jumpsuits', 4, true),
  ('The Bestsellers', 'Loved, worn, repeated',
   'https://placehold.co/1920x800/f1ebe0/262220?text=PAEGE',
   'https://placehold.co/750x1000/f1ebe0/262220?text=PAEGE',
   '/shop?filter=bestsellers', 'Shop Bestsellers', 5, true);

-- ---------------------------------------------------------------
-- Demo bestseller / new-arrival flags so the homepage rails have
-- something to show. Reassign freely later via the admin panel.
-- ---------------------------------------------------------------
update products set is_bestseller = true where slug in ('scarlet', 'blossom');
update products set is_new_arrival = true where slug in ('softwave', 'margot');

insert into bestsellers (product_id, display_order)
select id, row_number() over (order by name) from products where slug in ('scarlet', 'blossom')
on conflict (product_id) do nothing;
