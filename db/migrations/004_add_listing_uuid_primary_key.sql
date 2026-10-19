CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE listings
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE listings
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE listing_views
  ADD COLUMN IF NOT EXISTS listing_id uuid;

UPDATE listing_views
SET listing_id = listings.id
FROM listings
WHERE listing_views.listing_slug = listings.slug
  AND listing_views.listing_id IS NULL;

ALTER TABLE listing_leads
  ADD COLUMN IF NOT EXISTS listing_id uuid;

UPDATE listing_leads
SET listing_id = listings.id
FROM listings
WHERE listing_leads.listing_slug = listings.slug
  AND listing_leads.listing_id IS NULL;

ALTER TABLE listing_views
  ALTER COLUMN listing_id SET NOT NULL;

ALTER TABLE listing_leads
  ALTER COLUMN listing_id SET NOT NULL;

ALTER TABLE listing_views
  DROP CONSTRAINT IF EXISTS listing_views_listing_slug_fkey;

ALTER TABLE listing_leads
  DROP CONSTRAINT IF EXISTS listing_leads_listing_slug_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'listings'::regclass
      AND conname = 'listings_pkey'
      AND contype = 'p'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT listings_pkey;
  END IF;
END $$;

ALTER TABLE listings
  ADD CONSTRAINT listings_pkey PRIMARY KEY (id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'listings'::regclass
      AND conname = 'listings_slug_key'
  ) THEN
    ALTER TABLE listings ADD CONSTRAINT listings_slug_key UNIQUE (slug);
  END IF;
END $$;

ALTER TABLE listing_views
  ADD CONSTRAINT listing_views_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE;

ALTER TABLE listing_leads
  ADD CONSTRAINT listing_leads_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS listing_views_listing_id_idx
  ON listing_views (listing_id);

CREATE INDEX IF NOT EXISTS listing_leads_listing_id_idx
  ON listing_leads (listing_id);
