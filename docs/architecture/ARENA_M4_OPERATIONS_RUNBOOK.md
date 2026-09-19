# Arena M4 — Governance & Operations Runbook

Status: M4-S6 IMPLEMENTATION CONTRACT  
Date: 2026-09-19  
Tracker: #288  
Repository governance blocker: #105

## 1. Purpose

This is the canonical operations runbook for the CurManLight Arena **controlled production pilot**.

It consolidates release, rollback, incident, recovery, ownership, evidence freshness and repository-governance rules. Historical Beta documents remain useful evidence but do not override this runbook for current M4 operations.

## 2. Product boundary

The runbook preserves the canonical ecosystem boundary:

- **CurManLight Arena** — curriculum authority, provenance, review, validation and governed handoff;
- **Curriculum Atlas** — read-only semantic projection/navigation;
- **Docente OS** — teacher operational planning, UDA, lessons, materials, evidence and replanning.

Operations must not introduce a shared database, implicit synchronization or authority transfer across products.

## 3. Operational roles

For the controlled pilot, one repository owner may temporarily hold multiple operational roles, but each action remains explicit and auditable.

| Role | Responsibility | Pilot default |
| --- | --- | --- |
| Governance Authority | accepts residual operational risk; authorizes pilot continuation or stop | repository owner/admin |
| Release Operator | dispatches exact-SHA Beta releases; records release evidence | repository owner/admin |
| Incident Coordinator | classifies incidents; opens/updates canonical incident issue | repository owner/admin |
| Recovery Authority | authorizes rollback when data/authority/release integrity is at risk | repository owner/admin |
| Evidence Steward | marks evidence current/stale and maintains closeout receipts | repository owner/admin |

These roles govern software operations only. They do not confer institutional curriculum authority.

## 4. Release rule

A release candidate is identified by an immutable 40-character Git SHA.

Before a Beta candidate may be treated as human-reviewable:

1. PR head must equal the candidate SHA;
2. applicable automated gates must be PASS on that exact head;
3. at minimum the universal checks must be green:
   - `product-gate`;
   - `beta-release-contract`;
4. additional path-triggered gates must pass when applicable;
5. `Deploy Arena Beta` must be dispatched with the exact SHA;
6. public smoke must emit `BETA_PUBLISHED_SMOKE_PASS <sha>`;
7. human review must occur after that deployment and be bound to the same SHA.

A merge is allowed only with an expected-head guard. If the head moves, the prior release/human evidence is stale.

## 5. Repository-hosting governance

M4 requires GitHub-hosting enforcement on `main`.

Required desired state:

- direct push to `main` blocked;
- pull request required before merge;
- required status checks:
  - `product-gate`;
  - `beta-release-contract`;
- branch must be up to date before merge;
- conversations resolved before merge;
- force push disabled;
- branch deletion disabled;
- bypass of the rule disabled for normal repository administration where GitHub plan/UI permits it.

Why only two required checks at hosting level:
- both run on every PR to `main`;
- path-filtered checks such as `validate-him`, Beta E2E or browser evidence remain mandatory when applicable, but must not be configured as universal required checks because GitHub would wait forever on PRs that do not trigger them.

Current observation at M4-S6 opening:
- rulesets API: `[]`;
- `main.protected = false`;
- branch protection `enabled = false`.

Therefore GOV-01/#105 remains a release-governance blocker until the effective GitHub configuration is re-read and recorded.

## 6. Incident severity

### SEV-0 — stop immediately
Examples:
- credential/token exposure;
- unauthorized institutional action or authority bypass;
- destructive or cross-scope data corruption;
- public release identity differs from intended exact SHA;
- security/privacy event with plausible impact.

Action:
- stop promotion/use of affected flow;
- open Beta incident with exact release SHA;
- Recovery Authority decides rollback;
- do not resume until containment and evidence are complete.

### SEV-1 — core pilot blocked
Examples:
- canonical Beta journey unavailable;
- authenticated shared review/persistence unavailable with no safe workaround;
- reload/re-entry loses governed work;
- release-caused regression blocks the main pilot task.

