# Files

## Inspected
- `package.json` - identified React/Vite project and scripts.
- `nemo-rl-session-memory/SKILL.md` - required structure and checkpoint rhythm.
- GitHub Copilot, VS Code, Claude Code, Codex, and opencode docs - confirmed instruction file conventions.

## Changed
- `AGENTS.md` - shared startup and memory protocol for Codex, opencode, Copilot, and other agents.
- `CLAUDE.md` - imports `AGENTS.md` and adds Claude-specific memory guidance.
- `.github/copilot-instructions.md` - repository-wide Copilot/VS Code instructions.
- `.github/instructions/agent-memory.instructions.md` - path-scoped instructions for memory files.
- `.vscode/settings.json` - enables instruction files for VS Code chat/Copilot.
- `docs/AGENT_MEMORY.md` - detailed shared memory protocol.
- `scripts/agent-memory.ps1` - helper for start, checkpoint, status, and handoff operations.
- `session/20260719_114529/` - active session checkpoint.

## Generated
- None beyond the session files above.
- `.clinerules/agent-memory.md` - Cline-specific adapter for shared session memory.
- `.kilo/rules/agent-memory.md` - Kilo Code-specific adapter for shared session memory.
- `kilo.jsonc` - Kilo Code project rules configuration.
- `docs/AGENT_ORCHESTRATION.md` - routing matrix and operational workflow for installed agents.
- `.vscode/extensions.json` - recommended orchestration and agent extensions.
- `.vscode/settings.json` - Agent Space custom tools and workspace orchestration settings.
- `.gitignore` - ignores Agent Space worktrees.
