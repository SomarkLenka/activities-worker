import adminTemplate from '../templates/admin.html';

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });

export const bad = msg => json({ ok: false, error: msg }, 400);

export async function handleAdmin() {
  return new Response(adminTemplate, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
