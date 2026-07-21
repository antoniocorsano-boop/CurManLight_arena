# 05 — Target Structure: Proposed Domain-Based Directory/File Layout

> Restructures the codebase from `src/utils/`, `src/components/`, `src/store/` (code-organized) to domain-based folders where each feature owns its components, hooks, store, types, utils, and tests.

---

## 1. Current Structure (Code-Organized)

```
src/
├── App.tsx                    (12,525 lines — THE PROBLEM)
├── main.tsx                   (ErrorBoundary wrapper)
├── types/
│   └── curriculum.ts          (all types in one file)
├── store/
│   └── useCurriculumStore.ts  (single Zustand store)
├── data/
│   └── curriculumKB.ts        (static data)
├── utils/
│   ├── clipboard.ts
│   ├── escapeHtml.ts
│   ├── semanticSearch.ts
│   ├── storage.ts
│   └── wikiLLM.ts
├── index.css
└── vite-env.d.ts
```

**Problems**: All logic in App.tsx. No component extraction. No feature boundaries. Impossible to test individual features.

---

## 2. Target Structure (Domain-Organized)

```
src/
├── main.tsx                           ← Entry point (ErrorBoundary + Router)
├── App.tsx                            ← Layout shell only (~500 lines)
├── index.css
├── vite-env.d.ts
│
├── types/
│   ├── curriculum.ts                  ← Keep (shared domain types)
│   ├── classroom.ts                   ← NEW: Classroom-specific types
│   ├── workspace.ts                   ← NEW: Workspace sync types
│   ├── social.ts                      ← NEW: Social platform types
│   └── ai.ts                          ← NEW: AI/Copilot types
│
├── stores/
│   ├── useCurriculumStore.ts          ← Refactored (slimmed)
│   ├── useClassroomStore.ts           ← NEW: Classroom state
│   ├── useCopilotStore.ts             ← NEW: AI Copilot state
│   ├── useWorkspaceStore.ts           ← NEW: Google Workspace state
│   ├── useSocialStore.ts              ← NEW: UDA Social state
│   ├── useKnowledgeStore.ts           ← NEW: Second Brain state
│   ├── useNavigationStore.ts          ← NEW: Tab/subtab routing
│   └── useSessionStore.ts             ← NEW: Session/health state
│
├── hooks/
│   ├── useAutoSave.ts                 ← Extracted from useEffect lines 800, 777
│   ├── useSpeech.ts                   ← Extracted from handleToggleSpeech/SpeakController
│   ├── useVoiceTyping.ts              ← Extracted from handleToggleVoiceTyping
│   ├── useStorageMaintenance.ts       ← Extracted from useEffect lines 1988, 1995
│   ├── useOAuth.ts                    ← Extracted from useEffect line 558, 2006
│   ├── useTEP.ts                      ← Extracted from TEP state + handlers
│   ├── useGraphDrag.ts                ← Extracted from graph drag handlers (shared)
│   └── useSimulations.ts              ← Extracted from simulation interval management
│
├── lib/
│   ├── escapeHtml.ts                  ← Keep
│   ├── clipboard.ts                   ← Keep
│   ├── storage.ts                     ← Keep
│   ├── wikiLLM.ts                     ← Keep
│   ├── semanticSearch.ts              ← Keep
│   ├── documentGenerator.ts           ← NEW: All document generation logic
│   ├── csvParser.ts                   ← NEW: CSV import logic
│   ├── scormGenerator.ts              ← NEW: SCORM manifest generation
│   ├── ollamaClient.ts                ← NEW: Ollama API client
│   ├── googleDrive.ts                 ← NEW: Google Drive REST API wrapper
│   └── gdprFilter.ts                  ← NEW: GDPR content filtering
│
├── features/
│   ├── navigation/                    ← Tab routing + sidebar
│   │   ├── components/
│   │   │   ├── AppShell.tsx           ← Layout: sidebar + main area
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── MobileSidebar.tsx
│   │   └── index.ts
│   │
│   ├── curriculum/                    ← Curriculum management
│   │   ├── components/
│   │   │   ├── CurriculumTab.tsx      ← Main tab container
│   │   │   ├── DisciplineAccordion.tsx
│   │   │   ├── TraguardoList.tsx
│   │   │   ├── ObiettivoList.tsx
│   │   │   ├── EvidenzaList.tsx
│   │   │   ├── CurriculumTree.tsx
│   │   │   ├── CurriculumFilters.tsx
│   │   │   ├── CurriculumSearch.tsx
│   │   │   └── CurriculumDetailPanel.tsx
│   │   ├── hooks/
│   │   │   └── useCurriculumFilters.ts
│   │   └── index.ts
│   │
│   ├── progettazione/                 ← Progettazione wizard
│   │   ├── components/
│   │   │   ├── ProgettazioneTab.tsx
│   │   │   ├── WizardStep1Title.tsx
│   │   │   ├── WizardStep2Competenze.tsx
│   │   │   ├── WizardStep3Descrizione.tsx
│   │   │   ├── WizardStep4Strumenti.tsx
│   │   │   ├── WizardStep5Verifica.tsx
│   │   │   └── WizardStep6Note.tsx
│   │   ├── hooks/
│   │   │   └── useProgettazioneWizard.ts
│   │   └── index.ts
│   │
│   ├── documents/                     ← Document generation & export
│   │   ├── components/
│   │   │   ├── DocumentsTab.tsx
│   │   │   ├── DocumentConfig.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── ExportModal.tsx
│   │   │   ├── ComparisonView.tsx
│   │   │   ├── ProgrammazioneDoc.tsx
│   │   │   ├── RelazioneDoc.tsx
│   │   │   ├── SpecificoGradoDoc.tsx
│   │   │   └── AgidAudit.tsx
│   │   ├── hooks/
│   │   │   └── useDocumentExport.ts
│   │   └── index.ts
│   │
│   ├── classroom/                     ← Classroom management
│   │   ├── components/
│   │   │   ├── ClassroomTab.tsx
│   │   │   ├── StudentList.tsx
│   │   │   ├── CooperativeGroups.tsx
│   │   │   ├── GroupOptimizer.tsx
│   │   │   ├── StudentFeedback.tsx
│   │   │   ├── SentimentAnalysis.tsx
│   │   │   ├── AttendanceTracker.tsx
│   │   │   ├── BehaviorLog.tsx
│   │   │   ├── TopicAnalysis.tsx
│   │   │   ├── ClassroomLayout.tsx
│   │   │   └── ClassroomNotifications.tsx
│   │   ├── hooks/
│   │   │   ├── useShuffle.ts
│   │   │   ├── useCooperativeGroups.ts
│   │   │   └── useClassroomPersistence.ts
│   │   └── index.ts
│   │
│   ├── copilot/                       ← AI Copilot
│   │   ├── components/
│   │   │   ├── CopilotPanel.tsx
│   │   │   ├── CopilotChat.tsx
│   │   │   ├── CopilotMessage.tsx
│   │   │   ├── CopilotInput.tsx
│   │   │   ├── CopilotSuggestions.tsx
│   │   │   ├── CopilotChips.tsx
│   │   │   ├── CopilotVoiceInput.tsx
│   │   │   └── InlineSuggestion.tsx
│   │   ├── hooks/
│   │   │   ├── useCopilotChat.ts
│   │   │   └── useCopilotSuggestions.ts
│   │   └── index.ts
│   │
│   ├── ai-generation/                 ← AI curriculum generation
│   │   ├── components/
│   │   │   ├── AiGenerationPanel.tsx
│   │   │   ├── GeneratedCurriculum.tsx
│   │   │   └── GeminiSuggestion.tsx
│   │   ├── hooks/
│   │   │   └── useAiGeneration.ts
│   │   └── index.ts
│   │
│   ├── knowledge/                     ← Second Brain
│   │   ├── components/
│   │   │   ├── SecondBrainTab.tsx
│   │   │   ├── KnowledgeSearch.tsx
│   │   │   ├── KnowledgeDoc.tsx
│   │   │   ├── GlossaryModal.tsx
│   │   │   ├── GlossaryFull.tsx
│   │   │   └── CustomKbManager.tsx
│   │   ├── hooks/
│   │   │   └── useKnowledgeBase.ts
│   │   └── index.ts
│   │
│   ├── workspace/                     ← Google Workspace sync
│   │   ├── components/
│   │   │   ├── WorkspaceSyncPanel.tsx
│   │   │   ├── SyncProgress.tsx
│   │   │   └── UserInfo.tsx
│   │   ├── hooks/
│   │   │   └── useWorkspaceSync.ts
│   │   └── index.ts
│   │
│   ├── social/                        ← UDA Social platform
│   │   ├── components/
│   │   │   ├── SocialBoard.tsx
│   │   │   ├── SharedUdaCard.tsx
│   │   │   ├── UdaAnnotations.tsx
│   │   │   ├── UdaLikeButton.tsx
│   │   │   ├── UdaOutcomeStats.tsx
│   │   │   └── ShareUdaModal.tsx
│   │   ├── hooks/
│   │   │   └── useSocialBoard.ts
│   │   └── index.ts
│   │
│   ├── graphs/                        ← Interactive graphs
│   │   ├── components/
│   │   │   ├── ArchitectureGraph.tsx
│   │   │   ├── DidacticGraph.tsx
│   │   │   ├── GraphNode.tsx
│   │   │   ├── GraphEdge.tsx
│   │   │   ├── GraphControls.tsx
│   │   │   └── GraphTooltip.tsx
│   │   ├── hooks/
│   │   │   └── useGraphInteraction.ts
│   │   └── index.ts
│   │
│   ├── voice/                         ← Speech synthesis & recognition
│   │   ├── components/
│   │   │   ├── VoiceControls.tsx
│   │   │   ├── VoiceTypingButton.tsx
│   │   │   └── SpeechBlock.tsx
│   │   ├── hooks/
│   │   │   ├── useSpeechSynthesis.ts
│   │   │   └── useSpeechRecognition.ts
│   │   └── index.ts
│   │
│   ├── onboarding/                    ← Onboarding wizard
│   │   ├── components/
│   │   │   ├── OnboardingModal.tsx
│   │   │   ├── OnboardingStep1Role.tsx
│   │   │   ├── OnboardingStep2Order.tsx
│   │   │   ├── OnboardingStep3Discipline.tsx
│   │   │   ├── OnboardingStep4Classes.tsx
│   │   │   └── OnboardingStep5Sections.tsx
│   │   ├── hooks/
│   │   │   └── useOnboarding.ts
│   │   └── index.ts
│   │
│   ├── settings/                      ← Settings & profile
│   │   ├── components/
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── ProfileModal.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   └── VoiceSettings.tsx
│   │   └── index.ts
│   │
│   ├── tep/                           ← TEP ergonomic assistance
│   │   ├── components/
│   │   │   ├── TepBanner.tsx
│   │   │   └── TepSimplifiedGrid.tsx
│   │   ├── hooks/
│   │   │   └── useTEPDetection.ts
│   │   └── index.ts
│   │
│   ├── session/                       ← Session health & emergency
│   │   ├── components/
│   │   │   ├── EmergencyBanner.tsx
│   │   │   ├── StorageWarning.tsx
│   │   │   └── OfflineIndicator.tsx
│   │   ├── hooks/
│   │   │   ├── useEmergencyBackup.ts
│   │   │   └── useSessionHealth.ts
│   │   └── index.ts
│   │
│   ├── templates/                     ← Suggested UDA templates
│   │   ├── components/
│   │   │   ├── UdaTemplatesModal.tsx
│   │   │   └── TemplateCard.tsx
│   │   ├── data/
│   │   │   └── suggestedUdas.ts
│   │   └── index.ts
│   │
│   └── dev/                           ← Dev/debug tools
│       ├── components/
│       │   ├── DebugPanel.tsx
│       │   └── MockInjector.tsx
│       └── index.ts
│
├── components/
│   ├── ui/                            ← Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Toast.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── Badge.tsx
│   │   ├── Accordion.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Progress.tsx
│   │   ├── Spinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ConfirmDialog.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       └── PageContainer.tsx
│
├── pages/                             ← Route-level components (lazy loaded)
│   ├── CurriculumPage.tsx
│   ├── ClassroomPage.tsx
│   ├── PlanningPage.tsx
│   ├── DocumentsPage.tsx
│   ├── CopilotPage.tsx
│   ├── KnowledgePage.tsx
│   ├── SocialPage.tsx
│   ├── SettingsPage.tsx
│   └── OnboardingPage.tsx
│
├── routes/
│   ├── index.tsx                      ← Route definitions
│   └── guards.tsx                     ← Auth/init guards
│
├── data/
│   └── curriculumKB.ts                ← Keep (static data)
│
└── __tests__/                         ← Test files (mirror structure)
    ├── features/
    │   ├── curriculum/
    │   ├── classroom/
    │   ├── copilot/
    │   ├── documents/
    │   ├── knowledge/
    │   ├── workspace/
    │   └── social/
    ├── components/
    │   └── ui/
    ├── hooks/
    ├── lib/
    └── stores/
```

