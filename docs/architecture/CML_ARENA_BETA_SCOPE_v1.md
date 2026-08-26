# CurManLight Arena — Beta Scope v1

Status: B0 SCOPE CANDIDATE  
Date: 2026-08-26

## Canonical human journey

The first Arena Beta certifies one institutional curriculum journey only:

1. identify curriculum context (school year, order, class/cohort, discipline);
2. inspect the national framework/application state resolved by Arena;
3. inspect current curriculum and revision state with provenance;
4. prepare or inspect a revision proposal;
5. expose evidence, responsible stakeholder and consequence before decision;
6. execute an explicit human institutional decision using authorized membership;
7. inspect the resulting curriculum baseline/state;
8. produce a planning baseline/handoff for downstream teacher planning without mutating teacher-authored operational work automatically.

## Actors and authority

| Actor | Beta responsibility | Allowed consequential authority |
| --- | --- | --- |
| Teacher / contributor | inspect context, contribute/review proposal material, understand requirements | no institutional approval |
| Curriculum/department reviewer | inspect evidence, review proposal and prepare institutional recommendation | no final institutional approval unless separately granted by backend membership/capability |
| Institutional decision authority | make the controlled curriculum decision | only capabilities granted by authenticated workspace membership and RLS |
| Workspace administrator | create/manage access required for pilot operation | no curriculum authority by virtue of administration alone |
| System | resolve context, validate, project evidence/state, enforce gates | never assumes institutional decision authority |

A displayed or self-declared role is never sufficient to grant `REVISION_DECIDE`.

## Included Beta surfaces

Included only when needed by the canonical journey:

- curriculum context/applicability;
- curriculum/revision state;
- proposal inspection/preparation;
- decision surface and cognitive/human-authority gate;
- resulting curriculum baseline/state;
- planning baseline/export/handoff needed to demonstrate the outcome;
- authentication/workspace membership surfaces strictly required for pilot access;
- support/error/recovery surfaces required by the Beta journey.

## Explicitly excluded from first Beta

Unless a blocking dependency is proven:

- Classroom productization;
- Social;
- generic Copilot/AI expansion;
- broad Knowledge productization;
- student personal-data workflows;
- institution-wide administration beyond pilot membership setup;
- real-time Arena ↔ Docente OS synchronization;
- shared database between Arena and Docente OS;
- broad UDA operational authoring owned by Docente OS;
- architecture, shell or routing redesign;
- migration of every historical/legacy feature before pilot.

## Data boundary

The Beta uses professional and curricular data. Student personal data is not required for the canonical journey and is out of scope.

## Critical Human Tasks

The Beta-critical task registry consists of:

- `HT-BETA-CURRICULUM-CONTEXT`
- `HT-BETA-REVISION-PREPARE`
- `HT-REVISION-DECISION`
- `HT-BETA-PLANNING-HANDOFF`

A release candidate cannot satisfy HIA while any critical task lacks current evidence for its relevant states.

## B0 acceptance

B0 is complete when:

- this journey is canonical;
- actor/authority boundaries are explicit;
- included/excluded surfaces are explicit;
- all critical Human Tasks exist in `.human/tasks` and pass HIM validation;
- the machine execution state identifies B1 as the next ready phase;
- no runtime feature is smuggled into the scope-freeze tranche.

Exit label: `BETA_SCOPE_FROZEN`.
