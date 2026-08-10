# CML-TARGET-P2.1-D0 — Canonical Planning Work Object Decision

Date: 2026-08-10  
Input: P2.1-R0 reconnaissance (`fc92024`)  
Mode: product/domain decision; no runtime change authorized.

## Decision

The canonical object of professional work in PLAN is a persistent `DidacticPlanning` (or repository-equivalent `Planning`). It is distinct from the UDA artifact produced from it.

```text
CurriculumReference
        ↓
DidacticPlanning
        ├── class context
        ├── structured curriculum references
        ├── intentions and objectives
        ├── activity structure
        ├── assessment
        ├── materials and notes
        └── work status
        ↓
UDA definition / professional artifact
        ↓
teaching use and later improvement
```

The domain term should remain neutral (`DidacticPlanning` or `Planning`). `PlanningWorkspace` is reserved for the UI surface, not the domain object.

## Canonical responsibility map

| Current element | Canonical role | Authority after reconciliation |
|---|---|---|
| `UdaModel` | UDA professional artifact | UDA model and artifact compatibility layer |
| `DesignCurriculumSelection` | Structured curriculum reference/input value object | References held by `DidacticPlanning` |
| `localStorage` draft keys | Persistence mechanism | Adapter only; never domain authority |
| `GuidedTeacherWorkflowState` | UI/wizard presentation state | Presentation state only |
| UDA archive | Repository of derived artifacts | UDA artifact repository |
| `DidacticPlanning` | Current professional work | Single semantic authority for work in progress |

## Frozen invariants

1. A Planning is not a UDA. Planning represents work in progress; UDA represents a structured teaching artifact.
2. `GuidedTeacherWorkflowState` is not persistent domain truth.
3. Local storage is not the domain model; it is a persistence adapter.
4. `DesignCurriculumSelection` remains a reference/input object and does not become a second planning model.
5. A Planning preserves structured curriculum references, version identity and provenance.
6. A derived UDA preserves its relationship to the originating Planning and relevant curriculum references.
7. Resuming a Planning must not require reconstructing it from competing stores and UI state fragments.
8. Migration must not destroy existing archived UDAs.

## Minimal lifecycle direction

The lifecycle remains intentionally small until human validation proves the need for more states:

```text
draft → in_progress → ready → produces/updates UDA
```

`draft` and `in_progress` must not be introduced merely as labels. The minimum capability is that a Planning can be created, saved, resumed and transformed into a professional result without losing context or references.

## Identity direction

Planning and UDA have separate identities and an explicit genealogy:

```text
planningId = PLN-…
    ├── curriculum references (node/version/provenance)
    ├── teaching context (order/discipline/class/year)
    └── derived UDA reference = UDA-…
```

P1.3-E is therefore interpreted semantically as:

```text
CurriculumNode → CurriculumReference → DidacticPlanning → optional UDA
```

The existing A02→A04 transfer contract remains usable as a compatibility entry point. It does not need to be rewritten in D0; its target semantics are now fixed for incremental reconciliation.

## Runtime decomposition authorized after D0

Implementation remains pending further approval, but the bounded sequence is:

```text
P2.1-A  Canonical DidacticPlanning domain/read model + compatibility mapping
P2.1-B  PLAN-01 — Le mie progettazioni
P2.1-C  PLAN-02 — canonical PlanningWorkspace
P2.1-D  Planning → UDA materialization and PLAN-03
P2.1-E  resume/persistence/archive reconciliation
P2.1-R1 human workflow and H2V integration review
```

P2.1-A must include compatibility with existing persisted drafts, `savedUda` and `designArchive`. No destructive migration is implied.

## Explicitly out of scope

- UDA sharing or social genealogy;
- anonymous feedback;
- teaching-delivery/classroom experience;
- more autonomous AI behavior;
- curriculum revision workflow;
- PLAN visual redesign;
- runtime implementation before the compatibility/domain slice is separately authorized.

## Formal verdict

```text
CML_TARGET_P2_1_R0_ACCEPTED
CML_TARGET_P2_1_COMPETING_PLANNING_MODELS_CONFIRMED
CML_TARGET_P2_1_D0_CANONICAL_WORK_OBJECT_DECISION_COMPLETE
DIDACTIC_PLANNING_IS_CANONICAL_WORK_OBJECT
UDA_IS_DERIVED_PROFESSIONAL_ARTIFACT
GUIDED_WORKFLOW_STATE_IS_PRESENTATION_STATE
DESIGN_CURRICULUM_SELECTION_IS_REFERENCE_INPUT
LOCAL_STORAGE_IS_PERSISTENCE_MECHANISM
UDA_ARCHIVE_IS_ARTIFACT_REPOSITORY
P2_1_A_REQUIRES_COMPATIBILITY_LAYER
NO_RUNTIME_CHANGE_AUTHORIZED
```
