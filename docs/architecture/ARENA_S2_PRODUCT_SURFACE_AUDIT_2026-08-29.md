# ARENA-S2 — Product Surface Rationalization Audit

Date: 2026-08-29
Status: REWORK_REQUIRED
Baseline audited: `main@6991f9293fe83761ab263d6962909554f18853f5`

## Purpose

Verify that Arena's runtime and UI respect the frozen Arena ↔ Docente OS ownership boundary: Arena owns institutional curriculum/governance; Docente OS owns teacher daily operations, pupil-level classroom state, timetable, TeachingSession and personal professional execution.

## Findings

### 1. Canonical primary navigation — PASS

The current controlled Beta navigation exposes institutional surfaces only: Home, curriculum consultation, revision, sources, documents, controls/checklists and guide. No primary Classroom, Social, Planner, Timetable or TeachingSession entry is emitted.

Legacy `/classroom` is redirected to the planning area and `/social` to dashboard; the current `AppTab` vocabulary no longer includes Classroom or Social as primary tabs.

### 2. Runtime composition — REWORK_REQUIRED

`App.tsx` still mounts `useClassroomSocialState()` unconditionally and passes pupil/classroom/social state into the planning view.

The mounted state includes, among other items:
- `classroomStudents`;
- pupil-level qualitative feedback;
- locally persisted pseudonym maps;
- exclusion pairs;
- classroom layout and cooperative-group configuration;
- selected pupil feedback;
- pupil outcome levels and observations;
- social UDA state and local outcome aggregation.

This is teacher operational/classroom state and does not belong to Arena's canonical responsibility.

### 3. ClasseTab — OUT_OF_BOUNDARY

`ClasseTab` describes itself as `Registro d'Aula e Studenti` and `Ambiente & Esiti Classe`. It can display pupil names in clear text and local profile/diagnosis-like information, manage local pupil records, pseudonyms, groups and qualitative outcomes.

Even where the data is local-only, locality does not change product authority: these capabilities belong to Docente OS, not Arena.

### 4. ProgettazioneTab — MIXED RESPONSIBILITY

The current planning surface still imports both `ClasseTab` and `SocialTab` and carries `social`, `classe-home` and `classe` inside `ActiveProgTab`. It also receives the complete pupil/classroom state from `AppViewsLayer`.

The institutional/reusable curricular-design part remains justified in Arena. The pupil-level execution and local social/classroom submodes do not.

### 5. Privacy boundary — REWORK_REQUIRED

The frozen interoperability boundary excludes pupil identities, individual assessment results and special-category/sensitive information from v1. The legacy Classroom state is therefore not only a product-ownership duplication; it is also incompatible with the intended privacy boundary of the stabilized Arena product.

## Remediation sequence

### ARENA-S2A — Runtime detachment

Goal: stop mounting pupil/classroom/social operational state in the canonical Arena runtime.

Required changes:
1. remove `useClassroomSocialState()` and `useClassroomSocialHandlers()` from `App` once downstream props are detached;
2. remove pupil/classroom/social fields from `AppViewsLayerProps` and `ProgettazioneTabProps`;
3. remove `ClasseTab` and operational `SocialTab` rendering from the canonical planning surface;
4. constrain `ActiveProgTab` to Arena-owned design modes;
5. migrate any legitimate aggregate curricular feedback path to the existing versioned `CurriculumFeedback`/human-review boundary rather than keeping pupil-level state.

### ARENA-S2B — Legacy containment/removal

After S2A passes CI:
- classify legacy classroom/social modules as removable archive or isolate them from production build;
- do not migrate pupil data into another Arena store;
- do not silently copy localStorage records to Docente OS;
- if a user export/migration path is later required, it must be explicit and separately authorized.

### ARENA-S2C — Product language / planning surface

Reframe remaining Arena planning language around institutional/curricular design and reusable frameworks. Remove wording such as `Area di progettazione personale`, `dispositivo d'aula`, pupil registry and classroom execution from Arena-owned surfaces.

## Machine gates required

- canonical navigation contains no Classroom/Social primary destination;
- production `App` no longer mounts pupil/classroom operational state;
- planning component no longer imports `ClasseTab` or operational `SocialTab`;
- no canonical Arena surface reads/writes `curman_classroomStudentFeedback`, `curman_shuffledStudentMap`, `curman_exclusionsList`, `curman_cooperativeGroups` or equivalent pupil-operational keys;
- Product CI and TypeScript PASS;
- Human Interaction Model remains PASS where affected;
- browser/mobile audit confirms no broken planning journey.

## Gate

`ARENA-S2 = REWORK_REQUIRED`

Next authorized implementation slice: `ARENA-S2A — Runtime detachment`.
