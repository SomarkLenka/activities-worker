import { json } from '../../utils/admin.js';

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

export async function handleAdminVerify(request, env) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get('document');

  if (!documentId) {
    return json({ ok: false, error: 'Missing document ID' }, 400);
  }

  try {
    // Get stored hash
    const hashResult = await env.waivers.prepare(
      'SELECT hash_value FROM hashes WHERE document_id = ?1'
    ).bind(documentId).first();

    if (!hashResult) {
      return json({ ok: false, error: 'Hash not found' }, 404);
    }

    // Get document and submission data
    const docData = await env.waivers.prepare(`
      SELECT
        d.activity,
        d.initials,
        s.submission_id,
        s.created_at,
        s.property_id,
        s.checkin_date,
        s.guest_name,
        s.guest_email
      FROM documents d
      JOIN submissions s ON d.submission_id = s.submission_id
      WHERE d.document_id = ?1
    `).bind(documentId).first();

    if (!docData) {
      return json({ ok: false, error: 'Document not found' }, 404);
    }

    // Get activity info for label
    const activityResult = await env.waivers.prepare(
      'SELECT label FROM activities WHERE property_id = ? AND slug = ?'
    ).bind(docData.property_id, docData.activity).first();
    const activityInfo = activityResult ? { label: activityResult.label } : null;

    // Construct signature key (deterministic from submission data)
    const nameParts = docData.guest_name.trim().split(/\s+/);
    const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
    const lastName = nameParts.length > 1
      ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '')
      : 'unknown';

    const createdDate = new Date(docData.created_at);
    const y = createdDate.getUTCFullYear();
    const m = String(createdDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(createdDate.getUTCDate()).padStart(2, '0');

    const signatureKey = `waivers/${y}/${m}/${d}/${docData.property_id}/signatures/${lastName}-${firstName}-${docData.submission_id}.png`;

    // Get latest release at time of document creation
    const release = await env.waivers.prepare(
      'SELECT version, release_date FROM releases WHERE release_date <= ?1 ORDER BY release_date DESC, version DESC LIMIT 1'
    ).bind(docData.created_at.split('T')[0]).first();

    if (!release) {
      return json({ ok: false, error: 'No release found for document creation date' }, 404);
    }

    const hashData = {
      submission_id: docData.submission_id,
      property_id: docData.property_id,
      checkin_date: docData.checkin_date,
      guest_name: docData.guest_name,
      guest_email: docData.guest_email,
      activity: docData.activity,
      activity_label: activityInfo?.label || docData.activity,
      initials: docData.initials || '',
      signature_key: signatureKey,
      created_at: docData.created_at,
      release_version: release.version,
      release_date: release.release_date
    };

    const computedHash = await generateDocumentHash(hashData);
    const verified = computedHash === hashResult.hash_value;

    return json({
      ok: true,
      verified,
      stored_hash: hashResult.hash_value,
      computed_hash: computedHash
    });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
