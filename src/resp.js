export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });

export const bad = msg => json({ ok: false, error: msg }, 400);
