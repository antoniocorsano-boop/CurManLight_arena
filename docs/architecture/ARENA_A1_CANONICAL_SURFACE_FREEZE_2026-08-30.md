# CurManLight Arena — A1 Canonical Surface Freeze

Status: CANDIDATE / NON-MUTATING ARCHITECTURE INVENTORY  
Date: 2026-08-30  
Base: `main@da6b3c30a450bffb95b9478c6aea60aaddbdc386`  
Parent checkpoint: `docs/architecture/SYSTEM_MATURITY_AUDIT_2026-08-30_CANONICAL.md`

## 1. Governance scope

This document executes **A1 only as a non-mutating inventory/freeze** while Arena S3 remains open.

It does not authorize:

- routing changes;
- shell changes;
- removal of current tabs/routes;
- persistence migration;
- UI restructuring;
- cross-product runtime changes.

`INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md` remains superior for execution order. Arena must complete the governed S3 human-validation sequence before S4 or later product-mutating work unless that memory is explicitly amended.

`docs/WORKING_PROTOCOL.md` freezes routing and requires an explicit Architecture Decision before any exception. Therefore the classifications below are **target-state decisions for later implementation**, not permission to mutate routes now.

## 2. Product ownership invariant

Arena owns:

- institutional curriculum;
- national/institutional applicability;
- curricular sources and provenance;
- curriculum revision proposals and review;
- institutional decision boundary;
- resulting curriculum baseline/adoption state;
- controlled institutional/curricular exports and planning handoff.

Arena does not own the teacher's operational classroom workspace, lesson execution or broad operational UDA authoring.

## 3. Canonical institutional journey

`Context → Applicability → Curriculum → Sources/Evidence → Proposal → Review → Institutional Decision → Baseline → Export/Handoff`

Every first-class Arena surface must support at least one step in this journey or provide necessary support/recovery for it.

## 4. Target first-class surfaces

### 4.1 Home — KEEP

**Human purpose:** understand current institutional/curricular state and enter the next relevant task.

**Current AppTab:** `dashboard`  
**Current route:** `/`  
**Authority:** none by presence on the page; displayed role/context never grants consequential authority.

**Target:** preserve as product entry point.

### 4.2 Curricolo — KEEP / CONSOLIDATE

**Human purpose:** identify context/applicability and inspect the current curriculum and transition state.

**Critical Human Task:** `HT-BETA-CURRICULUM-CONTEXT`  
**Current AppTab:** `curricolo`  
**Current route:** `/curriculum`

Subviews currently used:

- `home` → context/orientation;
- `albero` → curriculum structure/content;
- `mappa` → temporal/transition comparison;
- `popolamento` → update/import/assistive operations.

**Authority:** inspection is non-consequential; any promotion of new/changed curriculum content must pass source/provenance/review boundaries and cannot be implied by local edits.

**Target:** one Curricolo surface with task-first subviews: Context & applicability, Contents, What changes, Update working copy.

### 4.3 Fonti — KEEP / REFRAME AS CANONICAL SOURCE REGISTRY

**Human purpose:** answer where curriculum content comes from, its version, provenance, verification/authority state and applicability.

**Current AppTab:** `fonti`  
**Current route:** `/fonti`  
**Legacy readable route:** `/settings` → `fonti`

**Authority:** source verification does not itself create institutional/normative authority. Local verified source remains distinct from official/normative/institutional source.

**Target:** canonical institutional/curricular Source Registry connected to Curricolo and Knowledge without duplicate authority state.

### 4.4 Revisione — KEEP / CONSOLIDATE TO ONE PRESENTATION MODEL

**Human purposes:** prepare/inspect a proposal, review evidence and execute a consequential institutional decision only when authorized.

**Critical Human Tasks:**

- `HT-BETA-REVISION-PREPARE`
- `HT-REVISION-DECISION`

**Current AppTab:** `revisione`  
**Current route:** `/revisione`

**Authority:** proposal/review is not decision authority. Institutional decision requires authenticated membership/capability and explicit human confirmation; missing authority fails closed.

**Target:** structured revision archive as the sole user-facing revision source of truth. Legacy `decisions/customTexts` may remain only as migration/import adapters until retired.

### 4.5 Conoscenza — KEEP AS SUPPORTING EVIDENCE/EXPLORATION SURFACE

**Human purpose:** search/ask against available knowledge, inspect local sources, understand terms and inspect relations only when evidence-safe and user-meaningful.

**Current AppTab:** `second-brain`  
**Current route:** `/knowledge`  
**Legacy readable route:** `/second-brain`

**Authority:** generated/inferred knowledge never becomes curriculum authority or institutional decision automatically. Local source verification is local-only.

**Target:** supporting knowledge/evidence experience, not a second curriculum authority and not a generic technical graph product.

### 4.6 Documenti / Handoff — KEEP

**Human purpose:** obtain a readable curriculum document or a controlled transferable working/planning handoff.

**Critical Human Task:** `HT-BETA-PLANNING-HANDOFF`  
**Current AppTab:** `esportazioni`  
**Current route:** `/documents`

**Authority:** export does not confer adoption or institutional approval. Handoff must preserve authority state, applicability and provenance and must not mutate downstream teacher work automatically.

**Target:** preserve as first-class output/handoff surface.

### 4.7 Guida / Supporto — KEEP / REWRITE AFTER SURFACE CONSOLIDATION

