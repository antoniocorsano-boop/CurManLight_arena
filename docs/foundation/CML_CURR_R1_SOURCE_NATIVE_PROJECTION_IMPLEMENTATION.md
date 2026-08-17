# CML CURR-R1 — Source-Native Projection Implementation

> **Status:** IMPLEMENTED_REMOTE_UNVERIFIED
> **Branch:** `feat/cml-636b-canonical-document-preview-export`
> **Scope:** pure CML-633C domain only; no UI, store, persistence or runtime ingestion

## Purpose

Close the three representation gaps confirmed while reconciling D.M. 254/2012 with the existing CML-633C canonical curriculum model:

1. source-native areas, especially the five `campi di esperienza` of scuola dell'infanzia;
2. controlled normative checkpoints;
3. source-native nuclei distinct from legacy `curriculumKB` nuclei.

The implementation is additive. It does not introduce a second CurriculumVersion, CurriculumSegment or CurriculumNode architecture.

## Changes

### CurriculumSegment

- `disciplineCode` now accepts `null` when the normative source is not discipline-shaped;
- optional `sourceArea` preserves source-native identity and label;
- optional `sourceNucleus` preserves the source-native nucleus separately from legacy `nucleusId`.

A segment is valid when it has either:

- a canonical discipline code; or
- a valid source-native area.

This allows an infanzia experience field to be represented without manufacturing a discipline.

### CurriculumNode

Added optional controlled `normativeCheckpoint` with the initial vocabulary:

- `end-infanzia`
- `end-primary-grade-3`
- `end-primary`
- `end-lower-secondary`

Existing free-form `grade` and `period` remain for legacy/institute compatibility and are not promoted to normative checkpoint authority.

### Validation

Added fail-closed checks for:

- segment lacking both discipline and source-native area (`SEG-005`);
- malformed source-native area (`SEG-009`);
- malformed source-native nucleus (`SEG-010`);
- invalid normative checkpoint (`NODE-011`).

### Public barrel

The new source-native types and `VALID_NORMATIVE_CHECKPOINTS` are exported through `src/domain/curriculum/index.ts`.

## Focused test

Added:

`src/__tests__/cml-curr-r1-source-native-projection.test.ts`

It covers:

1. an infanzia experience-field segment with `disciplineCode = null`;
2. rejection of a segment with neither discipline nor source-native area;
3. preservation of a source-native Italian nucleus;
4. acceptance of a controlled normative checkpoint and rejection of an arbitrary `annual` checkpoint.

## Commits

- `025a786` — source-native model types
- `ebd4687` — constructors
- `04cd4f7` — validators
- `e8c95e7` — public exports
- `745d720` — focused tests

## Gate

GitHub reports no automatic status checks for HEAD `745d720` on this branch.

Required local verification before the normative fixture is promoted:

```bash
npx tsc --noEmit
npx vitest src/__tests__/cml-curr-r1-source-native-projection.test.ts
npm run test:fast
```

Do not mark this segment VERIFIED until all applicable commands are green.

Current verdict:

`CURR_R1_SOURCE_NATIVE_PROJECTION = IMPLEMENTED_REMOTE_UNVERIFIED`
