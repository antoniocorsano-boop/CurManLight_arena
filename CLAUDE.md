@AGENTS.md

# Claude Code

## Source hierarchy

Use project guidance in this order:

1. `AGENTS.md`
2. `docs/WORKING_PROTOCOL.md`
3. `docs/PROJECT_BASELINE.md`
4. Documents specific to the approved slice
5. The verified repository state

If these sources conflict, stop and report the divergence instead of inventing a resolution.

## Shared memory

The `session/` directory contains shared project memory and handoffs. Agent-local memory may retain preferences and recurring lessons, but task state, results, commands, blockers, and next actions belong in the shared sources defined by the memory protocol.

Do not include session files in a commit unless the approved slice explicitly authorizes them.

## Project identity

CurManLight Arena is a React and TypeScript application for teachers and curriculum work. It uses Vite, local persistence, and a single-file HTML distribution. The primary runtime does not require a backend.

Exact library versions belong in `package.json`, `package-lock.json`, and `docs/PROJECT_BASELINE.md`.

## Verified commands

```powershell
npm test
npx tsc --noEmit
npm run build
npm run build-storybook
```

- `npm run build` performs a non-mutating Vite build and writes the single-file application to `dist/index.html`.
- `npm run build-storybook` writes Storybook output to `storybook-static/`.
- `dist/` and `storybook-static/` are generated artifacts ignored by Git.
- Do not add fixed test counts here; use the latest verified evidence in `docs/PROJECT_BASELINE.md`.

## Operating rules

- Start from the verified repository state.
- Do not modify `main` or publish changes without explicit authorization.
- Respect the approved slice and do not broaden a correction without approval.
- Run `git diff --check` before closure.
- Confirm that build and Storybook do not modify tracked files.
- Never include generated artifacts in commits.
- Keep architecture and navigation frozen unless a formal decision authorizes a change.
- Prefer product evolution and observable value for teachers over structural work.

## Architecture references

Do not duplicate volatile architecture details here. Use:

- `docs/PROJECT_BASELINE.md` for the current verified baseline;
- `docs/WORKING_PROTOCOL.md` for product-evolution rules;
- `docs/06_architecture_governance/` for architecture decisions;
- `docs/07_navigation_program/` for the frozen navigation baseline.

TypeScript validation is a green gate. Do not classify compiler errors as pre-existing or non-blocking without a current, explicit governance decision.
