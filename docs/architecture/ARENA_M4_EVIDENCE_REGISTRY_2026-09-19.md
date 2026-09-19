# Arena M4 — Evidence Registry

Status: CURRENT M4-S6 EVIDENCE HYGIENE INDEX  
Date: 2026-09-19

## Current canonical governance

| Artifact | Status | Purpose |
| --- | --- | --- |
| issue #121 | CURRENT | canonical A1–A10 maturity tracker |
| `ARENA_M4_OPERATIONS_RUNBOOK.md` | CURRENT | release/rollback/incident/recovery/ownership |
| `ARENA_MAIN_PROTECTION_REQUIRED_M4S6.json` | CURRENT VERIFIED STATE + DESIRED CONTRACT | effective GitHub main governance and required configuration |
| `ARENA_BOUNDED_HYBRID_PERSISTENCE_M4S5.md` | CURRENT | M4 persistence decision |
| `ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md` | CURRENT | three-product responsibility boundary |
| issue #280 | CURRENT OPEN FINDING | A3 source-registry/non-current planning reference |
| issue #105 | CURRENT CLOSED EVIDENCE | GOV-01 repository-hosting governance verified and closed |

## Current repository-hosting evidence

Re-read after the administrative GitHub action on 2026-09-19:

- ruleset `Protect main`, id `23698740`, enforcement `active`;
- target exactly `refs/heads/main`;
- no bypass actors; `current_user_can_bypass=never`;
- pull request required before merge;
- conversation resolution required;
- required checks exactly `product-gate` and `beta-release-contract`;
- strict/up-to-date required-check policy enabled;
- branch deletion blocked;
- force push blocked;
- branch API reports `main.protected=true`.

Issue #105 is therefore closed. This is mutable hosting-state evidence and must be re-read again if repository rules are changed.

## Current release evidence

A release receipt is current only if it names:
- the exact candidate SHA;
- the Deploy Arena Beta run;
- public smoke identity;
- human review collected after that exact deployment.

A later successful deployment supersedes the previous public-current Beta unless an explicit rollback restores it.

The prior M4-S6 exact-head evidence for `b7e8ddc0bb4ad4c0d471983d6ad3a17a33915fab` becomes historical for promotion once this governance-closure evidence is committed. The resulting new PR head must be certified again before deployment.

## Historical evidence

The following remain valuable historical records but do not authorize current promotion by themselves:

- `CML_ARENA_BETA_READINESS_AUDIT_v1.md`;
- `SYSTEM_MATURITY_AUDIT_2026-08-30_CANONICAL.md`;
- `ARENA_M4_REEVALUATION_2026-09-19.md`;
- earlier G5/G6 acceptance packs and receipts;
- prior exact-Beta receipts after a newer successful deployment.

Historical does not mean incorrect. It means **not sufficient as current-state authorization**.

## Staleness rules

Evidence becomes stale for promotion when:
1. PR head changes;
2. a newer successful Beta is published;
3. a relevant authority/persistence/boundary contract changes;
4. a blocker previously assumed closed is observed open;
5. the canonical tracker conflicts with merged repository evidence.

Stale evidence is retained for audit history; it is never silently rewritten as current.

## M4 decision rule

The final M4 decision must be based on:
- current tracker #121;
- current repository-hosting governance state;
- current known limitations/blockers;
- latest exact-Beta receipt;
- exact-head automated gates;
- human evidence on that same published SHA.

No maturity percentage or historical acceptance receipt can override a current blocker.
