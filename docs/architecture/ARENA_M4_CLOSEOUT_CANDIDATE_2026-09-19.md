# CurManLight Arena — M4 Closeout Candidate

Status: **NOT YET AUTHORIZED / GOVERNANCE CLOSURE IN PROGRESS**  
Date: 2026-09-19  
Tracker: #121  
M4-S6: #288  
Canonical base before M4-S6: `main@5aa521358dedc4c615dea3da64b8035a89c746e4`

## 1. Purpose

This document is the current maturity closeout candidate after M4-S1 through M4-S5.

It does not authorize the M4 production pilot by itself. It exists to prevent historical audit text, stale receipts or partial slice completion from being mistaken for the final decision.

## 2. Closed maturity items

- **A1** Canonical Surface Freeze — closed.
- **A2** Routing Consolidation — M4-S1 / PR #276.
- **A4** Revision Single Source of Truth — M4-S3 / PR #282.
- **A5** Automation/User UI Parity — M4-S2 / PR #278.
- **A6** Arena / Curriculum Atlas / Docente OS Boundary — M4-S4 / PR #285.
- **A7** Persistence governed limitation — M4-S5 / PR #287.
- **A8** Full G5 HVA — accepted.
- **A9** G6 Accessibility — accepted.

## 3. Still open

### A3 — Sources Registry
Issue #280 remains open. The visible non-current planning reference and source-registry convergence are not silently accepted by M4-S6.

### A10 — Operations / Governance Closure
Repository-side operations are being consolidated in M4-S6, but GOV-01/#105 remains open while GitHub reports:
- `main.protected = false`;
- branch protection disabled;
- rulesets `[]`.

Therefore A10 is not yet closed.

## 4. M4 operational architecture

The current M4 architecture is:

**Arena governs → Curriculum Atlas navigates → Docente OS operates.**

Persistence is bounded hybrid:

- personal/local continuity → IndexedDB/Dexie;
- authenticated shared/institutional records → Supabase repositories + RLS;
- canonical curriculum persistence remains `legacy-only` as a governed pilot limitation;
- OAuth credentials are memory-only;
- no shared database/sync across Arena, Atlas and Docente OS.

## 5. Operations model

Current M4 operations are defined by:
- `ARENA_M4_OPERATIONS_RUNBOOK.md`;
- `ARENA_MAIN_PROTECTION_REQUIRED_M4S6.json`;
- `ARENA_M4_EVIDENCE_REGISTRY_2026-09-19.md`;
- `ARENA_M4_KNOWN_LIMITATIONS_2026-09-19.json`.

Release promotion remains exact-SHA governed, with immutable Beta deployment and human review on the published candidate.

## 6. Decision state

Current decision:

`ARENA_M4_DECISION_PENDING`

It may not become `ARENA_M4_CONTROLLED_PRODUCTION_PILOT` while a current blocker is unresolved or while repository-hosting governance is unenforced.

M4-S6 can close A10 only after #105 is materially closed. The final disposition of A3/#280 must then be handled explicitly before the overall M4 decision.

## 7. Non-claim

This document does not:
- claim institution-wide production readiness;
- convert A3 into an accepted limitation;
- authorize curriculum persistence migration;
- authorize broad feature expansion;
- replace exact release evidence.

