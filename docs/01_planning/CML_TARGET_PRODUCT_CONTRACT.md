# CurManLight Target Product Contract

**Gate:** CML-631F-RB-D1R1
**Status:** `APPROVED / CANONICAL`
**Scope:** product experience only; no runtime authorization is implied by this document.

## 1. North Star

> CurManLight è l'ambiente professionale del docente per consultare, interpretare, progettare, documentare e governare il lavoro curricolare, con contesto personale e istituzionale esplicito, assistenza contestuale e controllo umano su ogni decisione significativa.

CurManLight must feel like one calm teacher workspace, not a collection of tools, an admin panel, an AI playground, or a technical dashboard.

The frozen product promise is: CurManLight helps the teacher consultare, interpretare, progettare, documentare and decidere on curricular and didactic work, with explicit personal context, institutional context when pertinent, contextual assistance and human control.

The governing rule is: **AI proposes → teacher edits → teacher approves → teacher commits.** Generated content is never authoritative by default.

## 2. Evidence and boundaries

The target reconciles the sources in this order:

1. CML-631F self-validation and the findings recorded in `docs/01_planning/CML-631F_REAL_TEACHER_VALIDATION_PROTOCOL.md` and `docs/03_execution/CML-631F-S0_EXPERT_SELF_TEST.md`.
2. The approved visual and interaction direction in `docs/04_product_experience/` and `docs/04_product_design/`, plus the Teacher Workspace mock in `docs/07_product_evolution/CML-617A_ACTIVITY_MOCK.md`.
3. The later workspace identity, productive document and curriculum contracts.
4. Current runtime and persistence.

The specifically named `CML-631F_RB_D1_UNIFIED_TEACHER_EXPERIENCE_DIRECTION.md` was not found in this checkout. Its intended direction is therefore represented by the available approved experience documents and must be reconciled if the file is restored.

Historical documents describe capabilities more broadly than the current runtime. A label is target intent, not proof of implementation.

## 3. Professional objects

| Object | Teacher meaning | Current evidence/source | Target surface and actions | Significant states | Do not expose by default |
|---|---|---|---|---|---|
| Environment | The local professional workspace in which the teacher operates | `InstitutionalArchive`, workspace identity design, local persistence | Home header and Settings; configure, activate, export/import locally | unconfigured, incomplete, ready-local | provider internals, storage diagnostics |
| Teacher profile | Who is working and with which declared role | onboarding state, `DeclaredActorReference` design | Settings and context header; edit declared identity | incomplete, configured | authentication/permission claims not actually present |
| Curriculum | The curriculum source or working copy currently consulted | canonical curriculum domain plus legacy adapters/read models | Curriculum workspace; consult, filter, compare, review | source, working copy, proposed, approved | schema names, migration mechanics |
| Curriculum content | A source-backed target, objective, evidence, nucleus or link | canonical nodes/segments/links and legacy `curriculumKB` adapter | Curriculum detail and planning selection; inspect, select, propose revision | imported, local, proposed, approved, archived | raw IDs and technical graph terminology |
| Planning / UDA | The concrete didactic design being prepared for a target class | `UdaModel`, guided workflow and saved UDA archive | Planning workspace; create, edit, continue, review | draft, in revision, ready for comparison, completed | wizard implementation as the product mental model |
| Document | A professional output connected to planning and curriculum | canonical document domain, versions, preview/export and continuity | Documents workspace; open, edit, preview, version, approve, print/export | draft, revised, approved, exported | download handlers and format internals |
| Class | The actual teaching group for which work is prepared or observed | onboarding class combinations, classroom/social state | Class workspace; select, edit local roster/context, connect to UDA | configured, active, incomplete | student-sensitive data in assistant context |
| Work target | The explicit class/group and object for which the current work is produced | `targetClass`, `targetSection`, selected curriculum content and active UDA/document state | Planning and Documents context header; select, change, confirm | unset, selected, changed, committed | implicit class assumptions |
| Decision / revision | A human judgement that changes the status of curriculum or output | revision/decision state, proposal and consensus contracts | Inline review and decision history; accept, reject, annotate | proposed, in review, accepted, rejected, committed | fake institutional authority or automatic approval |
| Assistant | Contextual help attached to the current work | copilot/WikiLLM contracts and contextual handlers | Inline or side entry in every relevant workspace; explain, orient, propose, summarize, flag gaps | idle, answering, proposal, awaiting teacher decision | autonomous mutation, hidden context transmission |

## 4. Curriculum semantics

