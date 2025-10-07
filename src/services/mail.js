import { Resend } from 'resend';

export async function sendVerificationEmail(email, name, verificationUrl, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const bodyText = `Hi ${name},

Thank you for starting your activity waiver submission!

Please click the link below to continue and complete your waiver:
${verificationUrl}

This link will expire in 24 hours.

If you didn't request this waiver, you can safely ignore this email.

Regards,
The Rentals Team`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3b82f6;">Complete Your Activity Waiver</h2>
      <p>Hi ${name},</p>
      <p>Thank you for starting your activity waiver submission!</p>
      <p>Please click the button below to continue and complete your waiver:</p>
      <div style="margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
          Complete Your Waiver
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours.</p>
      <p style="color: #64748b; font-size: 14px;">If you didn't request this waiver, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="color: #94a3b8; font-size: 12px;">Regards,<br>The Rentals Team</p>
    </div>
  `;

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

  const bodyText = `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached: ${pdfs.map(p => p.filename).join(', ')}

${pin ? 'Your Archery PIN is ' + pin + '\n\n' : ''}Regards,
The Rentals Team`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Activity Waivers <${env.EMAIL_FROM}>`,
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

export async function sendMail (data, pdfs, pin, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const bodyText = `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached: ${pdfs.map(p => p.filename).join(', ')}

${pin ? 'Your Archery PIN is ' + pin + '\n\n' : ''}Regards,
The Rentals Team`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Activity Waivers <${env.EMAIL_FROM}>`,
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
