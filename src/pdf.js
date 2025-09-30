import { nanoid } from 'nanoid';

export async function makePDFs (data, subId, env) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  const results = [];

  for (const act of data.activities) {
    /* ----- minimal HTML template ---------------------------------- */
    const html = `
    <!doctype html><meta charset="utf-8">
    <style>body{font-family:Arial;font-size:11pt;margin:2cm}</style>
    <h1>${act.toUpperCase()} — Release of Liability</h1>
    <p>Property  : ${data.propertyId}</p>
    <p>Check-in  : ${data.checkinDate}</p>
    <p>Guest     : ${data.guestName}</p>
    <p>Initials  : ${data.initials[act]}</p>
    <img src="${data.signature}" width="300">
    <footer style="position:fixed;bottom:1cm;font-size:8pt;width:100%;text-align:center">
      Version ${env.LEGAL_VERSION} • hash ${subId}
    </footer>`;

    /* ----- Cloudflare Browser Rendering --------------------------- */
    const pdfBuffer = await env.BROWSER.htmlToPdf(html, { format: 'A4' });

    /* ----- deterministic R2 key ----------------------------------- */
    const shortId  = nanoid(6);
    const filename = `${act}.pdf`;
    const key      = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/` +
                     `${data.guestName.toLowerCase().replace(/[^a-z]/g,'-')}-${shortId}.pdf`;

    await env.WAIVERS_R2.put(key, pdfBuffer, {
      httpMetadata: { contentType: 'application/pdf' }
    });

    results.push({ id: shortId, activity: act, filename, r2Key: key, bytes: pdfBuffer });
  }

  return results;
}