**Human purpose:** understand the product journey, boundaries, recovery and limitations.

**Current AppTab:** `guida`  
**Current route:** `/guida`

**Authority:** informational only.

**Target:** rewrite against the final canonical surfaces after mutating consolidation is authorized and completed.

## 5. Enabling system surfaces

Authentication/workspace membership/context are enabling system capabilities required for authority enforcement. They are not competing product areas.

A displayed or self-declared role never grants `REVISION_DECIDE`. Person, Role, Capability and Authority remain distinct.

## 6. Current AppTab classification

| Current AppTab | Current route mapping | Classification | Target disposition | Mutation authorized now? |
| --- | --- | --- | --- | --- |
| `dashboard` | `/` | KEEP | Home | NO |
| `curricolo` | `/curriculum` | KEEP / CONSOLIDATE | Curricolo | NO |
| `revisione` | `/revisione` | KEEP / CONSOLIDATE | Revisione | NO |
| `progetta-evidenze` | no stable first-class route/rendered identity | RETIRE OR ABSORB | absorb any institutional evidence need into Curricolo/Revisione/Fonti | NO |
| `progetta-annuale` | `/planning` | MOVE-TO-DOCENTE-OS / SPLIT | retain only institutional framework/requirements/handoff in Arena | NO |
| `processo` | emits `/planning`, re-enters as `progetta-annuale` | ABSORB / RETIRE | absorb useful history/import/summary into Revisione/Documenti | NO |
| `esportazioni` | `/documents` | KEEP | Documenti / Handoff | NO |
| `certificazione-pa` | emits `/documents`, re-enters as `esportazioni` | RETIRE OR DEFINE REAL TASK | remove nominal surface unless a distinct governed Human Task is proven | NO |
| `fonti` | `/fonti` | KEEP / REFRAME | Source Registry | NO |
| `guida` | `/guida` | KEEP / REWRITE | Guida / Supporto | NO |
| `second-brain` | `/knowledge` | KEEP | Conoscenza | NO |

## 7. Primary navigation classification

Current primary sidebar items:

| Label | AppTab | Classification | Target |
| --- | --- | --- | --- |
| Home | `dashboard` | KEEP | Home |
| Consulta il curricolo | `curricolo` | KEEP | Curricolo |
| Rivedi le proposte | `revisione` | KEEP | Revisione |
| Controlla le fonti | `fonti` | KEEP / REFRAME | Fonti registry |
| Crea un documento | `esportazioni` | KEEP | Documenti / Handoff |
| Controlli e checklist | `certificazione-pa` | UNRESOLVED / NOMINAL | remove or define a real governed task before any route is created |
| Guida | `guida` | KEEP | Guida / Supporto |

Conoscenza is a valid supporting surface even though it is not currently a first-class sidebar item. Its eventual navigation placement must be decided through a user-task/HIA decision, not merely because the route exists.

## 8. Legacy/deep-link policy candidate

A later routing Architecture Decision should distinguish:

1. **canonical emitted routes** — routes generated by the current product;
2. **backward-readable routes** — historical deep links that may resolve safely without appearing in navigation;
3. **retired routes** — routes that cannot safely map to a canonical task and should fail/recover explicitly rather than silently aliasing to a different task.

Current examples requiring a later routing decision include:

- `/classroom` → `progetta-annuale`;
- `/planning` → `progetta-annuale`;
- `/copilot` → `dashboard`;
- `/social` → `dashboard`;
- `/settings` → `fonti`;
- `/second-brain` → `second-brain`;
- `/onboarding` → `dashboard`.

This document records these mappings but does not authorize changing them.

## 9. Human Task → Surface → Route → Authority map

| Human Task | Canonical surface | Current route | Consequential authority |
| --- | --- | --- | --- |
| `HT-BETA-CURRICULUM-CONTEXT` | Curricolo | `/curriculum` | none; system resolves applicability, human inspects |
| `HT-BETA-REVISION-PREPARE` | Revisione | `/revisione` | proposal/review only; no institutional decision implied |
| `HT-REVISION-DECISION` | Revisione | `/revisione` | `REVISION_DECIDE` only when backend-authorized + explicit human confirmation |
| `HT-BETA-PLANNING-HANDOFF` | Documenti / Handoff | `/documents` | export/handoff only; no adoption or downstream mutation |

Supporting evidence/provenance for these tasks is provided by Fonti and Conoscenza but neither surface grants decision authority.

## 10. A1 exit condition

A1 is complete as an **architecture inventory/freeze** when:

- all current `AppTab` states are classified;
- all current primary navigation items are classified;
- the seven target first-class surfaces are explicit;
- the four frozen Beta Human Tasks are mapped to surface/route/authority;
- legacy deep-link policy is defined as a candidate for a later routing Architecture Decision;
- no runtime/routing/UI mutation is included in the A1 tranche;
- same-SHA documentation gates pass.

Exit label:

`ARENA_A1_SURFACE_INVENTORY_FROZEN`

This exit does **not** authorize A2 routing implementation while S3 remains open.

## 11. Next governed action after A1

While S3 remains open, continue the governed S3 closure sequence and use this inventory only as a stable target/reference.

After S3 closes, any routing mutation for A2 requires a separate explicit Architecture Decision under `docs/WORKING_PROTOCOL.md` before implementation.