# 12 — Roadmap di Implementazione

**CurManLight — Product Experience**
**Ultimo aggiornamento:** 2026-07-19

---

Roadmap di refactoring e sviluppo organizzata in 10 sprint da 1–2 settimane ciascuno. L'obiettivo è trasformare il monolite `App.tsx` (12.500+ righe) in un'applicazione modulare, performante e conforme agli standard WCAG.

---

## Sprint 1: Foundation & Layout

**Durata:** 2 settimane
**Goal:** Estrarre i componenti base da `App.tsx` e stabilire l'architettura modulare.

### Deliverables

| Componente | Descrizione | File sorgente |
|-----------|-------------|---------------|
| Toast | Sistema di notifiche con `role="status"` e `aria-live` | `src/components/ui/Toast.tsx` |
| Modal | Wrapper modale con focus trap e `role="dialog"` | `src/components/ui/Modal.tsx` |
| Sidebar | Navigazione laterale con supporto mobile drawer | `src/components/layout/Sidebar.tsx` |
| Header | Intestazione con ruolo, disciplina, anno scolastico | `src/components/layout/Header.tsx` |
| React Router | Sostituzione dei `useState` per tab con route | `src/router.tsx` |
| Design tokens | Costanti colore, tipografia, spaziatura in Tailwind | `tailwind.config.js` esteso |
| Responsive layout | Breakpoint mobile (bottom nav), tablet (sidebar overlay), desktop (sidebar fissa) | `src/components/layout/AppLayout.tsx` |

### Dipendenze

- Nessuna (primo sprint)

### Sforzo stimato

- **160 ore** (2 developer full-time × 2 settimane)
- Il blocco maggiore è l'estrazione dei componenti da `App.tsx` senza rompere le dipendenze di stato

---

## Sprint 2: Home Dashboard

**Durata:** 1 settimana
**Goal:** Dashboard funzionale con dati reali e onboarding ristrutturato.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Dashboard | Card statistiche con dati reali da Zustand | Statistiche: proposte totali, approvate, rifiute, pending |
| Stats cards | `totalDecisions`, `approvedCount`, `rejectedCount`, `pendingCount` | Estratti da `localCurriculum` |
| Quick actions grid | Azioni rapide: Crea UDA, Consulta Curricolo, Esporta | Accessibili in 2 click dalla dashboard |
| Onboarding modal | Refactoring del wizard 4 passi in componenti separati | Stati: `onboardingRole`, `onboardingOrd`, `onboardingDisc`, `onboardingCombinations` |

### Dipendenze

- Sprint 1 (Modal, Sidebar, Router)

### Sforzo stimato

- **80 ore** (2 developer × 1 settimana)

---

## Sprint 3: Curricolo

**Durata:** 2 settimane
**Goal:** Vista curricolo completa con le 3 sotto-viste (albero, mappa, popolamento).

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Tree view | Accordion con 14 discipline × 3 ordini scolastici | Traguardi + Obiettivi con rendering da `renderTraguardiListForAccordion` |
| Discipline selector | Filtro disciplina + ordine (infanzia/primaria/secondaria) | `discipline`, `order` dal store |
| Diacronic map | Grafo SVG interattivo con nodi draggabili | Nodi: `initialDidacticNodes`, archi: `initialDidacticEdges` |
| Popolamento tab | Import CSV + generazione IA | `handleCSVUpload`, `handleAiGenerateCurriculum` |
| Ricerca semantica | Filtro traguardi con evidenziazione preferiti | `traguardiSearchQuery`, `getSemanticTraguardiResults` |
| Competency explorer | Mappa 8 competenze chiave europee per disciplina | `EuropeanKeyCompetencies`, `getDisciplineKeyCompetencies` |

### Dipendenze

- Sprint 1 (Router, Layout)
- `curriculumKB.ts` (database disciplinare)
- `localCurriculum` state

### Sforzo stimato

- **160 ore** (2 developer × 2 settimane)
- La mappa SVG interattiva è il componente più complesso

---

## Sprint 4: Revisione

**Durata:** 1 settimana
**Goal:** Sistema di revisione proposte con voting e statistiche.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Proposal card | Card per ogni proposta di raccordo | Mostra testo 2012 vs 2025 + stato decisione |
| Decision buttons | Approva / Rifiuta / Personalizza con conferma | `setDecision(id, status)` |
| Filter tabs | Filtro per stato: all / pending / approved / rejected | `activeRevisionFilter` |
| Stats bar | Barra progresso: `progressPercent` calcolato su `totalDecisions` | Aggiornamento in tempo reale |
| Personalizza editor | Campo testo per modifica custom della proposta | `customTexts[id]` |

### Dipendenze

- Sprint 1 (Router, Modal)
- Zustand store (`decisions`, `customTexts`)

### Sforzo stimato

- **80 ore** (2 developer × 1 settimana)

---

## Sprint 5: Progettazione UDA

