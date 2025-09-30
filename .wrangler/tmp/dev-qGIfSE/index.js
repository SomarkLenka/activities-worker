var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-sW1d5E/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.browser.js
var nanoid = /* @__PURE__ */ __name((size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}, "nanoid");

// src/spa.js
async function htmlPage(env) {
  const propsJSON = await env.PROPS_KV.get("props", "text") || "[]";
  const props64 = btoa(unescape(encodeURIComponent(propsJSON)));
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
      let html = '<h2>Waivers Generated \u2714</h2>';
      html += '<p>Download your waivers:</p>';
      html += '<div style="display:flex;flex-direction:column;gap:10px;margin:20px 0">';

      // Create download buttons for each PDF
      json.downloads.forEach(pdf => {
        html += \`<button onclick="window.open('\${pdf.url}', '_blank')" \`;
        html += 'style="padding:10px 20px;background:#0070f3;color:#fff;border:none;';
        html += 'border-radius:6px;cursor:pointer;font-size:16px">';
        html += '\u{1F4C4} Download ' + pdf.filename + '</button>';
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
        html += '\u{1F4E6} Download All (' + json.downloads.length + ' PDFs)</button>';
      }

      if (json.pin) {
        html += '<p style="margin-top:20px">Your Archery PIN is <b>' + json.pin + '</b></p>';
      }

      html += '<p style="margin-top:20px;color:#666;font-size:14px">';
      html += '\u26A0\uFE0F Development Mode - PDFs are stored but not emailed</p>';

      document.getElementById('thanks').innerHTML = html;
    } else {
      // Production mode - email confirmation
      document.getElementById('thanks').innerHTML =
        '<h2>Email sent \u2714</h2><p>Attachments:<br>' +
        json.emailed.join('<br>') + '</p>' +
        (json.pin ? '<p>Your Archery PIN is <b>' + json.pin + '</b></p>' : '');
    }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Error submitting form: " + error.message);
    }
  };
<\/script>
</body>
</html>`, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
__name(htmlPage, "htmlPage");

// src/pdf.js
async function makePDFs(data, subId, env) {
  const now = /* @__PURE__ */ new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const results = [];
  for (const act of data.activities) {
    const html = `
    <!doctype html><meta charset="utf-8">
    <style>body{font-family:Arial;font-size:11pt;margin:2cm}</style>
    <h1>${act.toUpperCase()} \u2014 Release of Liability</h1>
    <p>Property  : ${data.propertyId}</p>
    <p>Check-in  : ${data.checkinDate}</p>
    <p>Guest     : ${data.guestName}</p>
    <p>Initials  : ${data.initials[act]}</p>
    <img src="${data.signature}" width="300">
    <footer style="position:fixed;bottom:1cm;font-size:8pt;width:100%;text-align:center">
      Version ${env.LEGAL_VERSION} \u2022 hash ${subId}
    </footer>`;
    const pdfBuffer = await env.BROWSER.htmlToPdf({ body: html, cf: { format: "A4" } });
    const shortId = nanoid(6);
    const filename = `${act}.pdf`;
    const key = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/${data.guestName.toLowerCase().replace(/[^a-z]/g, "-")}-${shortId}.pdf`;
    await env.WAIVERS_R2.put(key, pdfBuffer, {
      httpMetadata: { contentType: "application/pdf" }
    });
    results.push({ id: shortId, activity: act, filename, r2Key: key, bytes: pdfBuffer });
  }
  return results;
}
__name(makePDFs, "makePDFs");

// src/mail.js
async function sendMail(data, pdfs, pin, env) {
  const boundary = "BOUNDARY-" + Math.random().toString(36).slice(2);
  let body = "";
  body += `From: ${env.EMAIL_FROM}\r
`;
  body += `To: ${data.guestEmail}\r
`;
  body += `Subject: Your activity waiver(s)\r
`;
  body += "MIME-Version: 1.0\r\n";
  body += `Content-Type: multipart/mixed; boundary=${boundary}\r
\r
`;
  body += `--${boundary}\r
`;
  body += "Content-Type: text/plain; charset=utf-8\r\n\r\n";
  body += `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached:${pdfs.map((p) => " " + p.filename).join(", ")}

${pin ? "Your Archery PIN is " + pin + "\n\n" : ""}
Regards,
The Rentals Team
\r
`;
  for (const p of pdfs) {
    body += `--${boundary}\r
`;
    body += "Content-Type: application/pdf\r\n";
    body += "Content-Transfer-Encoding: base64\r\n";
    body += `Content-Disposition: attachment; filename="${p.filename}"\r
\r
`;
    body += btoa(String.fromCharCode(...new Uint8Array(p.bytes))) + "\r\n";
  }
  body += `--${boundary}--`;
  await fetch("https://api.cloudflare.com/client/v4/accounts/" + env.CLOUDFLARE_ACCOUNT_ID + "/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Authorization": "Bearer " + env.CLOUDFLARE_API_TOKEN
      // put as secret
    },
    body
  });
}
__name(sendMail, "sendMail");

// src/resp.js
var json = /* @__PURE__ */ __name((obj, status2 = 200) => new Response(JSON.stringify(obj), {
  status: status2,
  headers: { "content-type": "application/json" }
}), "json");
var bad = /* @__PURE__ */ __name((msg) => json({ ok: false, error: msg }, 400), "bad");

// src/index.mjs
var src_default = {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    try {
      if (request.method === "GET" && pathname === "/") return await htmlPage(env);
      if (request.method === "POST" && pathname === "/submit") return submit(request, env);
      if (request.method === "GET" && pathname === "/admin/search") return search(request, env);
      if (request.method === "GET" && pathname === "/status") return status(env);
      if (request.method === "GET" && pathname.startsWith("/download/")) return downloadPDF(request, env);
      return new Response("Not found", { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response("Server error", { status: 500 });
    }
  }
};
async function status(env) {
  try {
    const dbOK = await env.waivers.prepare("SELECT 1").first();
    return json({ ok: true, db: !!dbOK, ts: Date.now() });
  } catch (error) {
    return json({ ok: false, error: error.message, ts: Date.now() });
  }
}
__name(status, "status");
async function search(request, env) {
  const url = new URL(request.url);
  const qName = url.searchParams.get("name") ?? "";
  const qEmail = url.searchParams.get("email") ?? "";
  const qProp = url.searchParams.get("prop") ?? "";
  const qDate = url.searchParams.get("date") ?? "";
  const rows = await env.waivers.prepare(
    `SELECT * FROM submissions
        WHERE guest_name  LIKE ?1
          AND guest_email LIKE ?2
          AND property_id LIKE ?3
          AND checkin_date LIKE ?4
        ORDER BY created_at DESC
        LIMIT 200`
  ).bind(`%${qName}%`, `%${qEmail}%`, `%${qProp}%`, `%${qDate}%`).all();
  return json({ rows });
}
__name(search, "search");
async function submit(request, env) {
  console.log("Submit endpoint called");
  const data = await request.json();
  console.log("Received data:", data);
  const must = [
    "propertyId",
    "checkinDate",
    "guestName",
    "guestEmail",
    "activities",
    "initials",
    "signature",
    "accepted"
  ];
  for (const k of must)
    if (data[k] === void 0 || data[k] === "" || Array.isArray(data[k]) && !data[k].length)
      return bad(`missing ${k}`);
  if (data.accepted !== true)
    return bad("master acceptance not ticked");
  const subId = nanoid(10);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.waivers.prepare(
      "INSERT INTO submissions VALUES(?1,?2,?3,?4,?5,?6,?7)"
    ).bind(
      subId,
      now,
      data.propertyId,
      data.checkinDate,
      data.guestName,
      data.guestEmail,
      JSON.stringify(data.activities)
    ).run();
    console.log("Submission saved to database");
  } catch (dbError) {
    console.error("Database error:", dbError);
    return json({ ok: false, error: "Database not initialized. Run migrations first." }, 500);
  }
  let pdfInfos;
  try {
    pdfInfos = await makePDFs(data, subId, env);
    console.log("PDFs generated:", pdfInfos.length);
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);
    return json({ ok: false, error: "PDF generation failed: " + pdfError.message }, 500);
  }
  try {
    for (const p of pdfInfos)
      await env.waivers.prepare(
        "INSERT INTO documents VALUES(?1,?2,?3,?4)"
      ).bind(p.id, subId, p.activity, p.r2Key).run();
    console.log("Document records saved");
  } catch (docError) {
    console.error("Document save error:", docError);
  }
  const pin = data.activities.includes("archery") ? env.ARCHERY_PIN : null;
  if (env.DEV_MODE === "true") {
    const downloads = pdfInfos.map((p) => ({
      filename: p.filename,
      url: `/download/${p.r2Key}`
    }));
    return json({
      ok: true,
      devMode: true,
      downloads,
      pin
    });
  }
  await sendMail(data, pdfInfos, pin, env);
  return json({
    ok: true,
    emailed: pdfInfos.map((p) => p.filename),
    pin
  });
}
__name(submit, "submit");
async function downloadPDF(request, env) {
  const { pathname } = new URL(request.url);
  const r2Key = pathname.replace("/download/", "");
  if (env.DEV_MODE !== "true") {
    return new Response("Downloads only available in dev mode", { status: 403 });
  }
  const object = await env.WAIVERS_R2.get(r2Key);
  if (!object) {
    return new Response("PDF not found", { status: 404 });
  }
  const filename = r2Key.split("/").pop();
  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=300"
    }
  });
}
__name(downloadPDF, "downloadPDF");

// ../../../../../../home/somark/.nvm/versions/node/v23.11.1/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../home/somark/.nvm/versions/node/v23.11.1/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-sW1d5E/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../../home/somark/.nvm/versions/node/v23.11.1/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-sW1d5E/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
