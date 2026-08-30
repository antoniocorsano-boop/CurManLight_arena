# CurManLight Arena — Canonical Maturity Audit

Status: CANONICAL EXECUTION CHECKPOINT  
Date: 2026-08-30  
Audited baseline: `main@873f3d6967955aee8e054949196026fde4d34c40`  
Maturity classification: **M3.3 — ADVANCED CONTROLLED BETA**

## 1. Purpose and resumption rule

This document is the canonical Arena-specific maturity checkpoint after the Knowledge Experience KX-4/KX-4C closure and the mobile source-verification remediation.

Future Arena sessions must read this document before adding features, redesigning surfaces or changing the execution order. Conversation summaries and temporary PR descriptions may add evidence, but they do not override this checkpoint.

**Resumption rule:** resume from the first incomplete item in section 12 unless a newer explicit governing decision supersedes this document.

This audit does not replace the Arena ↔ Docente OS governed ownership boundary. Arena remains the authority for institutional curriculum, applicability, revision, institutional decision boundaries, curricular provenance and controlled exports. Teacher operational planning, lesson execution and broad UDA authoring remain owned by Docente OS.

## 2. Executive verdict

Arena is no longer blocked primarily by missing functionality. Its strongest parts — curriculum domain, applicability, revision semantics, institutional authority, provenance rules, same-SHA release discipline and controlled Beta runtime — are already advanced.

The principal maturity gap is now **product convergence**:

> the canonical Arena product must emerge definitively from the remaining overlap between the new governed domain, legacy UI/state paths and surfaces that now belong outside the Arena product boundary.

Do not add broad new Arena features before this convergence tranche is closed.

## 3. Canonical Arena product journey

The governing institutional journey is:

`Context → Applicability → Curriculum → Sources/Evidence → Proposal → Review → Institutional Decision → Baseline → Export/Handoff`

Arena must answer:

- which curriculum applies;
- which requirements are authoritative, provisional or transitional;
- where content comes from;
- what is proposed to change;
- who has review/decision authority;
- what decision was recorded;
- what resulting baseline may be handed downstream.

Arena must not become the teacher's operational classroom workspace.

## 4. Canonical surface target

The target product should converge to seven first-class surfaces:

1. **Home**
2. **Curricolo**
   - context and applicability;
   - curriculum contents;
   - transition/change comparison.
3. **Fonti**
   - source registry;
   - provenance;
   - applicability;
   - verification/authority state.
4. **Revisione**
   - proposal;
   - version;
   - evidence;
   - review;
   - institutional decision.
5. **Conoscenza**
   - search/ask;
   - local sources;
   - key terms;
   - relations only when user-meaningful and evidence-safe.
6. **Documenti / Handoff**
7. **Guida / Supporto**

Authentication/workspace context remains an enabling system surface, not a competing product area.

The following are not first-class Arena product surfaces in the target model:

- `Processo` as an autonomous workflow view;
- broad teacher UDA authoring;
- classroom execution;
- `certificazione-pa` as a route alias without a distinct Human Task;
- technical graph/agent surfaces presented as product concepts.

## 5. Surface maturity scorecard

| Surface | Score / 5 | Canonical status |
| --- | ---: | --- |
| Home | 4.2 | PRESERVE / MINOR HVA |
| Curricolo — Home | 3.5 | CONSOLIDATE |
| Curricolo — Struttura | 3.2 | CONSOLIDATE / REDUCE LEGACY DENSITY |
| Curricolo — Confronto nel tempo | 3.3 | CONSOLIDATE SEMANTICS |
| Curricolo — Aggiornamento/Popolamento | 2.4 | REFRAME AROUND HUMAN TASK |
| Revisione | 3.7 | STRONG DOMAIN / DUAL UI MODEL REMAINS |
| Fonti | 2.0 | HIGHEST PRODUCT GAP |
| Conoscenza | 3.9 | KX CORE STRONG / PARTIAL BY DESIGN |
| Documenti / Export | 4.3 | PRESERVE / HVA + A11Y |
| Progettazione/UDA | 2.5 as Arena | MOVE OPERATIONAL AUTHORING TO DOCENTE OS |
| Processo | 2.1 | RETIRE / ABSORB |
| Controlli/checklist (`certificazione-pa`) | 1.5 | REMOVE OR DEFINE REAL TASK/ROUTE |
| Guida | 2.5 | REWRITE AFTER SURFACE FREEZE |
| Navigation / IA | 2.7 | STRUCTURAL BLOCKER TO M4 |

