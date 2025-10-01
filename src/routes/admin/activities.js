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
  const key = `property:${propertyId}:activities`;
  const activities = await env.PROPS_KV.get(key, 'json');

  if (!activities) {
    return json({ ok: false, error: 'Property not found' }, 404);
  }

  return json({ ok: true, propertyId, activities });
}

async function addActivity(request, env, propertyId) {
  const data = await request.json();

  if (!data.slug || !data.label || !data.risk) {
    return json({ ok: false, error: 'Must provide slug, label, and risk' }, 400);
  }

  const key = `property:${propertyId}:activities`;
  const activities = await env.PROPS_KV.get(key, 'json') || [];

  if (activities.find(a => a.slug === data.slug)) {
    return json({ ok: false, error: 'Activity with this slug already exists' }, 400);
  }

  activities.push({
    slug: data.slug,
    label: data.label,
    risk: data.risk
  });

  await env.PROPS_KV.put(key, JSON.stringify(activities));

  return json({ ok: true, propertyId, activities, added: data.slug });
}

async function removeActivity(request, env, propertyId) {
  const data = await request.json();

  if (!data.slug) {
    return json({ ok: false, error: 'Must provide slug' }, 400);
  }

  const key = `property:${propertyId}:activities`;
  const activities = await env.PROPS_KV.get(key, 'json') || [];

  const filtered = activities.filter(a => a.slug !== data.slug);

  if (filtered.length === activities.length) {
    return json({ ok: false, error: 'Activity not found' }, 404);
  }

  await env.PROPS_KV.put(key, JSON.stringify(filtered));

  return json({ ok: true, propertyId, activities: filtered, removed: data.slug });
}

async function updateActivity(request, env, propertyId) {
  const data = await request.json();

  if (!data.slug) {
    return json({ ok: false, error: 'Must provide slug' }, 400);
  }

  const key = `property:${propertyId}:activities`;
  const activities = await env.PROPS_KV.get(key, 'json') || [];

  const index = activities.findIndex(a => a.slug === data.slug);

  if (index === -1) {
    return json({ ok: false, error: 'Activity not found' }, 404);
  }

  if (data.label) activities[index].label = data.label;
  if (data.risk) activities[index].risk = data.risk;

  await env.PROPS_KV.put(key, JSON.stringify(activities));

  return json({ ok: true, propertyId, activities, updated: data.slug });
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

  const key = `property:${propertyId}:activities`;
  await env.PROPS_KV.put(key, JSON.stringify(data.activities));

  return json({ ok: true, propertyId, activities: data.activities });
}
