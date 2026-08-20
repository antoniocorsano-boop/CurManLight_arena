# CURR-R4C Comparison & Candidate Review UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated read-only R4C sub-view in `CurriculumTab` that presents IN2012 and IN2025 side by side, separates R4A structural differences from R4B semantic candidates, and provides synchronized endpoint highlighting without approval or persistence actions.

**Architecture:** Keep R4A and R4B as the only domain sources. Add a small pure review-model adapter that joins candidate endpoints to comparison items by `nodeId`, keeps source-native area identity side-specific, and resets selection whenever scope changes. Render the adapter output in a dedicated `CurriculumComparisonReviewView`; integrate it as a new `CurriculumTab` sub-view without adding a top-level route or replacing `NationalCurriculumView`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, existing Tailwind utility classes, existing R4A and R4B services.

---

### Task 1: Define the R4C scope and read-model contracts

**Files:**
- Create: `src/features/curriculum/components/curriculumComparisonReviewModel.ts`
- Test: `src/__tests__/curriculum-domain/curriculum-comparison-review-model.test.ts`
- Modify: `src/domain/curriculum/nationalCurriculumComparison.ts` only after a failing R4C test proves the current API cannot represent side-specific source-area scope
- Modify: `src/domain/curriculum/nationalCurriculumSemanticCandidates.ts` only after the same failing R4C test proves the candidate API also needs that additive scope

- [x] **Step 1: Write failing tests for source and selection contracts**

```ts
it('resolves candidate endpoints by nodeId, never by text or list position', () => {
  const result = buildComparisonReviewModel(comparison, candidates, null);
  expect(result.candidates[0].left?.id).toBe(candidates[0].left.nodeId);
  expect(result.candidates[0].right?.id).toBe(candidates[0].right.nodeId);
});

it('does not treat source-native area codes as shared identity', () => {
  const scope = createReviewScope({
    schoolOrder: 'secondaria',
    leftSourceAreaCode: 'strumento-musicale',
    rightSourceAreaCode: 'musica'
  });
  expect(scope.leftSourceAreaCode).not.toBe(scope.rightSourceAreaCode);
});

it('starts with no selected candidate and resets on scope change', () => {
  const state = createReviewSelectionState();
  expect(state.selectedCandidateId).toBeNull();
  expect(resetSelectionOnScopeChange(state).selectedCandidateId).toBeNull();
});
```

- [x] **Step 2: Run the model tests and verify RED**

Run:

```bash
npx vitest run src/__tests__/curriculum-domain/curriculum-comparison-review-model.test.ts
```

Expected: FAIL because the R4C model functions do not yet exist.

- [x] **Step 3: Implement the minimal pure model**

Define these contracts without React or fixture imports:

```ts
export interface ReviewScope {
  schoolOrder?: SchoolOrder;
  disciplineCode?: DisciplineCode | null;
  normativeCheckpoint?: NormativeCheckpoint;
  leftSourceAreaCode?: string;
  rightSourceAreaCode?: string;
}

export interface ReviewCandidate {
  candidate: SemanticMappingCandidate;
  left: ContentItem | null;
  right: ContentItem | null;
}

export function buildComparisonReviewModel(
  comparison: NationalCurriculumComparisonResult,
  candidates: SemanticMappingCandidate[],
  selectedCandidateId: string | null,
): { candidates: ReviewCandidate[]; selected: ReviewCandidate | null };

export function createReviewScope(input: ReviewScope): ReviewScope;
export function createReviewSelectionState(): { selectedCandidateId: string | null };
export function resetSelectionOnScopeChange(state: { selectedCandidateId: string | null }): { selectedCandidateId: null };
```

Resolve endpoints strictly by `nodeId`; never fall back to text, label, position, proximity, or confidence.

- [x] **Step 4: Extend R4A/R4B scope only after a fail-closed proof**

Do not modify R4A or R4B to simplify the UI. First run the focused R4C source-native-area test against the current APIs. Only if that test demonstrates that side-specific selection cannot be represented, preserve existing callers and add:

```ts
export interface ComparisonScope {
  sourceAreaCode?: string;
  leftSourceAreaCode?: string;
  rightSourceAreaCode?: string;
}
```

Apply each side-specific code only to its originating framework query. Do not compare the two strings as equivalent.

- [x] **Step 5: Run model and domain regression tests**

```bash
npx vitest run src/__tests__/curriculum-domain/curriculum-comparison-review-model.test.ts src/__tests__/curriculum-domain/national-curriculum-comparison.test.ts src/__tests__/curriculum-domain/national-curriculum-semantic-candidates.test.ts
```

Expected: all selected tests pass.

- [x] **Step 6: Commit the read-model contract**

