import { Resend } from 'resend';

export async function sendMail (data, pdfs, pin, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const bodyText = `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached: ${pdfs.map(p => p.filename).join(', ')}

${pin ? 'Your Archery PIN is ' + pin + '\n\n' : ''}Regards,
The Rentals Team`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: data.guestEmail,
      subject: 'Your activity waiver(s)',
      text: bodyText,
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
