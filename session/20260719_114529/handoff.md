# Handoff

## Resume From Here
Shared agent memory and VS Code orchestration are in place. Super CLI launches installed coding CLIs from one sidebar; Agent Space manages feature worktrees/persistent sessions; Vibe Rules manages shared skills/rules. Use `docs/AGENT_ORCHESTRATION.md` for routing by task type and `npm run memory:status` before starting new work.

## Next Actions
- For the next task, start with `npm run memory:status`.
- Reuse this session only for direct follow-up; create a new session for unrelated work.

## Watch Outs
- Do not store secrets, tokens, credentials, private keys, or large logs in `session/`.
- Keep startup files short; put detailed protocol text in `docs/AGENT_MEMORY.md`.

