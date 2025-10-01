import { json } from '../../utils/admin.js';

export async function handleAdminSearch(request, env) {
  const url = new URL(request.url);
  const qName     = url.searchParams.get('name')     ?? '';
  const qEmail    = url.searchParams.get('email')    ?? '';
  const qProp     = url.searchParams.get('prop')     ?? '';
  const qDate     = url.searchParams.get('date')     ?? '';
  const qActivity = url.searchParams.get('activity') ?? '';

  const conditions = [];
  const params = [];

  if (qName) {
    conditions.push('guest_name LIKE ?');
    params.push(`%${qName}%`);
  }

  if (qEmail) {
    conditions.push('guest_email LIKE ?');
    params.push(`%${qEmail}%`);
  }

  if (qProp) {
    conditions.push('property_id LIKE ?');
    params.push(`%${qProp}%`);
  }

  if (qDate) {
    conditions.push('checkin_date LIKE ?');
    params.push(`%${qDate}%`);
  }

  if (qActivity) {
    conditions.push('activities LIKE ?');
    params.push(`%${qActivity}%`);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const query = `SELECT * FROM submissions
                 ${whereClause}
                 ORDER BY created_at DESC
                 LIMIT 200`;

  const rows = await env.waivers.prepare(query).bind(...params).all();

  return json({ rows });
}
