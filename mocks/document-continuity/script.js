// Document Continuity Mock — scenario data and logic

const scenarios = {
  empty: {
    toast: null,
    warning: null,
    records: []
  },

  justExported: {
    toast: {
      title: 'Programmazione annuale scaricata in formato DOCX.',
      detail: 'Il file e stato scaricato sul tuo dispositivo. Contesto: Italiano — Primaria — Anno Scolastico 2025/2026.'
    },
    warning: null,
    records: [
      {
        id: 'exp-001',
        type: 'Programmazione annuale',
        format: 'DOCX',
        title: 'Programmazione Italiano — Primaria',
        discipline: 'Italiano',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '21/07/2026, 14:32',
        status: 'completo',
        coherence: 'coherent',
        context: 'Deriva da: UDA "Grammatica — Analisi logica" (Q1) e UDA "Letteratura — Narrativa" (Q2).'
      }
    ]
  },

  multipleDocs: {
    toast: null,
    warning: null,
    records: [
      {
        id: 'exp-001',
        type: 'UDA',
        format: 'DOCX',
        title: 'UDA — Grammatica: Analisi logica',
        discipline: 'Italiano',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '21/07/2026, 14:32',
        status: 'validata',
        coherence: 'coherent',
        context: 'Stato: Validata. 3 traguardi, 5 obiettivi, 2 evidenze.'
      },
      {
        id: 'exp-002',
        type: 'Programmazione annuale',
        format: 'PDF',
        title: 'Programmazione Italiano — Primaria',
        discipline: 'Italiano',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '20/07/2026, 09:15',
        status: 'completo',
        coherence: 'modified',
        context: 'Il lavoro e stato modificato dopo questa esportazione. Ultimo aggiornamento: 21/07/2026.'
      },
      {
        id: 'exp-003',
        type: 'Relazione',
        format: 'DOCX',
        title: 'Relazione intermedia — Q1',
        discipline: 'Italiano',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '18/07/2026, 16:45',
        status: 'bozza',
        coherence: 'unknown',
        context: 'Bozza. Non e possibile verificare se il documento corrisponde ancora al lavoro attuale.'
      },
      {
        id: 'exp-004',
        type: 'UDA',
        format: 'SCORM',
        title: 'UDA — Letteratura: Narrativa',
        discipline: 'Italiano',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '15/07/2026, 11:20',
        status: 'in revisione',
        coherence: 'modified',
        context: 'L\'UDA e stato modificato dopo l\'esportazione SCORM. La versione scaricata potrebbe non riflettere le modifiche recenti.'
      },
      {
        id: 'exp-005',
        type: 'Programmazione annuale',
        format: 'DOCX',
        title: 'Programmazione Matematica — Primaria',
        discipline: 'Matematica',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '10/07/2026, 08:50',
        status: 'completo',
        coherence: 'coherent',
        context: 'Deriva da: UDA "Geometria — Piani e figure" e UDA "Aritmetica — Frazioni".'
      }
    ]
  },

  modifiedWork: {
    toast: null,
    warning: {
      title: 'Il lavoro e stato modificato dopo questa esportazione.',
      detail: 'Ultimo aggiornamento: 21/07/2026, 16:10. La versione scaricata potrebbe non riflettere le modifiche recenti.'
    },
    records: [
      {
        id: 'exp-001',
        type: 'UDA',
        format: 'DOCX',
        title: 'UDA — Scienze: Esperimenti in classe',
        discipline: 'Scienze',
        order: 'Secondaria',
        class: 'Classe 2a',
        date: '20/07/2026, 10:00',
        status: 'bozza',
        coherence: 'modified',
        context: 'L\'UDA e stato modificato dopo questa esportazione. Sono stati aggiunti 2 obiettivi e modificato il compito di realta.'
      }
    ]
  },

  coherent: {
    toast: null,
    warning: null,
    records: [
      {
        id: 'exp-001',
        type: 'UDA',
        format: 'DOCX',
        title: 'UDA — Matematica: Frazioni',
        discipline: 'Matematica',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '21/07/2026, 14:32',
        status: 'validata',
        coherence: 'coherent',
        context: 'Questo documento corrisponde al lavoro attuale. Stato: Validata.'
      }
    ]
  },

  unknown: {
    toast: null,
    warning: null,
    records: [
      {
        id: 'exp-001',
        type: 'Relazione',
        format: 'PDF',
        title: 'Relazione finale — A.S. 2025/2026',
        discipline: 'Italiano',
        order: 'Primaria',
        class: 'Classe 3a',
        date: '15/06/2026, 12:00',
        status: 'completo',
        coherence: 'unknown',
        context: 'Non e possibile verificare se il documento scaricato corrisponde ancora al lavoro attuale. Il documento e stato prodotto prima delle modifiche al curricolo di giugno.'
      }
    ]
  }
};

