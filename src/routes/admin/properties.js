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
  const propertiesJSON = await env.PROPS_KV.get('properties', 'text');
  const properties = propertiesJSON ? JSON.parse(propertiesJSON) : [];

  return json({ ok: true, properties });
}

async function addProperty(request, env) {
  const data = await request.json();

  if (!data.id || !data.name) {
    return json({ ok: false, error: 'Must provide id and name' }, 400);
  }

  const propertiesJSON = await env.PROPS_KV.get('properties', 'text');
  const properties = propertiesJSON ? JSON.parse(propertiesJSON) : [];

  if (properties.find(p => p.id === data.id)) {
    return json({ ok: false, error: 'Property with this ID already exists' }, 400);
  }

  properties.push({
    id: data.id,
    name: data.name
  });

  await env.PROPS_KV.put('properties', JSON.stringify(properties));

  // Initialize activities for new property
  let activities = [];
  if (data.copyDefaultActivities) {
    // Copy from default template
    activities = await env.PROPS_KV.get('template:default-activities', 'json') || [];
  }

  await env.PROPS_KV.put(`property:${data.id}:activities`, JSON.stringify(activities));

  return json({ ok: true, properties, added: data.id });
}

async function removeProperty(request, env) {
  const data = await request.json();

  if (!data.id) {
    return json({ ok: false, error: 'Must provide id' }, 400);
  }

  const propertiesJSON = await env.PROPS_KV.get('properties', 'text');
  const properties = propertiesJSON ? JSON.parse(propertiesJSON) : [];

  // Prevent deletion if only one property left
  if (properties.length <= 1) {
    return json({ ok: false, error: 'Cannot delete the last property' }, 400);
  }

  const filtered = properties.filter(p => p.id !== data.id);

  if (filtered.length === properties.length) {
    return json({ ok: false, error: 'Property not found' }, 404);
  }

  await env.PROPS_KV.put('properties', JSON.stringify(filtered));

  // Clean up property activities
  await env.PROPS_KV.delete(`property:${data.id}:activities`);

  return json({ ok: true, properties: filtered, removed: data.id });
}
