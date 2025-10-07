# API Documentation

This document describes the public API endpoints for the waiver management system.

## Endpoints

### GET /

**Description:** Returns the HTML waiver form for guests to fill out and submit.

**Response:** HTML page with embedded property, activity, and risk data.

**Example:**
```bash
curl https://activities.rtxsecured.com/
```

---

### POST /submit

**Description:** Submits a completed waiver form with guest information, selected activities, initials, and signature.

**Request Body:**
```json
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
```

**Response (Production Mode):**
```json
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
```

**Response (Development Mode):**
```json
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
```

**Notes:**
- The `pin` field is only included if the "archery" activity is selected
- In development mode (`DEV_MODE=true`), PDFs are generated and stored but not emailed
- In production mode, PDFs are emailed to the guest's email address

**Example:**
```bash
curl -X POST https://activities.rtxsecured.com/submit \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "cabin-13",
    "checkinDate": "2025-10-15",
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "activities": ["kayaking"],
    "initials": {
      "kayaking": "JD"
    },
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "accepted": true
  }'
```

---

### GET /admin/search

**Description:** Search for waiver submissions by guest name or email. Returns matching submissions with metadata.

**Query Parameters:**
- `q` (required): Search query string (matches against guest name or email)

**Response:**
```json
{
  "ok": true,
  "results": [
    {
      "id": 42,
      "property_id": "cabin-13",
      "checkin_date": "2025-10-15",
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "activities": "kayaking,ziplining",
      "signature_key": "signatures/abc123.png",
      "created_at": "2025-10-01T14:30:00.000Z"
    }
  ]
}
```

**Example:**
```bash
# Search by name
curl "https://activities.rtxsecured.com/admin/search?q=John+Doe"

# Search by email
curl "https://activities.rtxsecured.com/admin/search?q=john@example.com"

# Partial search
curl "https://activities.rtxsecured.com/admin/search?q=john"
```

---

### GET /status

**Description:** Check the status of a waiver submission by ID. Returns detailed information about the submission including associated documents.

**Query Parameters:**
- `id` (required): Submission ID

**Response:**
```json
{
  "ok": true,
  "submission": {
    "id": 42,
    "property_id": "cabin-13",
    "checkin_date": "2025-10-15",
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "activities": "kayaking,ziplining",
    "signature_key": "signatures/abc123.png",
    "created_at": "2025-10-01T14:30:00.000Z"
  },
  "documents": [
    {
      "id": 84,
      "submission_id": 42,
      "activity_slug": "kayaking",
      "pdf_key": "waivers/cabin-13_kayaking_20251015_abc123.pdf",
      "created_at": "2025-10-01T14:30:01.000Z"
    },
    {
      "id": 85,
      "submission_id": 42,
      "activity_slug": "ziplining",
      "pdf_key": "waivers/cabin-13_ziplining_20251015_abc123.pdf",
      "created_at": "2025-10-01T14:30:02.000Z"
    }
  ]
}
```

**Error Response (Not Found):**
```json
{
  "ok": false,
  "error": "Submission not found"
}
```

