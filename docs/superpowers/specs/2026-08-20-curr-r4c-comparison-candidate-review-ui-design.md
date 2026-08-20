# CURR-R4C — Comparison & Candidate Review UI

## Baseline and scope

R4C starts from remote baseline `0e42caf` and observes the existing R4A structural comparison service and R4B semantic candidate service. It adds a dedicated, read-only review view. The view does not approve, edit, persist, revise institutional content, enter the R5 workflow, or write `CurriculumLink` records.

`import-test.test.ts` is outside the R4C scope and must not be included.

## Layout contract

The canonical layout is `SPLIT_VIEW_WITH_BOTTOM_INSPECTOR`:

1. Top context filters: school order, discipline/area, and normative checkpoint.
2. Main split view: IN2012 on the left and IN2025 on the right.
3. Lower section one: R4A structural differences.
4. Lower section two: R4B candidate inspector, rendered only when a candidate exists or is selected.

The main panels remain visible while a candidate is selected. Selection only highlights the corresponding read-only content on both sides.

## Semantic separation

R4A and R4B must use distinct visual treatments and labels:

- R4A is presented as “Differenze strutturali” and describes facts such as area-only, checkpoint-only, node-type-only, or applicability differences.
- R4B is presented as “Candidati semantici” and describes a possible correspondence, its relation kind, evidence, and confidence.

Neither section may use action language such as Approva, Conferma equivalenza, Sostituisci, Accetta mapping, or Salva relazione.

## Candidate inspector

When no candidate is available for the current selection, the inspector shows:

> Nessuna corrispondenza candidata per questa selezione.

When a candidate is selected, the inspector shows, read-only:

- relation kind;
- confidence;
- evidence list;
- left and right node type;
- left and right `normativeNodeKind` when present;
- `frameworkApplicability` when present;
- candidate status as a non-editable “Candidato” badge.

No state transition is exposed.

## Data flow and boundaries

The UI receives context and derives its read model from the existing R4A and R4B services. It must not access fixtures directly, mutate service results, write to application stores, create `CurriculumLink` entities, or call institutional revision flows.

The view should derive filtered comparison and candidate data from the same filter state, keeping the two framework panels, structural differences, and candidate inspector synchronized.

The UI consumes R4A and R4B services through explicit read-only adapters or props. It must not import or read `fixture2012` or `fixture2025` directly. The filter scope—school order, discipline/area, and normative checkpoint—must be passed to both services consistently and deterministically.

The component API must not expose approval, save, edit, candidate-state, or link-creation callbacks such as `onApprove`, `onSave`, or `onCreateLink`. Candidate selection is local view state only.

## Empty and edge states

- No filter selection: show the neutral instructional state for choosing a school order.
- No structural differences: show a neutral “Nessuna differenza strutturale rilevata per questa selezione.” message.
- No candidates: show the candidate empty state above.
- A framework has content without a counterpart: keep that content visible and show the corresponding R4A difference; do not fabricate a candidate.
- A scope containing Strumento musicale only on one framework: show it as an R4A structural difference with no fabricated R4B candidate.
- IN2025 OSA content: show `normativeNodeKind = osa-2025` explicitly; never flatten it into the 2012 “obiettivo” label.

## Accessibility and interaction

Candidate rows are selectable controls with visible focus and selected states. The selected state must be understandable without color alone. Structural-difference badges and candidate badges must have distinct labels and visual hierarchy. All review content is keyboard reachable and read-only.

Confidence is descriptive metadata only (`low`, `medium`, `high`). It must not be rendered as a probability, validity score, approval signal, or normative certainty. Use neutral terminology: “candidato”, “possibile continuità”, and “evidenze”. Do not use “equivalente”, “sostituisce”, or “approvato”.

On narrow viewports the split view becomes two sequential framework sections while preserving the left/right endpoint labels and selected association. The responsive layout must not make a candidate appear to belong to the wrong framework.

Tests should prefer accessible roles, labels, and visible text. `data-testid` is allowed only where a stable accessible query is not practical.

## Acceptance criterion

Without external documentation, a user must be able to distinguish:

1. what belongs to IN2012;
2. what belongs to IN2025;
3. what differs structurally;
4. what is only a candidate correspondence;
5. what has no candidate correspondence.

## Verification contract

R4C is complete only when focused UI tests cover:

- filter propagation to both R4A and R4B views;
- split IN2012/IN2025 rendering;
- distinct structural-difference and candidate sections;
- candidate selection and synchronized highlighting;
- candidate inspector details and empty state;
- absent approval, edit, persistence, and `CurriculumLink` write paths.

The repository gates remain `curriculum-domain`, `test:fast`, `tsc --noEmit`, and `build`.
