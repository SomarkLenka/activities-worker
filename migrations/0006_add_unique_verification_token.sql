-- Add UNIQUE constraint to verification_token for foreign key relationship
-- This migration fixes the foreign key mismatch error with submission_activities

-- SQLite doesn't support ALTER TABLE ADD CONSTRAINT for UNIQUE
-- We need to create a unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_verification_token_unique
ON submissions(verification_token)
WHERE verification_token IS NOT NULL;
