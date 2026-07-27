# CML-632A — System Area Inventory

> Canonical inventory of CurManLight functional areas, views, flows, components, data, and stores.
> Generated from source analysis on commit `c853b36`.

---

## 1. Navigation Architecture

CurManLight uses a **hybrid URL-driven + state-based** routing system:

- **React Router** wraps the app (`BrowserRouter` in `src/main.tsx`).
- **No `<Routes>` are rendered in the tree.** The file `src/routes/index.tsx` defines a `createBrowserRouter` but is **dead/legacy code** — never imported.
- **`pathnameToTab()`** in `src/App.tsx` derives `activeTab` from the URL pathname.
- **`handleTabSwitch()`** calls `navigate()` to update the URL, which re-derives `activeTab`.
- **Conditional rendering** in `AppViewsLayer` shows views based on `activeTab`.
- **Secondary state** (`activeProgTab`, `activeCurricoloView`) drives sub-views within tabs.

### 1.1 Tab-to-URL Mapping

| `AppTab` | URL Path | Notes |
|----------|----------|-------|
| `dashboard` | `/` | Default |
| `curricolo` | `/curriculum` | Sub-views via `activeCurricoloView` |
| `revisione` | `/curriculum` | Same URL, different view |
| `progetta-annuale` | `/planning` | Sub-tabs via `activeProgTab` |
| `processo` | `/planning` | Same URL, different sub-tab |
| `esportazioni` | `/documents` | |
| `certificazione-pa` | `/documents` | Same URL as esportazioni |
| `second-brain` | `/knowledge` | |
| `fonti` | `/settings` | |
| `guida` | `/guida` | |
| `progetta-evidenze` | — | Declared but **unused in UI** |

### 1.2 Sub-View State

**`activeCurricoloView`** (curriculum sub-views):

| Value | View | Notes |
|-------|------|-------|
| `home` | Default landing | Shown when entering curriculum tab |
| `albero` | Structured tree | Curriculum tree browser |
| `mappa` | Diachronic map | Timeline/mapping view |
| `popolamento` | Integration & population | Data integration |
| `pilota` | Experimental pilot | **FROZEN** (CML-631) |

**`activeProgTab`** (planning sub-tabs):

| Value | View | Notes |
|-------|------|-------|
| `home` | Default landing | |
| `annuale` | UDA Wizard | Annual planning compiler |
| `uda` | UDA Archive | Institutional UDA library |
| `certificazione` | Competence Matrix | Skills assessment grid |
| `classe` | Class Environment | Classroom outcomes |
| `classe-home` | Class Home | Class overview |
| `social` | UDA Reuse Observatory | Social/shared UDAs |

---

## 2. Canonical Functional Areas

Areas are grouped by **user purpose**, not by folder structure.

### Area 1: Home & Orientation

| Field | Value |
|-------|-------|
| **Canonical name** | Home & Orientation |
| **Purpose** | Landing page, role-based dashboard, first-run onboarding |
| **Users** | All teachers |
| **Views** | `DashboardView`, `OnboardingModal`, `TourModal` |
| **Entry points** | Default route `/`, sidebar "Home Dashboard" |
| **Stores** | `useSessionStore` (onboarding flag), `useCurriculumStore` (role, discipline) |
| **Data** | Role-specific content, recent activity feed |
| **Actions** | Role selection, tour start, navigation to other areas |
| **Dependencies** | None (root area) |
| **Shared components** | `DashboardView` (session), `OnboardingModal`, `TourModal` |
| **Experimental** | No |
| **Current state** | Active, functional |

### Area 2: Curriculum Consultation

