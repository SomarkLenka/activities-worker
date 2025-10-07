// Migration script to move KV data to D1 database
// Run with: node scripts/migrate-kv-to-db.js

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read KV data from production
// Fetched with: wrangler kv key get --namespace-id=aec4d5d52a9e41d6925a94a1d1b27207 props
const kvData = {
  "id": "cabin-12",
  "name": "Riverside Cabin 12",
  "activities": [
    { "slug": "archery", "label": "Archery", "risk": "low" },
    { "slug": "kayaking", "label": "Kayaking", "risk": "low" },
    { "slug": "ziplining", "label": "Ziplining", "risk": "medium" },
    { "slug": "snorkeling", "label": "Snorkeling", "risk": "low" },
    { "slug": "safari-tour", "label": "Safari Tour", "risk": "low" },
    { "slug": "boat-tour", "label": "Boat Tour", "risk": "low" },
    { "slug": "spelunking", "label": "Spelunking", "risk": "medium" },
    { "slug": "scuba-diving", "label": "Scuba Diving", "risk": "medium" },
    { "slug": "paragliding", "label": "Paragliding", "risk": "high" },
    { "slug": "bungee-jumping", "label": "Bungee Jumping", "risk": "high" }
  ]
};

// Risk descriptions (fetch from KV if you have them)
const riskDescriptions = {
  "low": {
    "description": "Low-risk activities with minimal physical demands and safety measures in place."
  },
  "medium": {
    "description": "Moderate-risk activities requiring basic fitness and adherence to safety protocols."
  },
  "high": {
    "description": "High-risk activities involving significant physical challenges, heights, or potential for injury."
  }
};

// Generate SQL statements
const timestamp = new Date().toISOString();
let sql = `-- Migration data from KV store to D1 database
-- Generated: ${timestamp}

-- Insert property
INSERT INTO properties (id, name, created_at) VALUES ('${kvData.id}', '${kvData.name}', '${timestamp}');

-- Insert activities
`;

kvData.activities.forEach(activity => {
  sql += `INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES ('${kvData.id}', '${activity.slug}', '${activity.label}', '${activity.risk}', '${timestamp}');\n`;
});

sql += `\n-- Insert risk descriptions\n`;

Object.entries(riskDescriptions).forEach(([level, data]) => {
  const description = data.description.replace(/'/g, "''"); // Escape single quotes
  sql += `INSERT INTO risk_descriptions (level, description, created_at) VALUES ('${level}', '${description}', '${timestamp}');\n`;
});

// Write to file
const outputPath = join(__dirname, '..', 'migrations', '0003_seed_data.sql');
writeFileSync(outputPath, sql);

console.log('✅ Migration SQL generated successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log('\nNext steps:');
console.log('1. Review the generated SQL file');
console.log('2. Run: wrangler d1 execute waivers --local --file=migrations/0003_seed_data.sql');
console.log('3. Run: wrangler d1 execute waivers --remote --file=migrations/0003_seed_data.sql');
