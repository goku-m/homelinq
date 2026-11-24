CREATE TABLE IF NOT EXISTS app_settings (
  setting_key text PRIMARY KEY,
  setting_value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_settings (setting_key, setting_value)
VALUES ('usd_to_ghs_rate', '11.69')
ON CONFLICT (setting_key) DO NOTHING;
