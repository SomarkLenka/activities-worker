import { json } from '../../utils/admin.js';

const CACHE_KEY = 'admin_debug_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function handleAdminDebug(request, env) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';

  try {
    // Fetch fresh data from database
    const debugData = {
      timestamp: Date.now(),
      d1: {}
    };

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

    return json({
      ok: true,
      lastUpdate: new Date(debugData.timestamp).toISOString(),
      d1: debugData.d1
    });

  } catch (error) {
    console.error('Debug data error:', error);
    return json({ ok: false, error: error.message }, 500);
  }
}
