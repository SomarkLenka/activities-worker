export async function handleDownload(request, env) {
  const { pathname } = new URL(request.url);
  const r2Key = pathname.replace('/download/', '');

  if (env.DEV_MODE !== 'true') {
    return new Response('Downloads only available in dev mode', { status: 403 });
  }

  const object = await env.WAIVERS_R2.get(r2Key);

  if (!object) {
    return new Response('PDF not found', { status: 404 });
  }

  const filename = r2Key.split('/').pop();

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=300'
    }
  });
}