The word “curriculum” must always be qualified by provenance and state.

| Canonical term | Meaning in the target | Current support | Default user-facing question answered |
|---|---|---|---|
| **Riferimento curricolare** | Source-backed national/institutional reference used for consultation | canonical `Source`, source versions, curriculum read models and legacy adapter | “Da quale riferimento proviene?” |
| **Curricolo di lavoro** | Local working copy derived/imported from a reference and editable through review | canonical curriculum version/segment/node statuses plus local store compatibility | “Che cosa sto preparando o adattando?” |
| **Curricolo d’istituto** | Institution-owned working curriculum; use only when an institutional archive/context is configured | institutional archive and curriculum domain support the concept, but current UX is not yet a single canonical surface | “Qual è la versione adottata dalla mia scuola?” |
| **Proposta** | Un change or generated addition not yet accepted into the working curriculum | proposal/revision paths and AI generated output exist | “Che cosa è ancora da valutare?” |

“Vista strutturata” and “Raccordo diacronico” are views, not curriculum types. “Integrazione & Popolamento” is an advanced operation and must not be a primary mental model for a teacher; it belongs under contextual actions such as import, propose or revise.

Every curriculum workspace must state: **object, provenance, status, editability, approver**. If one is unknown, show “non disponibile” rather than infer it.

## 5. Context model

Three contexts are intentionally separate:

- **Personal context:** declared teacher profile, discipline, school order and configured class combinations.
- **View context:** the object currently being inspected, for example `Tecnologia → Secondaria I grado → Classe prima`.
- **Work target:** the class or group for which an UDA/document is being prepared, for example `1A` or `tutte le prime`.

Every operational workspace shows, when relevant:

`Disciplina · ordine/grado · classe/gruppo target · oggetto · stato`

“Classe 1ª” alone is not sufficient. A context change affects future work and never rewrites existing document versions or historical snapshots.

## 6. Canonical information architecture

The target primary navigation is:

```text
HOME
CURRICOLO
PROGETTAZIONE
DOCUMENTI
CLASSE
ISTITUTO        (only when the configured role/context makes it useful)
SETTINGS
```

The Assistant is a contextual entry available from relevant workspaces, not a separate destination in the teacher’s primary workflow. Advanced institutional, knowledge-base and technical tools remain reachable through contextual or advanced surfaces.

| Area | Purpose | Primary object | Target actions | Hide/move from primary surface |
|---|---|---|---|---|
| Home | Resume real work and reveal attention | active work, recent work, attention | continue, start, open attention item | WebGPU, storage, launcher of every tool |
| Curricolo | Consult and review source-backed curriculum | reference, working curriculum, content | select discipline/level, inspect, compare, propose revision | “Popolamento” as a top-level destination; raw graph terms |
| Progettazione | Turn selected curriculum content into an UDA for a target class | UDA/planning | choose content, set class, draft, review, continue | wizard steps as standalone navigation |
| Documenti | Manage professional outputs and versions | canonical document | open, edit, preview, approve, print/PDF | format-specific technical controls until needed |
| Classe | Work with a real class context and outcomes | class/group and local observations | configure/edit class, connect UDA, inspect outcomes | student-sensitive data in generic dashboards |
| Istituto | Manage institution-owned context and collaboration | institute/context/decisions | review, compare, consolidate when supported | admin policy and diagnostics for teacher role |
| Settings | One stable place for configuration | environment/profile/classes/assistant/data | configure and reset deliberately | settings scattered across workspaces |

Canonical subviews are fixed as follows: Home = context, continuation, attention, recent activity; Curricolo = overview, content detail, progression, sources, proposals; Progettazione = active UDA, saved plans, coverage/review; Documenti = list, detail, preview, versions, export; Classe = class context, connected UDA, local outcomes; Istituto = context and supported decisions; Settings = environment, profile, classes, assistant, local data, advanced. No equivalent alternative IA remains open.

## 7. Common workspace grammar

Each main area uses the same composition:

1. **Context header:** where I am, what I am working on, provenance and state.
2. **Primary work area:** the professional object, not a collection of generic cards.
3. **Contextual actions:** only actions appropriate to the object and state.
4. **Status/attention:** missing information, pending review or next decision.
5. **Assistant entry:** help attached to the visible context and explicitly bounded.

## 8. Home contract

Home must answer, without exploration: where am I, what am I working on, what can I continue, what needs attention, what is next, and how can I ask for help?

Target sections:

