# CML-601 Prototipi Tablet

> **Design System**: CML-600 • **Palette**: indigo/slate/emerald  
> **Font**: Inter, min 14px body • **Touch target**: min 48×48px  
> **Border radius**: rounded-xl/2xl • **Shadow**: sm/md/xl

---

## Portrait (768×1024)

---

### 1. Home Dashboard — Portrait

```
┌────────────────────────────────────────────────────┐
│  /* Header: bg-slate-900 h-16 */                   │
│                                                    │
│  ☰  ◆ CurManLight           🔔 2   🤖   ○ Maria  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  /* Warning banner: amber */                  ║  │
│  ║  ⚠ Revisione in scadenza il 31 gennaio.     ║  │
│  ║    6 proposte da approvare.        [Chiudi]  ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
│  /* Stats: stacked vertically */                   │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Progresso Revisione                         │  │
│  │  ████████████████████░░░░░░░  65%            │  │
│  │  ▲ +12% vs mese scorso                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  UDA Create                     8             │  │
│  │  ▲ 2 nuove questa settimana                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Proposte                       46            │  │
│  │  12 in corso · 20 approvate                   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  /* Quick Actions: full-width grid */              │
│                                                    │
│  Azioni Rapide                                     │
│  ┌────────────────────────┐ ┌────────────────────┐ │
│  │  ✏️                     │ │  📖                 │ │
│  │  Nuova UDA              │ │  Consulta Curricolo │ │
│  │  /* 48×48 min target */ │ │                     │ │
│  └────────────────────────┘ └────────────────────┘ │
│  ┌────────────────────────┐ ┌────────────────────┐ │
│  │  📊                     │ │  🔄                 │ │
│  │  Esporta Registro       │ │  Revisione Curricolo│ │
│  └────────────────────────┘ └────────────────────┘ │
│                                                    │
│  /* Activity Feed */                               │
│                                                    │
│  Attività Recenti                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  ● Mario ha completato                       │  │
│  │    "Racconto fantastico"         2 min fa    │  │
│  │──────────────────────────────────────────────│  │
│  │  ● Giulia ha superato il livello            │  │
│  │    "Strutturato" in Matematica  15 min fa    │  │
│  │──────────────────────────────────────────────│  │
│  │  ● Nuova proposta di revisione:             │  │
│  │    Ob. 4.2 "Analisi testuale"   1 ora fa    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  /* UDA in corso */                                │
│                                                    │
│  UDA in Corso                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📝 Italiano — "Il viaggio di Esopo"        │  │
│  │     3ª Media · 18 alunni                     │  │
│  │  ████████████████░░░░  80%                   │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  📝 Matematica — "Frazioni e decimali"      │  │
│  │     2ª Media · 20 alunni                     │  │
│  │  ██████░░░░░░░░░░░░  30%                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Adattamenti Portrait:**
- Sidebar nascosta, hamburger menu (☰) per aprirla
- Stats card impilate verticalmente (una per riga)
- Quick actions griglia 2×2 full-width
- Font body min 14px, touch target min 48×48px
- Activity feed a colonna singola

---

### 2. Consulta Curricolo — Portrait

```
┌────────────────────────────────────────────────────┐
│  /* Header: bg-slate-900 h-16 */                   │
│                                                    │
│  ☰  ◆ CurManLight           🔔 2   🤖   ○ Maria  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│                                                    │
│  /* Toolbar */                                     │
│  Disciplina: [Italiano ▾]                          │
│  Ordine:     [Secondaria ▾]                        │
│  🔄 Aggiorna                                       │
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  ▼ TRAGUARDI DI APPRENDIMENTO  (3)  [+ Agg] ║  │
│  ╠══════════════════════════════════════════════╣  │
│  ║                                              ║  │
│  ║  ▼ T1 — Comprendere e interpretare          ║  │
│  ║    testi letterari e non letterari           ║  │
│  ║    • Legge e comprende testi di diverso      ║  │
│  ║      genere e formato                        ║  │
│  ║    • Analizza struttura, contenuto e         ║  │
│  ║      intenzione comunicativa                 ║  │
│  ║    • 4 obiettivi collegati    [Mod] [×]      ║  │
│  ║                                              ║  │
│  ║  ▶ T2 — Produrre testi in diversi registri  ║  │
│  ║                                              ║  │
│  ║  ▶ T3 — Utilizzare strategie di lettura     ║  │
│  ║                                              ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  ▼ OBIETTIVI SPECIFICI  (4)         [+ Agg]  ║  │
│  ╠══════════════════════════════════════════════╣  │
│  ║                                              ║  │
│  ║  ▼ OSA.1 — Identificare il nucleo           ║  │
│  ║    tematico e le informazioni principali     ║  │
│  ║    Livello: Strutturato                      ║  │
│  ║    Collegato a: T1                           ║  │
│  ║    UDA collegati: 2         [Mod] [×]        ║  │
│  ║                                              ║  │
│  ║  ▼ OSA.2 — Interpretare il significato      ║  │
│  ║    letterale e figurato                      ║  │
│  ║    Livello: Strutturato                      ║  │
│  ║    UDA collegati: 1         [Mod] [×]        ║  │
│  ║                                              ║  │
│  ║  ▼ OSA.3 — Riconoscere strutture testuali   ║  │
│  ║    Livello: Avanzato                         ║  │
│  ║    UDA collegati: 3         [Mod] [×]        ║  │
│  ║                                              ║  │
│  ║  ▶ OSA.4 — Confrontare testi di epoche      ║  │
│  ║                                              ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  ▶ CONTENUTI  (12)                [+ Agg]   ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Adattamenti Portrait:**
- Sidebar nascosta, accessibile via ☰
- Accordion full-width senza compressione laterale
- Bottoni [Modifica] e [×] ingranditi per touch (min 48×48px)
- Scroll verticale fluido per contenuti lunghi
- Font body 14px, heading 18-20px

