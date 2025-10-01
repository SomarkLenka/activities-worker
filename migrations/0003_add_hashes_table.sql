-- Create hashes table for document verification

CREATE TABLE hashes (
  hash_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  hash_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

CREATE INDEX idx_hashes_document_id ON hashes(document_id);
CREATE INDEX idx_hashes_hash_value ON hashes(hash_value);
