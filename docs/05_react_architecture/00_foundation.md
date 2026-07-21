# 00 — Foundation: Shared Types, Stores, Hooks, UI Primitives

> Everything that multiple domains depend on. Read this first.

---

## 1. Shared Types (`src/types/`)

### 1.1 `curriculum.ts` (existing — extend)

```typescript
// Keep existing types, add:
export type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';
export type UserRole = 'insegnante' | 'dirigente' | 'genitore' | 'studente';
export type DecisionStatus = 'da_definire' | 'in_via_di_definizione' | 'definito';

export interface Traguardo {
  id: string;
  text: string;
  discipline: string;
  order: SchoolOrder;
}

export interface Obiettivo {
  id: string;
  text: string;
  traguardoId: string;
  discipline: string;
  order: SchoolOrder;
}

export interface Evidence {
  id: string;
  text: string;
  obiettivoId: string;
  discipline: string;
  order: SchoolOrder;
}

export interface CurriculumData {
  traguardi: Traguardo[];
  obiettivi: Obiettivo[];
  evidenze: Evidence[];
}

export interface UdaModel {
  id: string;
  title: string;
  discipline: string;
  order: SchoolOrder;
  competenze: string[];
  descrizione: string;
  strumenti: string[];
  verifica: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserState {
  role: UserRole;
  discipline: string;
  order: SchoolOrder;
  schoolYear: string;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  savedUda: UdaModel[];
  activeRevisionFilter: string;
  selectedTraguardi: number[];
  selectedObiettivi: number[];
  selectedEvidenze: string[];
  activeProgTab: string;
  activeCurricoloView: string;
  activeProcessoTab: string;
  activeGeneralSubtab: string;
}
```

### 1.2 `classroom.ts` (new)

```typescript
export type ClassroomMode = 'ordinario' | 'cooperativo' | 'inclusivo' | 'digitale';
export type CooperativeMethod = 'jigsaw' | 'think_pair_share' | 'numbered_head' | 'studio_circle';
export type ClassroomLayout = 'traditional' | 'u_shape' | 'groups' | 'pairs';

export interface StudentPseudonym {
  realName: string;
  pseudonym: string;
  theme: string;
}

export interface CooperativeGroup {
  id: string;
  name: string;
  members: string[];
  method: CooperativeMethod;
  exclusionPairs: [string, string][];
}

export interface StudentFeedback {
  studentId: string;
  udaId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'presente' | 'assente' | 'ritardo' | 'uscita_anticipata';
  note?: string;
}

export interface BehaviorEntry {
  studentId: string;
  date: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface ClassroomTheme {
  primaryColor: string;
  accentColor: string;
  background: string;
}

export interface TopicAnalysisResult {
  topic: string;
  matchedUda: UdaModel | null;
  proposedUda: UdaModel | null;
  confidence: number;
  suggestions: string[];
}
```

### 1.3 `ai.ts` (new)

```typescript
export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: CopilotContext;
}

export interface CopilotContext {
  activeTab: string;
  discipline: string;
  order: SchoolRole;
  activeUdaId?: string;
  activeDocumentType?: string;
}

export interface InlineSuggestion {
  field: string;
  text: string;
  confidence: number;
}

export interface AiGeneratedCurriculum {
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  source: string;
}

export interface OllamaStatus {
  connected: boolean;
  model: string | null;
  endpoint: string;
}
```

### 1.4 `workspace.ts` (new)

```typescript
export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface WorkspaceSyncProgress {
  phase: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  percent: number;
  message?: string;
}

export interface WorkspaceBackup {
  version: string;
  timestamp: number;
  state: Record<string, unknown>;
}
```

### 1.5 `social.ts` (new)

```typescript
export interface SharedUda {
  id: string;
  uda: UdaModel;
  authorId: string;
  authorName: string;
  sharedAt: number;
  likes: string[];
  annotations: Annotation[];
  outcomeStats?: OutcomeStat;
}

export interface Annotation {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface OutcomeStat {
  completionRate: number;
  satisfactionRate: number;
  selfEvaluation: string;
  lastUpdated: number;
}
```

---

## 2. Store Interfaces (`src/stores/`)

### 2.1 `useNavigationStore.ts`

