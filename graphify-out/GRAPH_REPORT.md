# Graph Report - /home/user  (2026-07-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 109 nodes · 123 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `App()` - 7 edges
3. `StoreActions` - 6 edges
4. `SchoolOrder` - 5 edges
5. `UserRole` - 4 edges
6. `UdaModel` - 4 edges
7. `lib` - 4 edges
8. `scripts` - 3 edges
9. `useCurriculumStore` - 3 edges
10. `DecisionStatus` - 3 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useCurriculumStore`  [EXTRACTED]
  src/App.tsx → src/store/useCurriculumStore.ts
- `App()` --references--> `SchoolOrder`  [EXTRACTED]
  src/App.tsx → src/types/curriculum.ts
- `StoreActions` --references--> `DecisionStatus`  [EXTRACTED]
  src/store/useCurriculumStore.ts → src/types/curriculum.ts
- `StoreActions` --references--> `SchoolOrder`  [EXTRACTED]
  src/store/useCurriculumStore.ts → src/types/curriculum.ts
- `StoreActions` --references--> `UdaModel`  [EXTRACTED]
  src/store/useCurriculumStore.ts → src/types/curriculum.ts

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (19): App(), getDisciplineIcon(), getDisciplineLabel(), orderLabelsForMap, renderObiettiviListForAccordion(), renderTraguardiListForAccordion(), curriculumKB, db (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (19): dexie, dexie-react-hooks, jsdom, lucide-react, dependencies, dexie, dexie-react-hooks, jsdom (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

## Knowledge Gaps
- **57 isolated node(s):** `name`, `short_name`, `description`, `start_url`, `display` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 3` to `Community 5`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 2` to `Community 5`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **What connects `name`, `short_name`, `description` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._