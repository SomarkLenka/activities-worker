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

## Additional Admin Endpoints

For a complete list of admin endpoints (properties, activities, risks management), see the admin API documentation or refer to the source code in `src/routes/admin/`.
