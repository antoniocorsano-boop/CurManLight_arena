# Agent Working Memory

This repository uses a shared, file-backed memory protocol so terminal agents and VS Code chat agents can resume work without reloading the whole conversation.

## Mandatory integrated-project memory

Before any work that can affect product ownership, curriculum authority, Docente OS interoperability, Human Task/HIM, cross-system UI semantics, roadmap order, external frameworks or promotion/deploy decisions, read:

`docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`

Memory ID: `CML-DOS-INTEGRATED-GOVERNANCE-V1`.

This file is the canonical shared logical memory for CurManLight Arena + Docente OS. It overrides stale conversation summaries, old PR descriptions and local assumptions on cross-system boundaries. Do not change the Arena/Docente OS ownership boundary, authority model, handoff contract or governed execution order without an explicit governance change mirrored in both repositories.

## Mandatory Arena curriculum adoption/validation guide

Before any work that can affect curriculum governance, adoption, validation, revision, institutional decisions, baseline/adoption state, evidence-driven review or Arena ↔ Docente OS curricular feedback, also read:

`docs/architecture/CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md`

Guide ID: `CML-ARENA-CURRICULUM-ADOPTION-VALIDATION-V1`.

This guide is the persistent development direction for evolving Arena into a complete curriculum adoption and validation system. It does not override the integrated governed memory, routing/architecture freezes or active promotion gates. Resume from the first incomplete authorized AD tranche; never infer completion or authorization from conversation history alone.

## Load Order

1. Read this file first.
2. Read `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md` whenever the task can affect the integrated Arena + Docente OS system.
3. Read `docs/architecture/CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md` whenever the task can affect curriculum governance, adoption, validation, revision, institutional decisions or curricular feedback/interoperability.
4. If `session/` exists, read the latest relevant `session/*/handoff.md`.
5. Read that session's `session_state.md`, then only the timeline entries needed for the current task.
6. Read `docs/AGENT_MEMORY.md` only when you need the full protocol or templates.

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
| CML-630E1 — Productive Domain Contracts | COMPLETE_REMOTE | `a331dcf` | `main` |
| CML-630E2 — Persistence & Legacy Compatibility | COMPLETE_REMOTE | `1041fb5` | `main` |
| CML-630F2 — Legacy Compatibility (extended) | COMPLETE_LOCAL | `pending` | `feat/cml-630f2-legacy-compatibility-extended` |
| CML-631A — Curriculum Domain Functional Activation Pilot | COMPLETE_REMOTE | `f6a9e81` | `main` |
| CML-631B — Curriculum Functional Pilot Evaluation | COMPLETE_REMOTE | `301cf01` | `main` |
| CML-631C — Curriculum Pilot Usability Corrections | COMPLETE_REMOTE | `e1c5124` | `main` |
| CML-631D — Curriculum Pilot Teacher Validation | COMPLETE_REMOTE | `f488394` | `main` |

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

**CML-630E1 — Productive Domain Contracts:** COMPLETE_REMOTE (merged `a331dcf` → `main`)
- 5 entity types defined in `src/domain/curriculum/` (version, segment, node, verticalLink, types)
- 13 validation functions in `validation.ts`
- 55 domain tests in `src/__tests__/curriculum-domain/`
- Public barrel export in `src/domain/curriculum/index.ts`
- No dependencies on store, IndexedDB, UI, or e-twin
- TypeScript, test, build: all green

**CML-630E2 — Persistence & Legacy Compatibility:** COMPLETE_REMOTE (merged `1041fb5` → `main`)
- Persistence layer in `src/domain/curriculum/persistence/` (schema, repositories, migration, backup, rollback, legacyAdapters)
- Legacy adapters: `curriculumKB` → `CurriculumSegment` in `legacyAdapters.ts` and `adapters.ts`
- School year string (`"2026-2027"`) → `AcademicYear` (`{startYear, endYear}`) via `curriculumTransitionResolver.ts`
- 4 test files in `src/__tests__/curriculum-persistence/` + integration tests
- No breaking changes to existing functionality

### CML-630F2 Status (Complete)

**CML-630F2 — Legacy Compatibility (extended):** COMPLETE_LOCAL (pending — rev. correttiva PR #18)
- Migration coverage validated: legacy adapters cover traguardi, obiettivi, evidenze, nucleiFondanti, proposals
- AcademicYear utilities added in `src/lib/academicYear.ts` (parseSchoolYear, createAcademicYear, isValidAcademicYear); single `formatAcademicYear` (slash, canonica) in `curriculumTransitionResolver.ts`
- ProgettazioneTab uses the canonical resolver via `src/lib/curriculumTransitionUi.ts` (`resolveShownFrameworkForCurriculum` → `resolveNationalFramework`)
- Single curriculumBaseline entry point in `src/lib/curriculumBaseline.ts` replaces direct curriculumKB imports
- Direct curriculumKB imports deprecated in:
  - `useLocalCurriculum.ts`
  - `useCurriculumImportHandlers.ts`
  - `useCurriculumStore.ts`
  - `curmanlight_v2_core_simulator.ts`
- Legacy data paths audited: only curriculumBaseline.ts and test files import curriculumKB directly
- No breaking changes to existing functionality
- TypeScript, test:fast, build: all green
