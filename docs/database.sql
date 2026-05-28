-- Optional production database schema for AI Roast My Profile.
-- The Express server also creates this table automatically when DATABASE_URL is set.

CREATE TABLE IF NOT EXISTS roasts (
  id TEXT PRIMARY KEY,
  raw_input TEXT NOT NULL,
  roast_style TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_count INTEGER NOT NULL DEFAULT 0,
  public_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  delete_token_hash TEXT
);

CREATE INDEX IF NOT EXISTS roasts_public_created_at_idx
  ON roasts (public_opt_in, created_at DESC);
