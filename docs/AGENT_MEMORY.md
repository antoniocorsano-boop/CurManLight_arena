# Agent Memory Protocol

CurManLight agents share memory through small Markdown files committed with the repository. This lets Codex, opencode, GitHub Copilot in VS Code, and Claude Code resume work without relying on a hidden chat transcript.

## Why

- Preserve the goal, plan, blockers, and changed files across terminal and VS Code sessions.
- Avoid spending tokens rediscovering repo structure and previous decisions.
- Make handoffs auditable by humans.
- Keep sensitive data out of memory.

## Directory Layout

Each work thread gets one directory:

```text
session/
  20260719_114529/
    session_state.md
    timeline.md
    files.md
    handoff.md
```

Use local time for the timestamp. Reuse the same directory until the work thread is complete or the user explicitly starts a new one.

## File Roles

`session_state.md` is the compact state of the work:

- stable goal,
- current subtask,
- loaded skills or agent-specific constraints,
- status,
- short plan,
- assumptions,
- blockers.

`timeline.md` is append-only. Add entries for important commands, decisions, failed attempts, verification, and direction changes.

`files.md` lists inspected and changed files with one-line reasons.

`handoff.md` is the first file a new agent should read. Keep it short and current.

## Agent Startup Checklist

1. Read `AGENTS.md`.
2. Run or mentally perform `scripts/agent-memory.ps1 status`.
3. Read the latest relevant `handoff.md`.
4. Read `session_state.md` if the task continues existing work.
5. Inspect only the files named in `files.md` or needed for the current task.
6. Verify important state with `git status --short --branch`.

## Checkpoint Checklist

Update memory when:

- a plan is chosen,
- files are edited,
- commands produce important output,
- tests pass, fail, or are skipped,
- a blocker appears,
- the user changes direction,
- the session ends.

## Token Discipline

- Put "what to do next" in `handoff.md`.
- Put detailed command history in `timeline.md`.
- Put file inventory in `files.md`.
- Do not paste large command outputs; summarize the useful lines.
- Reference long documents by path and heading instead of copying them.

## Safety

Never store:

- API keys,
- OAuth tokens,
- passwords,
- private keys,
- raw credential files,
- long logs containing user data.

If a secret is accidentally written, remove it immediately and rotate the secret outside this repository.

## Tooling

Use the PowerShell helper from terminal or VS Code:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 start -Goal "Improve memory for all agents"
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 checkpoint -Message "Added shared AGENTS.md protocol"
powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 status
```

The script is intentionally simple so every agent can inspect or modify the Markdown directly when needed.

