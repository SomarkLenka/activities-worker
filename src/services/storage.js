export async function saveSubmission(env, subId, data) {
  const now = new Date().toISOString();

  await env.waivers.prepare(
      'INSERT INTO submissions VALUES(?1,?2,?3,?4,?5,?6,?7)'
    ).bind(
      subId, now, data.propertyId, data.checkinDate,
      data.guestName, data.guestEmail, JSON.stringify(data.activities)
    ).run();
}

export async function saveDocuments(env, subId, pdfInfos) {
  for (const p of pdfInfos) {
    await env.waivers.prepare(
        'INSERT INTO documents VALUES(?1,?2,?3,?4)'
      ).bind(p.id, subId, p.activity, p.r2Key).run();
  }
}
