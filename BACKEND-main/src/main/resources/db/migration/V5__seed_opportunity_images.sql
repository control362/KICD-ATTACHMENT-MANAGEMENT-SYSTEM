-- Backfill existing opportunities with a generated image URL
UPDATE opportunities
SET image_url = '/kicd_professional_growth.png'
WHERE image_url IS NULL;
