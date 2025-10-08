import { json } from '../utils/admin.js';

export async function handleStatus(env) {
  try {
    const now = Date.now();
    const startTime = now;

    // Database connectivity check
    const dbHealthCheck = await env.waivers.prepare('SELECT 1 as health').first();
    const dbOK = !!dbHealthCheck;

    // Get total submission counts by status
    const statusCounts = await env.waivers.prepare(`
      SELECT
        status,
        COUNT(*) as count
      FROM submissions
      GROUP BY status
    `).all();

    const submissionsByStatus = Object.fromEntries(
      statusCounts.results.map(row => [row.status, row.count])
    );

    // Get total counts
    const totals = await env.waivers.prepare(`
      SELECT
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_submissions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_submissions,
        COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as last_24h,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as last_7d
      FROM submissions
    `).first();

    // Get document counts
    const documentStats = await env.waivers.prepare(`
      SELECT
        COUNT(*) as total_documents,
        COUNT(DISTINCT submission_id) as unique_submissions,
        SUM(LENGTH(waiver_pdf_base64)) as total_storage_bytes
      FROM documents
    `).first();

    // Get recent activity (last 10 submissions)
    const recentActivity = await env.waivers.prepare(`
      SELECT
        submission_id,
        status,
        property_id,
        guest_name,
        created_at,
        completed_at
      FROM submissions
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // Get property statistics
    const propertyStats = await env.waivers.prepare(`
      SELECT
        property_id,
        COUNT(*) as submission_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM submissions
      GROUP BY property_id
      ORDER BY submission_count DESC
    `).all();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    return json({
      ok: true,
      timestamp: new Date(now).toISOString(),
      responseTimeMs: responseTime,
      database: {
        healthy: dbOK,
        connected: true
      },
      submissions: {
        total: totals.total_submissions,
        completed: totals.completed_submissions,
        failed: totals.failed_submissions,
        last24Hours: totals.last_24h,
        last7Days: totals.last_7d,
        byStatus: submissionsByStatus
      },
      documents: {
        total: documentStats.total_documents,
        uniqueSubmissions: documentStats.unique_submissions,
        totalStorageMB: (documentStats.total_storage_bytes / (1024 * 1024)).toFixed(2)
      },
      properties: {
        count: propertyStats.results.length,
        stats: propertyStats.results
      },
      recentActivity: recentActivity.results,
      environment: {
        devMode: env.DEV_MODE === 'true',
        hasR2Bucket: !!env.WAIVERS_R2,
        hasBrowser: !!env.BROWSER,
        hasEmailService: !!(env.MAILGUN_API_KEY || env.RESEND_API_KEY)
      }
    });
  } catch (error) {
    return json({
      ok: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, 500);
  }
}
