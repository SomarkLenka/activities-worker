import { nanoid } from '../utils/nanoid.js';
import { json, bad } from '../utils/admin.js';
import { validateSubmission } from '../services/validation.js';
import { saveSubmission, saveDocuments } from '../services/storage.js';
import { makePDFs } from '../services/pdf.js';
import { sendMail } from '../services/mail.js';

export async function handleSubmit(request, env) {
  console.log('Submit endpoint called');
  const data = await request.json();
  console.log('Received data:', data);

  /* ---- validation ----------------------------------------------------- */
  const validationError = validateSubmission(data);
  if (validationError) {
    return bad(validationError);
  }

  /* ---- write submission ----------------------------------------------- */
  const subId = nanoid(10);
  const createdAt = new Date().toISOString();

  try {
    await saveSubmission(env, subId, data, createdAt);
    console.log('Submission saved to database');
  } catch (dbError) {
    console.error('Database error:', dbError);
    return json({ ok: false, error: 'Database not initialized. Run migrations first.' }, 500);
  }

  /* ---- generate PDFs -------------------------------------------------- */
  let pdfInfos;
  try {
    pdfInfos = await makePDFs(data, subId, env);
    console.log('PDFs generated:', pdfInfos.length);
  } catch (pdfError) {
    console.error('PDF generation error:', pdfError);
    return json({ ok: false, error: 'PDF generation failed: ' + pdfError.message }, 500);
  }

  /* ---- save document records ------------------------------------------ */
  try {
    await saveDocuments(env, subId, pdfInfos);
    console.log('Document records saved');
  } catch (docError) {
    console.error('Document save error:', docError);
  }

  const pin = data.activities.includes('archery') ? env.ARCHERY_PIN : null;

  /* ---- dev mode: return download URLs --------------------------------- */
  if (env.DEV_MODE === 'true') {
    const downloads = pdfInfos.map(p => ({
      filename: p.filename,
      url: `/download/${p.r2Key}`
    }));

    return json({
      ok: true,
      devMode: true,
      downloads,
      pin
    });
  }

  /* ---- production: send email ----------------------------------------- */
  try {
    await sendMail(data, pdfInfos, pin, env);
    console.log('Email sent successfully');
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    return json({ ok: false, error: 'Email sending failed: ' + emailError.message }, 500);
  }

  return json({ ok: true,
                emailed: pdfInfos.map(p => p.filename),
                pin });
}
