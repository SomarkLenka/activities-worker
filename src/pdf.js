import { nanoid } from 'nanoid';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function makePDFs (data, subId, env) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  const results = [];

  for (const act of data.activities) {
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

    /* ----- Signature image ---------------------------------------- */
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

    /* ----- Footer ------------------------------------------------- */
    page.drawText(`Version ${env.LEGAL_VERSION} • hash ${subId}`, {
      x: width / 2 - 100,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    /* ----- deterministic R2 key ----------------------------------- */
    const shortId  = nanoid(6);
    const filename = `${act}.pdf`;
    const key      = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/` +
                     `${data.guestName.toLowerCase().replace(/[^a-z]/g,'-')}-${shortId}.pdf`;

    await env.WAIVERS_R2.put(key, pdfBytes, {
      httpMetadata: { contentType: 'application/pdf' }
    });

    results.push({ id: shortId, activity: act, filename, r2Key: key, bytes: pdfBytes });
  }

  return results;
}
