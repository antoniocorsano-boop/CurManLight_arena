# Arena M4 — Evidence Registry

Status: CURRENT M4-S6 EVIDENCE HYGIENE INDEX  
Date: 2026-09-19

## Current canonical governance

| Artifact | Status | Purpose |
| --- | --- | --- |
| issue #121 | CURRENT | canonical A1–A10 maturity tracker |
| `ARENA_M4_OPERATIONS_RUNBOOK.md` | CURRENT | release/rollback/incident/recovery/ownership |
| `ARENA_MAIN_PROTECTION_REQUIRED_M4S6.json` | CURRENT DESIRED STATE | GitHub main governance required for #105 |
| `ARENA_BOUNDED_HYBRID_PERSISTENCE_M4S5.md` | CURRENT | M4 persistence decision |
| `ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md` | CURRENT | three-product responsibility boundary |
| issue #280 | CURRENT OPEN FINDING | A3 source-registry/non-current planning reference |
| issue #105 | CURRENT OPEN BLOCKER | repository-hosting governance |

## Current release evidence

A release receipt is current only if it names:
- the exact candidate SHA;
- the Deploy Arena Beta run;
- public smoke identity;
- human review collected after that exact deployment.

A later successful deployment supersedes the previous public-current Beta unless an explicit rollback restores it.

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
