-- Recreate submission_activities table with proper foreign key after UNIQUE constraint added
-- This fixes the foreign key mismatch error

-- Drop and recreate the table to pick up the new UNIQUE constraint
DROP TABLE IF EXISTS submission_activities;

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

-- Recreate indexes
CREATE INDEX idx_activities_token ON submission_activities(verification_token);
CREATE INDEX idx_activities_hash ON submission_activities(document_hash);
CREATE INDEX idx_activities_activity ON submission_activities(activity_slug);