| Field | Value |
|-------|-------|
| **Canonical name** | Curriculum Consultation |
| **Purpose** | Browse, explore, and understand the vertical curriculum structure |
| **Users** | All teachers, department heads |
| **Views** | `CurriculumTab` (tree view, map view, population view, pilot view) |
| **Entry points** | Sidebar "Consulta Curricolo" → sub-items |
| **Stores** | `useCurriculumStore` (decisions, filters, discipline context) |
| **Data** | Curriculum nodes, decisions, discipline metadata, Italian school orders |
| **Actions** | Navigate tree, view map, filter by discipline/year, make/approve/reject decisions |
| **Dependencies** | Area 1 (dashboard navigation), Area 8 (fonti for data sources) |
| **Shared components** | `CurriculumTab`, `RevisioneTab`, `useCurriculumProgressStats`, `useLocalCurriculum` |
| **Experimental** | Contains `curriculum-etwin/` (CML-630C prototype) and `curriculum-functional-pilot/` (**FROZEN** CML-631) |
| **Current state** | Active, core area. Contains frozen experimental sub-modules |

**Sub-views:**

| Sub-view | Component | Purpose |
|----------|-----------|---------|
| `albero` | CurriculumTab (tree mode) | Structured curriculum tree browser |
| `mappa` | CurriculumTab (map mode) | Diachronic timeline view |
| `popolamento` | CurriculumTab (population mode) | Data integration & population |
| `pilota` | CurriculumTab (pilot mode) | **FROZEN** experimental pilot |

### Area 3: Curriculum Revision

| Field | Value |
|-------|-------|
| **Canonical name** | Curriculum Revision |
| **Purpose** | Review curriculum decisions, manage approval workflow |
| **Users** | Teachers, department heads |
| **Views** | `RevisioneTab` |
| **Entry points** | Sidebar "Revisione (Gap 2025)", mobile bottom nav |
| **Stores** | `useCurriculumStore` (decisions, revision filters) |
| **Data** | Pending decisions, approval status, gap analysis |
| **Actions** | Review, approve, reject, filter decisions |
| **Dependencies** | Area 2 (curriculum data) |
| **Shared components** | `RevisioneTab` (curriculum feature) |
| **Experimental** | No |
| **Current state** | Active |

### Area 4: Teaching Design (UDA)

| Field | Value |
|-------|-------|
| **Canonical name** | Teaching Design |
| **Purpose** | Create, manage, and export teaching units (UDA) |
| **Users** | Teachers |
| **Views** | `ProgettazioneTab` (wizard, archive, competence matrix) |
| **Entry points** | Sidebar "Progettazione UDA" → sub-items |
| **Stores** | `useCurriculumStore` (UDA library, program state) |
| **Data** | UDA templates, competence frameworks, annual planning drafts |
| **Actions** | Create UDA, fill wizard steps, manage archive, view competence matrix, export |
| **Dependencies** | Area 2 (curriculum decisions), Area 7 (documents for export) |
| **Shared components** | `ProgettazioneTab`, `CertificazioneTab`, `UdaDetailModal`, `OutcomesModal`, `useUdaProgrammingHandlers`, `useProgettazioneAssistiveHandlers` |
| **Experimental** | No |
| **Current state** | Active, largest feature area |

**Sub-tabs:**

| Sub-tab | Purpose |
|---------|---------|
| `annuale` | UDA Wizard — step-by-step annual planning |
| `uda` | UDA Archive — browse saved teaching units |
| `certificazione` | Competence Matrix — skills assessment grid |

### Area 5: Process & Consent

| Field | Value |
|-------|-------|
| **Canonical name** | Process & Consent |
| **Purpose** | Document the teaching process, manage consent workflows |
| **Users** | Teachers, administrators |
| **Views** | `ProcessoTab` |
| **Entry points** | Sidebar "Processo & Consenso" |
| **Stores** | `useCurriculumStore` (process data) |
| **Data** | Process documents, consent records, proposals |
| **Actions** | Create process documents, manage consent, export |
| **Dependencies** | Area 4 (UDA data for process documents) |
| **Shared components** | `ProcessoTab` |
| **Experimental** | No |
| **Current state** | Active |

### Area 6: Classroom & Social

