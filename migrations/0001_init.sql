-- One row per form submission
CREATE TABLE submissions (
  id           TEXT PRIMARY KEY,
  created_at   TEXT,
  property_id  TEXT,
  checkin_date TEXT,
  guest_name   TEXT,
  guest_email  TEXT,
  activities   TEXT     -- JSON array of slugs
);

-- One row per generated PDF
CREATE TABLE documents (
  id            TEXT PRIMARY KEY,
  submission_id TEXT,
  activity      TEXT,
  r2_key        TEXT,
  FOREIGN KEY(submission_id) REFERENCES submissions(id)
);

CREATE INDEX idx_search
  ON submissions(guest_name, guest_email, property_id, checkin_date);
