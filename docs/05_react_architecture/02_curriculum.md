# 02 — Curriculum Domain: CurriculumTab, Accordions, Tree, Filters

> Displays the national curriculum organized by discipline, withtraguardi/obiettivi/evidenze tree, filters, and decision tracking.

---

## 1. Components

### 1.1 `CurriculumTab.tsx`

```typescript
// State: reads useCurriculumStore (discipline, order, decisions, customTexts, selectedTraguardi, selectedObiettivi, selectedEvidenze, activeRevisionFilter, activeCurricoloView, savedUda)
// State: reads useNavigationStore (openAccordions)
// State: local — curriculumSearchQuery, curriculumViewMode, selectedDisciplineForDetail, showImportModal, showExportModal, curriculumFilter
// Renders: search bar, filter controls, accordion list, detail panel
// Behavior: orchestrates all curriculum sub-components
```

**JSX Structure**:
```
<div>
  <CurriculumHeader />
  <CurriculumSearch />
  <CurriculumFilters />
  <div className="flex">
    <div className="flex-1">
      {activeCurricoloView === 'albero' && <CurriculumTree />}
      {activeCurricoloView === 'lista' && <CurriculumList />}
      {activeCurricoloView === 'tabella' && <CurriculumTable />}
    </div>
    {selectedDisciplineForDetail && <CurriculumDetailPanel />}
  </div>
</div>
```

### 1.2 `DisciplineAccordion.tsx`

```typescript
interface DisciplineAccordionProps {
  disciplineKey: string;
  disciplineName: string;
  isOpen: boolean;
  onToggle: () => void;
  decisionCount: number;
  totalItems: number;
}

// State: reads useCurriculumStore (decisions for this discipline)
// Renders: collapsible accordion with discipline name, decision progress badge
// Behavior: expand/collapse, shows traguardi count
```

### 1.3 `TraguardoList.tsx`

```typescript
interface TraguardoListProps {
  traguardi: Traguardo[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
  discipline: string;
}

// State: reads useCurriculumStore (decisions, customTexts)
// Renders: list of traguardi with checkboxes, decision status, custom text
// Behavior: toggle selection, edit custom text, set decision status
```

### 1.4 `ObiettivoList.tsx`

```typescript
interface ObiettivoListProps {
  obiettivi: Obiettivo[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
  traguardoId: string;
  discipline: string;
}

// State: reads useCurriculumStore (decisions, customTexts)
// Renders: list of obiettivi nested under traguardo
// Behavior: toggle selection, edit custom text
```

### 1.5 `EvidenzaList.tsx`

```typescript
interface EvidenzaListProps {
  evidenze: Evidence[];
  selectedTexts: string[];
  onToggle: (text: string) => void;
  obiettivoId: string;
  discipline: string;
}

// State: reads useCurriculumStore (decisions, customTexts)
// Renders: list of evidenze nested under obiettivo
// Behavior: toggle selection, edit custom text
```

### 1.6 `CurriculumTree.tsx`

```typescript
// State: reads useCurriculumStore (all curriculum data)
// Renders: hierarchical tree view (traguardi → obiettivi → evidenze)
// Behavior: expand/collapse nodes, click to select
```

### 1.7 `CurriculumFilters.tsx`

```typescript
// State: local — filterState (search, revision filter, show only selected)
// Renders: filter bar with search, revision status dropdown, checkboxes
// Behavior: updates filter state, parent re-renders with filtered data
```

### 1.8 `CurriculumSearch.tsx`

```typescript
interface CurriculumSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

// Renders: search input with result count badge
// Behavior: debounced search (300ms)
```

### 1.9 `CurriculumDetailPanel.tsx`

```typescript
interface CurriculumDetailPanelProps {
  discipline: string;
  order: SchoolOrder;
}

// State: reads useCurriculumStore (decisions, customTexts for this discipline)
// Renders: side panel with discipline summary, decision progress, quick actions
// Behavior: shows completion percentage, export button, reset button
```

### 1.10 `CurriculumList.tsx`

```typescript
// State: reads useCurriculumStore (all curriculum data)
// Renders: flat list view of all items
// Behavior: search, filter, click to expand
```

### 1.11 `CurriculumTable.tsx`

```typescript
// State: reads useCurriculumStore (all curriculum data)
// Renders: table view with columns for traguardo, obiettivo, evidenza
// Behavior: sort by column, filter
```

---

## 2. Hooks

### 2.1 `useCurriculumFilters.ts`

```typescript
function useCurriculumFilters(data: CurriculumData, filters: FilterState): FilteredCurriculum
// Input: raw curriculum data + filter state
// Output: filtered and searched curriculum data
// Behavior: applies search, revision filter, selected-only filter
```

---

## 3. Data Flow

```
useCurriculumStore
  ↓ reads
CurriculumTab
  ↓ passes to children
DisciplineAccordion → TraguardoList → ObiettivoList → EvidenzaList
  ↓ each reads
useCurriculumStore (decisions, customTexts)
  ↓ toggles
store.toggleTraguardoSelection / toggleObiettivoSelection / toggleEvidenceSelection
  ↓
store persists to IndexedDB
```

---

## 4. Tests

| Test File | Tests |
|-----------|-------|
| `CurriculumTab.test.tsx` | renders with data, switches view mode, shows search results |
| `DisciplineAccordion.test.tsx` | renders name/badge, toggles open/close, shows decision progress |
| `TraguardoList.test.tsx` | renders traguardi, toggles selection, shows custom text |
| `ObiettivoList.test.tsx` | renders obiettivi, toggles selection, shows custom text |
| `EvidenzaList.test.tsx` | renders evidenze, toggles selection |
| `CurriculumTree.test.tsx` | renders hierarchy, expands/collapses nodes |
| `CurriculumFilters.test.tsx` | applies search, filters by revision, filters selected only |
| `CurriculumSearch.test.tsx` | renders input, shows result count, debounces |
| `CurriculumDetailPanel.test.tsx` | shows summary, shows completion %, export button works |
| `useCurriculumFilters.test.ts` | filters correctly, handles empty data |

**Total**: ~40 tests
