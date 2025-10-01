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
  const levels = ['low', 'medium', 'high'];
  const risks = {};

  for (const level of levels) {
    const key = `risk:${level}`;
    const riskData = await env.PROPS_KV.get(key, 'json');
    if (riskData) {
      risks[level] = riskData;
    }
  }

  return json({ ok: true, risks });
}

async function getRisk(env, level) {
  const key = `risk:${level}`;
  const riskData = await env.PROPS_KV.get(key, 'json');

  if (!riskData) {
    return json({ ok: false, error: 'Risk level not found' }, 404);
  }

  return json({ ok: true, risk: riskData });
}

async function updateRisk(request, env) {
  const data = await request.json();

  if (!data.level || !data.title || !data.description) {
    return json({ ok: false, error: 'Must provide level, title, and description' }, 400);
  }

  if (!['low', 'medium', 'high'].includes(data.level)) {
    return json({ ok: false, error: 'level must be low, medium, or high' }, 400);
  }

  const key = `risk:${data.level}`;
  const riskData = {
    level: data.level,
    title: data.title,
    description: data.description
  };

  await env.PROPS_KV.put(key, JSON.stringify(riskData));

  return json({ ok: true, risk: riskData });
}
