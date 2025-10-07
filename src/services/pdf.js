import { nanoid } from '../utils/nanoid.js';

async function generateDocumentHash(data) {
  const hashInput = JSON.stringify({
    submission_id: data.submission_id,
    property_id: data.property_id,
    checkin_date: data.checkin_date,
    guest_name: data.guest_name,
    guest_email: data.guest_email,
    activity: data.activity,
    activity_label: data.activity_label,
    initials: data.initials,
    signature_key: data.signature_key,
    created_at: data.created_at,
    release_version: data.release_version,
    release_date: data.release_date
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

function generateWaiverHTML(data, activityInfo, riskData, latestRelease, documentId, documentHash) {
  const riskLevel = activityInfo?.risk || 'medium';
  const activityLabel = activityInfo?.label || data.activity;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 50pt 50pt 80pt 50pt;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 20pt;
      font-weight: bold;
      margin: 0 0 40px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .details {
      margin-bottom: 40px;
      line-height: 2;
      font-size: 12pt;
    }

    .risk-section {
      margin: 30px 0 40px 0;
    }

    .risk-level {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 12px;
    }

    .risk-description {
      color: #4d4d4d;
      font-size: 10pt;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .waiver-section {
      margin: 30px 0 40px 0;
    }

    .waiver-title {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 12px;
    }

    .waiver-text {
      font-size: 9pt;
      line-height: 1.55;
      white-space: pre-wrap;
      text-align: justify;
    }

    .signature-section {
      margin-top: 50px;
      page-break-inside: avoid;
    }

    .signature-label {
      font-size: 12pt;
      margin-bottom: 10px;
      font-weight: normal;
    }

    .signature-image {
      max-width: 400px;
      max-height: 150px;
      display: block;
      margin-top: 10px;
    }

    .no-signature {
      color: #808080;
      font-size: 10pt;
      font-style: italic;
    }

    .footer {
      position: fixed;
      bottom: 30pt;
      right: 50pt;
      text-align: right;
      font-size: 7pt;
      color: #808080;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <h1>${activityLabel.toUpperCase()} — Release of Liability</h1>

  <div class="details">
    Property  : ${data.propertyId}<br>
    Check-in  : ${data.checkinDate}<br>
    Guest     : ${data.guestName}<br>
    Initials  : ${data.initials[data.activity]}
  </div>

  <div class="risk-section">
    <div class="risk-level">Risk Level: ${riskLevel.toUpperCase()}</div>
    ${riskData?.description ? `<div class="risk-description">${riskData.description}</div>` : ''}
  </div>

  <div class="waiver-section">
    <div class="waiver-title">Waiver and Release:</div>
    <div class="waiver-text">${latestRelease.waiver_text}</div>
  </div>

  <div class="signature-section">
    <div class="signature-label">Signature:</div>
    ${data.signature ? `<img src="${data.signature}" class="signature-image" alt="Guest signature" />` : '<p class="no-signature">No signature provided</p>'}
  </div>

  <div class="footer">
    Legal Version ${latestRelease.version} (${latestRelease.release_date}) • Document ID: ${documentId}<br>
    Verification Hash: ${documentHash.substring(0, 32)}...
  </div>
</body>
</html>`;
}

export async function makePDFs(data, subId, env) {
  const now = new Date();
  const createdAt = now.toISOString();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  // Fetch latest legal release
  const latestRelease = await env.waivers.prepare(
    'SELECT version, release_date, waiver_text FROM releases ORDER BY release_date DESC, version DESC LIMIT 1'
  ).first();

  if (!latestRelease) {
    throw new Error('No legal release found. Please create a release in the admin panel first.');
  }

  // Fetch activity info from database
  const activitiesResult = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ?'
  ).bind(data.propertyId).all();
  const activities = activitiesResult.results || [];

  // Fetch risk descriptions from database
  const risksResult = await env.waivers.prepare(
    'SELECT level, description FROM risk_descriptions'
  ).all();
  const risks = {};
  for (const row of (risksResult.results || [])) {
    risks[row.level] = { description: row.description };
  }

  // Save signature to R2 (once per submission, not per activity)
  let signatureKey = null;
  if (data.signature) {
    try {
      const signatureData = data.signature.split(',')[1];
      const signatureBytes = Uint8Array.from(atob(signatureData), c => c.charCodeAt(0));

      const nameParts = data.guestName.trim().split(/\s+/);
      const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
      const lastName = nameParts.length > 1
        ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '')
        : 'unknown';

      signatureKey = `waivers/${y}/${m}/${d}/${data.propertyId}/signatures/${lastName}-${firstName}-${subId}.png`;

      await env.WAIVERS_R2.put(signatureKey, signatureBytes, {
        httpMetadata: { contentType: 'image/png' }
      });
    } catch (err) {
      console.error('Error saving signature to R2:', err);
    }
  }

  const results = [];

  for (const act of data.activities) {
    const activityInfo = activities.find(a => a.slug === act);
    const riskLevel = activityInfo?.risk || 'medium';
    const riskData = risks[riskLevel];

    const nameParts = data.guestName.trim().split(/\s+/);
    const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
    const lastName = nameParts.length > 1
      ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '')
      : 'unknown';

    const documentId = nanoid(12);

    const hashData = {
      submission_id: subId,
      property_id: data.propertyId,
      checkin_date: data.checkinDate,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      activity: act,
      activity_label: activityInfo?.label || act,
      initials: data.initials[act],
      signature_key: signatureKey,
      created_at: createdAt,
      release_version: latestRelease.version,
      release_date: latestRelease.release_date
    };

    const documentHash = await generateDocumentHash(hashData);

    // Generate HTML for this activity
    const htmlContent = generateWaiverHTML(
      { ...data, activity: act },
      activityInfo,
      riskData,
      latestRelease,
      documentId,
      documentHash
    );

    // Use Cloudflare Browser Rendering via service binding
    let pdfBytes;
    try {
      // Create a data URL with the HTML content
      const htmlDataUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(htmlContent)))}`;

      // Try common endpoint patterns - adjust based on your browser-worker implementation
      const response = await env.BROWSER.fetch('https://render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: htmlDataUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Browser rendering failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      pdfBytes = await response.arrayBuffer();
    } catch (err) {
      console.error('Error generating PDF with browser rendering:', err);
      throw new Error(`Failed to generate PDF for activity ${act}: ${err.message}`);
    }

    // Save to R2
    const filename = `${lastName}-${firstName}-${subId}.pdf`;
    const key = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/${lastName}-${firstName}-${subId}.pdf`;

    await env.WAIVERS_R2.put(key, pdfBytes, {
      httpMetadata: { contentType: 'application/pdf' }
    });

    results.push({
      id: documentId,
      activity: act,
      activityLabel: activityInfo?.label || act,
      filename,
      r2Key: key,
      bytes: pdfBytes,
      hash: documentHash,
      initials: data.initials[act]
    });
  }

  return results;
}
