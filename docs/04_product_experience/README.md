# CurManLight — Product Experience 2.0

## Documentazione Esecutiva per l'Evoluzione dell'Interfaccia

**Milestone:** CML-600
**Scuola:** I.C. Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV) — Cod. Mecc. AVIC849003

---

## Scopo di quest'area

Questa cartella raccoglie la documentazione tecnico-produttiva dell'ambiente utente CurManLight. Ogni documento descrive un aspetto dell'architettura informativa, dell'esperienza d'uso o della strategia visiva del prodotto. L'obiettivo è garantire coerenza nelle scelte di design durante lo sviluppo, e offrire a chiunque entri nel progetto una mappa chiara di ciò che esiste, perché esiste, e come è strutturato.

CurManLight è un'applicazione monolitica React 18 + TypeScript (Vite 5) che funge da piattaforma offline-first di gestione curricolare per le scuole italiane. Il bundle finale è un singolo file HTML autoportante, costruito per funzionare senza server, da una chiavetta USB o in rete locale, sui Chromebook assegnati alle scuole.

---

## Indice dei Documenti

| # | File | Descrizione |
|---|------|-------------|
| 00 | [VISION.md](./00_VISION.md) | Missione, valori, principi UX e vincoli del prodotto |
| 01 | [INFORMATION_ARCHITECTURE.md](./01_INFORMATION_ARCHITECTURE.md) | Gerarchia completa di tab, sub-tab, schermate e sezioni |
| 02 | `02_INTERACTION_PATTERNS.md` | Pattern di interazione ricorrenti: accordion, wizard, filtri, toast, modali |
| 03 | `03_VISUAL_LANGUAGE.md` | Sistema di design: palette, tipografia, spaziature, icone Lucide, responsive |
| 04 | `04_ROLE_EXPERIENCE.md` | Esperienza differenziata per i 6 ruoli utente (insegnante → amministratore) |
| 05 | `05_DASHBOARD_DEEP_DIVE.md` | Analisi dettagliata del cruscotto e dei widget dinamici per ruolo |
| 06 | `06_CURRICOLUM_MODULE.md` | Ambiente Consulta: albero verticale, mappa diacronica, popolamento PTOF |
| 07 | `07_PLANNING_MODULE.md` | Compilatore UDA a 5 passi, archivio, matrice competenze, esportazione |
| 08 | `08_CLASSROOM_MODULE.md` | Registro cifrato, gruppi cooperativi, feedback, Osservatorio dei Riusi |
| 09 | `09_KNOWLEDGE_BASE.md` | Second Brain d'Istituto: WikiLLM, 19 volumi, glossario, mappa connessioni |
| 10 | `10_EXPORT_ENGINE.md` | Word, ODF, PDF, SCORM 1.2, .cml, Markdown, backup JSON e template IA |
| 11 | `11_COMPLIANCE_CERTIFICATION.md` | Cruscotto PA: AgID, WCAG 2.1, GDPR, ACN, dichiarazione accessibilità |
| 12 | `12_DATA_ARCHITECTURE.md` | Zustand + Dexie (IndexedDB), localStorage, Service Worker, sync Google |

---

## Come leggere questi documenti

**Percorso consigliato per chi entra nel progetto per la prima volta:**

1. **00_VISION** — Parti dalla visione. Capisci *perché* esiste CurManLight e *per chi* è stato fatto.
2. **01_INFORMATION_ARCHITECTURE** — Poi comprendi *cosa* c'è: l'intera mappa dell'applicazione.
3. **02_INTERACTION_PATTERNS** — Infine vedi *come* funzionano le interazioni ricorrenti.

**Percorso per chi lavora su un singolo modulo:**

- Leggi il documento del modulo specifico (06–10) e il documento 04 per il contesto ruolo.
- Consulta 12 per capire dove finiscono i dati.

**Percorso per chi fa audit o compliance:**

- Parti da 11 (Certificazione PA) e integra con 12 (Architettura Dati) per la verifica GDPR.

---

## Tecnologie principali

| Componente | Tecnologia |
|------------|-----------|
| UI Framework | React 18 + TypeScript |
| Bundler | Vite 5 (singolo HTML) |
| State Management | Zustand (persistito su IndexedDB tramite Dexie.js) |
| Database locale | Dexie.js → IndexedDB (`CurManLightDB_Evoluto_v1.3`) |
| Fallback storage | localStorage + memoria RAM (sandbox compatibile) |
| Stili | Tailwind CSS |
| Icone | Lucide React |
| Offline | Service Worker (sw.js) + manifest.json (PWA) |
| Knowledge Base | WikiLLM (motore risposta semanticamente raccordato ai volumi .md) |
| Cloud sync | Google Workspace OAuth2 (opzionale, client ID d'Istituto) |
| Export | HTML→Word (.doc/.docx), ODF (.odt), PDF, SCORM 1.2 (.zip), .cml, .md |

---

**Stato:** Documento Vivo — Aggiornato a luglio 2026
**Branch:** `feature/cml-600-product-experience`
