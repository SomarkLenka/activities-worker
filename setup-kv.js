// Script to populate KV namespace with property data for local development
// Run with: node setup-kv.js

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const propertyData = [
  {
    "id": "cabin-12",
    "name": "Riverside Cabin 12",
    "activities": [
      { "slug": "archery", "label": "Archery" },
      { "slug": "kayaking", "label": "Kayaking" },
      { "slug": "ziplining", "label": "Ziplining" },
      { "slug": "snorkeling", "label": "Snorkeling" },
      { "slug": "safari-tour", "label": "Safari Tour" },
      { "slug": "boat-tour", "label": "Boat Tour" },
      { "slug": "spelunking", "label": "Spelunking" },
      { "slug": "scuba-diving", "label": "Scuba Diving" },
      { "slug": "paragliding", "label": "Paragliding" },
      { "slug": "bungee-jumping", "label": "Bungee Jumping" }
    ]
  }
];

// Write to props.json for easy import
const propsPath = join(__dirname, 'props.json');
writeFileSync(propsPath, JSON.stringify(propertyData, null, 2));

console.log('Property data written to props.json');
console.log('\nTo populate KV namespace for local development:');
console.log('1. Start wrangler dev: wrangler dev');
console.log('2. In another terminal, run:');
console.log(`   wrangler kv:key put --binding=PROPS_KV --local props '${JSON.stringify(propertyData)}'`);
console.log('\nFor production deployment:');
console.log(`   wrangler kv:key put --binding=PROPS_KV props '${JSON.stringify(propertyData)}'`);