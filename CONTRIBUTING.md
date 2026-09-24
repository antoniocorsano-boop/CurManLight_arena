# Contributing to CurManLight Arena

## 1. Read before changing the product

Mandatory order:

1. `AGENTS.md`
2. `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`
3. the relevant architecture/domain contract
4. the live tracker/release state
5. current source/tests

For adoption/validation work, read the current adoption/validation contracts and evidence referenced by governed memory and the live tracker. Do not rely on a roadmap file unless it is present on the current base and explicitly marked current.

For cross-product work also read:

- `docs/architecture/ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md`
- `docs/architecture/ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md`
- C2P contracts.

## 2. Branch and PR policy

- Do not push directly to `main`.
- Create a focused branch from the current governed base.
- Keep one coherent concern per PR.
- Use the exact PR head SHA for all promotion evidence.
- Do not merge with unresolved review conversations.
- Required branch checks must be green.
- If the PR head moves, exact-head evidence must be re-evaluated.

## 3. Product boundary check

Before implementation answer:

1. Which product owns this capability?
2. Is the change GOVERN, NAVIGATE, OPERATE or HANDOFF?
3. Does it create a second source of truth?
4. Does it move teacher-operational work into Arena?
5. Does it introduce pupil-level data into Arena?
6. Does it cross Arena / Atlas / Docente OS authority?
7. Does it require a new versioned contract?

If ownership is ambiguous, stop and classify before coding.

## 4. Authority rule

Preserve:

```text
Person != Role != Capability != Authority
Proposal != Review != Institutional Decision
Approval != Adoption
Evidence != Decision
```

Missing authority must fail closed.

Never implement a shortcut that turns:

- a local role selection into server authority;
- a proposal into approval;
- a review into institutional decision;
- a source verification into adoption;
- AI output into authority;
- Docente OS evidence into Arena canonical mutation.

## 5. Data and privacy

Do not introduce:

- pupil identifiers into Arena cross-product contracts;
- raw pupil-level classroom histories;
- durable OAuth credentials;
- shared mutable databases across products;
- silent external writes.

Secrets and credentials must never be committed.

## 6. Reuse-first rule

Before creating a new:

- route;
- store;
- domain entity;
- repository;
- database table;
- workflow;
- cross-product DTO;

audit existing code and classify the need:

- `EXISTS_REUSE`
- `EXISTS_EXTEND`
- `MISSING_REQUIRED`
- `DUPLICATE_AVOID`
- `FORBIDDEN_BY_GOVERNANCE`

`CREATE_NEW` requires evidence that reuse/extension is not coherent.

## 7. Testing

At minimum for ordinary code changes:

```bash
npm run test:fast
npm run build
```

Run the broader relevant suite when the change affects:

- domain contracts;
- persistence;
- routing;
- authority;
- Human Interaction;
- accessibility;
- browser journeys;
- release identity;
- cross-product handoff.

Useful commands:

```bash
npm run test
npm run test:browser
npm run test:storybook
npm run test:full
```

CI is authoritative for the exact PR head, not a local run on another commit.

## 8. Human Interaction

For critical flows:

```text
Human Task
-> HIM
-> browser evidence
-> immutable deployment
-> actual human review
```

Automation may collect evidence but does not issue the human verdict.

Do not mark a human acceptance PASS because automated tests are green.

## 9. Accessibility

Changes to user-facing surfaces must preserve:

- keyboard access;
- focus visibility;
- accessible naming;
- dialog semantics;
- mobile/reflow behavior;
- understandable status and recovery;
- adequate target size;
- contrast requirements according to the active product gate.

## 10. Documentation

Each new governance/architecture document must declare status.

Preferred vocabulary:

- `CANONICAL`
- `IMPLEMENTATION CONTRACT`
- `GOVERNED ROADMAP`
- `CURRENT EVIDENCE`
- `PROPOSAL`
- `HISTORICAL`
- `DEPRECATED`

Avoid unsupported claims such as:

- "100% compliant";
- "certified";
- "production ready";
- "fully accessible";
- "GDPR compliant";

unless the relevant authority/evidence supports the exact claim.

When adding a canonical entrypoint, update the nearest existing canonical registry/index if one exists. Do not create or reference an index by implication.

## 11. PR description minimum

A PR should state:

- scope;
- exact base;
- owner/domain;
- what changes;
- what explicitly does not change;
- affected authority/data boundary;
- tests/gates;
- rollback/recovery consideration;
- human evidence requirement, if any;
- follow-up only after the current gate.

## 12. Stop conditions

Do not merge/promote when:

- ownership is ambiguous;
- a required exact-head gate is red/pending;
- a review thread is unresolved;
- the branch is stale against required governance;
- a release identity mismatch exists;
- human evidence required by the active protocol is missing;
- a blocker is being relabelled as a limitation without explicit decision;
- pupil data would cross into Arena;
- a shared DB or automatic cross-product write is introduced without a governed architecture change.
