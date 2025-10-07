import spaTemplate from '../templates/spa.html';
import spaScript from '../templates/spa.js';
import {
  getSubmissionByToken,
  getAllProperties,
  getActivitiesByProperty,
  getAllRiskDescriptions,
  getLatestRelease
} from './db.js';

export async function htmlPage(env, submissionToken = null) {
  // Helper function to encode data to base64
  function encodeToBase64(data) {
    const json = data === null || data === undefined ? 'null' : JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  }

  let submissionData = null;

  // If token provided, fetch submission details
  if (submissionToken) {
    const result = await getSubmissionByToken(env, submissionToken);

    if (result && result.status === 'pending') {
      const expires = new Date(result.token_expires_at);
      if (expires > new Date()) {
        submissionData = result;
      }
    }
  }

  // Fetch all properties from database (excluding default template)
  const properties = await getAllProperties(env, true);

  // Fetch activities for each property
  const propsData = [];
  for (const property of properties) {
    const activities = await getActivitiesByProperty(env, property.id);

    propsData.push({
      id: property.id,
      name: property.name,
      activities
    });
  }

  // Fetch risk descriptions from database
  const risks = await getAllRiskDescriptions(env);

  // Fetch latest legal release
  const latestRelease = await getLatestRelease(env);

  const props64 = encodeToBase64(propsData);
  const risks64 = encodeToBase64(risks);
  const submission64 = encodeToBase64(submissionData);
  const release64 = encodeToBase64(latestRelease);

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
