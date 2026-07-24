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
| CML-630C — Curriculum e-Twin Domain Validation Prototype | PR_OPEN | `57cf7b7` | `feat/cml-630c-curriculum-etwin-domain-validation` |
| CML-630D — Vertical Curriculum Link Domain Decision | PENDING | — | — |

### CML-630C Audit Verdict

```
CML_630C_PR_AUDIT_COMPLETE
ISOLATION_CONFIRMED
DOMAIN_CONFLICT_IDENTIFIED
CML_630D_REQUIRED_BEFORE_FINAL_DOMAIN_ADOPTION
```

**Key finding:** CML-630B chose Modello A (relazioni incorporate). CML-630C prototype recommends Modello B (relazioni esplicite). This conflict is intentional — the prototype served its function.

**PR #6:** https://github.com/antoniocorsano-boop/CurManLight_arena/pull/6
- Status: ARCHITECTURALLY_ISOLATED, DOMAIN_EVIDENCE_VALID, FINAL_DOMAIN_DECISION_PENDING
- Safe to merge as experimental prototype (no production impact)

### CML-630D Requirements

**Title:** Vertical Curriculum Link Domain Decision  
**Objective:** Formally decide between Modello A (incorporate), B (esplicite), or C (ibrido)

**Decision criteria:**

| Criterio | Modello A | Modello B |
|----------|-----------|-----------|
| Semplicità strutturale | superiore | inferiore |
| Precisione pedagogica | limitata | elevata |
| Relazioni interdisciplinari | debole | nativa |
| Validazione indipendente | non naturale | nativa |
| Tracciabilità | ridotta | completa |
| Carico implementativo | minore | maggiore |
| Utilità per e-Twin | limitata | elevata |
| Compatibilità con uso documentale semplice | elevata | potenzialmente eccessiva |

**Expected outcome:** Modello C (ibrido)
- CurriculumSegment → relazioni strutturali (provenienza, sostituzione, appartenenza)
- VerticalCurriculumLink → relazioni pedagogiche (continuità, sviluppo, prerequisito, integrazione)

