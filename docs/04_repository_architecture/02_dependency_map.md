# 02 — Dependency Map: What Uses What

> Maps handler → state, handler → handler, useEffect → state, and component → store dependencies within App.tsx.

---

## 1. Handler → State Dependencies

Each handler reads and writes specific state. This map shows which handlers touch which useState hooks.

### Curriculum Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleResetCurriculumToBaseline` | `localCurriculum` | `localCurriculum`, toast |
| `handleApplyLibFilters` | `libFilterDiscipline`, `libFilterLevel`, `libFilterYear`, `libFilterSearch` | (filter predicate — no mutation) |
| `handleSortUdaList` | `libSortBy` | (comparator — no mutation) |
| `handleClearLibFilters` | — | `libFilterDiscipline`, `libFilterLevel`, `libFilterYear`, `libFilterSearch`, `libSortBy` |
| `handleCSVUpload` | `localCurriculum` | `localCurriculum`, toast |
| `handleCloneUdaAdaptive` | `savedUda`, `order` | `savedUda`, toast |

### Progettazione Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleBack` | `progettazioneStep` | `progettazioneStep` |
| `handleNext` | `progettazioneStep`, `progettazioneTitle` | `progettazioneStep`, toast |
| `handleGenerateUda` | `progettazioneTitle`, `progettazioneCompetenze`, `progettazioneDescrizione`, `progettazioneStrumenti`, `progettazioneVerifica`, `progettazioneNote`, `discipline`, `order` | `savedUda`, toast |

### Document Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleSendTemplateInstruction` | `customHeader`, `customFooter`, `fontSize`, `marginStyle`, `includeHeader`, `includeFooter` | `customHeader`, `customFooter`, `fontSize`, `marginStyle`, `includeHeader`, `includeFooter`, toast |
| `handlePrintDocumentPdf` | `documentType`, `documentFormat`, `selectedTemplate` | (opens print window) |
| `handleDownloadCurricoloPDF` | `localCurriculum`, `discipline`, `order` | (opens print window) |
| `handleDownloadWordDefinitivo` | `localCurriculum`, `discipline`, `order` | (triggers download) |
| `handleDownloadWordDocx` | `localCurriculum`, `discipline`, `order` | (triggers download) |
| `handleDownloadODF` | `localCurriculum`, `discipline`, `order` | (triggers download) |
| `handleDownloadRichMarkdown` | `localCurriculum`, `discipline`, `order` | (triggers download) |
| `handleDownloadPdfDirect` | — | (opens print dialog) |
| `handleDownloadWordConfronto` | `comparisonItems` | (triggers download) |
| `handleCopyToClipboardFormatted` | `comparisonItems` | (copies to clipboard) |
| `handleDownloadTxt` | `localCurriculum`, `discipline` | (triggers download) |
| `handleDownloadCml` | `decisions`, `customTexts`, `savedUda`, `discipline`, `order`, `schoolYear` | (triggers download) |
| `handleImportMergeCml` | `decisions`, `customTexts` | `decisions`, `customTexts`, toast |
| `handleDownloadBackup` | (all store state) | (triggers download) |
| `handleRestoreBackup` | — | (restores full state from file) |
| `handleGenerateProgrammazioneAnnualeDoc` | `discipline`, `localCurriculum`, `order` | (generates text) |
| `handleGenerateRelazioneDoc` | `discipline`, `order` | (generates text) |
| `handleGenerateSpecificoGradoDoc` | `discipline`, `order` | (generates text) |
| `handleRunAgidAuditLocal` | — | `agidAuditResult` |
| `handleGenerateDichiarazioneAccessibilita` | — | `accessibilityDeclaration` |
| `handleDownloadScormManifest` | `savedUda` | (triggers download) |
| `handleLoadSuggestedUda` | — | `progettazioneTitle`, `progettazioneCompetenze`, `progettazioneDescrizione`, `progettazioneStrumenti`, `progettazioneVerifica`, `progettazioneNote` |

### AI Copilot Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleSendCopilotMessage` | `copilotMessages`, `copilotContext`, `activeTab`, `discipline` | `copilotMessages`, `copilotLoading` |
| `handleSelectCopilotChip` | — | (delegates to handleSendCopilotMessage) |
| `handleTriggerGemSuggestion` | `activeGemField` | `gemSuggestionLoading`, `gemSuggestionText`, `activeGemField` |
| `handleAcceptGemSuggestion` | `gemSuggestionText`, `activeGemField` | `progettazioneTitle`/`progettazioneCompetenze`/etc., `gemSuggestionText`, `activeGemField` |
| `handleGenerateInlineRealTaskSuggestion` | `discipline`, `order` | `inlineSuggestionLoading`, toast |
| `handleGenerateInlineInclusionSuggestion` | `discipline` | `inlineSuggestionLoading`, toast |
| `handleAiGenerateCurriculum` | `discipline`, `order` | `aiGenerationLoading`, `aiGeneratedCurriculum`, toast |
| `handleSaveGeneratedToKB` | `aiGeneratedCurriculum`, `localCurriculum` | `localCurriculum`, toast |

