# CurManLight Copilot Instructions

Use `AGENTS.md` as the shared project operating guide. Before making non-trivial edits, inspect the latest relevant `session/*/handoff.md` and `session_state.md` so VS Code chat work stays aligned with terminal agents.

Keep context usage small:

- Load only the files needed for the current task.
- Prefer `handoff.md` and `files.md` over re-reading long chat history.
- Update session notes when you make decisions, change files, run important commands, or stop work.
- Do not write secrets, credentials, tokens, private keys, or large logs to session files.

For memory operations, use:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 start -Goal "..."
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 checkpoint -Message "..."
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 status
```

Project basics: React 18, TypeScript, Vite, Tailwind. Main code is in `src/`; durable documentation and curriculum material live in root Markdown files and `second-brain/`.

