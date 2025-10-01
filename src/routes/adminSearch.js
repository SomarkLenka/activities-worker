import { json } from '../utils/resp.js';

export async function handleAdminSearch(request, env) {
  const url = new URL(request.url);
  const qName  = url.searchParams.get('name')  ?? '';
  const qEmail = url.searchParams.get('email') ?? '';
  const qProp  = url.searchParams.get('prop')  ?? '';
  const qDate  = url.searchParams.get('date')  ?? '';

  const rows = await env.waivers.prepare(
      `SELECT * FROM submissions
        WHERE guest_name  LIKE ?1
          AND guest_email LIKE ?2
          AND property_id LIKE ?3
          AND checkin_date LIKE ?4
        ORDER BY created_at DESC
        LIMIT 200`
    )
    .bind(`%${qName}%`, `%${qEmail}%`, `%${qProp}%`, `%${qDate}%`)
    .all();

  return json({ rows });
}
