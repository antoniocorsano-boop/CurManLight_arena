# Timeline

## 2026-07-19 11:45:29 +02:00
- User asked to improve memory across terminal and VS Code chat agents: opencode, Copilot, Codex, and Claude.
- Loaded `nemo-rl-session-memory`.
- Verified current repo is on `main` and aligned with `origin/main`.
- Found no existing `.github`, `.vscode`, `scripts`, or `session` directories.
- Chose `AGENTS.md` as the canonical shared memory instructions file, with `CLAUDE.md` importing it and Copilot using `.github/copilot-instructions.md`.


## 2026-07-19 11:47:53 +02:00
- Added shared agent memory protocol and verified status commands.

## 2026-07-19 11:49:37 +02:00
- Final verification before commit: memory status/handoff, package JSON parse, and git diff check passed.
## 2026-07-19 11:52:00 +02:00
- User asked to apply the same memory integration to Kilo Code and Cline.
- Verified Cline uses `.clinerules/` and can recognize `AGENTS.md`.
- Verified Kilo Code uses `AGENTS.md` and can load project rules from `kilo.jsonc` pointing at `.kilo/rules/*.md`.
- Added Cline and Kilo adapters that reuse the existing `session/` protocol.

## 2026-07-19 11:54:28 +02:00
- Verified Cline and Kilo Code memory adapters before commit.
## 2026-07-19 12:20:00 +02:00
- User asked to proceed with a VS Code orchestration solution for installed coding agents.
- Installed Super CLI directly from the Marketplace.
- Marketplace CLI lookup failed for Agent Space and Vibe Rules, so their official VSIX packages were resolved through the Marketplace API and installed locally.
- Detected available CLIs: `claude`, `codex`, `opencode`, `kilo`, `copilot`, `qwen`, and `gemini`.
- Added workspace recommendations, Agent Space custom tools, `.worktrees/` ignore rule, and `docs/AGENT_ORCHESTRATION.md`.

## 2026-07-19 12:25:03 +02:00
- Installed VS Code orchestration extensions and added routing documentation/settings.
