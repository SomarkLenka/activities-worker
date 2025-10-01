import { nanoid } from 'nanoid';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function generateDocumentHash(data) {
  // Create a deterministic string from all verifiable data
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

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function makePDFs (data, subId, env) {
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

  // Fetch activity info and risk descriptions from KV
  const activities = await env.PROPS_KV.get(`property:${data.propertyId}:activities`, 'json') || [];
  const risks = {};
  for (const level of ['low', 'medium', 'high']) {
    const riskData = await env.PROPS_KV.get(`risk:${level}`, 'json');
    if (riskData) {
      risks[level] = riskData;
    }
  }

  // Save signature to R2 (once per submission, not per activity)
  let signatureKey = null;
  if (data.signature) {
    try {
      const signatureData = data.signature.split(',')[1];
      const signatureBytes = Uint8Array.from(atob(signatureData), c => c.charCodeAt(0));

      // Extract first and last name
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
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let yPos = height - 80;

    /* ----- Title -------------------------------------------------- */
    page.drawText(`${act.toUpperCase()} — Release of Liability`, {
      x: 50,
      y: yPos,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPos -= 60;

    /* ----- Property details --------------------------------------- */
    const details = [
      `Property  : ${data.propertyId}`,
      `Check-in  : ${data.checkinDate}`,
      `Guest     : ${data.guestName}`,
      `Initials  : ${data.initials[act]}`
    ];

    for (const detail of details) {
      page.drawText(detail, {
        x: 50,
        y: yPos,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPos -= 25;
    }

    /* ----- Risk acknowledgment and waiver text ------------------- */
    yPos -= 20;

    // Risk level
    const riskLabel = `Risk Level: ${riskLevel.toUpperCase()}`;
    page.drawText(riskLabel, {
      x: 50,
      y: yPos,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    if (riskData?.description) {
      const riskDesc = wrapText(riskData.description, 80);
      for (const line of riskDesc) {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPos -= 15;
      }
    }

    yPos -= 15;

    // Legal waiver text from release
    page.drawText('Waiver and Release:', {
      x: 50,
      y: yPos,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    const waiverLines = wrapText(latestRelease.waiver_text, 80);
    for (const line of waiverLines) {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 9,
        font,
        color: rgb(0, 0, 0),
      });
      yPos -= 14;
    }

    /* ----- Signature image ---------------------------------------- */
    yPos -= 20;
    page.drawText('Signature:', {
      x: 50,
      y: yPos,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    yPos -= 10;

    if (data.signature) {
      try {
        const signatureData = data.signature.split(',')[1];
        const signatureBytes = Uint8Array.from(atob(signatureData), c => c.charCodeAt(0));
        const signatureImage = await pdfDoc.embedPng(signatureBytes);

        const signatureDims = signatureImage.scale(0.5);
        page.drawImage(signatureImage, {
          x: 50,
          y: yPos - signatureDims.height,
          width: signatureDims.width,
          height: signatureDims.height,
        });
      } catch (err) {
        console.error('Error embedding signature:', err);
        page.drawText('[Signature image could not be embedded]', {
          x: 50,
          y: yPos - 20,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }

    /* ----- Generate verification hash ----------------------------- */
    // Extract first and last name (same logic as signature)
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

    /* ----- Footer ------------------------------------------------- */
    page.drawText(`Version ${latestRelease.version} (${latestRelease.release_date}) • Document ID: ${documentId}`, {
      x: 50,
      y: 40,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(`Verification Hash: ${documentHash.substring(0, 32)}...`, {
      x: 50,
      y: 28,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    /* ----- Save to R2 --------------------------------------------- */
    const filename = `${lastName}-${firstName}-${subId}.pdf`;
    const key      = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/` +
                     `${lastName}-${firstName}-${subId}.pdf`;

    await env.WAIVERS_R2.put(key, pdfBytes, {
      httpMetadata: { contentType: 'application/pdf' }
    });

    results.push({
      id: documentId,
      activity: act,
      filename,
      r2Key: key,
      bytes: pdfBytes,
      hash: documentHash,
      initials: data.initials[act]
    });
  }

  return results;
}
