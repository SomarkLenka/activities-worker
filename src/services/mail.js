import { Resend } from 'resend';
import verificationEmailTemplate from '../templates/email-verification.html';
import verificationTextTemplate from '../templates/email-verification.txt';
import waiverEmailTemplate from '../templates/email-waiver.html';
import waiverTextTemplate from '../templates/email-waiver.txt';

export async function sendVerificationEmail(email, name, verificationUrl, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const bodyText = verificationTextTemplate
    .replace('{{GUEST_NAME}}', name)
    .replace('{{VERIFICATION_URL}}', verificationUrl);

  const bodyHtml = verificationEmailTemplate
    .replace('{{GUEST_NAME}}', name)
    .replace('{{VERIFICATION_URL}}', verificationUrl);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Activity Waivers <${env.EMAIL_FROM}>`,
      to: email,
      subject: 'Complete Your Activity Waiver',
      text: bodyText,
      html: bodyHtml
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Verification email sent successfully:', emailData);
  } catch (error) {
    console.error('Verification email send error:', error);
    throw new Error('Failed to send verification email: ' + error.message);
  }
}

export async function sendWaiverEmail(data, pdfs, pin, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const pdfListHtml = pdfs.map(p => `<li>${p.filename}</li>`).join('');
  const pdfListText = pdfs.map(p => p.filename).join(', ');

  const archeryPinHtml = pin
    ? `<div style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 20px 0;">
         <p style="margin: 0; color: #78350f; font-weight: 600;">Your Archery PIN: <strong>${pin}</strong></p>
       </div>`
    : '';

  const archeryPinText = pin ? `Your Archery PIN is ${pin}\n\n` : '';

  const bodyText = waiverTextTemplate
    .replace('{{GUEST_NAME}}', data.guestName)
    .replace('{{PROPERTY_ID}}', data.propertyId)
    .replace('{{PDF_LIST}}', pdfListText)
    .replace('{{ARCHERY_PIN}}', archeryPinText);

  const bodyHtml = waiverEmailTemplate
    .replace('{{GUEST_NAME}}', data.guestName)
    .replace('{{PROPERTY_ID}}', data.propertyId)
    .replace('{{PDF_LIST}}', pdfListHtml)
    .replace('{{ARCHERY_PIN}}', archeryPinHtml);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Activity Waivers <${env.EMAIL_FROM}>`,
      to: data.guestEmail,
      subject: 'Your activity waiver(s)',
      text: bodyText,
      html: bodyHtml,
      attachments: pdfs.map(p => ({
        filename: p.filename,
        content: btoa(String.fromCharCode(...new Uint8Array(p.bytes)))
      }))
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', emailData);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
}
