# CurManLight Arena — Canonical Maturity Audit

Status: CANONICAL MATURITY CHECKPOINT / NON-AUTHORIZING BACKLOG  
Date: 2026-08-30  
Audited baseline: `main@873f3d6967955aee8e054949196026fde4d34c40`  
Maturity classification: **M3.3 — ADVANCED CONTROLLED BETA**

## 1. Purpose and governance precedence

This document records the Arena-specific maturity assessment after KX-4/KX-4C and the mobile source-verification remediation.

It is a durable checkpoint for future sessions, but **it does not replace or reorder** the execution sequence in `INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`, `AGENTS.md` or `docs/WORKING_PROTOCOL.md`.

Governance precedence is therefore:

1. explicit current architecture/governance decisions;
2. `INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md` for the Arena ↔ Docente OS execution order and shared boundary;
3. `AGENTS.md` and `docs/WORKING_PROTOCOL.md` for repository operating constraints;
4. this maturity audit for findings, target state and future backlog.

**Resumption rule:** at the beginning of a future Arena session, read this audit, verify live `main`, then verify the currently authorized execution phase in the governed memory. Work may proceed only on an audit item that is compatible with that authorized phase. A later audit item is not authorization to skip an earlier governed gate.

Arena remains the authority for institutional curriculum, applicability, revision, institutional decision boundaries, curricular provenance and controlled exports. Teacher operational planning, lesson execution and broad UDA authoring remain owned by Docente OS.

## 2. Executive verdict

Arena is no longer blocked primarily by missing functionality. Its strongest parts — curriculum domain, applicability, revision semantics, institutional authority, provenance rules, same-SHA release discipline and controlled Beta runtime — are already advanced.

The principal maturity gap is now **product convergence**:

> the canonical Arena product must emerge definitively from the remaining overlap between the new governed domain, legacy UI/state paths and surfaces that now belong outside the Arena product boundary.

This finding does not authorize broad product restructuring while Arena S3 human validation is still governed as the active phase.

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

## 4. Target surface model

The product should eventually converge to seven first-class surfaces:

1. **Home**
2. **Curricolo** — context/applicability, contents, transition/change comparison
3. **Fonti** — source registry, provenance, applicability, verification/authority state
4. **Revisione** — proposal, version, evidence, review, institutional decision
5. **Conoscenza** — search/ask, local sources, key terms, evidence-safe relations
6. **Documenti / Handoff**
7. **Guida / Supporto**

Authentication/workspace context remains an enabling system surface, not a competing product area.

The following are not first-class Arena product surfaces in the target model:

- `Processo` as an autonomous workflow view;
- broad teacher UDA authoring;
- classroom execution;
- `certificazione-pa` as a route alias without a distinct Human Task;
- technical graph/agent surfaces presented as product concepts.

This target is a maturity direction, not permission to change frozen routing or product architecture without the required Architecture Decision.

## 5. Surface maturity scorecard

| Surface | Score / 5 | Maturity interpretation |
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
| Progettazione/UDA | 2.5 as Arena | OPERATIONAL AUTHORING BELONGS TO DOCENTE OS |
| Processo | 2.1 | CANDIDATE ABSORB/RETIRE AFTER AUTHORIZED DECISION |
| Controlli/checklist (`certificazione-pa`) | 1.5 | REQUIRES REAL TASK OR REMOVAL DECISION |
| Guida | 2.5 | REWRITE AFTER SURFACE FREEZE |
| Navigation / IA | 2.7 | STRUCTURAL MATURITY GAP |

## 6. Findings

### F1 — Routing and view model are not one canonical model — MAJOR

The internal `AppTab` contract contains states that do not map cleanly to autonomous routes or rendered surfaces.

Examples:

- `processo → /planning → progetta-annuale` on re-entry;
- `certificazione-pa → /documents → esportazioni` on re-entry;
- `progetta-evidenze` exists in the tab contract without an equivalent first-class rendered surface.

**Required closure state:** one canonical mapping `Human Task → Surface → Route → Authority context` with no phantom tab and no ambiguous route alias.

**Governance constraint:** this finding authorizes inventory and Architecture Decision preparation only. `docs/WORKING_PROTOCOL.md` routing freeze remains binding until a new explicit Architecture Decision authorizes route changes.

### F2 — `/fonti` is not yet the canonical Source Registry — CRITICAL PRODUCT GAP

Navigation and curriculum copy tell the user to verify sources, applicability and state. The current `/fonti` surface mainly contains general curriculum sections such as Premessa, Riforma IN 2025, Obiettivi formativi and Livelli di valutazione.

It does not yet answer the core evidence questions:

- source identity;
- source type/version;
- provenance;
- verification state;
- authority state;
- applicability;
- linked curriculum content.

**Required closure state:** `/fonti` becomes the institutional/curricular source registry, reusing rather than duplicating Knowledge source identity and verification semantics.

### F3 — Revision still exposes two semantic models — MAJOR

