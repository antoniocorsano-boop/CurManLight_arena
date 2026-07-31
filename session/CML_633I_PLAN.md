# CML-633I — Guided Teacher Workflow Implementation Plan

## Workflow Map
1. **Definisci il contesto di lavoro** → 2. **Scegli i riferimenti per la progettazione** → 3. **Controlla ciò che stai usando** → 4. **Costruisci la progettazione** → 5. **Verifica la progettazione** → 6. **Prepara il documento** → 7. **Lavoro completato**

## Tasks
1. Create guided-workflow feature directory structure
2. Implement workflow state model (types.ts)
3. Implement workflow orchestrator (workflow.ts)
4. Implement selectors (selectors.ts)
5. Implement React hooks (hooks/)
6. Implement UI components for each step (components/)
7. Create index.ts for exports
8. Create 7 test files covering different aspects
9. Create 6 documentation files
10. Test and verify implementation

## Files
- src/features/guided-workflow/types.ts
- src/features/guided-workflow/workflow.ts
- src/features/guided-workflow/selectors.ts
- src/features/guided-workflow/hooks/useGuidedWorkflow.ts
- src/features/guided-workflow/components/
  - ContextStep.tsx
  - CurriculumSelectionStep.tsx
  - SelectionReviewStep.tsx
  - TeachingDesignStep.tsx
  - DesignReviewStep.tsx
  - DocumentPreparationStep.tsx
  - CompletionStep.tsx
  - WorkflowProgress.tsx
  - index.ts
- src/features/guided-workflow/index.ts
- src/__tests__/guided-workflow-domain.test.ts
- src/__tests__/guided-workflow-navigation.test.tsx
- src/__tests__/guided-workflow-curriculum-selection.test.tsx
- src/__tests__/guided-workflow-design.test.tsx
- src/__tests__/guided-workflow-document.test.tsx
- src/__tests__/guided-workflow-recovery.test.ts
- src/__tests__/guided-workflow-accessibility.test.tsx
- docs/foundation/CML_633I_GUIDED_TEACHER_WORKFLOW_IMPLEMENTATION.md
- docs/foundation/CML_633I_GUIDED_WORKFLOW_STATE_MODEL.md
- docs/foundation/CML_633I_TEACHER_LANGUAGE_AND_LABEL_POLICY.md
- docs/foundation/CML_633I_CROSS_AREA_ORCHESTRATION.md
- docs/foundation/CML_633I_RECOVERY_AND_LEGACY_POLICY.md
- docs/foundation/CML_633I_ACCESSIBILITY_AND_BROWSER_VALIDATION.md

## Test Criteria
- State and navigation: initial state, step progression, back navigation, recovery, reset preservation
- Context: configured/unconfigured institution, personal mode, school year, role
- Selection: current curriculum, proposals, local decisions, legacy, experimental, non-transferable proposals, sources, warnings, duplicates, replacements
- Design: selections available in A04, snapshot preservation, source modification, explicit updates, no retroactive changes, no double-write, legacy UDA readability
- Verification: blocking errors, non-blocking warnings, qualified proposed content, qualified planned content, missing sources
- Document: creation, versioning, reference preservation, source preservation, qualification preservation, neutral identity, HTML/JSON export, no false DOCX/ODT/PDF
- Recovery: resumption after close, unavailable source, existing design, existing document, snapshot preservation
- Accessibility: aria-current, focus on step change, keyboard, named dialogs, announced errors, color-independent state, mobile behavior

## UX Criteria
- One screen, one primary decision per step
- Teacher-oriented language: "Scegli il riferimento curricolare", "Verifica che sia adatto alla progettazione", etc.
- No technical labels (A02, A03, A04, A07, Transfer contract, Archive, Entity reference, etc.) in main interface
- Clear qualification display: "Corrente", "In revisione", "Pianificato localmente", "Legacy", "Sperimentale"
- Progress indicator with current step, completed steps, available steps
- Error messages with concrete next actions
- No blocking consultation if institution not configured
- No automatic deletion of artifacts on reset

## Integration Strategy
- Uses existing domains: curriculum, revision, design, documents, institution
- Reuses existing functions: curriculum consultation (CML-633E/H), revision consultation (CML-633G/H), design curriculum selection, document system (CML-633F/H)
- No data duplication or parallel storage
- Lightweight state in Zustand store (no new Dexie tables)
- Explicit reset preserves domain artifacts
- Recovery preserves snapshots and warns about source changes

## Constraints
- No modifications to main branch
- No pushing, merging, publishing
- No backend introduction
- No authentication introduction
- No Dexie modification
- No frozen governance/roadmap modification
- No curriculum content modification
- No reopening CML-633B-H
- No domain/repository duplication
- No double-write to legacy data
- No CML-631 pilot reactivation
- No generative assistance or remote calls
- Not a questionnaire wizard
- No blocking if institution not configured
- No declaration of local documents as official

## Persistence Strategy
- Lightweight Zustand store (useCurriculumStore extension or separate slice)
- Session persistence via existing storage mechanism (indexedDB/localStorage via zustand middleware)
- Reset clears only workflow progress, not domain artifacts
- Recovery restores step, references, design, document
- Warns if source changed during break