ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS price_range text NOT NULL DEFAULT 'Per month';

ALTER TABLE listings
  DROP CONSTRAINT IF EXISTS listings_price_range_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_price_range_check
  CHECK (price_range IN ('Per Day', 'Per week', 'Per month'));
