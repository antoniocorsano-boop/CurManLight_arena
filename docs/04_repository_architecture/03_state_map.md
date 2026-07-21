# 03 — State Map: All State, Where It Lives, Data Flow

> Catalogues every piece of state in the application: Zustand store (persisted), React useState (ephemeral), localStorage (manual persistence), IndexedDB (Dexie), and the mutable ref.

---

## 1. State Storage Tiers

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1: Zustand Store (IndexedDB via Dexie)            │
│  — Survives page reload, tab close, device restart      │
│  — 14 fields + 18 actions                               │
│  — Key: curmanlight-react-db-state-v1.4.0               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  TIER 2: localStorage (manual writes via useEffect)     │
│  — Classroom state (6 useEffects)                       │
│  — Emergency backup (beforeunload/visibilitychange)     │
│  — Custom curriculum (curmanlight-custom-curriculum-v2) │
│  — Glossary, onboarding completion                      │
│  — Key prefixes: curman_, curmanlight-                  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  TIER 3: React useState (lost on reload)                │
│  — 168 hooks in App.tsx                                 │
│  — All UI state, forms, graphs, copilot, voice          │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  TIER 4: Mutable Ref (safety net for closures)          │
│  — stateRef.current — mirror of critical store fields   │
│  — Updated by useEffect on 11 dependencies              │
│  — Read by interval callbacks and event handlers        │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Zustand Store Fields → Domain Mapping

| Field | Primary Domain | Secondary Domains |
|-------|---------------|-------------------|
| `role` | Onboarding | Store (all) |
| `discipline` | Curriculum | Documents, Copilot, Classroom, AI Gen |
| `order` | Curriculum | Documents, Classroom, AI Gen |
| `schoolYear` | Store | Workspace (backup) |
| `decisions` | Curriculum | Documents (export) |
| `customTexts` | Curriculum | Documents (export) |
| `savedUda` | UDA Library | Social, Classroom, Progettazione, Documents |
| `activeRevisionFilter` | Curriculum | — |
| `selectedTraguardi` | Curriculum | Documents (export) |
| `selectedObiettivi` | Curriculum | Documents (export) |
| `selectedEvidenze` | Curriculum | Documents (export) |
| `activeProgTab` | Planning | — |
| `activeCurricoloView` | Curriculum | — |
| `activeProcessoTab` | Planning | — |
| `activeGeneralSubtab` | Documents | — |

---

## 3. useState Hooks → Domain → Proposed Store/Context Mapping

### Tier 1 candidates (→ Zustand slices)
These state values should become Zustand slices because they're shared across domains or survive navigation:

| State | Current | Proposed Store | Reason |
|-------|---------|---------------|--------|
| `copilotMessages` | useState | `useCopilotStore.messages` | Persist across tab switches |
| `copilotContext` | useState | `useCopilotStore.context` | Needed by multiple copilot features |
| `sharedUdaBoard` | useState | `useSocialStore.board` | Social data should persist |
| `udaAnnotations` | useState | `useSocialStore.annotations` | Social data |
| `udaLikes` | useState | `useSocialStore.likes` | Social data |
| `udaOutcomeStats` | useState | `useSocialStore.outcomes` | Social data |
| `customKbDocs` | useState | `useKnowledgeStore.customDocs` | KB data should persist |
| `glossaryTerms` | useState | `useKnowledgeStore.glossary` | KB data should persist |
| `ollamaConnected` | useState | `useAIStore.ollamaConnected` | Device capability |
| `ollamaModel` | useState | `useAIStore.ollamaModel` | Device capability |
| `classroomStudentFeedback` | useState | `useClassroomStore.feedback` | Classroom data should persist |
| `cooperativeGroups` | useState | `useClassroomStore.groups` | Already persisted via useEffect |
| `shuffledStudentMap` | useState | `useClassroomStore.studentMap` | Already persisted via useEffect |
| `exclusionsList` | useState | `useClassroomStore.exclusions` | Already persisted via useEffect |
| `workspaceAccessToken` | useState | `useWorkspaceStore.accessToken` | Auth token |
| `workspaceRefreshToken` | useState | `useWorkspaceStore.refreshToken` | Auth token |
| `workspaceUserInfo` | useState | `useWorkspaceStore.userInfo` | Auth data |
| `workspaceFolderId` | useState | `useWorkspaceStore.folderId` | Sync config |

### Tier 2 candidates (→ React Context or local state)
These are UI-local state that should stay as useState but move to feature components:

