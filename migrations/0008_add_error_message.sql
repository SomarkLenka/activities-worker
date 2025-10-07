-- Add error_message column to submissions table for async processing failures
ALTER TABLE submissions ADD COLUMN error_message TEXT;

-- Status values:
--   'pending' - Awaiting verification
--   'processing' - PDF generation in progress
--   'emailed' - PDFs generated and emailed successfully
--   'completed' - Legacy/dev mode completion
--   'failed' - PDF generation or email sending failed
