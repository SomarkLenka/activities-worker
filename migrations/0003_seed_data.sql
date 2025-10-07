-- Migration data from KV store to D1 database
-- Generated: 2025-10-07T04:32:06.088Z

-- Insert property
INSERT INTO properties (id, name, created_at) VALUES ('cabin-12', 'Riverside Cabin 12', '2025-10-07T04:32:06.088Z');

-- Insert activities
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'archery', 'Archery', 'low', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'kayaking', 'Kayaking', 'low', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'ziplining', 'Ziplining', 'medium', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'snorkeling', 'Snorkeling', 'low', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'safari-tour', 'Safari Tour', 'low', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'boat-tour', 'Boat Tour', 'low', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'spelunking', 'Spelunking', 'medium', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'scuba-diving', 'Scuba Diving', 'medium', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'paragliding', 'Paragliding', 'high', '2025-10-07T04:32:06.088Z');
INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('cabin-12', 'bungee-jumping', 'Bungee Jumping', 'high', '2025-10-07T04:32:06.088Z');

-- Insert risk descriptions
INSERT INTO risk_descriptions (level, description, created_at) VALUES ('low', 'Low-risk activities with minimal physical demands and safety measures in place.', '2025-10-07T04:32:06.088Z');
INSERT INTO risk_descriptions (level, description, created_at) VALUES ('medium', 'Moderate-risk activities requiring basic fitness and adherence to safety protocols.', '2025-10-07T04:32:06.088Z');
INSERT INTO risk_descriptions (level, description, created_at) VALUES ('high', 'High-risk activities involving significant physical challenges, heights, or potential for injury.', '2025-10-07T04:32:06.088Z');
