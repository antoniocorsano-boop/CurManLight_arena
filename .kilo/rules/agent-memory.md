# Shared Agent Memory

Kilo Code must use the repository shared memory protocol so VS Code and terminal agents can hand work to each other without losing context.

## Startup

1. Read `AGENTS.md`; it is the canonical project instruction file.
2. Run or inspect `npm run memory:status`.
3. Read the latest relevant `session/*/handoff.md`.
4. Read `session_state.md` and recent `timeline.md` only when they are relevant to the task.
5. Use `docs/AGENT_MEMORY.md` for the full protocol and templates.

## Checkpoints

Write compact checkpoints before and after meaningful edits, before long-running commands, after verification, and before ending the session.

Use:

```powershell
npm run memory:checkpoint -- -Message "..."
```

## Safety

Do not store secrets, tokens, credentials, private keys, raw credential files, or large logs in `session/`.