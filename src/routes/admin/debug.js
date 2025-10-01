import { json } from '../../utils/admin.js';

const CACHE_KEY = 'admin_debug_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function handleAdminDebug(request, env) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';

  try {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = await env.PROPS_KV.get(CACHE_KEY, 'json');
      if (cached && cached.timestamp) {
        const age = Date.now() - cached.timestamp;
        if (age < CACHE_DURATION) {
          return json({
            ok: true,
            lastUpdate: new Date(cached.timestamp).toISOString(),
            kv: cached.kv,
            d1: cached.d1
          });
        }
      }
    }

    // Fetch fresh data
    const debugData = {
      timestamp: Date.now(),
      kv: {},
      d1: {}
    };

    // Get all KV keys
    const kvList = await env.PROPS_KV.list();
    for (const key of kvList.keys) {
      const value = await env.PROPS_KV.get(key.name, 'json');
      debugData.kv[key.name] = value;
    }

    // Get all D1 tables
    const tables = await env.waivers.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name"
    ).all();

    for (const table of tables.results) {
      const tableName = table.name;

      // Get count
      const countResult = await env.waivers.prepare(
        `SELECT COUNT(*) as count FROM ${tableName}`
      ).first();

      // Get rows
      const rowsResult = await env.waivers.prepare(
        `SELECT * FROM ${tableName} LIMIT 50`
      ).all();

      debugData.d1[tableName] = {
        count: countResult.count,
        rows: rowsResult.results || []
      };
    }

    // Cache the data
    await env.PROPS_KV.put(CACHE_KEY, JSON.stringify(debugData));

    return json({
      ok: true,
      lastUpdate: new Date(debugData.timestamp).toISOString(),
      kv: debugData.kv,
      d1: debugData.d1
    });

  } catch (error) {
    console.error('Debug data error:', error);
    return json({ ok: false, error: error.message }, 500);
  }
}