### Voice Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleToggleSpeech` | `isSpeaking`, `currentSpeakingBlock` | `isSpeaking`, `currentSpeakingBlock` |
| `handleSpeakController` | `copilotMessages`, `selectedVoice`, `voiceRate` | `isSpeaking`, `currentSpeakingBlock` |
| `handleToggleVoiceTyping` | `voiceTypingActive` | `voiceTypingActive`, `voiceTypingTranscript` |

### Classroom Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleShufflePseudonyms` | `shuffledStudentMap`, `exclusionsList` | `shuffledStudentMap`, toast |
| `handleGenerateCooperativeGroups` | `shuffledStudentMap`, `exclusionsList`, `activeCooperativeMethod` | `cooperativeGroups`, toast |
| `handleAnalyzeClassroomTopic` | `discipline`, `savedUda`, `localCurriculum` | toast, (propose UDA) |
| `handleApproveAndInjectUda` | (proposed UDA from topic analysis) | `savedUda`, toast |

### Workspace Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleWorkspaceLogin` | — | `workspaceAccessToken`, `workspaceUserInfo`, toast |
| `handleWorkspaceSync` | `workspaceAccessToken`, (all state) | `workspaceLastSyncTime`, `workspaceSyncProgress`, toast |
| `handleLocalDriveSync` | (all state) | toast |
| `handleWorkspaceLogout` | — | `workspaceAccessToken`, `workspaceRefreshToken`, `workspaceUserInfo` |
| `handleWorkspaceAutoPull` | `workspaceAccessToken` | toast, (restore state) |

### Social Platform Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleShareUdaToSocial` | `savedUda` | `sharedUdaBoard`, toast |
| `handleReuseUda` | `sharedUdaBoard` | `savedUda`, toast |
| `handleLikeUda` | `udaLikes` | `udaLikes` |
| `handleAddAnnotation` | `udaAnnotations` | `udaAnnotations`, toast |
| `handleSaveOutcomes` | `udaOutcomeStats` | `udaOutcomeStats`, toast |

### Graph Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleGraphMouseDown/Move/Up` | `graphNodes`, `draggedNode` | `graphNodes`, `draggedNode` |
| `handleDidacticMouseDown/Move/Up` | `didacticNodes`, `didacticDraggedNode` | `didacticNodes`, `didacticDraggedNode` |

### Session / Init Domain
| Handler | Reads | Writes |
|---------|-------|--------|
| `handleVisibilityChange` | (ref) | (saves to localStorage) |
| `handleBeforeUnload` | (ref) | (saves to localStorage) |
| `handleClearLocalStorageWithReset` | — | (clears all + reload) |
| `handleRestoreFromLocalEmergencyStorage` | — | (restores state from localStorage) |
| `handleDocumentClick` | `tepBannerDismissed` | (tracks clicks → shows TEP) |
| `handleTepSwitchToWizard` | — | `tepWizardMode`, `tepBannerDismissed` |
| `handleTepSimplifyGrid` | — | `tepSimplifyActive`, `tepBannerDismissed` |
| `handleInjectMock` | — | (sets mock data across multiple hooks) |
| `handleTestOllamaConnection` | — | `ollamaConnected`, `ollamaStatus` |

---

## 2. useEffect → State Dependencies

| useEffect (line) | Dependencies | Effects On |
|-------------------|-------------|-----------|
| 558 `[]` | mount | Reads `workspaceAccessToken` → clears if expired |
| 686 | `classroomStudentFeedback`, `activeTaughtUdaId` | Writes to localStorage, syncs to `udaOutcomeStats` |
| 734 | `activeClassTheme`, `classroomLayout`, `activeCooperativeMethod` | Writes to localStorage |
| 741 | `shuffledStudentMap` | Writes/removes from localStorage |
| 749 | `exclusionsList` | Writes to localStorage |
| 753 | `cooperativeGroups` | Writes/removes from localStorage |
| 777 | `localCurriculum`, `savedUda`, `decisions`, `customTexts`, `schoolYear`, `role`, `discipline`, `order`, `isWorkspaceLoggedIn`, `workspaceAccessToken`, `isWorkspaceSyncLocked` | Updates mutable ref |
| 795 `[]` | mount | Cleanup: clears simulation intervals |
| 800 `[]` | mount | Registers `beforeunload` + `visibilitychange` listeners |
| 1429 | `tepBannerDismissed` | Registers `click` listener on document |
| 1988 `[]` | mount | Listens for `STORAGE_QUOTA_EVENT` custom event |
| 1995 `[]` | mount | Prunes stale storage, shows toast if > 4MB |
| 2006 `[]` | mount | Full startup init sequence |
| 2136 | `discipline` | Resets `openAccordions` |
| 2141 | `activeTab`, `secondBrainTab`, `activeGeneralSubtab`, `activeProgTab`, `activeProcessoTab`, `wikiWorkspaceTab` | Scrolls main content to top |
| 2154 | `selectedBrainDoc`, `activeTab` | Cancels `speechSynthesis` |

