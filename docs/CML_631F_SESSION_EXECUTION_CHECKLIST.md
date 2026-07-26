# CML-631F — Session Execution Checklist

## Baseline

```text
CML-631F-BASELINE-04
Tag: cml-631f-baseline-04
Commit validato: a475c01
Branch: feat/cml-631i-assisted-pedagogical-relation-suggestions
```

## Pre-Session Verification

- [ ] `git rev-parse --short cml-631f-baseline-04` returns `a475c01`
- [ ] `git branch --show-current` returns `feat/cml-631i-assisted-pedagogical-relation-suggestions`
- [ ] `git status --short` shows only untracked observation files
- [ ] Dev server starts with `npm run dev`
- [ ] Application loads without errors
- [ ] Pilot mode starts as "Disattivato"
- [ ] Init button is disabled
- [ ] After activation: init button enabled
- [ ] After init: 1 version, 2 segments, 6 nodes visible
- [ ] Selecting source + target shows pedagogical suggestions (1–3 proposals)
- [ ] "Usa questa proposta" auto-fills rationale and selects relation type
- [ ] Rationale remains editable after auto-fill
- [ ] "Ignora" dismisses suggestions
- [ ] Manual relation type override works
- [ ] No auto-confirm on suggestion use
- [ ] Browser and device recorded in grid
- [ ] Observation grid for current participant opened

## Session Start

- [ ] Participant code confirmed (T01–T05)
- [ ] Baseline identifier recorded: `CML-631F-BASELINE-04`
- [ ] Date and time recorded
- [ ] Device and browser recorded
- [ ] Introduction read verbatim
- [ ] Operational task delivered verbatim
- [ ] No product explanation given beforehand
- [ ] Think-aloud method explained

## During Session

- [ ] Observer notes hesitations in real time
- [ ] Observer records incorrect actions
- [ ] Observer distinguishes comprehension errors from selection errors
- [ ] Helper interventions recorded with reason and wording
- [ ] No guidance provided unless participant is completely blocked
- [ ] Post-test questions asked in order after task completion
- [ ] No leading or suggesting answers
- [ ] Observer notes if participant notices suggestions
- [ ] Observer notes if participant uses, modifies, or ignores suggestions
- [ ] Observer notes if participant edits rationale after auto-fill
- [ ] Observer notes if participant changes relation type after suggestion
- [ ] Observer notes if participant makes manual choice without suggestions

## Post-Session

- [ ] Step-by-step observation completed
- [ ] Metrics filled: time, hesitations, errors, help requests
- [ ] Suggestion-specific indicators filled (see below)
- [ ] Post-test answers recorded
- [ ] Issue classification completed (if any)
- [ ] Facilitator notes added
- [ ] Grid saved as `docs/validation/CML_631F_T{XX}_OBSERVATION.md`
- [ ] `docs/validation/CML_631F_SESSION_LOG.md` updated
- [ ] No personal data included
- [ ] No simulated data inserted
- [ ] Product not modified

## Between Sessions

- [ ] No product changes between participants
- [ ] No text corrections during collection
- [ ] No anticipation of correct sequence
- [ ] No completing actions on behalf of participant
- [ ] No merging observations from two participants
- [ ] No attributing errors generically to digital competence

## After T05

- [ ] All 5 grids complete
- [ ] Session log updated
- [ ] All sessions use same baseline `CML-631F-BASELINE-04`
- [ ] `git rev-parse --short cml-631f-baseline-04` returns `a475c01` for all sessions
- [ ] No personal data in any document
- [ ] Aggregated results calculated
- [ ] C1 and C9 evaluated formally
- [ ] Suggestion indicators aggregated across sessions
- [ ] Issues classified
- [ ] Final report populated in `docs/CML_631F_REAL_TEACHER_VALIDATION_REPORT.md`
- [ ] Verdict assigned from the four CML-631F options

## Verdict Options

- `CML_631F_REAL_TEACHER_VALIDATION_PASSED`
- `CML_631F_REAL_TEACHER_VALIDATION_PASSED_MINOR_CORRECTIONS_REQUIRED`
- `CML_631F_REAL_TEACHER_VALIDATION_CORRECT_BEFORE_EXTENSION`
- `CML_631F_REAL_TEACHER_VALIDATION_NOT_EXECUTED` (until sessions complete)

## Current Status

```text
CML_631F_REAL_TEACHER_VALIDATION_NOT_EXECUTED
```

Sessions T01–T05 not yet conducted. No push, merge, or publication performed.