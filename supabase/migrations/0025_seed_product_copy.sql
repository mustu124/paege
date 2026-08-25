-- Descriptions and wash-care copy transcribed verbatim from the
-- PRODUCT DETAIL GUIDANCE document (previously unavailable, so
-- these columns were left NULL in 0019). wash_care_instructions is
-- stored as one instruction per line.
--
-- Margot's fabric was not given as a labeled "Fabric:" field in the
-- document (unlike the other four products), but its description
-- explicitly states "a fluid satin finish" — that's the document
-- providing the information in prose rather than a bullet, not an
-- invented value, so it's recorded here.

update products set
  description = 'A statement mini dress crafted in crisp cotton poplin, featuring a gathered neckline, defined waist and voluminous sleeves. Designed with a flattering flared silhouette for an effortless yet elevated look.',
  wash_care_instructions = 'Hand wash or gentle machine wash
Wash with similar colours
Do not bleach'
where slug = 'scarlet';

update products set
  description = 'A feminine mini dress featuring a softly gathered neckline, puff sleeves and a defined waist. Cut in a lightweight cotton-rayon blend, it falls into an easy, flattering silhouette made for effortless everyday dressing.',
  wash_care_instructions = 'Hand wash or gentle machine wash
Wash with similar colours
Use mild detergent
Do not bleach'
where slug = 'noir';

update products set
  description = 'A playful gingham maxi dress featuring a flattering halter neckline and a fitted bodice that flows into a full, feminine skirt. Crafted in cotton, it''s an effortless statement piece made for sunny days and slow moments.',
  wash_care_instructions = 'Hand wash or gentle machine wash
Wash with similar colours
Use mild detergent
Do not bleach'
where slug = 'blossom';

update products set
  description = 'A refined everyday top featuring a softly structured square neckline, delicate shoulder ties and a flattering fitted silhouette. Crafted in a lightweight linen blend, it pairs effortlessly with everything from denim to tailored bottoms.',
  wash_care_instructions = 'Hand wash or gentle machine wash
Wash with similar colours
Use mild detergent
Do not bleach'
where slug = 'softwave';

update products set
  description = 'A statement polka-dot jumpsuit featuring a strapless neckline and a fitted bodice that flows into relaxed wide-leg trousers. Designed in a fluid satin finish, it brings an effortless yet playful edge to your wardrobe.',
  fabric = 'Satin',
  wash_care_instructions = 'Hand wash or gentle machine wash
Wash inside out with similar colours
Use mild detergent
Do not bleach'
where slug = 'margot';