```typescript
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
  showSettingsPanel: boolean;
  showProfileModal: boolean;
  showKnowledgePanel: boolean;
  showQuickStartGuide: boolean;
  showDocsConfig: boolean;
  showCopilotHint: boolean;

  setActiveTab: (tab: NavigationState['activeTab']) => void;
  setActiveClassroomSubtab: (subtab: string) => void;
  setActiveProcessoTab: (tab: string) => void;
  setActiveProgTab: (tab: string) => void;
  setActiveGeneralSubtab: (subtab: string) => void;
  setActiveCurricoloView: (view: NavigationState['activeCurricoloView']) => void;
  setSecondBrainTab: (tab: string) => void;
  setWikiWorkspaceTab: (tab: string) => void;
  toggleAccordion: (key: string) => void;
  resetAccordions: (discipline: string) => void;
  setShowMobileSidebar: (show: boolean) => void;
  setShowSettingsPanel: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setShowKnowledgePanel: (show: boolean) => void;
  setShowQuickStartGuide: (show: boolean) => void;
  setShowDocsConfig: (show: boolean) => void;
  setShowCopilotHint: (show: boolean) => void;
}
```

### 2.2 `useCurriculumStore.ts` (slimmed)

```typescript
interface CurriculumState {
  discipline: string;
  order: SchoolOrder;
  schoolYear: string;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  savedUda: UdaModel[];
  activeRevisionFilter: string;
  selectedTraguardi: number[];
  selectedObiettivi: number[];
  selectedEvidenze: string[];

  setDiscipline: (d: string) => void;
  setOrder: (o: SchoolOrder) => void;
  setSchoolYear: (year: string) => void;
  setDecision: (id: string, status: DecisionStatus) => void;
  setCustomText: (id: string, text: string) => void;
  resetDecision: (id: string) => void;
  addUda: (uda: UdaModel) => void;
  deleteUda: (id: string) => void;
  clearUdaLibrary: () => void;
  setActiveRevisionFilter: (filter: string) => void;
  toggleTraguardoSelection: (index: number) => void;
  toggleObiettivoSelection: (index: number) => void;
  toggleEvidenceSelection: (text: string) => void;
  resetAll: () => void;
  restoreBackupState: (newState: Partial<CurriculumState>) => void;
}
// Persistence: IndexedDB via Dexie
// Key: curmanlight-react-db-state-v1.4.0
```

### 2.3 `useClassroomStore.ts`

```typescript
interface ClassroomState {
  mode: ClassroomMode;
  layout: ClassroomLayout;
  theme: ClassroomTheme;
  activeMethod: CooperativeMethod;
  studentMap: Record<string, string> | null;
  exclusionsList: [string, string][];
  cooperativeGroups: CooperativeGroup[] | null;
  studentFeedback: StudentFeedback[];
  attendance: AttendanceRecord[];
  behaviorLog: BehaviorEntry[];
  activeTaughtUdaId: string | null;

  setMode: (mode: ClassroomMode) => void;
  setLayout: (layout: ClassroomLayout) => void;
  setTheme: (theme: ClassroomTheme) => void;
  setMethod: (method: CooperativeMethod) => void;
  setStudentMap: (map: Record<string, string>) => void;
  setExclusions: (list: [string, string][]) => void;
  setGroups: (groups: CooperativeGroup[]) => void;
  setFeedback: (feedback: StudentFeedback[]) => void;
  addAttendance: (record: AttendanceRecord) => void;
  addBehaviorEntry: (entry: BehaviorEntry) => void;
  setActiveTaughtUdaId: (id: string | null) => void;
  resetClassroom: () => void;
}
// Persistence: localStorage (manual useEffect per field)
```

### 2.4 `useCopilotStore.ts`

```typescript
interface CopilotState {
  messages: CopilotMessage[];
  context: CopilotContext;
  voiceEnabled: boolean;
  language: string;
  theme: string;
  isLoading: boolean;

  addMessage: (msg: CopilotMessage) => void;
  setContext: (ctx: Partial<CopilotContext>) => void;
  setLoading: (loading: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  clearMessages: () => void;
}
// Persistence: None (ephemeral)
```

### 2.5 `useWorkspaceStore.ts`