## 6. Findings

### F1 — Routing and view model are not yet one canonical model — MAJOR

The internal `AppTab` contract still includes legacy/transition states that do not map cleanly to autonomous routes or rendered surfaces.

Known mismatches include:

- `processo → /planning → progetta-annuale` on re-entry;
- `certificazione-pa → /documents → esportazioni` on re-entry;
- `progetta-evidenze` exists in the tab contract without an equivalent first-class rendered surface.

**Required closure:** one canonical mapping `Human Task → Surface → Route → Authority context` with no phantom tab and no ambiguous route alias.

### F2 — `/fonti` is not yet the canonical Source Registry — CRITICAL PRODUCT GAP

Navigation and curriculum copy tell the user to verify sources, applicability and state. The current `/fonti` surface mainly contains general curriculum sections such as Premessa, Riforma IN 2025, Obiettivi formativi and Livelli di valutazione.

It therefore does not yet answer the core evidence questions:

- source identity;
- source type;
- source version;
- provenance;
- verification state;
- authority state;
- applicability;
- linked curriculum content.

**Required closure:** turn `/fonti` into the institutional/curricular source registry, reusing rather than duplicating Knowledge source identity and verification semantics.

### F3 — Revision still exposes two semantic models — MAJOR

Arena now has a structured revision domain (`RevisionProposal`, versions, lifecycle, event history and institutional decision boundary), but the same user flow still relies on the older `decisions/customTexts` semantics (`approved`, `rejected`, `custom`).

This is acceptable as migration infrastructure, not as final product semantics.

**Required closure:** make the structured revision archive the only presentation source of truth. Legacy decisions/custom text may remain only as migration/import adapters until retired.

### F4 — Browser automation may see UI branches that humans do not — MAJOR ASSURANCE GAP

Some product code branches on `navigator.webdriver` and renders controls/layout specifically for automated sessions.

**Canonical assurance rule:**

`AUTOMATION MUST OBSERVE, NEVER ALTER, THE USER EXPERIENCE.`

**Required closure:** remove product-UX branching based on browser automation identity. Tests may instrument evidence but must interact with the same product surface used by humans.

### F5 — Curriculum presentation remains partly legacy-dense — MODERATE

Curriculum copy is epistemically safer than earlier versions, but user-facing labels such as `Vista Strutturata (Albero)`, `Raccordo Diacronico (Mappa)` and `Integrazione & Popolamento` remain more implementation/discipline-centric than task-centric.

**Target language:**

- Contesto e applicabilità;
- Contenuti;
- Cosa cambia;
- Aggiorna la copia di lavoro.

Technical terminology may remain under progressive disclosure.

### F6 — Curriculum updating/population lacks one dominant Human Task — MAJOR UX GAP

The current area combines AI generation, CSV import, baseline reset, KB generation and agent setup.

The canonical task should be:

> **Aggiungi o aggiorna contenuti del curricolo.**

Possible methods are subordinate choices:

`source → structured import → assistive proposal → preview → provenance → human review → proposal`

No assistant-generated output may appear to bypass source/provenance/review boundaries.

### F7 — Broad UDA operational authoring is outside the final Arena boundary — BOUNDARY CLEANUP

Arena may retain institutional curricular requirements, annual curricular framework, coverage constraints and handoff contracts.

Teacher operational UDA authoring, sequencing, classroom activity and lesson execution belong to Docente OS.

**Required closure:** split reusable institutional UDA/framework constraints from teacher operational authoring and move/retire the latter from Arena's primary product surface.

### F8 — `Processo` duplicates revision/governance concepts — RETIRE/ABSORB

`ProcessoTab` still visualizes a six-role workflow and `.cml` merge process while the modern revision domain already represents proposal, review, authority and decision states more precisely.

**Required closure:** absorb any still-useful import/history/summary functions into Revision/History/Export and retire `Processo` as a first-class surface.

### F9 — `certificazione-pa` is a nominal surface without stable route identity — MAJOR IA GAP

The sidebar exposes `Controlli e checklist`, but routing maps the state into `/documents`, which re-enters as `esportazioni`.

