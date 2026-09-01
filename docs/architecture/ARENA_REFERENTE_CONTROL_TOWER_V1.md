# Arena Referente Control Tower v1

**Stage:** R4 — Runtime candidate  
**Parent:** `ARENA_ROLE_AWARE_HOME_V1.md`  
**Purpose:** give the Referente a compact process-readiness view without inventing whole-school coverage.

## Evidence boundary

The current runtime can aggregate reliably:

- user-local source count;
- local sources still pending verification;
- local sources eligible as retrieval evidence;
- canonical revision proposal counts by explicit status;
- proposals explicitly `accepted-for-decision`;
- decisions explicitly `recorded-local`.

The canonical `RevisionProposal` currently does **not** require structured discipline/order scope. `targetNodeRef.snapshotLabel` is a display snapshot, not a governed substitute for those dimensions.

Therefore R4 must not calculate or display percentages such as “93% curriculum coverage” or discipline-by-discipline completeness from labels, free text or AI inference.

## User experience

For the `referente` role only, Home shows a **Cabina di regia — Readiness del processo curricolare** before the normal R3 work queue.

It shows four grounded metrics:

1. **Fonti da verificare**;
2. **Evidenze locali**;
3. **Proposte in revisione**;
4. **Pronte per decisione**.

Secondary notes expose total registered sources, active proposals and locally recorded decisions.

Actions navigate only to the existing Fonti and Revisione surfaces. The control tower does not mutate process state.

## Scope limitation

The UI must display:

> **Copertura per disciplina: non ancora calcolabile**

with an explanation that the current registry supports process readiness but not a trustworthy discipline/order coverage percentage.

This limitation is a product requirement, not placeholder copy: it prevents a coordinator dashboard from presenting false institutional analytics.

## Authority

The Referente control tower is read/coordination UX. It grants no new capability and no institutional decision authority. `accepted-for-decision` means a proposal reached that canonical status; it does not mean the Referente may decide it.

## Non-goals

R4 does not:

- infer discipline/order from target labels;
- fabricate whole-school percentages;
- add a new data backend;
- change routing;
- implement P6 canonical adoption;
- grant `REVISION_DECIDE` to Referente;
- use AI to estimate readiness.

## Exit gate

R4 passes when:

- the aggregate selector uses only explicit source/revision states;
- discipline coverage is fail-closed as unavailable;
- the control tower renders only for Referente;
- actions lead to existing governed surfaces;
- focused tests, governance tests, TypeScript and build pass on one candidate SHA;
- no deploy is performed before the planned UX batch checkpoint.
