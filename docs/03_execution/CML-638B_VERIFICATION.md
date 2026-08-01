# CML-638B Verification Document

## Consolidation Baseline and Branch

- Consolidation branch: `feat/cml-638b-canonical-path-consolidation`
- Common base between persistence and UI lines: `f528970` (`f5289703dbe1daa4bd09cb8e7cdb638aa0988186`)
- Persistence origin commit: `e396e5f` (`test(CML-638B): verify canonical document persistence`)
- UI origin commit: `4aa772c` (`feat(CML-638B): complete A07 canonical document UI closure`)
- Consolidated head after recomposition: `9dc3bb7`

## Consolidation Scope

CML-638B is recomposed on a controlled third line by applying the UI closure commit on top of the persistence closure commit.

Composition applied:

1. Persistence foundation (`e396e5f`) retained as branch base.
2. UI layer (`4aa772c`) cherry-picked on top.

Result: the consolidated branch contains both canonical persistence behavior and A07 UI creation flow.

## Implemented Functional Scope

A07 UI integration provides canonical document creation from saved UDA in `EsportazioniTab`, with contextual selection flow and canonical document detail visualization.

Implemented behavior:

- adds UDA selector + action button for canonical creation;
- creates canonical documents through existing A04->A07 contracts;
- blocks deterministic duplicates by existing canonical title (`Progettazione: <uda.id>`);
- auto-focuses the created document detail through React state propagation.

Persistence foundation behavior (from `e396e5f`):

- canonical documents and versions are persisted and rehydrated;
- provenance and source references are preserved across reload;
- corrupt persisted archive recovery is enforced.

## Application Files Changed

- `src/features/documents/components/EsportazioniTab.tsx`
- `src/features/documents/components/CanonicalDocumentTab.tsx`
- `src/features/documents/hooks/useDocumentProduction.ts`
- `src/features/documents/mappers/udaToA07Payload.ts`
- `src/features/documents/services/documentProduction.ts`

## Tests Added by Source Commits

From persistence commit `e396e5f`:

- `src/__tests__/cml-638b-hook.test.tsx`
- `src/__tests__/cml-638b-mapping-a03-document.test.ts`
- `src/__tests__/cml-638b-mapping-a04-document.test.ts`
- `src/__tests__/cml-638b-persistence.browser.test.ts`
- `src/__tests__/cml-638b-persistence.test.ts`
- `src/__tests__/cml-638b-production-service.test.ts`

From UI commit `4aa772c`:

- `src/__tests__/cml-638b-a07-canonical-ui.test.tsx`

Coverage in UI test:

- explicit empty state when no canonical documents exist;
- canonical creation from selected UDA;
- deterministic duplicate prevention on repeated creation.

## Typing Correction Applied During Closure

During final verification, TypeScript reported a contract mismatch in the new test fixture for `TemplateJsonState`.

Applied fix:

- changed `lineHeight` from numeric to string (`'1.4'`);
- added required fields: `logoLeft`, `logoRight`, `leftSignee`, `rightSignee`.

Result: `npx tsc --noEmit` returns green.

## Contract and Governance Checks

- No new store or persistence paths introduced by UI layer; canonical flow uses existing store/document archive.
- Canonical creation uses existing contracts: `executeA04ToA07DocumentTransfer` from `src/domain/documents/contracts`.
- Duplicate prevention is deterministic: title-based guard on current archive (`Progettazione: <uda.id>`).
- Automatic opening lifecycle uses React state only:
  - `selectedCanonicalDocumentId` state in `EsportazioniTab`;
  - prop-driven selection in `CanonicalDocumentTab` via `selectedDocumentId` + `onSelectionChange`;
  - no global listener registration (`addEventListener`) or cleanup logic introduced by CML-638B.
- No parallel canonical creation path introduced: UI creation delegates to the same document transfer/contracts path.

## Verification Results After Recomposition

Targeted checks:

- Persistence test: `npx vitest run src/__tests__/cml-638b-persistence.test.ts` -> `6/6` passed
- Persistence browser test: `npx vitest run src/__tests__/cml-638b-persistence.browser.test.ts` -> `4/4` passed
- UI test: `npx vitest run src/__tests__/cml-638b-a07-canonical-ui.test.tsx` -> `3/3` passed

Global gates:

- Full suite: `npm test` -> `1857/1857` passed
- TypeScript: `npx tsc --noEmit` -> passed
- Production build: `npm run build` -> passed
- Storybook build: `npm run build-storybook` -> passed
- Diff quality: `git diff --check` -> passed

Persistence/UI chain evidence:

- produced canonical document is persisted to storage (memory + IndexedDB tests);
- after reload/rehydration, canonical document remains available;
- deduplication remains deterministic from UI path;
- auto-open selection is state-driven and does not bypass persisted archive lifecycle.

## Session Files Handling

- In consolidation worktree `C:/Users/anton/CurManLight_arena_cml638b_consolidation`: `session/20260801_202059/` is absent.
- In source worktree `C:/Users/anton/CurManLight_arena` (`workspace/local-clean`): `session/20260801_202059/` remains untracked.
- Session files were intentionally excluded from application consolidation commits.

## Superseded Note

The prior note about `.vscode/settings.json` belonged to the earlier UI-only closure context on `workspace/local-clean`.
For the consolidation branch, no `.vscode/settings.json` delta is present.

## Consolidated Outcome

- Consolidated branch: `feat/cml-638b-canonical-path-consolidation`
- Consolidated head: `9dc3bb7`
- Full CML-638B lineage now represented on a single branch: persistence foundation + UI layer.