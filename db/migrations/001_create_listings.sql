CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  listing_type text NOT NULL CHECK (listing_type IN ('Rent', 'Sale', 'Lease')),
  price_type text NOT NULL CHECK (price_type IN ('Rent', 'Sale', 'Lease')),
  price text NOT NULL,
  price_range text NOT NULL DEFAULT 'Per month' CHECK (price_range IN ('Per Day', 'Per week', 'Per month')),
  location text NOT NULL,
  details text NOT NULL,
  availability text NOT NULL CHECK (availability IN ('available', 'not available')),
  bedrooms integer NOT NULL DEFAULT 0,
  showers integer NOT NULL DEFAULT 0,
  garage integer NOT NULL DEFAULT 0,
  furnished text NOT NULL,
  commission text NOT NULL,
  registration_fee text NOT NULL,
  image text NOT NULL,
  gallery text[] NOT NULL DEFAULT '{}',
  lease_options text[] NOT NULL DEFAULT '{}',
  amenities text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_featured_idx ON listings (featured);
CREATE INDEX IF NOT EXISTS listings_listing_type_idx ON listings (listing_type);
CREATE INDEX IF NOT EXISTS listings_location_idx ON listings (location);
