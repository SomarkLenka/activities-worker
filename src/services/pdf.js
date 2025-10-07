import { nanoid } from '../utils/nanoid.js';
import waiverTemplate from '../templates/waiver.html';
import { getLatestRelease, getActivitiesByProperty, getAllRiskDescriptions } from '../utils/db.js';

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

  const riskDescriptionHtml = riskData?.description
    ? `<div class="risk-description">${riskData.description}</div>`
    : '';

  const signatureHtml = data.signature
    ? `<img src="${data.signature}" class="signature-image" alt="Guest signature" />`
    : '<p class="no-signature">No signature provided</p>';

  return waiverTemplate
    .replace('{{ACTIVITY_LABEL}}', activityLabel.toUpperCase())
    .replace('{{PROPERTY_ID}}', data.propertyId)
    .replace('{{CHECKIN_DATE}}', data.checkinDate)
    .replace('{{GUEST_NAME}}', data.guestName)
    .replace('{{INITIALS}}', data.initials[data.activity])
    .replace('{{RISK_LEVEL}}', riskLevel.toUpperCase())
    .replace('{{RISK_DESCRIPTION}}', riskDescriptionHtml)
    .replace('{{WAIVER_TEXT}}', latestRelease.waiver_text)
    .replace('{{SIGNATURE}}', signatureHtml)
    .replace('{{RELEASE_VERSION}}', latestRelease.version)
    .replace('{{RELEASE_DATE}}', latestRelease.release_date)
    .replace('{{DOCUMENT_ID}}', documentId)
    .replace('{{DOCUMENT_HASH_SHORT}}', documentHash.substring(0, 32));
}

export async function makePDFs(data, subId, env) {
  const now = new Date();
  const createdAt = now.toISOString();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  // Fetch latest legal release
  const latestRelease = await getLatestRelease(env);

  if (!latestRelease) {
    throw new Error('No legal release found. Please create a release in the admin panel first.');
  }

  // Fetch activity info from database
  const activities = await getActivitiesByProperty(env, data.propertyId);

  // Fetch risk descriptions from database
  const risks = await getAllRiskDescriptions(env);

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
      const response = await env.BROWSER.fetch('https://render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: htmlContent,
          options: {
            format: 'A4',
            printBackground: true
          }
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
