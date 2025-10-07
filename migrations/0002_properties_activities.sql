-- Properties and Activities Configuration Tables
-- Migration to replace KV storage with D1 database

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

-- Indexes for performance
CREATE INDEX idx_activities_property_id ON activities(property_id);
CREATE INDEX idx_activities_slug ON activities(slug);
