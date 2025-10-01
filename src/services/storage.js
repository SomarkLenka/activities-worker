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
    // Insert document
    await env.waivers.prepare(
        'INSERT INTO documents VALUES(?1,?2,?3,?4,?5)'
      ).bind(p.id, subId, p.activity, p.r2Key, p.initials).run();

    // Insert hash
    const hashId = `hash_${p.id}`;
    await env.waivers.prepare(
        'INSERT INTO hashes VALUES(?1,?2,?3,?4)'
      ).bind(hashId, p.id, p.hash, now).run();
  }
}
