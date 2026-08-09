# CurManLight Target Product Implementation Roadmap

**Gate:** CML-631F-RB-D1R1
**Status:** `APPROVED / CANONICAL`
**Rule:** P1.1 is the approved NOW increment; this document does not authorize P1.2 or P2.

## 1. Roadmap principles

The roadmap closes the gaps in `CML_TARGET_PRODUCT_CONTRACT.md` in teacher-visible slices. It preserves the frozen architecture, shell, routing, stores and verified governance. One developer works on one increment at a time.

Each increment must be small, reversible, browser-tested by a teacher, and end with at most three prioritized findings, followed by correction before the next increment.

## 2. Macro sequence

| Slice | Result | Main contract gaps | Order |
|---|---|---|---:|
| P1 — Product foundation and information architecture | One approved vocabulary, surface map and context grammar | navigation, curriculum semantics, disclosure | 1 |
| P2 — Unified context, onboarding and Settings | One understandable local teacher environment | onboarding, personal/view/work context, settings | 2 |
| P3 — Work-oriented Home and navigation | Home resumes real work and exposes attention | Home, navigation, recent work | 3 |
| P4 — Professional Curriculum and Planning flow | Curriculum content naturally becomes a class-targeted UDA | curriculum, planning, target context, class links | 4 |
| P5 — Documents, approval and contextual Assistant | Outputs are professional, reviewable and governed | documents, human approval, assistant | 5 |
| P6 — Visual coherence and end-to-end validation | Canonical language survives the complete teacher journey | visual system, cross-area S1/S2 validation | 6 |

P1 is primarily the approval gate for this document set. No P2–P6 runtime work starts until the target is approved.

For each macro-slice, the binding scope is: target gap → teacher outcome → scope → non-scope → dependencies → browser validation → exit criteria. The six slices above are the only macro-slices of this Product Wave; their detailed increments below are the execution order.

## 3. Increment map

| ID | Target gap | User outcome | Scope | Dependencies | Validation | Exit criteria | Order |
|---|---|---|---|---|---|---|---:|
| P1.1 | Vocabulary and disclosure are inconsistent | The teacher can name where curriculum, planning, documents and class work live | Contracted labels, current→target disclosure matrix, primary/advanced classification; documentation first | current runtime inventory, self-validation | user review of labels and 3 core journeys | approved vocabulary with no unresolved primary-surface ambiguity | 1 |
| P1.2 | Context grammar is not shared | The teacher can tell what object, class, provenance and state are visible in a workspace | Define the reusable context-header/work-area/status grammar against existing surfaces | P1.1, workspace identity and document contracts | browser walkthrough plan for Home/Curriculum/Planning/Documents | context fields mapped to existing data or explicitly marked gap | 2 |
| P2.1 | Onboarding and configuration are perceived as separate concepts | The teacher configures profile, discipline, order and classes once | Consolidate the first-run and Settings target using existing onboarding/session/institutional configuration paths; no new store | P1, CML-635A contracts | first-run teacher test: configure, refresh, reopen settings | one coherent configuration path; no duplicated authoritative fields | 3 |
| P2.2 | Personal, view and work target context can drift | The teacher sees `Tecnologia · secondaria I · 1A` before acting | Surface resolved context and class target in existing workspace headers and planning entry points | P2.1, existing `targetClass`/`targetSection` state | 5-context matrix with refresh and navigation checks | no ambiguous class label in supported workflows | 4 |
| P3.1 | Home is a launcher/dashboard rather than a work surface | The teacher resumes one UDA/document and sees attention items | Recompose existing Teacher Workspace surfaces according to the Home contract; retain recent activity invariants | P2.2, CML-617A/B/CML-627 behavior | browser test: resume, open recent item, empty state, attention | Home answers the six questions without technical status | 5 |
| P4.1 | Curriculum labels expose implementation concepts | The teacher understands which reference/copy/proposal is open | Rename/reframe only the visible surface; keep import/generation as contextual actions; preserve canonical/legacy adapters | P1, canonical curriculum read models | teacher explains provenance/status/editability unaided | each curriculum view identifies object, provenance and state | 6 |
| P4.2 | Planning does not retain selected content and class meaningfully enough | The teacher creates an UDA for an explicit class from selected curriculum content | Connect the existing selection, target class and UDA flow; preserve wizard as interaction aid | P2.2, P4.1, guided workflow | end-to-end class-targeted UDA walkthrough | curriculum→UDA path has visible source, target, missing items and next step | 7 |
| P5.1 | Document output is not always perceived as a managed object | The teacher can reopen, inspect version/status and approve before export | Expose existing canonical document continuity, preview, version and export history in Documents | productive document path, CML-636B/638B | reopen→preview→approve/export browser scenario | canonical version is the only export source and provenance is visible | 8 |
| P5.2 | Assistant feels like a separate chatbot | The teacher asks for help without losing work or surrendering control | Attach assistant entry to context; expose proposal/review/approval states using existing AI boundary | P2.2, P4.2, P5.1, governance contracts | prompts in Curriculum, Planning and Documents with no silent mutation | every generated output is visibly a proposal and requires explicit commit | 9 |
| P6.1 | Visual language varies by area | The teacher experiences one calm product | Apply approved hierarchy, density, state and language corrections to validated surfaces | P3–P5 | visual/browser review at desktop and narrow viewport | no primary surface presents a technical/prototype vocabulary | 10 |
| P6.2 | End-to-end S1/S2 risks are not closed | The teacher completes the real journey without structural confusion | Run self-validation across onboarding→Home→Curriculum→UDA→Document→approval/PDF and fix max three findings per cycle | all previous increments | browser validation and regression suite focused on changed surfaces | all 15 target criteria pass; no structural S1/S2 finding | 11 |

