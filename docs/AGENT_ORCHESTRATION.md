# Agent Orchestration

This repository uses VS Code as the control surface and `session/` as shared working memory. The goal is to choose the right agent for each task without losing context or letting agents overwrite each other.

## Installed Control Layer

- Super CLI (`mikesoft.vscode-super-cli`) launches coding CLIs from one VS Code sidebar.
- Agent Space (`paql4711.agent-space`) runs agents per feature in isolated Git worktrees and persistent terminal sessions.
- Vibe Rules (`viberules.viberules`) manages and syncs skills/rules across agent ecosystems.

The extension recommendations are tracked in `.vscode/extensions.json`. Workspace settings in `.vscode/settings.json` add Agent Space custom tools for `kilo`, `qwen`, and `gemini`; Agent Space already has built-in presets for `claude`, `codex`, `copilot`, and `opencode`.

## Default Workflow

1. Start every task with `npm run memory:status`.
2. Classify the task with the matrix below.
3. If the task is more than a small edit, create an Agent Space feature so work happens in a dedicated worktree.
4. Launch the selected agent through Super CLI or Agent Space.
5. Require the agent to update `session/<yyyyMMdd_HHmmss>/` before stopping.
6. Verify with the smallest reliable command: build, test, lint, targeted script, or manual inspection.
7. Merge or cherry-pick only reviewed work back into `main`.

## Routing Matrix

| Task Type | Primary Tool | Backup Tool | Why |
| --- | --- | --- | --- |
| Quick local question or tiny edit | Codex CLI | Claude Code | Fast terminal loop with low context overhead. |
| Product/design planning | Claude Code or Cline | Kilo Architect | Stronger long-form reasoning before edits. |
| Feature implementation | Agent Space + Codex/Kilo | Cline | Worktree isolation prevents agents from colliding. |
| UI/browser debugging | Cline or Kilo | Codex with Playwright | Browser/tool visibility matters more than raw speed. |
| Refactor across files | Agent Space + Claude/Kilo | Codex | Dedicated branch/worktree plus stronger codebase reasoning. |
| Test failure/debug loop | Codex | Kilo Debugger | Keep the loop close to terminal output and verification. |
| PR/review/check policy | Continue or Codex review | Claude Code | Use source-controlled checks where possible. |
| Parallel experiments | Agent Space | OpenHands/ACP later | Separate worktrees make comparison and rollback cheap. |
| Skill/rule synchronization | Vibe Rules | Manual files in repo | Keeps agent instructions aligned without copying by hand. |

## Installed CLI Detection

Confirmed available in this environment:

- `claude`
- `codex`
- `opencode`
- `kilo`
- `copilot`
- `qwen`
- `gemini`

If a tool disappears from PATH, update `.vscode/settings.json` or the user-level Super CLI settings with an absolute command path.

## Windows Notes

Agent Space uses `tmux` for persistent sessions. On Windows, use Git Bash and install tmux inside it before relying on persistent sessions:

```bash
pacman -S tmux
```

Super CLI does not need tmux. Use it as the low-friction launcher when persistence/worktree management is unnecessary.

## Memory Contract

All agents must use the shared protocol:

- Read `AGENTS.md` first.
- Read the latest relevant `session/*/handoff.md`.
- Write checkpoints with `npm run memory:checkpoint -- -Message "..."`.
- Never write secrets, tokens, credentials, private keys, or large logs into `session/`.

## Source Notes

- Super CLI supports a single launcher panel for Claude Code, Codex, Copilot CLI, Kilo, OpenCode, and custom CLIs.
- Agent Space supports per-feature worktrees, persistent tmux-backed sessions, and custom coding tools.
- Vibe Rules supports skill/rule sync across Claude Code, Codex, OpenCode, Copilot, Cline, Kilo Code, Continue, and others.
