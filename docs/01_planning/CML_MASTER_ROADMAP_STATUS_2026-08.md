# CurManLight — Master Roadmap Status

> Documento di consolidamento ufficiale dello stato della roadmap CML-630 → CML-638.
> Attività esclusivamente documentale: nessun codice applicativo, test, configurazione, dipendenza, store o persistenza è stato modificato.

## 5.1 Identificazione

| Campo | Valore |
|-------|--------|
| Data di aggiornamento | 2026-08-02 |
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD | `f2cae27285a9b5a0099b470af708ca0978cb76f6` |
| Baseline valida | `f2cae27285a9b5a0099b470af708ca0978cb76f6` |
| Suite completa | 1955/1955 test, 103 file di test |
| Stato pubblicazione | NON pubblicata — solo commit locale; nessun push, merge o PR |
| Ultimo verdetto approvato | `CML_636B_CANONICAL_DOCUMENT_PREVIEW_EXPORT_COMPLETE_LOCAL` |
| `origin/main` | `f5289703dbe1daa4bd09cb8e7cdb638aa0988186` (PR #18, CML-630F2) |

**Nota sulla baseline:** la baseline corrente è `f2cae27`, che comprende consolidamento CML-638B, specifica approvata CML-636B, implementazione CML-636B, correzioni finali a fixture/contesto istituzionale/stato anteprima, suite `1955/1955`, TypeScript, build e Storybook verdi. Il commit `33eb4ec` è il commit funzionale precedente alle correzioni finali e NON è baseline autonoma.

---

## 5.2 Legenda degli stati

| Stato | Definizione |
|-------|-------------|
| `COMPLETE_REMOTE` | Fase completata e mergiata su `main`/`origin/main` con verdetto esplicito. |
| `COMPLETE_LOCAL` | Fase completata e verificata localmente, ma non ancora mergiata/pubblicata (o verdetto locale registrato). |
| `CONSOLIDATED_LOCAL` | Fase ricomposta/consolidata localmente (es. linea di persistenza + linea UI su un unico ramo). |
| `DESIGN_APPROVED` | Progettazione/specifica approvata; implementazione non avviata o non ancora formalizzata. |
| `IMPLEMENTED_PENDING_FORMAL_CLOSURE` | Implementazione e verifiche tecniche completate, ma chiusura formale, verdetto definitivo o baseline di accettazione non ancora registrati. |
| `PLANNED` | Pianificata in roadmap; nessun artefatto di design o implementazione. |
| `NOT_STARTED` | Non avviata; nessun commit, nessun documento dedicato. |
| `BLOCKED` | Bloccata da vincoli, dipendenze o risultati non raggiunti. |
| `SUPERSEDED` | Superata da una fase successiva o da una decisione che ne modifica il perimetro. |
| `REQUIRES_REAL_VALIDATION` | Completata a livello tecnico/locale ma non validata con docenti reali: la validazione reale è prerequisito. |

---

## 5.3 Matrice generale CML-630 → CML-638

| Codice | Titolo | Stato | Branch | Commit/HEAD | Dipendenze | Evidenza | Prossima azione |
|--------|--------|-------|--------|-------------|------------|----------|-----------------|
| CML-630A | National Framework Applicability Foundation | `COMPLETE_REMOTE` | — | `6c8c93c` | — | `docs/PROPOSAL_CURRICULUM_TRANSITION_DOMAIN.md`, AGENTS.md | — |
| CML-630B | Institute Curriculum Version and Segment Model | `COMPLETE_REMOTE` | — | `635fd6a` (con 630C) | 630A | `docs/PROPOSAL_CML_630B_*.md`, AGENTS.md | — |
| CML-630C | Curriculum e-Twin Domain Validation | `COMPLETE_REMOTE` | — | `635fd6a` | 630B | `docs/CML_630C_CURRICULUM_ETWIN_DOMAIN_VALIDATION_REPORT.md` | — |
| CML-630D | Vertical Curriculum Link Domain Decision | `COMPLETE_REMOTE` | — | `7e6b2eb` | 630C | `docs/CML_630D_VERTICAL_CURRICULUM_LINK_DOMAIN_DECISION.md` | — |
| CML-630E1 | Productive Curriculum Domain Contracts | `COMPLETE_REMOTE` | — | `a331dcf` | 630D | `docs/CML_630E_PRODUCTIVE_CURRICULUM_DOMAIN_REPORT.md` | — |
| CML-630E2 | Persistence & Legacy Compatibility | `COMPLETE_REMOTE` | — | `1041fb5` | 630E1 | `docs/CML_630E2_PERSISTENCE_AND_LEGACY_COMPATIBILITY_REPORT.md` | — |
| CML-630F | Curriculum Transition Documentation Alignment | `COMPLETE_REMOTE` | — | `5c34dc8` | — | AGENTS.md | — |
| CML-630F2 | Legacy Compatibility (extended) | `COMPLETE_REMOTE` (merged PR #18) | `feat/cml-630f2-legacy-compatibility-extended` | `f528970` (merge) | 630E2 | `docs/AUDIT_ACADEMIC_YEAR_CURRICULUM_TRANSITION.md`, AGENTS.md (riga stale) | — |
| CML-631A | Curriculum Domain Functional Activation Pilot | `COMPLETE_REMOTE` | — | `f6a9e81` (PR #10) | 630E2 | `docs/CML_631A_FUNCTIONAL_ACTIVATION_PILOT_REPORT.md` | — |
| CML-631B | Curriculum Functional Pilot Evaluation | `COMPLETE_REMOTE` | — | `301cf01` (PR #11) | 631A | `docs/CML_631B_CURRICULUM_FUNCTIONAL_PILOT_EVALUATION_REPORT.md` | — |
| CML-631C | Curriculum Pilot Usability Corrections | `COMPLETE_REMOTE` | — | `e1c5124` (PR #12) | 631B | `docs/CML_631C_CURRICULUM_PILOT_USABILITY_CORRECTIONS_REPORT.md` | — |
| CML-631D | Curriculum Pilot Teacher Validation | `COMPLETE_REMOTE` | — | `f488394` (PR #13) | 631C | `docs/CML_631D_CURRICULUM_PILOT_TEACHER_VALIDATION_REPORT.md` | **Validazione SIMULATA, non reale** |
| CML-631E | Guided Curriculum Connection Flow | `COMPLETE_LOCAL` (`...REAL_TEACHER_VALIDATION_REQUIRED`) | `feat/cml-631e-guided-curriculum-connection-flow` | `0460833` | 631D | `docs/CML_631E_FINAL_REPORT.md` | Non mergiato |
| CML-631F | Real Teacher Validation | `REQUIRES_REAL_VALIDATION` (`NOT_EXECUTED`, SUSPENDED) | — | baseline `a475c01` (tag `cml-631f-baseline-04`) | 631E, 631I | `docs/CML_631F_REAL_TEACHER_VALIDATION_REPORT.md` (placeholder) | Eseguire sessioni reali |
| CML-631G | Pilot Initialization Refresh Fix | `COMPLETE_LOCAL` | `fix/cml-631g-pilot-initialization-refresh` | `e6c3025` | 631F | `docs/CML_631G_PILOT_INITIALIZATION_REFRESH_FIX.md` | Non mergiato |
| CML-631H | Runtime Pilot Data Population Fix | `COMPLETE_LOCAL` | `fix/cml-631h-runtime-pilot-data-population` | `aec39fc` | 631G | `docs/CML_631H_RUNTIME_PILOT_DATA_POPULATION_FIX.md` | Non mergiato |
| CML-631I | Assisted Pedagogical Relation Suggestions | `COMPLETE_LOCAL` (NOT ADOPTED) | `feat/cml-631i-assisted-pedagogical-relation-suggestions` | `a475c01` | 631H | `docs/CML_631I_ASSISTED_PEDAGOGICAL_RELATION_SUGGESTIONS.md` | Non adottato, non mergiato |
| CML-632 | Audit Framework | `COMPLETE_LOCAL` | — | baseline `c853b36` | 631 (frozen) | `docs/CML_632_AUDIT_FRAMEWORK.md`, `docs/CML_632_AUDIT_ROADMAP.md` | — |
| CML-632A | System Area Inventory | `COMPLETE_LOCAL` | — | `c853b36` | 632 | `docs/CML_632A_SYSTEM_AREA_INVENTORY.md` | — |
| CML-632B | Audit A01 Home/Orientation | `COMPLETE_LOCAL` (verdetto REDESIGN) | `audit/cml-632b-a01-home-orientation` | `4e02417` | 632A | `docs/CML_632B_A01_HOME_ORIENTATION_*` | — |
| CML-632C | Audit A11 Institute Sources | `COMPLETE_LOCAL` (verdetto REDESIGN) | `audit/cml-632c-a11-institute-sources` | `eddbf6b` | 632A | `docs/CML_632C_A11_INSTITUTE_SOURCES_*` | — |
| CML-632D | Audit A02 Curriculum Consultation | `COMPLETE_LOCAL` (verdetto REDESIGN) | `audit/cml-632d-a02-curriculum-consultation` | `a6f3325` | 632A | `docs/CML_632D_A02_CURRICULUM_CONSULTATION_*` | — |
| CML-632E | Audit A03 Curriculum Revision | `COMPLETE_LOCAL` (verdetto REDESIGN) | `audit/cml-632e-a03-curriculum-revision` | `c70f1d8` | 632A | `docs/CML_632E_A03_CURRICULUM_REVISION_*` | — |
| CML-632F | Audit A04 Teaching Design | `COMPLETE_LOCAL` (verdetto REDESIGN) | `audit/cml-632f-a04-teaching-design` | `b39a1b7` | 632A | `docs/CML_632F_A04_TEACHING_DESIGN_*` | — |
| CML-632G | Audit A07 Documents/Export | `COMPLETE_LOCAL` (verdetto REDESIGN) | `audit/cml-632g-a07-documents-export` | `e1395a5` | 632A | `docs/CML_632G_A07_DOCUMENTS_EXPORT_AUDIT.md` | — |
| CML-632H | Cross-Area Structural Synthesis | `COMPLETE_LOCAL` (REFOUNDATION) | `audit/cml-632h-cross-area-structural-synthesis` | `ee647be` / `b8ea0c2` | 632B–G | `docs/audits/CML_632H_*` | Genera CML-633 |
| CML-633 | Product Foundation Redesign (design) | `DESIGN_APPROVED` (COMPLETO) | `design/cml-633-product-foundation-redesign` | `cb122ff` | 632H | `docs/foundation/CML_633_PRODUCT_FOUNDATION_REDESIGN.md` | — |
| CML-633B | Canonical Identity and Metadata | `COMPLETE_LOCAL` | `feat/cml-633b-canonical-identity-metadata` | `d680cc8` | 633 | `docs/foundation/CML_633B_*` | Non mergiato |
| CML-633C | Sources and Curriculum Domain | `COMPLETE_LOCAL` | `feat/cml-633c-...` | `06a91a8` (+`c4c976f`) | 633B | `docs/foundation/CML_633C_*` | Non mergiato |
| CML-633D | Institutional Configuration | `COMPLETE_LOCAL` | `feat/cml-633d-institutional-configuration` | `d1b7130` (plan `c4fb40e`) | 633C | `docs/foundation/CML_633D_*` | Non mergiato |
| CML-633E | Cross-Area Transfer Contracts | `COMPLETE_LOCAL` | `feat/cml-633e-...` | `64c4fe3` | 633D | `docs/foundation/CML_633E_*` | Non mergiato |
| CML-633F | Canonical Document System | `COMPLETE_LOCAL` | `feat/cml-633f-canonical-document-system` | `2ba65a5` | 633E | `docs/foundation/CML_633F_*` | Non mergiato |
| CML-633G | Revision and Decision Workflow | `COMPLETE_LOCAL` | `feat/cml-633g-revision-decision-workflow` | `b113c91` (base `2ba65a5`) | 633F | `docs/foundation/CML_633G_*` | Non mergiato |
| CML-633H | Curriculum-to-Design Transfer | `COMPLETE_LOCAL` | `feat/cml-633h-curriculum-to-design-transfer` | `9aa6099`…`1ffb4b0` | 633G | `docs/foundation/CML_633H_*` | Non mergiato |
| CML-633I | Guided Teacher Workflow | `COMPLETE_LOCAL` | `feat/cml-633i-guided-teacher-workflow` | `995229d` / chiusura `4952b9b` | 633H | `docs/foundation/CML_633I_*` | Non mergiato |
| CML-633J | Product Integration and Migration Closure | `COMPLETE_LOCAL` | `feat/cml-633j-product-integration-migration-closure` | `2f70139` | 633I | `docs/foundation/CML_633J_*` | Non mergiato |
| CML-634A | Optional AI Provider Boundary | `COMPLETE_LOCAL` | — | `0021a8b` (accettazione) | 633J | `docs/03_execution/CML-634A.md` + post-acceptance record | Chiusura formale su doc |
| CML-634B | Consent-bound Local Ollama Pilot | `IMPLEMENTED_PENDING_FORMAL_CLOSURE` (gates PASS, chiusura formale non registrata) | — | `0feab01` (verifica), chain su `main` | 634A | `docs/03_execution/CML-634B_VERIFICATION.md` | Rapporto conclusivo + worktree residue |
| CML-635A | Workspace Identity and Institutional Context | `NOT_STARTED` | — | — | 634A, 633D | riferimenti in `docs/CML_638A_*`, `docs/foundation/CML_633J_*` | Progettare |
| CML-635B | Workspace Roles and Permissions | `NOT_STARTED` | — | — | 635A | riferimenti in `docs/CML_638A_*`, `docs/foundation/CML_633J_*` | Progettare |
| CML-635C | Shared Institutional Repository and Synchronization | `NOT_STARTED` | — | — | 635A/B | riferimenti in `docs/CML_638A_*`, `docs/foundation/CML_633J_*` | Progettare |
| CML-635D | Institutional AI Governance and Provider Administration | `NOT_STARTED` | — | — | 635A/B, 634B | riferimenti in `docs/CML_638A_*` | Progettare |
| CML-636A | Template Consolidation (UDA/programmazione/relazione/curricolo/verbale) | `NOT_STARTED` (nessun verdetto esplicito) | — | — | 633F, 638A block #1 | `docs/CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE.md` | Definire template definitivi |
| CML-636B | Canonical Document Preview & Print Export | `COMPLETE_LOCAL` | `feat/cml-636b-canonical-document-preview-export` | `f2cae27` (base `9d27c57`, funzionale `33eb4ec`) | 638B | `docs/03_execution/CML-636B_VERIFICATION.md` | Commit locale già fatto |
| CML-637 | Trama Curriculum Graph — Product Blueprint | `DESIGN_APPROVED` (design-only) | `origin/design/cml-637-trama-curriculum-graph` | `928b4dc` | 633 | `docs/proposals/CML-637_TRAMA_PRODUCT_BLUEPRINT.md` | Non mergiato, non implementato |
| CML-637A | Trama Taxonomy Specification | `DESIGN_APPROVED` (`DRAFT_REMOTE`) | `origin/design/cml-637-trama-curriculum-graph` | `678369d` | 637 | `docs/proposals/CML-637A_TRAMA_TAXONOMY_SPECIFICATION.md` | Non implementato |
| CML-637A (infra) | Revision-domain repository repair | `COMPLETE_REMOTE` | `fix/cml-637a-revision-domain-repository-integrity` | `8015748` | 633G | git history | Infra, non Trama |
| CML-637B (eseguito) | Vite dependency debt + fast test workflow | `COMPLETE_REMOTE` (PR #15, `026542c`) | `fix/cml-637b-single-vite-and-fast-test-workflow` | `beb69de` | — | `docs/CML_637B_*` | — |
| CML-637B–L | Trama program phases (dominio grafo, adattatore, viste…) | `NOT_STARTED` | — | — | 637, 637A | blueprint | Ripianificare |
| CML-638A | System-Wide Product Readiness Baseline | `COMPLETE_REMOTE` (PR #17, `071129a`) | `audit/cml-638a-system-wide-product-readiness` | `f388736` (baseline `8d57017`) | — | `docs/CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE.md` | — |
| CML-638B | Productive Document Path Closure (persistenza + UI) | `CONSOLIDATED_LOCAL` | `feat/cml-638b-canonical-path-consolidation` | `9dc3bb7` (record `4b72b10`) | 633F, 638A | `docs/03_execution/CML-638B_VERIFICATION.md` | Presente su ramo attuale; non su `origin/main` |

---

## 5.4 CML-630 — Dominio curricolare

### 630A — National Framework Applicability Foundation (`COMPLETE_REMOTE`, `6c8c93c`)
- Risultati: dominio puro — `AcademicYear`, `NationalFramework`, `TransitionPolicy`, `FrameworkResolution`, `resolveNationalFramework()`, formula di coorte (`cohortEntryYear = academicYear.startYear - (classLevel - 1)`), matrice 2025/26→2030/31, stabilità fino al 2050, 122 test, zero dipendenza dalla data corrente.
- Limite registrato: NON integrato a runtime al momento della fase (formula legacy `schoolYear === '2026-2027'` ancora presente). L'integrazione runtime è stata chiusa successivamente da CML-630F2.

### 630B — Institute Curriculum Version and Segment Model (`COMPLETE_REMOTE`, `635fd6a`)
- Modello versione/segmento dell'istituto. Scelta iniziale: **Modello A** (relazioni incorporate nel segmento) "per prudenza".
- **Successivamente superata da CML-630D (Modello C ibrido).**

### 630C — Curriculum e-Twin Domain Validation (`COMPLETE_REMOTE`, `635fd6a`)
- Prototipo sperimentale isolato (`src/features/curriculum-etwin/`), confronto Modello A vs Modello B; 35/35 test.
- **Raccomandazione: Modello B** (relazioni pedagogiche come entità esplicite `VerticalCurriculumLink`). Evidenza per CML-630D.

### 630D — Vertical Curriculum Link Domain Decision (`COMPLETE_REMOTE`, `7e6b2eb`)
```
CML_630D_DECISION_COMPLETE
MODELLO_C_IBRIDO_ADOPTED
VERTICAL_CURRICULUM_LINK_PROMOTED_TO_PRODUCTION_DOMAIN
CURRICULUM_NODE_PROMOTED_TO_PRODUCTION_DOMAIN
CML_630E_REQUIRED_FOR_IMPLEMENTATION
```
- **Decisione formale DEC-630D-001 — Modello C ibrido:**
  - `CurriculumSegment` → relazioni strutturali (provenienza, sostituzione, appartenenza);
  - `VerticalCurriculumLink` → relazioni pedagogiche (continuità, sviluppo, approfondimento, prerequisito, integrazione, discontinuità);
  - workflow `draft → proposed → validated → approved` (+ rejected); ruoli: docente propone, dipartimento valida, referente consolida, collegio approva (solo versione).
- Solo decisione: nessuna implementazione in questa fase.

### 630E1 — Productive Curriculum Domain Contracts (`COMPLETE_REMOTE`, `a331dcf`)
- Modello C ibrido implementato come contratti produttivi in `src/domain/curriculum/`: 5 tipi entità (version, segment, node, verticalLink, types), 13 funzioni di validazione, 55 test di dominio, barrel pubblico `index.ts`, zero dipendenze da store/IndexedDB/UI/e-twin.
- Invarianti di immutabilità per versioni `approved`/`superseded`.

### 630E2 — Persistence & Legacy Compatibility (`COMPLETE_REMOTE`, `1041fb5`)
- Persistence in `src/domain/curriculum/persistence/`: schema Dexie v2 (`state` preservato), repository per versioni/segmenti/nodi/link, `compatibilityMode = 'legacy-only'` (dual-read/dual-write come valori di contratto, NON attivati), migrazione esplicita `CML-630E2-LEGACY-CURRICULUM-MIGRATION-V1`, backup (checksum FNV-1a) + rollback.
- Adapter legacy: traguardi→milestone, obiettivi→objective, evidenze→evidence, nuclei fondanti→core-theme, proposals→segment content.
- Dominio persistibile ma **non attivo** nei flussi di produzione. 56 test mirati; suite completa 618/618.

### 630F / 630F2 — Allineamento documentale e compatibilità estesa
- **630F** (`5c34dc8`): allineamento documentale di audit e proposta (solo documentale).
- **630F2**: compatibilità legacy estesa — `src/lib/academicYear.ts` (parseSchoolYear, createAcademicYear, isValidAcademicYear), unico `formatAcademicYear` canonico in `curriculumTransitionResolver.ts`, `src/lib/curriculumTransitionUi.ts` (`resolveShownFrameworkForCurriculum` → `resolveNationalFramework`), entry point unico `src/lib/curriculumBaseline.ts`, import diretti di `curriculumKB` deprecati.
- **Stato reale:** PR #18 mergiata (`f528970` su `origin/main`) → **effettivamente `COMPLETE_REMOTE`**. La riga AGENTS.md (`COMPLETE_LOCAL` pending) è **stale**.

**Fasi assorbite:** la scelta iniziale Modello A (630B) è assorbita da Modello C ibrido (630D); il dominio curricolare "633A Fondazione Dominio" della roadmap CML-633 è realizzato di fatto da CML-630E1/E2.

---

## 5.5 CML-631 — Pilota e percorso docente

| Sottofase | Stato | Esito |
|-----------|-------|-------|
| 631A — Functional Activation Pilot | `COMPLETE_REMOTE` (`f6a9e81`, PR #10) | Opzione B `pilot-contribution`, default disabilitato, solo ruolo Docente, dataset sintetico Math primaria→secondaria, 5 componenti UI, 65 test pilota |
| 631B — Functional Pilot Evaluation | `COMPLETE_REMOTE` (`301cf01`, PR #11) | Decisione B "Correggere prima di estendere"; 6 scenari obbligatori PASS; 13 microfix (1 HIGH, 8 MEDIUM, 4 LOW); 83/83 test |
| 631C — Pilot Usability Corrections | `COMPLETE_REMOTE` (`e1c5124`, PR #12) | 5 correzioni (tooltip guida, filtro locale, conferma eliminazione, stati async, preservazione microfix); 720/720 test |
| 631D — Curriculum Pilot Teacher Validation | `COMPLETE_REMOTE` (`f488394`, PR #13) | Decisione B; **validazione SIMULATA** — "Nessun docente reale è stato coinvolto"; 5 profili simulati; metriche chiave sotto soglia (3/5, 60% vs ≥80%) |
| 631E — Guided Curriculum Connection Flow | `COMPLETE_LOCAL` (`...REAL_TEACHER_VALIDATION_REQUIRED`) | Flusso progressivo 5 step; 7/9 criteri auto-passati; C1 e C9 richiedono docenti reali; **non pronto per validazione reale**; NON mergiato |
| **631F — Real Teacher Validation** | **`REQUIRES_REAL_VALIDATION`** (`CML_631F_REAL_TEACHER_VALIDATION_NOT_EXECUTED`, SUSPENDED) | **Validazione reale con docenti NON eseguita.** Protocollo, griglie, log, checklist e 4 baseline freeze (01–04) preparati; baseline 04 (`a475c01`, tag `cml-631f-baseline-04`) supera 19/19 check headless; **0/5 sessioni, T01–T05 vuoti, report placeholder** |
| 631G — Pilot Initialization Refresh Fix | `COMPLETE_LOCAL` | Root cause: closure stale in `initializeDataset()`; fix `refreshData(overrideDataset?)`; NON mergiato |
| 631H — Runtime Pilot Data Population Fix | `COMPLETE_LOCAL` | Fix G.9 selettore fragile + init-while-disabled; Playwright 19/19 → baseline 03 `RUNTIME_VERIFIED_READY_LOCAL`; NON mergiato |
| 631I — Assisted Pedagogical Relation Suggestions | `COMPLETE_LOCAL` (NOT ADOPTED) | Motore deterministico locale (13 regole, max 3 suggerimenti, ordinati per confidenza), UI "Possibili relazioni suggerite"; 18 test; **non adottato**; NON mergiato |

> **Evidenza critica:** `CML-631F — validazione reale con docenti non eseguita`. Classificata `REQUIRES_REAL_VALIDATION`. Né le simulazioni CML-631D né i test automatici sono equivalenti alla validazione reale. Il pilota curricolare risulta **CONGELATO** (`CML_631_CURRICULUM_FUNCTIONAL_PILOT_FROZEN`, `CML_631F_REAL_TEACHER_VALIDATION_SUSPENDED`).

**Nota su 631I-R2:** nessuna sottofase "631I-R2" risulta documentata in doc, branch o commit (le revisioni -R2/-R3/-R4/-R5 appartengono a CML-634B, non a 631I).

---

## 5.6 CML-632 — Audit

- **Framework (`CML_632_AUDIT_FRAMEWORK_READY_LOCAL`, baseline `c853b36`):** 9 dimensioni di audit (A–I), scala 0–4, severity (`BLOCCO/RISCHIO/DEBITO/OPPORTUNITA/PUNTO DI FORZA`), vocabolario verdetti (`MANTENERE/SEMPLIFICARE/CORREGGERE/RIPROGETTARE/SOSPENDERE/ELIMINARE`), regola read-only, un commit documentale per audit, 13 aree funzionali canoniche (A01–A13).
- **Audit eseguiti — tutti `REDESIGN`:**
  - A01 Home/Orientation (`4e02417`): 3 BLOCCO + 8 SIGNIFICANT; 7/10 dimensioni sotto 3; nessuna identità di prodotto, font 8–11px, gergo tecnico.
  - A11 Institute Sources (`eddbf6b`): 4 BLOCCO + 7 SIGNIFICANT; 11/12 dimensioni sotto 3; zero metadata fonti, nessun collegamento, affermazioni 2025 non verificate.
  - A02 Curriculum Consultation (`a6f3325`): 5 BLOCCO + 11 SIGNIFICANT; **14/15 dimensioni sotto 3 (peggiore auditata)**; "non rotta — incompleta".
  - A03 Curriculum Revision (`c70f1d8`): 8 BLOCCO + 7 SIGNIFICANT; 17/20 dimensioni sotto 3.
  - A04 Teaching Design (`b39a1b7`): 8 BLOCCO + 10 SIGNIFICANT; 24/30 dimensioni sotto 3.
  - A07 Documents/Export (`e1395a5`): 8 BLOCCO + 9 SIGNIFICANT.
- **Sintesi trasversale CML-632H (`CML_632H_PRODUCT_STRUCTURAL_REFOUNDATION`, `ee647be`/`b8ea0c2`):** punteggio complessivo **12/100 (0.6/5)**; **7 cause radice confermate** (RC-01 assenza modello dati canonico P0, RC-02 assenza modello di processo istituzionale P0, RC-03 aree progettate come moduli isolati P0, RC-04 prototipi rimasti in prodotto P1, RC-05 assenza modello documento P1, RC-06 assenza configurazione istituzionale P1, RC-07 UI precede il dominio P2); 12 pattern consolidati; tabella dichiarazione-vs-realtà (curricolo hardcoded, revisione = voto key-value, IA = keyword matching con latenza finta, DOCX = HTML).
- **Problemi strutturali:** catena A02→A03→A04→A07 rotta a ogni freccia; dati senza identità/versioni; processo personale etichettato "Approvato 2025"; prototipi accessibili indistinguibili dai dati reali.
- **Fasi successive generate:** piano di rifondazione in 7 fasi (0 Contenimento → 1 Fondazione Dati → 2 Processo e Governance → 3 Continuità tra Aree → 4 Documenti → 5 Esperienza Utente → 6 Validazione Reale) → **CML-633**.
- **Stato:** le righe A05/A06/A08/A09/A10/A12/A13 della roadmap 632 restano `PLANNED`; 632H raccomanda di **rinviare** gli audit rimanenti (A08 in forma ridotta) e di non eseguire ulteriori audit prima della rifondazione.
- **Nota stato:** la riga della roadmap 632 per CML-633 ("DESIGN_COMPLETE/FOUNDATION_READY/pending") è **stale**: i documenti di design 633 dichiarano `COMPLETO` (v. 5.7).

---

## 5.7 CML-633 — Rifondazione

- **Design complessivo (`CML_633_PRODUCT_FOUNDATION_REDESIGN_COMPLETE`, `cb122ff`, 2026-07-27):** registro decisioni 27 decisioni (7 implementate, 0 in revisione), modello canonico, modello stato/ruolo/evento, contratti di trasferimento, modello documento+istituto, piano di migrazione, roadmap di implementazione 12 slice (633A–633L, 89 task, 277h, 10 settimane).

### Principi architetturali che le fasi future devono preservare
1. **Documento canonico** — il documento è un'entità tracciata, non un side-effect di export; "l'HTML è una resa derivata, mai il contenuto autorevole" (633F).
2. **Versione** — `DocumentVersion` immutabile (`frozen: true`), singola fonte di verità per anteprima/export (633F, 636B).
3. **Provenienza** — tracciabilità fonte→trasferimento→documento; `sourceRefs`/`originRefs`; contenuti legacy qualificati e MAI auto-promossi (633B, LG-001).
4. **Archivio unico** — un solo archivio per dominio persistito via `useCurriculumStore` + singola tabella Dexie `state`; nessuna tabella/schema nuovo (633D/E/F/G/H, 633J); nessun secondo archivio documenti (636B).
5. **Compatibilità** — migrazione non distruttiva, reversibile, dual-write/dual-read come contratto; legacy preservato read-only (633J, 630E2).
6. **Decisione umana** — nessuna auto-promozione `synthetic/assisted/demonstration/legacy` → `institute` senza evento esplicito; proposal MAI `approved` (633G); "Non costituisce adozione ufficiale" (633J).
7. **Assenza di percorsi paralleli** — le aree UI sono proiezioni su un unico dominio; un solo renderer, un solo generatore, un solo resolver di versione (P3, 633I, 636B).

### Fasi di implementazione
| Slice | Contenuto | Stato | Commit |
|-------|-----------|-------|--------|
| 633 (design) | Rifondazione prodotto (design) | `DESIGN_APPROVED` (COMPLETO) | `cb122ff` |
| 633B | Identità e metadata canonici (`EntityId` branded, 9 ContentOrigins, ActorReference, validators, adapter legacy) | `COMPLETE_LOCAL` | `d680cc8` |
| 633C | Fonti e dominio curricolare canonico (matrice curriculumKB: 35 segmenti, 471 nodi, 94 traguardi, 247 obiettivi, 130 evidenze, 22 proposals) | `COMPLETE_LOCAL` | `06a91a8` + `c4c976f` |
| 633D | Configurazione istituzionale (Institute, AcademicYear, InstituteSite, InstitutionalContext, profilo A04/A07, archivio aggregato, identità neutra, hardcoded rimossi) | `COMPLETE_LOCAL` | `d1b7130` (plan `c4fb40e`) |
| 633E | Contratti di trasferimento tra aree (A11→A02→A03→A04→A07, validazione pre/post, footprint FNV-1a, event log append-only, 24 error types) | `COMPLETE_LOCAL` | `64c4fe3` |
| 633F | Sistema documentale canonico A07 (DocumentArchive, versioni immutabili, rendering sicuro, export policy, adapter UDA legacy) | `COMPLETE_LOCAL` | `2ba65a5` |
| 633G | Workflow revisione e decisione (RevisionProposal, RevisionProposalVersion, Decision, DecisionEffectRecord, event log, A02→A03→A04→A07) | `COMPLETE_LOCAL` | `b113c91` (base `2ba65a5`) |
| 633H | Trasferimento curricolo→progettazione (designArchive, 5 qualificazioni, matrice A03→A04, traceability A07, DesignSelezioniPanel) | `COMPLETE_LOCAL` | `9aa6099`…`1ffb4b0` |
| 633I | Percorso guidato docente (7 principi, 7 step, linguaggio docente, nessun sistema parallelo) | `COMPLETE_LOCAL` | `995229d` / chiusura `4952b9b` |
| 633J | Chiusura integrazione e migrazione (catena canonica, 9 superfici attive, 4 legacy read-only, autorità dati singola, 5 scenari end-to-end, 36 test regressione) | `COMPLETE_LOCAL` | `2f70139` |

**Note:**
- **Significato di `COMPLETE_LOCAL` nelle fasi CML-633:** ogni slice è **tecnicamente completata** (test mirati, TypeScript, build e storybook verdi al rispettivo commit) ma **non risulta integrata direttamente in `main`** (nessun merge su `main`/`origin/main`). **"Non mergiata in `main`" NON equivale a "non adottata" né a "non utilizzata":** queste linee restano parte della **genealogia delle baseline successive** — i commit successivi (CML-634, CML-638, CML-636) discendono dal patrimonio di contratti, domini e archiviazioni costruito da CML-633, anche senza un'integrazione diretta in `main`. L'eccezione esplicita è **CML-631I**, classificata **`NOT ADOPTED`** (diversamente dalle fasi CML-633, non è stata assunta come parte del percorso produttivo).
- **Nessuna fase CML-632/633 è mergiata su `main`** — tutte locali ("Push/merge/publication: not executed").
- 633A (Fondazione Dominio) non ha marker di stato: il dominio curricolare è di fatto realizzato da CML-630E1/E2.
- La letteratura di lettering della roadmap 633 (633C=Event Log, 633G=Template System, 633H=Migrazione Dati, 633I=Refactoring UI, 633J=Archiviazione Prototipi) **diverge** dai contenuti implementati; si usano come autorevoli i documenti di implementazione.
- 633J: **solo HTML, JSON e Print sono export reali**; DOCX, ODT e PDF "No (not generated)" dal sistema 633 (il PDF arriva con CML-636B via stampa browser).

---

## 5.8 CML-634 — Intelligenza artificiale opzionale

### CML-634A — Optional AI Provider Boundary — `COMPLETE_LOCAL`
- **Verdetto formale di accettazione** (post-acceptance record, HEAD `0021a8b`): `CML_634A_OPTIONAL_AI_PROVIDER_BOUNDARY_VERIFIED_AND_CLOSED_LOCAL` / `FORMAL_ACCEPTANCE_GRANTED`.
- **Nota incongruenza:** il documento committato `docs/03_execution/CML-634A.md` conserva il verdetto pre-accettazione (`IMPLEMENTATION_TESTED_AND_BUILD_VERIFIED` / `FORMAL_CLOSURE_BLOCKED_BY_PREEXISTING_GLOBAL_TYPESCRIPT_ERRORS` / `CML_634B_REMAINS_SUSPENDED`). Il blocco era causato da 3 errori TS6133 preesistenti in `design-transfer-integration.test.tsx`, riprodotti alla baseline: **non regressione 634A**.
- **Contenuti:** provider boundary (domain `src/domain/ai/`), null provider (default sicuro; stati unconfigured/disabled/available/unavailable), configurazione, modello errori (9 codici), provenienza, registry e risoluzione, execution service (`AiExecutionService` con routing/capability/provenance). Capacità: textGeneration, structuredCompletion, analysisOrClassification, streamingAvailable, localExecution, remoteExecution.
- 14 test; build e storybook PASS. Commit: `99ffd03` (feat), `0021a8b` (test/acceptance).

### CML-634B — Consent-bound Local Ollama Pilot — stato verificato: implementato e verificato, chiusura formale NON registrata
- **Verifica richiesta ("DESIGN_APPROVED o COMPLETE?"):** NON è `DESIGN_APPROVED` (l'implementazione esiste ed è gate-verificata); NON è formalmente `COMPLETE` perché **nessun verdetto di chiusura formale è stato registrato** in alcun documento. Stato corretto: **`IMPLEMENTED_PENDING_FORMAL_CLOSURE`** — implementazione e verifiche tecniche completate, ma chiusura formale, verdetto definitivo o baseline di accettazione non ancora registrati. NON è attribuito `COMPLETE_LOCAL` in assenza della relativa evidenza formale.
- **Sette gate preventivi tutti PASS** (`docs/03_execution/CML-634B_VERIFICATION.md`, commit `0feab01`):
  1. provider ammessi: solo generazione Ollama locale con consenso esplicito; remote **rifiutato senza alcuna chiamata trasporto**; endpoint non-loopback rifiutati prima del trasporto;
  2. credenziali: nessun campo credential nel body/provenance; endpoint/modello **non persistiti**;
  3. consenso: rifiuto senza consenso prima del trasporto; `undefined` = rifiutato; consenso scoped alla richiesta;
  4. minimizzazione dati: prompt vuoto rifiutato; solo campo `model`, `prompt`, `stream`; nessun contesto automatico;
  5. trasparenza: anteprima mostra provider, modello, endpoint, testo in uscita; provenance con `requestId/providerId/providerKind/capability`;
  6. nessuna applicazione automatica: nessuna mutazione di stato canonico; risultato = bozza;
  7. provenienza e verifica umana: ogni esito richiede verifica umana; cancellazione esplicita.
- **Registrato:** Ollama locale (loopback), endpoint predefinito, consenso esplicito, anteprima del testo, remoto non eseguibile, nessuna credenziale, nessun traffico remoto.
- **Residui:** worktree `fix/cml-634b-r3-local-provider-closure-hardening` (`d9d0515`, già antenato di main) e `feat/cml-634b-local-remote-ai-provider-pilot` (`c37653f`, 8 commit superseded non su main). CML-638A raccomanda "CML-634B consolidamento" (classificare worktree, integrare, rapporto conclusivo). 153 test CML-634A+B PASS.

---

## 5.9 CML-635 — Ambiente istituzionale

Tutte le fasi sono **`NOT_STARTED`** (nessun documento dedicato, nessun commit). Esistono solo riferimenti forward in `docs/CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE.md` e `docs/foundation/CML_633J_*`.

| Fase | Stato reale | Dipendenze | Rischi | Ordine consigliato |
|------|-------------|------------|--------|--------------------|
| 635A — Workspace Identity and Institutional Context | `NOT_STARTED` | 633D (dominio institution), 634A | Identità/ruoli assenti → prodotto resta personale/locale | 1 |
| 635B — Workspace Roles and Permissions | `NOT_STARTED` | 635A | Nessun permesso → nessuna distinzione Docente/Dipartimento/Referente; blocco #4 CML-638A | 2 |
| 635C — Shared Institutional Repository and Synchronization | `NOT_STARTED` | **635A e 635B** (non avviabile prima) | Sincronizzazione senza identità/ruoli = ambigua; blocco #4 CML-638A | 3 |
| 635D — Institutional AI Governance and Provider Administration | `NOT_STARTED` | 635A/B, 634B | Governance IA assente; provider amministrati senza ruoli = insicuro | 4 |

> **Regola registrata:** 635C non è avviabile prima di 635A e 635B.

---

## 5.10 CML-636 — Produzione documentale

### CML-636A — Template Consolidation — `NOT_STARTED` (nessun verdetto esplicito)
- Nessun documento/verdetto autonomo: CML-636A compare solo come "CML-636A/B: template consolidation + validated preview" (specifica 636B, baseline 638A).
- **Aspetti ancora aperti:** template definitivi per UDA, programmazione, relazione, curricolo, verbale; configurazioni di layout; intestazioni; copertine; varianti documentali; consolidamento di `useTemplateEngine` (blocco #1 BLOCKING di CML-638A).
- CML-636B ha coperto solo il sotto-perimetro anteprima/validazione/export: **la consolidazione template resta aperta.**

### CML-636B — Canonical Document Preview & Print Export — `COMPLETE_LOCAL`
- **Baseline** `9d27c57` (`9d27c57a5097e1d0344488602f58bce8df8e42f4`);
- **Commit funzionale** `33eb4ec` (`feat(CML-636B): add canonical document preview and print export`);
- **Commit correttivo** `f2cae27` (`fix(CML-636B): stabilize preview validation and integration tests`);
- **HEAD finale** `f2cae27285a9b5a0099b470af708ca0978cb76f6`;
- Test CML-636B **98/98** (validator 27, rendering 43, UI 16, persistence 12);
- Regressioni CML-638B **13/13** (6+4+3);
- Suite completa **1955/1955**, **103 file di test**;
- TypeScript, build, Storybook e `git diff --check` **verdi**.

**Flusso end-to-end:**
```
UDA → documento canonico → persistenza → riapertura → versione → anteprima → validazione → stampa/PDF
```

**Decisioni di perimetro registrate:**
- **Unico renderer:** `renderDocument(document, version, options?)` in `src/domain/documents/rendering.ts:139` è l'unico produttore HTML;
- **Stesso HTML per anteprima e stampa:** `printCanonicalDocument(previewState.html, ...)` usa esattamente l'HTML dell'anteprima (nessuna seconda chiamata a `renderDocument`);
- **No download HTML** (rimosso "Scarica HTML"; formati approvati solo anteprima HTML + stampa/PDF via browser);
- **Archivio JSON storico preservato** ("Archivio JSON" legacy, indipendente da CML-636B);
- **No nuovi store / no nuova persistenza / no renderer parallelo** (riuso CML-638B `useCurriculumStore`/`documentArchive`);
- Archiviato = consultabile read-only ma export bloccato (`DOCUMENT_ARCHIVED`);
- Validazione export: `validateExportability()` in `src/domain/documents/exportValidator.ts:115` con messaggi deterministici; validità anteprima invalidata da `isPreviewStale()`/`PREVIEW_STALE`.

---

## 5.11 CML-637 — Base di conoscenza

**Stato reale: due binari distinti.**

1. **Binario "Trama — Curriculum Graph" (design only, non implementato):**
   - `CML-637` Product Blueprint (`TRAMA_PRODUCT_BLUEPRINT_READY_FOR_TAXONOMY_DESIGN`, `928b4dc`) e `CML-637A` Taxonomy Specification (`CML_637A_TAXONOMY_SPECIFICATION_DRAFT_REMOTE`, `678369d`) su ramo `origin/design/cml-637-trama-curriculum-graph`; **mai mergiati, assenti dal working tree**.
   - Fasi programma 637B–637L (dominio grafo, adattatore dati, viste, validazione docente): **`NOT_STARTED`**.
   - **Nota:** lo slot "637B = dominio canonico del grafo" del blueprint è stato di fatto riutilizzato come chiusura debito dipendenze Vite (v. sotto): le fasi grafo **non sono implementate**.

2. **Binario "base di conoscenza / infrastruttura":**
   - `CML-637A (infra)`: fix integrità repository dominio revision (`8015748`, su main) — infra, non Trama.
   - `CML-637B (eseguito)`: matrice compatibilità dipendenze + workflow test veloce (`CML_637B_CLOSED_LOCAL`, merged PR #15 `026542c`): override `vite@6.4.3` (Cell C), single Vite major, `test:fast` ~22s. **Verdetti:** `CML_637B_SINGLE_VITE_CONFIGURATION_STABILIZED_LOCAL`, `CML_637B_FAST_TEST_WORKFLOW_READY_LOCAL`, `CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX_COMPLETED_RECOMMENDED_CELL_C`.
   - CML-638A registra un **follow-up CML-637 "Fonti integrate nel flusso docente"** (integrazione fonti/volumi A11 nel flusso docente) come lavoro futuro.
   - CML-638B design esclude la base conoscenza dal proprio perimetro.

**Dipendenze registrate per una futura base di conoscenza completa:** CML-633 (dominio dati/provenienza), CML-635 (identità/ruoli), CML-634 (assistenza locale opzionale). **Requisiti per la base conoscenza** (da blueprint/taxonomy e dagli audit): fonti normative con provenienza, validità, applicabilità; aggiornamento; citazioni; uso nei suggerimenti. **Nessuno di questi è ancora produttivo.**

---

## 5.12 CML-638 — Percorso documentale produttivo

### CML-638A — System-Wide Product Readiness Baseline — `COMPLETE_REMOTE` (PR #17 `071129a`)
- `CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE_COMPLETE_LOCAL` → `MERGED_MAIN`.
- Decisione **D — "Correggere prima i blocchi end-to-end esistenti"** (`CML_638A_DECISION_D_FIX_END_TO_END_BLOCKERS`).
- Baseline `origin/main = 8d57017`; commit `f388736` (2026-08-01). Verifiche: `npm ci` OK, tsc OK, `test:fast` 8 file/273 test/39s PASS, build OK (dist ~1.17 MB).
- Blocchi: #1 A07 template engine **BLOCKING** (→ CML-636A/B), #4 CML-635 ruoli/repo condiviso **BLOCKING**, #2 output A07 SIGNIFICANT, #3 residui CML-634 SIGNIFICANT, #5 fonti A11 SIGNIFICANT, #5 validazione CML-631 SIGNIFICANT.

### CML-638B — Persistence + UI — `CONSOLIDATED_LOCAL`
- Persistenza: `e396e5f` (repository, reidratazione, recovery archivio corrotto, provenance preservata). UI: `4aa772c` (creazione canonica in `EsportazioniTab` da UDA salvata, dedup deterministico `Progettazione: <uda.id>`, auto-open). Consolidamento: `9dc3bb7` (UI cherry-picked su persistenza), record `4b72b10`.
- Verifica: persistenza 6/6, browser 4/4, UI 3/3; suite completa **1857/1857** al consolidamento; tsc/build/storybook/diff PASS.
- **Stato:** `CONSOLIDATED_LOCAL` — i commit NON sono antenati di `origin/main`; sono presenti sul ramo attuale `feat/cml-636b-canonical-document-preview-export` (via la sua catena) e sui rami 638B.

### Genealogia CML-638B → CML-636B

| Elemento | Commit |
|----------|--------|
| Base comune | `f5289703dbe1daa4bd09cb8e7cdb638aa0988186` |
| Persistenza originaria | `e396e5f` |
| UI originaria | `4aa772c` |
| UI consolidata | `9dc3bb7` |
| Consolidamento | `4b72b10` |
| Specifica CML-636B | `9d27c57` |
| Chiusura finale CML-636B | `f2cae27` |

**Il percorso produttivo completo prosegue ora fino alla stampa/PDF:** la catena CML-638B (UDA → documento canonico → persistenza → riapertura → versioni) è la base su cui CML-636B aggiunge anteprima → validazione → stampa/PDF. Con il HEAD attuale `f2cae27` la catena è completa end-to-end **localmente**.

---

## 6. Stato per macro-area

Le percentuali sono **stime gestionali**, non misure automatiche del codice.

| Macro-area | Stato | Avanzamento stimato | Evidenza | Rischio residuo |
|------------|-------|--------------------:|----------|-----------------|
| Dominio curricolare | Operativo localmente (dominio canonico persistito, non attivo nei flussi legacy) | 85% | CML-630E1/E2, CML-633B/C | Modalità `legacy-only`, dataset unico |
| Sistema documentale | Operativo localmente (documento canonico, versioni, renderer unico) | 85% | CML-633F, CML-638B, CML-636B | Template definitivi mancanti (636A) |
| Progettazione UDA | Operativo localmente | 80% | CML-633H, Teacher Workspace | Validazione reale assente |
| Percorso docente | Implementato ma congelato | 65% | CML-633I, CML-631 (frozen) | Non adottato, non validato |
| Anteprima e stampa | Operativo localmente | 90% | CML-636B (98/98, 1955/1955) | Solo print/PDF browser; DOCX/ODF futuri |
| Revisione e decisione | Operativo localmente (mai `approved`, decisione umana) | 80% | CML-633G | Adozione istituzionale assente |
| Identità istituzionale | Base dominiale presente, prodotto assente | 25% | CML-633D, CML-635A `NOT_STARTED` | Nessuna identità reale d'istituto |
| Ruoli | Assente | 5% | CML-635B `NOT_STARTED` | Nessun permesso |
| Repository condiviso | Assente | 0% | CML-635C `NOT_STARTED` | Sincronizzazione assente |
| IA opzionale | Architettura pronta, pilota locale gate-verificato, chiusura formale pendente | 70% | CML-634A, CML-634B `IMPLEMENTED_PENDING_FORMAL_CLOSURE` | Chiusura formale non registrata, worktree residue |
| Base di conoscenza | Parziale (seed fonti), non produttivo | 20% | CML-637 (design), 638A A11 PARZIALE | Fonti non integrate nel flusso docente |
| Validazione reale | Assente | 0% | CML-631F `NOT_EXECUTED` | Nessun docente reale ha validato il prodotto |

---

## 7. Capacità operative attuali

### Operativo localmente
- consultazione curricolare;
- progettazione UDA;
- documento canonico (da UDA / da revisione);
- persistenza locale;
- versioni;
- riapertura;
- anteprima;
- validazione;
- stampa/PDF.

### Architettura pronta ma funzione non implementata
- provider IA locale CML-634B (implementato e gate-verificato — `IMPLEMENTED_PENDING_FORMAL_CLOSURE`, chiusura formale da registrare).

### Non ancora produttivo
- identità istituzionale;
- ruoli e permessi;
- repository condiviso;
- sincronizzazione;
- governo istituzionale dell'IA;
- base di conoscenza completa;
- validazione reale multiutente.

---

## 8. Debito residuo

| # | Debito | Dettaglio | Stato |
|---|--------|-----------|-------|
| 1 | **Validazione docenti reali** | CML-631F `NOT_EXECUTED`; CML-631D simulata; pilota congelato | `REQUIRES_REAL_VALIDATION` |
| 2 | **Genealogia Git e branch storici** | 631E/G/H/I non mergiati; 632/633 interamente locali; 633E header con branch/baseline copiato da 633D; doppio commit 632H (`ee647be`/`b8ea0c2`); rami 634B residui | Da classificare/ripulire |
| 3 | **Worktree residue** | `fix/cml-634b-r3...` (su main), `feat/cml-634b-local-remote-ai-provider-pilot` (superseded, non su main); worktree storici CML-633 (non elencati in questo documento) | Da classificare |
| 4 | **Documentazione dispersa** | Verdetto CML-634A aggiornato solo in post-acceptance record (doc committato stale); AGENTS.md riga 630F2 stale; roadmap 632 riga 633 stale; roadmap 633 lettering divergente dai contenuti; roadmap sprint-based (`12_IMPLEMENTATION_ROADMAP.md`) pre-rifondazione | Da riallineare |
| 5 | **Differenza strumento locale / ambiente istituzionale** | Prodotto personale/locale; identità, ruoli, repo condiviso assenti (blocco #4 CML-638A) | Blocco di prodotto |
| 6 | **Configurazione istituzionale** | Base CML-633D presente ma nessun istituto reale configurato nel flusso produttivo; identità neutra `'Istituto non configurato'` | Da validare sul campo |
| 7 | **Accessibilità da verificare sul campo** | CML-638A: accessibilità/responsive "NON VERIFICATO" (limite CLI) | Da verificare in browser |
| 8 | **Test browser e scenari reali** | `test:full` non eseguito in 638A; verifica browser manuale solo in 636B su dev server | Da estendere |
| 9 | **Stato CML-636A** | Template consolidati (UDA/programmazione/relazione/curricolo/verbale) non definiti; nessun verdetto esplicito | Aperto |
| 10 | **Pubblicazione e distribuzione** | Baseline `f2cae27` non pubblicata; niente push/merge/PR; dist/storybook-build artefatti locali | Da decidere |
| 11 | **Chiusura formale CML-634B** | Gates PASS ma nessun verdetto conclusivo registrato → stato `IMPLEMENTED_PENDING_FORMAL_CLOSURE` | Da registrare |
| 12 | **Suite completa lenta** | `CML_TEST_SUITE_PERFORMANCE` (~4–6 min test:unit/full) | Debito separato |

---

## 9. Priorità consigliate

Ordine proposto (salvo evidenze contrarie nei documenti; coerente con la decisione CML-638A-D "correggere prima i blocchi end-to-end" e con le regole WORKING_PROTOCOL):

### 1. Consolidamento ufficiale roadmap e baseline
- **Valore:** governance e allineamento tra chi sviluppa e chi governa; unico punto di verità.
- **Dipendenze:** nessuna.
- **Rischio:** basso.
- **Criterio di ingresso:** questo documento approvato.
- **Criterio di uscita:** verdetto `CML_MASTER_ROADMAP_STATUS_READY_FOR_APPROVAL` e baseline `f2cae27` formalizzata.

### 2. CML-631F — validazione reale con docenti
- **Valore:** unico modo per sapere se il prodotto è utile e usabile (criteri C1/C9 del protocollo 631F).
- **Dipendenze:** CML-631E (pronto), baseline 04 verificata (19/19); nessuna dipendenza da 635.
- **Rischio:** il prodotto può risultare non idoneo alla validazione (pilot congelato).
- **Criterio di ingresso:** baseline 04 e protocollo/checklist/griglie pronti; almeno 3–5 docenti reali.
- **Criterio di uscita:** sessioni T01–T05 eseguite; decisione estendere/correggere/bloccare.

### 3. CML-635A — identità e contesto istituzionale
- **Valore:** passa da prodotto personale a prodotto istituzionale (blocco #4 CML-638A).
- **Dipendenze:** CML-633D (dominio institution presente); 634A/B come contorno.
- **Rischio:** onboarding e configurazione per istituti reali complessi.
- **Criterio di ingresso:** 631F avviata o conclusa; consenso governance.
- **Criterio di uscita:** profilo istituto configurabile e persistito nel flusso produttivo.

### 4. CML-635B — ruoli e permessi
- **Valore:** distinzione Docente/Dipartimento/Referente; prerequisito per revisione istituzionale.
- **Dipendenze:** 635A.
- **Rischio:** modelli di permesso non coperti dal dominio corrente.
- **Criterio di ingresso:** 635A operativa.
- **Criterio di uscita:** ruoli e permessi minimi applicati alle superfici canoniche.

### 5. CML-634B — pilota Ollama locale (chiusura)
- **Valore:** sblocca l'assistenza locale opzionale già gate-verificata.
- **Dipendenze:** 634A; classificazione worktree residue.
- **Rischio:** residui non consolidati (lavoro su rami non su main).
- **Criterio di ingresso:** worktree classificate.
- **Criterio di uscita:** rapporto conclusivo CML-634B + flusso IA locale end-to-end su main.

### 6. CML-637A/B — base di conoscenza
- **Valore:** fonti integrate nel flusso docente (follow-up CML-637 di 638A).
- **Dipendenze:** 633 (provenienza/dominio), 635 (identità), 634 (assistenza).
- **Rischio:** scala del blueprint Trama (637B–L) non commisurata al perimetro corrente.
- **Criterio di ingresso:** 635A/B almeno parziali.
- **Criterio di uscita:** fonti con provenienza/validità/applicabilità consultabili e citabili.

### 7. CML-635C — repository e sincronizzazione
- **Valore:** collaborazione reale dipartimentale; elimina il blocco #4 CML-638A.
- **Dipendenze:** **635A e 635B obbligatorie** (non avviabile prima).
- **Rischio:** sync multiutente senza identità/ruoli = ambigua.
- **Criterio di ingresso:** 635A/B operative.
- **Criterio di uscita:** repository condiviso locale funzionante.

### 8. CML-635D — governo istituzionale IA
- **Valore:** amministrazione dei provider IA con ruoli e governance.
- **Dipendenze:** 635A/B, 634B.
- **Rischio:** sicurezza e conformità.
- **Criterio di ingresso:** 635A/B + 634B chiuse.
- **Criterio di uscita:** provider amministrati e governati a livello istituto.

---

## 10. Decisioni da sottoporre ad approvazione

| ID | Decisione | Opzioni | Raccomandazione | Impatto |
|----|-----------|---------|-----------------|---------|
| D-1 | Validazione reale prima o dopo 635A | (a) 631F prima di 635A; (b) 635A prima di 631F; (c) in parallelo | **(a) 631F prima**: il prodotto è pronto tecnicamente; la validazione reale decide se estendere/correggere/bloccare prima di investire in identità istituzionale | Fase 2 vs 3; ordine di investimento |
| D-2 | Priorità tra 634B e 635A | (a) chiudere 634B prima; (b) 635A prima; (c) 634B in background | **(b) 635A prima** (chiusura 634B in parallelo): il blocco istituzionale è BLOCKING, l'IA è opzionale | Capacità operative |
| D-3 | Stato definitivo di 636A | (a) chiudere come assorbita in 636B; (b) mantenere aperta come template consolidation; (c) rinominare 636A=template | **(b) mantenere aperta**: i template definitivi mancano e sono il blocco #1 CML-638A | Prossima fase documentale |
| D-4 | Politica sui branch storici | (a) merge batch CML-631E/G/H/I + 632 + 633 su main; (b) archiviare con tag; (c) chiudere solo i merged | **(a) merge batch controllato** (nessun refactoring): rende visibile il lavoro 633 già verdecchiato localmente | Stato pubblicazione |
| D-5 | Scelta della baseline da pubblicare | (a) `f2cae27` (CML-636B complete local); (b) `origin/main` `f528970`; (c) nuova baseline di integrazione | **(a) `f2cae27`**: baseline valida corrente con suite 1955/1955 e catena documento→anteprima→PDF completa | Punto di verità ufficiale |
| D-6 | Tempistica del repository condiviso | (a) dopo ruoli; (b) dopo validazione; (c) parallelo a ruoli | **(a) dopo ruoli**: 635C non avviabile prima di 635A/B | Sequenza 635 |
| D-7 | Ruolo della base di conoscenza | (a) strumento docente integrato; (b) archivio tecnico; (c) motore di suggerimenti | **(a) strumento docente integrato** (per "Il docente potrà…" e follow-up CML-637) | Roadmap 637 |
| D-8 | Strategia di distribuzione locale/istituzionale | (a) single-file locale PWA; (b) installazione per istituto; (c) server condiviso | **(a) single-file locale** per ora (arco CML-622/633J); istituzionale dopo 635 | Deploy |

---

## 11. Prossima fase proposta

**`CML-631F — Real Teacher Validation of the Guided and Canonical Document Workflow`** — `REQUIRES_REAL_VALIDATION`.

**Ambito minimo:**
- 3–5 docenti reali;
- nessun dato personale degli studenti;
- percorso UDA → documento → anteprima → PDF;
- osservazione;
- errori;
- comprensione;
- tempi;
- qualità percepita;
- utilità;
- criticità;
- decisione finale: estendere, correggere o bloccare.

> **Nota:** CML-631F NON viene implementata durante questa attività documentale.

---

## 12. Registro delle baseline

Solo commit verificati.

| Data | Fase | Branch | Commit | Verdetto | Baseline successiva |
|------|------|--------|--------|----------|---------------------|
| 2026-07-27 | CML-633J | `feat/cml-633j-product-integration-migration-closure` | `2f70139` | `CML_633J_PRODUCT_INTEGRATION_MIGRATION_CLOSURE_COMPLETE` | `1f74421` (docs 633J) |
| 2026-07-29 | CML-634A | — | `0021a8b` | `CML_634A_OPTIONAL_AI_PROVIDER_BOUNDARY_VERIFIED_AND_CLOSED_LOCAL` (post-acceptance) | catena 634B su `main` |
| 2026-08-01 | CML-638B | `feat/cml-638b-canonical-path-consolidation` | `9dc3bb7` (record `4b72b10`) | `CML_638B_CANONICAL_DOCUMENT_PATH_CONSOLIDATED_LOCAL` | `9d27c57` (specifica 636B) |
| 2026-08-02 | CML-636B | `feat/cml-636b-canonical-document-preview-export` | `f2cae27285a9b5a0099b470af708ca0978cb76f6` | `CML_636B_CANONICAL_DOCUMENT_PREVIEW_EXPORT_COMPLETE_LOCAL` | **corrente (da pubblicare)** |

---

## Verdetto

**`CML_MASTER_ROADMAP_STATUS_READY_FOR_APPROVAL`** — documento completo e coerente con le evidenze documentali e git verificate.
