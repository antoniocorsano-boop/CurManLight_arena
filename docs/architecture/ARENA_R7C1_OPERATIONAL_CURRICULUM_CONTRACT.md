# Arena R7C1 — Operational Curriculum Contract

Status: **IMPLEMENTED_AS_CONTRACT_ONLY**

## Purpose

R7C1 freezes the single operational composition contract that later Arena runtime flows must consume.
It does not create a new curriculum repository and does not activate migration.

The contract composes three existing planes:

1. **CML-633C canonical curriculum domain** for versioned curriculum entities;
2. **D.M. 221/2025 national registry** for native target identities and source-bound national elements;
3. **R7 institutional authority** for prepared/active canonical state.

The legacy `CurriculumMap` remains a migration/input plane only and can be represented solely as a
`LEGACY_CURRICULUM_MAP_PROJECTION` with `NON_AUTHORITATIVE` authority.

## Core object

`OperationalCurriculumAggregateV1` is a serializable snapshot with:

- one `curriculumVersionRef`;
- explicit institution identity;
- explicit source plane;
- authority state kept separate from semantic status;
- native curriculum targets;
- version-bound segments, nodes and links;
- stable node references for downstream planning/UDA work;
- source references and national element evidence on each node;
- text fingerprints for materialization/source matching.

It is a composition boundary, not a fourth persistence model.

## Native target identity

The target union is deliberately not `discipline + schoolOrder` for every school order.

### First cycle

A first-cycle target is:

```text
DISCIPLINE + FirstCycleDisciplineId + primaria|secondaria
```

and is validated against `DM221_FIRST_CYCLE_DISCIPLINES`.

### Infanzia

An infanzia target is:

```text
FIELD_OF_EXPERIENCE + InfanziaFieldId + infanzia
```

and is validated against `DM221_INFANZIA_FIELDS`.

Projecting `TECNOLOGIA`, `ITALIANO`, `MATEMATICA`, or another first-cycle discipline onto
`infanzia` is a contract error: `INFANZIA_DISCIPLINE_PROJECTION_FORBIDDEN`.

### Special national segments

Cross-disciplinary frameworks, conditional offerings and external-authority subjects can use
`SPECIAL_SEGMENT`, validated against `DM221_SPECIAL_SEGMENTS` and the requested school order.

## Authority is not completeness

R7C1 keeps two independent axes.

### Authority state

- `NON_AUTHORITATIVE`
- `PREPARED`
- `ACTIVE`
- `SUPERSEDED`

Any state beyond `NON_AUTHORITATIVE` requires:

- source plane `CML_633C_CANONICAL_DOMAIN`;
- external `authorityRef`;
- materialization reference;
- SHA-256 materialization fingerprint.

`PREPARED` additionally requires its institutional `decisionReceiptRef`.

No local role, localStorage flag, legacy decision or legacy projection can satisfy these fields by
inference.

### Semantic status

- `UNASSESSED`
- `STRUCTURAL_ONLY`
- `ELEMENT_BOUND`
- `SEMANTICALLY_VALIDATED`

`SEMANTICALLY_VALIDATED` requires an explicit `semanticValidationRef`.
R7C1 does not itself claim that the declared curriculum scope is semantically complete; that is a
later R7C3 responsibility.

## National prescriptive invariant

A node may be labeled `NATIONAL_PRESCRIPTIVE` only when all of the following are true:

1. `origin = normative-source`;
2. the node has a SHA-256 text fingerprint;
3. at least one bound national element is `SOURCE_VERIFIED`;
4. that element was verified by a person;
5. `canonicalTextStatus = HUMAN_VERIFIED_SOURCE_TEXT`;
6. the source element belongs to the same school order;
7. the source element belongs to the **same canonical national segment** as the operational target;
8. the verified source-text fingerprint is identical to the node text fingerprint.

The exact segment constraint is mandatory: a verified element from Italiano cannot authorize a
Tecnologia node merely because both belong to `secondaria`.

This closes the architectural gap where a legacy `traguardo` or `obiettivo` could otherwise be
projected downstream as `NATIONAL_PRESCRIPTIVE` solely because it occupied a legacy curriculum
slot.

The contract does not yet change P7 runtime behavior; it defines the mandatory gate that R7C2/R7C3
must apply before migration of that behavior.

## Graph integrity

The aggregate validator fails closed on:

- duplicate segment, node or link references;
- version mismatches;
- nodes whose segment does not exist;
- segment/node back-reference mismatches;
- links to missing nodes;
- self-links;
- duplicate `target + scopeRef` segment identities;
- invalid D.M. 221 target/order combinations.

This makes downstream references suitable for later UDA/programming bindings without relying on
array positions or copied text as identity.

## Active canonical content

When authority state is `ACTIVE`, the contract rejects:

- nodes whose lifecycle is not `ACTIVE`;
- `LOCAL_WORKING` nodes;
- `synthetic` origin;
- `demonstration` origin.

This is intentionally stricter than local editing. Proposals, generated drafts and imported legacy
material can enter review/migration processes, but cannot appear inside an active canonical snapshot
without first passing the appropriate institutional transition.

## Relationship to existing domains

### CML-633C

CML-633C remains the canonical entity model and future source of the operational aggregate.
R7C1 does not replace its repositories, constructors or validators.

Its historical discipline-centric segment contract is not used as the sole operational target
identity for infanzia. R7C1 supplies the native target union needed for convergence; a later
migration tranche can evolve/persist this identity without rewriting the old model in place.

### CML-630E / legacy persistence

No change. `CURRICULUM_PERSISTENCE_MODE` remains `legacy-only`.

### `CurriculumMap`

No change to productive reads/writes. Direct projection is allowed only as non-authoritative input.

### R7A8 / P6

No SQL or authority mutation. `authorityRef`, materialization metadata and decision receipt are
external evidence consumed by the operational contract, not recreated locally.

### R7B3 / PR #174

R7C1 does not import the new infanzia element inventory from PR #174 and does not expand P3.
It uses only the already-canonical five field identities present on `main`, so the branch remains
independent and can be integrated without making #174 authoritative.

## Tests

`src/__tests__/r7c1-operational-curriculum-contract.test.ts` covers:

- source-bound Technology first-cycle target;
- native infanzia field target;
- rejection of infanzia discipline projection;
- fail-closed national source verification/fingerprint matching;
- rejection of cross-discipline national source binding;
- rejection of authoritative legacy projection;
- authority/semantic separation;
- graph/version integrity;
- rejection of unfinished or synthetic content in an `ACTIVE` aggregate.

The test is included in `vitest.fast.config.ts`, so Product CI exercises the contract.

## Explicit non-goals

R7C1 does **not**:

- change `CURRICULUM_PERSISTENCE_MODE`;
- activate CML-633C as runtime primary;
- migrate `CurriculumMap`;
- modify P3 scope;
- modify P7 handoff;
- modify canonical SQL materialization;
- adopt or promote PR #174 infanzia data;
- change UDA persistence;
- deploy anything.

## Exit condition

R7C1 is complete when the contract and its regression tests pass on one immutable SHA.

The next implementation tranche is **R7C2 — Tecnologia end-to-end**, which must construct one real
`OperationalCurriculumAggregateV1` for Tecnologia from verified national elements plus the
institutional curriculum, and prove that downstream planning consumes stable node/version refs rather
than the legacy `CurriculumMap` authority shortcut.
