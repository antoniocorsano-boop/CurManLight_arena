# Arena Grok Build External Executor Decision v1

Status: DECISION_FROZEN / DEVELOPMENT_TOOLING_ONLY
Decision ID: CML-ARENA-GROK-BUILD-EXECUTOR-V1
Date: 2026-08-31
Scope: CurManLight Arena development orchestration only
Upstream: `xai-org/grok-build`

## 1. Product-value statement

**Il docente potrà beneficiare di modifiche più affidabili e verificabili, perché gli agenti di sviluppo vengono eseguiti con permessi espliciti, isolamento e prove riproducibili senza acquisire autorità sul prodotto.**

## 2. Decision

Grok Build is admitted as an **external development executor** for CurManLight Arena.

It is not:

- a CurManLight runtime dependency;
- a new product framework;
- a curriculum authority;
- a replacement for Arena shared memory;
- a release, merge, deploy or promotion authority;
- a substitute for Human Task, HIM or actual human acceptance.

The canonical control direction is:

`Arena governance -> AGENTS.md -> governed memory/guides -> executor profile -> isolated worktree -> verification -> normalized evidence -> human/repository promotion gate`

Grok Build is one possible executor in that chain. Arena owns the meaning of the task, the constraints and the acceptance rules.

## 3. Why this does not modify the frozen product architecture

The integration is restricted to repository development tooling:

- no imports are added to `src/`;
- no application route, shell, persistence model, state manager or UI surface changes;
- no runtime package dependency is added;
- no Arena/Docente OS ownership boundary changes;
- no new institutional authority state is introduced.

The `.grok/` directory is authorized by this decision solely as an external-tool configuration surface. It must never become product state.

## 4. Canonical memory and instruction order

Every Grok Build execution must remain subordinate to the existing repository protocol:

1. `AGENTS.md`;
2. `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md` when applicable;
3. `docs/architecture/CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md` when applicable;
4. latest relevant `session/*/handoff.md` and session state;
5. real repository state and exact SHA;
6. task-specific instructions.

Grok Build session state may support execution continuity, but it is **not canonical Arena memory**.

## 5. Authority invariant

Every normalized external-agent execution evidence MUST state:

- `authority.claim = "NONE"`;
- `authority.promotionAllowed = false`;
- `authority.humanVerdict = false`.

An agent may report a technical finding such as `PASS`, `REWORK_REQUIRED` or `BLOCKED`, but that report is evidence only. It cannot close S3, approve AD-1, merge a PR, deploy Beta or issue `BETA_HIA_PASS`.

## 6. Execution profiles

### `arena-auditor`

Purpose: independent repository review and refutation.

Properties:

- read-only project access;
- child-process network restricted where the upstream sandbox can enforce it;
- no file editing;
- no shell execution;
- no web tools;
- no subagents;
- secret-like files denied by sandbox policy;
- normalized evidence recorded after execution.

### `arena-implementer`

Purpose: bounded implementation in an isolated non-`main` worktree/branch.

Properties:

- workspace-bounded writes;
- no direct writes to protected secret-like files;
- no merge, push, deploy or promotion command through the governed wrapper;
- canonical governed-memory file edits denied by wrapper permission rules;
- execution must start from a named non-`main` branch;
- repository verification remains separate from the agent's own claim.

### `arena-untrusted`

Purpose: inspection of unfamiliar or untrusted code with the strictest available local profile.

This profile is not a product gate; it is an additional containment option.

## 7. Evidence policy

Raw stdout/stderr and model output are local execution artifacts under `.agent-runs/` and are gitignored.

Only normalized evidence may be written into the latest `session/` directory. The normalized record contains metadata, hashes, bounded usage/cost fields and repository state. It must not contain:

- credentials or secrets;
- private keys or tokens;
- raw hidden reasoning;
- full raw tool logs;
- a fabricated human verdict.

The canonical schema is:

`docs/architecture/CML_ARENA_AGENT_EXECUTION_EVIDENCE_SCHEMA_V1.json`

## 8. Benchmark policy

Comparisons between Grok Build, Codex, Claude or other executors may use normalized evidence, but a benchmark does not create authority.

Compare at least:

- exact repository SHA/task identity;
- execution status;
- duration;
- model turns when available;
- token/cost fields when complete;
- repository mutations;
- verification findings;
- governance violations or policy blocks.

Cost or speed alone must never determine promotion.

## 9. Current Arena gate interaction

At the time of this decision Arena S3 remains formally open. Therefore:

- this tooling can be prepared, tested and used for non-promoting audit/implementation evidence;
- it cannot close S3;
- it cannot authorize S4;
- it cannot promote AD-1 to canonical adoption;
- existing human-acceptance requirements remain unchanged.

## 10. License and source handling

No upstream Grok Build source is vendored by this integration. The repository invokes an independently installed `grok` binary and records its version in evidence when available.

If upstream source is later copied or modified, Apache-2.0 and applicable third-party notice obligations must be reviewed explicitly before that change is merged.

## 11. Gate

This integration is structurally valid only when:

- the executor registry parses;
- the evidence JSON Schema parses and freezes `authority.claim = NONE` semantics;
- sandbox profiles exist;
- the governed wrapper denies promotion operations;
- raw execution artifacts are gitignored;
- package commands point to the governed wrapper;
- CI executes the static integration validator.

Expected validator result:

`ARENA_AGENT_EXECUTOR_CONTRACT_PASS`

## 12. Non-negotiable invariant

**External agents may execute work and produce evidence. They do not acquire Arena authority by being capable of reading, editing, testing or reasoning about the repository.**
