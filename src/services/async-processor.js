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

export function validateInitials(activities, initials, guestName) {
  for (const activity of activities) {
    if (!initials[activity] || initials[activity].trim() === '') {
      return {
        valid: false,
        error: `Missing initials for activity: ${activity}`
      };
    }
  }

  // Get first and last name initials from guest name
  const nameParts = guestName.trim().split(/\s+/).filter(p => p.length > 0);
  if (nameParts.length < 2) {
    return {
      valid: false,
      error: 'Guest name must include first and last name'
    };
  }

  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

  const initialValues = Object.values(initials);
  const firstValue = initialValues[0].trim().toUpperCase();

  // Validate format: 2-5 letters only
  if (!/^[A-Z]{2,5}$/.test(firstValue)) {
    return {
      valid: false,
      error: 'Initials must be 2-5 letters only'
    };
  }

  // Validate that initials start with first name initial and contain last name initial
  if (!firstValue.startsWith(firstInitial)) {
    return {
      valid: false,
      error: `Initials must start with your first name initial (${firstInitial})`
    };
  }

  if (!firstValue.includes(lastInitial)) {
    return {
      valid: false,
      error: `Initials must include your last name initial (${lastInitial})`
    };
  }

  // Validate all initials are the same
  for (const initial of initialValues) {
    if (initial.trim().toUpperCase() !== firstValue) {
      return {
        valid: false,
        error: 'All initials must be the same'
      };
    }
  }

  return { valid: true };
}
