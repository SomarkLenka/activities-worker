import { createDocument, createHash, createSubmissionActivity } from '../utils/db.js';

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
    await createDocument(env, p.id, subId, p.activity, p.r2Key, p.initials);

    const hashId = `hash_${p.id}`;
    await createHash(env, hashId, p.id, p.hash, now);
  }
}

export async function saveSubmissionActivities(env, verificationToken, pdfInfos, createdAt) {
  for (const p of pdfInfos) {
    await createSubmissionActivity(
      env,
      p.id,
      verificationToken,
      p.activity,
      p.activityLabel,
      p.initials,
      p.hash,
      p.r2Key,
      createdAt
    );
  }
}
