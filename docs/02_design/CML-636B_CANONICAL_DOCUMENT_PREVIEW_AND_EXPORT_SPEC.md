# CML-636B Canonical Document Preview and Export Specification

## Status

- Type: Planning specification only
- Implementation: Not authorized in this document
- Approval status: Approved perimeter, implementation not started
- Baseline branch: feat/cml-638b-canonical-path-consolidation
- Baseline commit: 4b72b10e2c524e101c08263ff675d8a7bcedf50f
- Upstream dependency: CML-638B consolidated (`CML_638B_CANONICAL_DOCUMENT_PATH_CONSOLIDATED_LOCAL`)
- Verdict: `CML_636B_CANONICAL_DOCUMENT_PREVIEW_EXPORT_SPEC_APPROVED`

## Roadmap Consistency Check

Verified references for CML-636B in roadmap/baseline documentation:

- docs/CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE.md
  - CML-636A/B: template consolidation + validated preview
  - CML-636B: preview/validation before export

Outcome: CML-636B is already reserved for preview/validation/export scope and does not conflict with a different perimeter.

## Teacher Value

Il docente potra visualizzare il documento canonico reale prima del download, ricevere controlli espliciti di esportabilita e produrre file coerenti con versione, provenienza e contesto istituzionale senza perdita di tracciabilita.

## Functional Objective

Enable a canonical export workflow where preview and export are both derived from the persisted DocumentVersion currently selected, with mandatory validation before download.

## Approved Decisions

1. Mandatory formats for CML-636B:
   - printable HTML preview
   - PDF via browser print path
2. Deferred formats:
   - DOCX
   - ODF
   - JSON canonical export
3. Mandatory institutional fields:
   - institute name
   - academic year
   - document title
   - discipline
   - school order/class
   - author or declared role
   - date
   - version
4. Non-mandatory institutional fields in this phase:
   - mechanical code
   - full address
   - logo
   - principal name
   - protocol references
5. Archived document policy:
   - preview allowed in read-only mode
   - export blocked
6. Validation UX:
   - global summary in preview view
   - contextual messages near missing/invalid data
7. JSON canonical export:
   - excluded from CML-636B
   - reserved to a future technical/interoperability slice

## Included Scope

1. Canonical preview for selected document based on persisted DocumentVersion.
2. Exportability validation gate before any download action.
3. Export orchestration that preserves:
   - document identity,
   - version identity,
   - provenance/source links to UDA,
   - institutional metadata already available in A07.
4. Explicit handling of non-exportable states with deterministic messages.
5. Tests for full chain behavior from UDA to export.
6. Explicit version selection before preview/export.
7. Read-only preview for archived documents with blocked export.

## Excluded Scope

1. New storage layers or schema migrations.
2. Changes to routing/shell architecture.
3. New document generation pipelines outside canonical contracts.
4. Backfilling or rewriting historical document versions.
5. Product extensions outside A07 preview/validation/export perimeter.
6. DOCX export in this slice.
7. ODF export in this slice.
8. JSON canonical export in this slice.
9. Digital signature, protocollation, remote sharing, email sending, institutional repository integration.
10. Synthetic institutional data or synthetic document content.

## End-to-End User Flow

Required chain:

UDA -> canonical document -> persistence -> reopen -> preview -> validation -> export

Operational steps:

1. User creates canonical document from UDA (already covered by CML-638B).
2. Document and version are persisted in canonical archive.
3. User reopens Documents view and selects canonical document.
4. System resolves current persisted DocumentVersion.
5. User explicitly confirms or changes the selected version.
6. System renders preview from the resolved version (not synthetic data).
7. System evaluates exportability and shows a global summary plus contextual issues.
8. User selects printable export.
9. If valid, export proceeds through browser print/PDF with canonical metadata and traceability.
10. If invalid, download is blocked and user receives actionable message.

## Canonical Contracts to Reuse

Reuse only established canonical path components:

1. A04->A07 transfer contract:
   - src/domain/documents/contracts.ts
   - executeA04ToA07DocumentTransfer
2. Canonical archive/selectors/repository primitives:
   - src/domain/documents/selectors.ts
   - src/domain/documents/repository.ts
3. Canonical UI state source:
   - src/store/useCurriculumStore.ts
   - documentArchive + replaceDocumentArchive path already validated in CML-638B

No additional contract family may be introduced for preview/export.

## Domain Roles and Data Responsibilities

### Document

- Identity and continuity anchor.
- Holds sourceRefs/originRefs and currentVersionRef.
- Represents export subject selection.

### DocumentVersion

- Single source of truth for preview and export content.
- Carries versioned content, rationale, timestamps, and institutional snapshot linkage.
- Must be resolved from persistence before export.

### Template

- Presentation layer over canonical versioned content.
- Can shape output formatting but cannot replace canonical data source.
- Must not inject synthetic fallback content when canonical content is absent.
- Must remain resolvable from canonical document type/version context before export is enabled.

### Metadata

- Includes provenance, UDA linkage, and institutional context.
- Must remain consistent between preview and exported file.

## Exportability Conditions and Messages

Download is permitted only when all conditions are true.

1. Selected document exists in canonical archive.
   - Block message: Documento non disponibile nell'archivio canonico.
2. A DocumentVersion is explicitly selected.
   - Block message: Seleziona una versione prima dell'esportazione.
3. The selected version belongs to the selected document.
   - Block message: La versione selezionata non appartiene al documento corrente.
4. currentVersionRef or selected version resolves to an existing persisted DocumentVersion.
   - Block message: Versione corrente non trovata. Apri o rigenera il documento.
5. The document is not archived.
   - Block message: Il documento è archiviato. Puoi consultarlo, ma non esportarlo. Seleziona o crea una versione attiva.
