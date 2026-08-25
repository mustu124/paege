-- Seeds the current product catalogue exactly as specified: name,
-- category, type, colour, fabric (where given), sizes, and price
-- only. `description`, `short_description`, and
-- `wash_care_instructions` are left NULL — that copy was not
-- supplied, and inventing brand/care copy is explicitly out of
-- scope. Fill them in later with:
--   update products set description = '...', wash_care_instructions = '...' where slug = '...';
--
-- No product_images rows are seeded: no real photography exists yet,
-- and the storefront already falls back to a placeholder graphic
-- (lib/storage.ts) when a product has no primary image, so there's
-- no need for a placeholder row pointing at a nonexistent storage
-- path. Upload real images and insert product_images rows once they
-- exist (Phase 4 admin panel, or directly via SQL/dashboard).
--
-- Stock quantities (10 per size) are operational placeholders, not
-- product specifications — adjust via the admin panel once real
-- inventory counts are known.

-- ---------------------------------------------------------------
-- SCARLET — Dresses / Mini Dress / Red / Cotton Poplin / XS-L / ₹1,500
-- ---------------------------------------------------------------
with product as (
  insert into products (category_id, name, slug, product_type, colour, fabric, price_paise, is_active)
  select id, 'Scarlet', 'scarlet', 'Mini Dress', 'Red', 'Cotton Poplin', 150000, true
  from categories where slug = 'dresses'
  returning id
),
variants as (
  insert into product_variants (product_id, size, sku)
  select product.id, size, 'PAEGE-SCARLET-' || size
  from product, unnest(array['XS', 'S', 'M', 'L']) as size
  returning id
)
insert into inventory (variant_id, quantity)
select id, 10 from variants;

-- ---------------------------------------------------------------
-- NOIR — Dresses / Mini Dress / Black / Cotton Rayon Blend / XS-L / ₹1,000
-- ---------------------------------------------------------------
with product as (
  insert into products (category_id, name, slug, product_type, colour, fabric, price_paise, is_active)
  select id, 'Noir', 'noir', 'Mini Dress', 'Black', 'Cotton Rayon Blend', 100000, true
  from categories where slug = 'dresses'
  returning id
),
variants as (
  insert into product_variants (product_id, size, sku)
  select product.id, size, 'PAEGE-NOIR-' || size
  from product, unnest(array['XS', 'S', 'M', 'L']) as size
  returning id
)
insert into inventory (variant_id, quantity)
select id, 10 from variants;

-- ---------------------------------------------------------------
-- BLOSSOM — Dresses / Maxi Dress / Pink & White Gingham / Cotton / XS-L / ₹1,800
-- ---------------------------------------------------------------
with product as (
  insert into products (category_id, name, slug, product_type, colour, fabric, price_paise, is_active)
  select id, 'Blossom', 'blossom', 'Maxi Dress', 'Pink & White Gingham', 'Cotton', 180000, true
  from categories where slug = 'dresses'
  returning id
),
variants as (
  insert into product_variants (product_id, size, sku)
  select product.id, size, 'PAEGE-BLOSSOM-' || size
  from product, unnest(array['XS', 'S', 'M', 'L']) as size
  returning id
)
insert into inventory (variant_id, quantity)
select id, 10 from variants;

-- ---------------------------------------------------------------
-- SOFTWAVE — Tops / Tie-Shoulder Top / Ivory / Linen Blend / XS-XL / ₹1,000
-- ---------------------------------------------------------------
with product as (
  insert into products (category_id, name, slug, product_type, colour, fabric, price_paise, is_active)
  select id, 'Softwave', 'softwave', 'Tie-Shoulder Top', 'Ivory', 'Linen Blend', 100000, true
  from categories where slug = 'tops'
  returning id
),
variants as (
  insert into product_variants (product_id, size, sku)
  select product.id, size, 'PAEGE-SOFTWAVE-' || size
  from product, unnest(array['XS', 'S', 'M', 'L', 'XL']) as size
  returning id
)
insert into inventory (variant_id, quantity)
select id, 10 from variants;

-- ---------------------------------------------------------------
-- MARGOT — Jumpsuits / Wide-Leg Jumpsuit / White & Black / XS-M / ₹1,000
-- Fabric not specified in source material — left NULL rather than
-- guessed.
-- ---------------------------------------------------------------
with product as (
  insert into products (category_id, name, slug, product_type, colour, price_paise, is_active)
  select id, 'Margot', 'margot', 'Wide-Leg Jumpsuit', 'White & Black', 100000, true
  from categories where slug = 'jumpsuits'
  returning id
),
variants as (
  insert into product_variants (product_id, size, sku)
  select product.id, size, 'PAEGE-MARGOT-' || size
  from product, unnest(array['XS', 'S', 'M']) as size
  returning id
)
insert into inventory (variant_id, quantity)
select id, 10 from variants;