| Field | Value |
|-------|-------|
| **Canonical name** | Classroom & Social |
| **Purpose** | Manage classroom environment, student outcomes, UDA reuse |
| **Users** | Teachers |
| **Views** | `ClasseTab` (class environment, outcomes), `SocialTab` (UDA reuse) |
| **Entry points** | Sidebar "Spazio d'Aula e Classe" → sub-items |
| **Stores** | `useClassroomStore` (class modes, groups, attendance), `useSocialStore` (shared UDAs, annotations) |
| **Data** | Student data (anonymized), classroom layouts, cooperative groups, shared UDA board |
| **Actions** | Manage classroom modes, track outcomes, annotate UDAs, view reuse statistics |
| **Dependencies** | Area 4 (UDA data), Area 8 (workspace for sync) |
| **Shared components** | `ClasseTab`, `SocialTab`, `useClassroomSocialState`, `useClassroomSocialHandlers`, `OutcomesModal` |
| **Experimental** | No |
| **Current state** | Active |

**Sub-tabs:**

| Sub-tab | Purpose |
|---------|---------|
| `classe` | Class environment & outcomes |
| `social` | UDA reuse observatory |

### Area 7: Documents & Export

| Field | Value |
|-------|-------|
| **Canonical name** | Documents & Export |
| **Purpose** | Generate, export, and manage teaching documents |
| **Users** | Teachers |
| **Views** | `EsportazioniTab` |
| **Entry points** | Sidebar "Esportazione File d'Ufficio", mobile bottom nav |
| **Stores** | `useCurriculumStore` (export data) |
| **Data** | Generated documents, export history, templates |
| **Actions** | Generate programmazione annuale, relazione, UDA documents, SCORM packages, CSV import |
| **Dependencies** | Area 4 (UDA data), Area 2 (curriculum decisions) |
| **Shared components** | `EsportazioniTab`, `DocumentExportHistory`, `useDocumentExportHandlers`, `useUdaPackageHandlers`, `useBackupHandlers`, `useTemplateEngine` |
| **Experimental** | No |
| **Current state** | Active |

### Area 8: Teacher Workspace

| Field | Value |
|-------|-------|
| **Canonical name** | Teacher Workspace |
| **Purpose** | Cloud sync, backup, session persistence, account management |
| **Users** | Teachers |
| **Views** | `CloudAccountModal` (modal), workspace sync in header |
| **Entry points** | Header user menu → "Sincronizza Drive", "Connetti Cloud" |
| **Stores** | `useWorkspaceStore` (Google tokens, sync status, persisted), `useSessionStore` (emergency backup, persisted) |
| **Data** | Google Drive tokens, folder IDs, sync state, emergency backups |
| **Actions** | Login OAuth, sync Drive, local backup, auto-pull, logout |
| **Dependencies** | None (cross-cutting concern) |
| **Shared components** | `CloudAccountModal`, `GemmaSuggestionModal`, `MicPermissionGuideModal`, `useWorkspaceSyncHandlers`, `useWorkspaceState`, `useSessionAutoSave` |
| **Experimental** | No |
| **Current state** | Active |

### Area 9: Copilot & AI

| Field | Value |
|-------|-------|
| **Canonical name** | Copilot & AI |
| **Purpose** | AI-assisted teaching support, voice interaction, local LLM |
| **Users** | Teachers |
| **Views** | `CopilotChatSidebar` (sidebar panel), `AgentSetupModal` |
| **Entry points** | Header "Co-pilota Chat" button, LLM status indicator |
| **Stores** | `useCopilotStore` (chat messages, AI context, voice settings) |
| **Data** | Chat history, AI context, voice language, local agent config |
| **Actions** | Chat with AI, configure local Ollama, voice input/output, context-aware suggestions |
| **Dependencies** | Area 2 (curriculum context for AI), Area 8 (workspace for persistence) |
| **Shared components** | `CopilotChatSidebar`, `AgentSetupModal`, `CopilotPanel`, `useCopilotInteractionHandlers`, `useLocalAgentSetup` |
| **Experimental** | No |
| **Current state** | Active |

### Area 10: Second Brain & Knowledge

