// Knowledge Companion Mock — Scenarios & Logic (v2)

let currentStep = 0;
let expandOpen = false;
let overlayOpen = false;
let overlayContent = null;
let logVisible = false;
let facilitatorOpen = false;
let activeVariant = null;
let journeyComplete = false;

function init() {
  renderStep(0);
  setupLogToggle();
  setupFacilitator();
}

// ── Step indicators ──

function updateIndicators() {
  const dots = document.querySelectorAll(".step-dot");
  dots.forEach((dot, i) => {
    dot.classList.remove("active", "completed");
    if (journeyComplete && !activeVariant) {
      // All steps completed on summary
      dot.classList.add("completed");
    } else if (i < currentStep) {
      dot.classList.add("completed");
    } else if (i === currentStep) {
      dot.classList.add("active");
    }
  });
}

// ── Journey rendering ──

function renderStep(i) {
  currentStep = i;
  expandOpen = false;
  overlayOpen = false;
  overlayContent = null;

  const data = activeVariant ? getVariantData(activeVariant) : JOURNEY_STEPS[i];
  const main = document.getElementById("wizard-body");
  main.innerHTML = "";

  if (journeyComplete && !activeVariant) {
    renderSummary(main);
    renderNavButtons(main, true);
    updateIndicators();
    logAction("VIEW", "Riepilogo finale");
    return;
  }

  const header = buildHeader(data);
  const body = document.createElement("div");
  body.className = "step-body";
  body.appendChild(buildStepContent(data));
  body.appendChild(buildRefPanel(data));
  const footer = buildFooter(data);

  main.appendChild(header);
  main.appendChild(body);
  main.appendChild(footer);

  updateIndicators();
  logAction("VIEW", `${data.stepTitle} — ${data.discipline} / ${data.order}`);
}

function renderSummary(main) {
  const header = document.createElement("div");
  header.className = "wizard-header";
  header.innerHTML = `
    <h2>Riepilogo della progettazione</h2>
    <div class="wizard-meta">
      <span>Italiano — Primaria</span>
      <span>"La poesia e l'emozione: composizione e lettura ad alta voce"</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:100%"></div>
    </div>
  `;
  main.appendChild(header);

  const body = document.createElement("div");
  body.className = "step-body";
  body.innerHTML = `
    <div class="summary-list">
      <div class="summary-item done">
        <span class="summary-icon">&#10003;</span>
        <div>
          <strong>2 traguardi selezionati</strong>
          <span class="summary-sub">Passo 2 — Traguardi Italiano / Primaria</span>
        </div>
      </div>
      <div class="summary-item done">
        <span class="summary-icon">&#10003;</span>
        <div>
          <strong>2 evidenze associate</strong>
          <span class="summary-sub">Passo 3 — Evidenze Scienze / Secondaria</span>
        </div>
      </div>
      <div class="summary-item done">
        <span class="summary-icon">&#10003;</span>
        <div>
          <strong>Compito di realtà definito</strong>
          <span class="summary-sub">"Analisi guidata di un racconto di Calvino"</span>
        </div>
      </div>
      <div class="summary-item done">
        <span class="summary-icon">&#10003;</span>
        <div>
          <strong>Note inclusive compilate</strong>
          <span class="summary-sub">Supporto visivo, mappe concettuali</span>
        </div>
      </div>
      <div class="summary-item note">
        <span class="summary-icon">&#8505;</span>
        <div>
          <strong>Riferimenti consultabili</strong>
          <span class="summary-sub">Disponibili in ogni passaggio del wizard</span>
        </div>
      </div>
    </div>
    <div class="summary-actions">
      <button class="summary-btn" onclick="restartJourney()">Rivedi i passaggi</button>
      <button class="summary-btn primary">Salva bozza</button>
      <button class="summary-btn primary">Completa UDA</button>
    </div>
  `;
  main.appendChild(body);
}

function restartJourney() {
  activeVariant = null;
  journeyComplete = false;
  renderStep(0);
  logAction("NAV", "Ripartenza percorso");
}

// ── Header ──

function buildHeader(data) {
  const el = document.createElement("div");
  el.className = "wizard-header";
  el.innerHTML = `
    <h2>${data.stepTitle}</h2>
    <div class="wizard-meta">
      <span>${data.discipline} — ${data.order}</span>
      <span>"${data.udaTitle}"</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${data.progress}%"></div>
    </div>
  `;
  return el;
}

// ── Step content ──

function buildStepContent(data) {
  const wrap = document.createElement("div");

  if (data.stepFields === "traguardi") {
    wrap.innerHTML = `
      <div class="field-group">
        <label>Traguardi</label>
        <ul class="traguardi-list">
          ${data.traguardi.map((t, i) => `
            <li class="selected" onclick="this.classList.toggle('selected')">
              <input type="checkbox" ${i < 2 ? "checked" : ""}>
              <span><strong>${t.id}</strong> — ${t.text}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  } else if (data.stepFields === "evidenze") {
    wrap.innerHTML = `
      <div class="field-group">
        <label>Evidenze selezionate</label>
        ${data.evidenze.map(e => `
          <div class="evidence-item selected" onclick="this.classList.toggle('selected')">
            <input type="checkbox" checked>
            <span><strong>${e.id}</strong> — ${e.text}</span>
          </div>
        `).join("")}
      </div>
    `;
  } else if (data.stepFields === "realTask") {
    wrap.innerHTML = `
      <div class="field-group">
        <label>Compito di Realtà</label>
        <textarea placeholder="Descrivi il compito di realtà...">${data.realTask}</textarea>
      </div>
      <div class="field-group">
        <label>Note BES / Inclusione</label>
        <textarea placeholder="Annotazioni per l'inclusione...">${data.notesBES}</textarea>
      </div>
    `;
  }

  return wrap;
}

