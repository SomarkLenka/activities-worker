-- Restructure submissions to separate activities into their own table
-- Migration to support cleaner data structure with activities as separate records

-- Create new submission_activities table
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

-- Create indexes for performance
CREATE INDEX idx_activities_token ON submission_activities(verification_token);
CREATE INDEX idx_activities_hash ON submission_activities(document_hash);
CREATE INDEX idx_activities_activity ON submission_activities(activity_slug);

-- Note: The existing submissions table already has verification_token from migration 0004
-- We will keep the 'activities' column for backward compatibility during transition
-- but new code should use the submission_activities table instead
