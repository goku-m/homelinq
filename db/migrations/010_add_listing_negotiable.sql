ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS negotiable boolean NOT NULL DEFAULT false;
