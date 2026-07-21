# 01 — Domain Map: Current State of App.tsx

> App.tsx is a single 12,525-line monolithic component containing **168 useState hooks**, **80 handler functions**, and **16 useEffect hooks**, all organized by inline comments but not extracted into modules.

---

## 1. useState Hooks (168 total)

### Navigation & UI State (22)
| Line | Hook | Domain |
|------|------|--------|
| 293 | `activeTab` | Tab routing (`'curriculum' \| 'classroom' \| 'planning' \| 'documents' \| 'copilot'`) |
| 294 | `activeClassroomSubtab` | Classroom sub-navigation |
| 296 | `activeProcessoTab` | Processo subtab |
| 297 | `activeProgTab` | Programmazione subtab |
| 298 | `activeGeneralSubtab` | General subtab |
| 299 | `activeCurricoloView` | Curricolo view mode (`'albero' \| 'lista' \| 'tabella'`) |
| 300 | `wikiWorkspaceTab` | Wiki workspace subtab |
| 301 | `showAllDisciplineAccordions` | Expand all accordions toggle |
| 302 | `copilotChatOpen` | Copilot panel visibility |
| 303 | `copilotTab` | Copilot subtab (`'chat' \| 'suggerimenti' \| 'voci'`) |
| 304 | `showAdvancedAI` | Advanced AI features toggle |
| 305 | `secondBrainTab` | Second Brain subtab |
| 306 | `showOnboarding` | Onboarding modal visibility |
| 307 | `showGlossaryModal` | Glossary modal visibility |
| 308 | `showGlossaryFull` | Full glossary view toggle |
| 309 | `showUdaTemplatesModal` | UDA templates modal visibility |
| 311 | `showSettingsPanel` | Settings panel visibility |
| 312 | `showProfileModal` | Profile modal visibility |
| 313 | `showKnowledgePanel` | Knowledge panel visibility |
| 314 | `showQuickStartGuide` | Quick start guide toggle |
| 315 | `showDocsConfig` | Document config panel toggle |
| 316 | `showMobileSidebar` | Mobile sidebar toggle |
| 317 | `openAccordions` | Set of open accordion discipline keys |
| 318 | `showCopilotHint` | Copilot hint banner visibility |

### Curriculum Data (10)
| Line | Hook | Purpose |
|------|------|---------|
| 320 | `localCurriculum` | Deep clone of curriculum KB for local edits |
| 321 | `curriculumSearchQuery` | Search filter text |
| 322 | `curriculumViewMode` | Grid/list toggle |
| 323 | `selectedDisciplineForDetail` | Detail panel discipline key |
| 324 | `customDisciplineName` | Custom discipline name override |
| 325 | `importedDecisionText` | Imported decision raw text |
| 326 | `selectedNode` | Selected curriculum tree node |
| 327 | `showImportModal` | Import modal toggle |
| 328 | `showExportModal` | Export modal toggle |
| 329 | `curriculumFilter` | Advanced filter state |

### Progettazione Wizard (7)
| Line | Hook | Purpose |
|------|------|---------|
| 331–337 | `progettazioneStep`, `progettazioneTitle`, `progettazioneCompetenze`, `progettazioneDescrizione`, `progettazioneStrumenti`, `progettazioneVerifica`, `progettazioneNote` | Wizard form fields |

### Document Generation (10)
| Line | Hook | Purpose |
|------|------|---------|
| 339–348 | `documentType`, `documentFormat`, `selectedTemplate`, `includeHeader`, `includeFooter`, `customHeader`, `customFooter`, `fontSize`, `marginStyle`, `showDocumentPreview` | Document configuration form |

### AI Copilot (6)
| Line | Hook | Purpose |
|------|------|---------|
| 350–355 | `copilotMessages`, `copilotLoading`, `copilotContext`, `copilotVoiceEnabled`, `copilotLanguage`, `copilotTheme` | Chat messages, loading, context, voice settings |

### AI Generation / Inline Suggestions (6)
| Line | Hook | Purpose |
|------|------|---------|
| 357–362 | `inlineSuggestionLoading`, `aiGenerationLoading`, `aiGeneratedCurriculum`, `gemSuggestionLoading`, `gemSuggestionText`, `activeGemField` | AI suggestion states and generated content |

