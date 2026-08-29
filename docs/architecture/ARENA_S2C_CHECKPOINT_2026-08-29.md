# ARENA-S2C — Canonical checkpoint

Date: 2026-08-29
Status: ACTIVE_REMEDIATION
Baseline: `main@08dd515870e6408a5bdcf5c8cc9359748e2c3111`
Working branch: `stabilization/arena-s2c-institutional-planning-language`
Pull request: #97

## Frozen state

- ARENA-S0: PASS_WITH_FOLLOW_UPS.
- ARENA-S1: COMPLETE and integrated.
- ARENA-S2A: COMPLETE and integrated.
- ARENA-S2B: COMPLETE and integrated, including physical removal of Classroom/Social runtime, state, types and legacy UI.
- Post-merge Product CI on `main@08dd515870e6408a5bdcf5c8cc9359748e2c3111`: PASS.
- ARENA-S2C: IN PROGRESS.

## S2C finding

The remaining canonical planning surface is functionally within Arena's boundary but still contains personal/classroom-owned wording. The remediation is copy-only: it must not change UDA logic, curriculum authority, persistence, interoperability, AILit, or Docente OS.

## Machine evidence

The new `arena-institutional-planning-language.test.ts` gate is included in `test:fast`.

On the initial S2C candidate:
- 359 existing fast tests PASS;
- the only fast-test failure is the new S2C language gate;
- Beta Release Contract PASS;
- Beta Identity Authority PASS.

## Canonical remediation rule

Arena copy must describe institutional/curricular design, review, reuse and evidence. It must not frame the surface as a teacher's personal workspace or classroom-operational environment.

## Next authorized action

Apply only the frozen S2C copy replacements in `ProgettazioneTab.tsx`, then require on one immutable SHA:
1. institutional language gate PASS;
2. full fast regression PASS;
3. human governance PASS;
4. KX guards PASS;
5. TypeScript PASS;
6. production build PASS;
7. Beta Release Contract PASS;
8. Beta Identity Authority PASS.

S2C must remain draft and non-promotable until all applicable gates are green on the same SHA.
