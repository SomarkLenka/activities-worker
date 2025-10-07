-- Add status and verification fields to submissions table
-- Migration to support two-step submission process with email verification

ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE submissions ADD COLUMN verification_token TEXT;
ALTER TABLE submissions ADD COLUMN token_expires_at TEXT;
ALTER TABLE submissions ADD COLUMN completed_at TEXT;

CREATE INDEX idx_submissions_token ON submissions(verification_token);
CREATE INDEX idx_submissions_status ON submissions(status);