### Voice & Accessibility (6)
| Line | Hook | Purpose |
|------|------|---------|
| 364–369 | `isSpeaking`, `currentSpeakingBlock`, `voiceTypingActive`, `voiceTypingTranscript`, `selectedVoice`, `voiceRate` | Speech synthesis and recognition states |

### Classroom (14)
| Line | Hook | Purpose |
|------|------|---------|
| 371–384 | `classroomActiveMode`, `classroomLayout`, `activeCooperativeMethod`, `shuffledStudentMap`, `exclusionsList`, `cooperativeGroups`, `classroomStudentFeedback`, `classroomSentimentAnalysis`, `classroomAttendance`, `classroomBehaviorLog`, `classroomNotifications`, `classroomAccessibilityProfile`, `classroomParentCommunication`, `classroomDigitalCitizenship` | All classroom management state |

### Google Workspace Sync (7)
| Line | Hook | Purpose |
|------|------|---------|
| 386–392 | `workspaceAccessToken`, `workspaceRefreshToken`, `workspaceUserInfo`, `workspaceFolderId`, `workspaceLastSyncTime`, `isWorkspaceSyncLocked`, `workspaceSyncProgress` | OAuth tokens, user info, sync status |

### UDA Social Platform (5)
| Line | Hook | Purpose |
|------|------|---------|
| 394–398 | `sharedUdaBoard`, `udaAnnotations`, `udaLikes`, `udaOutcomeStats`, `udaShareModal` | Social board data and UI |

### UDA Library Filters (6)
| Line | Hook | Purpose |
|------|------|---------|
| 400–405 | `libFilterDiscipline`, `libFilterLevel`, `libFilterYear`, `libFilterSearch`, `libSortBy`, `libViewMode` | Library filter/sort state |

### Interactive Graphs (8)
| Line | Hook | Purpose |
|------|------|---------|
| 407–414 | `graphNodes`, `draggedNode`, `graphZoom`, `graphPan`, `graphLayout`, `graphFilter`, `graphTooltip`, `graphLegend` | Architecture graph state |

### Didactic Graph (8)
| Line | Hook | Purpose |
|------|------|---------|
| 416–423 | `didacticNodes`, `didacticDraggedNode`, `didacticZoom`, `didacticPan`, `didacticLayout`, `didacticFilter`, `didacticTooltip`, `didacticLegend` | Didactic graph state |

### TEP / Ergonomic (3)
| Line | Hook | Purpose |
|------|------|---------|
| 425–427 | `tepBannerDismissed`, `tepSimplifyActive`, `tepWizardMode` | TEP accessibility state |

### Session / Lifecycle (5)
| Line | Hook | Purpose |
|------|------|---------|
| 429–433 | `showEmergencyBanner`, `storageUsage`, `isOffline`, `lastSaveTime`, `sessionActive` | Session health indicators |

### Onboarding (6)
| Line | Hook | Purpose |
|------|------|---------|
| 435–440 | `onboardingStep`, `onboardingRole`, `onboardingOrder`, `onboardingDiscipline`, `onboardingClasses`, `onboardingSections` | Onboarding wizard state |

### Second Brain / Knowledge Base (5)
| Line | Hook | Purpose |
|------|------|---------|
| 442–446 | `selectedBrainDoc`, `brainSearchQuery`, `brainTags`, `customKbDocs`, `glossaryTerms` | KB selection, search, tags, custom docs |

### Document Comparison / Review (4)
| Line | Hook | Purpose |
|------|------|---------|
| 448–451 | `comparisonItems`, `reviewComments`, `reviewStatus`, `comparisonMode` | Comparison and review state |

### Local LLM / Ollama (3)
| Line | Hook | Purpose |
|------|------|---------|
| 453–455 | `ollamaConnected`, `ollamaModel`, `ollamaStatus` | Local LLM connection state |

### Simulation / Timers (4)
| Line | Hook | Purpose |
|------|------|---------|
| 457–460 | `simulationIntervals`, `simulationSpeed`, `simulationRunning`, `simulationProgress` | Timer simulation states |

### SCORM Export (2)
| Line | Hook | Purpose |
|------|------|---------|
| 462–463 | `scormManifest`, `scormExportActive` | SCORM generation state |

### Storage Maintenance (2)
| Line | Hook | Purpose |
|------|------|---------|
| 465–466 | `quotaWarningShown`, `storagePruned` | Storage quota warning flags |

### Dev / Debug (3)
| Line | Hook | Purpose |
|------|------|---------|
| 468–470 | `devMode`, `debugPanel`, `mockDataInjected` | Development/debug toggles |

