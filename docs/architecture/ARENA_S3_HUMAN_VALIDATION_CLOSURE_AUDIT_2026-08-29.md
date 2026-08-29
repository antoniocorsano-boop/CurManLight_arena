# ARENA-S3 — Human validation closure audit

Date: 2026-08-29
Status: REWORK_REQUIRED
Baseline: `main@f0a9b0c1ea279d017d9d772d03a623a7ff953c8c`
Branch: `stabilization/arena-s3-human-validation-closure`

## Purpose

Close one traceable validation chain for the stabilized Arena critical journeys:

`Human Task → HIM → browser desktop/mobile → immutable deployed release → human acceptance receipt`.

Automation supports observation and regression detection. It never substitutes human acceptance.

## Verified foundations

### Human Task contract — PASS

`src/features/guided-workflow/humanTask.ts` is a read model over canonical state, requires canonical sources and stakeholder evidence, fails closed on missing cognitive/provenance requirements, forbids system-owned institutional decisions and requires explicit human confirmation for `REVISION_DECIDE`.

### Frozen critical Human Tasks — PASS

The four G5 tasks exist under `.human/tasks` and match the acceptance pack:

1. `HT-BETA-CURRICULUM-CONTEXT`
2. `HT-BETA-REVISION-PREPARE`
3. `HT-REVISION-DECISION`
4. `HT-BETA-PLANNING-HANDOFF`

### HIM workflow — PARTIAL COVERAGE

`human-interaction-model.yml` validates the HIM installation and supports `workflow_dispatch`, but automatic PR execution is path-filtered to HIM-specific files. A product change can therefore alter a critical journey without producing a same-SHA HIM run.

### Automated browser evidence — PARTIAL COVERAGE

- `Beta E2E Workflow` covers the revision/authority journey and a bounded browser verification, but it is path-filtered and not a complete four-task human journey audit.
- `KX Mobile Browser Audit` runs at 390x844, but only for KX-specific paths and surfaces.
- `Live Beta Assistant Browser Audit` runs after a successful Beta deploy, but is limited to the Assistant surface.

These controls are valuable specialist gates; none alone proves the complete G5 journey on desktop and mobile.

### Human acceptance pack — VALID MODEL, STALE RELEASE BINDING

`BETA_G5_HUMAN_ACCEPTANCE_PACK_2026-08-28.md` correctly requires real human judgement, desktop and mobile observations, fail-closed `NOT_OBSERVABLE`, semantic separation of proposal/authority/decision/curriculum/handoff, and exact `releaseSha` binding.

However the pack and receipt template are still bound to historical release `5ffba536c5863bd7b461bcd3d130cc900a46a55f`, while the stabilized Arena baseline is now `f0a9b0c1ea279d017d9d772d03a623a7ff953c8c`.

Human acceptance on the historical release cannot close S3 for the stabilized baseline.

## Findings

### S3-F1 — Same-SHA HIM evidence is not guaranteed

The HIM workflow is correct but its automatic trigger is narrower than the set of files capable of changing the four critical Human Tasks.

### S3-F2 — General critical-journey browser/mobile evidence is missing

Current browser workflows are specialist: revision, KX mobile and live Assistant. There is no one candidate audit that walks the four G5 Human Tasks on both desktop and a 390x844 mobile viewport.

### S3-F3 — G5 release binding is stale

The current acceptance pack/receipt cannot be reused as PASS evidence for the new baseline because the release SHA differs.

### S3-F4 — HVA must follow deployment, not precede it

`Deploy Arena Beta` accepts an immutable ref, resolves the deployed SHA, verifies published `beta-release.json`, and only then triggers the live Beta Assistant audit. Therefore S3 human acceptance must be executed only after the intended S3 candidate is published and its release identity is verified.

## Remediation sequence

### ARENA-S3A — Validation contract and release binding

1. make the G5 pack release-neutral as a protocol rather than pinning it to a historical release;
2. make the receipt template explicitly require a release SHA at execution time rather than carrying a stale SHA;
3. add a machine gate that verifies the exact four Human Task IDs are consistent across `.human/tasks`, G5 pack and receipt schema;
4. guarantee an HIM validation run for an S3 candidate even when HIM-owned files themselves are unchanged.

Exit: `ARENA_S3A_VALIDATION_CONTRACT_PASS`.

### ARENA-S3B — Critical-journey browser audit

Create one bounded candidate browser audit that covers, without fabricating authority:

- curriculum context;
- revision preparation/inspection;
- no-authority institutional-decision path;
- planning-handoff preview/blocked/explicit-action path;

on desktop and approximately `390x844` mobile.

The audit records evidence and verifies reachability/visibility/recovery; it does not issue the human verdict.

Exit: `ARENA_S3B_BROWSER_EVIDENCE_PASS`.

### ARENA-S3C — Published Beta HVA

1. deploy one immutable S3 candidate SHA using `Deploy Arena Beta`;
2. require deploy smoke identity PASS for the same SHA;
3. require live post-deploy browser audit PASS;
4. execute the G5 human session on desktop and mobile;
5. complete a release-specific receipt without fabricating unavailable authority;
6. record `BETA_HIA_PASS`, `PARTIAL_HUMAN_EVIDENCE`, or `BETA_HIA_BLOCK` according to the existing acceptance rule.

Exit: `BETA_HIA_PASS` only after actual human review.

## Gate

`ARENA-S3 = REWORK_REQUIRED`

Next authorized implementation slice: `ARENA-S3A — Validation contract and release binding`.
