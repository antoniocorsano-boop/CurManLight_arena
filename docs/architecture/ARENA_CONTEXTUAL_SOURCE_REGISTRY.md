# Arena Contextual Source Registry — Slice B

**Status:** implementation candidate, human validation required  
**Parent boundary:** CML-DRIVE-01 / PR #202  
**Scope:** local source governance and contextual usability; no Google Drive synchronization

## Product rule

Arena must distinguish four independent questions for every source:

1. **What exact source version is this?**
2. **Has a human verified this version?**
3. **What authority does the source actually have?**
4. **Is that verified version usable in the current school context?**

A positive answer to one question never implies a positive answer to another.

In particular:

> Human verification of a user-uploaded source never promotes it to institutional or normative authority.

## Existing model reused

Slice B does not introduce a parallel source model. It reuses:

- canonical `Source` and `SourceVersion` from CML-633C;
- the R7B1 local source verification gesture;
- `SourceGovernanceRecord`, `SourceUsageContext` and the fail-closed usability rules introduced by CML-DRIVE-01.

Local knowledge documents are projected into the canonical source model only for governance evaluation. Their authority remains `personal` unless a separate governed institutional process explicitly changes authority outside this slice.

## Persistence

IndexedDB database `curmanlight-local-knowledge-v1` is upgraded from schema v1 to v2.

Schema v2 adds:

- `governance`: one persisted governance record per `sourceId + sourceVersionId`;
- `meta`: browser-local metadata, including a stable non-secret local principal identifier.

Source and governance writes are paired transactionally where the source lifecycle changes. Deleting a local source also removes its governance records.

The principal identifier is created atomically to prevent concurrent migration of multiple pre-existing sources from generating inconsistent principals.

## Exact-version binding

Contextual validity is bound to a SHA-256 fingerprint of the current source content.

If the content fingerprint differs from the fingerprint stored in governance, Arena fails closed:

- the source is not context-valid;
- it is not evidence-eligible;
- the user must perform a new explicit verification.

A filename, timestamp or pre-existing verification label cannot override a fingerprint mismatch.

## Context

For the current local implementation, verification can bind the source to:

- local principal;
- institute identifier, when an institutional profile is configured;
- school order;
- discipline.

The evaluation also receives the current local date so that the CML-DRIVE-01 validity window contract can be enforced when temporal bounds are present.

## Human surface

The `Fonti` surface is divided into two operational groups:

### Fonti valide per me / per questo contesto

A source appears here only when all required checks pass:

- governance exists and is structurally valid;
- exact version fingerprint matches;
- R7B1 human verification exists;
- local principal and declared context match;
- canonical source/version status is usable.

A valid source can still be **consult-only** when extraction is incomplete. Context validity and evidence eligibility remain separate.

### Fonti disponibili ma non utilizzabili nel contesto

Sources remain visible here when they fail one or more checks. Arena shows the reason, for example:

- needs verification;
- context mismatch;
- stale version;
- governance missing or invalid.

This avoids hiding material while preventing accidental use as valid evidence.

## Fail-closed behavior

If IndexedDB, cryptographic fingerprinting or the governance registry cannot be read, Arena must not infer validity from legacy fields. The UI explicitly reports that no local source will be declared valid until governance can be evaluated.

## Authority boundary

R7B1 remains a verification mechanism, not an authority-promotion mechanism.

For this slice:

- uploaded local source → `personal` authority;
- verified uploaded local source → still `personal` authority;
- institutional/normative promotion → **out of scope and forbidden by implication**.

## Google Drive boundary

No Drive API is used in Slice B.

Drive remains reserved for a later explicit backup/export slice with the CML-DRIVE-01 constraints:

- outbound snapshot only;
- manifest + fingerprint + receipt;
- no bidirectional synchronization;
- no authority derived from Drive presence;
- restore only as an explicit human action.

## Automated gates

The dedicated workflow verifies:

- CML-DRIVE-01 domain invariants;
- contextual source classification;
- legacy source-authority safeguards;
- lifecycle safeguards;
- real IndexedDB persistence in headless Chromium;
- TypeScript;
- production build.

Technical green status does not replace the human validation gate for the `Fonti` workflow.
