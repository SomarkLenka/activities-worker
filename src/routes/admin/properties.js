import { json } from '../../utils/admin.js';

export async function handleAdminProperties(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'GET') {
    return await getProperties(env);
  }

  if (request.method === 'POST') {
    if (pathname === '/admin/properties/add') {
      return await addProperty(request, env);
    }
    if (pathname === '/admin/properties/remove') {
      return await removeProperty(request, env);
    }
  }

  return new Response('Method not allowed', { status: 405 });
}

async function getProperties(env) {
  const result = await env.waivers.prepare(
    'SELECT id, name FROM properties ORDER BY name'
  ).all();

  return json({ ok: true, properties: result.results || [] });
}

async function addProperty(request, env) {
  const data = await request.json();

  if (!data.id || !data.name) {
    return json({ ok: false, error: 'Must provide id and name' }, 400);
  }

  const existingCheck = await env.waivers.prepare(
    'SELECT id FROM properties WHERE id = ?'
  ).bind(data.id).first();

  if (existingCheck) {
    return json({ ok: false, error: 'Property with this ID already exists' }, 400);
  }

  await env.waivers.prepare(
    'INSERT INTO properties (id, name, created_at) VALUES (?, ?, ?)'
  ).bind(data.id, data.name, new Date().toISOString()).run();

  if (data.copyDefaultActivities) {
    const defaultActivities = await env.waivers.prepare(
      'SELECT slug, label, risk FROM activities WHERE property_id = (SELECT id FROM properties LIMIT 1)'
    ).all();

    for (const activity of (defaultActivities.results || [])) {
      await env.waivers.prepare(
        'INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(data.id, activity.slug, activity.label, activity.risk, new Date().toISOString()).run();
    }
  }

  const result = await env.waivers.prepare(
    'SELECT id, name FROM properties ORDER BY name'
  ).all();

  return json({ ok: true, properties: result.results || [], added: data.id });
}

async function removeProperty(request, env) {
  const data = await request.json();

  if (!data.id) {
    return json({ ok: false, error: 'Must provide id' }, 400);
  }

  const countResult = await env.waivers.prepare(
    'SELECT COUNT(*) as count FROM properties'
  ).first();

  if (countResult.count <= 1) {
    return json({ ok: false, error: 'Cannot delete the last property' }, 400);
  }

  const existingCheck = await env.waivers.prepare(
    'SELECT id FROM properties WHERE id = ?'
  ).bind(data.id).first();

  if (!existingCheck) {
    return json({ ok: false, error: 'Property not found' }, 404);
  }

  await env.waivers.prepare(
    'DELETE FROM properties WHERE id = ?'
  ).bind(data.id).run();

  const result = await env.waivers.prepare(
    'SELECT id, name FROM properties ORDER BY name'
  ).all();

  return json({ ok: true, properties: result.results || [], removed: data.id });
}