Arena has a structured revision domain (`RevisionProposal`, versions, lifecycle, event history and institutional decision boundary), but the same user flow still relies on older `decisions/customTexts` semantics (`approved`, `rejected`, `custom`).

**Required closure state:** structured revision archive is the only user-facing revision source of truth; legacy decisions/custom text survive only as migration/import adapters until retired.

### F4 — Browser automation may see UI branches that humans do not — MAJOR ASSURANCE GAP

Some product code branches on `navigator.webdriver` and renders controls/layout specifically for automated sessions.

**Canonical assurance rule:**

`AUTOMATION MUST OBSERVE, NEVER ALTER, THE USER EXPERIENCE.`

**Required closure state:** no product-UX branching based on browser automation identity; tests may instrument evidence but interact with the same surface humans use.

### F5 — Curriculum presentation remains partly legacy-dense — MODERATE

Labels such as `Vista Strutturata (Albero)`, `Raccordo Diacronico (Mappa)` and `Integrazione & Popolamento` remain more implementation/discipline-centric than task-centric.

Target language direction:

- Contesto e applicabilità;
- Contenuti;
- Cosa cambia;
- Aggiorna la copia di lavoro.

### F6 — Curriculum updating/population lacks one dominant Human Task — MAJOR UX GAP

The area combines AI generation, CSV import, baseline reset, KB generation and agent setup.

The dominant task should eventually be:

> **Aggiungi o aggiorna contenuti del curricolo.**

Methods remain subordinate: source → structured import → assistive proposal → preview → provenance → human review → proposal.

### F7 — Broad UDA operational authoring is outside the final Arena boundary — BOUNDARY CLEANUP

Arena may retain institutional curricular requirements, annual curricular framework, coverage constraints and handoff contracts. Teacher operational UDA authoring, sequencing, classroom activity and lesson execution belong to Docente OS.

### F8 — `Processo` duplicates revision/governance concepts — CONSOLIDATION CANDIDATE

`ProcessoTab` visualizes a six-role workflow and `.cml` merge process while the modern revision domain represents proposal, review, authority and decision states more precisely.

Target direction: preserve still-useful import/history/summary capabilities, but avoid a second governance model.

### F9 — `certificazione-pa` has no stable route identity — MAJOR IA GAP

The sidebar exposes `Controlli e checklist`, but routing maps the state into `/documents`, which re-enters as `esportazioni`.

Target direction: either define a real Beta-critical Human Task with a distinct surface or remove the nominal item after the required architecture decision.

### F10 — Guide content is stale relative to the current boundary — MODERATE

The Guide still describes legacy process and broad Arena UDA authoring as primary capabilities. Rewrite after canonical surface decisions, not incrementally before them.

### F11 — Curriculum persistence has not converged to the productive domain — MAJOR TECHNICAL DEBT

The repository still records `CURRICULUM_PERSISTENCE_MODE = legacy-only` while productive curriculum domain contracts and IndexedDB v2 exist.

Target migration direction:

`legacy-only → dual-read → new-domain-primary read → governed write migration → canonical persistence → legacy retirement`

No source-of-truth change is authorized without migration evidence, rollback and compatibility with the governed execution phase.

### F12 — Accessibility acceptance remains a separate open gate — BLOCKER TO M4

Recent KX work improved touch, focus and viewport behavior, but complete WCAG 2.2 A/AA acceptance still requires current evidence for keyboard, focus order, screen-reader semantics, reflow/zoom, contrast, touch targets, error/recovery announcements and manual desktop/mobile inspection.

### F13 — Repository enforcement governance remains open — BLOCKER TO PRODUCTION READINESS

GitHub issue `#105 — GOV-01` requires hosting-level enforcement for `main`: PR-only promotion, required checks, candidate invalidation when SHA changes and documented bypass authority.

### F14 — Repository evidence/PR hygiene needs cleanup — MODERATE

Historical/superseded draft evidence and stabilization PRs remain visible and may be misread as active candidates. Each should eventually be classified `MERGE`, `SUPERSEDED/CLOSE`, `ARCHIVE/HISTORY` or `ACTIVE`.

## 7. Foundations not to reopen speculatively

Do not redesign without a concrete reproducible defect:

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
- PR #119 source-verification mobile visibility remediation merged;
- post-merge Product CI / S3 browser evidence / Beta E2E PASS on the same main SHA;
- Deploy Arena Beta #45 published that same SHA;
- Live Beta Assistant Browser Audit #19 PASS on the deployed runtime;
- human mobile acceptance confirmed `Apri e verifica` reveals the verification task correctly;
- KX source verification is therefore accepted for this release-specific task.

This does **not** imply complete Arena G5/G6 closure for all frozen critical tasks.

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

