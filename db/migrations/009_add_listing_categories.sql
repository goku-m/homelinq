ALTER TABLE listings
  DROP CONSTRAINT IF EXISTS listings_category_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_category_check
  CHECK (
    category IN (
      'house',
      'apartment',
      'office',
      'shop',
      'land',
      'townhouse',
      'warehouse',
      'commercial-space',
      'beachhouse'
    )
  );
