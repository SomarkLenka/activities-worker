import { json } from '../../utils/admin.js';

export async function handleAdminActivities(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  const propertyId = url.searchParams.get('property') || 'cabin-12';

  if (request.method === 'GET') {
    return await getActivities(env, propertyId);
  }

  if (request.method === 'POST') {
    if (pathname === '/admin/activities/add') {
      return await addActivity(request, env, propertyId);
    }
    if (pathname === '/admin/activities/remove') {
      return await removeActivity(request, env, propertyId);
    }
    if (pathname === '/admin/activities/update') {
      return await updateActivity(request, env, propertyId);
    }
    return await replaceAllActivities(request, env, propertyId);
  }

  return new Response('Method not allowed', { status: 405 });
}

async function getActivities(env, propertyId) {
  const result = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
  ).bind(propertyId).all();

  return json({ ok: true, propertyId, activities: result.results || [] });
}

async function addActivity(request, env, propertyId) {
  const data = await request.json();

  if (!data.slug || !data.label || !data.risk) {
    return json({ ok: false, error: 'Must provide slug, label, and risk' }, 400);
  }

  const existingCheck = await env.waivers.prepare(
    'SELECT id FROM activities WHERE property_id = ? AND slug = ?'
  ).bind(propertyId, data.slug).first();

  if (existingCheck) {
    return json({ ok: false, error: 'Activity with this slug already exists' }, 400);
  }

  await env.waivers.prepare(
    'INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(propertyId, data.slug, data.label, data.risk, new Date().toISOString()).run();

  const result = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
  ).bind(propertyId).all();

  return json({ ok: true, propertyId, activities: result.results || [], added: data.slug });
}

async function removeActivity(request, env, propertyId) {
  const data = await request.json();

  if (!data.slug) {
    return json({ ok: false, error: 'Must provide slug' }, 400);
  }

  const existingCheck = await env.waivers.prepare(
    'SELECT id FROM activities WHERE property_id = ? AND slug = ?'
  ).bind(propertyId, data.slug).first();

  if (!existingCheck) {
    return json({ ok: false, error: 'Activity not found' }, 404);
  }

  await env.waivers.prepare(
    'DELETE FROM activities WHERE property_id = ? AND slug = ?'
  ).bind(propertyId, data.slug).run();

  const result = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
  ).bind(propertyId).all();

  return json({ ok: true, propertyId, activities: result.results || [], removed: data.slug });
}

async function updateActivity(request, env, propertyId) {
  const data = await request.json();

  if (!data.slug) {
    return json({ ok: false, error: 'Must provide slug' }, 400);
  }

  const existingCheck = await env.waivers.prepare(
    'SELECT id FROM activities WHERE property_id = ? AND slug = ?'
  ).bind(propertyId, data.slug).first();

  if (!existingCheck) {
    return json({ ok: false, error: 'Activity not found' }, 404);
  }

  const updates = [];
  const bindings = [];

  if (data.label) {
    updates.push('label = ?');
    bindings.push(data.label);
  }
  if (data.risk) {
    updates.push('risk = ?');
    bindings.push(data.risk);
  }

  if (updates.length > 0) {
    bindings.push(propertyId, data.slug);
    await env.waivers.prepare(
      `UPDATE activities SET ${updates.join(', ')} WHERE property_id = ? AND slug = ?`
    ).bind(...bindings).run();
  }

  const result = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
  ).bind(propertyId).all();

  return json({ ok: true, propertyId, activities: result.results || [], updated: data.slug });
}

async function replaceAllActivities(request, env, propertyId) {
  const data = await request.json();

  if (!Array.isArray(data.activities)) {
    return json({ ok: false, error: 'activities must be an array' }, 400);
  }

  for (const activity of data.activities) {
    if (!activity.slug || !activity.label || !activity.risk) {
      return json({ ok: false, error: 'Each activity must have slug, label, and risk' }, 400);
    }
  }

  await env.waivers.prepare(
    'DELETE FROM activities WHERE property_id = ?'
  ).bind(propertyId).run();

  const timestamp = new Date().toISOString();
  for (const activity of data.activities) {
    await env.waivers.prepare(
      'INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(propertyId, activity.slug, activity.label, activity.risk, timestamp).run();
  }

  const result = await env.waivers.prepare(
    'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
  ).bind(propertyId).all();

  return json({ ok: true, propertyId, activities: result.results || [] });
}
