import verificationEmailTemplate from '../templates/email-verification.html';
import verificationTextTemplate from '../templates/email-verification.txt';
import waiverEmailTemplate from '../templates/email-waiver.html';
import waiverTextTemplate from '../templates/email-waiver.txt';
import archeryPinHtmlTemplate from '../templates/archery-pin.html';
import archeryPinTextTemplate from '../templates/archery-pin.txt';

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

function replaceTemplateVars(template, replacements) {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

async function sendEmail(env, emailData) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...emailData,
      from: `${emailData.from} <${env.EMAIL_FROM}>`
    })
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error('Resend API error:', responseData);
    throw new Error(responseData.message || 'Failed to send email');
  }

  return responseData;
}

function buildEmailData(text, html) {
  const { subject, from, body } = parseEmailTemplate(text);
  return {
    from,
    subject,
    text: body,
    html
  };
}

export async function sendVerificationEmail(email, name, verificationUrl, env) {
  const replacements = {
    GUEST_NAME: name,
    VERIFICATION_URL: verificationUrl
  };

  const text = replaceTemplateVars(verificationTextTemplate, replacements);
  const html = replaceTemplateVars(verificationEmailTemplate, replacements);

  const emailData = buildEmailData(text, html);
  emailData.to = email;

  try {
    const responseData = await sendEmail(env, emailData);
    console.log('Verification email sent successfully:', responseData);
  } catch (error) {
    console.error('Verification email send error:', error);
    throw new Error('Failed to send verification email: ' + error.message);
  }
}

export async function sendWaiverEmail(data, pdfs, pin, env) {
  const replacements = {
    GUEST_NAME: data.guestName,
    PROPERTY_ID: data.propertyId,
    PDF_LIST: {
      text: pdfs.map(p => p.filename).join(', '),
      html: pdfs.map(p => `<li>${p.filename}</li>`).join('')
    },
    ARCHERY_PIN: {
      text: pin ? replaceTemplateVars(archeryPinTextTemplate, { PIN: pin }) : '',
      html: pin ? replaceTemplateVars(archeryPinHtmlTemplate, { PIN: pin }) : ''
    }
  };

  const getReplacements = (format) => {
    const result = {};
    for (const [key, value] of Object.entries(replacements)) {
      result[key] = typeof value === 'object' && value !== null ? value[format] : value;
    }
    return result;
  };

  const text = replaceTemplateVars(waiverTextTemplate, getReplacements('text'));
  const html = replaceTemplateVars(waiverEmailTemplate, getReplacements('html'));

  const emailData = buildEmailData(text, html);
  emailData.to = data.guestEmail;
  emailData.attachments = pdfs.map(p => ({
    filename: p.filename,
    content: btoa(String.fromCharCode(...new Uint8Array(p.bytes)))
  }));

  try {
    const responseData = await sendEmail(env, emailData);
    console.log('Email sent successfully:', responseData);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
}