| Field | Value |
|-------|-------|
| **Canonical name** | Second Brain & Knowledge |
| **Purpose** | Institute knowledge base, WikiLLM, glossary management |
| **Users** | Teachers, department heads |
| **Views** | `SecondBrainTab`, `WikiReaderModal`, `AddKbDocumentModal` |
| **Entry points** | Sidebar "WikiLLM & Brain d'Istituto" |
| **Stores** | `useKnowledgeStore` (custom docs, glossary terms) |
| **Data** | Custom knowledge base documents, glossary terms, search index |
| **Actions** | Add/delete KB documents, search, generate wiki responses, manage glossary |
| **Dependencies** | Area 2 (curriculum context), Area 9 (AI for WikiLLM) |
| **Shared components** | `SecondBrainTab`, `WikiReaderModal`, `AddKbDocumentModal`, `useKnowledgeBaseHandlers`, `useWikiGlossaryHandlers` |
| **Experimental** | No |
| **Current state** | Active |

### Area 11: Institute Sources

| Field | Value |
|-------|-------|
| **Canonical name** | Institute Sources |
| **Purpose** | Manage institutional data sources and configuration |
| **Users** | Teachers, administrators |
| **Views** | `InfoViews` (fonti tab) |
| **Entry points** | Sidebar "Fonti d'Istituto" |
| **Stores** | `useCurriculumStore` (school order, year, discipline) |
| **Data** | School metadata, discipline configuration |
| **Actions** | View/configure institutional sources |
| **Dependencies** | None (foundational data) |
| **Shared components** | `InfoViews` (session feature) |
| **Experimental** | No |
| **Current state** | Active |

### Area 12: User Guide

| Field | Value |
|-------|-------|
| **Canonical name** | User Guide |
| **Purpose** | Help and operational guidance |
| **Users** | All teachers |
| **Views** | `InfoViews` (guida tab) |
| **Entry points** | Sidebar "Guida Operativa" |
| **Stores** | None |
| **Data** | Static help content |
| **Actions** | Read guide |
| **Dependencies** | None |
| **Shared components** | `InfoViews` (session feature) |
| **Experimental** | No |
| **Current state** | Active |

### Area 13: PA Certification

| Field | Value |
|-------|-------|
| **Canonical name** | PA Certification |
| **Purpose** | AgID compliance certification documents |
| **Users** | Administrators |
| **Views** | Falls through to `EsportazioniTab` |
| **Entry points** | Sidebar "Certificazione PA (AgID)" |
| **Stores** | `useCurriculumStore` |
| **Data** | AgID certification templates |
| **Actions** | Generate PA compliance documents |
| **Dependencies** | Area 7 (document generation) |
| **Shared components** | `EsportazioniTab` (reused) |
| **Experimental** | No |
| **Current state** | Active, shares view with esportazioni |

---

## 3. Experimental / Frozen Modules

| Module | CML | Status | Location | Components |
|--------|-----|--------|----------|------------|
| Curriculum eTwin Prototype | CML-630C | Complete local, not promoted | `src/features/curriculum-etwin/` | `EtwinMainView`, `useEtwinPrototype` |
| Curriculum Functional Pilot | CML-631 | **FROZEN** | `src/features/curriculum-functional-pilot/` | `PilotMainView`, `PilotStatusPanel`, `PilotVerticalLinkForm`, `PilotLinkList`, `PilotNodePicker`, `useCurriculumPilot`, `pedagogicalSuggestionEngine`, `relationTypeGuidance` |
| Assisted Pedagogical Suggestions | CML-631I | Complete local, **NOT ADOPTED** | `src/features/curriculum-functional-pilot/` | `pedagogicalSuggestionEngine.ts` |

---

## 4. Empty / Placeholder Modules

| Module | Location | Notes |
|--------|----------|-------|
| `graphs/` | `src/features/graphs/` | Empty directory, no barrel |
| `knowledge/` | `src/features/knowledge/` | Empty directory, no barrel |
| `onboarding/` | `src/features/onboarding/` | Empty directory, no barrel |
| `tep/` | `src/features/tep/` | Empty directory, no barrel |
| `voice/` | `src/features/voice/` | Empty directory, no barrel |

---

## 5. Shared Infrastructure

