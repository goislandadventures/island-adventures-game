PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  marketing_opt_in_at INTEGER,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  day INTEGER NOT NULL DEFAULT 1,
  cash INTEGER NOT NULL,
  debt INTEGER NOT NULL DEFAULT 0,
  reputation REAL NOT NULL DEFAULT 0.5,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  company_value INTEGER NOT NULL DEFAULT 0,
  lifetime_revenue INTEGER NOT NULL DEFAULT 0,
  lifetime_profit INTEGER NOT NULL DEFAULT 0,
  island_id TEXT NOT NULL,
  state_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_companies_value ON companies(company_value DESC);
CREATE INDEX IF NOT EXISTS idx_companies_reviews ON companies(review_count DESC);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating DESC, review_count DESC);
CREATE INDEX IF NOT EXISTS idx_companies_revenue ON companies(lifetime_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_companies_profit ON companies(lifetime_profit DESC);