6. Required provenance/source linkage is present.
   - Block message: Provenienza incompleta. Verifica il collegamento alla UDA.
7. Template is resolvable for the selected document/version.
   - Block message: Template non risolvibile per la versione selezionata.
8. Title is not empty.
   - Block message: Titolo documento mancante.
9. Required institutional metadata for selected format is present.
   - Block message: Dati istituzionali insufficienti per il formato selezionato.
10. Content is renderable for preview.
   - Block message: Anteprima non disponibile. Correggi i dati prima dell'esportazione.
11. Validation returns no blocking errors.
   - Block message: Correggi gli errori bloccanti prima dell'esportazione.
12. User has viewed the current version preview after the latest relevant change.
   - Block message: Visualizza l'anteprima aggiornata prima dell'esportazione.

Validation messages must be deterministic and testable.

Preview validity must be invalidated when any of the following changes:

1. selected document
2. selected version
3. resolved template
4. canonical content used for rendering
5. relevant metadata used for export

## Versioning, Provenance, and UDA Linkage

1. Export payload must carry explicit document ID + version ID/versionNumber.
2. Source linkage must include original UDA identity in sourceRefs.
3. Preview header/footer context must align with institutional metadata used for export.
4. Export history events must reference canonical source identity/signature consistently.

## Planned Export Formats

Baseline target set for CML-636B validation path:

1. HTML (preview-aligned)
2. PDF/print path

Explicitly excluded in this slice:

1. DOC/DOCX
2. ODF
3. JSON canonical archive export

## Errors, Recovery, and Edge Cases

1. Missing version after selection:
   - Recovery: prompt re-selection or regeneration via canonical flow.
2. Corrupt persisted archive entry:
   - Recovery: rely on existing archive integrity protections and block export path.
3. Duplicate create attempts:
   - Recovery: preserve deterministic dedup behavior (already validated in CML-638B).
4. Archived document selected:
   - Recovery: allow consultation in read-only mode, block export with explicit reason.
5. Reopen after persistence rehydration:
   - Recovery: preview must resolve from persisted currentVersionRef.
6. Format conversion/print preparation failure:
   - Recovery: keep user on validated preview state; no partial download.
7. Missing institutional fields for required print/PDF path:
   - Recovery: present requirement message, allow correction before retry.

## Acceptance Criteria (Verifiable)

1. Preview always renders from persisted DocumentVersion for selected canonical document.
2. Download action is blocked when any exportability condition fails.
3. Exported output references correct canonical document/version/provenance.
4. Archived documents remain previewable but cannot be exported.
5. Reopen flow preserves ability to preview/export previously persisted active document.
6. Export is enabled only after the current preview has been rendered and validated.
7. The only supported export in this slice is printable HTML/PDF via browser print.
5. Dedup behavior remains deterministic and unchanged.
6. No alternate generation route bypasses canonical contracts.
7. No additional store/archive/schema introduced.

## Test Strategy

### Unit Tests

1. Exportability validator for all blocking conditions.
2. Version resolution and metadata mapping helpers.
3. Deterministic error messaging.
4. Preview invalidation when document/version/template/metadata changes.

### Integration Tests

1. Canonical preview from selected persisted document/version.
2. Validation gate before print/PDF export.
3. Export payload coherence (version/provenance/institutional metadata).
4. Archived document read-only preview with blocked export.

### UI Tests

1. Preview rendering path in A07 tab.
2. Disabled/blocked export actions with visible reasons.
3. Successful export enablement only after valid preview state.
4. Global validation summary plus contextual messages.

### Persistence Tests

1. UDA -> canonical -> persist -> reopen -> preview continuity.
2. Rehydration consistency for currentVersionRef resolution.
3. Dedup + persistence interaction.
4. Reopen of archived document remains consultable but not exportable.

## Final Quality Gates

Required green checks before closure:

1. Targeted CML-636B tests (unit/integration/UI/persistence)
2. Full suite (current reference baseline: 1857/1857)
3. npx tsc --noEmit
4. npm run build
5. npm run build-storybook
6. git diff --check

## Architectural Risks

1. Preview/export divergence (different data source paths).
2. Silent fallback to synthetic content when canonical version is unavailable.
3. Metadata drift between preview and export.
4. Regression on CML-638B dedup and auto-open behavior.
5. Hidden introduction of parallel generation logic in handlers.
6. Scope creep from print/PDF path to multi-format rendering engine.

Mitigation:

- enforce single canonical version resolver;
- centralize exportability validator;
- add contract-level assertions in integration tests;
- maintain strict no-parallel-path policy.

## Explicit Prohibitions

The phase must NOT:

1. Introduce a second document archive.
2. Create parallel generators.
3. Use synthetic/fake data for canonical preview/export.
4. Bypass CML-638B consolidated canonical path.
5. Trigger downloads without prior preview + validation.
6. Simulate missing institutional values with placeholders that look real.

## Resolved Decisions

1. Minimal controlled perimeter approved:
   - canonical HTML preview
   - pre-export validation
   - PDF export via browser print
2. Archived documents are consultable but not exportable.
3. Validation UX is dual-level:
   - summary in preview view
   - contextual messages near missing/invalid data
4. JSON canonical export is excluded from this slice.

## Remaining Clarifications For Implementation Planning

1. Exact UI control for explicit version selection (selector, tabs, timeline, or list).
2. Exact ownership of printable HTML renderer (reuse existing renderDocument vs introduce a canonical preview adapter without parallel generation).
3. Whether author field is satisfied by declared role when named author is absent.

## Implementation Boundary

This specification is approval-ready planning only.
No application code changes are authorized by this document.