1. governed S3 human validation is formally closed before later stabilization phases are promoted;
2. canonical surfaces/routes are frozen and coherent under an authorized Architecture Decision where routing changes are required;
3. `/fonti` is a real source/provenance/applicability registry;
4. Revision has one presentation source of truth;
5. automated tests observe the same UI as humans;
6. Arena/Docente OS authoring boundary is reflected in the UI;
7. productive curriculum persistence is safely activated or legacy mode is explicitly accepted as an M4 limitation;
8. full critical-task HVA is PASS on immutable deployed release(s);
9. accessibility acceptance is PASS;
10. recovery/security/privacy/operations gates are current;
11. repository governance enforcement is verified;
12. obsolete/superseded PR/evidence state is cleaned up.

No weighted score overrides one failed blocker.

## 11. Maturity backlog A1–A10

The following backlog records the work required to reach M4. **Its numbering is not an execution authorization and does not supersede the governed S3→S4 sequence.** Items become actionable only when compatible with the currently authorized phase.

### A1 — Canonical Surface Freeze

Produce the target surface inventory and `Human Task → candidate route → authority` map. While S3 remains active, this is analysis/architecture inventory only; no frozen route is changed.

**Exit candidate:** `ARENA_CANONICAL_SURFACES_FROZEN`

### A2 — Routing Consolidation

Prepare and, only after an explicit Architecture Decision, implement removal of phantom tabs and ambiguous route aliases while preserving deliberate backward-readable deep links.

**Precondition:** routing Architecture Decision authorized under `docs/WORKING_PROTOCOL.md`.

**Exit candidate:** `ARENA_ROUTING_CANONICAL`

### A3 — Sources Registry

Transform `/fonti` into the canonical Source Registry and connect it to Curriculum and Knowledge without duplicate authority state.

**Exit candidate:** `ARENA_SOURCE_REGISTRY_CANONICAL`

### A4 — Revision Single Source of Truth

Make structured revision archive the sole user-facing revision model; migrate/retire legacy decision presentation.

**Exit candidate:** `ARENA_REVISION_PRESENTATION_CANONICAL`

### A5 — Automation/User UI Parity

Remove `navigator.webdriver` product branching and prove critical browser audits against human-identical UI.

**Exit candidate:** `ARENA_BROWSER_HUMAN_PARITY_PASS`

### A6 — Arena / Docente OS Surface Boundary

Remove broad teacher operational authoring from Arena primary surfaces while preserving institutional framework/requirements/handoff.

**Exit candidate:** `ARENA_DOS_UI_BOUNDARY_PASS`

### A7 — Persistence Activation

Advance productive curriculum domain persistence through a separately governed migration with rollback evidence.

**Exit candidate:** `ARENA_CANONICAL_PERSISTENCE_ACTIVE`

### A8 — Full G5 HVA

This is not deferred behind A1–A7. Under the current governed memory, **S3 human validation has precedence** and must be completed before later stabilization phases are promoted.

Human-test all frozen critical Arena tasks on real Beta, desktop and mobile, including relevant empty/loading/success/blocked/error/recovery states.

**Exit:** `BETA_HIA_PASS`

### A9 — G6 Accessibility

Complete automated and manual WCAG 2.2 A/AA acceptance for critical routes in the phase authorized by the Beta gate sequence.

**Exit:** `BETA_ACCESSIBILITY_PASS`

### A10 — Operations / Governance Closure

Close repository enforcement, recovery rehearsal, security/privacy, known-issues/incident loop and stale PR/evidence cleanup when authorized by the governing release sequence.

**Exit candidate:** `ARENA_M4_PRECONDITIONS_PASS`

## 12. Authorized resumption logic

Do **not** execute `A1 → A2 → ...` mechanically.

The currently governed order remains the one in `INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`. At this audit date that memory records Arena S3 human validation as in progress and S4 as blocked until S3 closes.

Therefore the immediate rule is:

`finish currently authorized S3 evidence/HVA → verify governed memory → only then select the first compatible unresolved maturity item`

### Current next action

**Close the remaining governed Arena S3 human-validation obligations.**

A1 may proceed concurrently only as non-mutating architecture inventory if it does not change routing, authority, persistence, interoperability or product behavior.

Before any routing change proposed by A2, create and approve the Architecture Decision required by `docs/WORKING_PROTOCOL.md`.

## 13. Session checklist

At the beginning of a future Arena session:

1. read `INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`;
2. read this audit;
3. verify live `main` SHA and deployed release identity when relevant;
4. determine the currently authorized Arena phase;
5. inspect the unresolved maturity findings compatible with that phase;
6. do not treat A1–A10 numbering as permission to skip governed gates;
7. do not change routing without the required Architecture Decision;
8. do not reopen completed foundations without a reproducible finding;
9. preserve human authority, evidence provenance and Arena/Docente OS boundary;
10. use same-SHA validation before merge/deploy;
11. treat actual HVA as separate from automated browser evidence.

## 14. Canonical maturity statement

**CurManLight Arena is M3.3 — ADVANCED CONTROLLED BETA.**

The next maturity gain does not come from adding broad features. It comes first from completing the currently governed human-validation phase, then from authorized product convergence: source/provenance productization, revision-state convergence, test/user parity, boundary cleanup, accessibility and operational closure.