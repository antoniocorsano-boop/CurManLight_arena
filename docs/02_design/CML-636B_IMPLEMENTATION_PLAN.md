# CML-636B Implementation Plan

## Scope

Translate the approved CML-636B specification into an implementable sequence without expanding beyond the controlled minimum perimeter.

Baseline:

- Branch: feat/cml-638b-canonical-path-consolidation
- Commit: 4b72b10e2c524e101c08263ff675d8a7bcedf50f

## Teacher Objective

Il docente potra controllare il documento canonico reale prima della stampa o esportazione PDF, correggere subito i blocchi di validazione e produrre un output coerente con la versione persistita.

## Dependencies

1. CML-638B consolidated canonical path.
2. Existing A04->A07 document transfer contract.
3. Existing canonical document archive persistence and rehydration.
4. Existing render/export surfaces in A07 that can be tightened around canonical version data.

## Out of Scope

1. DOCX export
2. ODF export
3. JSON canonical export
4. Remote sharing or institutional repository sync
5. Schema/store changes

## Work Packages

### WP1 - Preview Source Resolution

Goal:

- Resolve selected Document + selected persisted DocumentVersion as the only preview source.

Tasks:

1. Identify current canonical document selection flow in A07.
2. Add explicit version selection model on top of existing document selection.
3. Centralize resolver for selected document/version/template.

Acceptance:

- No preview path reads synthetic or transient content.

### WP2 - Exportability Validator

Goal:

- Centralize blocking rules before export.

Tasks:

1. Define blocking conditions from approved spec.
2. Implement deterministic result model for summary + contextual messages.
3. Invalidate preview/export readiness when document/version/template/content/metadata changes.

Acceptance:

- Export button unavailable when validator returns blocking errors.

### WP3 - Canonical Preview UI

Goal:

- Render a preview derived from selected persisted version and show validation state.

Tasks:

1. Add preview surface inside A07 canonical document workflow.
2. Show global validation summary.
3. Show contextual issues beside affected fields/sections.
4. Support archived documents as read-only preview only.

Acceptance:

- Preview is visible for active and archived documents, but export is blocked for archived ones.

### WP4 - Print/PDF Export Path

Goal:

- Allow export only through browser print/PDF after valid preview.

Tasks:

1. Bind print/PDF action to validated preview state.
2. Preserve metadata/version/provenance in rendered output.
3. Ensure no second rendering engine is introduced.

Acceptance:

- PDF/print works only after current preview has been rendered and validated.

### WP5 - Verification

Goal:

- Prove continuity of canonical path end-to-end.

Tasks:

1. Add unit tests for validator and resolution helpers.
2. Add integration tests for preview/export continuity.
3. Add UI tests for summary/contextual errors and blocked export.
4. Add persistence tests for reopen/version continuity and archived-document behavior.
5. Run full gates.

## Risks

1. Existing export handlers may encourage reuse of non-canonical paths.
2. Version selection may be implemented implicitly instead of explicitly.
3. Print/PDF path may diverge from visible preview markup.
4. Validation UX may degrade into modal-only behavior, separating error from source.

## Risk Controls

1. One resolver for document/version/template.
2. One validator for exportability.
3. One rendered preview source reused by print/PDF.
4. No format expansion beyond HTML/PDF in this slice.

## Acceptance Gate Checklist

1. Canonical preview renders from persisted DocumentVersion.
2. Export blocked on all failing conditions.
3. Archived documents previewable but non-exportable.
4. Print/PDF output matches validated preview source.
5. Full chain test passes:
   - UDA -> document -> persistence -> reopen -> preview -> validation -> export
6. Full suite green.
7. TypeScript green.
8. Build green.
9. Storybook green.
10. Diff check green.

## Implementation Constraints

1. No second archive.
2. No generator parallel to canonical path.
3. No synthetic data fallback.
4. No bypass of CML-638B consolidated path.
5. No download before preview + validation.

## Ready-to-Start Condition

Implementation may start only from baseline `4b72b10e2c524e101c08263ff675d8a7bcedf50f` on branch `feat/cml-638b-canonical-path-consolidation` or a new child branch created from it.