Action:
- freeze promotion;
- assess rollback to last known-good SHA;
- create remediation PR with exact-head certification.

### SEV-2 — degraded with safe workaround
Examples:
- non-core surface failure;
- bounded workflow confusion;
- recoverable persistence/import/export issue without authority/integrity loss.

Action:
- log incident/finding;
- document workaround;
- remediate before the next relevant promotion if material.

### SEV-3 — minor
Examples:
- cosmetic/layout issue;
- low-impact wording defect;
- non-blocking discoverability issue.

Action:
- backlog or next maintenance slice.

## 7. Incident intake

Canonical intake: `.github/ISSUE_TEMPLATE/beta-incident.yml`.

Every incident must include:
- exact release SHA;
- severity and task impact;
- human task being attempted;
- observed vs expected behavior;
- whether recovery succeeded;
- explicit privacy confirmation.

Never include:
- student personal data;
- passwords;
- access/refresh tokens;
- private keys;
- private connected-account content.

## 8. Recovery and rollback

### Product/data recovery
- personal local work follows the M4-S5 bounded hybrid persistence contract;
- authenticated shared institutional records remain behind server repositories + RLS;
- explicit backup/export is portability, not authority;
- no recovery action may silently promote local state into institutional authority.

### Release rollback
Rollback uses only the canonical `Deploy Arena Beta` workflow:

1. identify the previous known-good immutable SHA;
2. record why rollback is required and the incident/finding ID;
3. dispatch `Deploy Arena Beta` with that SHA;
4. require build/release verification PASS;
5. verify public `beta-release.json`;
6. require `BETA_PUBLISHED_SMOKE_PASS <previous-sha>`;
7. smoke-test the affected human task;
8. record the rollback receipt.

No manual editing of GitHub Pages artifacts is allowed.

## 9. Evidence hygiene

Evidence is **CURRENT** only when all claims that depend on mutable state are bound to the same relevant identity.

### Exact-head evidence
Automated PR evidence is current only for the exact PR head SHA. Any new commit makes prior head-specific evidence stale for promotion.

### Published-Beta evidence
A Beta receipt is current only for the SHA proven by:
- exact workflow input/checkout;
- release contract;
- public smoke/release identity.

A later successful Beta deployment supersedes the previous release as the public-current Beta unless an explicit rollback restores it.

### Human evidence
Human evidence is promotion-valid only when:
- collected after deployment of the candidate;
- collected on the published candidate SHA;
- the candidate PR head has not moved.

### Historical documents
Historical audits, old screenshots, earlier PR comments and superseded Beta receipts are **HISTORICAL**, not current authorization.

### Current tracker
Issue #121 is the canonical M4 tracker. If its body conflicts with merged evidence, the tracker must be reconciled before maturity claims are made.

## 10. Known limitations and blockers

### Governed bounded limitation
- canonical curriculum persistence remains `legacy-only` for M4, per M4-S5; this does not authorize automatic migration.

### Parallel source finding
- A3/#280: non-current planning reference / source-registry convergence remains open and is not absorbed by M4-S6.

### Release-governance blocker
- #105: `main` hosting protection is required before A10/M4 operations closure.

## 11. Stop / go rules

**STOP** if any of the following is true:
- public Beta identity is not the intended SHA;
- PR head moved after certification/human review;
- SEV-0 incident is open;
- an authority boundary is bypassed;
- `main` governance is not enforceable when making the final M4 production-pilot decision;
- a blocker is being re-labelled as a limitation without explicit governance decision.

**GO** for the next controlled-pilot step only when:
- exact-head gates are valid;
- deployment identity is valid;
- human review is valid where required;
- no SEV-0/SEV-1 release blocker remains;
- repository-hosting governance is effective.

## 12. M4-S6 closeout rule

M4-S6 may close only when:
- repository-side runbook/contracts/guards are PASS;
- exact Beta and human review are PASS;
- GitHub `main` protection is observed as effective;
- #105 is closed with evidence.

A3/#280 remains a separate maturity finding and is evaluated independently for the final M4 decision.

Exit token:

`ARENA_M4_GOVERNANCE_OPERATIONS_CANONICAL`
