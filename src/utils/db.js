export async function getSubmissionByToken(env, verificationToken) {
  return await env.waivers.prepare(
    'SELECT submission_id, property_id, checkin_date, guest_name, guest_email, status, token_expires_at FROM submissions WHERE verification_token = ?'
  ).bind(verificationToken).first();
}

export async function getSubmissionById(env, submissionId) {
  return await env.waivers.prepare(
    'SELECT * FROM submissions WHERE submission_id = ?'
  ).bind(submissionId).first();
}

export async function createSubmission(env, submissionId, verificationToken, data, createdAt, expiresAt) {
  return await env.waivers.prepare(
    `INSERT INTO submissions
     (submission_id, verification_token, property_id, checkin_date, guest_name, guest_email, status, created_at, token_expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    submissionId,
    verificationToken,
    data.propertyId,
    data.checkinDate,
    data.guestName,
    data.guestEmail,
    createdAt,
    expiresAt
  ).run();
}

export async function updateSubmissionStatus(env, submissionId, status, completedAt = null) {
  if (completedAt) {
    return await env.waivers.prepare(
      'UPDATE submissions SET status = ?, completed_at = ? WHERE submission_id = ?'
    ).bind(status, completedAt, submissionId).run();
  }
  return await env.waivers.prepare(
    'UPDATE submissions SET status = ? WHERE submission_id = ?'
  ).bind(status, submissionId).run();
}

export async function updateSubmissionActivities(env, submissionId, activities) {
  return await env.waivers.prepare(
    'UPDATE submissions SET activities = ? WHERE submission_id = ?'
  ).bind(JSON.stringify(activities), submissionId).run();
}

export async function getAllProperties(env, excludeDefault = true) {
  if (excludeDefault) {
    const result = await env.waivers.prepare(
      'SELECT id, name FROM properties WHERE id != ? ORDER BY name'
    ).bind('default').all();
    return result.results || [];
  }
  const result = await env.waivers.prepare(
    'SELECT id, name FROM properties ORDER BY name'
  ).all();
  return result.results || [];
}

export async function getPropertyById(env, propertyId) {
  return await env.waivers.prepare(
    'SELECT * FROM properties WHERE id = ?'
  ).bind(propertyId).first();
}

export async function createProperty(env, id, name) {
  return await env.waivers.prepare(
    'INSERT INTO properties (id, name) VALUES (?, ?)'
  ).bind(id, name).run();
}

export async function deleteProperty(env, id) {
  return await env.waivers.prepare(
    'DELETE FROM properties WHERE id = ?'
  ).bind(id).run();
}

export async function getActivitiesByProperty(env, propertyId) {
  const result = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
  ).bind(propertyId).all();
  return result.results || [];
}

export async function getActivityBySlug(env, propertyId, slug) {
  return await env.waivers.prepare(
    'SELECT * FROM activities WHERE property_id = ? AND slug = ?'
  ).bind(propertyId, slug).first();
}

export async function createActivity(env, propertyId, slug, label, risk) {
  return await env.waivers.prepare(
    'INSERT INTO activities (property_id, slug, label, risk) VALUES (?, ?, ?, ?)'
  ).bind(propertyId, slug, label, risk).run();
}

export async function updateActivity(env, propertyId, slug, label, risk) {
  return await env.waivers.prepare(
    'UPDATE activities SET label = ?, risk = ? WHERE property_id = ? AND slug = ?'
  ).bind(label, risk, propertyId, slug).run();
}

export async function deleteActivity(env, propertyId, slug) {
  return await env.waivers.prepare(
    'DELETE FROM activities WHERE property_id = ? AND slug = ?'
  ).bind(propertyId, slug).run();
}

export async function copyActivitiesFromDefault(env, targetPropertyId) {
  const defaultActivities = await getActivitiesByProperty(env, 'default');
  for (const activity of defaultActivities) {
    await createActivity(env, targetPropertyId, activity.slug, activity.label, activity.risk);
  }
}

export async function getAllRiskDescriptions(env) {
  const result = await env.waivers.prepare(
    'SELECT level, description FROM risk_descriptions'
  ).all();
  const risks = {};
  for (const row of (result.results || [])) {
    risks[row.level] = { description: row.description };
  }
  return risks;
}

export async function updateRiskDescription(env, level, description) {
  return await env.waivers.prepare(
    'INSERT OR REPLACE INTO risk_descriptions (level, description) VALUES (?, ?)'
  ).bind(level, description).run();
}

export async function getLatestRelease(env) {
  return await env.waivers.prepare(
    'SELECT version, release_date, waiver_text FROM releases ORDER BY release_date DESC, version DESC LIMIT 1'
  ).first();
}

export async function getAllReleases(env) {
  const result = await env.waivers.prepare(
    'SELECT version, release_date, waiver_text FROM releases ORDER BY release_date DESC, version DESC'
  ).all();
  return result.results || [];
}

export async function createRelease(env, version, releaseDate, waiverText) {
  return await env.waivers.prepare(
    'INSERT INTO releases (version, release_date, waiver_text) VALUES (?, ?, ?)'
  ).bind(version, releaseDate, waiverText).run();
}

export async function getDocumentById(env, documentId) {
  return await env.waivers.prepare(
    'SELECT * FROM documents WHERE document_id = ?'
  ).bind(documentId).first();
}

export async function getDocumentsBySubmission(env, submissionId) {
  const result = await env.waivers.prepare(
    'SELECT document_id, activity FROM documents WHERE submission_id = ? ORDER BY created_at'
  ).bind(submissionId).all();
  return result.results || [];
}

export async function createDocument(env, documentId, submissionId, activity, r2Key, initials) {
  return await env.waivers.prepare(
    'INSERT INTO documents (document_id, submission_id, activity, r2_key, initials) VALUES (?, ?, ?, ?, ?)'
  ).bind(documentId, submissionId, activity, r2Key, initials).run();
}

export async function createHash(env, hashId, documentId, hashValue, createdAt) {
  return await env.waivers.prepare(
    'INSERT INTO hashes (hash_id, document_id, hash_value, created_at) VALUES (?, ?, ?, ?)'
  ).bind(hashId, documentId, hashValue, createdAt).run();
}

export async function getHashByDocument(env, documentId) {
  return await env.waivers.prepare(
    'SELECT * FROM hashes WHERE document_id = ?'
  ).bind(documentId).first();
}

export async function createSubmissionActivity(env, activityId, verificationToken, activitySlug, activityLabel, initials, documentHash, r2Key, createdAt) {
  return await env.waivers.prepare(
    `INSERT INTO submission_activities
     (activity_id, verification_token, activity_slug, activity_label, initials, document_hash, r2_key, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    activityId,
    verificationToken,
    activitySlug,
    activityLabel,
    initials,
    documentHash,
    r2Key,
    createdAt
  ).run();
}

export async function getSubmissionActivitiesByToken(env, verificationToken) {
  const result = await env.waivers.prepare(
    'SELECT * FROM submission_activities WHERE verification_token = ?'
  ).bind(verificationToken).all();
  return result.results || [];
}

export async function searchSubmissions(env, whereClause, params) {
  const query = `
    SELECT * FROM submissions
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT 200
  `;
  const result = await env.waivers.prepare(query).bind(...params).all();
  return result.results || [];
}

export async function searchSubmissionsByActivity(env, whereClause, baseParams, activity) {
  const query = `
    SELECT DISTINCT s.*
    FROM submissions s
    LEFT JOIN submission_activities sa ON s.verification_token = sa.verification_token
    ${whereClause}
    ${baseParams.length > 0 ? 'AND' : 'WHERE'} (
      s.activities LIKE ? OR sa.activity_slug LIKE ?
    )
    ORDER BY s.created_at DESC
    LIMIT 200
  `;
  const allParams = [...baseParams, `%${activity}%`, `%${activity}%`];
  const result = await env.waivers.prepare(query).bind(...allParams).all();
  return result.results || [];
}
