-- Default Activities Template
-- Migration to store default activity template in database (previously in KV as template:default-activities)

-- Create template activities table
CREATE TABLE IF NOT EXISTS template_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  risk TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Insert default activities template from KV store
INSERT INTO template_activities (slug, label, risk, created_at) VALUES
  ('archery', 'Archery', 'low', datetime('now')),
  ('kayaking', 'Kayaking', 'low', datetime('now')),
  ('ziplining', 'Ziplining', 'medium', datetime('now')),
  ('snorkeling', 'Snorkeling', 'low', datetime('now')),
  ('safari-tour', 'Safari Tour', 'low', datetime('now')),
  ('boat-tour', 'Boat Tour', 'low', datetime('now')),
  ('spelunking', 'Spelunking', 'medium', datetime('now')),
  ('scuba-diving', 'Scuba Diving', 'medium', datetime('now')),
  ('paragliding', 'Paragliding', 'high', datetime('now')),
  ('bungee-jumping', 'Bungee Jumping', 'high', datetime('now'));

-- Create index for performance
CREATE INDEX idx_template_activities_slug ON template_activities(slug);
