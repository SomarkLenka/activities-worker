import { readFileSync } from 'fs';
import { join } from 'path';

export async function handleAdminApiDocs() {
  try {
    // In Cloudflare Workers, we need to embed the content at build time
    // For now, we'll just return the markdown content directly
    const apiDocs = `# API Documentation

This document describes the public API endpoints for the waiver management system.

## Endpoints

### GET /

**Description:** Returns the HTML waiver form for guests to fill out and submit.

**Response:** HTML page with embedded property, activity, and risk data.

**Example:**
\`\`\`bash
curl https://activities.rtxsecured.com/
\`\`\`

---

### POST /submit

**Description:** Submits a completed waiver form with guest information, selected activities, initials, and signature.

**Request Body:**
\`\`\`json
{
  "propertyId": "cabin-13",
  "checkinDate": "2025-10-15",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "activities": ["kayaking", "ziplining", "archery"],
  "initials": {
    "kayaking": "JD",
    "ziplining": "JD",
    "archery": "JD"
  },
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "accepted": true
}
\`\`\`

**Response (Production Mode):**
\`\`\`json
{
  "ok": true,
  "devMode": false,
  "emailed": [
    "cabin-13_kayaking_20251015.pdf",
    "cabin-13_ziplining_20251015.pdf",
    "cabin-13_archery_20251015.pdf"
  ],
  "pin": "1234"
}
\`\`\`

**Response (Development Mode):**
\`\`\`json
{
  "ok": true,
  "devMode": true,
  "downloads": [
    {
      "filename": "cabin-13_kayaking_20251015.pdf",
      "url": "/download/abc123def456"
    },
    {
      "filename": "cabin-13_ziplining_20251015.pdf",
      "url": "/download/def456ghi789"
    }
  ],
  "pin": "1234"
}
\`\`\`

**Notes:**
- The \`pin\` field is only included if the "archery" activity is selected
- In development mode (\`DEV_MODE=true\`), PDFs are generated and stored but not emailed
- In production mode, PDFs are emailed to the guest's email address

---

### GET /admin/search

**Description:** Search for waiver submissions by guest name or email.

**Query Parameters:**
- \`q\` (required): Search query string

**Response:**
\`\`\`json
{
  "ok": true,
  "results": [...]
}
\`\`\`

---

### GET /status

**Description:** Check the status of a waiver submission by ID.

**Query Parameters:**
- \`id\` (required): Submission ID

**Response:**
\`\`\`json
{
  "ok": true,
  "submission": {...},
  "documents": [...]
}
\`\`\`

---

## Admin Endpoints

### Properties Management

#### GET /admin/properties

List all configured properties.

#### POST /admin/properties/add

Add a new property.

#### POST /admin/properties/remove

Remove a property.

---

### Activities Management

#### GET /admin/activities

Get all activities for a specific property.

**Query Parameters:**
- \`property\` (optional): Property ID

#### POST /admin/activities/add

Add a new activity to a property.

#### POST /admin/activities/update

Update an existing activity.

#### POST /admin/activities/remove

Remove an activity from a property.

---

### Risk Levels Management

#### GET /admin/risks

Get all risk level definitions.

#### POST /admin/risks

Update a risk level definition.

---

### Document Management

#### GET /admin/document

Get document metadata by submission ID and activity.

**Query Parameters:**
- \`submission\` (required): Submission ID
- \`activity\` (required): Activity slug

#### GET /admin/download-all

Download all waiver PDFs for a submission as a ZIP file.

**Query Parameters:**
- \`submission\` (required): Submission ID

---

### Release Management

#### GET /admin/releases

Get all waiver text releases (versioned legal text).

#### POST /admin/releases/create

Create a new waiver text release.

**Request Body:**
\`\`\`json
{
  "version": "1.0.3",
  "waiver_text": "Updated legal waiver text..."
}
\`\`\`

**Notes:**
- If \`version\` is omitted, it will auto-increment from the latest version
- Version must follow semantic versioning format: X.Y.Z
- Version must be unique

---

### Document Verification

#### GET /admin/verify

Verify document integrity by comparing stored hash with computed hash.

**Query Parameters:**
- \`document\` (required): Document ID

**Response:**
\`\`\`json
{
  "ok": true,
  "verified": true,
  "stored_hash": "abc123...",
  "computed_hash": "abc123..."
}
\`\`\`

**Notes:**
- Documents are hashed using SHA-256
- Hash includes: submission data, activity, initials, signature, and release version
- Used to verify documents haven't been tampered with

---

### Debug Panel

#### GET /admin/debug

View KV store and D1 database tables for debugging.

**Query Parameters:**
- \`refresh\` (optional): Set to "true" to force refresh cached data

**Notes:**
- Data is cached for 7 days
- Shows all PROPS_KV keys and values
- Shows all D1 tables with up to 50 rows each
`;

    return new Response(apiDocs, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  } catch (error) {
    return new Response('Error loading API documentation', { status: 500 });
  }
}
