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
  .activities-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px;background:#f5f5f5;border-radius:8px}
  .activity-item{display:flex;align-items:center;padding:8px;background:white;border-radius:4px;border:1px solid #ddd;cursor:pointer;transition:all 0.2s}
  .activity-item:hover{background:#f0f7ff;border-color:#0070f3}
  .activity-item input[type="checkbox"]{margin-right:8px;cursor:pointer;width:18px;height:18px}
  .activity-item label{margin:0;cursor:pointer;flex:1}
  .activity-item input[type="text"]{margin-left:auto;width:50px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px}
  @media (max-width:480px){.activities-grid{grid-template-columns:1fr}}
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
    <div id="activities" class="activities-grid"></div>

    <label>
      <input id="master" type="checkbox" required>
      I have read and accept all risks.
    </label>

    <h3>Signature</h3>
    <canvas id="sign" width="600" height="200"></canvas><br>
    <button id="clearSig" type="button">Clear</button><br><br>

    <button id="submit">Submit</button>
  </form>

  <div id="thanks" hidden></div>

<script type="module">
  /* ---------- bootstrap property list -------------------- */
  let props = JSON.parse(atob('${props64}'));
  console.log("Raw props data:", props);

  // Handle both array and single object formats
  if (!Array.isArray(props)) {
    props = [props];
  }
  console.log("Props after array check:", props);

  const propSel = document.getElementById('prop');
  props.forEach(p => propSel.add(new Option(p.name, p.id)));

  /* ---------- activity checkboxes ------------------------- */
  const actsDiv      = document.getElementById('activities');
  const masterCheck  = document.getElementById('master');
  const chosen       = new Map(); // slug -> {itemDiv, initialInput}

  const activities = props[0]?.activities ?? [];   // assumes all props share list
  console.log("Activities array:", activities);
  console.log("Activities container:", actsDiv);
  activities.forEach(a => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'activity-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'activity-' + a.slug;
    checkbox.value = a.slug;

    const label = document.createElement('label');
    label.htmlFor = 'activity-' + a.slug;
    label.textContent = a.label;

    const initialInput = document.createElement('input');
    initialInput.type = 'text';
    initialInput.maxLength = 4;
    initialInput.placeholder = 'Init';
    initialInput.style.display = 'none';
    initialInput.dataset.slug = a.slug;
    initialInput.oninput = validateMasterCheckbox;

    checkbox.onchange = () => {
      if (checkbox.checked) {
        chosen.set(a.slug, {itemDiv, initialInput});
        initialInput.style.display = 'block';
      } else {
        chosen.delete(a.slug);
        initialInput.style.display = 'none';
        initialInput.value = '';
      }
      validateMasterCheckbox();
    };

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    itemDiv.appendChild(initialInput);

    // Make entire div clickable except initial input
    itemDiv.onclick = (e) => {
      if (e.target !== initialInput) {
        checkbox.checked = !checkbox.checked;
        checkbox.onchange();
      }
    };

    actsDiv.appendChild(itemDiv);
  });

  function validateMasterCheckbox() {
    let allFilled = true;
    for (const [slug, {initialInput}] of chosen) {
      if (!initialInput.value.trim()) {
        allFilled = false;
        break;
      }
    }
    masterCheck.disabled = !allFilled || chosen.size === 0;
    if (masterCheck.disabled) {
      masterCheck.checked = false;
    }
  }

  validateMasterCheckbox();

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
      activities  : [...chosen.keys()],
      initials    : Object.fromEntries(
                      [...chosen.entries()].map(([slug, {initialInput}]) =>
                        [slug, initialInput.value])),
      signature   : canvas.toDataURL(),
      accepted    : document.getElementById('master').checked
    };

    console.log("Submitting data:", data);

    try {
      const res  = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("Error submitting form: " + errorText);
        return;
      }

      const json = await res.json();
      console.log("Response data:", json);

    document.getElementById('form').hidden   = true;
    document.getElementById('thanks').hidden = false;

    if (json.devMode) {
      // Development mode - show download links
      let html = '<h2>Waivers Generated ✔</h2>';
      html += '<p>Download your waivers:</p>';
      html += '<div style="display:flex;flex-direction:column;gap:10px;margin:20px 0">';

      // Create download buttons for each PDF
      json.downloads.forEach(pdf => {
        html += \`<button onclick="window.open('\${pdf.url}', '_blank')" \`;
        html += 'style="padding:10px 20px;background:#0070f3;color:#fff;border:none;';
        html += 'border-radius:6px;cursor:pointer;font-size:16px">';
        html += '📄 Download ' + pdf.filename + '</button>';
      });

      html += '</div>';

      // Add button to download all at once
      if (json.downloads.length > 1) {
        html += '<button onclick="';
        json.downloads.forEach(pdf => {
          html += \`window.open('\${pdf.url}', '_blank');\`;
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
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Error submitting form: " + error.message);
    }
  };
</script>
</body>
</html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}
