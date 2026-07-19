# Handoff

## Resume From Here
Shared agent memory has been implemented for Codex, opencode, Copilot, Claude, Cline, and Kilo Code. The canonical startup file is `AGENTS.md`; Claude imports it through `CLAUDE.md`; Copilot gets `.github/copilot-instructions.md` plus path-scoped instructions; Cline gets `.clinerules/agent-memory.md`; Kilo gets `kilo.jsonc` and `.kilo/rules/agent-memory.md`. A PowerShell helper exists at `scripts/agent-memory.ps1`, with npm shortcuts in `package.json`.

## Next Actions
- For the next task, start with `npm run memory:status`.
- Reuse this session only for direct follow-up; create a new session for unrelated work.

## Watch Outs
- Do not store secrets, tokens, credentials, private keys, or large logs in `session/`.
- Keep startup files short; put detailed protocol text in `docs/AGENT_MEMORY.md`.

