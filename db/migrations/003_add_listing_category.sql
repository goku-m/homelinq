ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'office'
  CHECK (category IN ('house', 'apartment', 'office', 'shop', 'land'));

CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category);
