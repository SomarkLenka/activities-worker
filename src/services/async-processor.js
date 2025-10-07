import { makePDFs } from './pdf.js';
import { sendWaiverEmail } from './mail.js';
import { saveDocuments, saveSubmissionActivities } from './storage.js';

export async function processWaiverAsync(submissionData, submissionId, verificationToken, env, retryCount = 0, maxRetries = 3) {
  try {
    console.log(`Processing waiver for submission ${submissionId} (attempt ${retryCount + 1}/${maxRetries + 1})`);

    const pdfs = await makePDFs(submissionData, submissionId, env);

    const completedAt = new Date().toISOString();
    await saveDocuments(env, submissionId, pdfs);
    await saveSubmissionActivities(env, verificationToken, pdfs, completedAt);

    let archeryPin = null;
    if (submissionData.activities.includes('archery')) {
      archeryPin = env.ARCHERY_PIN || '1234';
    }

    await sendWaiverEmail(submissionData, pdfs, archeryPin, env);

    console.log(`Successfully processed waiver for submission ${submissionId}`);

    await env.waivers.prepare(
      'UPDATE submissions SET status = ? WHERE submission_id = ?'
    ).bind('emailed', submissionId).run();

  } catch (error) {
    console.error(`Error processing waiver for submission ${submissionId} (attempt ${retryCount + 1}):`, error);

    if (retryCount < maxRetries) {
      const delayMs = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying in ${delayMs}ms...`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
      return await processWaiverAsync(submissionData, submissionId, verificationToken, env, retryCount + 1, maxRetries);
    } else {
      console.error(`Failed to process waiver for submission ${submissionId} after ${maxRetries + 1} attempts`);

      await env.waivers.prepare(
        'UPDATE submissions SET status = ?, error_message = ? WHERE submission_id = ?'
      ).bind('failed', error.message, submissionId).run();

      throw error;
    }
  }
}

export function validateInitials(activities, initials) {
  for (const activity of activities) {
    if (!initials[activity] || initials[activity].trim() === '') {
      return {
        valid: false,
        error: `Missing initials for activity: ${activity}`
      };
    }
  }

  const initialValues = Object.values(initials);
  const firstInitial = initialValues[0].trim().toUpperCase();

  if (!/^[A-Z]{2,3}$/.test(firstInitial)) {
    return {
      valid: false,
      error: 'Initials must be 2-3 letters only'
    };
  }

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
