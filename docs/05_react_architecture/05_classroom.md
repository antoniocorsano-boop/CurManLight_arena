# 05 — Classroom Domain: Modes, Groups, Feedback, Attendance, Behavior

> Classroom management: student pseudonyms, cooperative groups, feedback, attendance, behavior tracking, and topic analysis.

---

## 1. Components

### 1.1 `ClassroomTab.tsx`

```typescript
// State: reads useClassroomStore (mode)
// State: reads useNavigationStore (activeClassroomSubtab)
// Renders: mode selector, subtab navigation, content area
// Behavior: orchestrates classroom features
```

**JSX Structure**:
```
<div>
  <ClassroomModeSelector />
  <Tabs tabs={classroomTabs} activeTab={activeClassroomSubtab} onChange={setActiveClassroomSubtab} />
  {activeClassroomSubtab === 'students' && <StudentList />}
  {activeClassroomSubtab === 'groups' && <CooperativeGroups />}
  {activeClassroomSubtab === 'feedback' && <StudentFeedback />}
  {activeClassroomSubtab === 'attendance' && <AttendanceTracker />}
  {activeClassroomSubtab === 'behavior' && <BehaviorLog />}
  {activeClassroomSubtab === 'topic' && <TopicAnalysis />}
  {activeClassroomSubtab === 'layout' && <ClassroomLayout />}
</div>
```

### 1.2 `ClassroomModeSelector.tsx`

```typescript
// State: reads useClassroomStore (mode)
// Renders: 4 mode cards (ordinario, cooperativo, inclusivo, digitale)
// Behavior: click to switch mode, highlights active
```

### 1.3 `StudentList.tsx`

```typescript
// State: reads useClassroomStore (studentMap, exclusionsList)
// Renders: student list with pseudonyms, shuffle button, exclusion editor
// Behavior: shuffle pseudonyms, manage exclusions
```

### 1.4 `CooperativeGroups.tsx`

```typescript
// State: reads useClassroomStore (cooperativeGroups, activeMethod, studentMap, exclusionsList)
// Renders: group display, method selector, generate button
// Behavior: generate groups, shows group composition
```

### 1.5 `GroupOptimizer.tsx`

```typescript
interface GroupOptimizerProps {
  students: string[];
  exclusions: [string, string][];
  method: CooperativeMethod;
  onGenerate: (groups: CooperativeGroup[]) => void;
}

// State: local — optimizationProgress
// Renders: optimization algorithm visualization
// Behavior: runs 100-trial optimization, shows progress
```

### 1.6 `StudentFeedback.tsx`

```typescript
// State: reads useClassroomStore (studentFeedback)
// Renders: feedback form, feedback history, outcome stats
// Behavior: submit feedback, view history
```

### 1.7 `SentimentAnalysis.tsx`

```typescript
// State: reads useClassroomStore (studentFeedback)
// Renders: sentiment chart, mood trends
// Behavior: analyzes feedback sentiment over time
```

### 1.8 `AttendanceTracker.tsx`

```typescript
// State: reads useClassroomStore (attendance)
// Renders: attendance grid (students × dates), mark attendance
// Behavior: mark present/absent/late, view history
```

### 1.9 `BehaviorLog.tsx`

```typescript
// State: reads useClassroomStore (behaviorLog)
// Renders: behavior entries list, add entry form
// Behavior: add positive/negative/neutral entries, filter by student/date
```

### 1.10 `TopicAnalysis.tsx`

```typescript
// State: local — topicText, analysisResult, isAnalyzing
// Renders: topic input, analysis results, proposed UDA
// Behavior: analyze topic against curriculum, propose UDA
```

### 1.11 `ClassroomLayout.tsx`

```typescript
// State: reads useClassroomStore (layout, theme)
// Renders: visual layout editor (traditional, U-shape, groups, pairs)
// Behavior: drag to rearrange desks, change layout preset
```

### 1.12 `ClassroomNotifications.tsx`

```typescript
// State: reads useClassroomStore (notifications)
// Renders: notification list
// Behavior: shows classroom alerts and reminders
```

---