```typescript
interface WorkspaceState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: WorkspaceUser | null;
  folderId: string | null;
  lastSyncTime: number | null;
  isSyncLocked: boolean;
  syncProgress: number;

  setTokens: (access: string, refresh: string) => void;
  setUserInfo: (info: WorkspaceUser) => void;
  setFolderId: (id: string) => void;
  setSyncStatus: (locked: boolean, progress: number) => void;
  setLastSyncTime: (time: number) => void;
  logout: () => void;
}
// Persistence: localStorage (tokens only)
```

### 2.6 `useSocialStore.ts`

```typescript
interface SocialState {
  board: SharedUda[];
  annotations: Record<string, Annotation[]>;
  likes: Record<string, string[]>;
  outcomeStats: Record<string, OutcomeStat>;

  addToBoard: (uda: SharedUda) => void;
  removeFromBoard: (id: string) => void;
  addAnnotation: (udaId: string, annotation: Annotation) => void;
  toggleLike: (udaId: string, userId: string) => void;
  setOutcomeStats: (udaId: string, stats: OutcomeStat) => void;
  importFromBoard: (uda: SharedUda) => UdaModel;
}
// Persistence: IndexedDB (future)
```

### 2.7 `useKnowledgeStore.ts`

```typescript
interface KnowledgeState {
  customDocs: CustomKbDoc[];
  glossaryTerms: GlossaryTerm[];
  selectedDocId: string | null;
  searchQuery: string;
  tags: string[];

  addCustomDoc: (doc: CustomKbDoc) => void;
  removeCustomDoc: (id: string) => void;
  addGlossaryTerm: (term: GlossaryTerm) => void;
  removeGlossaryTerm: (id: string) => void;
  setSelectedDocId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTags: (tags: string[]) => void;
}
// Persistence: localStorage
```

### 2.8 `useSessionStore.ts`

```typescript
interface SessionState {
  showOnboarding: boolean;
  showEmergencyBanner: boolean;
  storageUsage: number;
  isOffline: boolean;
  lastSaveTime: number | null;
  sessionActive: boolean;
  devMode: boolean;
  debugPanel: boolean;
  mockDataInjected: boolean;

  setShowOnboarding: (show: boolean) => void;
  setShowEmergencyBanner: (show: boolean) => void;
  setStorageUsage: (usage: number) => void;
  setIsOffline: (offline: boolean) => void;
  setLastSaveTime: (time: number) => void;
  setSessionActive: (active: boolean) => void;
  setDevMode: (dev: boolean) => void;
  setDebugPanel: (show: boolean) => void;
  setMockDataInjected: (injected: boolean) => void;
}
// Persistence: None (derived from other stores + localStorage flags)
```

---

## 3. Shared Hooks (`src/hooks/`)

### 3.1 `useAutoSave.ts`

```typescript
function useAutoSave(): void
// Reads: all stores via stateRef
// Writes: localStorage emergency backup on visibilitychange/beforeunload
// Side effects: Google Drive auto-pull if logged in
```

### 3.2 `useSpeech.ts`

```typescript
function useSpeech(): {
  speak: (text: string, blockId: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  currentBlock: string | null;
}
// Reads: useCopilotStore (selectedVoice, voiceRate)
// Writes: internal state (isSpeaking, currentBlock)
```

### 3.3 `useVoiceTyping.ts`

```typescript
function useVoiceTyping(): {
  start: () => void;
  stop: () => void;
  isActive: boolean;
  transcript: string;
  error: string | null;
}
// Reads: none
// Writes: internal state (isActive, transcript, error)
```

### 3.4 `useStorageMaintenance.ts`

```typescript
function useStorageMaintenance(): { usage: number; isWarning: boolean }
// Reads: localStorage quota
// Writes: prunes stale entries, shows toast on quota warning
```

### 3.5 `useOAuth.ts`

```typescript
function useOAuth(): { parseHashToken: () => void; clearExpiredToken: () => void }
// Reads: window.location.hash, localStorage
// Writes: useWorkspaceStore (tokens, userInfo)
```

### 3.6 `useTEP.ts`

```typescript
function useTEP(): {
  isDismissed: boolean;
  simplifyActive: boolean;
  wizardMode: boolean;
  dismissSimplify: () => void;
  dismissWizard: () => void;
  resetTEP: () => void;
}
// Reads: localStorage
// Writes: localStorage
```

