-- Waiver Management System Database Schema

-- Submissions table: One row per waiver form submission
CREATE TABLE submissions (
  submission_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  property_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  activities TEXT NOT NULL
);

-- Documents table: One row per generated PDF waiver document
CREATE TABLE documents (
  document_id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  initials TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- Hashes table: Document verification via SHA-256 hashing
CREATE TABLE hashes (
  hash_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  hash_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

-- Releases table: Versioned waiver legal text
CREATE TABLE releases (
  version TEXT PRIMARY KEY,
  release_date TEXT NOT NULL,
  waiver_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_search ON submissions(guest_name, guest_email, property_id, checkin_date);
CREATE INDEX idx_hashes_document_id ON hashes(document_id);
CREATE INDEX idx_hashes_hash_value ON hashes(hash_value);
CREATE INDEX idx_releases_date ON releases(release_date DESC);
