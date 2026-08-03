# CML-635A3 Unified Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the existing local settings area the single editable entry point for both `WorkspaceIdentity` and the teacher’s existing personal profile, while keeping their persistence and reset boundaries independent.

**Architecture:** Keep `WorkspaceIdentity` in `useCurriculumStore`. Make `useOnboardingProfile` the application interface for the existing teacher-profile persistence; UI components receive its values and actions instead of reading local-storage keys. Reuse the same profile actions from the first-run onboarding and the settings panel, with temporary drafts only inside the visible form.

**Tech Stack:** React 18, TypeScript, Zustand, existing `consolidatedStorage` helpers, Vitest, Testing Library, Tailwind classes already used by session components.

---

## File map

- Modify `src/features/session/hooks/useOnboardingProfile.ts`: expose the canonical teacher-profile values, draft-safe save/reset actions, and compatibility reads for the existing keys.
- Modify `src/features/session/components/SessionModals.tsx`: pass the canonical profile contract into onboarding/settings and remove direct section-key writes from the component.
- Modify `src/features/session/components/InstitutionConfigPanel.tsx`: add the environment-context editing section backed by A2 and keep its draft separate from the teacher profile.
- Create `src/features/session/components/TeacherProfileConfigPanel.tsx`: render the editable profile section and call only the hook-provided actions.
- Modify `src/features/session/types/appModalContracts.ts` only if the existing session contract needs the new profile action/value fields.
- Create `src/__tests__/cml-635a3-unified-configuration.test.tsx`: cover settings, onboarding reuse, migration compatibility, independent resets, and role inertness.
- Modify `src/__tests__/institution-integration.test.tsx` only where the existing institution harness needs to render the new combined settings contract.

### Task 1: Establish the failing compatibility and ownership tests

**Files:**
- Create: `src/__tests__/cml-635a3-unified-configuration.test.tsx`

- [ ] **Step 1: Add tests for the existing profile keys and canonical actions**

Use the existing test setup and `localStorage.clear()` in `beforeEach`. The first tests must assert that a profile seeded with the current keys is visible through the settings-facing contract, and that saving writes only the existing keys plus the existing Zustand `order`/`discipline` state.

```ts
it('reads an existing onboarding profile without migration', () => {
  localStorage.setItem('curman_isSostegno', 'true');
  localStorage.setItem('curman_assignedClasses', '1,2');
  localStorage.setItem('curman_availableSections', 'A,B');
  localStorage.setItem('curman_assignedCombinations', '1A,2B');
  // Render the shared profile contract through the settings harness.
  expect(screen.getByDisplayValue('A')).toBeInTheDocument();
  expect(screen.getByText('1A')).toBeInTheDocument();
});
```

Add explicit cases for no profile, partial profile, malformed section input, and pre-existing combinations. Add a test that resets the environment identity and verifies the profile values remain; add the inverse test for profile reset and `workspaceIdentity`.

- [ ] **Step 2: Add the role-inertness assertion**

Configure a valid `WorkspaceIdentity` with a declared role and assert that no settings control is enabled/disabled or hidden as a consequence of that role. The test must not assert authorization behavior because A3 must not introduce it.

- [ ] **Step 3: Run the focused test to confirm it fails**

Run:

```bash
npx vitest run --config vitest.config.ts src/__tests__/cml-635a3-unified-configuration.test.tsx
```

Expected: FAIL because the settings profile section and shared profile actions do not yet exist.

### Task 2: Make `useOnboardingProfile` the single profile interface

**Files:**
- Modify: `src/features/session/hooks/useOnboardingProfile.ts`
- Modify: `src/features/session/components/SessionModals.tsx`
- Modify: `src/features/session/types/appModalContracts.ts` if required by TypeScript

- [ ] **Step 1: Define the profile contract in the existing hook**

Add a local type in `useOnboardingProfile.ts`:

```ts
export interface TeacherProfileDraft {
  teacherType: 'comune' | 'specialista';
  isSostegno: boolean;
  order: SchoolOrder;
  discipline: string;
  assignedClasses: string[];
  availableSections: string[];
  assignedCombinations: string[];
}
```

Initialize all fields from the existing sources: `useCurriculumStore` supplies `order` and `discipline`; `safeLocalStorageGetItem` reads only the four existing personal keys. Normalize comma-separated values by trimming, removing empty values, and de-duplicating without changing valid legacy values.

- [ ] **Step 2: Expose one save and one reset action**

Expose `teacherProfile`, `setTeacherProfileDraft`, `saveTeacherProfile`, and `resetTeacherProfile` from the hook. `saveTeacherProfile` must call `setOrder`, `setDiscipline`, and the existing storage helper for the four profile keys. It must not write a new key and must not call `setWorkspaceIdentity`.

`resetTeacherProfile` clears only the four profile keys, resets the existing profile fields to neutral values, and leaves `WorkspaceIdentity` untouched. Keep `curman_targetClass` and `curman_targetSection` outside this action because they are workflow-navigation preferences.

- [ ] **Step 3: Route existing onboarding handlers through the contract**