**Required closure:** either define a real Beta-critical Human Task with its own route/surface or remove the navigation item.

### F10 — Guide content is stale relative to the current product boundary — MODERATE

The Guide still describes legacy process and broad Arena UDA authoring as primary capabilities.

**Required closure:** do not patch the Guide incrementally. Regenerate/rewrite it after the canonical surface freeze.

### F11 — Curriculum persistence has not yet converged to the productive domain — MAJOR TECHNICAL DEBT

The repository still records `CURRICULUM_PERSISTENCE_MODE = legacy-only` even though productive curriculum domain contracts and IndexedDB v2 exist.

**Target migration sequence:**

`legacy-only → dual-read → new-domain-primary read → governed write migration → canonical persistence → legacy retirement`

Do not switch source-of-truth without migration evidence and rollback.

### F12 — Accessibility acceptance is still a separate open gate — BLOCKER TO M4

Recent KX work has improved touch, focus and viewport behavior, but this does not constitute complete WCAG 2.2 A/AA acceptance.

Critical surfaces still require current evidence for:

- keyboard-only journey;
- focus order and visible focus;
- screen-reader semantics/status announcements;
- reflow/zoom;
- contrast;
- touch targets;
- error/recovery announcements;
- reduced-motion behavior where relevant;
- manual desktop/mobile inspection.

### F13 — Repository enforcement governance remains open — BLOCKER TO PRODUCTION READINESS

GitHub issue `#105 — GOV-01` requires repository-hosting enforcement for `main`: PR-only promotion, required checks, candidate invalidation when SHA changes and documented bypass authority.

The current procedural discipline is strong but must also be enforced by repository rules before production-readiness claims.

### F14 — Repository evidence/PR hygiene needs cleanup — MODERATE

Historical/superseded draft evidence and stabilization PRs remain visible and may be misread as active candidates by future agents.

**Required closure:** classify each as `MERGE`, `SUPERSEDED/CLOSE`, `ARCHIVE/HISTORY` or `ACTIVE`, preserving evidence without leaving ambiguous promotion candidates.

## 7. What must not be reopened without a concrete defect

The following foundations are sufficiently mature and should not be redesigned speculatively:

- curriculum domain identity/version/applicability contracts;
- IN2025 transition resolver;
- proposal/version/decision separation;
- institutional decision authority and fail-closed capability boundary;
- provenance/auditability contracts;
- Arena ↔ Docente OS product boundary;
- versioned planning handoff semantics;
- same-SHA CI/release/deploy verification discipline;
- Knowledge local-source authority rule: local verified ≠ normative/institutional;
- explicit human confirmation before consequential promotion.

## 8. Current strong evidence

At this checkpoint:

- canonical `main`: `873f3d6967955aee8e054949196026fde4d34c40`;
- PR #119 source-verification mobile visibility remediation is merged;
- post-merge Product CI / S3 browser evidence / Beta E2E were PASS on the same main SHA;
- Deploy Arena Beta #45 published the same SHA;
- Live Beta Assistant Browser Audit #19 was PASS on the deployed runtime;
- actual human mobile acceptance confirmed `Apri e verifica` now reveals the verification task correctly;
- KX source verification is therefore accepted for this release-specific human task.

This does **not** imply complete Arena G5/G6 closure for all critical tasks.

## 9. Updated maturity scorecard

| Dimension | Score / 5 |
| --- | ---: |
| Curriculum domain | 4.5 |
| Applicability / transition | 4.6 |
| Revision domain | 4.3 |
| Institutional authority | 4.7 |
| Technical provenance / auditability | 4.5 |
| Provenance in ordinary UX | 3.0 |
| Knowledge Experience | 3.9 |
| Export / handoff | 4.3 |
| CI / same-SHA release discipline | 4.7 |
| Beta runtime | 4.3 |
| Human interaction — validated surfaces | 3.6 |
| Navigation / information architecture | 2.7 |
| Persistence convergence | 3.0 |
| Accessibility | 2.6 |
| Repository / product hygiene | 2.8 |
| Operations / production readiness | 3.2 |

Overall classification remains **M3.3 — ADVANCED CONTROLLED BETA**.

## 10. M4 promotion rule

Arena may not be classified `M4 — CONTROLLED PRODUCTION PILOT` until all of the following are true:

