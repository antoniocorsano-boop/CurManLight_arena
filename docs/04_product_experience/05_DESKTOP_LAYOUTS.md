# Layout Desktop — CurManLight Product Experience 2.0

> Milestone: CML-600 | Aggiornato: luglio 2026

---

## 1. Griglia Desktop

Il layout desktop segue una struttura fissa a tre colonne:

```
┌─────────────────────────────────────────────────────────────┐
│                     HEADER (h-16, sticky)                    │
│  [≡] [Logo] CurManLight         [Copilot] [Avatar ▼]       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │               CONTENUTO PRINCIPALE                │
│ w-64     │               flex-1, overflow-hidden             │
│ (256px)  │                                                   │
│          │  px-8 py-6                                       │
│ Nav      │                                                   │
│ Items    │  [Banner warning] (se attivo)                    │
│          │  [Sotto-header]                                  │
│          │                                                   │
│          │  ┌──────────────────────────────────────────┐    │
│          │  │  Contenuto della schermata attiva        │    │
│          │  │                                          │    │
│          │  │                                          │    │
│          │  │                                          │    │
│          │  └──────────────────────────────────────────┘    │
│          │                                                   │
├──────────┴──────────────────────────────────────────────────┤
│                                                              │
│            [Copilot Chat Overlay] (se aperto)               │
│            fixed bottom-24 right-6, z-[150]                  │
│            w-96 h-[450px]                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Specifiche Grid

| Zona | Classe Tailwind | Dimensoni | Comportamento |
|------|-----------------|-----------|---------------|
| Header | `sticky top-0 z-50 h-16 bg-slate-900` | Full width, 64px altezza | Fisso in alto, ombra su scroll |
| Sidebar | `w-64 shrink-0` | 256px fisso, full height | Collassabile con toggle |
| Main | `flex-1 min-w-0 overflow-hidden` | Resto dello spazio | Scroll interno |
| Copilot | `fixed bottom-24 right-6 z-[150]` | 384×450px | Overlay flottante |
| Toast | `fixed bottom-6 right-6 z-[200]` | max-w-sm | Auto-dismiss |

### Breakpoint Desktop

- **lg** (1024px+): Layout desktop completo
- Contenuto: `px-8` padding orizzontale
- Sidebar visibile di default, collassabile

---

## 2. Schermate Desktop

### 2.1 Home Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │  Dashboard                                        │
│         │                                                   │
│ [Home]  │  ┌─ Banner Onboarding (se primo accesso) ──────┐ │
│         │  └─────────────────────────────────────────────┘ │
│ [Curri] │                                                   │
│  Albero │  ┌─ Card Benvenuto + Statistiche ──────────────┐ │
│  Mappa  │  │  Progresso revisione: 45%                   │ │
│  Popol. │  │  UDA create: 12 | Approvate: 8             │ │
│  Rev.   │  └─────────────────────────────────────────────┘ │
│  Fonti  │                                                   │
│         │  ┌─ Quick Actions ──────── ┌─ Attività Recenti ┐ │
│ [Proget]│  │  [Nuova UDA]           │  Ultima modifica.. │ │
│  Wizard │  │  [Consulta Curricolo]  │  UDA approvata...  │ │
│  Archivio│ │  [Esporta PDF]         │                    │ │
│  Matrice│  └────────────────────────┘ └──────────────────┘ │
│  Processo│                                                  │
│  Export │  ┌─ Architettura Sistema (opzionale) ──────────┐ │
│         │  │  Grafico interattivo delle relazioni        │ │
│ [Classe]│  └─────────────────────────────────────────────┘ │
│  Amb.   │                                                   │
│  Social │                                                   │
│         │                                                   │
│ [Suppor]│                                                   │
│  PA     │                                                   │
│  Wiki   │                                                   │
│  Guida  │                                                   │
└────────┴───────────────────────────────────────────────────┘
```

**Componenti**: WarningBanner (condizionale), Card statistiche, QuickActionGrid, ActivityFeed

### 2.2 Consulta Curricolo — Vista Albero

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │  Consulta Curricolo                    [Vista ▼] │
│         │                                                   │
│ >Albero │  ┌─ Filtri ────────────────────────────────────┐ │
│  Mappa  │  │ Disciplina: [Italiano ▼]  Ordine: [Sec. ▼] │ │
│  Popol. │  └─────────────────────────────────────────────┘ │
│         │                                                   │
│         │  ┌─ Struttura ad Albero ───────────────────────┐ │
│         │  │                                              │ │
│         │  │  📂 Italiano — Secondaria                   │ │
│         │  │  ├── Traguardi di Competenza                │ │
│         │  │  │   ├── 1. Comprensione del testo...       │ │
│         │  │  │   └── 2. Produzione scritta...           │ │
│         │  │  ├── Obiettivi di Apprendimento             │ │
│         │  │  │   ├── 1. Analisi del periodo...          │ │
│         │  │  │   └── 2. Riassunto...                    │ │
│         │  │  └── Proposte Riforma 2025                  │ │
│         │  │      ├── [APPROVATO] newText...             │ │
│         │  │      └── [IN CORSO] newText...              │ │
│         │  │                                              │ │
│         │  └─────────────────────────────────────────────┘ │
└────────┴───────────────────────────────────────────────────┘
```

**Componenti**: DisciplineSelector, SchoolOrderSelector, TreeView, AccordionItem

### 2.3 Revisione (Gap 2025)

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │  Revisione Riforma 2025                           │
│         │                                                   │
│         │  ┌─ Statistiche ───────────────────────────────┐ │
│         │  │ Totali: 45 | In corso: 12 | Approvati: 20  │ │
│         │  │ Rifiutati: 8 | Personalizzati: 5            │ │
│         │  └─────────────────────────────────────────────┘ │
│         │                                                   │
│         │  Filtri: [Tutti] [In corso] [Approvati] [Rif.]  │
│         │                                                   │
│         │  ┌─ Proposta Card ─────────────────────────────┐ │
│         │  │ Disciplina: Italiano | Livello: Secondaria  │ │
│         │  │ Traguardo: Comprensione del testo...        │ │
│         │  │ ─────────────────────────────────────────── │ │
│         │  │ Vecchio: "Analisi grammaticale..."          │ │
│         │  │ Nuovo:  "Comprensione critica..."           │ │
│         │  │ ─────────────────────────────────────────── │ │
│         │  │ [✓ Approva] [✏ Personalizza] [✗ Rifiuta]   │ │
│         │  └─────────────────────────────────────────────┘ │
│         │                                                   │
│         │  ┌─ Proposta Card ─────────────────────────────┐ │
│         │  │ ...                                         │ │
│         │  └─────────────────────────────────────────────┘ │
└────────┴───────────────────────────────────────────────────┘
```

