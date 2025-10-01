import { nanoid } from 'nanoid';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function makePDFs (data, subId, env) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  const results = [];

  for (let i = 0; i < data.activities.length; i++) {
    const act = data.activities[i];

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

    /* ----- Cloudflare Browser Rendering with retry ---------------- */
    let pdfBuffer;
    let retries = 5;
    let lastError;

    while (retries > 0) {
      try {
        pdfBuffer = await env.BROWSER.htmlToPdf({ body: html, cf: { format: 'A4' } });
        break;
      } catch (err) {
        lastError = err;
        retries--;
        const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('Rate limit'));

        if (isRateLimit && retries > 0) {
          const waitTime = (6 - retries) * 2000; // Exponential backoff: 2s, 4s, 6s, 8s
          console.log(`Rate limit hit for ${act}, waiting ${waitTime/1000}s (${retries} retries left)...`);
          await sleep(waitTime);
        } else if (retries > 0) {
          console.log(`Error generating PDF for ${act}: ${err.message}, retrying in 1s...`);
          await sleep(1000);
        }
      }
    }

    if (!pdfBuffer) {
      throw new Error(`Failed to generate PDF for ${act} after retries: ${lastError?.message || 'unknown error'}`);
    }

    /* ----- deterministic R2 key ----------------------------------- */
    const shortId  = nanoid(6);
    const filename = `${act}.pdf`;
    const key      = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/` +
                     `${data.guestName.toLowerCase().replace(/[^a-z]/g,'-')}-${shortId}.pdf`;

    await env.WAIVERS_R2.put(key, pdfBuffer, {
      httpMetadata: { contentType: 'application/pdf' }
    });

    results.push({ id: shortId, activity: act, filename, r2Key: key, bytes: pdfBuffer });

    // Add delay between requests to avoid rate limiting (except after last one)
    if (i < data.activities.length - 1) {
      await sleep(500);
    }
  }

  return results;
}