---

### 3. Revisione — Portrait

```
┌────────────────────────────────────────────────────┐
│  /* Header */                                      │
│  ☰  ◆ CurManLight           🔔 2   🤖   ○ Maria  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│                                                    │
│  /* Stats: impilate */                             │
│                                                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │  46 Totali │ │ 12 In Corso│ │ 20 Approv. │     │
│  └────────────┘ └────────────┘ └────────────┘     │
│  ┌────────────┐ ┌────────────┐                     │
│  │  8 Rifiut. │ │ 5 Pers.    │                     │
│  └────────────┘ └────────────┘                     │
│                                                    │
│  /* Tabs: scroll orizzontale */                    │
│                                                    │
│  [ Tutte (46) ][ In corso (12) ][ Approvate (20) ] │
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  Proposta #12                                ║  │
│  ║  OSA.2 Interpretare significato letterale    ║  │
│  ║  Stato: 🟡 In corso   Priorità: Alta         ║  │
│  ║  Data: 15/01/2026                            ║  │
│  ╠══════════════════════════════════════════════╣  │
│  ║                                              ║  │
│  ║  Testo originale (NTL):                      ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │ /* bg-rose-50 */                     │    ║  │
│  ║  │ L'alunno interpreta il significato   │    ║  │
│  ║  │ letterale e figurato di espressioni  │    ║  │
│  ║  │ lessicali semplici nei testi letti   │    ║  │
│  ║  │ a scuola, collegandole al contesto.  │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Testo proposto (NTL):                       ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │ /* bg-emerald-50 */                  │    ║  │
│  ║  │ L'alunno interpreta il significato   │    ║  │
│  ║  │ letterale e figurato di espressioni  │    ║  │
│  ║  │ lessicali nei testi di diverso       │    ║  │
│  ║  │ genere e formato, collegandole al    │    ║  │
│  ║  │ contesto storico-culturale e alle    │    ║  │
│  ║  │ intenzioni dell'autore.              │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Differenze:                                 ║  │
│  ║  • Aggiunto "di diverso genere e formato"    ║  │
│  ║  • Aggiunto "storico-culturale"              ║  │
│  ║  • Aggiunto "intenzioni dell'autore"         ║  │
│  ║                                              ║  │
│  ║  Motivazione:                                ║  │
│  ║  "Il testo originale limita la competenza    ║  │
│  ║   ai soli testi scolastici..."               ║  │
│  ║                                              ║  │
│  ╠══════════════════════════════════════════════╣  │
│  ║                                              ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │        ✅ Approva                     │    ║  │
│  ║  │ /* primary-600, h-14, full-width */  │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │        ✏️ Modifica                     │    ║  │
│  ║  │ /* slate-200, h-14, full-width */    │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │        ❌ Rifiuta                     │    ║  │
│  ║  │ /* slate-200, h-14, full-width */    │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Adattamenti Portrait:**
- Stats card 3×2 grid (2 per riga)
- Tabs scroll orizzontal se necessario
- Card proposta full-width
- Bottoni azione impilati verticalmente, h-14 (56px) per touch
- Testo old/new a colonna singola con confronto sequenziale

---

### 4. UDA Wizard — Portrait

```
┌────────────────────────────────────────────────────┐
│  /* Header */                                      │
│  ☰  ◆ CurManLight           🔔 2   🤖   ○ Maria  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│                                                    │
│  /* Step indicator: horizontal, compressed */      │
│                                                    │
│  ① Anagrafica ── ② Traguardi ── ③ Compiti        │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Corrente                                           │
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  Step 1 — Anagrafica dell'UDA               ║  │
│  ╠══════════════════════════════════════════════╣  │
│  ║                                              ║  │
│  ║  Titolo UDA:                                 ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │ Il viaggio di Esopo — favole e morale│    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Descrizione breve:                          ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │ Percorso interdisciplinare che       │    ║  │
│  ║  │ unisce lettura analitica di favole   │    ║  │
│  ║  │ esopiane con produzione scritta e    │    ║  │
│  ║  │ approfondimento storico-culturale.   │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Disciplina:                                 ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │  Italiano                          ▾ │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Ordine scolastico:                          ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │  Secondaria                       ▾  │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Classi:                                     ║  │
│  ║  ☑ 3ª Media          ☑ 1ª Media             ║  │
│  ║  ☐ 2ª Media          ☐ 1ª Superiore         ║  │
│  ║  /* checkbox 48×48 touch target */            ║  │
│  ║                                              ║  │
│  ║  Ore previste:                               ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │  18                                  │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Durata (lezioni):                           ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │  12                                  │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ║  Obiettivi collegati:                        ║  │
│  ║  ☑ OSA.1 — Identificare nucleo tematico     ║  │
│  ║  ☑ OSA.2 — Interpretare significato         ║  │
│  ║  ☐ OSA.3 — Riconoscere strutture testuali   ║  │
│  ║  ☐ OSA.4 — Confrontare testi epoche diverse ║  │
│  ║                                              ║  │
│  ╠══════════════════════════════════════════════╣  │
│  ║                                              ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │         Avanti ▶                     │    ║  │
│  ║  │ /* primary-600, h-14, full-width */  │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║  ┌──────────────────────────────────────┐    ║  │
│  ║  │         Salva bozza                  │    ║  │
│  ║  │ /* slate-200, h-14, full-width */    │    ║  │
│  ║  └──────────────────────────────────────┘    ║  │
│  ║                                              ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Adattamenti Portrait:**
- Step indicator compatto con testo abbreviato
- Tutti i campi form full-width, impilati verticalmente
- Checkbox 48×48px per touch
- Dropdown full-width
- Bottoni full-width, h-14 (56px)
- No layout a colonne per il form

