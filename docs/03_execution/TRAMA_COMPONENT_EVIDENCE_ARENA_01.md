# TRAMA Component Evidence — Arena slice 01

**Status:** PROPOSED / QUALIFICATION — R1 remediation  
**Date:** 2026-09-30  
**TRAMA registry baseline:** `12387e245c0387654ed4492d834472d82aba353b`  
**Arena baseline:** `acf781af64cb097fcf80c3bce9fdf56274f9bbde`

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
- explicit tab-to-panel binding;
- accessible name for the `tablist`;
- no dangling `aria-controls` references;
- deterministic reachable fallback when the requested/previous active tab is unavailable.

## R1 post-merge remediation

The review posted after merge of Arena PR #341 identified two accessibility defects that were not present in the pre-merge qualification evidence:

1. inactive tabs declared `aria-controls` IDs for panels that were not mounted;
2. an invalid `defaultTab`, or removal of the active tab during a later `tabs` update, could leave every tab at `tabIndex=-1`.

R1 resolves the findings while preserving the existing mount semantics of tab content:

- every tab keeps `aria-controls` and points to a real, mounted `tabpanel` shell;
- inactive panel shells are `hidden`, while their content remains unmounted until activation;
- the `tablist` receives an accessible name through `ariaLabel` (default: `Sezioni`);
- `resolvedActiveId` falls back to the first available tab whenever the stored active ID is absent;
- the fallback is persisted into component state without emitting a user-originated `onChange`;
- an empty tab collection exposes neither tabs nor orphan panels;
- targeted tests cover the accessible tablist name, invalid defaults, active-tab removal, complete tab-to-panel references and lazy inactive content.

The mounted-shell approach follows the WAI-ARIA tabs relationship while avoiding eager mounting of stateful or effectful inactive content.

### ARENA.TOOLTIP.LEGACY
Implementation:
- `src/components/ui/Tooltip.tsx`

This slice does not remediate or extend the legacy tooltip. A source guard records its current pointer-only behavior so new evidence cannot accidentally present it as qualified.

## Boundaries

- no new runtime dependency;
- no migration of legacy ConfirmDialog/Tabs usages;
- no Tooltip replacement;
- no global visual redesign;
- no change to Arena curriculum authority;
- no eager mounting of inactive tab content.

## Exit criteria

R1 is qualified only when Arena CI passes on the exact PR head and an independent review finds no unresolved blocker. The resulting immutable PR head/run can then replace the earlier Arena Tabs evidence in the TRAMA component evidence registry. The Dialog evidence from PR #341 remains valid unless a new review finds a Dialog-specific defect.
