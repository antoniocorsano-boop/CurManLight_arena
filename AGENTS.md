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

## Agent Notes

- Codex and opencode: use this `AGENTS.md` as the primary project instruction file.
- GitHub Copilot: also read `.github/copilot-instructions.md` and matching `.github/instructions/*.instructions.md`.
- Claude Code: read `CLAUDE.md`; it imports this file.

