# CML-633F Document State and Version Policy

## Document Statuses

| Status | Description | Can Transition To |
|--------|-------------|-------------------|
| `draft` | Bozza iniziale | `in-progress` |
| `in-progress` | In lavorazione | `completed` |
| `completed` | Completato | `shared-locally`, `archived` |
| `shared-locally` | Condiviso localmente | `archived` |
| `archived` | Archiviato (terminale) | — |
| `superseded` | Sostituito (terminale) | — |
| `legacy` | Importato da sistema legacy | `draft`, `archived` |

## Rules
- Each transition must be validated against the transition table
- No auto-approval — never skip from `draft` to `completed`
- No transition from `archived` or `superseded`
- `legacy` documents can become `draft` (review) or `archived` (storage)

## Versioning Rules

### Creation
- Every document starts with version 1
- Every substantial change creates a new version
- Restore creates a new version (not mutation of old)

### Immutability
- `frozen: true` set at creation — never modified after
- Previous versions remain available
- Document's `currentVersionRef` always points to the active version

### Institutional Snapshot
- Captured at version creation time
- Frozen in the version (not updated with institutional changes)
- Contains: `instituteName`, `mechanicalCode?`, `siteName?`, `academicYearLabel?`, `declaredRole?`, `configured`

### A04 Reference
- A04 design ID and references preserved in document and first version
- Sources, curriculum nodes, evidences, content origin preserved