1. canonical surfaces/routes are frozen and coherent;
2. `/fonti` is a real source/provenance/applicability registry;
3. Revision has one presentation source of truth;
4. automated tests observe the same UI as humans;
5. Arena/Docente OS authoring boundary is reflected in the UI;
6. productive curriculum persistence is safely activated or the legacy mode is explicitly accepted as an M4 limitation;
7. full critical-task HVA is PASS on immutable deployed release(s);
8. accessibility acceptance is PASS;
9. recovery/security/privacy/operations gates are current;
10. repository governance enforcement is verified;
11. obsolete/superseded PR/evidence state is cleaned up.

No weighted score overrides one failed blocker.

## 11. Canonical backlog toward M4

### A1 — Canonical Surface Freeze

Freeze the seven target surfaces and `Human Task → route → authority` map.

**Exit:** `ARENA_CANONICAL_SURFACES_FROZEN`

### A2 — Routing Consolidation

Remove phantom tabs and ambiguous route aliases; preserve only deliberate backward-readable deep links.

**Exit:** `ARENA_ROUTING_CANONICAL`

### A3 — Sources Registry

Transform `/fonti` into the canonical Source Registry and connect it to Curriculum and Knowledge without duplicate authority state.

**Exit:** `ARENA_SOURCE_REGISTRY_CANONICAL`

### A4 — Revision Single Source of Truth

Make structured revision archive the sole user-facing revision model; migrate/retire legacy decision presentation.

**Exit:** `ARENA_REVISION_PRESENTATION_CANONICAL`

### A5 — Automation/User UI Parity

Remove `navigator.webdriver` product branching and prove critical browser audits against human-identical UI.

**Exit:** `ARENA_BROWSER_HUMAN_PARITY_PASS`

### A6 — Arena / Docente OS Surface Boundary

Remove broad teacher operational authoring from Arena primary surfaces while preserving institutional framework/requirements/handoff.

**Exit:** `ARENA_DOS_UI_BOUNDARY_PASS`

### A7 — Persistence Activation

Advance productive curriculum domain persistence through a governed migration with rollback evidence.

**Exit:** `ARENA_CANONICAL_PERSISTENCE_ACTIVE`

### A8 — Full G5 HVA

Human-test the whole critical journey on real Beta, desktop and mobile, including empty/loading/success/blocked/error/recovery states.

**Exit:** `BETA_HIA_PASS`

### A9 — G6 Accessibility

Complete automated and manual WCAG 2.2 A/AA acceptance for critical routes.

**Exit:** `BETA_ACCESSIBILITY_PASS`

### A10 — Operations / Governance Closure

Close repository enforcement, recovery rehearsal, security/privacy, known-issues/incident loop and stale PR/evidence cleanup.

**Exit:** `ARENA_M4_PRECONDITIONS_PASS`

## 12. Execution order and current next action

Execute in this order unless a new explicit canonical decision changes it:

`A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9 → A10 → M4 decision`

Parallel work is allowed only when it does not alter the same authority/state boundary and does not create a second implementation of a canonical surface.

### Current next action

**A1 — Canonical Surface Freeze**

The first implementation tranche after this checkpoint should be architecture/contract + routing inventory only. It should not add new broad functionality.

A1 must produce:

- authoritative list of canonical Arena surfaces;
- Human Task mapping for each surface;
- route mapping;
- authority context;
- KEEP / CONSOLIDATE / ABSORB / MOVE-TO-DOCENTE-OS / RETIRE classification for every current AppTab and navigation item;
- explicit compatibility policy for legacy deep links.

## 13. Session checklist

At the beginning of a future Arena session:

1. read this file;
2. verify live `main` SHA;
3. check whether a newer maturity/governance decision exists;
4. identify the first incomplete A-item in section 11;
5. inspect any active PR for that item and verify its exact head SHA;
6. do not reopen completed foundations unless a reproducible finding requires it;
7. preserve human authority, evidence provenance and Arena/Docente OS boundary;
8. use same-SHA validation before merge/deploy;
9. treat actual HVA as separate from automated browser evidence.

## 14. Canonical maturity statement

**CurManLight Arena is M3.3 — ADVANCED CONTROLLED BETA.**

The next maturity gain does not come from adding features. It comes from canonical surface convergence, source/provenance productization, revision state convergence, test/user parity, boundary cleanup, accessibility and operational closure.