let currentScenario = 'empty';
let currentFilter = 'all';
let detailRecord = null;

function getFilteredRecords() {
  const records = scenarios[currentScenario].records;
  if (currentFilter === 'all') return records;
  const filterMap = {
    'uda': 'UDA',
    'programmazioni': 'Programmazione annuale',
    'relazioni': 'Relazione'
  };
  return records.filter(r => r.type === filterMap[currentFilter]);
}

function renderCoherenceBadge(coherence) {
  const map = {
    coherent: { class: 'badge-coherent', label: 'Coerente' },
    modified: { class: 'badge-modified', label: 'Modificato' },
    unknown: { class: 'badge-unknown', label: 'Da verificare' }
  };
  const b = map[coherence] || map.unknown;
  return `<span class="export-card-badge ${b.class}">${b.label}</span>`;
}

function renderStatus(status) {
  const map = {
    bozza: 'Bozza',
    'in revisione': 'In revisione',
    completa: 'Completo',
    validata: 'Validata',
    archiviata: 'Archiviata'
  };
  return map[status] || status;
}

function renderRecord(r) {
  return `
    <div class="export-card" onclick="showDetail('${r.id}')">
      <div class="export-card-header">
        <div class="export-card-title">${r.title}</div>
        ${renderCoherenceBadge(r.coherence)}
      </div>
      <div class="export-card-meta">
        <span>${r.type} &middot; ${r.format}</span>
        <span>${r.discipline} &middot; ${r.order}</span>
        <span>${r.date}</span>
      </div>
      <div class="export-card-context">${r.context}</div>
      <div class="export-card-actions">
        <button class="btn-action btn-primary" onclick="event.stopPropagation(); simulateReturn('${r.id}')">Torna al lavoro</button>
        <button class="btn-action btn-secondary" onclick="event.stopPropagation(); simulateNewVersion('${r.id}')">Produci una nuova versione</button>
      </div>
    </div>
  `;
}

function renderToast(toast) {
  if (!toast) return '';
  return `
    <div class="export-toast">
      <span class="icon">&#10003;</span>
      <div class="content">
        <div class="title">${toast.title}</div>
        <div class="detail">${toast.detail}</div>
      </div>
    </div>
  `;
}

function renderWarning(warning) {
  if (!warning) return '';
  return `
    <div class="modified-warning">
      <span class="icon">&#9888;</span>
      <div class="content">
        <div class="title">${warning.title}</div>
        <div class="detail">${warning.detail}</div>
        <div class="export-card-actions">
          <button class="btn-action btn-primary" onclick="simulateReturn('current')">Torna al lavoro</button>
          <button class="btn-action btn-secondary" onclick="simulateNewVersion('current')">Produci una nuova versione</button>
        </div>
      </div>
    </div>
  `;
}

function renderFilterBar() {
  const filters = [
    { key: 'all', label: 'Tutti' },
    { key: 'uda', label: 'UDA' },
    { key: 'programmazioni', label: 'Programmazioni' },
    { key: 'relazioni', label: 'Relazioni' }
  ];
  return filters.map(f =>
    `<button class="filter-btn ${currentFilter === f.key ? 'active' : ''}" onclick="setFilter('${f.key}')">${f.label}</button>`
  ).join('');
}

