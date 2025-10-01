import { json } from '../utils/resp.js';

export async function handleStatus(env) {
  try {
    const dbOK = await env.waivers.prepare('SELECT 1').first();
    return json({ ok: true, db: !!dbOK, ts: Date.now() });
  } catch (error) {
    return json({ ok: false, error: error.message, ts: Date.now() });
  }
}
