-- Rename id columns and add foreign key constraint

-- Step 1: Create new tables with the correct schema
CREATE TABLE submissions_new (
  submission_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  property_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  activities TEXT NOT NULL
);

CREATE TABLE documents_new (
  document_id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions_new(submission_id) ON DELETE CASCADE
);

-- Step 2: Copy data from old tables to new tables
INSERT INTO submissions_new (submission_id, created_at, property_id, checkin_date, guest_name, guest_email, activities)
SELECT id, created_at, property_id, checkin_date, guest_name, guest_email, activities
FROM submissions;

INSERT INTO documents_new (document_id, submission_id, activity, r2_key)
SELECT id, submission_id, activity, r2_key
FROM documents;

-- Step 3: Drop old tables
DROP TABLE documents;
DROP TABLE submissions;

-- Step 4: Rename new tables to original names
ALTER TABLE submissions_new RENAME TO submissions;
ALTER TABLE documents_new RENAME TO documents;
