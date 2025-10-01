# CLAUDE.md - AI Assistant Documentation

This document provides context and guidance for AI assistants (like Claude) working on this codebase.

## Project Overview

This is a **Cloudflare Workers-based digital waiver management system** for rental properties. It handles liability waivers for adventure activities, generates PDFs with signatures, and manages document storage and delivery.

## Architecture Summary

### Core Components

1. **Main Worker** (`src/index.mjs`)
   - Routes: `/`, `/submit`, `/admin/search`, `/status`, `/download/:key`
   - Handles form submission, database operations, and orchestrates PDF generation

2. **PDF Generation** (`src/pdf.js`)
   - Uses pdf-lib library for in-memory PDF generation
   - No external service dependencies
   - Runs entirely within the main worker

3. **Email Service** (`src/mail.js`)
   - Uses Resend API for transactional emails
   - Sends waiver PDFs as attachments
   - Supports sending to public/unverified email addresses

4. **Frontend SPA** (`src/spa.js`)
   - Single-page application with digital signature capture
   - Checkbox-based activity selection with inline initials
   - Responsive grid layout for activities

5. **Storage Systems**
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

### 3. PDF Generation
- Uses **pdf-lib** for programmatic PDF creation
- No external service dependencies - runs in-memory
- Supports embedding PNG signature images
- A4 page size (595 x 842 points)

### 4. Email Service
- Uses **Resend** API (free tier: 3,000 emails/month)
- Requires `RESEND_API_KEY` secret
- Sender email must match verified domain
- Supports PDF attachments via base64 encoding

### 5. Development Mode
- Set `DEV_MODE = "true"` in wrangler.toml for development
- Bypasses email sending, provides download buttons instead
- PDFs are still generated and stored in R2

### 6. Running Locally
```bash
# Local development (pdf-lib runs in-process)
wrangler dev --local

# Remote development (uses production D1/KV/R2)
wrangler dev --remote
```

## Common Issues and Solutions

### Issue: "Worker threw exception"
**Cause**: Database not initialized or binding misconfigured
**Solution**:
```bash
wrangler d1 execute waivers --local --file=migrations/0001_init.sql
```

### Issue: Activities not displaying
**Cause**: KV namespace not populated with property data
**Solution**:
```bash
wrangler kv key put --binding=PROPS_KV props '[...]' --preview
```

### Issue: PDF signature not displaying
**Cause**: Signature image must be PNG format (data:image/png;base64,...)
**Solution**: Ensure signature canvas exports as PNG, not JPEG

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
│   ├── pdf.js             # PDF generation using pdf-lib
│   ├── mail.js            # Email sending via Resend
│   └── resp.js            # Response utilities
├── migrations/             # Database schema
└── wrangler.toml          # Worker configuration
```

## Environment Variables

### Required Secrets
- `RESEND_API_KEY` - Resend API key for sending emails (get from resend.com)

### Configuration Variables
- `ARCHERY_PIN` - Special PIN for archery activity
- `LEGAL_VERSION` - Version string for legal documents
- `EMAIL_FROM` - From address for waiver emails
- `DEV_MODE` - Enable development mode features

## Deployment Process

1. Initialize remote database: `wrangler d1 execute waivers --remote --file=migrations/0001_init.sql`
2. Populate KV namespace with property data
3. Set Resend API key: `wrangler secret put RESEND_API_KEY`
4. Deploy main worker: `wrangler deploy`

## Important Commands

```bash
# Local development
wrangler dev --local

# View logs
wrangler tail

# Set Resend API key
wrangler secret put RESEND_API_KEY

# Update KV data
wrangler kv key put --binding=PROPS_KV props '[...]' --preview

# Database migrations
wrangler d1 execute waivers --local --file=migrations/0001_init.sql

# Deploy to production
wrangler deploy
```

## Recent Changes (Latest Session)

- Replaced Cloudflare Browser Rendering with pdf-lib for in-memory PDF generation
- Consolidated email functionality into main worker using Resend API
- Removed browser-worker and email-worker service dependencies
- Simplified deployment to single worker architecture
- Updated PDF generation to use programmatic text and image drawing
- No longer requires external browser rendering service

## Notes for Future Development

1. **Email Service**: Currently uses Resend API directly. Could be migrated to queue-based system for better reliability at scale.

2. **Activity Configuration**: Activities are currently hardcoded in KV. Consider adding admin interface for dynamic management.

3. **PDF Templates**: PDF layout in pdf.js could be enhanced with more sophisticated formatting, multi-page support, and custom fonts.

4. **Multi-tenancy**: System assumes single property. Could be extended for multiple properties with separate configurations.

5. **Validation**: Client-side validation could be enhanced with more robust server-side checks.

6. **Signature Format**: Consider supporting JPEG signatures in addition to PNG for broader compatibility.

---

*Last Updated: 2025-10-01*
*This document helps AI assistants understand the codebase structure, common issues, and development patterns.*