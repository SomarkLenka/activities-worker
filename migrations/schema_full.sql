-- =============================================================================
-- Waiver Management System - Complete Database Schema
-- =============================================================================
-- This file represents the complete database schema including all migrations
-- Generated: 2025-10-07
--
-- WARNING: Running this will DROP ALL TABLES and recreate them
-- All existing data will be lost. Use only for clean installations.
-- =============================================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS submission_activities;
DROP TABLE IF EXISTS hashes;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS risk_descriptions;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS releases;
DROP TABLE IF EXISTS submissions;

-- =============================================================================
-- Core Tables
-- =============================================================================

-- Submissions table: One row per waiver form submission
-- All submissions now require verification_token (two-step flow only)
CREATE TABLE submissions (
  submission_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  property_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  activities TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  verification_token TEXT NOT NULL UNIQUE,
  token_expires_at TEXT NOT NULL,
  completed_at TEXT
);

-- Documents table: One row per generated PDF waiver document (legacy)
CREATE TABLE documents (
  document_id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  initials TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- Hashes table: Document verification via SHA-256 hashing (legacy)
CREATE TABLE hashes (
  hash_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  hash_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

-- Submission Activities table: Activities linked to submissions via verification token
CREATE TABLE submission_activities (
  activity_id TEXT PRIMARY KEY,
  verification_token TEXT NOT NULL,
  activity_slug TEXT NOT NULL,
  activity_label TEXT NOT NULL,
  initials TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (verification_token) REFERENCES submissions(verification_token) ON DELETE CASCADE
);

-- Releases table: Versioned waiver legal text
CREATE TABLE releases (
  version TEXT PRIMARY KEY,
  release_date TEXT NOT NULL,
  waiver_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- =============================================================================
-- Configuration Tables
-- =============================================================================

-- Properties table: Stores property information
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Activities table: Stores available activities for each property
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  risk TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE (property_id, slug)
);

-- Risk descriptions table: Stores risk level descriptions
CREATE TABLE risk_descriptions (
  level TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Submissions indexes
CREATE INDEX idx_search ON submissions(guest_name, guest_email, property_id, checkin_date);
CREATE INDEX idx_submissions_token ON submissions(verification_token);
CREATE INDEX idx_submissions_status ON submissions(status);

-- Documents and hashes indexes (legacy)
CREATE INDEX idx_hashes_document_id ON hashes(document_id);
CREATE INDEX idx_hashes_hash_value ON hashes(hash_value);

-- Submission activities indexes
CREATE INDEX idx_activities_token ON submission_activities(verification_token);
CREATE INDEX idx_activities_hash ON submission_activities(document_hash);
CREATE INDEX idx_activities_activity ON submission_activities(activity_slug);

-- Releases indexes
CREATE INDEX idx_releases_date ON releases(release_date DESC);

-- Activities indexes
CREATE INDEX idx_activities_property_id ON activities(property_id);
CREATE INDEX idx_activities_slug ON activities(slug);

-- =============================================================================
-- Seed Data
-- =============================================================================

-- Insert default property (serves as template)
INSERT INTO properties (id, name, created_at)
VALUES ('default', 'Default Activity Template', datetime('now'));

-- Insert default activities template
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES
  ('default', 'archery', 'Archery', 'low', datetime('now')),
  ('default', 'kayaking', 'Kayaking', 'low', datetime('now')),
  ('default', 'ziplining', 'Ziplining', 'medium', datetime('now')),
  ('default', 'snorkeling', 'Snorkeling', 'low', datetime('now')),
  ('default', 'safari-tour', 'Safari Tour', 'low', datetime('now')),
  ('default', 'boat-tour', 'Boat Tour', 'low', datetime('now')),
  ('default', 'spelunking', 'Spelunking', 'medium', datetime('now')),
  ('default', 'scuba-diving', 'Scuba Diving', 'medium', datetime('now')),
  ('default', 'paragliding', 'Paragliding', 'high', datetime('now')),
  ('default', 'bungee-jumping', 'Bungee Jumping', 'high', datetime('now'));

-- Insert property: Riverside Cabin 12
INSERT INTO properties (id, name, created_at)
VALUES ('cabin-12', 'Riverside Cabin 12', datetime('now'));

-- Insert activities for cabin-12
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES
  ('cabin-12', 'archery', 'Archery', 'low', datetime('now')),
  ('cabin-12', 'kayaking', 'Kayaking', 'low', datetime('now')),
  ('cabin-12', 'ziplining', 'Ziplining', 'medium', datetime('now')),
  ('cabin-12', 'snorkeling', 'Snorkeling', 'low', datetime('now')),
  ('cabin-12', 'safari-tour', 'Safari Tour', 'low', datetime('now')),
  ('cabin-12', 'boat-tour', 'Boat Tour', 'low', datetime('now')),
  ('cabin-12', 'spelunking', 'Spelunking', 'medium', datetime('now')),
  ('cabin-12', 'scuba-diving', 'Scuba Diving', 'medium', datetime('now')),
  ('cabin-12', 'paragliding', 'Paragliding', 'high', datetime('now')),
  ('cabin-12', 'bungee-jumping', 'Bungee Jumping', 'high', datetime('now'));

-- Insert risk descriptions
INSERT INTO risk_descriptions (level, description, created_at) VALUES
  ('low', 'Low-risk activities with minimal physical demands and safety measures in place.', datetime('now')),
  ('medium', 'Moderate-risk activities requiring basic fitness and adherence to safety protocols.', datetime('now')),
  ('high', 'High-risk activities involving significant physical challenges, heights, or potential for injury.', datetime('now'));

-- =============================================================================
-- Schema Notes
-- =============================================================================
--
-- Table Relationships:
-- 1. submissions -> submission_activities (via verification_token)
-- 2. submissions -> documents (via submission_id) [legacy]
-- 3. documents -> hashes (via document_id) [legacy]
-- 4. properties -> activities (via property_id)
--
-- Two-step Submission Flow:
-- 1. Initial submission creates pending record with verification_token
-- 2. Email verification leads to completion with status='completed'
-- 3. Activities saved to submission_activities table
-- 4. For backward compatibility, also saved to documents/hashes tables
--
-- =============================================================================
