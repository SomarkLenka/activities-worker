import { nanoid } from '../utils/nanoid.js';
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

function wrapText(text, maxWidth, font, fontSize) {
  // First, split by newlines to preserve intentional line breaks
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

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
    const leftMargin = 50;
    const rightMargin = 50;
    const bottomMargin = 80;
    const textWidth = width - leftMargin - rightMargin;
    let yPos = height - 80;
    let currentPage = page;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace) => {
      if (yPos - requiredSpace < bottomMargin) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPos = height - 80;
        return true;
      }
      return false;
    };

    /* ----- Title -------------------------------------------------- */
    checkNewPage(60);
    currentPage.drawText(`${act.toUpperCase()} — Release of Liability`, {
      x: leftMargin,
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
      checkNewPage(25);
      currentPage.drawText(detail, {
        x: leftMargin,
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
    checkNewPage(40);
    const riskLabel = `Risk Level: ${riskLevel.toUpperCase()}`;
    currentPage.drawText(riskLabel, {
      x: leftMargin,
      y: yPos,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    if (riskData?.description) {
      const riskDesc = wrapText(riskData.description, textWidth, font, 10);
      for (const line of riskDesc) {
        checkNewPage(15);
        currentPage.drawText(line, {
          x: leftMargin,
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
    checkNewPage(40);
    currentPage.drawText('Waiver and Release:', {
      x: leftMargin,
      y: yPos,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    const waiverLines = wrapText(latestRelease.waiver_text, textWidth, font, 9);
    for (const line of waiverLines) {
      checkNewPage(14);
      currentPage.drawText(line, {
        x: leftMargin,
        y: yPos,
        size: 9,
        font,
        color: rgb(0, 0, 0),
      });
      yPos -= 14;
    }

    /* ----- Signature image ---------------------------------------- */
    yPos -= 20;
    checkNewPage(120);
    currentPage.drawText('Signature:', {
      x: leftMargin,
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
        currentPage.drawImage(signatureImage, {
          x: leftMargin,
          y: yPos - signatureDims.height,
          width: signatureDims.width,
          height: signatureDims.height,
        });
      } catch (err) {
        console.error('Error embedding signature:', err);
        currentPage.drawText('[Signature image could not be embedded]', {
          x: leftMargin,
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
    // Add footer to the last page (currentPage) at bottom right
    const versionText = `Legal Version ${latestRelease.version} (${latestRelease.release_date}) • Document ID: ${documentId}`;
    const hashText = `Verification Hash: ${documentHash.substring(0, 32)}...`;

    const versionWidth = font.widthOfTextAtSize(versionText, 7);
    const hashWidth = font.widthOfTextAtSize(hashText, 7);

    currentPage.drawText(versionText, {
      x: width - rightMargin - versionWidth,
      y: 40,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    currentPage.drawText(hashText, {
      x: width - rightMargin - hashWidth,
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
