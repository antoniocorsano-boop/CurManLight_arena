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

## OmniRoute Model Layer

OmniRoute is installed as the local model router on port `20128`. Use it when an agent should select from multiple model/provider options with automatic fallback instead of binding directly to a single upstream model.

Codex profiles are generated under the user Codex home with:

```powershell
omniroute serve --daemon --no-open
omniroute setup-codex
```

Recommended Codex profiles for this repo:

| Workload | Command | Notes |
| --- | --- | --- |
| Small local edits | `omniroute launch-codex --profile auto-fast` | Fastest loop for low-risk work. |
| Main implementation | `omniroute launch-codex --profile auto-best-coding` | Default for feature work and code changes. |
| Audits and architecture | `omniroute launch-codex --profile auto-best-reasoning` | Better for long-form review and planning. |
| Budget-sensitive exploration | `omniroute launch-codex --profile auto-cheap` | Use for drafts, summaries, and low-stakes checks. |
| Reliability-sensitive coding | `omniroute launch-codex --profile auto-coding-reliable` | Prefer when fallback behavior matters more than speed. |
| Large-context analysis | `omniroute launch-codex --profile auto-gemini` | Useful for broad document/codebase reads. |

Check OmniRoute before relying on routed profiles:

```powershell
omniroute doctor
omniroute models --json
```

Configured agent surfaces:

| Agent | OmniRoute setup | Use |
| --- | --- | --- |
| Codex CLI | `~/.codex/*.config.toml` profiles plus `codex.cmd` shim | `omniroute launch-codex --profile auto-best-coding` |
| Claude Code | `~/.claude/profiles/auto-*` profiles | `omniroute launch --profile auto-best-coding` |
| OpenCode | bundled `@omniroute/opencode-plugin` plus `omniroute` auth | `opencode -m omniroute/auto/best-coding` or pick OmniRoute in the model list |
| Cline | `~/.cline/data` OpenAI-compatible settings | Base URL `http://localhost:20128`, model `auto/best-coding` |
| Kilo Code | `~/.local/share/kilo/auth.json` and `~/.config/kilocode/settings.json` | Base URL `http://localhost:20128/v1`, model `auto/best-coding` |

## Routing Matrix
| Task Type | Primary Tool | Backup Tool | Why |
| --- | --- | --- | --- |
| Quick local question or tiny edit | Codex CLI via `auto-fast` | Claude Code | Fast terminal loop with low context overhead. |
| Product/design planning | Claude Code or Cline | Kilo Architect | Stronger long-form reasoning before edits. |
| Feature implementation | Agent Space + Codex `auto-best-coding`/Kilo | Cline | Worktree isolation prevents agents from colliding. |
| UI/browser debugging | Cline or Kilo | Codex with Playwright | Browser/tool visibility matters more than raw speed. |
| Refactor across files | Agent Space + Claude/Kilo | Codex `auto-best-reasoning` | Dedicated branch/worktree plus stronger codebase reasoning. |
| Test failure/debug loop | Codex `auto-coding-reliable` | Kilo Debugger | Keep the loop close to terminal output and verification. |
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
- `omniroute`

If a tool disappears from PATH, update `.vscode/settings.json` or the user-level Super CLI settings with an absolute command path.

## Windows Notes

Agent Space uses `tmux` for persistent sessions. On Windows, VS Code must be able to find `tmux` from the shell that Agent Space launches. Standard Git for Windows includes Git Bash, but it does not always include `pacman` or `tmux`. If `pacman` is unavailable, install MSYS2 or Git for Windows SDK first, then install `tmux` from that shell:

```bash
pacman -S tmux
```

After installing, reload VS Code and confirm `tmux` is visible in the integrated terminal with `tmux -V`.

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