## 2. Hooks

### 2.1 `useShuffle.ts`

```typescript
function useShuffle(): {
  shuffle: (students: string[], exclusions: [string, string][]) => Record<string, string>;
  isShuffling: boolean;
}
// Implements Fisher-Yates with exclusion constraints
```

### 2.2 `useCooperativeGroups.ts`

```typescript
function useCooperativeGroups(): {
  generate: (students: string[], exclusions: [string, string][], method: CooperativeMethod) => CooperativeGroup[];
  isGenerating: boolean;
  progress: number;
}
// Implements 100-trial optimization algorithm
```

### 2.3 `useClassroomPersistence.ts`

```typescript
function useClassroomPersistence(): void
// Syncs classroom state to localStorage on changes
// Reads: useClassroomStore (all fields)
// Writes: localStorage (curmanlight-classroom-*)
```

---

## 3. Handlers

```typescript
// In CooperativeGroups component
const handleGenerateCooperativeGroups = () => {
  if (!studentMap) {
    toast.error('Prima mescola i pseudonimi');
    return;
  }
  const students = Object.values(studentMap);
  const groups = generateGroups(students, exclusionsList, activeMethod);
  store.setGroups(groups);
  toast.success('Gruppi cooperativi generati');
};

// In StudentList component
const handleShufflePseudonyms = () => {
  const students = ['Studente 1', 'Studente 2', /* ... */];
  const newMap = shuffleWithExclusions(students, exclusionsList);
  store.setStudentMap(newMap);
  toast.success('Pseudonimi mescolati');
};

// In TopicAnalysis component
const handleAnalyzeClassroomTopic = async () => {
  setIsAnalyzing(true);
  const result = await analyzeTopic(topicText, discipline, savedUda, localCurriculum);
  setAnalysisResult(result);
  setIsAnalyzing(false);
};

const handleApproveAndInjectUda = () => {
  if (analysisResult?.proposedUda) {
    store.addUda(analysisResult.proposedUda);
    toast.success('UDA approvata e aggiunta alla libreria');
  }
};
```

---

## 4. Data Flow

```
ClassroomTab
  ├─→ StudentList → handleShufflePseudonyms
  │     → useClassroomStore.setStudentMap
  │     → useEffect persists to localStorage
  │
  ├─→ CooperativeGroups → handleGenerateCooperativeGroups
  │     → useClassroomStore.setGroups
  │     → useEffect persists to localStorage
  │
  ├─→ StudentFeedback → submitFeedback
  │     → useClassroomStore.setFeedback
  │     → useEffect syncs to useSocialStore.outcomeStats
  │
  ├─→ AttendanceTracker → markAttendance
  │     → useClassroomStore.addAttendance
  │
  └─→ TopicAnalysis → handleAnalyzeClassroomTopic
        → reads savedUda, localCurriculum
        → proposes new UDA
        → handleApproveAndInjectUda
        → useCurriculumStore.addUda
```

---

## 5. Tests

| Test File | Tests |
|-----------|-------|
| `ClassroomTab.test.tsx` | renders modes, switches subtabs |
| `ClassroomModeSelector.test.tsx` | renders 4 modes, selects mode |
| `StudentList.test.tsx` | renders students, shuffles pseudonyms |
| `CooperativeGroups.test.tsx` | renders groups, generates groups |
| `GroupOptimizer.test.tsx` | runs optimization, shows progress |
| `StudentFeedback.test.tsx` | submits feedback, shows history |
| `SentimentAnalysis.test.tsx` | renders sentiment chart |
| `AttendanceTracker.test.tsx` | marks attendance, shows history |
| `BehaviorLog.test.tsx` | adds entry, filters entries |
| `TopicAnalysis.test.tsx` | analyzes topic, proposes UDA |
| `ClassroomLayout.test.tsx` | renders layout, changes preset |
| `useShuffle.test.ts` | shuffles correctly, respects exclusions |
| `useCooperativeGroups.test.ts` | generates groups, respects exclusions |
| `useClassroomPersistence.test.ts` | persists to localStorage |

**Total**: ~35 tests
