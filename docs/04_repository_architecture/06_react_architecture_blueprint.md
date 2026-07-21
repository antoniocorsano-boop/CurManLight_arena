# 06 — React Architecture Blueprint

> Defines the runtime architecture: Router setup, layout shells, Zustand store slices, lazy loading strategy, error boundary placement, and data flow patterns.

---

## 1. Router Architecture

### 1.1 Route Table

```tsx
// src/routes/index.tsx
const routes = [
  { path: '/',                    element: <Navigate to="/curriculum" /> },
  { path: '/curriculum',         element: <CurriculumPage />,         lazy: () => import('../pages/CurriculumPage') },
  { path: '/curriculum/:discipline', element: <CurriculumPage />,     lazy: () => import('../pages/CurriculumPage') },
  { path: '/classroom',          element: <ClassroomPage />,          lazy: () => import('../pages/ClassroomPage') },
  { path: '/classroom/:mode',    element: <ClassroomPage />,          lazy: () => import('../pages/ClassroomPage') },
  { path: '/planning',           element: <PlanningPage />,           lazy: () => import('../pages/PlanningPage') },
  { path: '/planning/wizard',    element: <PlanningPage />,           lazy: () => import('../pages/PlanningPage') },
  { path: '/documents',          element: <DocumentsPage />,          lazy: () => import('../pages/DocumentsPage') },
  { path: '/documents/:type',    element: <DocumentsPage />,          lazy: () => import('../pages/DocumentsPage') },
  { path: '/copilot',            element: <CopilotPage />,            lazy: () => import('../pages/CopilotPage') },
  { path: '/knowledge',          element: <KnowledgePage />,          lazy: () => import('../pages/KnowledgePage') },
  { path: '/social',             element: <SocialPage />,             lazy: () => import('../pages/SocialPage') },
  { path: '/settings',           element: <SettingsPage />,           lazy: () => import('../pages/SettingsPage') },
  { path: '/onboarding',         element: <OnboardingPage />,         lazy: () => import('../pages/OnboardingPage') },
];
```

### 1.2 Route Count Estimate

| Section | Routes | Sub-routes |
|---------|--------|-----------|
| Curriculum | 2 | `/:discipline` |
| Classroom | 2 | `/:mode` (groups, feedback, attendance, behavior, topic) |
| Planning | 2 | `/wizard` |
| Documents | 2 | `/:type` (programmazione, relazione, specifico, confronto, audit) |
| Copilot | 1 | — |
| Knowledge | 1 | — |
| Social | 1 | — |
| Settings | 1 | — |
| Onboarding | 1 | — |
| **Total** | **13 base** | **~25 with params** |

---

## 2. Layout Shell Architecture

### 2.1 App.tsx (Reduced to ~500 lines)

```tsx
// src/App.tsx — Layout shell only
function App() {
  const { activeTab } = useNavigationStore();
  const { showOnboarding } = useSessionStore();
  const { showEmergencyBanner } = useSessionStore();

  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <AppShell>
        {showEmergencyBanner && <EmergencyBanner />}
        {showOnboarding && <OnboardingModal />}
        
        <Routes>
          {routes.map(route => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
        
        <CopilotPanel />        {/* Floating panel, always available */}
        <ToastContainer />      {/* Global toast notifications */}
      </AppShell>
    </ErrorBoundary>
  );
}
```

### 2.2 AppShell Component

