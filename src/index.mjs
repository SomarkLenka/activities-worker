import { nanoid }          from 'nanoid';
import { htmlPage }        from './spa.js';
import { makePDFs }        from './pdf.js';
import { sendMail }        from './mail.js';
import { json, bad }       from './resp.js';

export default {
  async fetch (request, env, ctx) {
    const { pathname } = new URL(request.url);

    try {
      if (request.method === 'GET'  && pathname === '/')              return await htmlPage(env);
      if (request.method === 'POST' && pathname === '/submit')        return submit(request, env);
      if (request.method === 'GET'  && pathname === '/admin/search')  return search(request, env);
      if (request.method === 'GET'  && pathname === '/status')        return status(env);
      if (request.method === 'GET'  && pathname.startsWith('/download/')) return downloadPDF(request, env);
      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response('Server error', { status: 500 });
    }
  }
};

/* ---------- /status ---------------------------------------------------- */
async function status (env) {
  try {
    const dbOK = await env.waivers.prepare('SELECT 1').first();
    return json({ ok: true, db: !!dbOK, ts: Date.now() });
  } catch (error) {
    return json({ ok: false, error: error.message, ts: Date.now() });
  }
}

/* ---------- /admin/search --------------------------------------------- */
async function search (request, env) {
  const url = new URL(request.url);
  const qName  = url.searchParams.get('name')  ?? '';
  const qEmail = url.searchParams.get('email') ?? '';
  const qProp  = url.searchParams.get('prop')  ?? '';
  const qDate  = url.searchParams.get('date')  ?? '';

  const rows = await env.waivers.prepare(
      `SELECT * FROM submissions
        WHERE guest_name  LIKE ?1
          AND guest_email LIKE ?2
          AND property_id LIKE ?3
          AND checkin_date LIKE ?4
        ORDER BY created_at DESC
        LIMIT 200`
    )
    .bind(`%${qName}%`, `%${qEmail}%`, `%${qProp}%`, `%${qDate}%`)
    .all();

  return json({ rows });
}

/* ---------- /submit ---------------------------------------------------- */
async function submit (request, env) {
  console.log('Submit endpoint called');
  const data = await request.json();
  console.log('Received data:', data);

  /* ---- quick validation ------------------------------------------------ */
  const must = ['propertyId','checkinDate','guestName','guestEmail',
                'activities','initials','signature','accepted'];
  for (const k of must)
    if (data[k] === undefined || data[k] === '' ||
        (Array.isArray(data[k]) && !data[k].length))
      return bad(`missing ${k}`);

  if (data.accepted !== true)
    return bad('master acceptance not ticked');

  /* ---- write one submission row --------------------------------------- */
  const subId = nanoid(10);
  const now   = new Date().toISOString();

  try {
    await env.waivers.prepare(
        'INSERT INTO submissions VALUES(?1,?2,?3,?4,?5,?6,?7)'
      ).bind(
        subId, now, data.propertyId, data.checkinDate,
        data.guestName, data.guestEmail, JSON.stringify(data.activities)
      ).run();
    console.log('Submission saved to database');
  } catch (dbError) {
    console.error('Database error:', dbError);
    return json({ ok: false, error: 'Database not initialized. Run migrations first.' }, 500);
  }

  /* ---- generate N PDFs ------------------------------------------------- */
  let pdfInfos;
  try {
    pdfInfos = await makePDFs(data, subId, env);
    console.log('PDFs generated:', pdfInfos.length);
  } catch (pdfError) {
    console.error('PDF generation error:', pdfError);
    return json({ ok: false, error: 'PDF generation failed: ' + pdfError.message }, 500);
  }

  /* ---- one row per PDF ------------------------------------------------- */
  try {
    for (const p of pdfInfos)
      await env.waivers.prepare(
          'INSERT INTO documents VALUES(?1,?2,?3,?4)'
        ).bind(p.id, subId, p.activity, p.r2Key).run();
    console.log('Document records saved');
  } catch (docError) {
    console.error('Document save error:', docError);
  }

  const pin = data.activities.includes('archery') ? env.ARCHERY_PIN : null;

  /* ---- check if in dev mode -------------------------------------------- */
  if (env.DEV_MODE === 'true') {
    // In dev mode, return download URLs instead of sending email
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

  /* ---- e-mail (production only) ---------------------------------------- */
  await sendMail(data, pdfInfos, pin, env);

  return json({ ok: true,
                emailed: pdfInfos.map(p => p.filename),
                pin });
}

/* ---------- /download/:key --------------------------------------------- */
async function downloadPDF (request, env) {
  const { pathname } = new URL(request.url);
  const r2Key = pathname.replace('/download/', '');

  // Only allow in dev mode
  if (env.DEV_MODE !== 'true') {
    return new Response('Downloads only available in dev mode', { status: 403 });
  }

  const object = await env.WAIVERS_R2.get(r2Key);

  if (!object) {
    return new Response('PDF not found', { status: 404 });
  }

  // Extract filename from the key
  const filename = r2Key.split('/').pop();

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=300'
    }
  });
}
