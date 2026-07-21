# Libreria Componenti Concettuali — CurManLight

> Censimento dei pattern UI presenti nel codebase. Poiché non esistono componenti React
> estratti (tutto il codice è inline in `App.tsx`, ~12.500 righe), questo documento
> cataloga i pattern come "componenti concettuali" con valutazione di riutilizzabilità.
> Ultimo aggiornamento: 2026-07-19

---

## 1. Censimento Pattern Esistenti

### Tabella Riepilogativa

| # | Componente | Scopo | Stato Attuale | Riutilizzabile | Sostituzione Proposta |
|---|-----------|-------|---------------|----------------|----------------------|
| 1 | **Toast** | Notifiche temporanee all'utente | Inline, fixed bottom-right, auto-dismiss 3500ms | ⚠️ Medio | `<ToastProvider>` + `<Toast>` con coda |
| 2 | **Modal** | Dialoghi modali con backdrop | Inline, `fixed inset-0 z-[150]`, backdrop blur | ⚠️ Medio | `<Modal>` con props `isOpen`, `onClose`, `title`, `size` |
| 3 | **Sidebar** | Navigazione laterale collassabile | Inline, `aside#sidebar`, toggle via DOM manipulation | 🔴 Basso | `<Sidebar>` + `<SidebarSection>` + `<SidebarItem>` |
| 4 | **Header** | Barra superiore con logo e azioni | Inline, `sticky top-0 z-50`, bg-slate-900 | 🔴 Basso | `<Header>` con slots per logo, actions, avatar |
| 5 | **TabPanel** | Cambio contenuto per tab attivo | Condizionale `{activeTab === 'x' && (...)}`  | 🔴 Basso | `<TabPanel value="x">` con container |
| 6 | **CollapsibleAccordion** | Sezioni espandibili nel curricolo | Inline con `expandedMapSections` state | ⚠️ Medio | `<Accordion>` + `<AccordionItem>` |
| 7 | **DataTable** | Visualizzazione dati tabellari | Inline `<table>` con styling manuale | ⚠️ Medio | `<DataTable columns={} data={} />` |
| 8 | **FormInput** | Input, select, textarea | Classi Tailwind ripetute ovunque | ⚠️ Medio | `<Input>`, `<Select>`, `<Textarea>` con validazione |
| 9 | **Badge** | Indicatore di stato | Inline, varianti per colore/forma | ✅ Alto | `<Badge variant="pending\|approved\|active">` |
| 10 | **ProgressBar** | Tracciamento progresso | Inline, barre colorate con percentuali | ⚠️ Medio | `<ProgressBar value={} max={} color="" />` |
| 11 | **Card** | Contenitori per sezioni | Pattern ripetuto `bg-white rounded-2xl shadow-sm border` | ✅ Alto | `<Card>`, `<CardHeader>`, `<CardBody>` |
| 12 | **CopyButton** | Copia negli appunti con feedback | Funzione `copyText()` + toast | ✅ Alto | `<CopyButton text="">` con stato feedback |
| 13 | **FilterBar** | Controlli ricerca/filtro | Inline con stati multipli (`libFilter*`) | ⚠️ Medio | `<FilterBar filters={} onChange={} />` |
| 14 | **EmptyState** | Stato vuoto quando mancano dati | Testo italic `text-slate-400` inline | ⚠️ Medio | `<EmptyState icon={} title="" description="" />` |
| 15 | **LoadingSpinner** | Stati di caricamento | `animate-pulse` + testo italic | 🔴 Basso | `<Spinner size="sm\|md\|lg" />` |
| 16 | **WarningBanner** | Alert di sistema (volatile, file://) | Inline, `bg-rose-50` / `bg-amber-50`, `fixed` nel layout | ⚠️ Medio | `<WarningBanner type="error\|warning">` |
| 17 | **OnboardingModal** | Wizard di primo setup (4 step) | Inline, `z-[160]`, progress bar + step condizionali | 🔴 Basso | `<OnboardingWizard steps={} onComplete={} />` |
| 18 | **CopilotChat** | Chat laterale IA | Inline, `fixed z-[150]`, w-80, con chips suggerimenti | 🔴 Basso | `<CopilotChat />` + `<ChatMessage>` + `<SuggestionChips>` |
| 19 | **UserAvatarMenu** | Dropdown menu utente | Inline, `relative` + `absolute`, 5 azioni | ⚠️ Medio | `<UserMenu>` + `<DropdownMenu>` |
| 20 | **SCORMExporter** | Creazione e download pacchetto SCORM | Classe `LocalZipPacker` + funzione `handleDownloadScormManifest` | ✅ Alto | `<SCORMExporter uda={uda} />` |

---

## 2. Analisi Dettagliata per Componente

### 2.1 Toast

**Posizione nel codice**: Riga 4766-4773 (`App.tsx`)

**Implementazione attuale**:
- Stati: `toastMessage` (string|null), `toastSuccess` (boolean)
- Funzione: `showToast(msg, success)` con `setTimeout` 3500ms
- Rendering: un singolo toast alla volta, fixed bottom-right
- Nessuna coda di toast multipli

**Pattern CSS**:
```
fixed bottom-6 right-6 bg-slate-950 text-white px-4 py-3
rounded-2xl shadow-2xl border border-slate-800 z-[200]
flex items-center space-x-3 text-xs max-w-sm
transition-all duration-300
```

**Limiti**: sovrappone toast se chiamati rapidamente. Nessuna animazione di uscita.

**Proposta**: Provider con coda, animazione enter/exit, varianti di posizione.

---

### 2.2 Modal

**Posizione nel codice**: Righe 7944, 11881, 11955, 11507 (multipli modali)

**Implementazione attuale**:
- Ogni modal è un blocco condizionale `{showX && (<div>...</div>)}`
- Backdrop: `bg-slate-900/60 backdrop-blur-sm`
- Contenuto: `bg-white rounded-2xl shadow-2xl max-w-2xl/3xl`
- z-index: `[150]` per modali normali, `[160]` per onboarding
- Nessuna gestione focus trap (accessibilità compromessa)
- Chiusura solo via `onClick={onClose}` sul pulsante X

**Modali presenti**:
- UDA Detail (`max-w-3xl`)
- Outcomes Recording (`max-w-lg`)
- Report Pedagogico (`max-w-2xl`)
- Onboarding (`max-w-lg`)
- Agent Setup (`max-w-2xl`)
- Save Modal
- Cloud Account Modal
- Motto Modal
- Add KB Document Modal

**Proposta**: `<Modal isOpen onClose size="sm|md|lg|xl">` con FocusTrap e Escape handler.

---

### 2.3 Sidebar

**Posizione nel codice**: Riga 4934-5159 (`App.tsx`)

**Implementazione attuale**:
- Elemento `<aside id="sidebar">` con classi dinamiche
- Toggle via `document.getElementById('sidebar').className = ...` (DOM manipulation diretta)
- Mobile: overlay `fixed inset-y-16 left-4 ... w-[280px]`
- Desktop: `w-64 shrink-0` con `sidebarCollapsed` state
- Nessuna animazione di apertura/chiusura su mobile (classe applicata direttamente)
- 5 sezioni con separatore `border-t border-slate-100`
- Sub-menu contestuali appaiono/scompaiono con logica condizionale complessa

**Problemi**:
- DOM manipulation invece di React state per mobile
- Classi CSS complesse concatenate in template literal
- Nessuna gestione accessibility (aria-expanded, aria-controls)

**Proposta**: `<Sidebar collapsed onToggle>` + `<SidebarSection title>` + `<SidebarItem active onClick>`.

---

### 2.4 Header

**Posizione nel codice**: Righe 4776-4928 (`App.tsx`)

**Implementazione attuale**:
- `sticky top-0 z-50 h-16 bg-slate-900 text-white shadow-md border-b border-slate-800`
- Logo image + testo gradient
- 5 azioni a destra: copilot toggle, stato IA, salva, avatar con dropdown
- Dropdown utente: `absolute right-0 mt-2 w-56 bg-slate-800` con 5 azioni
- Stato IA: badge con pallino pulsante che indica connessione

**Proposta**: `<Header>` con slot `left`, `center`, `right`. Il dropdown utente dovrebbe essere `<DropdownMenu>`.

---

### 2.5 TabPanel

**Posizione nel codice**: Ovunque, da riga 5218 a 10425 (`App.tsx`)

**Implementazione attuale**:
- Pattern: `{activeTab === 'dashboard' && (<div>...</div>)}`
- Ogni tab è un blocco enorme inline (centinaia di righe)
- Nessun lazy loading — tutti i tab sono nel DOM quando il componente è montato
- Nessuna transizione di cambio tab

**Proposta**: `<TabPanel value="dashboard">` con lazy rendering opzionale e transizioni.

---

### 2.6 CollapsibleAccordion

**Posizione nel codice**: Sezioni curricolo, raccordo diacronico

**Implementazione attuale**:
- Stato: `expandedMapSections: Record<string, boolean>`
- Toggle: click su header che inverte il valore booleano
- Contenuto: `{expanded && <div>...</div>}`
- Nessuna animazione di espansione/collasso

**Proposta**: `<Accordion allowMultiple>` + `<AccordionItem isOpen onToggle>` con transizione height.

---

### 2.7 DataTable

**Posizione nel codice**: Tabelle UDA, tabelle studenti, tabelle curricolo

**Implementazione attuale**:
- `<table className="w-full text-left">` con thead bg-slate-50
- Nessuna paginazione
- Nessun ordinamento column-header
- Nessuna responsive (tabelle possono sforare su mobile)
- Styling manuale per ogni riga: `className="border-b last:border-0"`

**Proposta**: `<DataTable columns={} data={} sortable paginated responsive />`.

---

### 2.8 FormInput

**Posizione nel codice**: Ovunque nei modali e nel wizard

**Implementazione attuale**:
- Classi Tailwind ripetute per ogni input:
  ```
  w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50
  focus:bg-white text-xs font-semibold
  focus:ring-1 focus:ring-indigo-500 outline-none
  ```
- Nessuna validazione integrata
- Nessuna label associata via `htmlFor`
- Nessun feedback di errore inline

**Proposta**: `<Input label="" error="" />`, `<Select label="" options={} />`, `<Textarea label="" rows={} />`.

---

### 2.9 Badge

**Posizione nel codice**: Stati UDA, conteggio pending, stato IA

**Implementazione attuale**:
- Forma pill: `rounded-full px-1.5 py-0.2`
- Varianti colore: amber (pending), emerald (approved), indigo (active), white (info)
- Nessun componente isolato — classi inline ripetute

**Proposta**: `<Badge variant="pending|approved|active|info" size="sm|md">`.

---

### 2.10 ProgressBar

**Posizione nel codice**: Onboarding wizard, statistiche esiti

**Implementazione attuale**:
- Barra singola con altezza `h-1 rounded-full` e bg dinamico
- Nessun valore numerico显示 — solo colore progressivo
- Nel wizard onboarding: 4 step con barre individuali

**Proposta**: `<ProgressBar value={75} color="indigo" label="Step 2 di 4" />`.

---

### 2.11 Card

**Posizione nel codice**: Ovunque

**Implementazione attuale**:
- Pattern principale: `bg-white rounded-2xl shadow-sm border border-slate-100 p-6`
- Varianti: `bg-slate-50 p-3 border rounded-xl` (card interna), `bg-slate-50 hover:bg-slate-100` (card cliccabile)
- Nessuna struttura composita — ogni card è un div monolitico

**Proposta**: `<Card>`, `<CardHeader>`, `<CardBody>`, `<CardFooter>`.

---

### 2.12 CopyButton

**Posizione nel codice**: Funzione `copyText()` importata da `utils/clipboard.ts`

**Implementazione attuale**:
- Funzione `copyText(text)` che usa `navigator.clipboard.writeText()`
- Feedback via `showToast("Testo copiato!")`
- Nessun bottone isolato — la funzione è chiamata inline

**Proposta**: `<CopyButton text="" label="Copia" />` con stato visivo (check per 2s).

---

### 2.13 FilterBar

**Posizione nel codice`: Archivio UDA (filter dropdowns)

**Implementazione attuale**:
- 5-6 stati separati: `libFilterClass`, `libFilterPeriod`, `libFilterStatus`, `libSearchText`, `libSorting`
- Select + input text inline
- Pulsante "Azzera filtri" che resetta tutti gli stati
- Logica filtro in `handleApplyLibFilters()`

**Proposta**: `<FilterBar filters={[{key:'class', type:'select', options:[]}, ...]} onChange={} />`.

---

### 2.14 EmptyState

**Posizione nel codice`**: Vari punti dove non ci sono dati

**Implementazione attuale**:
- `<div className="text-[10px] text-slate-400 italic text-left">Nessun traguardo programmato.</div>`
- Nessuna icona, nessuna call-to-action
- Testo minimale

**Proposta**: `<EmptyState icon={<Layers />} title="Nessun dato" description="..." action={{label: "Carica", onClick}} />`.

---

### 2.15 LoadingSpinner

**Posizione nel codice`**: Copilot che risponde, caricamento classi

**Implementazione attuale**:
- `animate-pulse italic` su testo "Elaborazione in corso..."
- Nessun elemento visivo di spinner rotante
- Nessuna dimensione configurabile

**Proposta**: `<Spinner size="sm" />` con SVG rotante + `<LoadingOverlay>` per intere sezioni.

---

### 2.16 WarningBanner

**Posizione nel codice`**: Righe 5166-5212 (`App.tsx`)

**Implementazione attuale**:
- 3 banner fissi nel layout (trans-tab): volatile memory, file:// protocol, token expiring
- Classi: `bg-rose-50 border-2 border-rose-200` (errore) o `bg-amber-50 border-2 border-amber-200` (avviso)
- Contenuto: icona + titolo + descrizione + eventuali azioni
- Posizionamento: `px-6 pt-4` nel main container, visibili su tutti i tab

**Proposta**: `<WarningBanner type="error|warning" title="" message="" action={{label, onClick}} />`.

---

### 2.17 OnboardingModal

**Posizione nel codice`**: Righe 11506-11877 (`App.tsx`)

**Implementazione attuale**:
- Wizard a 4 passi: Ruolo → Ordine → Materia → Classi
- Progress bar con step indicator
- Ogni step è un blocco condizionale `{onboardingStep === N && ...}`
- Stati: `onboardingRole`, `onboardingOrd`, `onboardingDisc`, `onboardingStep`
- Condizioni speciali: skip step 3 per infanzia/sostegno, skip step 3 per dirigente/collegio
- Nessuna transizione tra step

**Proposta**: `<OnboardingWizard steps={[{title, content, validate}]} onComplete />` con animazione slide.

---

### 2.18 CopilotChat

**Posizione nel codice`**: Righe 10429-10570 (`App.tsx`)

**Implementazione attuale**:
- Pannello laterale fisso: `fixed top-20 bottom-4 right-4 left-4 md:left-auto md:w-80`
- Header: sfondo slate-900 con icona Sparkles + pulsante chiudi
- Messaggi: chat bubble con allineamento utente/assistente
- Suggerimenti: chips contestuali in base al tab attivo
- Input: textarea con pulsante invio + pulsante microfono
- TTS: pulsante per ascoltare risposte (play/pausa/speaker)
- Nessuna memoria persistente della chat tra sessioni

**Proposta**: `<CopilotChat />` isolato con stato persistente, streaming risposte, accessibilità keyboard.

---

### 2.19 UserAvatarMenu

**Posizione nel codice`**: Righe 4852-4923 (`App.tsx`)

**Implementazione attuale**:
- Avatar: `h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600`
- Dropdown: `absolute right-0 mt-2 w-56 bg-slate-800`
- 3 sezioni: info utente, azioni cloud, azioni pericolose + account
- Toggle: `roleDropdownOpen` state
- Nessuna chiusura su click esterno
- Nessuna gestione keyboard navigation

**Proposta**: `<UserAvatarMenu>` + `<DropdownMenu>` con click-outside handler e arrow keys.

---

### 2.20 SCORMExporter

**Posizione nel codice`**: Classe `LocalZipPacker` (riga 359-419) + `handleDownloadScormManifest` (riga ~1770)

**Implementazione attuale**:
- `LocalZipPacker`: micro-zip generator nativo client-side (senza dipendenze esterne)
- Supporta solo formato Store (nessuna compressione)
- Genera manifest XML SCORM 1.2 + HTML wrapper + file di contenuto
- API SCORM runtime wrapper inline (initSCORM, finishSCORM)
- Download tramite `URL.createObjectURL` + `<a>` click

**Proposta**: `<SCORMExportButton uda={uda} />` con progress indicator e validazione manifest.

---

## 3. Componenti Mancanti (Da Implementare)

| # | Componente | Scopo | Priorità | Complessità |
|---|-----------|-------|----------|-------------|
| 1 | **FocusTrap** | Trappola focus per modali (accessibilità WCAG) | 🔴 Alta | Media |
| 2 | **Skeleton Loading** | Placeholder animato durante caricamento dati | 🟡 Media | Bassa |
| 3 | **ResponsiveBottomNav** | Bottom nav con 7+ voci e gestione overflow | 🟡 Media | Bassa |
| 4 | **Breadcrumb** | Percorso di navigazione visivo | 🟡 Media | Bassa |
| 5 | **ConfirmationDialog** | Modale di conferma azioni pericolose | 🔴 Alta | Bassa |
| 6 | **Tab / TabGroup** | Container tab con gestione stato | 🟡 Media | Media |
| 7 | **DropdownMenu** | Menu a tendina riutilizzabile | 🟡 Media | Media |
| 8 | **Tooltip** | Info al hover su elementi compatti | 🟢 Bassa | Bassa |
| 9 | **Popover** | Contenuto posizionato relativo a un trigger | 🟢 Bassa | Media |
| 10 | **ToastContainer** | Gestione coda toast multipli | 🟡 Media | Bassa |
| 11 | **TextArea AutoResize** | Textarea che si espande con il contenuto | 🟢 Bassa | Bassa |
| 12 | **DateRangePicker** | Selezione periodo (per filtri UDA) | 🟢 Bassa | Media |
| 13 | **Stepper** | Progress indicator multi-step (per onboarding) | 🟡 Media | Bassa |
| 14 | **CommandPalette** | Ricerca rapida globale (Cmd+K) | 🟢 Bassa | Alta |
| 15 | **ContextMenu** | Menu contestuale destro | 🟢 Bassa | Media |

---

## 4. Raccomandazioni di Priorità

### Fase 1 — Quick Wins (1-2 giorni)
1. **ConfirmationDialog**: sostituire i `confirm()` nativi con modale styled
2. **Skeleton Loading**: aggiungere placeholder per tab con dati pesanti
3. **CopyButton**: isolare il pattern copy-to-clipboard come componente
4. **Badge**: estrarre il pattern badge come componente riutilizzabile

### Fase 2 — Accessibilità (3-5 giorni)
5. **FocusTrap**: implementare per tutti i modali (WCAG 2.1 AA)
6. **Tab / TabGroup**: estrarre la logica di tab switching come componente
7. **DropdownMenu**: estrarre il menu dropdown utente come componente generico
8. **Breadcrumb**: aggiungere indicatore di percorso nel contenuto principale

### Fase 3 — Architettura (1-2 settimane)
9. **ToastContainer**: sistema di coda con gestione priorità
10. **Sidebar estratta**: migrare dalla DOM manipulation a React state
11. **Modal estratta**: unificare i 9+ modali in un singolo componente parametrico
12. **ResponsiveBottomNav**: estendere a 7 voci con gestione overflow

### Fase 4 — Premium (futuro)
13. **CommandPalette**: ricerca globale Cmd+K con fuzzy matching
14. **Stepper**: per wizard multi-step (sostituire onboarding inline)
15. **CommandPalette**: ricerca globale Cmd+K

---

## 5. Metriche Codebase

| Metrica | Valore |
|---------|--------|
| Righe totali `App.tsx` | ~12.500 |
| Componenti React estratti | 0 |
| Modali implementati | 9+ |
| Toast attivi contemporaneamente | 1 (max) |
| Tab gestiti | 11 |
| Sub-tab gestiti | 6 |
| Stati `useState` nel componente principale | ~120+ |
| Icone importate | 38 |
| Funzioni handler definite | ~80+ |
| Effetti `useEffect` | ~25+ |

**Osservazione critica**: `App.tsx` è un singolo componente monolitico di ~12.500 righe.
L'estrazione dei componenti concettuali documentati sopra è essenziale per la manutenibilità
a lungo termine del progetto.
