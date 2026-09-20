# CurManLight Arena — Repository Structure

Status: **CANONICAL NAVIGATION GUIDE**  
Date: **2026-09-20**

## 1. Purpose

The repository contains several generations of CurManLight documentation. This guide defines how to navigate the current codebase without mistaking historical reports for active architecture or governance.

The repository is intentionally not mass-migrated in this documentation slice: moving historical files would create unnecessary diff/compatibility risk. Instead, canonical entry points and precedence are made explicit.

---

## 2. Canonical top-level structure

```text
CurManLight_arena/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
├── package.json
├── src/
│   ├── App.tsx
│   ├── domain/
│   ├── features/
│   ├── infrastructure/
│   ├── lib/
│   ├── store/
│   └── __tests__/
├── supabase/
├── docs/
│   ├── README.md
│   ├── architecture/
│   ├── assurance/
│   ├── evidence/
│   ├── 03_execution/
│   ├── 04_product_experience/
│   ├── 04_repository_architecture/
│   ├── 05_react_architecture/
│   ├── 06_architecture_governance/
│   └── 07_navigation_program/
├── .human/
├── .github/
│   ├── workflows/
│   └── ISSUE_TEMPLATE/
├── agent_skills/
├── scripts/
├── tools/
├── second-brain/
├── session/
├── graphify-out/
├── mocks/
├── report/
├── .storybook/
└── configuration files
```

---

## 3. Root files

### README.md

Public repository home.

It should answer:

- what Arena is;
- what it is not;
- current maturity;
- product boundary;
- roadmap;
- normative/technology baseline;
- how to run/test;
- where canonical documentation lives.

### AGENTS.md

Mandatory operating instruction for agents and automated contributors.

Read before any work affecting:

- authority;
- cross-product boundary;
- roadmap;
- curriculum semantics;
- release/promotion.

### CONTRIBUTING.md

Contribution and PR contract.

### SECURITY.md

Security reporting and handling rules.

### package.json

Current executable dependency/tooling source.

---

## 4. src/ — production application

### src/domain/

The most important semantic layer.

Expected ownership areas include:

```text
src/domain/
├── curriculum/       # framework, version, applicability, curriculum entities
├── institution/      # institution/workspace authority/read models
├── transfer/         # cross-boundary versioned context/contracts
├── persistence/      # governed persistence policy/contracts
└── ai/               # bounded AI provider/domain behavior
```

**Rule:** domain invariants must not be inferred from UI labels.

### src/features/

Product surfaces and bounded feature modules.

Current relevant families include:

- `navigation/`;
- `session/`;
- `curriculum/`;
- `beta/` — governed review/handoff surfaces;
- `progettazione/` — current boundary hub, not broad Arena UDA authoring;
- `documents/`;
- `processo/` — legacy/bounded surface subject to current governance;
- `copilot/` — curriculum/process specialist boundary.

### src/infrastructure/

Adapters/repositories for external persistence/services.

Shared institutional persistence belongs behind domain repository boundaries.

### src/store/

Client state.

A local store does not define institutional authority.

### src/__tests__/

Regression, contract and governance tests.

Important current families include:

- planning/source applicability;
- authority identity;
- shared review;
- product boundaries;
- M4 operations/governance;
- curriculum release/contracts;
- teacher-workspace compatibility guards.

---

## 5. supabase/

Contains shared-persistence database artifacts such as migrations, functions/policies or server-side domain support.

Rules:

- RLS/membership authority is server-side;
- no local role self-promotion;
- no student-data expansion by implication;
- schema changes require dedicated governance and tests.

---

## 6. docs/ — current documentation entrypoint

Use `docs/README.md` as the canonical documentation index.

### docs/architecture/

Highest-value architecture and governance artifacts.

Canonical examples:

- `INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`;
- `CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md`;
- `ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md`;
- `ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md`;
- `CURRICULUM_TO_PRACTICE_*.md`;
- `ARENA_M4_OPERATIONS_RUNBOOK.md`;
- `ARENA_PRODUCT_ROADMAP_2026_2027.md`.

### docs/assurance/

Repository-home assurance baselines and curated matrices.

Current canonical file:

- `NORMATIVE_TECH_ASSURANCE_BASELINE.md`.

### docs/evidence/

Release-neutral protocols and release-specific evidence/receipts.

Do not treat a protocol template as proof that a review happened.

### numbered docs directories

