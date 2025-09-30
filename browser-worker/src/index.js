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
   *    const pdfBuf = await env.BROWSER.htmlToPdf({ body: html, cf: { format: "A4" } });
   */
  async htmlToPdf(request, env) {
    // request is an object with body (HTML string) and cf (options)
    const html = request.body || request;  // support both formats
    const options = request.cf || { format: 'A4' };

    return await env.browser.pdf(html, options);
  }
}
