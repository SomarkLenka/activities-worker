-- Default Activities Template
-- Migration to store default activity template in database
-- Uses a special "default" property that holds the template activities

-- Insert default property (serves as template)
INSERT OR IGNORE INTO properties (id, name, created_at)
VALUES ('default', 'Default Activity Template', datetime('now'));

-- Insert default activities template from KV store (template:default-activities)
-- These activities are linked to the 'default' property
INSERT OR IGNORE INTO activities (property_id, slug, label, risk, created_at) VALUES
  ('default', 'archery', 'Archery', 'low', datetime('now')),
  ('default', 'kayaking', 'Kayaking', 'low', datetime('now')),
  ('default', 'ziplining', 'Ziplining', 'medium', datetime('now')),
  ('default', 'snorkeling', 'Snorkeling', 'low', datetime('now')),
  ('default', 'safari-tour', 'Safari Tour', 'low', datetime('now')),
  ('default', 'boat-tour', 'Boat Tour', 'low', datetime('now')),
  ('default', 'spelunking', 'Spelunking', 'medium', datetime('now')),
  ('default', 'scuba-diving', 'Scuba Diving', 'medium', datetime('now')),
  ('default', 'paragliding', 'Paragliding', 'high', datetime('now')),
  ('default', 'bungee-jumping', 'Bungee Jumping', 'high', datetime('now'));