These contain architecture/product/navigation programs from earlier or parallel maturation slices.

Their status must be read from the document itself and compared with current governance.

---

## 7. .human/

Human Task and Human Interaction contracts.

Purpose:

- define observable human tasks;
- separate automation evidence from human acceptance;
- bind critical journeys to understandable states and outcomes.

Automation may validate the model. It cannot fabricate the human verdict.

---

## 8. .github/workflows/

Current workflow families include:

- `product-ci.yml`;
- `beta-release-contract.yml`;
- `beta-deploy.yml`;
- `beta-e2e-workflow.yml`;
- `beta-identity-authority.yml`;
- `curriculum-alignment.yml`;
- `human-interaction-model.yml`;
- `h3-h4-authority.yml`;
- `s3-critical-journey-browser.yml`;
- `dependency-security-audit.yml`;
- live Beta audits;
- shared review smoke;
- agent-executor contracts.

**Rule:** workflow PASS is evidence only for the relevant SHA and contract.

---

## 9. agent_skills/

Reusable governed skills for agents.

Example:

- curriculum-to-practice.

Skills are execution aids. They do not override `AGENTS.md`, governed memory or an active stop gate.

---

## 10. scripts/ and tools/

### scripts/

Build/release/validation/agent utilities.

Examples include:

- Beta release preparation/verification;
- agent memory;
- external executor audit/validation.

### tools/

Human Interaction and specialist validators.

Tools should be deterministic where they contribute to release evidence.

---

## 11. second-brain/

Historical and research knowledge archive.

It contains valuable:

- audits;
- concepts;
- normative notes;
- product ideas;
- historical specifications.

**Critical rule:**

> `second-brain/` is not automatically the active product contract.

A file there may be historical, speculative, superseded or partially implemented.

Before using it for product work, reconcile it with current architecture/governance.

---

## 12. graphify-out/

Generated graph artifacts.

Treat as derived output, not primary source of authority.

---

## 13. session/

Agent/session checkpoints and handoffs.

Useful for continuation and evidence of work sequence.

Not a replacement for canonical architecture decisions.

---

## 14. Historical root documentation

The repository root contains many earlier reports, audits, summaries and proposals.

Examples:

- `RAPPORTO_*.md`;
- `PIANO_*.md`;
- `PROGETTO_*.md`;
- `SUMMARY_*.md`;
- `DOCUMENTAZIONE_*.md`.

These are retained for audit/history.

### Precedence rule

Do not assume that a historical file's statements such as:

- "100% complete";
- "GDPR compliant";
- "PWA guaranteed";
- "certified";
- "production ready";

are current product truth.

Use current governed evidence and exact runtime tests.

---

## 15. Canonical reading order

For product work:

1. `AGENTS.md` — mandatory operating instructions and conditional load order;
2. `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md` when required by `AGENTS.md`;
3. live tracker/release evidence and session state required by `AGENTS.md`;
4. `README.md` — public repository orientation, never an override of governance;
5. `docs/README.md`;
6. relevant architecture/domain contract;
7. relevant domain implementation/tests;
8. historical documents only as supporting context.

If `AGENTS.md` prescribes a more specific conditional order for the task, that order takes precedence over this navigation guide.

For cross-product work also read:

- `ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md`;
- `ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md`;
- C2P contract set.

For adoption/validation work also read:

- `CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md`;
- `ARENA_PRODUCT_ROADMAP_2026_2027.md`.

---

## 16. Target future cleanup

A later dedicated documentation-hygiene slice may physically classify/move historical root files.

Candidate target:

```text
docs/
├── architecture/
├── assurance/
├── evidence/
├── product/
├── normative/
├── operations/
├── history/
│   ├── audits/
│   ├── reports/
│   ├── proposals/
│   └── summaries/
└── archive/
```

That physical migration is **not** performed by this slice because:

- links may exist in old documentation;
- generated references may depend on paths;
- a large file move obscures the semantic README/roadmap change;
- history should remain auditable.

Perform it only with link inventory, redirects/reference updates and a dedicated PR.

---

## 17. Repository quality rule

Every new file should answer:

- Is it canonical, current evidence, proposal or history?
- What overrides it?
- What does it authorize?
- What does it not authorize?
- Which owner/domain does it belong to?
- Does it need an expiry/review date?
- Is it referenced from the docs index?

A new document without a clear status increases repository entropy and should not be merged.
