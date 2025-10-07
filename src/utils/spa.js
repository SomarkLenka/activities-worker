import spaTemplate from '../templates/spa.html';
import spaScript from '../templates/spa.js';

export async function htmlPage(env, submissionToken = null) {
  let submissionData = null;

  // If token provided, fetch submission details
  if (submissionToken) {
    const result = await env.waivers.prepare(
      'SELECT submission_id, property_id, checkin_date, guest_name, guest_email, status, token_expires_at FROM submissions WHERE verification_token = ?'
    ).bind(submissionToken).first();

    if (result && result.status === 'pending') {
      const expires = new Date(result.token_expires_at);
      if (expires > new Date()) {
        submissionData = result;
      }
    }
  }

  // Fetch all properties from database (excluding default template)
  const propertiesResult = await env.waivers.prepare(
    'SELECT id, name FROM properties WHERE id != ? ORDER BY name'
  ).bind('default').all();
  const properties = propertiesResult.results || [];

  // Fetch activities for each property
  const propsData = [];
  for (const property of properties) {
    const activitiesResult = await env.waivers.prepare(
      'SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label'
    ).bind(property.id).all();

    propsData.push({
      id: property.id,
      name: property.name,
      activities: activitiesResult.results || []
    });
  }

  // Fetch risk descriptions from database
  const risksResult = await env.waivers.prepare(
    'SELECT level, description FROM risk_descriptions'
  ).all();

  const risks = {};
  for (const row of (risksResult.results || [])) {
    risks[row.level] = { description: row.description };
  }

  // Fetch latest legal release
  const latestRelease = await env.waivers.prepare(
    'SELECT version, release_date, waiver_text FROM releases ORDER BY release_date DESC, version DESC LIMIT 1'
  ).first();

  const propsJSON = JSON.stringify(propsData);
  const props64 = btoa(unescape(encodeURIComponent(propsJSON)));

  const risksJSON = JSON.stringify(risks);
  const risks64 = btoa(unescape(encodeURIComponent(risksJSON)));

  const submissionJSON = submissionData ? JSON.stringify(submissionData) : 'null';
  const submission64 = btoa(unescape(encodeURIComponent(submissionJSON)));

  const releaseJSON = latestRelease ? JSON.stringify(latestRelease) : 'null';
  const release64 = btoa(unescape(encodeURIComponent(releaseJSON)));

  const bootstrapData = `
  let props = JSON.parse(atob('${props64}'));
  const risks = JSON.parse(atob('${risks64}'));
  const submission = JSON.parse(atob('${submission64}'));
  const release = JSON.parse(atob('${release64}'));
  `;

  const fullScript = spaScript.replace('{{BOOTSTRAP_DATA}}', bootstrapData);
  const html = spaTemplate.replace('{{BOOTSTRAP_SCRIPT}}', fullScript);

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}