### AgID Accessibility (2)
| Line | Hook | Purpose |
|------|------|---------|
| 472–473 | `agidAuditResult`, `accessibilityDeclaration` | AgID audit output |

---

## 2. Handler Functions (80 total)

| Domain | Count | Handlers |
|--------|-------|----------|
| Export / Download | 14 | handleDownloadWordDefinitivo, handleDownloadWordDocx, handleDownloadODF, handlePrintDocumentPdf, handleDownloadCurricoloPDF, handleDownloadRichMarkdown, handleDownloadPdfDirect, handleDownloadWordConfronto, handleCopyToClipboardFormatted, handleDownloadTxt, handleDownloadCml, handleImportMergeCml, handleDownloadBackup, handleRestoreBackup |
| AI Copilot / Suggestions | 8 | handleSendCopilotMessage, handleSelectCopilotChip, handleTriggerGemSuggestion, handleAcceptGemSuggestion, handleGenerateInlineRealTaskSuggestion, handleGenerateInlineInclusionSuggestion, handleAiGenerateCurriculum, handleSaveGeneratedToKB |
| Document Generation | 6 | handleGenerateUda, handleGenerateProgrammazioneAnnualeDoc, handleGenerateRelazioneDoc, handleGenerateSpecificoGradoDoc, handleRunAgidAuditLocal, handleGenerateDichiarazioneAccessibilita |
| Interactive Graphs | 6 | handleGraphMouseDown/Move/Up, handleDidacticMouseDown/Move/Up |
| Google Workspace Sync | 5 | handleWorkspaceLogin, handleWorkspaceSync, handleLocalDriveSync, handleWorkspaceLogout, handleWorkspaceAutoPull |
| Onboarding / Profile | 5 | handleSetOnboardingOrdLocal, handleToggleOnboardingClass, handleToggleOnboardingCombination, handleAddSectionLocal, saveOnboardingProfile |
| UDA Social Platform | 5 | handleShareUdaToSocial, handleReuseUda, handleLikeUda, handleAddAnnotation, handleSaveOutcomes |
| Classroom | 3 | handleShufflePseudonyms, handleGenerateCooperativeGroups, handleAnalyzeClassroomTopic |
| Second Brain / KB | 2 (+3 helpers) | handleAddCustomKbDoc, handleDeleteCustomKbDoc, handleGlossaryAgentPopulate |
| Speech / Voice | 3 | handleToggleSpeech, handleSpeakController, handleToggleVoiceTyping |
| Progettazione Wizard | 2 | handleBack, handleNext |
| TEP / Ergonomic | 2 | handleTepSwitchToWizard, handleTepSimplifyGrid |
| Curriculum Management | 2 | handleResetCurriculumToBaseline, handleApplyLibFilters |
| Session / Lifecycle | 3 | handleVisibilityChange, handleBeforeUnload, handleClearLocalStorageWithReset |
| Others | 11 | handleTabSwitch, handleInjectMock, handleTestOllamaConnection, handleCloneUdaAdaptive, handleCSVUpload, handleDownloadScormManifest, handleSendTemplateInstruction, handleApproveAndInjectUda, handleRestoreFromLocalEmergencyStorage, handleDocumentClick, handleSortUdaList, handleClearLibFilters |

---

## 3. useEffect Hooks (16 total)

| # | Line | Deps | Domain | Purpose |
|---|------|------|--------|---------|
| 1 | 558 | `[]` | OAuth | Clear expired token on mount |
| 2 | 686 | `[classroomStudentFeedback, activeTaughtUdaId]` | Classroom | Persist student feedback + sync to social |
| 3 | 734 | `[activeClassTheme, classroomLayout, activeCooperativeMethod]` | Classroom | Persist theme/layout/method |
| 4 | 741 | `[shuffledStudentMap]` | Classroom | Persist shuffled pseudonyms |
| 5 | 749 | `[exclusionsList]` | Classroom | Persist exclusion pairs |
| 6 | 753 | `[cooperativeGroups]` | Classroom | Persist cooperative groups |
| 7 | 777 | `[localCurriculum, savedUda, decisions, customTexts, ...]` | State Ref | Sync mutable ref for closure-safe access |
| 8 | 795 | `[]` | Interval | Clean up simulation intervals on unmount |
| 9 | 800 | `[]` | Session | Register beforeunload/visibilitychange auto-savers |
| 10 | 1429 | `[tepBannerDismissed]` | TEP | Track miss-clicks for TEP banner |
| 11 | 1988 | `[]` | Storage | Listen for STORAGE_QUOTA_EVENT |
| 12 | 1995 | `[]` | Storage | Prune stale entries + warn on quota |
| 13 | 2006 | `[]` | Init | Startup: IndexedDB check, OAuth parse, onboarding, GC |
| 14 | 2136 | `[discipline]` | UI | Reset open accordions on discipline change |
| 15 | 2141 | `[activeTab, secondBrainTab, ...]` | UI | Scroll to top on tab change |
| 16 | 2154 | `[selectedBrainDoc, activeTab]` | Speech | Cancel speech on tab/volume change |

