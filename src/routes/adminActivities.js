import { json } from '../utils/resp.js';

export async function handleAdminActivities(request, env) {
  const url = new URL(request.url);
  const propertyId = url.searchParams.get('property') || 'cabin-12';

  if (request.method === 'GET') {
    return await getActivities(env, propertyId);
  }

  if (request.method === 'POST') {
    return await updateActivities(request, env, propertyId);
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

async function updateActivities(request, env, propertyId) {
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
