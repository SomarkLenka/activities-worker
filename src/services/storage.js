export async function saveSubmission(env, subId, data, createdAt) {
  await env.waivers.prepare(
      'INSERT INTO submissions VALUES(?1,?2,?3,?4,?5,?6,?7)'
    ).bind(
      subId, createdAt, data.propertyId, data.checkinDate,
      data.guestName, data.guestEmail, JSON.stringify(data.activities)
    ).run();
}

export async function saveDocuments(env, subId, pdfInfos) {
  const now = new Date().toISOString();

  for (const p of pdfInfos) {
    // Insert document (for backward compatibility)
    await env.waivers.prepare(
        'INSERT INTO documents VALUES(?1,?2,?3,?4,?5)'
      ).bind(p.id, subId, p.activity, p.r2Key, p.initials).run();

    // Insert hash (for backward compatibility)
    const hashId = `hash_${p.id}`;
    await env.waivers.prepare(
        'INSERT INTO hashes VALUES(?1,?2,?3,?4)'
      ).bind(hashId, p.id, p.hash, now).run();
  }
}

export async function saveSubmissionActivities(env, verificationToken, pdfInfos, createdAt) {
  for (const p of pdfInfos) {
    await env.waivers.prepare(
      `INSERT INTO submission_activities
       (activity_id, verification_token, activity_slug, activity_label, initials, document_hash, r2_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      p.id,
      verificationToken,
      p.activity,
      p.activityLabel,
      p.initials,
      p.hash,
      p.r2Key,
      createdAt
    ).run();
  }
}
