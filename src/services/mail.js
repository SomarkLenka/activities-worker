import { Resend } from 'resend';
import verificationEmailTemplate from '../templates/email-verification.html';
import verificationTextTemplate from '../templates/email-verification.txt';
import waiverEmailTemplate from '../templates/email-waiver.html';
import waiverTextTemplate from '../templates/email-waiver.txt';

function parseEmailTemplate(template) {
  const lines = template.split('\n');
  const headers = {};
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('SUBJECT:')) {
      headers.subject = lines[i].substring(8).trim();
    } else if (lines[i].startsWith('FROM:')) {
      headers.from = lines[i].substring(5).trim();
    } else if (lines[i].trim() === '') {
      bodyStart = i + 1;
      break;
    }
  }

  headers.body = lines.slice(bodyStart).join('\n');
  return headers;
}

export async function sendVerificationEmail(email, name, verificationUrl, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const textTemplateProcessed = verificationTextTemplate
    .replace('{{GUEST_NAME}}', name)
    .replace('{{VERIFICATION_URL}}', verificationUrl);

  const htmlTemplateProcessed = verificationEmailTemplate
    .replace('{{GUEST_NAME}}', name)
    .replace('{{VERIFICATION_URL}}', verificationUrl);

  const { subject, from, body: bodyText } = parseEmailTemplate(textTemplateProcessed);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `${from} <${env.EMAIL_FROM}>`,
      to: email,
      subject,
      text: bodyText,
      html: htmlTemplateProcessed
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

  const textTemplateProcessed = waiverTextTemplate
    .replace('{{GUEST_NAME}}', data.guestName)
    .replace('{{PROPERTY_ID}}', data.propertyId)
    .replace('{{PDF_LIST}}', pdfListText)
    .replace('{{ARCHERY_PIN}}', archeryPinText);

  const htmlTemplateProcessed = waiverEmailTemplate
    .replace('{{GUEST_NAME}}', data.guestName)
    .replace('{{PROPERTY_ID}}', data.propertyId)
    .replace('{{PDF_LIST}}', pdfListHtml)
    .replace('{{ARCHERY_PIN}}', archeryPinHtml);

  const { subject, from, body: bodyText } = parseEmailTemplate(textTemplateProcessed);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `${from} <${env.EMAIL_FROM}>`,
      to: data.guestEmail,
      subject,
      text: bodyText,
      html: htmlTemplateProcessed,
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
