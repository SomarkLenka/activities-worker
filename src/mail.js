export async function sendMail (data, pdfs, pin, env) {
  const boundary = 'BOUNDARY-' + Math.random().toString(36).slice(2);
  let body = '';

  /* ---- headers -------------------------------------------------- */
  body += `From: ${env.EMAIL_FROM}\r\n`;
  body += `To: ${data.guestEmail}\r\n`;
  body += `Subject: Your activity waiver(s)\r\n`;
  body += 'MIME-Version: 1.0\r\n';
  body += `Content-Type: multipart/mixed; boundary=${boundary}\r\n\r\n`;

  /* ---- plain-text part ------------------------------------------ */
  body += `--${boundary}\r\n`;
  body += 'Content-Type: text/plain; charset=utf-8\r\n\r\n';
  body += `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached:${pdfs.map(p => ' ' + p.filename).join(', ')}

${pin ? 'Your Archery PIN is ' + pin + '\n\n' : ''}
Regards,
The Rentals Team
\r\n`;

  /* ---- one attachment per PDF ----------------------------------- */
  for (const p of pdfs) {
    body += `--${boundary}\r\n`;
    body += 'Content-Type: application/pdf\r\n';
    body += 'Content-Transfer-Encoding: base64\r\n';
    body += `Content-Disposition: attachment; filename="${p.filename}"\r\n\r\n`;
    body += btoa(String.fromCharCode(...new Uint8Array(p.bytes))) + '\r\n';
  }
  body += `--${boundary}--`;

  /* ---- send ------------------------------------------------------ */
  await fetch('https://api.cloudflare.com/client/v4/accounts/' +
              env.CLOUDFLARE_ACCOUNT_ID + '/email/send', {
    method:  'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Authorization': 'Bearer ' + env.CLOUDFLARE_API_TOKEN   // put as secret
    },
    body
  });
}
