import { createMimeMessage } from 'mimetext';

export async function sendMail (data, pdfs, pin, env) {
  const msg = createMimeMessage();

  msg.setSender({ name: 'Property Waivers', addr: env.EMAIL_FROM });
  msg.setRecipient(data.guestEmail);
  msg.setSubject('Your activity waiver(s)');

  /* ---- plain-text body ------------------------------------------ */
  const bodyText = `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached: ${pdfs.map(p => p.filename).join(', ')}

${pin ? 'Your Archery PIN is ' + pin + '\n\n' : ''}Regards,
The Rentals Team`;

  msg.addMessage({
    contentType: 'text/plain',
    data: bodyText
  });

  /* ---- add PDF attachments ------------------------------------- */
  for (const p of pdfs) {
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(p.bytes)));

    msg.addAttachment({
      filename: p.filename,
      contentType: 'application/pdf',
      data: base64Data
    });
  }

  /* ---- send via email worker service --------------------------- */
  try {
    const response = await env.EMAIL_WORKER.sendEmail({
      from: env.EMAIL_FROM,
      to: data.guestEmail,
      subject: 'Your activity waiver(s)',
      text: bodyText,
      attachments: pdfs.map(p => ({
        filename: p.filename,
        content: btoa(String.fromCharCode(...new Uint8Array(p.bytes)))
      }))
    });

    if (!response.ok) {
      throw new Error(response.error || 'Email worker returned error');
    }
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
}
