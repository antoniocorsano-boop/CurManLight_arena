# 07 — Knowledge Domain: Second Brain, KB Search, Glossary, Custom Docs

> Knowledge base management: search, glossary, custom documents, WikiLLM integration.

---

## 1. Components

### 1.1 `SecondBrainTab.tsx`

```typescript
// State: reads useKnowledgeStore (selectedDocId, searchQuery, tags)
// State: reads useNavigationStore (secondBrainTab)
// Renders: search bar, document list, document viewer, glossary
// Behavior: orchestrates knowledge base features
```

**JSX Structure**:
```
<div>
  <KnowledgeSearch />
  <div className="flex">
    <div className="w-1/3 border-r">
      <DocumentList />
    </div>
    <div className="flex-1">
      {selectedDocId ? <KnowledgeDoc /> : <EmptyState />}
    </div>
  </div>
  {showGlossaryModal && <GlossaryModal />}
  {showGlossaryFull && <GlossaryFull />}
</div>
```

### 1.2 `KnowledgeSearch.tsx`

```typescript
// State: reads useKnowledgeStore (searchQuery, tags)
// Renders: search input with tag filters
// Behavior: debounced search, filters by tags
```

### 1.3 `DocumentList.tsx`

```typescript
// State: reads useKnowledgeStore (customDocs, searchQuery, tags)
// Renders: list of documents with title, tags, last modified
// Behavior: click to select, shows filtered results
```

### 1.4 `KnowledgeDoc.tsx`

```typescript
interface KnowledgeDocProps {
  docId: string;
}

// State: reads useKnowledgeStore (customDocs)
// Renders: document content with WikiLLM integration
// Behavior: shows document, allows editing, WikiLLM suggestions
```

### 1.5 `GlossaryModal.tsx`

```typescript
// State: reads useKnowledgeStore (glossaryTerms)
// State: local — searchQuery, newTerm
// Renders: glossary list with search, add term form
// Behavior: add/remove terms, search glossary
```

### 1.6 `GlossaryFull.tsx`

```typescript
// State: reads useKnowledgeStore (glossaryTerms)
// Renders: full glossary view (alphabetical, filterable)
// Behavior: search, filter by letter
```

### 1.7 `CustomKbManager.tsx`

```typescript
// State: reads useKnowledgeStore (customDocs)
// Renders: list of custom documents, add/remove buttons
// Behavior: add custom doc, remove doc with confirmation
```

---

## 2. Hooks

### 2.1 `useKnowledgeBase.ts`

```typescript
function useKnowledgeBase(): {
  docs: CustomKbDoc[];
  filteredDocs: CustomKbDoc[];
  addDoc: (doc: CustomKbDoc) => void;
  removeDoc: (id: string) => void;
  search: (query: string) => void;
}
// Reads: useKnowledgeStore
// Behavior: manages knowledge base operations
```

---

## 3. Handlers

```typescript
// In CustomKbManager
const handleAddCustomKbDoc = () => {
  const newDoc: CustomKbDoc = {
    id: crypto.randomUUID(),
    title: newDocTitle,
    content: newDocContent,
    tags: newDocTags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store.addCustomDoc(newDoc);
  toast.success('Documento aggiunto');
  resetForm();
};

const handleDeleteCustomKbDoc = (id: string) => {
  store.removeCustomDoc(id);
  toast.success('Documento eliminato');
};

// In GlossaryModal
const handleGlossaryAgentPopulate = async (term: string) => {
  // WikiLLM semantic lookup
  const definition = await searchWiki(term);
  if (definition.length > 0) {
    const newTerm: GlossaryTerm = {
      id: crypto.randomUUID(),
      term,
      definition: definition[0].summary,
      source: 'WikiLLM',
      createdAt: Date.now(),
    };
    store.addGlossaryTerm(newTerm);
    toast.success('Definizione aggiunta');
  }
};
```

---

## 4. Data Flow

```
User searches in KnowledgeSearch
  → useKnowledgeStore.setSearchQuery
  → DocumentList re-renders with filtered docs

User clicks document
  → useKnowledgeStore.setSelectedDocId
  → KnowledgeDoc renders document content

User adds custom doc
  → handleAddCustomKbDoc()
  → useKnowledgeStore.addCustomDoc
  → DocumentList re-renders

User adds glossary term
  → handleGlossaryAgentPopulate()
  → WikiLLM search
  → useKnowledgeStore.addGlossaryTerm
  → GlossaryModal re-renders
```

---

## 5. Tests

| Test File | Tests |
|-----------|-------|
| `SecondBrainTab.test.tsx` | renders search, document list, viewer |
| `KnowledgeSearch.test.tsx` | renders input, filters by tags |
| `DocumentList.test.tsx` | renders docs, filters by search |
| `KnowledgeDoc.test.tsx` | renders document content |
| `GlossaryModal.test.tsx` | renders terms, adds term |
| `GlossaryFull.test.tsx` | renders full glossary, filters |
| `CustomKbManager.test.tsx` | adds/removes docs |
| `useKnowledgeBase.test.ts` | manages docs correctly |

**Total**: ~20 tests