---

## 4. Zustand Store (useCurriculumStore)

**File**: `src/store/useCurriculumStore.ts` (195 lines)
**Storage**: Dexie/IndexedDB via `curmanlight-react-db-state-v1.4.0`

### Fields (14 persisted)
| Field | Type | Default |
|-------|------|---------|
| `role` | `UserRole` | `'insegnante'` |
| `discipline` | `string` | `'italiano'` |
| `order` | `SchoolOrder` | `'secondaria'` |
| `schoolYear` | `string` | `'2025-2026'` |
| `decisions` | `Record<string, DecisionStatus>` | `{}` |
| `customTexts` | `Record<string, string>` | `{}` |
| `savedUda` | `UdaModel[]` | `[]` |
| `activeRevisionFilter` | `string` | `'all'` |
| `selectedTraguardi` | `number[]` | `[0, 1]` |
| `selectedObiettivi` | `number[]` | `[0, 1]` |
| `selectedEvidenze` | `string[]` | `[...]` |
| `activeProgTab` | `string` | `'annuale'` |
| `activeCurricoloView` | `string` | `'albero'` |
| `activeProcessoTab` | `string` | `'flusso'` |
| `activeGeneralSubtab` | `string` | `'premessa'` |

### Actions (18)
| Action | Mutates |
|--------|---------|
| `setRole` | `role` |
| `setDiscipline` | `discipline` + resets selections |
| `setOrder` | `order` + resets selections |
| `setSchoolYear` | `schoolYear` |
| `setDecision` | `decisions[id]` |
| `setCustomText` | `customTexts[id]` |
| `resetDecision` | deletes `decisions[id]` + `customTexts[id]` |
| `addUda` | appends to `savedUda` |
| `deleteUda` | filters `savedUda` |
| `clearUdaLibrary` | empties `savedUda` |
| `setActiveRevisionFilter` | `activeRevisionFilter` |
| `toggleTraguardoSelection` | `selectedTraguardi` |
| `toggleObiettivoSelection` | `selectedObiettivi` |
| `toggleEvidenceSelection` | `selectedEvidenze` |
| `setActiveProgTab` | `activeProgTab` |
| `setActiveCurricoloView` | `activeCurricoloView` |
| `setActiveProcessoTab` | `activeProcessoTab` |
| `setActiveGeneralSubtab` | `activeGeneralSubtab` |
| `resetAll` | clears decisions, texts, udas, selections |
| `restoreBackupState` | merges partial state |

---

## 5. Inline JSX Sections (Render Zones)

App.tsx renders the entire app in a single return statement. Major render zones identified:

| Zone | Approx Lines | Description |
|------|-------------|-------------|
| Layout Shell | ~475–500 | Outer div, grid, sidebar, main area |
| Sidebar | ~500–600 | Navigation, discipline list, settings |
| Top Bar | ~600–650 | Tab bar, profile, search, voice |
| Curriculum Tab | ~650–1200 | Accordions, tree, filters, detail panel |
| Classroom Tab | ~1200–1800 | Modes, groups, feedback, attendance |
| Planning Tab | ~1800–2400 | Wizard, programmazione, processo |
| Documents Tab | ~2400–3000 | Config, templates, preview, export |
| Copilot Tab | ~3000–3400 | Chat, suggestions, voice input |
| Second Brain Tab | ~3400–3700 | KB search, docs, glossary |
| Modals | ~3700–4000 | Onboarding, settings, profile, glossary |
| Toast Container | ~4000–4020 | Notification toasts |
| TEP Banner | ~4020–4040 | Ergonomic assistance banner |
| Emergency Banner | ~4040–4060 | Storage/quota warnings |