1. **Contesto personale/professionale** — teacher, discipline, order, active classes, academic year when configured.
2. **Continua il lavoro** — one current UDA or document with one clear continuation action.
3. **Richiede attenzione** — drafts, unresolved revisions, missing context or documents awaiting teacher decision.
4. **Azioni principali** — consult curriculum, start planning, open documents.
5. **Attività recenti** — a bounded list of recent UDA/document activity, retaining the current Teacher Workspace rules.
6. **Assistant access** — contextual help, not a generic launcher.

The Home never leads with WebGPU, experimental tools, unavailable features, IndexedDB/service-worker status, or indiscriminate technical launchers.

## 9. Canonical workflows

### First access

```text
Onboarding → context → profile → classes → work intention
→ optional assistance → Home
```

### Curriculum → UDA → document

```text
Home → Curricolo → choose reference/content → choose work target
→ Progettazione → draft/revise UDA → review completeness
→ Documento → preview/version → teacher approval → PDF/print
```

At every transition the teacher sees the selected content, class target, UDA title/status and next step. The wizard is an interaction aid, not the product’s conceptual structure.

### Proposal and AI governance

```text
contextual request → proposal → teacher edits → teacher reviews
→ teacher approves → explicit commit → status/provenance recorded
```

The assistant may explain, orient, propose, summarize and flag gaps. It must not decide, silently mutate, or make generated content authoritative.

### Document continuity

Documents remain linked to their UDA/curriculum source and retain version, provenance, context snapshot and export history. Preview and print operate on the persisted canonical version.

### Return to work

```text
Home → continua il lavoro → reopens the correct object and context
```

Every future slice preserves first access, Curriculum→Planning, UDA→Document, contextual assistance and return to work.

## 10. Settings contract

Settings is the single stable location for:

- Il mio ambiente
- Profilo docente
- Classi
- Assistente
- Dati locali
- Avanzate

Provider, endpoint, model, WebGPU and diagnostics are Advanced concerns and never primary teacher content.

## 11. Visual language

CurManLight is professional, warm, editorial, calm, contextual and advanced without being technical.

Binding properties:

- readable typographic hierarchy with sentence case as the norm;
- a comfortable reading column and stable context header;
- surfaces used to group a professional object, not to multiply equivalent cards;
- semantic colors for state: neutral, attention, proposed, approved, error;
- restrained navigation rail/sidebar and clear active location;
- explicit empty states that explain what is missing and what the teacher can do;
- progress only when it represents meaningful work;
- assistant presence visible but subordinate to the teacher’s work.

Remove or reduce: excessive uppercase, technical badges, equal-weight card grids, empty space without function, technical button labels, arbitrary chroma, prototype language and unexplained acronyms.

## 12. Target-product criteria

The product target is reached only when all are true:

1. onboarding is unified and understandable;
2. teacher context is coherent throughout the application;
3. classes are genuinely editable in the supported local scope;
4. Home represents real work;
5. navigation speaks the teacher’s language;
6. curriculum semantics are unambiguous;
7. target class/group is explicit;
8. curriculum → UDA → document is a natural workflow;
9. documents are professional objects;
10. assistant is contextual;
11. every AI output is editable and approvable;
12. technology is outside the primary surface;
13. Settings collects configuration;
14. UI follows the canonical mockup language;
15. no structural S1/S2 issue remains in end-to-end self-validation;
16. a teacher can complete the main workflow without knowing CurManLight’s internal architecture;
17. no AI decision becomes authoritative content without explicit teacher approval.

These criteria are the exit gate for the product wave. New capability proposals that do not advance one criterion go to backlog.

## 13. Non-goals and truthfulness rules

The target does not authorize cloud, SCORM, new remote integrations, speculative AI, institutional milestones unrelated to the criteria, refactoring, new frameworks, new state managers, shell changes or routing changes.

The current code remains authoritative for what works today. The roadmap must label unsupported target behavior as a gap; it must not turn a mockup into a claim of capability.

## 14. Change control

Every new idea is classified as `TARGET_REQUIRED`, `TARGET_SUPPORTING`, `AFTER_TARGET`, `BACKLOG` or `REJECT`. Only `TARGET_REQUIRED` may interrupt the current NEXT. No idea changes this contract automatically; an explicit human decision recorded as `TARGET_CONTRACT_CHANGE_APPROVED` is required.

This contract has precedence over mockup interpretation, roadmap convenience, self-validation screenshots and current runtime limitations. A runtime divergence is a gap unless a real technical constraint is documented and approved.
