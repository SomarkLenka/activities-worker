import { json } from '../../utils/admin.js';

export async function handleAdminRisks(request, env) {
  const url = new URL(request.url);
  const level = url.searchParams.get('level');

  if (request.method === 'GET') {
    if (level) {
      return await getRisk(env, level);
    }
    return await getAllRisks(env);
  }

  if (request.method === 'POST') {
    return await updateRisk(request, env);
  }

  return new Response('Method not allowed', { status: 405 });
}

async function getAllRisks(env) {
  const result = await env.waivers.prepare(
    'SELECT level, description FROM risk_descriptions'
  ).all();

  const risks = {};
  for (const row of (result.results || [])) {
    risks[row.level] = { level: row.level, description: row.description };
  }

  return json({ ok: true, risks });
}

async function getRisk(env, level) {
  const result = await env.waivers.prepare(
    'SELECT level, description FROM risk_descriptions WHERE level = ?'
  ).bind(level).first();

  if (!result) {
    return json({ ok: false, error: 'Risk level not found' }, 404);
  }

  return json({ ok: true, risk: { level: result.level, description: result.description } });
}

async function updateRisk(request, env) {
  const data = await request.json();

  if (!data.level || !data.description) {
    return json({ ok: false, error: 'Must provide level and description' }, 400);
  }

  if (!['low', 'medium', 'high'].includes(data.level)) {
    return json({ ok: false, error: 'level must be low, medium, or high' }, 400);
  }

  const existingCheck = await env.waivers.prepare(
    'SELECT level FROM risk_descriptions WHERE level = ?'
  ).bind(data.level).first();

  if (existingCheck) {
    await env.waivers.prepare(
      'UPDATE risk_descriptions SET description = ? WHERE level = ?'
    ).bind(data.description, data.level).run();
  } else {
    await env.waivers.prepare(
      'INSERT INTO risk_descriptions (level, description, created_at) VALUES (?, ?, ?)'
    ).bind(data.level, data.description, new Date().toISOString()).run();
  }

  const riskData = {
    level: data.level,
    description: data.description
  };

  return json({ ok: true, risk: riskData });
}
