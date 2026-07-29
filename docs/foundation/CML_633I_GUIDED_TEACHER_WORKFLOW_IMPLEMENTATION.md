# CML-633I — Guided Teacher Workflow Implementation

## Overview

The Guided Teacher Workflow (CML-633I) is a structured, teacher-oriented workflow that guides educators through the process of designing curriculum-based instruction. It integrates existing domains and features without creating new parallel systems.

## Key Principles

1. **One Screen, One Decision**: Each step has a clear purpose and primary action
2. **Teacher-Centered Language**: Uses instructional language ("Scegli il riferimento curricolare", "Verifica che sia adatto alla progettazione")
3. **No Technical Jargon**: Avoids labels like A02, A03, A04, A07, Transfer contract, Archive, etc.
4. **Clear Qualification**: Distinguishes between "Corrente", "In revisione", "Pianificato localmente", "Legacy", "Sperimentale"
5. **Progressive Disclosure**: Only shows relevant information at each step
6. **Explicit Confirmation**: Requires confirmation for critical actions
7. **Error Communication**: Provides clear error messages with concrete next actions

## Workflow Steps

1. **Definisci il contesto di lavoro** (Context)
   - Specify institution, school year, order, role
   - Check if institution is configured
   - Proceed to next step

2. **Scegli i riferimenti per la progettazione** (Curriculum Selection)
   - Select curriculum references from various sources
   - View selected references with details
   - Proceed to next step

3. **Controlla ciò che stai usando** (Selection Review)
   - Review selected references and revisions
   - Add or remove references as needed
   - Proceed to next step

4. **Costruisci la progettazione** (Teaching Design)
   - Build teaching design using selected references
   - Modify selections as needed
   - Proceed to next step

5. **Verifica la progettazione** (Design Review)
   - Check design completeness
   - Validate references and revisions
   - Proceed to next step

6. **Prepara il documento** (Document Preparation)
   - Create document for export
   - Verify references and qualifications
   - Choose document format (HTML, JSON, Print)
   - Proceed to completion

7. **Lavoro completato** (Completion)
    - Review completed work
    - Access created design and document
    - Start new workflow or return to home

## Technical Closure Verification (Step 9 Update)

**Previous verdict:** `CML_633I_PARTIAL`

**Focused tests:** 22/22 PASS across 7 files.

**Full suite:** 1500 passed, 1 failed (ENVIRONMENTAL_FLAKE: `curriculum-persistence/schema.test.ts` timeout under full-suite load; passes in isolation).

**Global TypeScript:** 3 errors remaining — all in `design-transfer-integration.test.tsx` (TS6133 unused imports). Verified against baseline `1ffb4b0`: same 3 errors reproduced on baseline → `PRE_EXISTING_REPRODUCED`.

**CML-633I regression found and corrected:** Yes.
- `src/store/useCurriculumStore.ts` had `setCustomText` action removed during CML-633I, breaking production code (`App.tsx`, `RevisioneTab.tsx`), backup handlers, and tests (`document-continuity`, `institution-integration`).
- Correction restored `setCustomText` action and interface declaration to preserve prior domain semantics.
- Re-run gates: focused tests green, full suite green for guided workflow scope, build green, Storybook green.

**Complete diff check:** No changes to `package.json`, `package-lock.json`, `src/domain/curriculum`, `src/domain/revision`, `src/domain/design`, `src/domain/documents`, `src/domain/transfer`, `src/domain/institution`.

**Final verdict:** `CML_633I_GUIDED_TEACHER_WORKFLOW_COMPLETE`

**Closure commit:** `chore(CML-633I): verify and close guided teacher workflow`

**Constraints honored:**
- Dependencies added: No
- Dexie schema modified: No
- Governance modified: No
- Curriculum content modified: No
- CML-633J files included: No
- Push/merge/publication: not executed