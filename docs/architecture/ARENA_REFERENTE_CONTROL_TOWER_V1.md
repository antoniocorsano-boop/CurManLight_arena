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

Two additional limits are mandatory.

First, a proposal can remain `accepted-for-decision` after a terminal institutional receipt has already been written to the authenticated workspace. Therefore the local `RevisionArchive` alone is not sufficient to assert that such a proposal is still ready for decision. R4 must either combine the local archive with authoritative institutional receipt coverage or fail closed and display the readiness value as unavailable.

Second, the canonical `RevisionProposal` currently does **not** require structured discipline/order scope. `targetNodeRef.snapshotLabel` is a display snapshot, not a governed substitute for those dimensions.

Therefore R4 must not calculate or display percentages such as “93% curriculum coverage” or discipline-by-discipline completeness from labels, free text or AI inference.

## User experience

For the `referente` role only, Home shows a **Cabina di regia — Readiness del processo curricolare** before the normal R3 work queue.

It shows four grounded metrics:

1. **Fonti da verificare**;
2. **Evidenze locali**;
3. **Proposte in revisione**;
4. **Pronte per decisione** — numeric only when decision-receipt coverage is authoritative; otherwise `—` with a workspace-verification notice.

Secondary notes expose total registered sources, active proposals and locally recorded decisions.

Actions navigate only to the existing Fonti and Revisione surfaces. The control tower does not mutate process state.

## Scope limitation

The UI must display:

> **Copertura per disciplina: non ancora calcolabile**

with an explanation that the current registry supports process readiness but not a trustworthy discipline/order coverage percentage.

This limitation is a product requirement, not placeholder copy: it prevents a coordinator dashboard from presenting false institutional analytics.

## Decision-readiness limitation

For proposals in `accepted-for-decision`:

- a terminal local decision (`approve`, `approve-with-changes`, `reject`) removes the proposal from the ready count;
- a known terminal institutional receipt removes the proposal from the ready count;
- if unresolved proposals remain and institutional receipt coverage has not been read authoritatively, the ready count is **unknown**, not an inferred number.

`defer` and `return-for-revision` are not treated as terminal decisions for this metric.

## Authority

The Referente control tower is read/coordination UX. It grants no new capability and no institutional decision authority. `accepted-for-decision` means a proposal reached that canonical status; it does not mean the Referente may decide it.

## Non-goals

R4 does not:

- infer discipline/order from target labels;
- fabricate whole-school percentages;
- pretend institutional receipt coverage exists when it has not been read;
- add a new data backend;
- change routing;
- implement P6 canonical adoption;
- grant `REVISION_DECIDE` to Referente;
- use AI to estimate readiness.

## Exit gate

R4 passes when:

- the aggregate selector uses only explicit source/revision states;
- terminal decisions/receipts cannot remain false blockers;
- decision readiness fails closed when institutional receipt coverage is unavailable;
- discipline coverage is fail-closed as unavailable;
- the control tower renders only for Referente;
- actions lead to existing governed surfaces;
- focused tests, governance tests, TypeScript and build pass on one candidate SHA;
- no deploy is performed before the planned UX batch checkpoint.