---

## Landscape (1024×768)

---

### 1. Home Dashboard — Landscape

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  /* Header: bg-slate-900 h-16 */                                                             │
│  ☰  ◆ CurManLight              🔔 2   🤖   ○ Maria                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                              │
│  /* 2-column layout */                                                                       │
│                                                                                              │
│  ╔════════════════════════════════════════╗ ╔══════════════════════════════════════════════╗ │
│  ║  /* Colonna sinistra */                ║ ║  /* Colonna destra */                        ║ │
│  ║                                       ║ ║                                              ║ │
│  ║  ⚠ Revisione in scadenza 31/01       ║ ║  Attività Recenti                            ║ │
│  ║                                       ║ ║                                              ║ │
│  ║  ┌──────────────┐ ┌──────────────┐   ║ ║  ┌──────────────────────────────────────────┐ ║ │
│  ║  │ Progresso    │ │ UDA Create   │   ║ ║  │  ● Mario ha completato                   │ ║ │
│  ║  │ Rev. 65%     │ │ 8            │   ║ ║  │    "Racconto fantastico"     2 min fa    │ ║ │
│  ║  └──────────────┘ └──────────────┘   ║ ║  │──────────────────────────────────────────│ ║ │
│  ║  ┌──────────────┐                    ║ ║  │  ● Giulia ha superato il livello        │ ║ │
│  ║  │ Proposte 46  │                    ║ ║  │    "Strutturato"         15 min fa       │ ║ │
│  ║  └──────────────┘                    ║ ║  │──────────────────────────────────────────│ ║ │
│  ║                                       ║ ║  │  ● Nuova proposta revisione:            │ ║ │
│  ║  Azioni Rapide                        ║ ║  │    Ob. 4.2              1 ora fa        │ ║ │
│  ║  ┌──────────┐ ┌──────────┐           ║ ║  │──────────────────────────────────────────│ ║ │
│  ║  │ ✏️ Nuova │ │ 📖 Curri │           ║ ║  │  ● Luca ha inserito 3 osservazioni      │ ║ │
│  ║  │ UDA      │ │ colo     │           ║ ║  │    nel registro             2 ore fa    │ ║ │
│  ║  └──────────┘ └──────────┘           ║ ║  └──────────────────────────────────────────┘ ║ │
│  ║  ┌──────────┐ ┌──────────┐           ║ ║                                              ║ │
│  ║  │ 📊 Esp.  │ │ 🔄 Rev.  │           ║ ║  UDA in Corso                                ║ │
│  ║  │ Registro │ │ Curricolo│           ║ ║                                              ║ │
│  ║  └──────────┘ └──────────┘           ║ ║  ┌──────────────────────────────────────────┐ ║ │
│  ║                                       ║ ║  │  📝 "Il viaggio di Esopo"    80% ████░░ │ ║ │
│  ╚════════════════════════════════════════╝ ║  │  📝 "Frazioni e decimali"     30% ██░░░░ │ ║ │
│                                              ║  └──────────────────────────────────────────┘ ║ │
│                                              ╚══════════════════════════════════════════════╝ │
│                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Adattamenti Landscape:**
- 2 colonne: sinistra (stats + azioni) / destra (feed + UDA)
- Sidebar nascosta, hamburger ☰ per accesso
- Stats card 2+1 in riga
- Quick actions 2×2
- Feed e UDA in colonna destra
- Font body 14px, heading 16-18px

