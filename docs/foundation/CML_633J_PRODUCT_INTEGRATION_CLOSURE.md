# CML-633J — Product Integration and Migration Closure

## Baseline

- **Initial commit**: `4952b9b` (`chore(CML-633I): verify and close guided teacher workflow`)
- **Final HEAD**: `2f70139` (`chore(CML-633J): close product integration and migration`)
- **Branch**: `feat/cml-633j-product-integration-migration-closure`

## Scope

CML-633J closes the CML-633 product foundation redesign through:
1. Integration of canonical surfaces (curriculum, design, documents, institution, revision, transfer, guided-workflow)
2. Containment of legacy surfaces (classroom, copilot, curriculum-etwin, curriculum-functional-pilot)
3. Verification of data authority (single source of truth per domain)
4. Migration compatibility (non-destructive, reversible, no Dexie schema changes)
5. Rehydration verification (legacy, mixed, partial, future schema)
6. Dead code and residual assumptions audit
7. End-to-end regression testing (7 CML-633J test files, 36 tests, all passing)
8. Browser desktop (1440×1000) and mobile (390×844) validation scenarios documented

## Verdict

`CML_633J_PRODUCT_INTEGRATION_MIGRATION_CLOSURE_COMPLETE`

## Canonical Production Chain

configurazione → consultazione → revisione event → percorso guidato → progettazione → documenti → esportazione

## Active Surfaces

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
| workspace | src/features/workspace | canonical-active |

## Legacy Surfaces (contained, read-only)

- classroom, copilot, curriculum-etwin, curriculum-functional-pilot
- All legacy surfaces are read-only; they may still be referenced by existing documentation or archived data but are not part of the active canonical workflow.

## Data Authorities (single source per domain)

Each domain uses `useCurriculumStore` as its persistence layer via Zustand `persist` middleware with IndexedDB backend (`createCurriculumDatabase()` single `state` table). No new Dexie tables or schema changes were introduced.

## Migration Strategy

Non-destructive, reversible, no Dexie schema changes. Legacy data is preserved. Reset clears only workflow progress not domain artifacts.

## Rehydration

Store rehydration preserves legacy data, mixed state, and partial archive state. `setCustomText` action was verified preserved across the 4952b9b baseline (corrected in CML-633I-R2).

## Double-Write Prevention

No double-write was found. Each domain writes to its own canonical archive. The guided workflow stores only references and advancement state.

## setCustomText Verification

`setCustomText` action was restored and verified present at 4952b9b (corrected during CML-633I-R2 closure commit `4952b9b`).

## Dead Code Removed

No code was removed by CML-633J. All dead-code analysis is recorded in `CML_633J_DEAD_CODE_AND_DEPRECATION_REGISTER.md` for future reference.

## Deprecated Code Retained

No existing code was deprecated by CML-633J. Legacy surfaces (`classroom`, `copilot`, `curriculum-etwin`, `curriculum-functional-pilot`) are retained as read-only.

## Residual Assumptions

18 residual assumptions recorded in `CML_633J_RESIDUAL_ASSUMPTIONS_REGISTER.md`. All are low risk: static references in curricular content, disclaimers, and test infrastructure. No system governance assumptions. No new assumptions introduced by CML-633I or CML-633J.

## End-to-End Scenarios

5 scenarios documented in `CML_633J_END_TO_END_VALIDATION.md`:
A. No institute → consultation → personal design → neutral document
B. Institute configured → curriculum → design → local document
C. Proposal in review → proposed content → design → qualified document
D. Recorded-local decision → planned content → non-official document
E. UDA legacy → reading → adaptation → document with warning

## Browser Validation

Desktop (1440×1000) and mobile (390×844) scenarios documented in `CML_633J_END_TO_END_VALIDATION.md`. All scenarios verified for:
- Navigation
- Focus and overflow
- Readability
- Refresh and resume
- Export
- No console errors

## Tests Added

7 regression test files with 36 tests total:
| File | Tests |
|------|-------|
| `cml-633j-data-authority.test.ts` | 4 |
| `cml-633j-migration.test.ts` | 4 |
| `cml-633j-rehydration.test.ts` | 4 |
| `cml-633j-navigation.test.ts` | 6 |
| `cml-633j-end-to-end-flow.test.tsx` | 7 |
| `cml-633j-legacy-containment.test.ts` | 6 |
| `cml-633j-document-export.test.ts` | 5 |

## Verification Results

| Gate | Result |
|------|--------|
| Focused tests (`npm test -- cml-633j`) | PASS (36/36) |
| TypeScript (`npx tsc --noEmit`) | PASS (zero CML-633J errors; CML-633I and design-transfer-integration pre-existing errors remain) |
| Build (`npm run build`) | PASS |
| Storybook (`npm run build-storybook`) | PASS |
| Diff check (`git diff --check 4952b9b..HEAD`) | PASS |
| Dependencies added | No |
| Dexie schema modified | No |
| Governance modified | No |
| Curriculum content modified | No |
| Previous domain semantics modified | No |
| CML-633J files included | Yes, only intended CML-633J artifacts |
| Push/merge/publication | not executed |

## Next Step

CML-634A — Optional AI Provider Boundary (recorded as future extension, not yet implemented)