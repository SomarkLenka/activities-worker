import { nanoid } from '../utils/nanoid.js';
import { makePDFs } from '../services/pdf.js';
import { sendVerificationEmail, sendWaiverEmail } from '../services/mail.js';
import { saveSubmissionActivities, saveDocuments } from '../services/storage.js';
import { processWaiverAsync, validateInitials } from '../services/async-processor.js';

export async function handleInitialSubmit(request, env) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.propertyId || !data.checkinDate || !data.guestName || !data.guestEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Generate submission ID and verification token
    const submissionId = nanoid(12);
    const verificationToken = nanoid(32);
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Create pending submission record
    await env.waivers.prepare(
      `INSERT INTO submissions
       (submission_id, created_at, property_id, checkin_date, guest_name, guest_email, activities,
        status, verification_token, token_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      submissionId,
      createdAt,
      data.propertyId,
      data.checkinDate,
      data.guestName,
      data.guestEmail,
      '[]', // Empty activities initially
      'pending',
      verificationToken,
      expiresAt
    ).run();

    // Send verification email
    const verificationUrl = `${new URL(request.url).origin}/?token=${verificationToken}`;

    if (env.DEV_MODE === 'true') {
      console.log('Dev Mode: Verification email would be sent to:', data.guestEmail);
      console.log('Dev Mode: Verification URL:', verificationUrl);

      return new Response(JSON.stringify({
        ok: true,
        devMode: true,
        submissionId,
        verificationUrl
      }), {
        headers: { 'content-type': 'application/json' }
      });
    } else {
      await sendVerificationEmail(data.guestEmail, data.guestName, verificationUrl, env);

      return new Response(JSON.stringify({
        ok: true,
        submissionId
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Initial submission error:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export async function handleCompleteSubmit(request, env, ctx) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.submissionId || !data.activities || !data.initials || !data.signature || !data.accepted) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Validate initials (all must be the same)
    const initialsValidation = validateInitials(data.activities, data.initials);
    if (!initialsValidation.valid) {
      return new Response(JSON.stringify({ ok: false, error: initialsValidation.error }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Retrieve submission
    const submission = await env.waivers.prepare(
      'SELECT * FROM submissions WHERE submission_id = ? AND status = ?'
    ).bind(data.submissionId, 'pending').first();

    if (!submission) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid or expired submission' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Check if token expired
    const expires = new Date(submission.token_expires_at);
    if (expires < new Date()) {
      return new Response(JSON.stringify({ ok: false, error: 'Verification token expired' }), {
        status: 410,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Update submission status to processing
    const completedAt = new Date().toISOString();
    await env.waivers.prepare(
      'UPDATE submissions SET status = ?, completed_at = ?, activities = ? WHERE submission_id = ?'
    ).bind(
      'processing',
      completedAt,
      JSON.stringify(data.activities),
      data.submissionId
    ).run();

    // Prepare submission data
    const submissionData = {
      propertyId: submission.property_id,
      checkinDate: submission.checkin_date,
      guestName: submission.guest_name,
      guestEmail: submission.guest_email,
      activities: data.activities,
      initials: data.initials,
      signature: data.signature
    };

    // Generate archery PIN if needed
    let archeryPin = null;
    if (data.activities.includes('archery')) {
      archeryPin = env.ARCHERY_PIN || '1234';
    }

    // Development mode - synchronous processing with downloads
    if (env.DEV_MODE === 'true') {
      const pdfs = await makePDFs(submissionData, data.submissionId, env);
      await saveDocuments(env, data.submissionId, pdfs);
      await saveSubmissionActivities(env, submission.verification_token, pdfs, completedAt);

      const downloads = pdfs.map(p => ({
        filename: p.filename,
        url: `/download/${p.id}`
      }));

      await env.waivers.prepare(
        'UPDATE submissions SET status = ? WHERE submission_id = ?'
      ).bind('completed', data.submissionId).run();

      return new Response(JSON.stringify({
        ok: true,
        devMode: true,
        downloads,
        pin: archeryPin
      }), {
        headers: { 'content-type': 'application/json' }
      });
    } else {
      // Production mode - async processing with immediate response
      // Process PDFs and send email in background
      ctx.waitUntil(
        processWaiverAsync(submissionData, data.submissionId, submission.verification_token, env)
      );

      // Return immediate success response
      return new Response(JSON.stringify({
        ok: true,
        message: 'Your waivers are being processed and will be emailed to you shortly',
        pin: archeryPin
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Complete submission error:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
