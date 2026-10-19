CREATE TABLE IF NOT EXISTS listing_views (
  id text PRIMARY KEY,
  listing_slug text NOT NULL REFERENCES listings (slug) ON DELETE CASCADE,
  session_id text,
  referrer text,
  user_agent text,
  duration_seconds integer NOT NULL DEFAULT 0,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_views_listing_slug_idx
  ON listing_views (listing_slug);

CREATE INDEX IF NOT EXISTS listing_views_viewed_at_idx
  ON listing_views (viewed_at);

CREATE TABLE IF NOT EXISTS listing_leads (
  id bigserial PRIMARY KEY,
  listing_slug text NOT NULL REFERENCES listings (slug) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('phone', 'email', 'whatsapp')),
  session_id text,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_leads_listing_slug_idx
  ON listing_leads (listing_slug);

CREATE INDEX IF NOT EXISTS listing_leads_created_at_idx
  ON listing_leads (created_at);
