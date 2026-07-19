---
applyTo: "session/**,AGENTS.md,CLAUDE.md,docs/AGENT_MEMORY.md,scripts/agent-memory.ps1,.github/**/*.md"
---

# Agent Memory Editing Instructions

When editing memory or agent-instruction files:

- Keep startup files concise. Put reusable detail in `docs/AGENT_MEMORY.md`.
- Preserve compatibility across Codex, opencode, Copilot, and Claude.
- Keep `handoff.md` focused on what the next agent must know immediately.
- Never record credentials, tokens, private keys, or personal secrets.
- Use append-only timeline entries for important commands and decisions.
- Prefer factual notes over narrative transcripts.