### 3.7 `useGraphDrag.ts`

```typescript
function useGraphDrag(nodes: GraphNode[]): {
  draggedNode: string | null;
  handleMouseDown: (id: string, e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}
// Reads: node positions
// Writes: internal drag state
```

### 3.8 `useSimulations.ts`

```typescript
function useSimulations(): {
  intervals: NodeJS.Timeout[];
  clearAll: () => void;
}
// Reads: none
// Writes: tracks intervals for cleanup on unmount
```

---

## 4. Shared UI Primitives (`src/components/ui/`)

### 4.1 Component Interfaces

```typescript
// Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}

// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

// Toast.tsx
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

// Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Input.tsx
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'number' | 'email' | 'password';
  className?: string;
}

// Select.tsx
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

// Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

// Accordion.tsx
interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

// Tabs.tsx
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

// ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

// Spinner.tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

// ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

// Tooltip.tsx
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Progress.tsx
interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}
```

---

## 5. Lib Modules (`src/lib/`)

### 5.1 Module Interfaces

```typescript
// escapeHtml.ts (existing — move from utils/)
export function escapeHtml(str: string): string;

// clipboard.ts (existing — move from utils/)
export async function copyToClipboard(text: string): Promise<boolean>;

// storage.ts (existing — move from utils/)
export function safeLocalStorageSetItem(key: string, value: string): void;
export function throttledSetLarge(key: string, value: string, delay?: number): void;
export function pruneStale(prefix: string, maxAge?: number): void;
export function getStorageUsage(): { used: number; total: number; percent: number };

// wikiLLM.ts (existing — move from utils/)
export function searchWiki(query: string, lang?: string): Promise<WikiResult[]>;

// semanticSearch.ts (existing — move from utils/)
export function semanticSearch(query: string, corpus: string[]): SearchResult[];

// documentGenerator.ts (new)
export function generateProgrammazioneAnnuale(data: ProgrammazioneData): string;
export function generateRelazione(data: RelazioneData): string;
export function generateSpecificoGrado(data: SpecificoData): string;
export function generateUdaDocument(uda: UdaModel, config: DocumentConfig): string;
export function generateCurricoloPdf(curriculum: CurriculumData, discipline: string, order: SchoolOrder): string;

// csvParser.ts (new)
export function parseCsv(file: File): Promise<CsvRow[]>;
export function importCsvToCurriculum(rows: CsvRow[], kb: CurriculumKB): CurriculumKB;

// scormGenerator.ts (new)
export function generateScormManifest(uda: UdaModel): string;

// ollamaClient.ts (new)
export function testOllamaConnection(endpoint?: string): Promise<OllamaStatus>;
export function generateWithOllama(prompt: string, model?: string): Promise<string>;

// googleDrive.ts (new)
export function googleAuth(redirectUri: string): string;
export function exchangeCode(code: string, redirectUri: string): Promise<TokenResponse>;
export function uploadToDrive(token: string, fileName: string, content: string, folderId?: string): Promise<DriveFile>;
export function downloadFromDrive(token: string, fileId: string): Promise<string>;
export function listFiles(token: string, query?: string): Promise<DriveFile[]>;

// gdprFilter.ts (new)
export function filterGdpr(text: string): string;
export function containsPersonalData(text: string): boolean;
```

---

## 6. Barrel Exports

Each feature directory has an `index.ts` that re-exports its public API:

```typescript
// src/features/curriculum/index.ts
export { CurriculumTab } from './components/CurriculumTab';
export { DisciplineAccordion } from './components/DisciplineAccordion';
// ...
```

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { Toast } from './Toast';
// ... all UI primitives
```

```typescript
// src/stores/index.ts
export { useNavigationStore } from './useNavigationStore';
export { useCurriculumStore } from './useCurriculumStore';
export { useClassroomStore } from './useClassroomStore';
export { useCopilotStore } from './useCopilotStore';
export { useWorkspaceStore } from './useWorkspaceStore';
export { useSocialStore } from './useSocialStore';
export { useKnowledgeStore } from './useKnowledgeStore';
export { useSessionStore } from './useSessionStore';
```