```tsx
// src/features/navigation/components/AppShell.tsx
function AppShell({ children }) {
  const { isMobile } = useResponsive();
  const { showMobileSidebar } = useNavigationStore();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — desktop always, mobile toggle */}
      {!isMobile && <Sidebar />}
      {isMobile && showMobileSidebar && <MobileSidebar />}
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <TopBar />
        <TabBar />
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## 3. Zustand Store Architecture

### 3.1 Store Slices

Each store is independent. Cross-store reads happen in components, not in stores.

```tsx
// src/stores/useNavigationStore.ts
interface NavigationState {
  activeTab: 'curriculum' | 'classroom' | 'planning' | 'documents' | 'copilot' | 'knowledge' | 'social';
  activeClassroomSubtab: string;
  activeProcessoTab: string;
  activeProgTab: string;
  activeGeneralSubtab: string;
  activeCurricoloView: 'albero' | 'lista' | 'tabella';
  secondBrainTab: string;
  wikiWorkspaceTab: string;
  openAccordions: Set<string>;
  showMobileSidebar: boolean;
  // actions
  setActiveTab: (tab: string) => void;
  toggleAccordion: (key: string) => void;
  setShowMobileSidebar: (show: boolean) => void;
}
```

```tsx
// src/stores/useCurriculumStore.ts — Slimmed
interface CurriculumState {
  discipline: string;
  order: SchoolOrder;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  selectedTraguardi: number[];
  selectedObiettivi: number[];
  selectedEvidenze: string[];
  activeRevisionFilter: string;
  // actions
  setDiscipline: (d: string) => void;
  setOrder: (o: SchoolOrder) => void;
  setDecision: (id: string, status: DecisionStatus) => void;
  setCustomText: (id: string, text: string) => void;
  toggleTraguardoSelection: (index: number) => void;
  toggleObiettivoSelection: (index: number) => void;
  toggleEvidenceSelection: (text: string) => void;
  resetAll: () => void;
  restoreBackupState: (state: Partial<CurriculumState>) => void;
}
```

```tsx
// src/stores/useClassroomStore.ts
interface ClassroomState {
  studentMap: Record<string, string> | null;
  exclusionsList: [string, string][];
  cooperativeGroups: CooperativeGroup[] | null;
  studentFeedback: StudentFeedback[];
  layout: ClassroomLayout;
  activeMethod: CooperativeMethod;
  activeMode: ClassroomMode;
  theme: ClassroomTheme;
  attendance: AttendanceRecord[];
  behaviorLog: BehaviorEntry[];
  // actions
  setStudentMap: (map: Record<string, string>) => void;
  setExclusions: (list: [string, string][]) => void;
  setGroups: (groups: CooperativeGroup[]) => void;
  setFeedback: (feedback: StudentFeedback[]) => void;
  setLayout: (layout: ClassroomLayout) => void;
  setMethod: (method: CooperativeMethod) => void;
  setMode: (mode: ClassroomMode) => void;
  setTheme: (theme: ClassroomTheme) => void;
  addAttendance: (record: AttendanceRecord) => void;
  addBehaviorEntry: (entry: BehaviorEntry) => void;
}
```

```tsx
// src/stores/useCopilotStore.ts
interface CopilotState {
  messages: CopilotMessage[];
  context: CopilotContext;
  voiceEnabled: boolean;
  language: string;
  theme: string;
  // actions
  addMessage: (msg: CopilotMessage) => void;
  setContext: (ctx: CopilotContext) => void;
  clearMessages: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
}
```

```tsx
// src/stores/useWorkspaceStore.ts
interface WorkspaceState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: WorkspaceUser | null;
  folderId: string | null;
  lastSyncTime: number | null;
  isSyncLocked: boolean;
  syncProgress: number;
  // actions
  setTokens: (access: string, refresh: string) => void;
  setUserInfo: (info: WorkspaceUser) => void;
  setFolderId: (id: string) => void;
  setSyncStatus: (locked: boolean, progress: number) => void;
  setLastSyncTime: (time: number) => void;
  logout: () => void;
}
```

```tsx
// src/stores/useSocialStore.ts
interface SocialState {
  board: SharedUda[];
  annotations: Record<string, Annotation[]>;
  likes: Record<string, string[]>;
  outcomeStats: Record<string, OutcomeStat>;
  // actions
  addToBoard: (uda: SharedUda) => void;
  removeFromBoard: (id: string) => void;
  addAnnotation: (udaId: string, annotation: Annotation) => void;
  toggleLike: (udaId: string, userId: string) => void;
  setOutcomeStats: (udaId: string, stats: OutcomeStat) => void;
  importFromBoard: (uda: SharedUda) => UdaModel;
}
```

```tsx
// src/stores/useKnowledgeStore.ts
interface KnowledgeState {
  customDocs: CustomKbDoc[];
  glossaryTerms: GlossaryTerm[];
  selectedDoc: string | null;
  searchQuery: string;
  tags: string[];
  // actions
  addCustomDoc: (doc: CustomKbDoc) => void;
  removeCustomDoc: (id: string) => void;
  addGlossaryTerm: (term: GlossaryTerm) => void;
  setSelectedDoc: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTags: (tags: string[]) => void;
}
```

```tsx
// src/stores/useSessionStore.ts
interface SessionState {
  showOnboarding: boolean;
  showEmergencyBanner: boolean;
  storageUsage: number;
  isOffline: boolean;
  lastSaveTime: number | null;
  sessionActive: boolean;
  devMode: boolean;
  // actions
  setShowOnboarding: (show: boolean) => void;
  setShowEmergencyBanner: (show: boolean) => void;
  setStorageUsage: (usage: number) => void;
  setIsOffline: (offline: boolean) => void;
  setLastSaveTime: (time: number) => void;
  setSessionActive: (active: boolean) => void;
  setDevMode: (dev: boolean) => void;
}
```

### 3.2 Persistence Strategy

| Store | Persistence | Mechanism |
|-------|------------|-----------|
| `useCurriculumStore` | IndexedDB (Dexie) | Zustand persist middleware |
| `useClassroomStore` | localStorage | Custom useEffect per field |
| `useCopilotStore` | None (ephemeral) | Lost on reload |
| `useWorkspaceStore` | localStorage (tokens only) | Manual write |
| `useSocialStore` | IndexedDB (future) | Zustand persist middleware |
| `useKnowledgeStore` | localStorage | Manual write |
| `useNavigationStore` | None (ephemeral) | Reset on reload |
| `useSessionStore` | None (derived) | Computed from other stores |

---

## 4. Lazy Loading Strategy

### 4.1 Route-Level Splitting

```tsx
// src/pages/ — all lazy loaded
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'));
const PlanningPage = lazy(() => import('./pages/PlanningPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const CopilotPage = lazy(() => import('./pages/CopilotPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const SocialPage = lazy(() => import('./pages/SocialPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
```

### 4.2 Feature-Level Splitting (Within Pages)

```tsx
// Heavy features lazy loaded even within pages
const ArchitectureGraph = lazy(() => import('./features/graphs/ArchitectureGraph'));
const DidacticGraph = lazy(() => import('./features/graphs/DidacticGraph'));
const ComparisonView = lazy(() => import('./features/documents/ComparisonView'));
const SentimentAnalysis = lazy(() => import('./features/classroom/SentimentAnalysis'));
```

### 4.3 Loading Fallbacks

```tsx
// Suspense boundaries at page level
function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {routes.map(route => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
    </Suspense>
  );
}
```

---

## 5. Error Boundary Strategy

### 5.1 Three Levels

```
Level 1: App-wide ErrorBoundary (main.tsx)
  → Catches fatal errors, shows full-page error screen
  → Allows "Reload" and "Clear Data" actions

Level 2: Page-level ErrorBoundary (each page)
  → Catches errors within a single page
  → Shows page-specific error with "Go Home" action
  → Other pages remain functional

Level 3: Feature-level ErrorBoundary (optional, heavy features)
  → Catches errors in complex features (graphs, copilot, sync)
  → Shows inline error with retry action
  → Rest of page remains functional
```

### 5.2 Placement

```tsx
// src/pages/CurriculumPage.tsx
function CurriculumPage() {
  return (
    <ErrorBoundary fallback={<CurriculumError />}>
      <CurriculumTab />
    </ErrorBoundary>
  );
}

// src/features/copilot/components/CopilotPanel.tsx
function CopilotPanel() {
  return (
    <ErrorBoundary fallback={<CopilotError />}>
      <CopilotChat />
    </ErrorBoundary>
  );
}
```

---

## 6. Data Flow Patterns

### 6.1 Pattern A: Store → Component → Handler → Store

```
Component reads from store
  → User interaction triggers handler
  → Handler calls store action
  → Store updates
  → Component re-renders
```

**Example**: Curriculum decision toggle
```
TraguardoList reads selectedTraguardi from useCurriculumStore
  → User clicks checkbox
  → handleToggleTraguardo(index)
  → store.toggleTraguardoSelection(index)
  → selectedTraguardi updates
  → TraguardoList re-renders
```

### 6.2 Pattern B: Store → Component → Handler → Side Effect

```
Component reads from store
  → User interaction triggers handler
  → Handler performs side effect (API, download, localStorage)
  → Handler may show toast
  → No store mutation (or minimal)
```

**Example**: Document export
```
DocumentConfig reads documentType from local state
  → User clicks "Download Word"
  → handleDownloadWordDefinitivo()
  → Generates Blob → triggers download
  → Shows toast
  → No store mutation
```

### 6.3 Pattern C: Store → Component → Handler → Multiple Stores

```
Component reads from Store A
  → User interaction triggers handler
  → Handler calls action on Store A AND Store B
  → Both stores update
  → Component re-renders
```

**Example**: Classroom feedback → Social outcome
```
StudentFeedback reads from useClassroomStore
  → Student submits feedback
  → useEffect syncs to useSocialStore.outcomeStats
  → Both stores update
  → Social outcome stats re-render
```

### 6.4 Pattern D: Event → Multiple Handlers → Multiple Stores

```
Browser event (beforeunload, visibilitychange)
  → Multiple handlers fire
  → Each handler writes to different stores/localStorage
  → No component re-render (side-effect only)
```

**Example**: Auto-save
```
beforeunload event
  → handleBeforeUnload()
  → Reads stateRef.current (mirror of all stores)
  → Writes to localStorage emergency backup
  → Optionally syncs to Google Drive
  → No re-render
```

---

## 7. Performance Considerations

### 7.1 Zustand Selector Optimization

```tsx
// ❌ Bad: re-renders on ANY store change
const { discipline, order, decisions } = useCurriculumStore();

// ✅ Good: re-renders only when discipline changes
const discipline = useCurriculumStore(s => s.discipline);
const decisions = useCurriculumStore(s => s.decisions);
```

### 7.2 Memoization Points

| Component | Memoization | Reason |
|-----------|------------|--------|
| `DisciplineAccordion` | `React.memo` | Expensive render with many items |
| `TraguardoList` | `React.memo` | Long list, frequent re-renders |
| `GraphNode` | `React.memo` + `useCallback` | Drag handlers |
| `CopilotMessage` | `React.memo` | Chat message list |
| `Toast` | `React.memo` | Frequent updates |

### 7.3 Code Splitting Impact

| Chunk | Size (est.) | Load When |
|-------|------------|-----------|
| Core (App + Navigation + Stores) | ~150 KB | Immediate |
| Curriculum | ~80 KB | On /curriculum visit |
| Classroom | ~60 KB | On /classroom visit |
| Documents | ~100 KB | On /documents visit |
| Copilot | ~50 KB | On /copilot visit |
| Graphs | ~70 KB | On graph feature load |
| Knowledge | ~40 KB | On /knowledge visit |
| Social | ~30 KB | On /social visit |
| **Total** | **~580 KB** | **Lazy loaded** |

---

## 8. Guard & Middleware Architecture

### 8.1 Route Guards

```tsx
// src/routes/guards.tsx
function OnboardingGuard({ children }) {
  const { showOnboarding } = useSessionStore();
  if (showOnboarding) return <Navigate to="/onboarding" />;
  return children;
}

function WorkspaceGuard({ children }) {
  const { accessToken } = useWorkspaceStore();
  if (!accessToken) return <WorkspaceLoginPrompt />;
  return children;
}
```

### 8.2 Store Middleware

```tsx
// Zustand persist middleware for stores that need persistence
const persistConfig = {
  name: 'curmanlight-classroom',
  storage: createJSONStorage(() => localStorage),
};

const useClassroomStore = create(
  persist(persistConfig, (set) => ({
    // ... state and actions
  }))
);
```

### 8.3 Custom Hooks as Middleware

```tsx
// useAutoSave — runs in App, writes to localStorage on critical state changes
function useAutoSave() {
  const stateRef = useRef(getState());
  
  useEffect(() => {
    // Subscribe to all stores
    const unsubscribes = [
      useCurriculumStore.subscribe(s => stateRef.current.curriculum = s),
      useClassroomStore.subscribe(s => stateRef.current.classroom = s),
      // ... other stores
    ];
    
    // Save on visibility change
    const handleVisibility = () => {
      if (document.hidden) {
        localStorage.setItem('curmanlight-emergency-backup', JSON.stringify(stateRef.current));
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      unsubscribes.forEach(u => u());
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}
```
