# CML-633J — Active Surface and Legacy Map

## Classification Legend
- **canonical-active**: Primary feature or directory actively used in the product workflow.
- **legacy-read-only**: Existing feature/directory that is present but not part of the active canonical workflow; read-only access only.
- **migration-adapter**: Adapter that bridges legacy data to the new productive domain.
- **deprecated**: Marked for removal; not used in UI or core logic.
- **dead-code**: Unreferenced code, no longer needed.
- **blocked-removal**: Cannot be removed due to dependencies or risk.
- **future-extension**: Potential future use, currently inactive.

## Active Surfaces — Features Directory (canonical-active)

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
| workspace (feature) | src/features/workspace | canonical-active |

## Legacy Surfaces — Features Directory (legacy-read-only)

| Surface | Path | Classification | Justification |
|---------|------|----------------|---------------|
| classroom | src/features/classroom | legacy-read-only | Pre-CML-633 surface; not part of the canonical teacher workflow |
| copilot | src/features/copilot | legacy-read-only | AI assistant surface; not part of core workflow; no new AI provider introduced |
| curriculum-etwin | src/features/curriculum-etwin | legacy-read-only | eTwin integration surface; read-only access only |
| curriculum-functional-pilot | src/features/curriculum-functional-pilot | legacy-read-only | Experimental pilot; read-only access only |

Note: surfaces that existed at the 1ffb4b0 baseline (graphs, knowledge, onboarding, tep, voice) do not exist at 4952b9b and have been removed from this map.

## Domain Layers (canonical-active)

| Domain | Path | Classification | Persistence |
|--------|------|----------------|-------------|
| curriculum | src/domain/curriculum | canonical-active | Zustand persist middleware; single Dexie `state` table via `createCurriculumDatabase()` |
| design | src/domain/design | canonical-active | Zustand persist middleware; single Dexie `state` table |
| documents | src/domain/documents | canonical-active | Zustand persist middleware; single Dexie `state` table |
| institution | src/domain/institution | canonical-active | Zustand persist middleware; single Dexie `state` table |
| revision | src/domain/revision | canonical-active | Zustand persist middleware; single Dexie `state` table |
| transfer | src/domain/transfer | canonical-active | Zustand persist middleware; single Dexie `state` table |
| guided-workflow (state) | store:useCurriculumStore.guidedWorkflowState | canonical-active | Zustand persist middleware; no new Dexie tables or schema changes |

## Shared Infrastructure (canonical-active)

| Surface | Path | Classification |
|---------|------|----------------|
| shared components | src/components | canonical-active |
| shared hooks | src/hooks | canonical-active |

## Migration Adapters

| Adapter | Source | Target | Status | Notes |
|---------|--------|--------|--------|-------|
| curriculum-persistence-legacy | `src/domain/curriculum/persistence/legacyAdapters.ts` → curriculum canonical | canonical-active | ✅ Verified at 4952b9b | Maps legacy curriculum objects to canonical `EntityReference`; validates integrity before migration; no data loss. |
| document-legacy | `src/domain/documents/legacyAdapters.ts` → document archive | canonical-active | ✅ Verified at 4952b9b | Maps legacy document structures to canonical archive; validates `documentIntegrity`; preserves original document ID. |
| institution-legacy | `src/domain/institution/legacyAdapters.ts` → institution archive | canonical-active | ✅ Verified at 4952b9b | Handles `institutionalArchive` migration; validates integrity; falls back to `createEmptyInstitutionalArchive` if integrity check fails. |
| transfer-legacy | `src/domain/transfer/legacyAdapters.ts` → transfer domain | canonical-active | ✅ Verified at 4952b9b | Maps legacy transfer contracts to canonical transfer domain; validates integrity; rollback supported. |
| workflow-state-seeding | incomplete session state → guided-workflow | canonical-active | ✅ Verified at 4952b9b | Uses existing session/zustand state to seed `GuidedTeacherWorkflowState`; incomplete sessions start at `context` step with proper warnings. |

## Deprecated

- None currently marked as deprecated; legacy surfaces are classified as `legacy-read-only`.

## Blocked Removal

- None identified; all legacy surfaces are either read-only or have clear usage constraints.

## Future Extension (future-extension)

- AI-driven recommendation surfaces (future deployment, not yet implemented; see CML-634A)
- Workspace roles and permissions (see CML-635B)
- Shared institutional repository and synchronization (see CML-635C)

## Dead Code (dead-code)

- No dead code detected in the current codebase snapshot at baseline 4952b9b.

## Additional Notes

- The guided-workflow feature is a canonical-active surface that integrates multiple existing domains without creating a new parallel domain.
- The store (useCurriculumStore) is the single source of truth; all persistence uses Zustand persist middleware with a single Dexie `state` table; no new Dexie tables, schemas, or storage mechanisms are introduced.
- Surfaces that existed at the 1ffb4b0 baseline (graphs, knowledge, onboarding, tep, voice) do not exist at 4952b9b and are excluded from this map.