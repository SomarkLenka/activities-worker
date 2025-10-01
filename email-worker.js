import { EmailMessage } from 'cloudflare:email';

/**
 * Email Worker (worker1)
 * Receives RPC calls from main worker and sends emails via Cloudflare Email Routing
 */
export default {
  /**
   * RPC method called from main worker via env.EMAIL_WORKER.sendEmail()
   */
  async sendEmail(request, env, ctx) {
    const { from, to, rawMessage } = request;

    console.log('Email worker: Sending email from', from, 'to', to);

    const message = new EmailMessage(from, to, rawMessage);

    try {
      await env.SEB.send(message);
      console.log('Email sent successfully');
      return { ok: true };
    } catch (error) {
      console.error('Email send failed:', error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * HTTP handler (optional, for health checks)
   */
  async fetch(request, env, ctx) {
    return new Response('Email Worker (worker1) is running', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
