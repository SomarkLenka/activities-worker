-- Add legal releases table for versioned waiver text

CREATE TABLE releases (
  version TEXT PRIMARY KEY,
  release_date TEXT NOT NULL,
  waiver_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_releases_date ON releases(release_date DESC);
