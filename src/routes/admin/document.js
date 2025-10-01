import { json } from '../../utils/admin.js';

export async function handleAdminDocument(request, env) {
  const url = new URL(request.url);
  const submissionId = url.searchParams.get('submission');
  const activity = url.searchParams.get('activity');

  if (!submissionId || !activity) {
    return json({ ok: false, error: 'Missing submission or activity' }, 400);
  }

  try {
    const result = await env.waivers.prepare(
      'SELECT document_id, r2_key FROM documents WHERE submission_id = ?1 AND activity = ?2'
    ).bind(submissionId, activity).first();

    if (!result) {
      return json({ ok: false, error: 'Document not found' }, 404);
    }

    return json({
      ok: true,
      document_id: result.document_id,
      r2_key: result.r2_key
    });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
