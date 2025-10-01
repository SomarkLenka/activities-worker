export async function htmlPage (env) {
  // Fetch all properties from KV
  const propertiesJSON = await env.PROPS_KV.get('properties', 'text');
  const properties = propertiesJSON ? JSON.parse(propertiesJSON) : [];

  // Fetch activities for each property
  const propsData = [];
  for (const property of properties) {
    const activities = await env.PROPS_KV.get(`property:${property.id}:activities`, 'json') || [];
    propsData.push({
      id: property.id,
      name: property.name,
      activities: activities
    });
  }

  // Fetch risk descriptions
  const risks = {};
  for (const level of ['low', 'medium', 'high']) {
    const riskData = await env.PROPS_KV.get(`risk:${level}`, 'json');
    if (riskData) {
      risks[level] = riskData;
    }
  }

  const propsJSON = JSON.stringify(propsData);
  const props64   = btoa(unescape(encodeURIComponent(propsJSON)));

  const risksJSON = JSON.stringify(risks);
  const risks64   = btoa(unescape(encodeURIComponent(risksJSON)));

  return new Response(`
<!doctype html>
<html lang="en"><meta charset="utf-8">
<title>Activity Waiver</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:system-ui;margin:2rem auto;max-width:1000px;padding:0 1rem}
  label{display:block;margin:.4rem 0}
  .signature-container{display:flex;flex-direction:column;align-items:center;gap:10px}
  canvas{border:1px solid #999;width:75%;touch-action:none;display:block}
  .activities-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;column-gap:24px;padding:10px;background:#f5f5f5;border-radius:8px;overflow:hidden}
  .activity-row{display:flex;gap:8px;align-items:center}
  .activity-item{display:flex;align-items:center;padding:8px;background:white;border-radius:4px;border:1px solid #ddd;cursor:pointer;transition:all 0.2s;flex:1;position:relative;min-height:64px;overflow:hidden}
  .activity-item:hover{background:#f0f7ff;border-color:#0070f3}
  .activity-item input[type="checkbox"]{margin-right:8px;cursor:pointer;width:18px;height:18px;flex-shrink:0}
  .activity-item label{margin:0;cursor:pointer;flex:1;display:flex;align-items:center;gap:8px;position:relative;z-index:1;justify-content:space-between}
  .activity-label-text{white-space:nowrap;flex-shrink:0;min-width:120px}
  .risk-chip-wrapper{display:flex;align-items:center;justify-content:flex-end;min-width:200px;width:200px;transition:all 0.3s ease;position:relative;overflow:visible;z-index:10}
  .risk-chip{padding:6px 12px;border-radius:12px;color:white;font-size:11px;font-weight:500;white-space:nowrap;display:inline-block;width:100px;text-align:center;transition:transform 0.3s ease;box-sizing:border-box;flex-shrink:0;position:relative;z-index:2}
  .risk-chip-wrapper:hover .risk-chip{transform:translateX(-110px)}
  .risk-low{background:#16a34a}
  .risk-medium{background:#f97316}
  .risk-high{background:#dc2626}
  .risk-details{position:absolute;right:0;width:190px;opacity:0;font-size:9px;line-height:1.2;color:#333;transition:opacity 0.3s ease;padding-left:108px;display:block;box-sizing:border-box;max-height:56px;overflow-y:auto}
  .risk-chip-wrapper:hover .risk-details{opacity:1}
  .activity-initial{width:45px;height:45px;text-align:center;padding:0;border:1px solid #ccc;border-radius:4px;visibility:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px}
  .activity-initial.visible{visibility:visible}
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
    <div class="signature-container">
      <canvas id="sign" width="600" height="200"></canvas>
      <button id="clearSig" type="button">Clear</button>
    </div>

    <button id="submit">Submit</button>
  </form>

  <div id="thanks" hidden></div>

<script type="module">
  /* ---------- bootstrap property list and risks -------------------- */
  let props = JSON.parse(atob('${props64}'));
  const risks = JSON.parse(atob('${risks64}'));
  console.log("Raw props data:", props);
  console.log("Risk descriptions:", risks);

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
  let chosen         = new Map(); // slug -> {itemDiv, initialInput}

  function loadActivities() {
    const selectedProp = props.find(p => p.id === propSel.value);
    const activities = selectedProp?.activities ?? [];

    console.log("Loading activities for:", propSel.value);
    console.log("Activities array:", activities);

    // Clear existing activities
    actsDiv.innerHTML = '';
    chosen.clear();
    masterCheck.disabled = true;
    masterCheck.checked = false;

    activities.forEach(a => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'activity-row';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'activity-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'activity-' + a.slug;
    checkbox.value = a.slug;

    const label = document.createElement('label');
    label.htmlFor = 'activity-' + a.slug;

    const labelText = document.createElement('span');
    labelText.className = 'activity-label-text';
    labelText.textContent = a.label;
    label.appendChild(labelText);

    if (a.risk) {
      const chipWrapper = document.createElement('div');
      chipWrapper.className = 'risk-chip-wrapper';

      const riskChip = document.createElement('span');
      riskChip.className = 'risk-chip risk-' + a.risk;
      riskChip.textContent = a.risk.charAt(0).toUpperCase() + a.risk.slice(1) + ' Risk';

      const riskDetails = document.createElement('span');
      riskDetails.className = 'risk-details';

      // Use dynamic risk descriptions from KV store
      const riskData = risks[a.risk];
      if (riskData) {
        riskDetails.textContent = riskData.description || 'Activity-specific risks apply';
      } else {
        riskDetails.textContent = 'Activity-specific risks apply';
      }

      chipWrapper.appendChild(riskChip);
      chipWrapper.appendChild(riskDetails);
      label.appendChild(chipWrapper);
    }

    const initialInput = document.createElement('input');
    initialInput.type = 'text';
    initialInput.maxLength = 4;
    initialInput.placeholder = 'Init';
    initialInput.className = 'activity-initial';
    initialInput.dataset.slug = a.slug;
    initialInput.oninput = validateMasterCheckbox;

    checkbox.onchange = () => {
      if (checkbox.checked) {
        chosen.set(a.slug, {itemDiv, initialInput});
        initialInput.classList.add('visible');
      } else {
        chosen.delete(a.slug);
        initialInput.classList.remove('visible');
        initialInput.value = '';
      }
      validateMasterCheckbox();
    };

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);

    // Make entire div clickable
    itemDiv.onclick = () => {
      checkbox.checked = !checkbox.checked;
      checkbox.onchange();
    };

    rowDiv.appendChild(itemDiv);
    rowDiv.appendChild(initialInput);
    actsDiv.appendChild(rowDiv);
    });
  }

  // Load activities when property selection changes
  propSel.addEventListener('change', loadActivities);

  // Load activities for initial property
  loadActivities();

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
