/**
 *  Browser-Rendering Worker
 *  – one public GET / for health
 *  – one RPC method htmlToPdf() that other Workers call via service binding
 */
export default {
  /* required so the script has an entry point */
  async fetch(request) {
    return new Response(
      'browser-render online ✅\n' +
      'POST body = <html> → /pdf to get a PDF',
      { headers: { 'content-type': 'text/plain' } }
    );
  },

  /**
   * Called from another Worker via
   *    const pdfBuf = await env.BROWSER.htmlToPdf(html, { format: "A4" });
   */
  async htmlToPdf(request, env) {
    // request.body is the HTML string
    return await env.browser.pdf(request.body, {
      format: 'A4',            // default options; can be overridden
      ...(request.cf || {})    // allow caller to pass puppeteer args
    });
  }
}
