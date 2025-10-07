# Activity Waiver Management System

A Cloudflare Workers-based application for managing digital liability waivers for rental properties and activities. This system provides a two-step verification flow, collects guest signatures, generates PDF waivers asynchronously, and emails them automatically.

## Overview

This application provides a complete digital waiver management solution built on Cloudflare's edge platform:
- **Two-Step Verification**: Email verification before waiver completion
- **Digital Signature Collection**: Web-based form for guests to sign waivers
- **Asynchronous PDF Generation**: Background PDF creation with retry logic
- **Email Delivery**: Automated waiver delivery via Resend API
- **Data Storage**: Persistent storage using D1 (database) and R2 (object storage)
- **Activity-Specific Waivers**: Separate waivers for different activities
- **Admin Panel**: Comprehensive management interface for properties, activities, releases, and submissions

## Architecture

### Core Components

#### Main Worker
- **Location**: `src/index.js`
- **Routes**:
  - `GET /` - Single-page application for waiver signing
  - `POST /submit/initial` - Initial submission with email verification
  - `POST /submit/complete` - Complete waiver submission after verification
  - `GET /admin` - Admin panel interface
  - `GET /admin/search` - Search submitted waivers
  - `GET /admin/properties` - Manage properties
  - `GET /admin/activities` - Manage activities
  - `GET /admin/releases` - Manage legal releases
  - `GET /admin/risks` - Manage risk descriptions
  - `GET /status` - Health check endpoint

#### Browser Rendering Worker
- **Binding**: `BROWSER` service binding
- **Purpose**: Converts HTML to PDF using Cloudflare's Browser Rendering API
- **Features**:
  - Single and batch PDF generation
  - Concurrent processing (max 3 simultaneous)
  - Automatic error handling

### Data Flow

#### Initial Submission
1. Guest fills out initial form (property, check-in date, name, email)
2. System generates verification token (24-hour expiration)
3. Verification email sent with unique link
4. Submission stored with status='pending'

#### Complete Submission
1. Guest clicks verification link
2. Form pre-populated with submission data
3. Guest selects activities, provides initials, signs
4. Validates all initials are consistent
5. Updates submission to status='processing'
6. Returns immediate success response
7. Background processing:
   - Generates PDFs for each activity
   - Saves to R2 and database
   - Sends email with attachments
   - Updates status to 'emailed' or 'failed'
   - Retries with exponential backoff on failure

#### PDF Generation
- Creates one PDF per selected activity
- Uses Browser Rendering Worker for HTML-to-PDF conversion
- Stores PDFs in R2 bucket with structured key format:
  ```
  waivers/YYYY/MM/DD/property-id/activity/lastName-firstName-activity-submissionID.pdf
  ```
- Stores signatures separately:
  ```
  waivers/YYYY/MM/DD/property-id/signatures/lastName-firstName-submissionID.png
  ```

## Database Schema

### Core Tables

#### `submissions`
- `submission_id` - Unique identifier (nanoid)
- `created_at` - ISO timestamp
- `property_id` - Property identifier
- `checkin_date` - Guest check-in date
- `guest_name` - Guest full name
- `guest_email` - Guest email address
- `activities` - JSON array of selected activity slugs
- `status` - pending, processing, emailed, completed, failed
- `verification_token` - Unique token for email verification
- `token_expires_at` - Token expiration timestamp
- `completed_at` - Completion timestamp
- `error_message` - Error details if status='failed'

#### `submission_activities`
- `activity_id` - Unique identifier
- `verification_token` - Links to submission
- `activity_slug` - Activity identifier
- `activity_label` - Human-readable activity name
- `initials` - Guest initials
- `document_hash` - SHA-256 hash of document data
- `r2_key` - R2 storage key for PDF
- `created_at` - Timestamp

#### `properties`
- `id` - Property identifier
- `name` - Property name
- `created_at` - Timestamp

#### `activities`
- `id` - Auto-increment ID
- `property_id` - Foreign key to properties
- `slug` - Activity identifier (URL-safe)
- `label` - Human-readable name
- `risk` - Risk level (low, medium, high)
- `created_at` - Timestamp

#### `releases`
- `version` - Version identifier (primary key)
- `release_date` - Release date
- `waiver_text` - Legal waiver text content
- `created_at` - Timestamp

#### `risk_descriptions`
- `level` - Risk level (low, medium, high)
- `description` - Risk description text
- `created_at` - Timestamp

### Legacy Tables (Backward Compatibility)

#### `documents`
- `document_id` - Document identifier
- `submission_id` - Foreign key to submissions
- `activity` - Activity slug
- `r2_key` - R2 storage key
- `initials` - Guest initials

#### `hashes`
- `hash_id` - Unique identifier
- `document_id` - Foreign key to documents
- `hash_value` - SHA-256 hash
- `created_at` - Timestamp

## Configuration

### Environment Variables (via `wrangler.toml`)

**Public Variables**:
- `ARCHERY_PIN` - PIN code for archery activity (default: "1234")
- `EMAIL_FROM` - From address for waiver emails
- `DEV_MODE` - Enable development mode (default: "false")

**Bindings**:
- `waivers` - D1 database
- `WAIVERS_R2` - R2 bucket for PDF storage
- `BROWSER` - Service binding to browser rendering worker

**Secrets**:
- `RESEND_API_KEY` - Resend API key for email sending

## Setup Instructions