Replace direct `safeLocalStorageSetItem('curman_availableSections', ...)` calls in `SessionModals.tsx` with the hook-provided section action. Ensure the onboarding’s final save calls `saveTeacherProfile` and does not independently write the same keys.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS, or only failures from the still-unimplemented settings component props, which must be resolved before moving to Task 3.

### Task 3: Add the teacher profile settings section

**Files:**
- Create: `src/features/session/components/TeacherProfileConfigPanel.tsx`
- Modify: `src/features/session/components/SessionModals.tsx`

- [ ] **Step 1: Render the neutral, partial, and operational states**

The panel must have an accessible heading `Profilo docente`, a status region, and controls for order, discipline, teacher type/support, assigned classes, sections, and combinations. It must render existing values on mount and after reopening; local component state is only a temporary draft.

Use the existing labels and Tailwind conventions from `SessionModals.tsx`. Do not access `localStorage` in this component.

- [ ] **Step 2: Implement independent save/reset controls**

The save button calls `saveTeacherProfile(draft)`. The reset button calls `resetTeacherProfile()` and clears only the profile draft. A pending profile draft must not update `useCurriculumStore` or `WorkspaceIdentity` until save.

- [ ] **Step 3: Support existing onboarding data without destructive migration**

When keys are missing, show the neutral profile state. When values are malformed, omit only the malformed entry and preserve valid entries. Existing combinations remain visible and editable. The component must not introduce a new persistence key.

- [ ] **Step 4: Mount the panel in the existing settings surface**

Render `TeacherProfileConfigPanel` alongside `InstitutionConfigPanel` in the existing local-settings flow. Keep onboarding as the first-run guided presentation of the same hook contract; it must not create a second persistence path.

### Task 4: Complete the environment-context section

**Files:**
- Modify: `src/features/session/components/InstitutionConfigPanel.tsx`

- [ ] **Step 1: Add a workspace identity draft**

Read `workspaceIdentity`, `institutionalArchive`, `setWorkspaceIdentity`, and `resetWorkspaceIdentity` from `useCurriculumStore`. Initialize the draft from the persisted identity, or from the active institutional archive references only for display. Do not write the store while fields are being edited.

- [ ] **Step 2: Define required fields and explicit statuses**

Require operating mode, institute, and academic year. Treat site, actor, and declared role as optional. Display `Neutro`, `Bozza incompleta`, or `Configurato`; an invalid persisted value must already have been normalized by A2 to neutral.

- [ ] **Step 3: Save and reset independently**

On save, create a candidate with `createWorkspaceIdentity`, validate it through A1, and call `setWorkspaceIdentity` only after validation succeeds. On reset, call `resetWorkspaceIdentity` and do not touch teacher-profile keys. A closed unsaved form discards its draft.

- [ ] **Step 4: Keep the declared role inert**

The role field is descriptive only. Do not gate controls, add permissions, alter exports, or change document behavior based on it.

### Task 5: Make onboarding and settings consume the same profile contract

**Files:**
- Modify: `src/features/session/hooks/useOnboardingProfile.ts`
- Modify: `src/features/session/components/SessionModals.tsx`
- Modify: `src/App.tsx` only if prop threading is required

- [ ] **Step 1: Rehydrate onboarding from the canonical profile values**

When the onboarding opens, initialize its draft from `teacherProfile`, including existing classes, sections, and combinations. Do not reintroduce local-storage reads in onboarding components.

- [ ] **Step 2: Verify settings-to-onboarding reflection**

After saving in settings, opening onboarding must show the same order, discipline, support status, classes, sections, and combinations. After saving onboarding, reopening settings must show the same values.

- [ ] **Step 3: Preserve independent context/profile resets**

Add tests that reset one section at a time and assert the other section remains unchanged.

### Task 6: Finish focused tests and verification

**Files:**
- Modify: `src/__tests__/cml-635a3-unified-configuration.test.tsx`
- Modify: existing integration tests only when assertions need the unified panel

- [ ] **Step 1: Run focused A3 tests**

```bash
npx vitest run --config vitest.config.ts src/__tests__/cml-635a3-unified-configuration.test.tsx src/__tests__/institution-integration.test.tsx
```

Expected: all focused UI and integration tests pass.

- [ ] **Step 2: Run repository checks**

```bash
npx tsc --noEmit
npm run test:fast
npm run build
git diff --check
```

Expected: TypeScript, fast suite, build, and whitespace checks pass. Record the existing Graphify environmental limitation separately; do not modify Graphify in A3.

- [ ] **Step 3: Review persistence boundaries**

Run:

```bash
rg -n "localStorage\.(getItem|setItem|removeItem).*curman_(isSostegno|assignedClasses|availableSections|assignedCombinations)" src/features/session src/features/session/components
```

Expected: direct profile-key access remains only in `useOnboardingProfile.ts` or the existing consolidated storage boundary, with no new UI access.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/features/session/hooks/useOnboardingProfile.ts src/features/session/components/SessionModals.tsx src/features/session/components/InstitutionConfigPanel.tsx src/features/session/components/TeacherProfileConfigPanel.tsx src/features/session/types/appModalContracts.ts src/__tests__/cml-635a3-unified-configuration.test.tsx
git commit -m "feat(session): unify workspace and teacher profile settings"
```

Only A3 implementation files belong in this commit; preserve unrelated worktree changes.
