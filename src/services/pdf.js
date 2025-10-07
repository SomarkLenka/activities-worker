import { nanoid } from '../utils/nanoid.js';
import waiverTemplate from '../templates/waiver.html';
import { getLatestRelease, getActivitiesByProperty, getAllRiskDescriptions } from '../utils/db.js';
import { generatePDFNative } from './pdf-native.js';
import { generatePDFWithPuppeteer, generateBatchPDFsWithPuppeteer } from './pdf-browser.js';

function parseGuestName(guestName) {
  const nameParts = guestName.trim().split(/\s+/);
  const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
  const lastName = nameParts.length > 1
    ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '')
    : 'unknown';
  return { firstName, lastName };
}

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

async function generatePDFWithBrowser(htmlContent, env) {
  return await generatePDFWithPuppeteer(htmlContent, env);
}

export async function makePDFs(data, subId, env) {
  const USE_BROWSER = env.USE_BROWSER_RENDERING !== 'false';
  const now = new Date();
  const createdAt = now.toISOString();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  const latestRelease = await getLatestRelease(env);

  if (!latestRelease) {
    throw new Error('No legal release found. Please create a release in the admin panel first.');
  }

  const activities = await getActivitiesByProperty(env, data.propertyId);

  const risks = await getAllRiskDescriptions(env);

  let signatureKey = null;
  if (data.signature) {
    try {
      const signatureData = data.signature.split(',')[1];
      const signatureBytes = Uint8Array.from(atob(signatureData), c => c.charCodeAt(0));

      const { firstName, lastName } = parseGuestName(data.guestName);

      signatureKey = `waivers/${y}/${m}/${d}/${data.propertyId}/signatures/${lastName}-${firstName}-${subId}.png`;

      await env.WAIVERS_R2.put(signatureKey, signatureBytes, {
        httpMetadata: { contentType: 'image/png' }
      });
    } catch (err) {
      console.error('Error saving signature to R2:', err);
    }
  }

  const { firstName, lastName } = parseGuestName(data.guestName);

  const hashPromises = data.activities.map(async (act) => {
    const activityInfo = activities.find(a => a.slug === act);
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
    return { act, hash: await generateDocumentHash(hashData) };
  });

  const hashes = await Promise.all(hashPromises);
  const hashMap = Object.fromEntries(hashes.map(h => [h.act, h.hash]));

  const results = [];

  if (data.activities.length === 1) {
    const act = data.activities[0];
    const activityInfo = activities.find(a => a.slug === act);
    const riskLevel = activityInfo?.risk || 'medium';
    const riskData = risks[riskLevel];
    const documentId = nanoid(12);
    const documentHash = hashMap[act];

    try {
      let pdfBytes;

      if (USE_BROWSER) {
        const htmlContent = generateWaiverHTML(
          { ...data, activity: act },
          activityInfo,
          riskData,
          latestRelease,
          documentId,
          documentHash
        );
        pdfBytes = await generatePDFWithBrowser(htmlContent, env);
      } else {
        pdfBytes = await generatePDFNative(
          { ...data, activity: act },
          activityInfo,
          riskData,
          latestRelease,
          documentId,
          documentHash
        );
      }

      const filename = `${lastName}-${firstName}-${act}-${subId}.pdf`;
      const key = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/${filename}`;

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
    } catch (err) {
      console.error('Error generating PDF with browser rendering:', err);
      throw new Error(`Failed to generate PDF for activity ${act}: ${err.message}`);
    }

  } else {
    try {
      if (USE_BROWSER) {
        const batchItems = data.activities.map((act) => {
          const activityInfo = activities.find(a => a.slug === act);
          const riskLevel = activityInfo?.risk || 'medium';
          const riskData = risks[riskLevel];
          const documentId = nanoid(12);
          const documentHash = hashMap[act];

          const htmlContent = generateWaiverHTML(
            { ...data, activity: act },
            activityInfo,
            riskData,
            latestRelease,
            documentId,
            documentHash
          );

          return {
            id: documentId,
            act: act,
            activityInfo: activityInfo,
            html: htmlContent,
            options: {
              format: 'A4',
              printBackground: true
            }
          };
        });

        const batchResult = await generateBatchPDFsWithPuppeteer(batchItems, env);
        const { results: pdfResults, failed } = batchResult;

        if (failed > 0) {
          const failedItems = pdfResults.filter(r => !r.success);
          const failedActivities = failedItems.map(r => {
            const item = batchItems.find(b => b.id === r.id);
            return item?.act || r.id;
          }).join(', ');
          throw new Error(`Failed to generate PDFs for: ${failedActivities}`);
        }

        const savePromises = pdfResults.map(async (result) => {
          const batchItem = batchItems.find(b => b.id === result.id);
          const filename = `${lastName}-${firstName}-${batchItem.act}-${subId}.pdf`;
          const key = `waivers/${y}/${m}/${d}/${data.propertyId}/${batchItem.act}/${filename}`;

          const pdfBytes = Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0));

          await env.WAIVERS_R2.put(key, pdfBytes, {
            httpMetadata: { contentType: 'application/pdf' }
          });

          return {
            id: result.id,
            activity: batchItem.act,
            activityLabel: batchItem.activityInfo?.label || batchItem.act,
            filename,
            r2Key: key,
            bytes: pdfBytes,
            hash: hashMap[batchItem.act],
            initials: data.initials[batchItem.act]
          };
        });

        results.push(...await Promise.all(savePromises));
      } else {
        const savePromises = data.activities.map(async (act) => {
          const activityInfo = activities.find(a => a.slug === act);
          const riskLevel = activityInfo?.risk || 'medium';
          const riskData = risks[riskLevel];
          const documentId = nanoid(12);
          const documentHash = hashMap[act];

          const pdfBytes = await generatePDFNative(
            { ...data, activity: act },
            activityInfo,
            riskData,
            latestRelease,
            documentId,
            documentHash
          );

          const filename = `${lastName}-${firstName}-${act}-${subId}.pdf`;
          const key = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/${filename}`;

          await env.WAIVERS_R2.put(key, pdfBytes, {
            httpMetadata: { contentType: 'application/pdf' }
          });

          return {
            id: documentId,
            activity: act,
            activityLabel: activityInfo?.label || act,
            filename,
            r2Key: key,
            bytes: pdfBytes,
            hash: documentHash,
            initials: data.initials[act]
          };
        });

        results.push(...await Promise.all(savePromises));
      }

    } catch (err) {
      console.error('Error generating PDFs with browser rendering:', err);
      throw new Error(`Failed to generate PDFs: ${err.message}`);
    }
  }

  return results;
}
