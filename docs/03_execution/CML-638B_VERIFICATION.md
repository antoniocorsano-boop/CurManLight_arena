# CML-638B Verification Document

## Baseline and Branch

- Branch: `workspace/local-clean`
- Baseline HEAD at start of closure: `f528970` (`f5289703dbe1daa4bd09cb8e7cdb638aa0988186`)
- Baseline commit subject: `Merge pull request #18 from antoniocorsano-boop/feat/cml-630f2-legacy-compatibility-extended`

## Implemented Scope

CML-638B A07 completes a targeted UI integration for canonical document creation from saved UDA in `EsportazioniTab`, with contextual selection flow and canonical document detail visualization.

Implemented behavior:

- adds UDA selector + action button for canonical creation;
- creates canonical documents through existing A04->A07 contracts;
- blocks deterministic duplicates by existing canonical title (`Progettazione: <uda.id>`);
- auto-focuses the created document detail through React state propagation.

## Application Files Changed

- `src/features/documents/components/EsportazioniTab.tsx`
- `src/features/documents/components/CanonicalDocumentTab.tsx`

## Test Added

- `src/__tests__/cml-638b-a07-canonical-ui.test.tsx`

Coverage in added test:

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

- Persistence/store path unchanged: no edits in store modules or persistence/domain persistence layers.
- Canonical creation uses existing contracts: `executeA04ToA07DocumentTransfer` from `src/domain/documents/contracts`.
- Duplicate prevention is deterministic: title-based guard on current archive (`Progettazione: <uda.id>`).
- Automatic opening lifecycle uses React state only:
  - `selectedCanonicalDocumentId` state in `EsportazioniTab`;
  - prop-driven selection in `CanonicalDocumentTab` via `selectedDocumentId` + `onSelectionChange`;
  - no global listener registration (`addEventListener`) or cleanup logic introduced by CML-638B.

## Verification Results

Final closure checks executed:

- Full suite: `npm test` -> `1805/1805` passed
- TypeScript: `npx tsc --noEmit` -> passed
- Production build: `npm run build` -> passed
- Storybook build: `npm run build-storybook` -> passed
- Diff quality: `git diff --check` -> passed

## Unexpected Worktree Change (Out of Scope)

Observed unrelated local modification:

- `.vscode/settings.json`

Inspection evidence:

- diff adds `chat.tools.terminal.autoApprove` for `npx tsc`;
- `git diff --numstat` reports `4 1`;
- last history entries are editor/orchestration setup commits (`c274ff2`, `f230633`).

Classification:

- generated automatically by environment/editor behavior;
- preexisting to CML-638B scope;
- not required for CML-638B functionality.

Commit policy applied:

- keep file unchanged locally;
- do not restore/reset without authorization;
- exclude from CML-638B staging and commit.