```bash
git add src/features/curriculum/components/curriculumComparisonReviewModel.ts src/__tests__/curriculum-domain/curriculum-comparison-review-model.test.ts
git commit -m "feat(curriculum): add R4C comparison review model"
```

Include R4A/R4B files only if Step 4 changed them.

#### Task 1 execution evidence

Reported by implementer (test output was not saved as a separate artifact):

- RED: before the selection correction, the dedicated model test reported 2 correctly failing selection/reset tests: omitted `selectedCandidateId` was not fail-closed, and equal scopes did not preserve selection.
- GREEN after `f8fbde3`: dedicated review-model test, `7/7 PASS`.
- `npm run typecheck`: PASS.
- Task 1 commits: `b68c257` (`feat(curriculum): add R4C comparison review model`) and `f8fbde3` (`fix(curriculum): harden R4C review model selection`).
- No UI, `CurriculumTab`, R4A, or R4B API changes were made.

### Task 2: Add failing R4C UI tests

**Files:**
- Create: `src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx`

- [ ] **Step 1: Write focused UI tests**

Cover split rendering, the three inspector states, synchronized selection, scope reset, OSA metadata, and the no-write boundary:

```tsx
it('renders IN2012 and IN2025 panels plus distinct R4A and R4B sections', () => {
  render(<CurriculumComparisonReviewView {...props} />);
  expect(screen.getByRole('heading', { name: 'IN2012' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'IN2025' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Differenze strutturali' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Candidati semantici' })).toBeInTheDocument();
});

it('does not auto-select or rank candidates by confidence', () => {
  render(<CurriculumComparisonReviewView {...propsWithCandidates} />);
  expect(screen.getByText('Seleziona un candidato per visualizzare le evidenze.')).toBeInTheDocument();
  expect(screen.queryByText('Approva')).not.toBeInTheDocument();
  expect(screen.queryByText('Salva relazione')).not.toBeInTheDocument();
});

it('clears selectedCandidateId when the scope changes', () => {
  const { rerender } = render(<CurriculumComparisonReviewView {...propsWithCandidates} />);
  fireEvent.click(screen.getByRole('button', { name: /candidato/i }));
  rerender(<CurriculumComparisonReviewView {...propsWithCandidates} scope={{ schoolOrder: 'secondaria' }} />);
  expect(screen.getByText('Seleziona un candidato per visualizzare le evidenze.')).toBeInTheDocument();
});

it('shows Strumento musicale as a structural-only difference and preserves OSA metadata', () => {
  render(<CurriculumComparisonReviewView {...strumentoMusicaleProps} />);
  expect(screen.getByText(/Nessuna corrispondenza candidata/)).toBeInTheDocument();
  expect(screen.getByText('osa-2025')).toBeInTheDocument();
});
```

Also test the empty-content and no-structural-difference states, accessible labels, and the narrow layout's sequential IN2012/IN2025 sections. Prefer roles and visible labels; use `data-testid` only where no accessible query is practical.

- [ ] **Step 2: Run the UI tests and verify RED**

```bash
npx vitest run src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx
```

Expected: FAIL because the component is not implemented.

### Task 3: Implement the read-only split view

**Files:**
- Create: `src/features/curriculum/components/CurriculumComparisonReviewView.tsx`
- Modify: `src/features/curriculum/components/index.ts`

- [ ] **Step 1: Add explicit read-only props and local selection state**

```tsx
interface CurriculumComparisonReviewViewProps {
  comparisonService: NationalCurriculumComparisonService;
  candidateService: SemanticMappingCandidateService;
  scope?: ReviewScope;
}
```

Keep `selectedCandidateId` local and initialize it to `null). Reset it when shared scope or either source-native area selection changes. Do not expose approval, save, edit, persistence, or link-creation callbacks.

- [ ] **Step 2: Render filters and two framework panels**

Render labelled controls for school order, discipline/area, checkpoint, and side-specific source areas. Use shared scope for school order, discipline, and checkpoint; pass source-area selections only to their originating side. Render IN2012 left and IN2025 right with human-readable content and metadata. Keep `nodeId` internal for joins, highlighting, and tests; do not render it as ordinary UI content.

- [ ] **Step 3: Render separate R4A and R4B lower sections**

```tsx
<section aria-labelledby="r4a-heading">
  <h2 id="r4a-heading">Differenze strutturali</h2>
</section>
<section aria-labelledby="r4b-heading">
  <h2 id="r4b-heading">Candidati semantici</h2>
