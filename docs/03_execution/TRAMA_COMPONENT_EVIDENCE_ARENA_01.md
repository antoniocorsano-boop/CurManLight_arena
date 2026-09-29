# TRAMA Component Evidence — Arena slice 01

**Status:** PROPOSED / QUALIFICATION  
**Date:** 2026-09-29  
**TRAMA registry baseline:** `b3077d93e1398911565544e8458afbe19a921900`  
**Arena baseline:** `9da1cf65ae86ff5a3a65888636bf04f3a7312a7b`

## Scope

This slice applies the TRAMA component evidence registry to the first Arena high-risk interaction targets without introducing a new component library.

### ARENA.DIALOG_CONFIRM.GOVERNED
Implementation:
- `src/ui/components/UiConfirmDialog.tsx`

Evidence surfaces:
- `src/ui/stories/UiConfirmDialog.stories.tsx`
- `src/__tests__/cml611-dialogs-confirmations.test.tsx`
- `src/__tests__/trama-component-evidence-arena-01.test.tsx`

Qualification intent:
- native dialog semantics;
- labelled/described content;
- existing confirmation behavior remains intact.

### ARENA.TABS.GOVERNED
Implementation:
- `src/ui/components/UiTabs.tsx`

Evidence surfaces:
- `src/ui/stories/UiTabs.stories.tsx`
- `src/__tests__/trama-component-evidence-arena-01.test.tsx`

Qualification intent:
- tablist/tab/tabpanel semantics;
- roving tabindex;
- ArrowLeft/ArrowRight wrap;
- Home/End navigation;
- automatic activation;
- explicit tab-to-panel binding.

### ARENA.TOOLTIP.LEGACY
Implementation:
- `src/components/ui/Tooltip.tsx`

This slice does not remediate or extend the legacy tooltip. A source guard records its current pointer-only behavior so new evidence cannot accidentally present it as qualified.

## Boundaries

- no new runtime dependency;
- no migration of legacy ConfirmDialog/Tabs usages;
- no Tooltip replacement;
- no global visual redesign;
- no change to Arena curriculum authority.

## Exit criteria

The slice is qualified only when Arena CI passes on the exact PR head. The resulting immutable PR head/run can then be written back into the TRAMA component evidence registry as executable evidence.
