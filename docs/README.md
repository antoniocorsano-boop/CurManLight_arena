# CurManLight Arena — Documentation Index

Status: **CANONICAL DOCUMENTATION ENTRYPOINT**  
Date: **2026-09-20**

This index separates current governance, architecture, assurance, evidence and historical material.

## Start here

1. [Repository home](../README.md)
2. [Agent operating rules](../AGENTS.md)
3. [Repository structure](REPOSITORY_STRUCTURE.md)
4. [Product roadmap 2026–2027](architecture/ARENA_PRODUCT_ROADMAP_2026_2027.md)
5. [Normative, technology & assurance baseline](assurance/NORMATIVE_TECH_ASSURANCE_BASELINE.md)

## Canonical governance and architecture

Read these before product or cross-system changes:

- [Integrated Project Governed Memory v1](architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md)
- [Curriculum Adoption & Validation Development Guide v1](architecture/CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md)
- [Arena / Curriculum Atlas / Docente OS Surface Boundary](architecture/ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md)
- [ECO-00 Ecosystem Role and Handoff](architecture/ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md)
- [Arena M4 Governance & Operations Runbook](architecture/ARENA_M4_OPERATIONS_RUNBOOK.md)
- [Arena M4 Evidence Registry](architecture/ARENA_M4_EVIDENCE_REGISTRY_2026-09-19.md)

## Curriculum-to-Practice

The C2P specification refines interoperability without changing ownership boundaries:

- [Operating Model](architecture/CURRICULUM_TO_PRACTICE_OPERATING_MODEL_V1.md)
- [Contracts](architecture/CURRICULUM_TO_PRACTICE_CONTRACTS_V1.md)
- [Execution Plan](architecture/CURRICULUM_TO_PRACTICE_EXECUTION_PLAN_V1.md)
- [Acceptance](architecture/CURRICULUM_TO_PRACTICE_ACCEPTANCE_V1.md)

## Current product direction

- [Arena Product Roadmap 2026–2027](architecture/ARENA_PRODUCT_ROADMAP_2026_2027.md)
- [Adoption & Validation Development Guide](architecture/CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md)
- [Ecosystem Role & Handoff](architecture/ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md)

## Assurance

- [Normative, Technology & Assurance Baseline](assurance/NORMATIVE_TECH_ASSURANCE_BASELINE.md)
- [G5 Human Acceptance Protocol](evidence/BETA_G5_HUMAN_ACCEPTANCE_PROTOCOL_v2.md)

Use exact-SHA release receipts and live tracker state for promotion decisions. Protocol files are not proof that a human review happened.

## Live trackers

- [M4 canonical maturity tracker #121](https://github.com/antoniocorsano-boop/CurManLight_arena/issues/121)
- [M4 final-decision preparation PR #304](https://github.com/antoniocorsano-boop/CurManLight_arena/pull/304)

## Product experience and navigation history

Useful design/implementation programs live in:

- `03_execution/`
- `04_product_experience/`
- `04_repository_architecture/`
- `05_react_architecture/`
- `06_architecture_governance/`
- `07_navigation_program/`

These can be current, historical or superseded. Check status and current governance before reusing them.

## Historical material

The repository contains a large historical corpus in the root and `second-brain/`.

Historical documents are retained for traceability but do not override:

1. explicit current governance;
2. governed memory;
3. live maturity/release evidence;
4. current architecture contracts;
5. source + exact-head tests.

## Documentation status vocabulary

New documents should declare one of:

- `CANONICAL`
- `IMPLEMENTATION CONTRACT`
- `GOVERNED ROADMAP`
- `CURRENT EVIDENCE`
- `PROPOSAL`
- `HISTORICAL`
- `DEPRECATED`
- `ARCHIVE`

Avoid unqualified "final", "certified", "fully compliant" or "production ready" language unless the exact authoritative evidence exists.

## Contribution rule

A new canonical document should be linked from this index or from a more specific canonical index. Unindexed governance documents create ambiguity and should be avoided.
