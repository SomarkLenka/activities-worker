-- Complete database schema backup
-- Generated from production database schema
-- This file represents the current state of the database

-- =====================================================
-- Submissions Table
-- =====================================================
-- Stores waiver submission metadata
CREATE TABLE IF NOT EXISTS submissions (
  submission_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  property_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  activities TEXT NOT NULL
);

-- =====================================================
-- Documents Table
-- =====================================================
-- Stores individual waiver documents (one per activity per submission)
CREATE TABLE IF NOT EXISTS documents (
  document_id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  initials TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- =====================================================
-- Hashes Table
-- =====================================================
-- Stores cryptographic hashes for document integrity verification
CREATE TABLE IF NOT EXISTS hashes (
  hash_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  hash_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

-- Index for faster hash lookups
CREATE INDEX IF NOT EXISTS idx_hashes_document_id ON hashes(document_id);
CREATE INDEX IF NOT EXISTS idx_hashes_hash_value ON hashes(hash_value);

-- =====================================================
-- Releases Table
-- =====================================================
-- Stores versioned legal waiver text
CREATE TABLE IF NOT EXISTS releases (
  version TEXT PRIMARY KEY,
  release_date TEXT NOT NULL,
  waiver_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Index for faster release lookups by date
CREATE INDEX IF NOT EXISTS idx_releases_date ON releases(release_date DESC);

-- =====================================================
-- Notes
-- =====================================================
-- 1. All text IDs use nanoid for generation
-- 2. Foreign keys cascade on delete to maintain referential integrity
-- 3. Hash values are SHA-256 hashes of document metadata
-- 4. Release versions follow semantic versioning (X.Y.Z)
-- 5. Timestamps are stored as ISO 8601 strings
