# CurManLight Arena — Product Roadmap

**Status:** GOVERNED DIRECTION / DOES NOT SELF-AUTHORIZE IMPLEMENTATION  
**Reconciled:** 2026-09-24  
**Owner:** Arena  
**Superseding context:** current TRAMA governance, current Arena governed memory, live exact-head evidence

## 1. Purpose

This roadmap states **Arena product direction**, not ecosystem execution order.

The canonical ecosystem sequence is owned by TRAMA. This document must not create a competing phase model, promote a runtime, close a gate, or infer readiness from elapsed time.

Product boundary:

- **Arena:** GOVERN
- **Curriculum Atlas:** NAVIGATE / PUBLISH within its authority
- **Docente OS:** OPERATE
- **TRAMA:** ecosystem governance/coherence; not a fourth operational product

## 2. North Star

Arena is the governed institutional memory of curriculum.

It should make it possible to establish, with provenance:

```text
applicable sources
  -> governed curriculum baseline
  -> proposal / review
  -> explicit institutional decision
  -> adoption / applicability state where governed
  -> versioned handoff
  -> professional evidence
  -> human-governed review
```

The system must keep separate:

```text
Person != Role != Capability != Authority
Proposal != Review != Institutional Decision
Approval != Adoption
Evidence != Decision
Applicability != Adoption
```

## 3. Active invariants

Every Arena increment must preserve:

1. authority fails closed;
2. provenance remains explicit;
3. no pupil-level operational data enters Arena by implication;
4. no shared canonical mutable database with Atlas or Docente OS;
5. no automatic cross-product authority write;
6. teacher/professional evidence may trigger review but not mutate canonical curriculum automatically;
7. AI may assist analysis/drafting but may not grant authority, approve, adopt or silently write canonical state;
8. exact-head evidence is required for promotion claims;
9. human review remains distinct from automated PASS;
10. new runtime capability requires its own authorization and gate.

## 4. Current priority line

Arena work should follow the **current TRAMA order**, not a locally invented sequence.

At the time of this reconciliation the relevant priorities are:

### A. Preserve and close current governed work

- keep Arena authoritative for curriculum;
- support ECO-02/P1 until the integrated real-case human test is complete;
- avoid introducing side capabilities that distract from the active pilot and Atlas closure work;
- keep DOS-A1 deferred unless separately authorized.

### B. Maintain the Arena → Docente OS boundary

The direct curriculum intake/revalidation path remains canonical for authority.

Arena should continue to provide:
- versioned curriculum context;
- provenance and authority state;
- structural/authority fingerprints where required;
- explicit revalidation semantics.

Atlas does not intermediate curriculum authority.

### C. Maintain the Arena → Atlas publication/projection boundary

Arena may provide governed curriculum snapshots/projections to Atlas.

Required properties:
- stable identity/version;
- provenance;
- explicit authority/lifecycle state;
- deterministic change detection;
- fail-closed incompatibility;
- no personal student data.

Atlas cannot promote an Arena proposal to approved state and cannot mutate Arena.

### D. Adoption / validation maturity

Arena should continue to mature the distinction among:
- applicable framework;
- baseline;
- institutional decision;
- adoption;
- review/validation;
- evidence.

This work must extend current governed contracts rather than create a parallel process application.

### E. Professional evidence return

Docente OS may return teacher-confirmed professional evidence for review.

Allowed role:
- observation;
- implementation issue;
- clarification request;
- revision suggestion;
- coverage/professional evidence.

Forbidden role:
- automatic proposal approval;
- automatic baseline mutation;
- automatic adoption;
- pupil-level analytics into Arena.

## 5. Product surfaces

Future Arena work should strengthen existing surfaces before creating new ones.

### Home

Should orient the authorized human to:
- current governed context;
- relevant state;
- next action;
- blockers/recovery.

### Curricolo

Should expose:
- applicable framework;
- baseline/version;
- provenance;
- lifecycle/authority state.

### Riesame

Should remain the primary review/decision workspace rather than duplicating governance in a second process surface.

### Fascicolo / Fonti

Should expose:
- source identity/version;
- provenance;
- verification;
- applicability;
- authority class.

### Documenti / Handoff

Should produce explicit versioned artifacts/receipts where required.

### Verifiche

Should expose real blockers and evidence gaps rather than generic “compliance” claims.

## 6. Explicitly deferred or separately governed

This roadmap does not authorize:

- Arena as classroom/student workspace;
- Arena as general teaching-material repository;
- automatic UDA generation as institutional authority;
- student profiling;
- shared mutable DB with Atlas or Docente OS;
- automatic institutional decisions;
- automatic cross-product writes;
- DOS-A1;
- Docente OS → Atlas publication runtime;
- Material Studio / Officina runtime;
- broad new AI surfaces without a bounded human task;
- external reference frameworks becoming curriculum authority by ingestion.

## 7. External reference frameworks

Frameworks such as AILit may be represented as `EXTERNAL_REFERENCE`.

They may:
- inform analysis;
- support mappings;
- support professional planning.

They may not become national/institutional requirements without an explicit governed human decision.

## 8. Definition of Done for an Arena slice

A slice is complete only when applicable evidence confirms:

- domain semantics are explicit;
- ownership/boundary is clear;
- positive and negative tests exist;
- provenance is preserved;
- authority fails closed;
- accessibility/Human Interaction requirements are met;
- CI/build passes on exact head;
- deployment identity is proven when runtime evidence requires it;
- human acceptance is recorded where required;
- rollback/recovery is defined;
- adjacent non-effects are documented.

## 9. Roadmap governance rule

Before starting a roadmap item:

1. read `AGENTS.md`;
2. read current governed memory;
3. check current TRAMA status/order;
4. inspect open decision/promotion PRs;
5. verify authorization;
6. define the smallest coherent slice;
7. freeze acceptance criteria;
8. implement;
9. stop at the next human/governance gate.

A roadmap entry is **direction**, never authorization.

## 10. Maintenance

Update this roadmap only when product direction changes.

Do **not** update it merely because:
- a PR merged;
- a test passed;
- a maturity score changed;
- a deployment completed.

Those belong to live status/evidence, not strategic direction.