**Durata:** 2 settimane
**Goal:** Wizard UDA a 5 passi, archivio UDA, matrice competenze, social feed.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| UDA Wizard | 5 step: Anagrafica, Traguardi, Obiettivi, Evidenze, Conferma | `wizardStep` (1–5), validazione titolo |
| Step indicator | Indicatore visivo dello step corrente | Feedback posizione nel percorso |
| UDA archive | Lista UDA salvate con filtri (classe, periodo, stato) | `libFilterClass`, `libFilterPeriod`, `libFilterStatus` |
| UDA detail | Vista dettaglio di un'UDA con tutte le sezioni | `selectedUda` state |
| Competency matrix | Matrice incrociata disciplina × competenze europee | Dati da `EuropeanKeyCompetencies` |
| Social UDA feed | Bacheca UDA condivise con like e annotazioni | `socialUdas`, `handleLikeUda`, `handleAddAnnotation` |
| Clone UDA | Clonazione adattiva con ri-allineamento traguardi | `handleCloneUdaAdaptive` con filtro GDPR |
| AI suggestions | Suggerimenti IA per titolo, compito, inclusion measures | `handleTriggerGemSuggestion` |

### Dipendenze

- Sprint 1 (Modal, Toast)
- Sprint 3 (Curricolo — per traguardi e obiettivi)
- Zustand store (`savedUda`, `selectedTraguardi`, `selectedObiettivi`, `selectedEvidenze`)

### Sforzo stimato

- **160 ore** (2 developer × 2 settimane)
- Lo wizard a 5 step + validazione + AI suggestions richiede attenzione

---

## Sprint 6: Classe

**Durata:** 1 settimana
**Goal:** Registro alunni, feedback, gruppi cooperativi, planner settimanale.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Student register | Lista alunni con pseudonimi a tema (Scientists/Classico/Miti) | `classroomStudentFeedback`, `getThemedStudentName` |
| Feedback form | Form per livello, stelle, osservazioni | `selectedStudentForFeedback` |
| Cooperative groups | Generatore gruppi con metodo Jigsaw / Peer Tutoring / Laboratorio | `handleGenerateCooperativeGroups`, 100 tentativi con vincoli |
| Exclusions list | Lista esclusioni relazionali tra alunni | `exclusionsList`, `exclusionInputS1`, `exclusionInputS2` |
| Shuffle pseudonyms | Rimescolamento dinamico degli pseudonimi sulla LIM | `handleShufflePseudonyms` |
| Weekly planner | Ore settimanali per disciplina | `weeklyHoursItaliano`, `weeklyHoursStoria`, ecc. |
| Topic analyzer | Analisi argomento + proposta UDA estemporanea | `handleAnalyzeClassroomTopic` |

### Dipendenze

- Sprint 1 (Modal, Layout)
- Sprint 5 (archivio UDA per raccordo)

### Sforzo stimato

- **80 ore** (2 developer × 1 settimana)

---

## Sprint 7: Export & Integration

**Durata:** 1 settimana
**Goal:** Esportazione multi-formato e integrazione Google Drive.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Export cards | Card per ogni formato con preview | Word, PDF, ODT, MD, SCORM, CML, JSON, TXT |
| Format selector | Selezione formato con anteprima | Template engine per margini, font, loghi |
| Google Drive sync | OAuth2 Implicit Grant + REST API Drive v3 | `handleWorkspaceLogin`, `handleWorkspaceSync` |
| Conflict resolution | Confronto side-by-side cloud vs locale | Conferma prima della sovrascrittura |
| SCORM builder | Generatore pacchetto SCORM 1.2 con `LocalZipPacker` | `handleDownloadScormManifest` |
| PDF generation | Stampa PDF via finestra popup con HTML formattato | `handleDownloadCurricoloPDF` |
| Template AI | Configurazione modelli tramite chat IA | `handleSendTemplateInstruction` |

### Dipendenze

- Sprint 1 (Modal per conferme)
- Zustand store (stato completo per backup)
- Google OAuth Client ID

### Sforzo stimato

- **80 ore** (2 developer × 1 settimana)

---

## Sprint 8: Mobile Experience

**Durata:** 2 settimane
**Goal:** Esperienza mobile ottimizzata con navigazione touch e input vocale.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Bottom navigation | Barra di navigazione inferiore su mobile | Sostituisce sidebar su < 768px |
| Touch optimization | Touch targets ≥ 44×44px, gesture swipe | Banner TEP già rileva target piccoli |
| Mobile layouts | Layout a colonna singola per tutte le schermate | Adattamento responsive |
| Voice input | Integrazione `SpeechRecognition` per chat Copilota | `handleToggleVoiceTyping`, `lang='it-IT'` |
| TTS | Sintesi vocale con voci italiane premium | `handleSpeakController` con selezione voce |
| Mobile modals | Modali full-screen su mobile | Adattamento `Modal.tsx` |
| PWA install prompt | Prompt di installazione PWA | `triggerPwaInstall` |
| Offline indicator | Indicatore di stato connessione | Mostra/nasconde funzionalità cloud |

### Dipendenze

- Sprint 1 (Layout responsive)
- Sprint 7 (Google Drive per funzionalità offline)

