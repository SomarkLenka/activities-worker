# Waiver Worker - Activity Liability Waiver System

A Cloudflare Workers-based application for managing digital liability waivers for rental properties and activities. This system collects guest signatures, generates PDF waivers, and emails them automatically.

## Overview

This application provides a complete digital waiver management solution built on Cloudflare's edge platform:
- **Digital Signature Collection**: Web-based form for guests to sign waivers
- **PDF Generation**: Automatic PDF creation with signatures using Cloudflare Browser Rendering
- **Email Delivery**: Automated waiver delivery to guests via Cloudflare Email
- **Data Storage**: Persistent storage using D1 (database) and R2 (object storage)
- **Activity-Specific Waivers**: Separate waivers for different activities (kayaking, pool, archery, sauna)

## Architecture

### Core Components

#### Main Worker (`waiver-worker`)
- **Location**: `src/index.mjs`
- **Routes**:
  - `GET /` - Serves the single-page application for waiver signing
  - `POST /submit` - Processes waiver submissions
  - `GET /admin/search` - Admin search interface for submitted waivers
  - `GET /status` - Health check endpoint

#### Browser Rendering Worker
- **Location**: `browser-worker/`
- **Purpose**: Converts HTML to PDF using Cloudflare's Browser Rendering API
- **RPC Method**: `htmlToPdf()` - Called by main worker via service binding

### Data Flow

1. **Guest fills out waiver form** (`spa.js`)
   - Selects property and check-in date
   - Chooses activities requiring waivers
   - Provides initials for each activity
   - Signs digitally on canvas
   - Accepts terms

2. **Form submission** (`index.mjs`)
   - Validates all required fields
   - Generates unique submission ID
   - Stores submission in D1 database

3. **PDF generation** (`pdf.js`)
   - Creates one PDF per selected activity
   - Uses Browser Rendering Worker for HTML-to-PDF conversion
   - Stores PDFs in R2 bucket with structured key format:
     ```
     waivers/YYYY/MM/DD/property-id/activity/guest-name-{id}.pdf
     ```

4. **Email delivery** (`mail.js`)
   - Constructs MIME multipart email with PDF attachments
   - Sends via Cloudflare Email API
   - Includes archery PIN if applicable

## Database Schema

### `submissions` Table
- `id` - Unique identifier (nanoid)
- `created_at` - ISO timestamp
- `property_id` - Property identifier
- `checkin_date` - Guest check-in date
- `guest_name` - Guest full name
- `guest_email` - Guest email address
- `activities` - JSON array of selected activity slugs

### `documents` Table
- `id` - Document identifier
- `submission_id` - Foreign key to submissions
- `activity` - Activity name
- `r2_key` - R2 storage key for PDF

## Configuration

### Environment Variables (via `wrangler.toml`)

**Public Variables**:
- `ARCHERY_PIN` - PIN code for archery activity (default: "1234")
- `LEGAL_VERSION` - Version identifier for legal documents (default: "2024-06")
- `EMAIL_FROM` - From address for waiver emails (default: "waivers@example.com")
- `DEV_MODE` - Enable development mode with PDF downloads instead of email (default: "true", set to "false" for production)

**Bindings**:
- `PROPS_KV` - KV namespace for property data
- `WAIVERS_R2` - R2 bucket for PDF storage
- `DB` (waivers) - D1 database for submissions
- `BROWSER` - Service binding to browser-worker

**Secrets** (must be configured):
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - API token with email send permissions

## Setup Instructions