### 5.1 Shared UI Components (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `Accordion` | Collapsible sections |
| `Badge` | Status/label badges |
| `Button` | Standard button |
| `Card` | Content card |
| `ConfirmDialog` | Confirmation dialog |
| `EmptyState` | Empty state placeholder |
| `ErrorBoundary` | React error boundary |
| `Input` | Form input |
| `Modal` | Modal dialog |
| `Progress` | Progress indicator |
| `Select` | Dropdown select |
| `Spinner` | Loading spinner |
| `Tabs` | Tab navigation |
| `Toast` | Toast notification |
| `ToastContainer` | Toast provider |
| `Tooltip` | Hover tooltip |

### 5.2 Layout Infrastructure (`src/components/layout/`)

| File | Purpose |
|------|---------|
| `AppContext.tsx` | React context providing `AppViewsLayerProps` |
| `pickProps.ts` | Type-safe property picker |

### 5.3 Stores (`src/stores/`)

| Store | Persisted | Purpose |
|-------|-----------|---------|
| `useNavigationStore` | No | Active tab, subtabs, accordion states, modal/panel visibility |
| `useCurriculumStore` | **Yes** | Role, discipline, decisions, UDA library, revision filters |
| `useClassroomStore` | No | Classroom modes, groups, attendance, behavior |
| `useCopilotStore` | No | Chat messages, AI context, voice/language settings |
| `useWorkspaceStore` | **Yes** | Google Drive tokens, user info, sync status |
| `useSocialStore` | No | Shared UDAs, annotations, likes, outcome stats |
| `useKnowledgeStore` | No | Custom KB docs, glossary terms, search/tags |
| `useSessionStore` | **Yes** | Onboarding flag, emergency banner, storage usage |

### 5.4 Utility Libraries (`src/lib/`)

| Library | Purpose |
|---------|---------|
| `clipboard.ts` | Copy text to clipboard |
| `escapeHtml.ts` | HTML entity escaping |
| `storage.ts` | Safe localStorage with quota handling |
| `wikiLLM.ts` | Wiki/glossary LLM response generation |
| `semanticSearch.ts` | Regex escaping for search |
| `documentGenerator.ts` | Document generation (annual plan, reports, UDA docs) |
| `gdprFilter.ts` | GDPR personal data detection/filtering |
| `scormGenerator.ts` | SCORM manifest generation |
| `ollamaClient.ts` | Local Ollama LLM integration |
| `googleDrive.ts` | Google Drive API integration |
| `csvParser.ts` | CSV parsing and curriculum import |
| `architectureGraph.ts` | Architecture visualization data |
| `competencies.ts` | EU key competencies reference |
| `consolidatedStorage.ts` | Consolidated state storage |
| `curriculumTransitionResolver.ts` | Academic year transitions |
| `disciplineLabels.ts` | Italian school discipline labels |
| `localZipPacker.ts` | Native ZIP generation |
| `roleLabels.ts` | Italian user role labels |

---

## 6. Cross-Cutting Flows

| Flow | Areas Involved | Description |
|------|----------------|-------------|
| Document Export | 4, 5, 7, 13 | Generate documents from UDA/curriculum data |
| Cloud Sync | 8, all | Google Drive backup/restore across all areas |
| AI Copilot | 9, 2, 4, 10 | Context-aware AI assistance |
| Emergency Backup | 8, all | Auto-save on page close |
| Onboarding | 1, all | First-run experience |
| GDPR Filtering | all | Personal data sanitization |
| SCORM Packaging | 4, 7 | Package UDAs as SCORM modules |

---

## 7. Summary Counts

| Category | Count |
|----------|-------|
| Canonical functional areas | 13 |
| Active views (unique components) | 18 |
| Sub-views / sub-tabs | 11 |
| Feature modules (src/features/) | 17 |
| Active feature modules | 12 |
| Experimental modules | 2 |
| Empty placeholder modules | 5 |
| Global stores | 8 |
| Persisted stores | 3 |
| Shared UI components | 16 |
| Utility libraries | 18 |
| Cross-cutting flows | 7 |
