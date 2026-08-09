# P1.3 Curriculum Consultation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement the approved P1.3 consultation path from current curriculum through tree, real-link graph, node detail, and planning handoff.

**Architecture:** Reuse the existing canonical curriculum domain and A02→A04 transfer contract. Introduce one read-only consultation projection and make all curriculum views render projections of it; keep mutations and institutional revision outside this slice.

**Tech Stack:** React 18, TypeScript, Zustand, Vitest, existing curriculum domain and transfer contracts.

---

## Reconnaissance result

The runtime currently has legacy `CurriculumMap` UI projections, an existing
canonical curriculum domain/read model, and a tested A02→A04 transfer contract.
It does not yet have a shared consultation projection, a node detail surface, a
real-link graph surface, or a UI handoff that preserves canonical node identity.

## Task 1: Establish the consultation read model

**Files:**

- Modify: `src/domain/curriculum/readModels.ts`
- Modify: `src/domain/curriculum/index.ts` only if new public types must be exported
- Test: `src/__tests__/curriculum-domain/curriculum-domain.test.ts` or a focused new `src/__tests__/curriculum-consultation-read-model.test.ts`

- [ ] Define a read-only consultation result containing `curriculumVersionRef`, `schoolOrder`, `disciplineCode`, segment, node, source/provenance, and related real links.
- [ ] Make queries filter the existing canonical adapted domain by order, discipline, text, and node identity without creating links.
- [ ] Return an explicit empty-links result when the domain has no real `CurriculumLink` records.
- [ ] Add tests for same-model filtering, node identity, version/provenance preservation, and no inferred links.
- [ ] Run: `npx vitest run --config vitest.domain.config.ts src/__tests__/curriculum-consultation-read-model.test.ts`
- [ ] Expected: focused read-model tests pass.
- [ ] Commit: `feat(p1.3): add canonical curriculum consultation read model`

## Task 2: Connect CURR-01 and CURR-02 to the shared projection

**Files:**

- Modify: `src/features/curriculum/components/CurriculumTab.tsx`
- Modify: `src/store/useCurriculumStore.ts` only if canonical selection continuity cannot remain in the view contract
- Test: `src/__tests__/p1-3-curriculum-consultation.test.tsx`

- [ ] Keep the existing discipline/order controls, but expose the active current version and provenance from the read model.
- [ ] Render the existing list/home and tree using the same node projection; do not maintain a parallel dataset.
- [ ] Make tree items selectable by canonical node identity, not by array index alone.
- [ ] Keep CURR-01/02 read-only and remove wording that presents legacy local content as a validated institutional curriculum.
- [ ] Test that changing order/discipline changes all projections consistently and preserves the selected context.
- [ ] Run: `npx vitest run --config vitest.ui.config.ts src/__tests__/p1-3-curriculum-consultation.test.tsx`
- [ ] Expected: CURR-01/02 focused tests pass.
- [ ] Commit: `feat(p1.3): align curriculum list and tree with canonical read model`

## Task 3: Add CURR-04 node detail

**Files:**

- Create: `src/features/curriculum/components/CurriculumNodeDetail.tsx`
- Modify: `src/features/curriculum/components/CurriculumTab.tsx`
- Test: `src/__tests__/p1-3-curriculum-consultation.test.tsx`

- [ ] Render the selected node's text, node type, version, segment, provenance, source references, available evidence, and real related links.
- [ ] Show a clear read-only state when a selected node has no source or no relations.
- [ ] Use the primary CTA label “Usa nella progettazione”.
- [ ] Do not expose curriculum mutation, revision opening, proposal creation, or institutional decision actions.
- [ ] Test detail rendering and the absence of mutation controls.
- [ ] Run the focused UI test.
- [ ] Expected: CURR-04 tests pass.
- [ ] Commit: `feat(p1.3): add curriculum node consultation detail`

## Task 4: Replace the legacy map projection with a real-link graph

**Files:**

- Create: `src/features/curriculum/components/CurriculumGraphView.tsx`
- Modify: `src/features/curriculum/components/CurriculumTab.tsx`
- Test: `src/__tests__/p1-3-curriculum-consultation.test.tsx`

- [ ] Render nodes from the same consultation projection used by list/tree/detail.
- [ ] Render an edge only when a canonical `CurriculumLink` exists and carries its type/status/provenance.
- [ ] Render a truthful empty state when no real links are available; never connect nodes because they share an order or discipline.
- [ ] Keep graph interactions consultive: select node, follow real link, open detail.
- [ ] Test one real edge and one no-edge dataset.
- [ ] Run the focused UI test.
- [ ] Expected: graph tests pass without invented edges.
- [ ] Commit: `feat(p1.3): make curriculum graph projection read-only and provenance-aware`

## Task 5: Implement CURR-04 → PLAN-02 handoff

**Files:**

- Modify: `src/features/curriculum/components/CurriculumNodeDetail.tsx`
- Modify: `src/domain/design/transferA02.ts` only if the existing payload needs a typed canonical identity field
- Modify: `src/features/progettazione/components/ProgettazioneTab.tsx` or its existing handler boundary
- Test: `src/__tests__/design-transfer-a02.test.ts`
- Test: `src/__tests__/p1-3-curriculum-consultation.test.tsx`

- [ ] Build the transfer payload from the selected canonical node, version, source references, evidence references, and text snapshot.
- [ ] Invoke the existing A02→A04 transfer boundary rather than copying text into planning state directly.
- [ ] Navigate to PLAN-02 only after a successful transfer and preserve the selected discipline/order/context.
- [ ] Show a recoverable error when required identity/version data is missing.
- [ ] Test that node identity, version, snapshot, sources, and evidence survive the handoff.
- [ ] Run: `npx vitest run --config vitest.domain.config.ts src/__tests__/design-transfer-a02.test.ts`
- [ ] Expected: existing transfer tests and new identity-continuity tests pass.
- [ ] Commit: `feat(p1.3): connect curriculum detail to planning transfer`

## Task 6: Verify P1.3-R1

**Files:**

- Modify only focused tests if verification exposes a P1.3 defect.
- No unrelated runtime files are in scope.

- [ ] Run typecheck: `npm run typecheck`.
- [ ] Run relevant curriculum/domain tests: `npm run test:curriculum`.
- [ ] Run focused fast suite: `npm run test:fast`.
- [ ] Run build: `npm run build`.
- [ ] Run the five-transition browser smoke: CURR-01 → CURR-02 → CURR-03 → CURR-04 → PLAN-02.
- [ ] Compare each view with H2V IDs and verify no mutation or invented data appears.
- [ ] Record visual and human-workflow results in the P1.3 handoff.
- [ ] Commit: `test(p1.3): verify canonical curriculum consultation workflow`

## Scope guard

Do not implement B3B/B3C/B3E/B3F, institutional review opening, shared UDA,
anonymous improvement, system dashboards, new remote dependencies, or unrelated
visual cleanup in this plan.
