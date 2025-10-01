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
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:2rem 1rem;background:#f8fafc;color:#1e293b;line-height:1.6}
  .container{max-width:1200px;margin:0 auto;background:white;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);overflow:hidden}
  .header{background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);padding:2.5rem 2rem;color:white;text-align:center}
  .header h1{margin:0 0 0.5rem 0;font-size:2rem;font-weight:700}
  .header p{margin:0;opacity:0.9;font-size:1rem}
  .content{padding:2rem}
  .form-group{margin-bottom:1.5rem}
  .form-group label{display:block;margin-bottom:0.5rem;font-weight:600;font-size:0.875rem;color:#475569}
  .form-group input,.form-group select{width:100%;padding:0.75rem 1rem;border:1px solid #cbd5e1;border-radius:8px;font-size:1rem;transition:all 0.2s}
  .form-group input:focus,.form-group select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
  .section-title{font-size:1.25rem;font-weight:700;color:#0f172a;margin:2rem 0 1rem 0;padding-bottom:0.5rem;border-bottom:2px solid #e2e8f0}
  .activities-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;column-gap:24px;padding:0;overflow:hidden}
  .activity-row{display:flex;gap:8px;align-items:center}
  .activity-item{display:flex;align-items:center;padding:12px;background:#f8fafc;border-radius:10px;border:2px solid #e2e8f0;cursor:pointer;transition:all 0.2s;flex:1;position:relative;min-height:68px;overflow:hidden}
  .activity-item:hover{background:#f1f5f9;border-color:#3b82f6}
  .activity-item.checked{background:#eff6ff;border-color:#3b82f6}
  .activity-item input[type="checkbox"]{margin-right:10px;cursor:pointer;width:20px;height:20px;flex-shrink:0;accent-color:#3b82f6}
  .activity-item label{margin:0;cursor:pointer;flex:1;display:flex;align-items:center;gap:8px;position:relative;z-index:1;justify-content:space-between}
  .activity-label-text{white-space:nowrap;flex-shrink:0;min-width:120px;font-weight:600;color:#1e293b}
  .risk-chip-wrapper{display:flex;align-items:center;justify-content:flex-end;min-width:200px;width:200px;transition:all 0.3s ease;position:relative;overflow:visible;z-index:10}
  .risk-chip{padding:6px 14px;border-radius:12px;color:white;font-size:11px;font-weight:600;white-space:nowrap;display:inline-block;width:100px;text-align:center;transition:transform 0.3s ease;box-sizing:border-box;flex-shrink:0;position:relative;z-index:2}
  .risk-chip-wrapper:hover .risk-chip{transform:translateX(-110px)}
  .risk-low{background:#10b981}
  .risk-medium{background:#f59e0b}
  .risk-high{background:#ef4444}
  .risk-details{position:absolute;right:0;width:190px;opacity:0;font-size:9px;line-height:1.3;color:#334155;transition:opacity 0.3s ease;padding:4px 8px 4px 108px;display:block;box-sizing:border-box;max-height:56px;overflow-y:auto;background:white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
  .risk-chip-wrapper:hover .risk-details{opacity:1}
  .activity-initial{width:70px;height:50px;text-align:center;padding:0;border:2px solid #cbd5e1;border-radius:8px;visibility:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;background:white;transition:all 0.2s}
  .activity-initial.visible{visibility:visible;border-color:#3b82f6}
  .activity-initial:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
  .acceptance-box{background:#fef3c7;border:2px solid #fbbf24;border-radius:10px;padding:1rem;margin:1.5rem 0;display:flex;align-items:center;gap:0.75rem;position:relative}
  .acceptance-box input[type="checkbox"]{width:20px;height:20px;accent-color:#f59e0b;cursor:pointer}
  .acceptance-box label{margin:0;font-weight:600;color:#78350f;cursor:pointer}
  .acceptance-box input[type="checkbox"]:disabled{cursor:not-allowed;opacity:0.5}
  .acceptance-box .tooltip{display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:0.5rem 1rem;border-radius:6px;font-size:0.875rem;white-space:nowrap;margin-bottom:0.5rem;font-weight:400}
  .acceptance-box .tooltip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#1e293b}
  .acceptance-box:hover .tooltip{display:block}
  .signature-container{display:flex;flex-direction:column;align-items:center;gap:12px;padding:1.5rem;background:#f8fafc;border-radius:10px;border:2px solid #e2e8f0}
  canvas{border:2px dashed #cbd5e1;border-radius:8px;width:90%;max-width:600px;touch-action:none;display:block;background:white}
  button{font-weight:600;border:none;cursor:pointer;transition:all 0.2s;font-size:1rem;border-radius:8px;font-family:inherit}
  #clearSig{padding:0.625rem 1.5rem;background:#64748b;color:white}
  #clearSig:hover{background:#475569}
  #submit{width:100%;padding:1rem;background:#3b82f6;color:white;font-size:1.125rem;margin-top:1.5rem}
  #submit:hover:not(:disabled){background:#2563eb}
  #submit:disabled{opacity:0.5;cursor:not-allowed}
  .thanks{padding:2rem;text-align:center}
  .thanks h2{color:#3b82f6;font-size:1.75rem;margin-bottom:1rem}
  @media (max-width:768px){
    .content{padding:1.5rem}
    .activities-grid{grid-template-columns:1fr}
    canvas{width:100%}
  }
</style>

<body>
  <div class="container">
    <div class="header">
      <h1>Activity Waiver</h1>
      <p>Complete your waiver to get started</p>
    </div>

    <div class="content">
      <form id="form">
        <div class="form-group">
          <label>Property</label>
          <select id="prop"></select>
        </div>

        <div class="form-group">
          <label>Check-in Date</label>
          <input type="date" id="date" required>
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input id="name" required>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input id="email" type="email" required>
        </div>

        <h3 class="section-title">Select Activities</h3>
        <div id="activities" class="activities-grid"></div>

        <div class="acceptance-box">
          <input id="master" type="checkbox" required>
          <label for="master">I have read and accept all risks</label>
          <span class="tooltip" id="masterTooltip">Please initial all selected activities first</span>
        </div>

        <h3 class="section-title">Signature</h3>
        <div class="signature-container">
          <canvas id="sign" width="600" height="200"></canvas>
          <button id="clearSig" type="button">Clear</button>
        </div>

        <button id="submit">Submit Waiver</button>
      </form>

      <div id="thanks" class="thanks" hidden></div>
    </div>
  </div>

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

  if (!props || props.length === 0) {
    console.error('No properties found! Props data:', props);
    propSel.add(new Option('No properties available', ''));
    propSel.disabled = true;
  } else {
    props.forEach(p => {
      console.log('Adding property option:', p.name, p.id);
      propSel.add(new Option(p.name, p.id));
    });
  }

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
    initialInput.placeholder = 'Initials';
    initialInput.className = 'activity-initial';
    initialInput.dataset.slug = a.slug;
    initialInput.oninput = validateMasterCheckbox;

    checkbox.onchange = () => {
      if (checkbox.checked) {
        chosen.set(a.slug, {itemDiv, initialInput});
        initialInput.classList.add('visible');
        itemDiv.classList.add('checked');
      } else {
        chosen.delete(a.slug);
        initialInput.classList.remove('visible');
        initialInput.value = '';
        itemDiv.classList.remove('checked');
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
      let html = '<h2>✓ Waivers Generated</h2>';
      html += '<p style="color:#64748b;margin-bottom:1.5rem">Your waivers are ready to download</p>';
      html += '<div style="display:flex;flex-direction:column;gap:12px">';

      // Create download buttons for each PDF
      json.downloads.forEach(pdf => {
        html += '<button onclick="window.open(&quot;' + pdf.url + '&quot;, &quot;_blank&quot;)" ';
        html += 'style="padding:12px 24px;background:#3b82f6;color:white;border:none;';
        html += 'border-radius:8px;cursor:pointer;font-size:1rem;font-weight:600;';
        html += 'transition:background 0.2s"';
        html += ' onmouseover="this.style.background=&quot;#2563eb&quot;"';
        html += ' onmouseout="this.style.background=&quot;#3b82f6&quot;">';
        html += '📄 Download ' + pdf.filename + '</button>';
      });

      html += '</div>';

      // Add button to download all at once
      if (json.downloads.length > 1) {
        html += '<button onclick="';
        json.downloads.forEach(pdf => {
          html += 'window.open(&quot;' + pdf.url + '&quot;, &quot;_blank&quot;);';
        });
        html += '" style="padding:14px 28px;background:#10b981;color:white;border:none;';
        html += 'border-radius:8px;cursor:pointer;font-size:1rem;font-weight:600;margin-top:12px;';
        html += 'transition:background 0.2s"';
        html += ' onmouseover="this.style.background=&quot;#059669&quot;"';
        html += ' onmouseout="this.style.background=&quot;#10b981&quot;">';
        html += '📦 Download All (' + json.downloads.length + ' PDFs)</button>';
      }

      if (json.pin) {
        html += '<div style="margin-top:1.5rem;padding:1rem;background:#fef3c7;border:2px solid #fbbf24;border-radius:8px">';
        html += '<p style="margin:0;color:#78350f;font-weight:600">Archery PIN: <strong>' + json.pin + '</strong></p></div>';
      }

      html += '<p style="margin-top:1.5rem;color:#94a3b8;font-size:0.875rem">';
      html += '⚠️ Development Mode - PDFs stored locally, not emailed</p>';

      document.getElementById('thanks').innerHTML = html;
    } else {
      // Production mode - email confirmation
      let html = '<h2>✓ Success</h2>';
      html += '<p style="color:#64748b;margin-bottom:1.5rem">Your waivers have been sent to your email</p>';
      if (json.pin) {
        html += '<div style="margin-top:1.5rem;padding:1rem;background:#fef3c7;border:2px solid #fbbf24;border-radius:8px">';
        html += '<p style="margin:0;color:#78350f;font-weight:600">Archery PIN: <strong>' + json.pin + '</strong></p></div>';
      }
      document.getElementById('thanks').innerHTML = html;
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
