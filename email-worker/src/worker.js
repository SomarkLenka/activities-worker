import { Resend } from 'resend';

/**
 * Email Worker using Resend
 * Receives RPC calls from main worker and sends emails via Resend API
 */
export default {
  /**
   * RPC method called from main worker via env.EMAIL_WORKER.sendEmail()
   */
  async sendEmail(request, env, ctx) {
    const { from, to, subject, text, attachments } = request;

    console.log('Email worker: Sending email from', from, 'to', to);

    const resend = new Resend(env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        attachments: attachments || []
      });

      if (error) {
        console.error('Resend error:', error);
        return { ok: false, error: error.message };
      }

      console.log('Email sent successfully:', data);
      return { ok: true, data };
    } catch (error) {
      console.error('Email send failed:', error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * HTTP handler (optional, for health checks)
   */
  async fetch(request, env, ctx) {
    return new Response('Email Worker (Resend) is running', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
