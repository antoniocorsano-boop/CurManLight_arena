# CML-631F — Validation Baseline

## Baseline Identifier

```text
CML-631F-BASELINE-01
```

## Repository

`CurManLight Arena`

## Branch

`feat/cml-631e-guided-curriculum-connection-flow`

## Commit

Full: `1a3aa23`
Short: `1a3aa23`

## Freeze Date

2026-07-25

## Commits Included in Baseline

1. `7e800bd` fix(CML-631E): load curriculum nodes from all pilot segments
2. `86f103d` feat(CML-631E): implement guided curriculum connection flow
3. `cfe8f8a` test(CML-631E): add data loading verification tests
4. `9bfc193` docs(CML-631E): closure report and visual evidence
5. `0460833` docs(CML-631E): final report with implementation verdict
6. `1a3aa23` docs(CML-631F): prepare teacher validation protocol, grid, and report template

## Technical Verification Results

| Check | Result |
|-------|--------|
| TypeScript (`npx tsc --noEmit`) | Pass — no errors |
| Tests (`npx vitest run`) | 728 passed (28 files) |
| Application build (`npm run build`) | Success — 1,137.88 kB (gzip: 296.01 kB) |
| Storybook build (`npm run build-storybook`) | Success — 3,077.55 kB (gzip: 911.37 kB) |

## Expected Curriculum Content

| Content | Count |
|---------|-------|
| Segments | 2 |
| Curriculum nodes | 6 (3 primary + 3 secondary) |

## Execution Mode for Sessions

- Dev server: `npm run dev`
- Browser: to be recorded per session
- Device: to be recorded per session
- Screen widths verified: 1440 px, 1024 px, 768 px, 390 px

## Known Limitations

- Visual evidence screenshots not included; require browser session
- Screen reader accessibility not manually verified
- Mobile verification at 390px is via code inspection, not actual device
- No real teacher sessions have been conducted

## Immutability Declaration

> Le sessioni T01–T05 devono essere svolte sul medesimo commit. Qualsiasi modifica al codice, ai testi, ai dati o alla configurazione invalida la confrontabilità delle sessioni successive e richiede una nuova baseline.

## Session Artifacts

- Protocol: `docs/CML_631F_REAL_TEACHER_VALIDATION_PROTOCOL.md`
- Observation grid template: `docs/CML_631F_SESSION_OBSERVATION_GRID.md`
- Participant grids: `docs/validation/CML_631F_T01_OBSERVATION.md` through `T05`
- Session log: `docs/validation/CML_631F_SESSION_LOG.md`
- Final report: `docs/CML_631F_REAL_TEACHER_VALIDATION_REPORT.md`