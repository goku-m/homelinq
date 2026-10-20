ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS panoramas jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE listings
  DROP CONSTRAINT IF EXISTS listings_panoramas_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_panoramas_check
  CHECK (jsonb_typeof(panoramas) = 'array');
