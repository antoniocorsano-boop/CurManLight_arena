# CML-633J — Active Surface and Legacy Map

## Classification Legend
- **canonical-active**: Primary feature or directory actively used in the product workflow.
- **legacy-read-only**: Existing feature/directory that is present but not part of the active canonical workflow; read-only access only.
- **migration-adapter**: Adapter that bridges legacy data to the new productive domain.
- **deprecated**: Marked for removal; not used in UI or core logic.
- **dead-code**: Unreferenced code, no longer needed.
- **blocked-removal**: Cannot be removed due to dependencies or risk.
- **future-extension**: Potential future use, currently inactive.

## Active Surfaces (canonical-active)

| Surface | Path | Classification |
|---------|------|----------------|
| guided-workflow | src/features/guided-workflow | canonical-active |
| curriculum | src/features/curriculum | canonical-active |
| progettazione | src/features/progettazione | canonical-active |
| documents | src/features/documents | canonical-active |
| session | src/features/session | canonical-active |
| navigation | src/features/navigation | canonical-active |
| processo | src/features/processo | canonical-active |
| social | src/features/social | canonical-active |
| classroom | src/features/classroom | legacy-read-only |
| curriculum-etwin | src/features/curriculum-etwin | legacy-read-only |
| curriculum-functional-pilot | src/features/curriculum-functional-pilot | legacy-read-only |
| copilot | src/features/copilot | legacy-read-only |
| workspace (feature) | src/features/workspace | canonical-active |
| curriculum (domain) | src/domain/curriculum | canonical-active |
| design (domain) | src/domain/design | canonical-active |
| documents (domain) | src/domain/documents | canonical-active |
| institution (domain) | src/domain/institution | canonical-active |
| revision (domain) | src/domain/revision | canonical-active |
| transfer (domain) | src/domain/transfer | canonical-active |
| guided-workflow (state) | store:useCurriculumStore.guidedWorkflowState | canonical-active |

## Legacy Surfaces (legacy-read-only)

| Surface | Path | Classification |
|---------|------|----------------|
| classroom | src/features/classroom | legacy-read-only |
| copilot | src/features/copilot | legacy-read-only |
| curriculum-etwin | src/features/curriculum-etwin | legacy-read-only |
| curriculum-functional-pilot | src/features/curriculum-functional-pilot | legacy-read-only |

Note: All legacy surfaces are read-only; they may still be referenced by existing documentation or archived data but are not part of the active canonical workflow.

## Migration Adapters

| Adapter | Source | Target | Status |
|---------|--------|--------|--------|
| curriculum-persistence-legacy | legacy curriculum data → canonical curriculum | canonical-active | Implemented |
| document-legacy | legacy document structures → canonical document archive | canonical-active | Implemented |
| institution-legacy | legacy institutional data → canonical institutional archive | canonical-active | Implemented |
| transfer-legacy | legacy transfer contracts → canonical transfer domain | canonical-active | Implemented |

## Deprecated (deprecated)

- None currently marked as deprecated; legacy surfaces are classified as `legacy-read-only`.

## Blocked Removal (blocked-removal)

- None identified; all legacy surfaces are either read-only or have clear usage constraints.

## Future Extension (future-extension)

- Potential AI-driven recommendation surfaces (future deployment, not yet implemented).

## Dead Code (dead-code)

- No dead code detected in the current codebase snapshot at baseline 4952b9b.

## Additional Notes

- The guided-workflow feature is a canonical-active surface that integrates multiple existing domains without creating a new parallel domain.
- The store (useCurriculumStore) is the single source of truth; no new storage mechanisms are introduced.
- Surfaces previously present at the 1ffb4b0 baseline (workspace domain, tep feature, voice feature, knowledge feature) that do not exist at 4952b9b have been verified and are absent from this map.
- The workspace surface exists at 4952b9b and is classified as canonical-active.