| State | Proposed Location | Reason |
|-------|------------------|--------|
| `progettazioneStep/Title/Competenze/...` | `ProgettazioneWizard` local state | Wizard-local form |
| `documentType/Format/Template/...` | `DocumentConfig` local state | Config-local form |
| `graphNodes`, `draggedNode`, `graphZoom/...` | `ArchitectureGraph` local state | Graph-local interaction |
| `didacticNodes`, etc. | `DidacticGraph` local state | Graph-local interaction |
| `tepBannerDismissed`, `tepSimplifyActive`, `tepWizardMode` | `TEPProvider` context | Accessibility-local |
| `onboardingStep/Role/Order/...` | `OnboardingModal` local state | Modal-local wizard |
| `showEmergencyBanner`, `storageUsage`, etc. | `SessionProvider` context | Session-local |
| `comparisonItems`, `reviewComments`, etc. | `ComparisonView` local state | Feature-local |
| `brainSearchQuery`, `brainTags`, etc. | `SecondBrain` local state | Feature-local |
| `agidAuditResult`, `accessibilityDeclaration` | `AgidAudit` local state | Feature-local |
| `simulationIntervals/Speed/Running/...` | `SimulationProvider` context | Feature-local |

### Tier 3 (→ remove or simplify)
| State | Proposed Action | Reason |
|-------|----------------|--------|
| `libFilterDiscipline/Level/Year/Search` | Merge into single `libFilters` object | Reduce 6 hooks → 1 |
| `libSortBy`, `libViewMode` | Merge into `libFilters` | Same feature |
| `copilotLoading` | Derive from `copilotMessages` | Boolean flag can be derived |
| `copilotVoiceEnabled`, `copilotLanguage`, `copilotTheme` | Merge into `copilotSettings` | 3 hooks → 1 |
| `quotaWarningShown`, `storagePruned` | Remove (use refs) | Don't need re-renders |
| `devMode`, `debugPanel`, `mockDataInjected` | Remove in production | Debug-only |

---

## 4. localStorage Keys Map

| Key | Written By | Read By | Domain |
|-----|-----------|---------|--------|
| `curmanlight-custom-curriculum-v2` | `handleSaveGeneratedToKB`, `handleResetCurriculumToBaseline` | `getCurriculumKB()` in store | Curriculum |
| `curmanlight-classroom-theme` | useEffect line 734 | App mount | Classroom |
| `curmanlight-classroom-layout` | useEffect line 734 | App mount | Classroom |
| `curmanlight-classroom-method` | useEffect line 734 | App mount | Classroom |
| `curmanlight-student-map` | useEffect line 741 | App mount | Classroom |
| `curmanlight-exclusions` | useEffect line 749 | App mount | Classroom |
| `curmanlight-cooperative-groups` | useEffect line 753 | App mount | Classroom |
| `curmanlight-student-feedback` | useEffect line 686 | App mount | Classroom |
| `curmanlight-emergency-backup` | handleBeforeUnload, handleVisibilityChange | handleRestoreFromLocalEmergencyStorage | Session |
| `curmanlight-onboarding-done` | saveOnboardingProfile | useEffect line 2006 (init) | Onboarding |
| `curmanlight-glossary` | handleGlossaryAgentPopulate | App mount | Second Brain |
| `curmanlight-tep-dismissed` | handleTepSwitchToWizard, handleTepSimplifyGrid | useEffect line 1429 | TEP |
| `curmanlight-workspace-token` | handleWorkspaceLogin | useEffect line 558 (cleanup) | Workspace |

---

## 5. Data Flow Diagrams

### Flow 1: Progettazione → UDA Library → Social Board
```
User fills form (7 useState)
  → handleGenerateUda
  → addUda(uda) on Zustand store
  → savedUda[] updates
  → UDA Library re-renders (reads savedUda)
  → User clicks "Share"
  → handleShareUdaToSocial
  → sharedUdaBoard[] updates (useState)
  → Social Board re-renders
```

### Flow 2: Curriculum Edit → Document Export
```
User edits curriculum (localCurriculum useState)
  → handleSaveGeneratedToKB
  → localStorage write (curmanlight-custom-curriculum-v2)
  → User switches to Documents tab
  → handleDownloadWordDefinitivo
  → reads localCurriculum, discipline, order
  → generates Word document
  → triggers download
```

### Flow 3: Classroom Feedback → Social Outcome
```
Student submits feedback (classroomStudentFeedback useState)
  → useEffect line 686 fires
  → writes to localStorage
  → syncs weighted percentages to udaOutcomeStats (useState)
  → Social Board outcome stats update
```

### Flow 4: Google Workspace Full Sync
```
User clicks "Sync to Drive"
  → handleWorkspaceSync
  → reads all state via stateRef.current
  → packages as JSON
  → Google Drive REST API upload
  → workspaceLastSyncTime updates
  → toast "Sync complete"
  
Remote pull:
  → handleWorkspaceAutoPull
  → Google Drive REST API download
  → parses JSON
  → restoreBackupState(newState) on Zustand store
  → all store fields update
  → page effectively re-renders with remote state
```

### Flow 5: Voice TTS Pipeline
```
User clicks "Speak" on copilot message
  → handleSpeakController
  → speechSynthesis.speak(utterance)
  → isSpeaking = true, currentSpeakingBlock = id
  → utterance.onend → isSpeaking = false
  
Tab switch:
  → useEffect line 2154 fires
  → speechSynthesis.cancel()
  → isSpeaking = false, currentSpeakingBlock = null
```
