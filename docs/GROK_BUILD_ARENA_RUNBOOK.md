# Grok Build — CurManLight Arena governed executor runbook

Status: DEVELOPMENT_TOOLING_ONLY
Decision: `CML-ARENA-GROK-BUILD-EXECUTOR-V1`

Grok Build is an external development executor. It does not become part of the CurManLight application and has no merge, deploy, promotion, curriculum or human-validation authority.

## Prerequisites

- Work inside the CurManLight Arena repository.
- Read `AGENTS.md` and the applicable governed memory/guides.
- Start or resume the shared Arena session memory before execution.
- Install the official `grok` binary separately and ensure `grok --version` works.
- For mutating `code` mode, use Linux/WSL2 or macOS and an isolated non-`main` branch/worktree.

The wrapper intentionally refuses mutating Grok modes on Windows because the upstream kernel sandbox is not guaranteed there. Windows can still use the read-only audit profile, enforced by a strict tool allowlist and permission denies.

## 1. Start shared Arena memory

```powershell
npm run memory:start -- -Goal "Audit or implement the current Arena task with governed Grok Build evidence"
```

If a relevant session already exists, inspect it first:

```powershell
npm run memory:status
```

## 2. Read-only independent audit

```powershell
npm run agent:grok:audit -- "Review the current branch against AGENTS.md, applicable governed memory and the task contract. Refute unsupported completion claims and return PASS, REWORK_REQUIRED or BLOCKED as a technical finding only."
```

The audit profile:

- allows only repository read/search/list tools;
- removes editing, shell, web and subagent tools;
- applies secret-path deny rules;
- uses `arena-auditor` sandbox on supported operating systems;
- writes raw output only to gitignored `.agent-runs/`;
- writes normalized metadata to the latest `session/` directory.

## 3. Governed implementation

Create/use an isolated feature branch or Agent Space worktree first. Never run this mode on `main`.

```powershell
npm run agent:grok:code -- "Implement the authorized bounded change. Preserve all current governance and stop after local verification; do not merge, push, deploy or promote."
```

The wrapper denies promotion-oriented commands including direct push, merge and deployment paths. It also denies edits to the canonical integrated governed-memory file through Grok permission rules.

The agent may edit the current worktree, but its own result remains non-promoting evidence.

## 4. Untrusted-code inspection

On Linux/WSL2 or macOS:

```powershell
npm run agent:grok:untrusted -- "Inspect the supplied/unfamiliar code for risks without executing or modifying it."
```

This uses the strictest configured Arena sandbox and a read-only toolset.

## 5. Verify the integration contract

This check does not require Grok Build to be installed:

```powershell
npm run agent:integration:verify
```

Expected result:

```text
ARENA_AGENT_EXECUTOR_CONTRACT_PASS
```

The same validator runs in GitHub Actions for changes to the integration contract.

## 6. Verify repository changes separately

A Grok execution may report an agent-declared `PASS`, but repository gates remain separate. Run the smallest applicable gate set on the exact resulting worktree/SHA, for example:

```powershell
npm run test:fast
npm run build
```

If the task touches Beta contracts, human journeys, adoption/validation or another governed slice, also run every gate required by that slice. The external agent cannot waive or replace those gates.

## 7. Compare normalized executor evidence

If two or more normalized evidence files exist in the latest session:

```powershell
npm run agent:benchmark
```

Or specify files explicitly:

```powershell
npm run agent:benchmark -- session/<session>/agent_execution_<id1>.json session/<session>/agent_execution_<id2>.json
```

The comparison marks evidence as comparable only when the task prompt hash and starting repository SHA are identical. It displays duration, turns, tokens/cost when available, mutations and agent-declared findings. It never chooses a promotion winner.

## Evidence locations

Raw execution output:

```text
.agent-runs/
```

This directory is ignored by Git and may contain model/tool output. Do not commit it.

Normalized execution evidence:

```text
session/<latest>/agent_execution_grok-<mode>-<timestamp>.json
```

Normalized evidence intentionally excludes the prompt text, raw reasoning and complete tool logs. It records hashes and bounded metadata instead.

## Canonical evidence invariants

Every normalized record must preserve:

```text
authority.claim = NONE
authority.promotionAllowed = false
authority.humanVerdict = false
output.rawArtifactTracked = false
```

Any record that violates these properties is invalid evidence and must not be used for repository decisions.

## S3 / AD interaction

This tooling can assist with audits and bounded implementation while Arena S3 remains open. It cannot:

- issue `BETA_HIA_PASS`;
- close S3;
- authorize S4;
- turn AD-1 from prepared/blocked into canonical adoption;
- replace the actual human acceptance receipt bound to an immutable deployed release.

## Source and license boundary

The integration invokes an independently installed Grok Build binary. No Grok Build source is vendored into Arena by this tranche. If source code is later copied from `xai-org/grok-build`, license and third-party notice obligations must be reviewed as a separate governed change.
