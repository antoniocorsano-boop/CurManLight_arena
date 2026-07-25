# Agent Working Memory

This repository uses a shared, file-backed memory protocol so terminal agents and VS Code chat agents can resume work without reloading the whole conversation.

## Load Order

1. Read this file first.
2. If `session/` exists, read the latest relevant `session/*/handoff.md`.
3. Read that session's `session_state.md`, then only the timeline entries needed for the current task.
4. Read `docs/AGENT_MEMORY.md` only when you need the full protocol or templates.

## Session Rules

- Keep durable state under `session/<yyyyMMdd_HHmmss>/`.
- Reuse the active session directory during the same work thread.
- Keep `handoff.md` short enough to read in under a minute.
- Record facts, decisions, commands, changed files, blockers, and next actions.
- Do not store secrets, tokens, credentials, private keys, or large logs.
- Prefer links to files and short summaries over copying long outputs.

## Checkpoint Rhythm

Create or update a checkpoint:

- after forming a plan,
- before and after meaningful edits,
- before long-running commands,
- when changing direction,
- before ending a session.

Use the helper script when available:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 start -Goal "..."
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 checkpoint -Message "..."
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 status
```

## Repo Orientation

- App stack: React 18, TypeScript, Vite, Tailwind.
- Main source: `src/`.
- Knowledge base and project documentation: root Markdown files and `second-brain/`.
- Generated graph artifacts: `graphify-out/`.
- Build command: `npm run build`.
- Agent routing guide: `docs/AGENT_ORCHESTRATION.md`.

## Working Mode (Post-CML-604)

**Read `docs/WORKING_PROTOCOL.md` before starting any task.**

The architecture is frozen. Focus is on product evolution for teachers.

- **DO**: UX improvements, workflow enhancements, feature development
- **DON'T**: refactoring, structural changes, new patterns, new frameworks

Every proposal must follow the evaluation order:
1. Value for the teacher
2. Value for the department
3. Time reduction
4. Perceived complexity reduction
5. Technical impact (last)

See `docs/PROJECT_BASELINE.md` for current state.

## Agent Notes

- Codex and opencode: use this `AGENTS.md` as the primary project instruction file.
- GitHub Copilot: also read `.github/copilot-instructions.md` and matching `.github/instructions/*.instructions.md`.
- Claude Code: read `CLAUDE.md`; it imports this file.
- Cline: also read `.clinerules/agent-memory.md`.
- Kilo Code: also read `kilo.jsonc` and `.kilo/rules/agent-memory.md`.

## Curriculum Architecture (CML-630 Series)

### Milestones

| Slice | Status | Commit | Branch |
|-------|--------|--------|--------|
| CML-630A — National Framework Applicability Foundation | COMPLETE_REMOTE | `6c8c93c` | `main` |
| CML-630F — Curriculum Transition Documentation Alignment | COMPLETE_REMOTE | `5c34dc8` | `main` |
| CML-630B — Institute Curriculum Version and Segment Model | COMPLETE_REMOTE | `5c34dc8` | `main` |
| CML-630C — Curriculum e-Twin Domain Validation Prototype | COMPLETE_REMOTE | `635fd6a` | `main` |
| CML-630D — Vertical Curriculum Link Domain Decision | COMPLETE_REMOTE | `7e6b2eb` | `main` |
| CML-630E — Production Domain Integration | COMPLETE_LOCAL | `pending` | `feat/cml-630e-productive-curriculum-domain` |
| CML-630F2 — Legacy Compatibility | PENDING | — | — |
| CML-631A — Curriculum Domain Functional Activation Pilot | COMPLETE_REMOTE | `f6a9e81` | `main` |
| CML-631B — Curriculum Functional Pilot Evaluation | COMPLETE_REMOTE | `301cf01` | `main` |
| CML-631C — Curriculum Pilot Usability Corrections | COMPLETE_LOCAL | `pending` | `feat/cml-631c-pilot-usability-corrections` |

### CML-630D Decision

```
CML_630D_DECISION_COMPLETE
MODELLO_C_IBRIDO_ADOPTED
VERTICAL_CURRICULUM_LINK_PROMOTED_TO_PRODUCTION_DOMAIN
CURRICULUM_NODE_PROMOTED_TO_PRODUCTION_DOMAIN
CML_630E_REQUIRED_FOR_IMPLEMENTATION
```

**Decision:** Modello C ibrido
- `CurriculumSegment` → relazioni strutturali (provenienza, sostituzione, appartenenza)
- `VerticalCurriculumLink` → relazioni pedagogiche (continuità, sviluppo, prerequisito, integrazione)

### CML-630E Status

**CML-630E1 — Productive Domain Contracts:** COMPLETE_LOCAL
- 5 entity types defined in `src/domain/curriculum/`
- 13 validation functions
- 55 tests
- TypeScript, test, build, Storybook: all green

**CML-630E2 — Persistence Plan:** COMPLETE_LOCAL
- Documented in `docs/CML_630E2_PERSISTENCE_AND_LEGACY_COMPATIBILITY_PLAN.md`
- Not yet implemented

### CML-630E2 Requirements

**Title:** Legacy Compatibility
**Objective:** Implement adapters between legacy domain and new productive domain

**Scope:**
- Implement persistence for new entities
- Migrate legacy data (curriculumKB → CurriculumSegment)
- Add adapters for schoolYear → AcademicYear
- No breaking changes to existing functionality