**Componenti**: StatsBar, FilterTabs, ProposalCard, DecisionButtons

### 2.4 Progettazione UDA — Compilatore Wizard

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │  Compilatore UDA — Wizard Annuale                 │
│         │                                                   │
│         │  ┌─ Step Indicator ────────────────────────────┐ │
│         │  │ ① Informazioni → ② Traguardi → ③ Compiti   │ │
│         │  └─────────────────────────────────────────────┘ │
│         │                                                   │
│         │  ┌─ Form Card ─────────────────────────────────┐ │
│         │  │ Titolo UDA: [________________________]      │ │
│         │  │ Disciplina: [Italiano ▼]                     │ │
│         │  │ Periodo:   [Primo Quadrimestre ▼]           │ │
│         │  │ Ore:       [15]                             │ │
│         │  │                                              │ │
│         │  │ Traguardi selezionati:                      │ │
│         │  │ [✓] 1. Comprensione del testo...            │ │
│         │  │ [ ] 2. Produzione scritta...                │ │
│         │  │ [✓] 3. Analisi e interpretazione...         │ │
│         │  │                                              │ │
│         │  │ Compito di Realtà:                          │ │
│         │  │ [___________________________________]       │ │
│         │  │ [___________________________________]       │ │
│         │  │                                              │ │
│         │  │ Note:                                       │ │
│         │  │ [___________________________________]       │ │
│         │  └─────────────────────────────────────────────┘ │
│         │                                                   │
│         │  [💾 Salva UDA]  [📋 Copia negli appunti]        │
└────────┴───────────────────────────────────────────────────┘
```

**Componenti**: StepIndicator, FormCard, CheckboxGroup, TextArea

---

## 3. Pattern di Layout Comuni

### 3.1 Warning Banner (Trans-Tab)

Posizionato sotto l'header, sopra il contenuto. Visibile su tutte le schermate.

```
Posizione: px-6 pt-4 (dentro il main container)
Stili: bg-rose-50 border-2 border-rose-200 (errore)
        bg-amber-50 border-2 border-amber-200 (warning)
Comportamento:.Condizionale (isDatabaseVolatile, isFileProtocol, tokenExpiry)
```

### 3.2 Copilot Chat Overlay

```
Posizione: fixed bottom-24 right-6
Dimensioni: w-96 h-[450px]
z-index: z-[150]
Pattern: Header + Messages + Input
Toggle: bottone nel topbar
```

### 3.3 Modal Dialog

```
Posizione: fixed inset-0 z-[200]
Overlay: bg-slate-950/50 backdrop-blur-sm
Contenuto: max-w-2xl mx-auto mt-20, bg-white rounded-2xl shadow-2xl
Pattern: Header + Body + Footer buttons
Chiusura: click fuori, Escape key
```

### 3.4 Toast Notification

```
Posizione: fixed bottom-6 right-6
z-index: z-[200]
Dimensioni: max-w-sm
Stile: bg-slate-950 text-white rounded-2xl shadow-2xl
Icona: Check (success) o errore
Auto-dismiss: si, con timeout
```

---

## 4. Z-Index Layering

| Layer | z-index | Uso |
|-------|---------|-----|
| Header sticky | z-50 | Sempre visibile |
| Sidebar overlay | z-[100] | Quando aperto su mobile |
| Copilot overlay | z-[150] | Chat flottante |
| Modal overlay | z-[200] | Dialoghi modali |
| Toast | z-[200] | Notifiche |
| Tooltip | z-[250] | Suggerimenti |

---

## 5. Responsive Desktop

Il desktop è il target primario. Le ottimizzazioni includono:

- **Scroll**: `overflow-hidden` sul container principale, scroll interno nel main area
- **Sidebar collapse**: stato `sidebarCollapsed`, la sidebar si nasconde e il contenuto prende tutto lo spazio
- **Content overflow**: `min-w-0` previene flex overflow
- **Print**: `@media print` nasconde header, sidebar, bottoni; mostra solo il contenuto
