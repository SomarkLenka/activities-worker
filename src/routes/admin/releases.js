import { json } from '../../utils/admin.js';

async function getLatestRelease(env) {
  return await env.waivers.prepare(
    'SELECT version, release_date, waiver_text, created_at FROM releases ORDER BY release_date DESC, version DESC LIMIT 1'
  ).first();
}

async function getAllReleases(env) {
  const result = await env.waivers.prepare(
    'SELECT version, release_date, waiver_text, created_at FROM releases ORDER BY release_date DESC, version DESC'
  ).all();
  return result.results || [];
}

function incrementVersion(version) {
  if (!version) return '1.0.0';

  const parts = version.split('.');
  if (parts.length !== 3) return '1.0.0';

  const [major, minor, patch] = parts.map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

export async function handleAdminReleases(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // GET /admin/releases - Get all releases
  if (request.method === 'GET' && pathname === '/admin/releases') {
    try {
      const current = await getLatestRelease(env);
      const releases = await getAllReleases(env);

      return json({
        ok: true,
        current,
        releases
      });
    } catch (error) {
      return json({ ok: false, error: error.message }, 500);
    }
  }

  // POST /admin/releases/create - Create new release
  if (request.method === 'POST' && pathname === '/admin/releases/create') {
    try {
      const data = await request.json();
      const { version, waiver_text } = data;

      if (!waiver_text || !waiver_text.trim()) {
        return json({ ok: false, error: 'Waiver text is required' }, 400);
      }

      let finalVersion = version;

      // Auto-increment if no version specified
      if (!finalVersion) {
        const latest = await getLatestRelease(env);
        finalVersion = incrementVersion(latest?.version);
      }

      // Validate version format
      if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(finalVersion)) {
        return json({ ok: false, error: 'Invalid version format. Must be X.Y.Z (e.g., 1.0.1)' }, 400);
      }

      // Check if version already exists
      const existing = await env.waivers.prepare(
        'SELECT version FROM releases WHERE version = ?1'
      ).bind(finalVersion).first();

      if (existing) {
        return json({ ok: false, error: `Version ${finalVersion} already exists` }, 400);
      }

      // Insert new release
      const now = new Date();
      const releaseDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const createdAt = now.toISOString();

      await env.waivers.prepare(
        'INSERT INTO releases (version, release_date, waiver_text, created_at) VALUES (?1, ?2, ?3, ?4)'
      ).bind(finalVersion, releaseDate, waiver_text.trim(), createdAt).run();

      return json({
        ok: true,
        version: finalVersion,
        release_date: releaseDate
      });
    } catch (error) {
      return json({ ok: false, error: error.message }, 500);
    }
  }

  return json({ ok: false, error: 'Not found' }, 404);
}
