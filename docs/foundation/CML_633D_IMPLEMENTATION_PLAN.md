# CML-633D Institutional Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add one local canonical institutional archive and remove presumed institutional identity from active product surfaces.

**Architecture:** `src/domain/institution/` owns contracts, validation, repository, selectors, serialization and legacy detection. One versioned archive aggregate is persisted atomically as a property of the existing IndexedDB-backed Zustand state record, without a Dexie schema change. Active consumers receive derived neutral or configured values and never reconstruct identity.

**Tech Stack:** React 18, TypeScript, Zustand, Dexie/IndexedDB existing state store, Vitest, Testing Library, Vite, Storybook.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/domain/institution/types.ts` | Entities, archive, statuses, completeness and backup contracts |
| `src/domain/institution/vocabularies.ts` | Institution/site/role vocabularies and state transitions |
| `src/domain/institution/constructors.ts` | Empty archive and canonical entity constructors |
| `src/domain/institution/validators.ts` | Structural validity, completeness and archive integrity |
| `src/domain/institution/repository.ts` | Immutable archive operations and active-reference invariants |
| `src/domain/institution/serialization.ts` | Schema envelope, preview, import and rollback payloads |
| `src/domain/institution/legacyAdapters.ts` | Legacy candidates and conflict warnings without activation |
| `src/domain/institution/selectors.ts` | Neutral identity, active context, orders, header and warnings |
| `src/domain/institution/index.ts` | Public institutional API |
| `src/store/useCurriculumStore.ts` | Existing atomic persistence boundary for the archive |
| `src/features/session/components/InstitutionConfigPanel.tsx` | Minimal accessible editor |
| A04/A07/active consumer files | Consume selectors; remove prior identity literals |
| `src/__tests__/institution-domain.test.ts` | Domain and repository coverage |
| `src/__tests__/institution-integration.test.tsx` | Store, editor, A04 and A07 contracts |
| `src/__tests__/institution-hardcodes.test.ts` | Production-source regression scan |

### Task 1: Canonical Contracts and Constructors

**Files:**
- Create: `src/domain/institution/types.ts`
- Create: `src/domain/institution/vocabularies.ts`
- Create: `src/domain/institution/constructors.ts`
- Test: `src/__tests__/institution-domain.test.ts`

- [ ] Write failing tests proving an empty archive has no active institute, a draft can contain only name and order, sites support optional address data, and academic years are not auto-created.
- [ ] Run `npx vitest run src/__tests__/institution-domain.test.ts` and verify missing-module failures.
- [ ] Define `Institute`, `AcademicYear`, `InstituteSite`, `InstitutionalDocumentProfile`, `InstitutionalContext`, `InstitutionalArchive`, status unions and `InstitutionCompleteness`, reusing identity types and CML-633C `SchoolOrder` values.
- [ ] Implement `createEmptyInstitutionalArchive`, `createInstituteDraft`, `createInstituteSite`, `createAcademicYear`, `createInstitutionalContext` and neutral document profile construction.
- [ ] Run the targeted test and `npx tsc --noEmit`; both must pass.

### Task 2: Validation, Completeness and Transitions

**Files:**
- Create: `src/domain/institution/validators.ts`
- Modify: `src/domain/institution/vocabularies.ts`
- Test: `src/__tests__/institution-domain.test.ts`

- [ ] Add failing tests for invalid IDs/references, optional mechanical code, date order, year-label/date coherence, duplicate orders/sites, invalid logo media/size, and prudent status transitions.
- [ ] Add failing tests proving `complete-local` does not imply verified authority and distinguishing `unconfigured`, `minimal`, `partial`, `legacy` and `invalid`.
- [ ] Run the targeted suite and confirm failures name the absent validator behavior.
- [ ] Implement pure validators and `canTransitionInstituteStatus`; allow `unconfigured -> draft`, `draft -> confirmed-local`, `confirmed-local -> incomplete`, `legacy-imported -> draft`, and archive transitions only.
- [ ] Run targeted tests and TypeScript to green.

### Task 3: Repository and Active-Year Integrity

**Files:**
- Create: `src/domain/institution/repository.ts`
- Test: `src/__tests__/institution-domain.test.ts`

- [ ] Add failing tests for create/update/read/archive, one active institute, one active year per institute, explicit local confirmation, safe archived records and unchanged prior artifact references.
- [ ] Add failing tests proving legacy candidates are neither confirmed nor active.
- [ ] Implement immutable aggregate operations returning new snapshots and structured errors without deleting records irreversibly.
- [ ] Implement `validateArchiveIntegrity` for institute/year/site/context references and overlapping active years.
- [ ] Run targeted tests and TypeScript to green.

### Task 4: Serialization, Backup, Import Preview and Rollback

**Files:**
- Create: `src/domain/institution/serialization.ts`
- Modify: `src/domain/institution/index.ts`
- Test: `src/__tests__/institution-domain.test.ts`

- [ ] Add failing round-trip tests preserving IDs, metadata, archived configurations, context and active references.
- [ ] Add failing tests for malformed JSON, unsupported future schema, duplicate-ID conflicts, preview without mutation, explicit apply and rollback to the prior snapshot.
- [ ] Implement a JSON-only envelope `{ schemaVersion, exportedAt, archive }`; reject executable/non-data values and future schemas before returning applyable data.
- [ ] Implement import preview with additions/updates/conflicts and an apply result containing the prior archive for rollback.
- [ ] Run targeted tests and TypeScript to green.

### Task 5: Legacy Adapter and Pure Selectors

**Files:**
- Create: `src/domain/institution/legacyAdapters.ts`
- Create: `src/domain/institution/selectors.ts`
- Create: `src/domain/institution/index.ts`
- Test: `src/__tests__/institution-domain.test.ts`

- [ ] Add failing tests for discordant historical addresses, `legacy-imported` status, missing-field warnings and no active selection.
- [ ] Add failing tests for neutral identity, active institute/year, configured orders only, principal site, document heading, completeness and declared-role copy.
- [ ] Implement detection that emits separate candidates when legacy values conflict and never merges or activates them.
- [ ] Implement selectors returning `Istituto non configurato`, no code/signature/site, and an incomplete-export warning when no valid active configuration exists.
- [ ] Run targeted tests and TypeScript to green.

### Task 6: Persist Archive in Existing State Record

**Files:**
- Modify: `src/store/useCurriculumStore.ts`
- Modify: `src/features/documents/hooks/useBackupHandlers.ts`
- Modify: `src/features/workspace/hooks/useSessionAutoSave.ts`
- Test: `src/__tests__/institution-integration.test.tsx`
- Test: `src/__tests__/curriculum-persistence/schema.test.ts`

- [ ] Add failing tests proving old persisted state hydrates an empty archive, archive writes use the existing store, backup round-trip includes the archive, and invalid import leaves the current archive unchanged.
- [ ] Add a schema assertion that database version remains `2` and no institutional object store exists.
- [ ] Add `institutionalArchive` and one atomic `replaceInstitutionalArchive` action to the active store; do not add a parallel persisted store.
- [ ] Include the archive in emergency backup and validate optional archive data in downloadable restore.
- [ ] Run integration, schema and TypeScript tests to green.

### Task 7: Minimal Accessible Configuration Surface

**Files:**
- Create: `src/features/session/components/InstitutionConfigPanel.tsx`
- Modify: the existing profile/settings composition selected after reading current modal contracts
- Modify: `src/App.tsx`
- Test: `src/__tests__/institution-integration.test.tsx`

- [ ] Add failing interaction tests for neutral state, explicit labels/errors, keyboard save, draft persistence, local confirmation, year selection, declared role wording and backup export.
- [ ] Implement the smallest editor within the existing profile/settings surface; do not change routes, shell or navigation.
- [ ] Ensure destructive archive actions require an explicit confirmation and no personal field is mandatory.
- [ ] Run interaction tests, accessibility-relevant assertions and TypeScript to green.

### Task 8: A04 Read Integration

**Files:**
- Modify: `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts`
- Modify: `src/features/progettazione/components/CertificazioneTab.tsx`
- Modify only required prop-contract composition files
- Test: `src/__tests__/institution-integration.test.tsx`

- [ ] Add failing tests proving A04 derives order/year/institute from context when configured and shows neutral identity when unconfigured.
- [ ] Add a regression assertion that existing UDA records are not rewritten when context changes.
- [ ] Inject the derived institutional context into A04 and remove school-name/code literals from active output.
- [ ] Run A04 interaction tests and TypeScript to green.

### Task 9: A07 Header and Export Integration

**Files:**
- Modify: `src/features/documents/hooks/useDocumentExportHandlers.ts`
- Modify: `src/features/documents/hooks/useUdaPackageHandlers.ts`
- Modify: `src/features/documents/hooks/useTemplateEngine.ts`
- Modify: `src/features/documents/components/EsportazioniTab.tsx`
- Modify: `src/features/session/components/SessionModals.tsx`
- Test: `src/__tests__/institution-integration.test.tsx`

- [ ] Add failing tests for neutral headers, missing-configuration warnings, configured headers, absent presumed signatures and no official-document wording.
- [ ] Inject one `InstitutionalDocumentProfile` selector output into all A07 generators and previews.
- [ ] Replace hardcoded SCORM recipient/organization values with neutral or configured local values; preserve content payloads.
- [ ] Ensure export warnings do not block personal/demo use but prevent a presumed institutional presentation.
- [ ] Run A07 tests and TypeScript to green.

### Task 10: Remove Remaining Active Institutional Assumptions

**Files:**
- Modify: active classroom, workspace, WikiLLM, Copilot, dashboard, process and profile/header files identified in the migration register
- Test: `src/__tests__/institution-hardcodes.test.ts`

- [ ] Write a failing source-scan test covering active production paths and the prior school name, code, address, named principal, institutional email domain and static institutional year.
- [ ] Replace active assumptions with selector values, neutral product copy, or explicitly labelled demonstration copy.
- [ ] Preserve `src/data/volumesKB.ts`, `second-brain/`, historical docs, test fixtures and normative transition test dates unchanged.
- [ ] Run the hardcode scan and all affected component/hook tests to green.

### Task 11: Documentation and Full Verification

**Files:**
- Update: `docs/foundation/CML_633D_INSTITUTIONAL_CONFIGURATION_IMPLEMENTATION.md`
- Create: `docs/foundation/CML_633D_INSTITUTIONAL_CONFIGURATION_SCHEMA.md`
- Create: `docs/foundation/CML_633D_HARDCODED_IDENTITY_MIGRATION_REGISTER.md`
- Create: `docs/foundation/CML_633D_LOCAL_CONTEXT_AND_ROLE_POLICY.md`
- Create: `docs/foundation/CML_633D_BACKUP_IMPORT_COMPATIBILITY.md`

- [ ] Record every searched identity occurrence, classification, action and final status.
- [ ] Document the authoritative archive, active selection, optional fields, legacy confirmation requirements, migrated surfaces and residual generators.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run relevant institutional, curriculum barrel, CML-630E and CML-631 suites.
- [ ] Run `npm test`, `npm run build`, `npm run build-storybook`, and `git diff --check`.
- [ ] Verify `package.json`/lockfiles, curriculum content, governance and Dexie schema are unchanged.
- [ ] Stage only CML-633D files and create `feat(CML-633D): add canonical institutional configuration`.