// ── Reference panel ──

function buildRefPanel(data) {
  const panel = document.createElement("div");
  panel.className = "ref-panel";

  if (!data.references || data.references.length === 0) {
    panel.innerHTML = `
      <div class="ref-empty">
        <p>Nessun riferimento specifico per questa combinazione di disciplina e ordine.</p>
        <p class="ref-empty-sub">Puoi continuare senza consultare fonti.</p>
      </div>
    `;
    return panel;
  }

  const mainRef = data.references.find(r => r.main);
  const otherRefs = data.references.filter(r => !r.main);
  const forceExpand = data.forceExpand || false;
  const expanded = forceExpand || expandOpen;
  const mainIdx = data.references.indexOf(mainRef);
  const otherIdxs = otherRefs.map(r => data.references.indexOf(r));

  panel.innerHTML = `
    <div class="ref-intro">${data.refIntro}</div>
    <div class="ref-main">
      <div class="ref-category ${catClass(mainRef.category)}">${mainRef.category}</div>
      <div class="ref-source">${mainRef.source}</div>
      <div class="ref-title">${mainRef.title}</div>
      <div class="ref-relevance">${mainRef.relevance}</div>
      <div class="ref-actions">
        <button class="ref-btn primary" onclick="openOverlay(${mainIdx})">Apri riferimento</button>
        ${otherRefs.length > 0 ? `<button class="ref-btn expand-btn" onclick="toggleExpand(this)">${expanded ? "Nascondi" : "Mostra altre " + otherRefs.length + " fonti"}</button>` : ""}
      </div>
    </div>
    <div class="ref-expand ${expanded ? "open" : ""}" id="ref-expand">
      ${otherRefs.map((r, j) => `
        <div class="ref-expand-item">
          <div class="ref-category ${catClass(r.category)}">${r.category}</div>
          <div class="ref-source">${r.source}</div>
          <div class="ref-title">${r.title}</div>
          <div class="ref-relevance">${r.relevance}</div>
          <div class="ref-actions">
            <button class="ref-btn primary" onclick="openOverlay(${otherIdxs[j]})">Apri riferimento</button>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="ref-continue-hint">Puoi continuare anche senza consultare i riferimenti.</div>
  `;

  return panel;
}

function catClass(cat) {
  if (cat === "Curricolo") return "curricolo";
  if (cat === "Fonte normativa") return "fonte";
  return "approfondimento";
}

function toggleExpand(btn) {
  expandOpen = !expandOpen;
  const expand = document.getElementById("ref-expand");
  if (expand) expand.classList.toggle("open", expandOpen);
  const count = (activeVariant ? getVariantData(activeVariant) : JOURNEY_STEPS[currentStep]).references.length - 1;
  btn.textContent = expandOpen ? "Nascondi" : `Mostra altre ${count} fonti`;
  logAction("EXPAND", expandOpen ? "Pannello fonti espanso" : "Pannello fonti chiuso");
}

function openOverlay(idx) {
  const data = activeVariant ? getVariantData(activeVariant) : JOURNEY_STEPS[currentStep];
  const ref = data.references[idx];
  overlayContent = ref;
  overlayOpen = true;
  const mask = document.getElementById("overlay");
  const box = mask.querySelector(".overlay-box");
  mask.classList.add("open");
  box.querySelector(".overlay-header h3").textContent = ref.title;
  box.querySelector(".overlay-body").innerHTML = `
    <div style="margin-bottom:12px;">
      <div class="ref-category ${catClass(ref.category)}">${ref.category}</div>
      <div class="ref-source" style="margin-top:4px;">${ref.source}</div>
    </div>
    <p style="margin-bottom:12px;">${ref.text}</p>
    <p style="font-style:italic; color:var(--muted);">Contenuto del volume (${ref.source}) — tratto dal mock di validazione. In un prodotto reale qui apparirebbe il testo completo del volume.</p>
  `;
  logAction("OVERLAY_OPEN", `Aperto reader: "${ref.title}" (${ref.source})`);
}

function closeOverlay() {
  overlayOpen = false;
  overlayContent = null;
  document.getElementById("overlay").classList.remove("open");
  logAction("OVERLAY_CLOSE", "Reader chiuso, wizard intatto");
}

// ── Navigation ──

function buildFooter(data) {
  const footer = document.createElement("div");
  footer.className = "wizard-footer";

  const isLast = currentStep === JOURNEY_STEPS.length - 1 && !activeVariant;
  footer.innerHTML = `
    <button class="wizard-btn back" onclick="goBack()">← Indietro</button>
    <button class="wizard-btn next" onclick="${isLast ? "completeJourney()" : "goNext()"}">${isLast ? "Completa UDA →" : "Avanti →"}</button>
  `;
  return footer;
}

function renderNavButtons(main, isSummary) {
  const footer = document.createElement("div");
  footer.className = "wizard-footer";
  if (isSummary) {
    footer.innerHTML = `
      <button class="wizard-btn back" onclick="restartJourney()">← Rivedi</button>
      <div></div>
    `;
  } else {
    footer.innerHTML = `
      <button class="wizard-btn back" onclick="goBack()">← Indietro</button>
      <button class="wizard-btn next" onclick="goNext()">Avanti →</button>
    `;
  }
  main.appendChild(footer);
}

function goBack() {
  if (activeVariant) {
    activeVariant = null;
    renderStep(currentStep);
    logAction("NAV_BACK", "Uscita variante test");
    return;
  }
  if (currentStep > 0) {
    renderStep(currentStep - 1);
    logAction("NAV_BACK", `Passo ${JOURNEY_STEPS[currentStep].step}`);
  }
}

function goNext() {
  if (activeVariant) {
    activeVariant = null;
    renderStep(currentStep);
    logAction("NAV_NEXT", "Ritorno al percorso principale");
    return;
  }
  if (currentStep < JOURNEY_STEPS.length - 1) {
    renderStep(currentStep + 1);
    logAction("NAV_NEXT", `Passo ${JOURNEY_STEPS[currentStep].step}`);
  }
}

function completeJourney() {
  journeyComplete = true;
  renderStep(currentStep);
  logAction("NAV_NEXT", "Percorso completato — riepilogo");
}

// ── Facilitator panel ──

function setupFacilitator() {
  const panel = document.getElementById("facilitator-panel");
  const toggle = document.getElementById("facilitator-toggle");

  // Render variant buttons
  const list = document.getElementById("variant-list");
  TEST_VARIANTS.forEach((v, i) => {
    const btn = document.createElement("button");
    btn.className = "variant-btn";
    btn.textContent = v.label;
    btn.title = v.description;
    btn.onclick = () => activateVariant(i);
    list.appendChild(btn);
  });

  toggle.onclick = () => {
    facilitatorOpen = !facilitatorOpen;
    panel.classList.toggle("open", facilitatorOpen);
    toggle.textContent = facilitatorOpen ? "Chiudi test" : "Modalità test";
  };
}

function activateVariant(i) {
  const v = TEST_VARIANTS[i];
  activeVariant = v;
  journeyComplete = false;

  // Find the matching journey step or default to step 0
  const stepIdx = JOURNEY_STEPS.findIndex(s => s.step === v.step);
  currentStep = stepIdx >= 0 ? stepIdx : 0;

  // Force expand if variant requires it
  expandOpen = v.forceExpand || false;

  renderStep(currentStep);

  // Force overlay if variant requires it
  if (v.forceOverlay && v.references.length > 0) {
    setTimeout(() => openOverlay(0), 100);
  }

  logAction("VARIANT", `Variante test: ${v.label}`);
}

function getVariantData(variant) {
  // Merge variant data with the current journey step
  const base = JOURNEY_STEPS[currentStep];
  return {
    ...base,
    stepTitle: `${base.stepTitle} (test: ${variant.label})`,
    refIntro: variant.refIntro || base.refIntro,
    references: variant.references,
    forceExpand: variant.forceExpand
  };
}

function exitVariant() {
  activeVariant = null;
  expandOpen = false;
  renderStep(currentStep);
  logAction("VARIANT_EXIT", "Ritorno al percorso principale");
}

// ── Observer log ──

const logEntries = [];

function logAction(action, detail) {
  const now = new Date();
  const ts = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  logEntries.push({ ts, action, detail });
  renderLog();
  try { localStorage.setItem("kc_mock_log", JSON.stringify(logEntries)); } catch(e) {}
}

function renderLog() {
  const body = document.getElementById("log-body");
  if (!body) return;
  body.innerHTML = logEntries.map(e => `
    <div class="entry">
      <span class="ts">[${e.ts}]</span>
      <span class="action">${e.action}</span>
      <span class="detail">${e.detail}</span>
    </div>
  `).join("");
  body.scrollTop = body.scrollHeight;
}

function setupLogToggle() {
  const toggle = document.getElementById("observer-toggle");
  const panel = document.getElementById("observer-log");
  toggle.onclick = () => {
    logVisible = !logVisible;
    panel.classList.toggle("open", logVisible);
    toggle.textContent = logVisible ? "Chiudi log" : "Log osservatore";
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "l" || e.key === "L") {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      logVisible = !logVisible;
      panel.classList.toggle("open", logVisible);
      toggle.textContent = logVisible ? "Chiudi log" : "Log osservatore";
    }
  });
  try {
    const saved = localStorage.getItem("kc_mock_log");
    if (saved) { logEntries.push(...JSON.parse(saved)); renderLog(); }
  } catch(e) {}
}
