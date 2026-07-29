# CML-633J — Dead Code and Deprecation Register

## Overview

This document records code elements identified as dead, deprecated, or potentially removable in the CML-633J analysis. Each entry includes reachability analysis, import dependencies, and a decision.

## Format

For each entry:
- **Symbol**: function or variable name
- **File**: source file path
- **Reachability**: can it be reached from any active UI path?
- **Import**: which files import it?
- **Dependency on persist state**: does it depend on Dexie/persisted data?
- **Risk**: low / medium / high
- **Decision**: retain, deprecate, remove
- **Proof**: evidence supporting the decision

## Dead Code Identified

### Pre-existing dead code (not introduced by CML-633I or CML-633J)

| Symbol | File | Reachability | Import Dependencies | Risk | Decision |
|--------|------|-------------|---------------------|------|----------|
| (none identified as confirmed dead) | — | — | — | — | — |

### Surfaces from 1ffb4b0 not present at 4952b9b

| Surface | File/Path | Status |
|---------|-----------|--------|
| workspace domain | `src/features/workspace/` (old) | Not present at 4952b9b — pre-existing removal from history |
| tep feature | `src/features/tep/` (old) | Not present at 4952b9b |
| voice feature | `src/features/voice/` (old) | Not present at 4952b9b |
| knowledge feature | `src/features/knowledge/` (old) | Not present at 4952b9b |
| graphs feature | `src/features/graphs/` (old) | Not present at 4952b9b |
| onboarding feature | `src/features/onboarding/` (old) | Not present at 4952b9b |

These surfaces were removed in earlier CML-633 milestones and do not exist at baseline `4952b9b`. They are recorded here for traceability, not as current dead code.

### Files from misaligned CML-633J session (already removed or excluded)

The following files existed in the previous failed CML-633J branch but were NOT transferred to the clean 4952b9b-based branch:

- `src/features/guided-workflow/workflow-simple.ts` — excluded (simplified variant)
- `src/features/guided-workflow/simple-workflow.ts` — excluded (simplified variant)
- `src/features/guided-workflow/components/SimplifiedComponents.tsx` — excluded (simplified variant)
- `src/__tests__/guided-workflow-simple.test.ts` — excluded (unused extra)
- `src/__tests__/guided-workflow-basic.test.ts` — excluded (unused extra)

## Decisions

### No new dead code identified by CML-633J analysis

The CML-633J analysis confirmed that all existing code at baseline `4952b9b` is either:
- Actively used in the canonical workflow
- Legacy-read-only (not dead, just not in the active canonical path)
- Migration adapters (intentionally retained for compatibility)

### No code was removed by CML-633J

Per the constraint "No removal of legacy data without migration or compatibility," no code was removed. All dead-code analysis is recorded here for future reference only.

## Pending Reviews

The following items warrant future review but are not dead code today:
- `src/features/curriculum-functional-pilot/` — experimental pilot, may remain or be reclassified
- `src/features/copilot/` — AI assistant surface, retained due to potential CML-635A future integration
- `src/features/classroom/` — legacy classroom surface, read-only retained per CML-633J containment policy