### Prerequisites
- Cloudflare account with Workers subscription
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare API token (for remote deployment)

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   cd browser-worker && npm install && cd ..
   ```

2. **Create Cloudflare resources**:
   ```bash
   # Create production KV namespace
   wrangler kv namespace create PROPS_KV

   # Create development KV namespace
   wrangler kv namespace create DEV_PROPS_KV

   # Create D1 database
   wrangler d1 create waivers

   # Create R2 bucket (via Cloudflare dashboard)
   # Navigate to R2 and create bucket named "waivers"
   ```

3. **Update `wrangler.toml`** with your resource IDs:
   - Production KV namespace ID (id field)
   - Development KV namespace ID (preview_id field)
   - D1 database ID
   - Update email configuration

4. **Initialize database**:
   ```bash
   # Local database
   wrangler d1 execute waivers --local --file=migrations/0001_init.sql

   # Remote database (requires API token)
   wrangler d1 execute waivers --remote --file=migrations/0001_init.sql
   ```

5. **Deploy browser rendering worker**:
   ```bash
   cd browser-worker
   wrangler deploy
   cd ..
   ```

6. **Configure secrets** (for production):
   ```bash
   wrangler secret put CLOUDFLARE_ACCOUNT_ID
   wrangler secret put CLOUDFLARE_API_TOKEN
   ```

7. **Populate property data** in KV:
   ```bash
   # Development namespace
   wrangler kv key put --binding=PROPS_KV props '[{"id":"cabin-12","name":"Riverside Cabin 12","activities":[{"slug":"archery","label":"Archery"},{"slug":"kayaking","label":"Kayaking"},{"slug":"ziplining","label":"Ziplining"},{"slug":"snorkeling","label":"Snorkeling"},{"slug":"safari-tour","label":"Safari Tour"},{"slug":"boat-tour","label":"Boat Tour"},{"slug":"spelunking","label":"Spelunking"},{"slug":"scuba-diving","label":"Scuba Diving"},{"slug":"paragliding","label":"Paragliding"},{"slug":"bungee-jumping","label":"Bungee Jumping"}]}]' --preview

   # Production namespace
   wrangler kv key put --binding=PROPS_KV props '[{"id":"cabin-12","name":"Riverside Cabin 12","activities":[{"slug":"archery","label":"Archery"},{"slug":"kayaking","label":"Kayaking"},{"slug":"ziplining","label":"Ziplining"},{"slug":"snorkeling","label":"Snorkeling"},{"slug":"safari-tour","label":"Safari Tour"},{"slug":"boat-tour","label":"Boat Tour"},{"slug":"spelunking","label":"Spelunking"},{"slug":"scuba-diving","label":"Scuba Diving"},{"slug":"paragliding","label":"Paragliding"},{"slug":"bungee-jumping","label":"Bungee Jumping"}]}]'
   ```

8. **Deploy main worker**:
   ```bash
   wrangler deploy
   ```

## Development

### Development Mode

The application includes a development mode that bypasses email sending and allows direct PDF downloads. This is useful for testing without configuring email services.

**When `DEV_MODE="true"` in `wrangler.toml`:**
- Form submissions generate PDFs as normal
- PDFs are stored in R2 but NOT emailed
- User receives download buttons for each PDF
- Multiple PDFs can be downloaded individually or all at once
- A `/download/:key` endpoint is available for retrieving PDFs

**To enable/disable development mode:**
```toml
# wrangler.toml
[vars]
DEV_MODE = "true"   # Development - PDFs downloadable
# DEV_MODE = "false" # Production - PDFs emailed
```

### Local Development

#### Using Remote Browser Worker
Since the Browser Rendering API requires Cloudflare's infrastructure, local development uses the deployed browser-worker:

```bash
# Option 1: Use remote flag (all remote resources)
wrangler dev --remote

# Option 2: Use development config with selective remote bindings
wrangler dev --config wrangler.dev.toml --local
```

#### Development Setup
1. Browser-worker must be deployed to Cloudflare first
2. Local development uses:
   - Local D1 database
   - Local preview KV namespace (DEV_PROPS_KV)
   - Local R2 storage
   - **Remote browser-worker service** for PDF generation

**Development Mode Features:**
- Individual download buttons for each activity waiver
- "Download All" button when multiple PDFs are generated
- Visual indicator showing development mode is active
- No email configuration required
- PDFs still stored in R2 for persistence
- Real PDF generation using remote browser service

### Testing
Browser worker includes test setup with Vitest:
```bash
cd browser-worker
npm test
```

## File Structure

```
.
├── src/                      # Main worker source code
│   ├── index.mjs            # Main entry point and route handlers
│   ├── spa.js               # Single-page application (HTML/JS)
│   ├── pdf.js               # PDF generation logic
│   ├── mail.js              # Email composition and sending
│   └── resp.js              # Response utilities
├── browser-worker/          # Browser rendering service
│   ├── src/index.js        # Browser worker implementation
│   ├── package.json         # Browser worker dependencies
│   └── test/                # Test files
├── migrations/              # Database schema
│   └── 0001_init.sql        # Initial database setup
├── wrangler.toml           # Cloudflare Workers configuration
├── package.json            # Main project dependencies
└── tmp.json                # Sample property data
```

## Features

### Guest Interface
- **Responsive design**: Works on desktop and mobile devices
- **Digital signature pad**: Touch-enabled signature capture
- **Activity selection**: Click-to-select chip interface
- **Real-time validation**: Form validation before submission
- **Email confirmation**: Immediate feedback with attachment list

### Admin Features
- **Search interface** (`/admin/search`): Query submissions by:
  - Guest name
  - Email address
  - Property ID
  - Check-in date
- **Health check** (`/status`): Monitor database connectivity

### Security Features
- **Input validation**: Server-side validation of all form inputs
- **Secure storage**: PDFs stored in R2 with structured keys
- **Email authentication**: API token-based email sending
- **Activity-specific PINs**: Special codes for high-risk activities

## Deployment

The application is configured for deployment on Cloudflare Workers:

```bash
# Deploy to production
wrangler deploy

# View logs
wrangler tail
```

## Monitoring

- **Logs**: Available via `wrangler tail` or Cloudflare dashboard
- **Metrics**: Worker invocations and performance in Cloudflare dashboard
- **Storage**: Monitor R2 usage and D1 queries in respective dashboards

## Dependencies

### Main Worker
- `nanoid` (v5.1.6) - Unique ID generation

### Browser Worker
- `@cloudflare/puppeteer` - Browser automation for PDF generation
- `wrangler` - Cloudflare Workers CLI
- `vitest` - Testing framework

## License

ISC License (as specified in package.json)

## Support

For issues or questions:
1. Check Cloudflare Workers documentation
2. Review error logs with `wrangler tail`
3. Verify all environment variables and bindings are configured
4. Ensure D1 database is initialized with migration script