function render() {
  const s = scenarios[currentScenario];
  const records = getFilteredRecords();

  let html = '';
  html += renderToast(s.toast);
  html += renderWarning(s.warning);

  if (records.length === 0 && !s.toast && !s.warning) {
    html += `
      <div class="empty-state">
        <div class="icon">&#128196;</div>
        <h3>Non hai ancora prodotto documenti da questo lavoro.</h3>
        <p>Quando esporterai un UDA, una programmazione o una relazione, il documento apparira qui con il contesto della fonte.</p>
        <button class="btn-action btn-primary" onclick="simulateNewExport()">Produci un documento</button>
      </div>
    `;
  } else {
    html += `<div class="filter-bar">${renderFilterBar()}</div>`;
    html += `<div class="export-registry">${records.map(renderRecord).join('')}</div>`;
  }

  html += `<div class="registry-footer">I documenti sono scaricati sul tuo dispositivo. CurManLight non conserva copie dei file esportati.</div>`;

  document.getElementById('registry').innerHTML = html;
}

function renderDetailModal() {
  if (!detailRecord) {
    document.getElementById('detail-overlay').style.display = 'none';
    return;
  }
  const r = detailRecord;
  document.getElementById('detail-overlay').style.display = 'flex';
  document.getElementById('detail-modal').innerHTML = `
    <h3>${r.title}</h3>
    <div class="detail-row"><span class="label">Tipo</span><span class="value">${r.type}</span></div>
    <div class="detail-row"><span class="label">Formato</span><span class="value">${r.format}</span></div>
    <div class="detail-row"><span class="label">Disciplina</span><span class="value">${r.discipline}</span></div>
    <div class="detail-row"><span class="label">Ordine</span><span class="value">${r.order}</span></div>
    <div class="detail-row"><span class="label">Classe</span><span class="value">${r.class}</span></div>
    <div class="detail-row"><span class="label">Data esportazione</span><span class="value">${r.date}</span></div>
    <div class="detail-row"><span class="label">Stato del lavoro</span><span class="value">${renderStatus(r.status)}</span></div>
    <div class="detail-row"><span class="label">Aggiornamento</span><span class="value">${r.coherence === 'coherent' ? 'Coerente con il lavoro attuale' : r.coherence === 'modified' ? 'Modificato dopo esportazione' : 'Da verificare'}</span></div>
    <div class="detail-actions">
      <button class="btn-action btn-primary" onclick="closeDetail(); simulateReturn('${r.id}')">Torna al lavoro</button>
      <button class="btn-action btn-secondary" onclick="closeDetail(); simulateNewVersion('${r.id}')">Produci una nuova versione</button>
      <button class="btn-action btn-secondary" onclick="closeDetail()">Chiudi</button>
    </div>
  `;
}

// Actions
function setScenario(name) {
  currentScenario = name;
  document.querySelectorAll('.test-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-scenario="${name}"]`).classList.add('active');
  render();
}

function setFilter(f) {
  currentFilter = f;
  render();
}

function showDetail(id) {
  const records = scenarios[currentScenario].records;
  detailRecord = records.find(r => r.id === id) || null;
  renderDetailModal();
}

function closeDetail() {
  detailRecord = null;
  renderDetailModal();
}

function simulateReturn(id) {
  alert('Simulazione: torna al lavoro sorgente. Nel prodotto reale, questa azione aprirbbe la vista con il lavoro collegato.');
}

function simulateNewVersion(id) {
  alert('Simulazione: produci una nuova versione. Nel prodotto reale, questa azione avvierebbe un nuovo esportazione con i dati aggiornati.');
}

function simulateNewExport() {
  alert('Simulazione: nuova esportazione. Nel prodotto reale, questa azione aprirebbe la vista Esportazioni.');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  render();
  renderDetailModal();

  document.getElementById('detail-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDetail();
  });
});
