# Shared Agent Memory

Cline must use the repository shared memory protocol instead of maintaining a separate task memory.

## Startup

1. Read `AGENTS.md`.
2. Run or inspect `npm run memory:status`.
3. Read the latest relevant `session/*/handoff.md`.
4. Read `session_state.md` only when continuing existing work.
5. Load `docs/AGENT_MEMORY.md` only when you need the full protocol.

## Checkpoints

Update `session/<yyyyMMdd_HHmmss>/` when you make a plan, edit files, run important commands, encounter blockers, or end a task.

Use:

```powershell
npm run memory:checkpoint -- -Message "..."
```

## Safety

Never write secrets, tokens, credentials, private keys, or large logs to `session/`.