## 4. Sequencing status

### NOW — proposed, not implemented

**P1.1 — Product vocabulary and disclosure contract.**

P1.1 must produce a visible first step toward the canonical IA: the teacher must see the approved professional area vocabulary and a visible primary-vs-advanced disclosure in the affected navigation/surface. It is not complete if it only renames internal identifiers, cleans up code or changes routing.

Deliver the visible vocabulary/disclosure change and confirm these four journeys:

`Home → Curricolo → Progettazione → Documenti`
`Home → Classe → UDA collegata`
`Curriculum reference → proposal → teacher review`
`Assistant help → proposal → approval`

Validation is a product-target review, not a runtime change. The increment is complete only when the user approves the primary labels, the advanced surface policy and the curriculum terminology.

### NEXT — maximum two

1. **P1.2 — Common context grammar** mapped to current surfaces.
2. **P2.1 — Unified onboarding and Settings** using existing state and contracts.

### LATER

P2.2, P3.1, P4.1, P4.2, P5.1, P5.2, P6.1 and P6.2, in the order shown in the increment table.

### MUST REACH TARGET

All increments P1.1 through P6.2 that are necessary to satisfy the 15 criteria, especially unified context, work-oriented Home, curriculum semantics, class-targeted planning, canonical documents, governed Assistant and end-to-end validation.

### AFTER TARGET

Polish of secondary views, richer institutional collaboration, broader document templates and additional accessibility/performance refinements that do not alter the target model.

### DO NOT START

New speculative capabilities, new institutional milestones, cloud/SCORM/remote integrations, new AI features, policy-admin UI, refactors, new frameworks/state managers, shell/routing changes and technical cleanup that does not block a target criterion.

## 5. Definition of done for each increment

1. The increment names the target criterion it advances.
2. The teacher-visible outcome is stated as “Il docente potrà…”.
3. Existing domain/persistence is reused unless a documented gap proves it insufficient.
4. The changed surface has a focused technical gate.
5. A browser walkthrough is performed by the teacher persona.
6. At most three findings are prioritized.
7. Findings are corrected and revalidated.
8. The next increment is not started while the current exit criterion is open.

## 6. Decision gate

The following target decisions are approved and recorded:

- North Star and product boundaries;
- canonical information architecture;
- curriculum terminology and provenance/state rules;
- canonical curriculum→UDA→document workflow;
- target visual language;
- 17 target-product criteria;
- macro sequence and P1.1 as NOW.

P1.1 implementation remains limited to the visible shell/disclosure change; P1.2 and P2 remain unauthorized.

## 7. Change control

The roadmap is subordinate to the canonical Product Contract. New work is classified as `TARGET_REQUIRED`, `TARGET_SUPPORTING`, `AFTER_TARGET`, `BACKLOG` or `REJECT`. Only `TARGET_REQUIRED` work may interrupt the current NEXT. The roadmap changes only through an explicit human decision; implementation may not reinterpret the target.

## 8. Consolidation clarification

The target contract and roadmap are now approved/canonical. P1.1 is the single approved NOW increment, but it is not implemented in this gate. Its exit condition is a visible professional vocabulary and primary-vs-advanced disclosure change; internal renames, cleanup or routing-only work do not satisfy it. The roadmap’s final target checklist is the 17-criterion checklist in the Product Contract.