### Prerequisites
- Cloudflare account with Workers subscription
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Resend account with API key

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create Cloudflare resources**:
   ```bash
   # Create D1 database
   wrangler d1 create waivers

   # Create R2 bucket
   wrangler r2 bucket create waivers
   ```

3. **Update `wrangler.toml`** with your resource IDs

4. **Initialize database**:
   ```bash
   # Apply migrations in order
   wrangler d1 execute waivers --remote --file=migrations/0001_schema.sql
   wrangler d1 execute waivers --remote --file=migrations/0002_properties_activities.sql
   wrangler d1 execute waivers --remote --file=migrations/0003_seed_data.sql
   wrangler d1 execute waivers --remote --file=migrations/0004_add_legal_releases.sql
   wrangler d1 execute waivers --remote --file=migrations/0005_add_verification_token.sql
   wrangler d1 execute waivers --remote --file=migrations/0006_add_submission_activities.sql
   wrangler d1 execute waivers --remote --file=migrations/0007_update_submissions_status.sql
   wrangler d1 execute waivers --remote --file=migrations/0008_add_error_message.sql

   # Or use the full schema for clean installs
   wrangler d1 execute waivers --remote --file=migrations/schema_full.sql
   ```

5. **Configure secrets**:
   ```bash
   wrangler secret put RESEND_API_KEY
   ```

6. **Deploy**:
   ```bash
   git push origin main
   # Auto-deploys via GitHub integration
   ```

## Development

### Development Mode

When `DEV_MODE="true"`:
- Synchronous PDF processing
- Returns download buttons instead of sending email
- PDFs accessible via `/download/:documentId` endpoint

When `DEV_MODE="false"` (production):
- Asynchronous PDF processing with ctx.waitUntil()
- Immediate response to user
- Email sent after PDFs generated
- Automatic retry with exponential backoff (1s, 2s, 4s)

### Local Development

```bash
# Use remote flag to enable browser rendering
wrangler dev --remote
```

**Note**: Browser Rendering API requires remote execution and cannot run in pure local mode.

### Testing

```bash
# Test batch PDF generation
node scripts/test-batch-pdf.js
```

## File Structure

```
.
├── src/
│   ├── index.js                    # Main entry point
│   ├── routes/
│   │   ├── root.js                 # Root route handler
│   │   ├── submit.js               # Submission handlers
│   │   ├── status.js               # Status endpoint
│   │   ├── download.js             # Dev mode downloads
│   │   └── admin/                  # Admin routes
│   ├── services/
│   │   ├── pdf.js                  # PDF generation
│   │   ├── mail.js                 # Email sending
│   │   ├── storage.js              # Database operations
│   │   ├── async-processor.js      # Async processing with retry
│   │   └── validation.js           # Input validation
│   ├── utils/
│   │   ├── db.js                   # Database utilities
│   │   ├── spa.js                  # SPA HTML builder
│   │   ├── admin.js                # Admin utilities
│   │   └── nanoid.js               # ID generation
│   └── templates/
│       ├── spa.html                # SPA template
│       ├── spa.js                  # SPA JavaScript
│       ├── admin.html              # Admin panel template
│       ├── waiver.html             # PDF template
│       └── email-*.html/txt        # Email templates
├── migrations/                      # Database migrations
├── scripts/                         # Utility scripts
├── wrangler.toml                   # Cloudflare configuration
└── package.json                    # Dependencies
```

## Features

### Guest Interface
- Two-step verification via email
- Responsive design (desktop and mobile)
- Digital signature pad with touch support
- Activity selection with inline initials
- Real-time validation
- Immediate confirmation response
- Email delivery with PDF attachments

### Admin Panel Features
- **Search**: Query submissions by name, email, property, date, or activity
- **Properties Management**: Create, update, delete properties
- **Activities Management**: Configure activities per property
- **Releases Management**: Version-controlled legal text
- **Risk Descriptions**: Manage risk level descriptions
- **Document Verification**: View and verify submitted waivers
- **Debug Interface**: Database inspection tools

### Security Features
- Input validation (server-side)
- Initials consistency validation
- Token-based email verification (24-hour expiration)
- Document hashing (SHA-256) for verification
- Secure storage in R2 with structured keys
- API token-based email sending
- Activity-specific PINs for high-risk activities

## Async Processing

The system uses Cloudflare Workers' `ctx.waitUntil()` for background processing:

1. Validates submission data immediately
2. Returns success response to user (~1 second)
3. Processes PDFs in background
4. Retries on failure with exponential backoff:
   - Attempt 1: Immediate
   - Attempt 2: 1 second delay
   - Attempt 3: 2 second delay
   - Attempt 4: 4 second delay
5. Updates submission status to 'emailed' or 'failed'
6. Stores error message if all retries fail

## Deployment

Push to main branch triggers automatic deployment via GitHub integration:

```bash
git push origin main
```

**Note**: No need to use `wrangler deploy` manually.

## Monitoring

- **Logs**: Cloudflare Workers dashboard
- **Status**: `/status` endpoint for health checks
- **Failed Submissions**: Query `submissions` table where `status='failed'`
- **Metrics**: Worker invocations and performance in dashboard

## Dependencies

- `nanoid` (5.1.6) - Unique ID generation
- `resend` - Email API client

## License

ISC License

## Support

For issues:
1. Check Cloudflare Workers documentation
2. Review logs in Cloudflare dashboard
3. Verify environment variables and secrets
4. Ensure database migrations are applied
5. Test with `/status` endpoint