---

## 3. Cross-Domain Data Flows

```
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE                            │
│  role · discipline · order · schoolYear                     │
│  decisions · customTexts · savedUda                         │
│  selectedTraguardi · selectedObiettivi · selectedEvidenze   │
│  activeProgTab · activeCurricoloView · activeProcessoTab    │
│  activeGeneralSubtab · activeRevisionFilter                  │
└──────────┬──────────────────────────────────────────────────┘
           │ read/write via useCurriculumStore()
           │
    ┌──────┴──────────────────────────────────────────┐
    │                                                   │
    ▼                                                   ▼
┌──────────────┐                          ┌──────────────────┐
│  CURRICULUM   │◄───── sync ────────────►│  DOCUMENT GEN    │
│  (10 state)   │   localCurriculum       │  (10 state)      │
│  handlers: 4  │   decisions             │  handlers: 14    │
│  effects: 0   │   customTexts           │  effects: 0      │
└──────┬───────┘                          └────────┬─────────┘
       │                                           │
       │ read savedUda                             │ reads localCurriculum
       │                                           │
┌──────┴───────┐                          ┌────────┴─────────┐
│  PROGETTAZIONE │──── addUda ──────────►│  UDA LIBRARY      │
│  (7 state)     │   (to savedUda)       │  (6 state)        │
│  handlers: 3   │                       │  handlers: 3      │
│  effects: 0    │                       │  effects: 0       │
└───────────────┘                       └────────┬─────────┘
                                                 │
                              shareUdaToSocial    │  reuseUda
                                                 ▼
                                       ┌──────────────────┐
                                       │  UDA SOCIAL       │
                                       │  (5 state)        │
                                       │  handlers: 5      │
                                       │  effects: 0       │
                                       └──────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CLASSROOM                                  │
│  (14 state) · handlers: 3 · effects: 5                      │
│  reads: discipline, savedUda, localCurriculum                │
│  writes: localStorage (all classroom state)                  │
│  syncs: student feedback → udaOutcomeStats (social)          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    GOOGLE WORKSPACE                           │
│  (7 state) · handlers: 5 · effects: 0                      │
│  reads: all state (for backup)                               │
│  writes: tokens, sync progress, can restore full state       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    AI COPILOT                                 │
│  (6 state) + inline (6 state) · handlers: 8 · effects: 0   │
│  reads: discipline, order, activeTab, copilotContext         │
│  writes: messages, suggestions, generated curriculum         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    VOICE & ACCESSIBILITY                      │
│  (6 state) · handlers: 3 · effects: 0                      │
│  reads: copilotMessages, selectedVoice, voiceRate            │
│  writes: isSpeaking, currentSpeakingBlock, transcript        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    SECOND BRAIN                               │
│  (5 state) · handlers: 3 · effects: 0                      │
│  reads: customKbDocs                                         │
│  writes: customKbDocs, glossaryTerms                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    SESSION / INIT                              │
│  (5 state) · handlers: 5 · effects: 5                      │
│  reads: tepBannerDismissed, (ref for all state)              │
│  writes: localStorage, session flags, reloads page           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    ONBOARDING                                 │
│  (6 state) · handlers: 5 · effects: 0                      │
│  reads: onboardingStep, onboardingRole, onboardingOrder      │
│  writes: role, discipline, order, sections, classes          │
│  → then calls setRole/setDiscipline/setOrder on store        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    GRAPHS (Architecture + Didactic)           │
│  (16 state) · handlers: 6 · effects: 0                     │
│  reads: graphNodes, didacticNodes, draggedNode               │
│  writes: node positions, drag state, zoom/pan                │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Shared State (Cross-Domain Bridges)

These state values are read by multiple domains, creating coupling:

| State | Domains That Read It | Coupling Risk |
|-------|---------------------|---------------|
| `discipline` | Store, Curriculum, Documents, Copilot, AI Gen, Classroom, Workspace | **HIGH** — every domain change triggers re-renders |
| `order` | Store, Curriculum, Documents, AI Gen, Classroom | **HIGH** |
| `savedUda` | Store, UDA Library, Social, Classroom, Documents, Progettazione | **HIGH** |
| `localCurriculum` | Curriculum, Documents, AI Gen, Classroom | **MEDIUM** |
| `decisions` | Store, Curriculum, Documents, Workspace (backup) | **MEDIUM** |
| `customTexts` | Store, Curriculum, Documents | **LOW** |
| `activeTab` | Navigation, Speech (cancel), Scroll, Copilot context | **MEDIUM** |
| `copilotContext` | Copilot Chat, Inline Suggestions, Voice | **LOW** |
| `workspaceAccessToken` | Workspace, Session (cleanup), Ref sync | **MEDIUM** |
