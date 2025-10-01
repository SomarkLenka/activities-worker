export async function handleAdminDownloadAll(request, env) {
  const url = new URL(request.url);
  const submissionId = url.searchParams.get('submission');

  if (!submissionId) {
    return new Response('Missing submission ID', { status: 400 });
  }

  try {
    // Get all documents for this submission
    const documents = await env.waivers.prepare(
      'SELECT document_id, activity, r2_key FROM documents WHERE submission_id = ?1'
    ).bind(submissionId).all();

    if (!documents.results || documents.results.length === 0) {
      return new Response('No documents found', { status: 404 });
    }

    // Get submission info for filename
    const submission = await env.waivers.prepare(
      'SELECT guest_name, checkin_date FROM submissions WHERE submission_id = ?1'
    ).bind(submissionId).first();

    // For now, we'll use fflate to create a zip file
    // Import at the top of the file when we add it
    const { zipSync, strToU8 } = await import('fflate');

    const files = {};

    // Fetch all PDFs from R2
    for (const doc of documents.results) {
      const obj = await env.WAIVERS_R2.get(doc.r2_key);
      if (obj) {
        const arrayBuffer = await obj.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        files[`${doc.activity}-waiver.pdf`] = uint8Array;
      }
    }

    // Create zip file
    const zipped = zipSync(files, { level: 6 });

    // Create filename from guest name and date
    const guestName = submission.guest_name.replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${guestName}-${submission.checkin_date}-waivers.zip`;

    return new Response(zipped, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error creating zip:', error);
    return new Response('Error creating zip file: ' + error.message, { status: 500 });
  }
}