</section>
```

Structural differences never become candidate rows. Candidate rows show relation kind, evidence, descriptive confidence, and the non-editable “Candidato” status.

- [ ] **Step 4: Implement the three inspector states and highlighting**

For zero candidates show “Nessuna corrispondenza candidata per questa selezione.” For candidates with no selection show the list and “Seleziona un candidato per visualizzare le evidenze.” For a selected candidate show the detailed inspector and highlight both endpoints by node ID. Preserve `nodeType`, `normativeNodeKind`, and `frameworkApplicability`.

- [ ] **Step 5: Implement responsive and empty states**

Use two columns at wide widths and sequential sections at narrow widths. Cover empty content, no structural differences, no candidates, and framework-only Strumento musicale without fabricating a mapping.

- [ ] **Step 6: Run UI tests to GREEN**

```bash
npx vitest run src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx
```

Expected: all focused R4C UI tests pass.

- [ ] **Step 7: Commit the view**

```bash
git add src/features/curriculum/components/CurriculumComparisonReviewView.tsx src/features/curriculum/components/index.ts src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx
git commit -m "feat(curriculum): add R4C comparison review view"
```

### Task 4: Integrate R4C at the CurriculumTab boundary

**Files:**
- Modify: `src/features/session/types/appViewContracts.ts`
- Modify: `src/types/curriculum.ts`
- Modify: `src/features/curriculum/components/CurriculumTab.tsx`
- Test: `src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx`

- [ ] **Step 1: Add a dedicated curriculum sub-view identifier**

```ts
export type ActiveCurricoloView =
  | 'home' | 'albero' | 'mappa' | 'popolamento'
  | 'pilota' | 'nazionale' | 'confronto';
```

Update corresponding state and setter types only where TypeScript requires it. Add no route.

- [ ] **Step 2: Construct services at CurriculumTab**

```tsx
const comparisonService = createNationalCurriculumComparisonService();
const candidateService = createSemanticMappingCandidateService(comparisonService);
```

Pass only services and read-only context to the R4C component. Do not pass fixtures or persistence handlers.

- [ ] **Step 3: Add navigation and render branch**

Add a neutral “Confronto 2012 / 2025” entry. Render R4C only for `activeCurricoloView === 'confronto'`; keep `NationalCurriculumView` under `nazionale`.

- [ ] **Step 4: Add integration assertions**

Assert that the comparison headings render and that no approval/save/link-writing controls appear.

- [ ] **Step 5: Commit the integration**

```bash
git add src/features/session/types/appViewContracts.ts src/types/curriculum.ts src/features/curriculum/components/CurriculumTab.tsx src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx
git commit -m "feat(curriculum): integrate R4C in CurriculumTab"
```

### Task 5: Run the complete R4C verification gate

- [ ] **Step 1: Run focused R4C tests**

```bash
npx vitest run src/__tests__/curriculum-domain/curriculum-comparison-review-model.test.ts src/__tests__/curriculum-domain/curriculum-comparison-review-ui.test.tsx
```

- [ ] **Step 2: Run curriculum-domain regression**

```bash
npx vitest run src/__tests__/curriculum-domain/
```

- [ ] **Step 3: Run repository gates**

```bash
npm run test:fast
npx tsc --noEmit
npm run build
```

Expected: `test:fast` remains `273/273 PASS`, TypeScript exits 0, and Vite build exits 0.

- [ ] **Step 4: Audit the write boundary**

```bash
rg -n "onApprove|onSave|onCreateLink|CurriculumLink|create.*Link|persist|save|approve|accept" src/features/curriculum/components/CurriculumComparisonReviewView.tsx
rg -n "activeCurricoloView === 'confronto'|CurriculumComparisonReviewView" src/features/curriculum/components/CurriculumTab.tsx
```

Expected: the new R4C component has no approval, persistence, or link-creation handlers; the `CurriculumTab` match is limited to the dedicated `confronto` branch and component integration. Existing save/import behavior in other `CurriculumTab` sub-views is outside this audit.

- [ ] **Step 5: Push only the R4C implementation**

```bash
git status --short
git log --oneline -6
git push
```

Do not add `src/__tests__/curriculum-domain/import-test.test.ts`, `AGENTS.md`, `kilo.jsonc`, or session files.

## Self-review checklist

- Source fixtures are not imported by R4C UI or review-model code.
- Shared filters and source-native area filters are not conflated.
- Candidate endpoints are joined only by `nodeId`.
- Candidate selection starts null, never ranks by confidence, and resets on scope changes.
- R4A structural differences and R4B candidates remain separate.
- OSA 2025 and Strumento musicale behavior are covered.
- Responsive layout preserves endpoint identity.
- No approval, edit, persistence, `CurriculumLink`, or R5 workflow path exists.
- `CurriculumTab` is the only integration boundary; no route or NationalCurriculumView replacement is introduced.
