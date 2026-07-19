# Handoff

## Resume From Here
Shared agent memory has been implemented for Codex, opencode, Copilot, and Claude. The canonical startup file is `AGENTS.md`; Claude imports it through `CLAUDE.md`; Copilot gets `.github/copilot-instructions.md` plus path-scoped instructions. A PowerShell helper exists at `scripts/agent-memory.ps1`, with npm shortcuts in `package.json`.

## Next Actions
- Review `git diff`.
- Commit and push the changes.

## Watch Outs
- Do not store secrets, tokens, credentials, private keys, or large logs in `session/`.
- Keep startup files short; put detailed protocol text in `docs/AGENT_MEMORY.md`.