### Sforzo stimato

- **160 ore** (2 developer × 2 settimane)
- Il bottom navigation + touch optimization richide testing su dispositivi reali

---

## Sprint 9: Accessibility & Polish

**Durata:** 1 settimana
**Goal:** Conformità WCAG 2.1 Level A, navigazione tastiera, screen reader.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| WCAG audit | Audit completo con axe-core e WAVE | Checklist pre-release (docs/10_ACCESSIBILITY.md) |
| Focus trap | Focus management per tutti i modali | 7 modali identificati |
| Skip link | Link "Vai al contenuto principale" | Accessibile con Tab |
| aria-live regions | Annuncio toast e aggiornamenti | `role="status"` su tutti i toast |
| Heading hierarchy | Struttura `<h1>`–`<h6>` corretta | `h1` per titolo pagina, `h2` per sezioni |
| aria-expanded | Aggiornamento stato accordion | `openAccordions` + aria |
| role="dialog" | Modali con ruolo corretto | `role="dialog" aria-modal="true"` |
| role="tablist" | Tab e sottoschede | `role="tab" aria-selected` |
| Focus ring | Outline visibile su focus | `:focus-visible` styling |
| Reduced motion | `prefers-reduced-motion` | Media query CSS |
| Form validation | `aria-invalid` + `aria-describedby` | Errori associati ai campi |

### Dipendenze

- Tutti gli sprint precedenti (audit su componenti esistenti)
- docs/10_ACCESSIBILITY.md (linee guida)

### Sforzo stimato

- **80 ore** (2 developer × 1 settimana)
- Il testing con NVDA/VoiceOver richiede tempo dedicato

---

## Sprint 10: Performance & Deployment

**Durata:** 1 settimana
**Goal:** Ottimizzazione bundle, code splitting, testing finale.

### Deliverables

| Componente | Descrizione | Note |
|-----------|-------------|------|
| Code splitting | Lazy loading per le 11 tab | `React.lazy()` + `Suspense` |
| Bundle optimization | Analisi e riduzione bundle size | Target: < 500KB gzipped |
| PWA improvements | Service Worker caching strategy | `sw.js` già esistente |
| Testing completo | Unit test + integration test | `vitest` + `@testing-library/react` |
| E2E testing | Test end-to-end con Playwright | `@playwright/test` già nelle dipendenze |
| Performance audit | Lighthouse score ≥ 90 per tutte le metriche | Performance, Accessibility, Best Practices, SEO |
| Cross-browser test | Chrome, Firefox, Safari, Edge | Desktop + mobile |
| Documentation | Aggiornamento docs/ con stato finale | Tutti i file 00–12 |

### Dipendenze

- Tutti gli sprint precedenti
- `vitest.config.ts` esistente
- `@playwright/test` nelle dipendenze

### Sforzo stimato

- **80 ore** (2 developer × 1 settimana)

---

## Riepilogo Roadmap

| Sprint | Nome | Durata | Sforzo | Priorità |
|--------|------|--------|--------|----------|
| 1 | Foundation & Layout | 2 settimane | 160h | Critica |
| 2 | Home Dashboard | 1 settimana | 80h | Alta |
| 3 | Curricolo | 2 settimane | 160h | Alta |
| 4 | Revisione | 1 settimana | 80h | Media |
| 5 | Progettazione UDA | 2 settimane | 160h | Alta |
| 6 | Classe | 1 settimana | 80h | Media |
| 7 | Export & Integration | 1 settimana | 80h | Alta |
| 8 | Mobile Experience | 2 settimane | 160h | Media |
| 9 | Accessibility & Polish | 1 settimana | 80h | Alta |
| 10 | Performance & Deployment | 1 settimana | 80h | Alta |
| **Totale** | | **14 settimane** | **1.120h** | |

### Dipendenze tra Sprint

```
Sprint 1 (Foundation)
├── Sprint 2 (Dashboard) ──┐
├── Sprint 3 (Curricolo) ──┤
│   └── Sprint 4 (Revisione)
│   └── Sprint 5 (UDA) ────┤
│       └── Sprint 6 (Classe)
├── Sprint 7 (Export) ─────┤
└── Sprint 8 (Mobile) ─────┘
    └── Sprint 9 (Accessibility)
        └── Sprint 10 (Performance)
```

### Rischi e Mitigazioni

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| App.tsx monolite > 12K righe | Alto | Sprint 1 con refactoring graduale e test |
| State management fragmentato | Alto | Mantenere Zustand come unico store, aggiungere selectors |
| Breaking changes durante refactor | Medio | Branch dedicati per sprint, test dopo ogni estrazione |
| Testing mancante | Alto | Aggiungere test prima di refactare ogni componente |
| Mobile testing insufficiente | Medio | Test su Chromebook reale + emulatori Android |
| Google OAuth deprecato | Basso | Monitorare migrazione a Authorization Code flow |
| IndexedDB supporto inconsistenti | Medio | Fallback a memoria già implementato (`memoryStore`) |
