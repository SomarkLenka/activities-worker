export async function htmlPage (env) {
  // property list pulled once from KV and embedded as <script> blob
  const propsJSON = await env.PROPS_KV.get('props', 'text') || '[]';
  const props64   = btoa(unescape(encodeURIComponent(propsJSON)));

  return new Response(`
<!doctype html>
<html lang="en"><meta charset="utf-8">
<title>Activity Waiver</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:system-ui;margin:2rem auto;max-width:640px;padding:0 1rem}
  label{display:block;margin:.4rem 0}
  canvas{border:1px solid #999;width:100%;touch-action:none}
  .chip{display:inline-block;margin:4px;padding:.4rem 1rem;border:1px solid #666;border-radius:16px;cursor:pointer}
  .chip.active{background:#0070f3;color:#fff}
</style>

<body>
  <h1>Sign your waiver</h1>
  <form id="form">
    <label>Property
      <select id="prop"></select>
    </label>

    <label>Check-in
      <input type="date" id="date" required>
    </label>

    <label>Name
      <input id="name" required>
    </label>

    <label>E-mail
      <input id="email" type="email" required>
    </label>

    <h3>Activities</h3>
    <div id="activities"></div>

    <label>
      <input id="master" type="checkbox" required>
      I have read and accept all risks.
    </label>

    <h3>Initial each selected activity</h3>
    <div id="initials"></div>

    <h3>Signature</h3>
    <canvas id="sign" width="600" height="200"></canvas><br>
    <button id="clearSig" type="button">Clear</button><br><br>

    <button id="submit">Submit</button>
  </form>

  <div id="thanks" hidden></div>

<script type="module">
  /* ---------- bootstrap property list -------------------- */
  const props = JSON.parse(atob('${props64}'));
  const propSel = document.getElementById('prop');
  props.forEach(p => propSel.add(new Option(p.name, p.id)));

  /* ---------- activity chips ------------------------------ */
  const actsDiv      = document.getElementById('activities');
  const initialsDiv  = document.getElementById('initials');
  const chosen       = new Set();

  const activities = props[0]?.activities ?? [];   // assumes all props share list
  activities.forEach(a => {
    const chip = document.createElement('span');
    chip.textContent = a.label;
    chip.className   = 'chip';
    chip.dataset.slug = a.slug;
    chip.onclick = () => {
      chip.classList.toggle('active');
      if (chosen.has(a.slug)) chosen.delete(a.slug); else chosen.add(a.slug);
      drawInitials();
    };
    actsDiv.appendChild(chip);
  });

  function drawInitials () {
    initialsDiv.innerHTML = '';
    [...chosen].forEach(slug => {
      const inp = document.createElement('input');
      inp.maxLength   = 4;
      inp.size        = 4;
      inp.required    = true;
      inp.dataset.slug = slug;
      initialsDiv.append(slug + ': ', inp, ' ');
    });
  }

  /* ---------- signature pad -------------------------------- */
  const canvas = document.getElementById('sign');
  const ctx    = canvas.getContext('2d', { willReadFrequently: true });
  let drawing  = false;

  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
  canvas.addEventListener('pointerup', () => drawing = false);
  document.getElementById('clearSig').onclick =
    () => ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ---------- submit --------------------------------------- */
  document.getElementById('form').onsubmit = async e => {
    e.preventDefault();

    const data = {
      propertyId  : propSel.value,
      checkinDate : document.getElementById('date').value,
      guestName   : document.getElementById('name').value,
      guestEmail  : document.getElementById('email').value,
      activities  : [...chosen],
      initials    : Object.fromEntries(
                      [...initialsDiv.querySelectorAll('input')]
                      .map(i => [i.dataset.slug, i.value])),
      signature   : canvas.toDataURL(),
      accepted    : document.getElementById('master').checked
    };

    const res  = await fetch('/submit', { method: 'POST', body: JSON.stringify(data) });
    const json = await res.json();

    document.getElementById('form').hidden   = true;
    document.getElementById('thanks').hidden = false;

    if (json.devMode) {
      // Development mode - show download links
      let html = '<h2>Waivers Generated ✔</h2>';
      html += '<p>Download your waivers:</p>';
      html += '<div style="display:flex;flex-direction:column;gap:10px;margin:20px 0">';

      // Create download buttons for each PDF
      json.downloads.forEach(pdf => {
        html += '<button onclick="window.open(\'' + pdf.url + '\', \'_blank\')" ';
        html += 'style="padding:10px 20px;background:#0070f3;color:#fff;border:none;';
        html += 'border-radius:6px;cursor:pointer;font-size:16px">';
        html += '📄 Download ' + pdf.filename + '</button>';
      });

      html += '</div>';

      // Add button to download all at once
      if (json.downloads.length > 1) {
        html += '<button onclick="';
        json.downloads.forEach(pdf => {
          html += 'window.open(\'' + pdf.url + '\', \'_blank\');';
        });
        html += '" style="padding:12px 24px;background:#28a745;color:#fff;border:none;';
        html += 'border-radius:6px;cursor:pointer;font-size:16px;margin-top:10px">';
        html += '📦 Download All (' + json.downloads.length + ' PDFs)</button>';
      }

      if (json.pin) {
        html += '<p style="margin-top:20px">Your Archery PIN is <b>' + json.pin + '</b></p>';
      }

      html += '<p style="margin-top:20px;color:#666;font-size:14px">';
      html += '⚠️ Development Mode - PDFs are stored but not emailed</p>';

      document.getElementById('thanks').innerHTML = html;
    } else {
      // Production mode - email confirmation
      document.getElementById('thanks').innerHTML =
        '<h2>Email sent ✔</h2><p>Attachments:<br>' +
        json.emailed.join('<br>') + '</p>' +
        (json.pin ? '<p>Your Archery PIN is <b>' + json.pin + '</b></p>' : '');
    }
  };
</script>
</body>
</html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}