---

### 2. Consulta Curricolo — Landscape

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  /* Header: bg-slate-900 h-16 */                                                             │
│  ☰  ◆ CurManLight              🔔 2   🤖   ○ Maria                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                              │
│  /* Compressed sidebar: w-56 (224px) */                                                      │
│                                                                                              │
│  ┌──────────┬───────────────────────────────────────────────────────────────────────────────┐ │
│  │          │                                                                               │ │
│  │ /* w-56  │  Disciplina [Italiano ▾]  Ordine [Secondaria ▾]  🔄 Aggiorna                  │ │
│  │  bg-     │                                                                               │ │
│  │  white   │  ╔═════════════════════════════════════════════════════════════════════════╗  │ │
│  │  border- │  ║  ▼ TRAGUARDI  (3)                                         [+ Aggiungi] ║  │ │
│  │  r       │  ╠═════════════════════════════════════════════════════════════════════════╣  │ │
│  │  slate-  │  ║                                                                         ║  │ │
│  │  100 */  │  ║  ▼ T1 — Comprendere e interpretare testi letterari e non letterari     ║  │ │
│  │          │  ║    • Legge e comprende testi di diverso genere e formato                ║  │ │
│  │ 📚 Home  │  ║    • Analizza struttura, contenuto e intenzione comunicativa            ║  │ │
│  │          │  ║    • 4 obiettivi collegati                              [Mod] [×]        ║  │ │
│  │ 🌳 Curri │  ║                                                                         ║  │ │
│  │ ◀ attivo │  ║  ▶ T2 — Produrre testi in diversi registri e con finalità              ║  │ │
│  │          │  ║                                                                         ║  │ │
│  │ 📐 Prog. │  ║  ▶ T3 — Utilizzare strategie di lettura adeguuate                      ║  │ │
│  │          │  ║                                                                         ║  │ │
│  │ 📋 Arch. │  ╚═════════════════════════════════════════════════════════════════════════╝  │ │
│  │          │                                                                               │ │
│  │ 🔬 Spazi │  ╔═════════════════════════════════════════════════════════════════════════╗  │ │
│  │          │  ║  ▼ OBIETTIVI  (4)                                          [+ Aggiungi] ║  │ │
│  │ 🔌 Espo. │  ╠═════════════════════════════════════════════════════════════════════════╣  │ │
│  │          │  ║                                                                         ║  │ │
│  │──────────│  ║  ▼ OSA.1 — Identificare nucleo tematico e informazioni principali      ║  │ │
│  │          │  ║    Livello: Strutturato · Collegato a: T1 · UDA: 2    [Mod] [×]        ║  │ │
│  │ Impost.  │  ║                                                                         ║  │ │
│  │          │  ║  ▼ OSA.2 — Interpretare significato letterale e figurato               ║  │ │
│  │ 👤 Prof. │  ║    Livello: Strutturato · UDA: 1                       [Mod] [×]        ║  │ │
│  │          │  ║                                                                         ║  │ │
│  │          │  ║  ▼ OSA.3 — Riconoscere strutture testuali e legami logici             ║  │ │
│  │          │  ║    Livello: Avanzato · UDA: 3                          [Mod] [×]        ║  │ │
│  │          │  ║                                                                         ║  │ │
│  │          │  ║  ▶ OSA.4 — Confrontare testi di epoche e autori diversi                ║  │ │
│  │          │  ║                                                                         ║  │ │
│  │          │  ╚═════════════════════════════════════════════════════════════════════════╝  │ │
│  │          │                                                                               │ │
│  │          │  ╔═════════════════════════════════════════════════════════════════════════╗  │ │
│  │          │  ║  ▶ CONTENUTI  (12)                                          [+ Aggiungi] ║  │ │
│  │          │  ╚═════════════════════════════════════════════════════════════════════════╝  │ │
│  │          │                                                                               │ │
│  └──────────┴───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Adattamenti Landscape:**
- Sidebar compressa a w-56 (224px) da w-64 (256px)
- Contenuto principale adatta alla larghezza ridotta
- Accordion e accordion items full-width
- Touch target min 48×48px per [Modifica] e [×]
- Font body 14px

