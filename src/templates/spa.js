{{BOOTSTRAP_DATA}}

  console.log("Props:", props);
  console.log("Risks:", risks);
  console.log("Submission:", submission);

  if (!Array.isArray(props)) {
    props = [props];
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }

  function initializePage() {
    const propSel = document.getElementById('prop');
    if (!propSel) {
      console.error('Property select element not found');
      return;
    }

    if (!props || props.length === 0) {
      propSel.add(new Option('No properties available', ''));
      propSel.disabled = true;
    } else {
      props.forEach(p => propSel.add(new Option(p.name, p.id)));
    }

    setupFormHandlers();
  }

  function setupFormHandlers() {
    const propSel = document.getElementById('prop');

  /* ---------- Determine which form to show -------------------- */
  const initialForm = document.getElementById('initialForm');
  const activityForm = document.getElementById('activityForm');
  const headerSubtitle = document.getElementById('headerSubtitle');

  if (submission) {
    // Show activity form with pre-filled info
    initialForm.hidden = true;
    activityForm.hidden = false;
    headerSubtitle.textContent = 'Select your activities and sign';

    // Pre-fill property selection
    propSel.value = submission.property_id;
    propSel.disabled = true;

    // Show guest info
    document.getElementById('guestInfo').innerHTML =
      '<p><strong>Property:</strong> ' + props.find(p => p.id === submission.property_id)?.name + '</p>' +
      '<p><strong>Check-in:</strong> ' + submission.checkin_date + '</p>' +
      '<p><strong>Name:</strong> ' + submission.guest_name + '</p>' +
      '<p><strong>Email:</strong> ' + submission.guest_email + '</p>';
  } else {
    // Show initial form
    initialForm.hidden = false;
    activityForm.hidden = true;
  }

  /* ---------- Initial form submission -------------------- */
  document.getElementById('initialForm').onsubmit = async e => {
    e.preventDefault();

    const data = {
      propertyId: propSel.value,
      checkinDate: document.getElementById('date').value,
      guestName: document.getElementById('name').value,
      guestEmail: document.getElementById('email').value
    };

    console.log("Submitting initial form:", data);

    try {
      const res = await fetch('/submit/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("Error: " + errorText);
        return;
      }

      const json = await res.json();
      console.log("Response:", json);

      // Show confirmation message
      initialForm.hidden = true;
      document.getElementById('thanks').hidden = false;
      document.getElementById('thanks').innerHTML =
        '<h2>✓ Check Your Email</h2>' +
        '<p style="color:#64748b;margin-bottom:1.5rem">We\'ve sent a verification link to <strong>' + data.guestEmail + '</strong></p>' +
        '<p style="color:#94a3b8;font-size:0.875rem">Click the link in the email to continue with your waiver.</p>';
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Error: " + error.message);
    }
  };

  /* ---------- activity checkboxes ------------------------- */
  const actsDiv = document.getElementById('activities');
  const masterCheck = document.getElementById('master');
  let chosen = new Map();

  function loadActivities() {
    const selectedProp = props.find(p => p.id === (submission ? submission.property_id : propSel.value));
    const activities = selectedProp?.activities ?? [];

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

      if (a.risk) {
        const chipWrapper = document.createElement('div');
        chipWrapper.className = 'risk-chip-wrapper';

        const riskChip = document.createElement('span');
        riskChip.className = 'risk-chip risk-' + a.risk;
        riskChip.textContent = a.risk.charAt(0).toUpperCase() + a.risk.slice(1) + ' Risk';

        const riskDetails = document.createElement('span');
        riskDetails.className = 'risk-details';

        const riskData = risks[a.risk];
        if (riskData) {
          riskDetails.textContent = riskData.description || 'Activity-specific risks apply';
        } else {
          riskDetails.textContent = 'Activity-specific risks apply';
        }

        chipWrapper.appendChild(riskChip);
        chipWrapper.appendChild(riskDetails);
        itemDiv.appendChild(chipWrapper);
      }

      itemDiv.onclick = () => {
        checkbox.checked = !checkbox.checked;
        checkbox.onchange();
      };

      rowDiv.appendChild(itemDiv);
      rowDiv.appendChild(initialInput);
      actsDiv.appendChild(rowDiv);
    });
  }

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

  if (submission) {
    loadActivities();
    validateMasterCheckbox();

    // Populate legal release preview
    if (release) {
      document.getElementById('legalVersion').textContent = 'Version ' + release.version + ' (' + release.release_date + ')';
      document.getElementById('legalContent').textContent = release.waiver_text;
    }
  }

  /* ---------- legal preview expand/collapse -------------------- */
  document.getElementById('expandLegal')?.addEventListener('click', function() {
    const content = document.getElementById('legalContent');
    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
      content.classList.remove('expanded');
      this.textContent = 'Expand Preview';
    } else {
      content.classList.add('expanded');
      this.textContent = 'Collapse Preview';
    }
  });

  /* ---------- signature pad -------------------------------- */
  const canvas = document.getElementById('sign');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let drawing = false;

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

  /* ---------- activity form submit --------------------------------------- */
  document.getElementById('activityForm').onsubmit = async e => {
    e.preventDefault();

    if (!submission) {
      alert('Invalid submission. Please start over.');
      return;
    }

    const data = {
      submissionId: submission.submission_id,
      activities: [...chosen.keys()],
      initials: Object.fromEntries(
        [...chosen.entries()].map(([slug, {initialInput}]) =>
          [slug, initialInput.value])),
      signature: canvas.toDataURL(),
      accepted: document.getElementById('master').checked
    };

    console.log("Submitting activity form:", data);

    try {
      const res = await fetch('/submit/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("Error submitting form: " + errorText);
        return;
      }

      const json = await res.json();
      console.log("Response data:", json);

      document.getElementById('activityForm').hidden = true;
      document.getElementById('thanks').hidden = false;

      if (json.devMode) {
        let html = '<h2>✓ Waivers Generated</h2>';
        html += '<p style="color:#64748b;margin-bottom:1.5rem">Your waivers are ready to download</p>';
        html += '<div style="display:flex;flex-direction:column;gap:12px">';

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
  }
