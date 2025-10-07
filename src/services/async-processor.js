import { makePDFs } from './pdf.js';
import { sendWaiverEmail } from './mail.js';
import { saveDocuments, saveSubmissionActivities } from './storage.js';

/**
 * Process waiver submission asynchronously with retry logic
 * @param {Object} submissionData - Submission data
 * @param {string} submissionId - Submission ID
 * @param {string} verificationToken - Verification token
 * @param {Object} env - Environment bindings
 * @param {number} retryCount - Current retry attempt (default: 0)
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 */
export async function processWaiverAsync(submissionData, submissionId, verificationToken, env, retryCount = 0, maxRetries = 3) {
  try {
    console.log(`Processing waiver for submission ${submissionId} (attempt ${retryCount + 1}/${maxRetries + 1})`);

    // Generate PDFs
    const pdfs = await makePDFs(submissionData, submissionId, env);

    // Save to database
    const completedAt = new Date().toISOString();
    await saveDocuments(env, submissionId, pdfs);
    await saveSubmissionActivities(env, verificationToken, pdfs, completedAt);

    // Generate archery PIN if needed
    let archeryPin = null;
    if (submissionData.activities.includes('archery')) {
      archeryPin = env.ARCHERY_PIN || '1234';
    }

    // Send email with waivers
    await sendWaiverEmail(submissionData, pdfs, archeryPin, env);

    console.log(`Successfully processed waiver for submission ${submissionId}`);

    // Update submission status to indicate email sent
    await env.waivers.prepare(
      'UPDATE submissions SET status = ? WHERE submission_id = ?'
    ).bind('emailed', submissionId).run();

  } catch (error) {
    console.error(`Error processing waiver for submission ${submissionId} (attempt ${retryCount + 1}):`, error);

    // Retry with exponential backoff
    if (retryCount < maxRetries) {
      const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${delayMs}ms...`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
      return await processWaiverAsync(submissionData, submissionId, verificationToken, env, retryCount + 1, maxRetries);
    } else {
      console.error(`Failed to process waiver for submission ${submissionId} after ${maxRetries + 1} attempts`);

      // Mark submission as failed
      await env.waivers.prepare(
        'UPDATE submissions SET status = ?, error_message = ? WHERE submission_id = ?'
      ).bind('failed', error.message, submissionId).run();

      throw error;
    }
  }
}

/**
 * Validate initials - ensure all are provided and consistent
 * @param {Array} activities - Array of activity slugs
 * @param {Object} initials - Object mapping activity slug to initials
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateInitials(activities, initials) {
  // Check all activities have initials
  for (const activity of activities) {
    if (!initials[activity] || initials[activity].trim() === '') {
      return {
        valid: false,
        error: `Missing initials for activity: ${activity}`
      };
    }
  }

  // Check all initials are the same (2-3 characters, alphanumeric)
  const initialValues = Object.values(initials);
  const firstInitial = initialValues[0].trim().toUpperCase();

  // Validate format (2-3 characters, letters only)
  if (!/^[A-Z]{2,3}$/.test(firstInitial)) {
    return {
      valid: false,
      error: 'Initials must be 2-3 letters only'
    };
  }

  // Check all match
  for (const initial of initialValues) {
    if (initial.trim().toUpperCase() !== firstInitial) {
      return {
        valid: false,
        error: 'All initials must be the same'
      };
    }
  }

  return { valid: true };
}