**Example:**
```bash
curl "https://activities.rtxsecured.com/status?id=42"
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "ok": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Currently, the public endpoints (`/`, `/submit`) do not require authentication. The admin endpoints (`/admin/*`) should be protected by your infrastructure (e.g., Cloudflare Access, firewall rules, etc.).

---

## Rate Limiting

Rate limiting is handled at the Cloudflare level. Contact your administrator for current rate limit policies.

---

## Data Retention

- Submissions are stored indefinitely in the D1 database
- PDF documents are stored indefinitely in R2
- Signature images are stored indefinitely in R2

---

---

## Admin Endpoints

The following endpoints are for administrative purposes and should be protected by authentication (e.g., Cloudflare Access).

### Properties Management

#### GET /admin/properties

**Description:** List all configured properties.

**Response:**
```json
{
  "ok": true,
  "properties": [
    {
      "id": "cabin-13",
      "name": "Cabin 13"
    }
  ]
}
```

**Example:**
```bash
curl https://activities.rtxsecured.com/admin/properties
```

---

#### POST /admin/properties/add

**Description:** Add a new property.

**Request Body:**
```json
{
  "id": "cabin-14",
  "name": "Cabin 14",
  "copyDefaultActivities": true
}
```

**Response:**
```json
{
  "ok": true,
  "properties": [
    {
      "id": "cabin-13",
      "name": "Cabin 13"
    },
    {
      "id": "cabin-14",
      "name": "Cabin 14"
    }
  ],
  "added": "cabin-14"
}
```

**Example:**
```bash
curl -X POST https://activities.rtxsecured.com/admin/properties/add \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cabin-14",
    "name": "Cabin 14",
    "copyDefaultActivities": true
  }'
```

---

#### POST /admin/properties/remove

**Description:** Remove a property (cannot remove if it's the last property).

**Request Body:**
```json
{
  "id": "cabin-14"
}
```

**Response:**
```json
{
  "ok": true,
  "properties": [
    {
      "id": "cabin-13",
      "name": "Cabin 13"
    }
  ],
  "removed": "cabin-14"
}
```

**Example:**
```bash
curl -X POST https://activities.rtxsecured.com/admin/properties/remove \
  -H "Content-Type: application/json" \
  -d '{"id": "cabin-14"}'
```

---

### Activities Management

#### GET /admin/activities

**Description:** Get all activities for a specific property.

**Query Parameters:**
- `property` (optional): Property ID (defaults to "cabin-12")

**Response:**
```json
{
  "ok": true,
  "propertyId": "cabin-13",
  "activities": [
    {
      "slug": "kayaking",
      "label": "Kayaking",
      "risk": "low"
    },
    {
      "slug": "ziplining",
      "label": "Ziplining",
      "risk": "medium"
    }
  ]
}
```

**Example:**
```bash
curl "https://activities.rtxsecured.com/admin/activities?property=cabin-13"
```

---

#### POST /admin/activities/add

**Description:** Add a new activity to a property.

**Query Parameters:**
- `property` (optional): Property ID (defaults to "cabin-12")

**Request Body:**
```json
{
  "slug": "rock-climbing",
  "label": "Rock Climbing",
  "risk": "high"
}
```

**Response:**
```json
{
  "ok": true,
  "propertyId": "cabin-13",
  "activities": [...],
  "added": "rock-climbing"
}
```

**Example:**
```bash
curl -X POST "https://activities.rtxsecured.com/admin/activities/add?property=cabin-13" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "rock-climbing",
    "label": "Rock Climbing",
    "risk": "high"
  }'
```

---

#### POST /admin/activities/update

**Description:** Update an existing activity's label or risk level.

**Query Parameters:**
- `property` (optional): Property ID (defaults to "cabin-12")

**Request Body:**
```json
{
  "slug": "kayaking",
  "label": "Advanced Kayaking",
  "risk": "medium"
}
```

**Response:**
```json
{
  "ok": true,
  "propertyId": "cabin-13",
  "activities": [...],
  "updated": "kayaking"
}
```

**Example:**
```bash
curl -X POST "https://activities.rtxsecured.com/admin/activities/update?property=cabin-13" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "kayaking",
    "risk": "medium"
  }'
```

---

#### POST /admin/activities/remove

**Description:** Remove an activity from a property.

**Query Parameters:**
- `property` (optional): Property ID (defaults to "cabin-12")

**Request Body:**
```json
{
  "slug": "rock-climbing"
}
```

**Response:**
```json
{
  "ok": true,
  "propertyId": "cabin-13",
  "activities": [...],
  "removed": "rock-climbing"
}
```

**Example:**
```bash
curl -X POST "https://activities.rtxsecured.com/admin/activities/remove?property=cabin-13" \
  -H "Content-Type: application/json" \
  -d '{"slug": "rock-climbing"}'
```

---

#### POST /admin/activities

**Description:** Replace all activities for a property.

**Query Parameters:**
- `property` (optional): Property ID (defaults to "cabin-12")

**Request Body:**
```json
{
  "activities": [
    {
      "slug": "kayaking",
      "label": "Kayaking",
      "risk": "low"
    },
    {
      "slug": "ziplining",
      "label": "Ziplining",
      "risk": "medium"
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "propertyId": "cabin-13",
  "activities": [...]
}
```

**Example:**
```bash
curl -X POST "https://activities.rtxsecured.com/admin/activities?property=cabin-13" \
  -H "Content-Type: application/json" \
  -d '{
    "activities": [
      {"slug": "kayaking", "label": "Kayaking", "risk": "low"}
    ]
  }'
```

---

### Risk Levels Management

#### GET /admin/risks

**Description:** Get all risk level definitions.

**Response:**
```json
{
  "ok": true,
  "risks": {
    "low": {
      "level": "low",
      "title": "Low Risk",
      "description": "Suitable for all ages and fitness levels. Basic safety equipment provided."
    },
    "medium": {
      "level": "medium",
      "title": "Medium Risk",
      "description": "Moderate physical activity. Some experience recommended."
    },
    "high": {
      "level": "high",
      "title": "High Risk",
      "description": "Advanced activity. Significant physical demands and safety risks."
    }
  }
}
```

**Example:**
```bash
curl https://activities.rtxsecured.com/admin/risks
```

---

#### GET /admin/risks?level={level}

**Description:** Get a specific risk level definition.

**Query Parameters:**
- `level` (required): Risk level (low, medium, or high)

**Response:**
```json
{
  "ok": true,
  "risk": {
    "level": "low",
    "title": "Low Risk",
    "description": "Suitable for all ages and fitness levels."
  }
}
```

**Example:**
```bash
curl "https://activities.rtxsecured.com/admin/risks?level=low"
```

---

#### POST /admin/risks

**Description:** Update a risk level definition.

**Request Body:**
```json
{
  "level": "low",
  "title": "Low Risk",
  "description": "Suitable for all ages and fitness levels. Basic safety equipment provided."
}
```

**Response:**
```json
{
  "ok": true,
  "risk": {
    "level": "low",
    "title": "Low Risk",
    "description": "Suitable for all ages and fitness levels. Basic safety equipment provided."
  }
}
```

**Example:**
```bash
curl -X POST https://activities.rtxsecured.com/admin/risks \
  -H "Content-Type: application/json" \
  -d '{
    "level": "low",
    "title": "Low Risk",
    "description": "Updated description here"
  }'
```

---

### Document Management

#### GET /admin/document

**Description:** Get document metadata by submission ID and activity.

**Query Parameters:**
- `submission` (required): Submission ID
- `activity` (required): Activity slug

**Response:**
```json
{
  "ok": true,
  "document_id": 84,
  "r2_key": "waivers/cabin-13_kayaking_20251015_abc123.pdf"
}
```

**Example:**
```bash
curl "https://activities.rtxsecured.com/admin/document?submission=42&activity=kayaking"
```

---

#### GET /admin/download-all

**Description:** Download all waiver PDFs for a submission as a ZIP file.

**Query Parameters:**
- `submission` (required): Submission ID

**Response:** Binary ZIP file

**Example:**
```bash
curl "https://activities.rtxsecured.com/admin/download-all?submission=42" -o waivers.zip
```

---

### Release Management

#### GET /admin/releases

**Description:** Get all waiver text releases (versioned legal text).

**Response:**
```json
{
  "ok": true,
  "current": {
    "version": "1.0.2",
    "release_date": "2025-10-01",
    "waiver_text": "By signing this waiver...",
    "created_at": "2025-10-01T10:00:00.000Z"
  },
  "releases": [
    {
      "version": "1.0.2",
      "release_date": "2025-10-01",
      "waiver_text": "By signing this waiver...",
      "created_at": "2025-10-01T10:00:00.000Z"
    },
    {
      "version": "1.0.1",
      "release_date": "2025-09-15",
      "waiver_text": "Previous version...",
      "created_at": "2025-09-15T14:00:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl https://activities.rtxsecured.com/admin/releases
```

---

#### POST /admin/releases/create

**Description:** Create a new waiver text release. Version is auto-incremented if not provided.

**Request Body:**
```json
{
  "version": "1.0.3",
  "waiver_text": "Updated legal waiver text here..."
}
```

**Notes:**
- If `version` is omitted, it will auto-increment from the latest version
- Version must follow semantic versioning format: X.Y.Z
- Version must be unique

**Response:**
```json
{
  "ok": true,
  "version": "1.0.3",
  "release_date": "2025-10-01"
}
```

**Example:**
```bash
curl -X POST https://activities.rtxsecured.com/admin/releases/create \
  -H "Content-Type: application/json" \
  -d '{
    "waiver_text": "Updated legal text..."
  }'
```

---

### Document Verification

#### GET /admin/verify

**Description:** Verify document integrity by comparing stored hash with computed hash.

**Query Parameters:**
- `document` (required): Document ID

**Response:**
```json
{
  "ok": true,
  "verified": true,
  "stored_hash": "abc123def456...",
  "computed_hash": "abc123def456..."
}
```

**Notes:**
- Documents are hashed using SHA-256
- Hash includes: submission data, activity, initials, signature, and release version
- Used to verify documents haven't been tampered with

**Example:**
```bash
curl "https://activities.rtxsecured.com/admin/verify?document=84"
```