---

## 3. File Count Estimates

| Directory | Files | Lines (est.) |
|-----------|-------|-------------|
| `src/main.tsx` | 1 | 30 |
| `src/App.tsx` | 1 | 500 |
| `src/types/` | 5 | 300 |
| `src/stores/` | 8 | 600 |
| `src/hooks/` | 8 | 400 |
| `src/lib/` | 11 | 1,500 |
| `src/features/` (all domains) | ~120 | 8,000 |
| `src/components/ui/` | 16 | 1,200 |
| `src/components/layout/` | 2 | 200 |
| `src/pages/` | 9 | 900 |
| `src/routes/` | 2 | 150 |
| `src/data/` | 1 | 500 |
| `src/__tests__/` | ~200 | 6,000 |
| **TOTAL** | **~392** | **~20,280** |

---

## 4. Key Structural Decisions

### 4.1 Features Own Their Everything
Each feature folder contains its own `components/`, `hooks/`, and `index.ts`. No cross-feature imports except through `stores/`, `lib/`, or `components/ui/`.

### 4.2 Shared UI Primitives
`components/ui/` contains only presentational, stateless primitives (Button, Card, Modal, etc.) that any feature can import.

### 4.3 Pages Are Lazy-Loaded
`pages/` contains route-level components wrapped in `React.lazy()` for code splitting.

### 4.4 Stores Are Domain-Specific
Each Zustand store owns exactly one domain. Cross-domain reads happen via hooks that combine multiple stores, not by importing other stores directly.

### 4.5 Lib Is Stateless
`lib/` contains pure functions and API clients with no React dependencies. Easy to test.

### 4.6 Tests Mirror Structure
Test files live in `__tests__/` mirroring the source structure. Each feature has its own test directory.

---

## 5. Import Rules

```
features/* → can import from:
  ✅ features/* (other features — via stores/lib only)
  ✅ stores/*
  ✅ hooks/*
  ✅ lib/*
  ✅ components/ui/*
  ✅ types/*

features/* → cannot import from:
  ❌ other features' internal components directly
  ❌ pages/*
  ❌ routes/*
```

```
pages/* → can import from:
  ✅ features/* (via index.ts barrel exports)
  ✅ stores/*
  ✅ components/layout/*
  ✅ routes/*

pages/* → cannot import from:
  ❌ features' internal hooks/components directly
  ❌ lib/*
```
