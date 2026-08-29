# ARENA-S2B — Legacy Classroom/Social Removal Contract v1

Status: PREPARED
Baseline: `main@5e0df5411bee75c13462cf76b6e28b1a76975566`
Depends on: ARENA-S1 + ARENA-S2A

## Objective

Remove legacy Classroom/Social code from the canonical CurManLight Arena runtime after S2A made the product boundary fail-closed.

Arena owns institutional curriculum consultation, revision, source control, institutional document generation, curriculum-oriented planning and controlled interoperability. Individual pupil/classroom operational state belongs to Docente OS.

## Confirmed residual coupling

The following residual coupling still exists after S2A:

1. `src/App.tsx`
   - imports `useClassroomSocialState` and `useClassroomSocialHandlers`;
   - instantiates pupil/classroom/social state even though the canonical navigation no longer exposes Classroom/Social;
   - passes Classroom/Social state to Copilot, AppViewsLayer and AppModalsLayer.

2. `src/features/session/types/appViewContracts.ts`
   - still contains `ActiveProgTab` legacy values `social`, `classe-home`, `classe`;
   - still exposes `Classroom*`, cooperative-group and `SocialUda` contracts through the canonical view layer.

3. `src/features/progettazione/components/ProgettazioneTab.tsx`
   - still imports `ClasseTab` and `SocialTab`;
   - still contains branches for `social` and `classe`;
   - still accepts classroom/student/social props through `ProgettazioneTabProps`.

4. Legacy feature modules
   - `src/features/classroom/**` and `src/features/social/**` remain present.
   - They may be deleted only after no canonical imports remain.

## Required removal order

### S2B-1 — Canonical view detachment

Remove `ClasseTab` and `SocialTab` from `ProgettazioneTab`.

Canonical planning modes after the change:

- `home`
- `annuale`
- `uda`
- `certificazione`

No canonical UI branch may render a pupil register, classroom configuration, individual feedback or local social board.

### S2B-2 — Contract contraction

Remove Classroom/Social properties and types from `AppViewsLayerProps` and related session contracts.

`ActiveProgTab` must no longer advertise `social`, `classe-home`, or `classe` as canonical values.

Historical persisted values remain handled only at the S2A normalization boundary and must resolve fail-closed to an Arena-owned mode.

### S2B-3 — App composition cleanup

Remove from `App.tsx`:

- `useClassroomSocialState`;
- `useClassroomSocialHandlers`;
- Classroom/Social state passed to `useCopilotInteractionHandlers`;
- Classroom/Social props passed to `AppViewsLayer`;
- Classroom/Social outcome props passed to `AppModalsLayer` unless a separately justified institutional use is proven.

The Copilot must not depend on individual pupil feedback inside Arena.

### S2B-4 — Legacy module deletion

Delete `src/features/classroom/**` and `src/features/social/**` only when repository search proves zero canonical imports.

Do not migrate historical browser data to Docente OS automatically. No silent copy, transformation or reinterpretation is authorized.

## Non-goals

S2B does not:

- redesign the planning UX;
- implement Docente OS classroom features;
- change curriculum authority semantics;
- change Arena ↔ Docente OS interoperability payloads;
- implement AILit;
- delete unrelated UDA planning, curriculum, knowledge or document features.

## Acceptance invariants

S2B is PASS only if all are true:

1. Canonical navigation contains no Classroom/Social entry.
2. Canonical planning state exposes only Arena-owned planning modes.
3. `App.tsx` does not instantiate pupil/classroom/social operational state.
4. `AppViewsLayer` and `ProgettazioneTab` expose no pupil/classroom/social contracts.
5. Copilot has no dependency on individual pupil feedback in Arena.
6. No persistent or memory-resident pupil operational state is created by the canonical Arena composition.
7. Historical `/classroom` and `/social` routes still resolve fail-closed through the S2A compatibility boundary.
8. No automatic migration of historical pupil/classroom state occurs.
9. TypeScript passes.
10. Fast regression suite passes, including `arena-product-boundary-runtime.test.ts`.
11. Human governance tests pass.
12. Production build passes.
13. Beta Release Contract, Beta Identity Authority and Beta E2E remain PASS.

## Promotion rule

`ARENA-S2B = COMPLETE` only after the same immutable candidate SHA passes the full Product CI and the Beta gates applicable to a PR targeting `main`.

Until then the branch state is `PREPARED_REWORK_IN_PROGRESS`.