---

## Note Tecniche — Tablet

### Touch Targets

| Elemento | Dimensione minima | Note |
|----------|-------------------|------|
| Bottoni azione | 48×48px | Approva, Modifica, Rifiuta |
| Checkbox | 48×48px | Inclusive di label |
| Dropdown | 48×44px | Full-width su portrait |
| Tab filter | 44px height | Scroll orizzontale se >3 |
| Hamburger ☰ | 48×48px | Header left |
| Accordion toggle | 48×48px | Include icona + testo |
| Chat button 🤖 | 48×48px | Header right |

### Font Size Adjustments

| Elemento | Desktop | Tablet | Note |
|----------|---------|--------|------|
| Body text | 14px | 14px | Minimo per leggibilità touch |
| H1 | 20px | 20px | Invariato |
| H2 | 18px | 18px | Invariato |
| H3 | 16px | 16px | Invariato |
| Caption | 12px | 14px | Aumentato per touch |
| Small | 11px | 12px | Aumentato per touch |

### Breakpoints

| Viewport | Modalità | Sidebar | Layout |
|----------|----------|---------|--------|
| 1024×768 | Landscape | w-56 compressa | 2 colonne |
| 768×1024 | Portrait | Nascosta (☰) | Singola colonna |
| <768 | Mobile | Nascosta (☰) | Singola colonna |

### Gesture Support

| Gesture | Azione |
|---------|--------|
| Swipe left/right | Navigazione tra tab filter |
| Pinch to zoom | Mappa Diacronica |
| Pull to refresh | Aggiorna dati |
| Long press | Contest menu (⋯) |
| Tap accordion | Espandi/collassa |
