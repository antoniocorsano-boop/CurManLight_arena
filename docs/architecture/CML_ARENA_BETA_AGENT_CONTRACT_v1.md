# CurManLight Arena — Beta Agent Contract v1

Status: EXECUTION CONTRACT CANDIDATE

This contract extends the existing repository agent orchestration for the Beta program. It does not replace `AGENTS.md`, `docs/AGENT_ORCHESTRATION.md`, `docs/WORKING_PROTOCOL.md` or HIM.

## Agent objective

Advance the first ready Beta phase with the smallest reviewable change that satisfies explicit exit evidence.

## Required read set

Before action, the agent must read:

1. `AGENTS.md`;
2. `docs/WORKING_PROTOCOL.md`;
3. `docs/architecture/CML_ARENA_BETA_READINESS_AUDIT_v1.md`;
4. `docs/architecture/CML_ARENA_BETA_EXECUTION_PLAN_v1.md`;
5. `docs/architecture/CML_ARENA_BETA_AGENTIC_STATE_v1.json`;
6. `.human/him.config.json` and affected `.human/tasks/*`;
7. relevant product/domain contracts and latest session handoff.

## Selection rule

The agent selects exactly one phase whose status is `IN_PROGRESS` or `READY` and whose prerequisites are complete. It may split that phase into smaller PRs, but it must not start a later phase merely because implementation is convenient.

## Evidence hierarchy

The agent may mark an automated structural criterion PASS only when supported by an executed check on the relevant SHA.

The agent may not self-assert PASS for:

- real-user acceptance;
- manual HIA judgement;
- manual accessibility judgement;
- production/Beta environment smoke not actually executed;
- recovery rehearsal not actually executed;
- security/privacy review requiring human sign-off.

Those remain `PENDING_HUMAN` or `BLOCKED` until evidence exists.

## Authority and safety

- No direct push to `main`.
- No automatic institutional curriculum decision.
- No privilege derived from a displayed/self-declared role.
- No student personal data added to the first Beta scope.
- No secret or credential committed to repository/session evidence.
- No hidden scope expansion to solve an unrelated architecture preference.
- Consequential behavior follows HIM and existing Arena capability boundaries.

## Branch and PR discipline

Use one branch/worktree per coherent tranche. PR description must state:

- phase and gate(s) advanced;
- exact base SHA;
- Human Task IDs affected;
- runtime/data/security impact;
- checks executed;
- evidence created;
- remaining blockers;
- whether any human acceptance is still required.

## Stop conditions

Stop and report rather than improvising when:

- a prerequisite is not complete;
- the required environment/account/secret does not exist;
- a gate depends on a real user or human judgement;
- the change would require architecture/routing redesign not justified by a Beta blocker;
- a release/security/recovery claim cannot be reproduced;
- the canonical head changed in a way that invalidates evidence.

## Completion

A phase may advance only after its declared exit evidence is present. Machine state must be updated in the same or immediately following governance PR; it must never claim a later gate closed based only on planned work.
