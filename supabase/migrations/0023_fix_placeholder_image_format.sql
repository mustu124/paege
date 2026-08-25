-- Corrects the demo placeholder URLs seeded in 0022: placehold.co
-- serves SVG by default, which Next.js's image optimizer rejects
-- (SVGs can carry inline scripts, so next/image blocks them unless
-- explicitly opted in — not something to disable for an external,
-- uncontrolled source). Requesting the .png format explicitly fixes
-- it without weakening that protection.
update categories
  set image_storage_path = replace(image_storage_path, '?text=', '.png?text=')
  where image_storage_path like 'https://placehold.co/%'
    and image_storage_path not like '%.png%';

update homepage_slides
  set desktop_image_path = replace(desktop_image_path, '?text=', '.png?text=')
  where desktop_image_path like 'https://placehold.co/%'
    and desktop_image_path not like '%.png%';

update homepage_slides
  set mobile_image_path = replace(mobile_image_path, '?text=', '.png?text=')
  where mobile_image_path like 'https://placehold.co/%'
    and mobile_image_path not like '%.png%';
