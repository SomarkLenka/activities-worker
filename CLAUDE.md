# CLAUDE.md - AI Assistant Documentation

This document provides context and guidance for AI assistants (like Claude) working on this codebase.

## Project Overview

This is a **Cloudflare Workers-based digital waiver management system** for rental properties. It handles liability waivers for adventure activities, generates PDFs with signatures, and manages document storage and delivery.

## Architecture Summary

### Core Components

1. **Main Worker** (`src/index.mjs`)
   - Routes: `/`, `/submit`, `/admin/search`, `/status`, `/download/:key`
   - Handles form submission, database operations, and orchestrates PDF generation

2. **Browser Worker** (`browser-worker/`)
   - Separate Cloudflare Worker for PDF generation
   - Uses Cloudflare Browser Rendering API
   - Must be deployed to Cloudflare (cannot run locally)

3. **Frontend SPA** (`src/spa.js`)
   - Single-page application with digital signature capture
   - Checkbox-based activity selection with inline initials
   - Responsive grid layout for activities

4. **Storage Systems**
   - **D1 Database**: Stores submissions and document records
   - **KV Namespace**: Stores property/activity configuration
   - **R2 Bucket**: Stores generated PDF files

## Key Development Considerations

### 1. Database Binding Names
- The D1 database binding is named `waivers` (not `DB`)
- Always use `env.waivers.prepare()` for database queries

### 2. KV Namespace Setup
- **Production**: `PROPS_KV` with id in wrangler.toml
- **Development**: `DEV_PROPS_KV` with preview_id in wrangler.toml
- Must populate with property data before testing

### 3. Browser Rendering Service
- **Cannot run locally** - requires Cloudflare's infrastructure
- Browser-worker must be deployed first
- Local dev uses remote browser-worker via service binding
- RPC function `htmlToPdf` expects single object argument

### 4. Development Mode
- Set `DEV_MODE = "true"` in wrangler.toml for development
- Bypasses email sending, provides download buttons instead
- PDFs are still generated and stored in R2

### 5. Running Locally
```bash
# With remote browser-worker (recommended)
wrangler dev --remote

# Or with dev config
wrangler dev --config wrangler.dev.toml --local
```

## Common Issues and Solutions

### Issue: "Worker threw exception"
**Cause**: Database not initialized or binding misconfigured
**Solution**:
```bash
wrangler d1 execute waivers --local --file=migrations/0001_init.sql
```

### Issue: "Cannot access htmlToPdf"
**Cause**: Browser-worker not deployed or service binding incorrect
**Solution**: Deploy browser-worker first:
```bash
cd browser-worker && wrangler deploy
```

### Issue: Activities not displaying
**Cause**: KV namespace not populated with property data
**Solution**:
```bash
wrangler kv key put --binding=PROPS_KV props '[...]' --preview
```

### Issue: PDF corrupted/won't open
**Cause**: Browser rendering service not available
**Solution**: Ensure browser-worker is deployed and use `--remote` flag

## Code Style Guidelines

1. **No unnecessary comments** - code should be self-documenting
2. **Use existing patterns** - check neighboring files for conventions
3. **Error handling** - always wrap external service calls in try-catch
4. **Console logging** - use double quotes to avoid template literal conflicts

## Testing Checklist

When testing the full flow:

1. ✅ Activities display as checkboxes in grid
2. ✅ Initials fields appear when activities selected
3. ✅ Master checkbox enabled only when all initials provided
4. ✅ Form submission creates database records
5. ✅ PDFs generated for each selected activity
6. ✅ In dev mode: Download buttons appear
7. ✅ In prod mode: Email sent with attachments
8. ✅ PDFs can be opened and contain correct information

## File Structure

```
/
├── src/                    # Main worker source
│   ├── index.mjs          # Route handlers and main logic
│   ├── spa.js             # Frontend single-page app
│   ├── pdf.js             # PDF generation logic
│   ├── mail.js            # Email composition
│   └── resp.js            # Response utilities
├── browser-worker/         # PDF generation service
│   └── src/index.js       # Browser rendering RPC handler
├── migrations/             # Database schema
└── wrangler.toml          # Worker configuration
```

## Environment Variables

### Required for Production
- `CLOUDFLARE_ACCOUNT_ID` - Account ID for email API
- `CLOUDFLARE_API_TOKEN` - API token with email permissions

### Configuration Variables
- `ARCHERY_PIN` - Special PIN for archery activity
- `LEGAL_VERSION` - Version string for legal documents
- `EMAIL_FROM` - From address for waiver emails
- `DEV_MODE` - Enable development mode features

## Deployment Process

1. Deploy browser-worker: `cd browser-worker && wrangler deploy`
2. Initialize remote database: `wrangler d1 execute waivers --remote --file=migrations/0001_init.sql`
3. Populate KV namespace with property data
4. Deploy main worker: `wrangler deploy`
5. Set secrets for email functionality

## Important Commands

```bash
# Local development
wrangler dev --remote

# View logs
wrangler tail

# Update KV data
wrangler kv key put --binding=PROPS_KV props '[...]' --preview

# Database migrations
wrangler d1 execute waivers --local --file=migrations/0001_init.sql

# Deploy to production
wrangler deploy
```

## Recent Changes (Latest Session)

- Fixed database binding name from `DB` to `waivers`
- Added preview KV namespace for development
- Configured remote browser-worker for local development
- Fixed RPC function signature for single-argument pattern
- Added comprehensive error handling throughout submit flow
- Updated activities to checkbox grid with inline initials
- Implemented "Download All" functionality for multiple PDFs

## Notes for Future Development

1. **Email Service**: Currently uses Cloudflare Email API directly. Could be migrated to queue-based system for better reliability.

2. **Activity Configuration**: Activities are currently hardcoded in KV. Consider adding admin interface for dynamic management.

3. **PDF Templates**: HTML templates in pdf.js could be externalized for easier customization.

4. **Multi-tenancy**: System assumes single property. Could be extended for multiple properties with separate configurations.

5. **Validation**: Client-side validation could be enhanced with more robust server-side checks.

---

*Last Updated: 2025-09-30*
*This document helps AI assistants understand the codebase structure, common issues, and development patterns.*