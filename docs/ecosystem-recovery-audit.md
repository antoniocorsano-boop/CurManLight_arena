# Ecosystem Recovery Audit

Data audit: 28 luglio 2026  
Account: `antoniocorsano-boop`  
Ambito: tutti i 21 repository restituiti dall’account GitHub.

## Executive Summary

La risposta basata sul codice presente è: **circa il 72% delle capacità funzionali attese per un futuro Repository Intelligence e Graph Workspace esiste già nell’ecosistema**, ma non come prodotto unico.

Il valore non misura il lavoro necessario per integrare i componenti. Misura la presenza verificata delle capacità: scoperta repository, scansione sorgenti, parsing TypeScript AST, estrazione di entità/import/export, costruzione di dependency graph, clustering, catalogazione, ricerca, cache, knowledge graph, UI di intelligence, visualizzazione React Flow, layout ELK e client MCP.

L’evidenza più forte è in `company-os`. Il file `scripts/analyze-productization.ts` non è un prototipo nominale: legge ricorsivamente il codice, usa `typescript` con `ts.createSourceFile` e `ts.forEachChild`, estrae entità, export, import, store e tabelle, valuta moduli e produce dependency graph, interazioni dati e cluster logici. `LocalRepoScanner` scopre repository reali e li passa a `RepoAnalysisEngine`; `ComponentScanner` trasforma gli insight in catalogo; `RepositoryIntelligencePanel` presenta candidati, boundary, moduli riusabili e prove tecniche.

Anche il Graph Workspace ha una base concreta in `company-os`: renderer `@xyflow/react`, mapper separato e layout `elkjs`, tutti accompagnati da test. `DocenteDocAi` contiene invece un knowledge graph TypeScript tenant-aware. `opencode` contiene ricerca ripgrep con fallback e un client MCP stdio/SSE.

La parte mancante non è soprattutto “codice di base”, ma coesione: i componenti appartengono a domini e runtime diversi. Questo audit non propone come unirli.

### Copertura osservata

| Capacità | Evidenza principale | Copertura |
|---|---|---:|
| Discovery repository/workspace | `company-os/src/local-repo/LocalRepoScanner.ts` | 80% |
| Analisi struttura e metadati | `company-os/scripts/analyze-productization.ts` | 90% |
| TypeScript AST e dipendenze | stesso analyzer | 90% |
| Catalogo componenti | `company-os/src/catalog/` | 80% |
| UI Repository Intelligence | `company-os/ui/src/components/RepositoryIntelligencePanel.tsx` | 70% |
| Graph renderer e layout | React Flow mapper + ELK | 85% |
| Knowledge graph | `DocenteDocAi/src/services/knowledgeGraph/` | 65% |
| Ricerca keyword/semantica/filesystem | Company OS + OpenCode | 65% |
| Cache | `company-os/src/llm/SemanticCache.ts` | 65% |
| MCP | `opencode/internal/llm/agent/mcp-tools.go` | 45% |

Media ponderata delle capacità osservate: **72%**.

## Metodo e limiti

Sono stati enumerati tutti i repository tramite GitHub e creati checkout shallow temporanei dei default branch. Per ogni repository non vuoto sono stati ispezionati manifest, struttura e file sorgente tracciati. Le ricerche hanno coperto i termini graph, repository/workspace/scanner, TypeScript compiler/AST, agent/workflow/orchestrator, MCP, search/vector/embedding e UI canvas/flow/tree.

I risultati sono stati aperti e letti prima della catalogazione. Sono stati esclusi come prova primaria:

- `node_modules`, build, coverage e Storybook generati;
- cache e output generati;
- semplici occorrenze nei README;
- nomi di file non sostenuti dal contenuto;
- repository vuoti.

L’audit fotografa il default branch remoto al 28 luglio 2026, salvo `CurManLight_arena`, ispezionato nel checkout locale senza modificare il codice esistente. I file locali non committati non sono stati attribuiti allo stato remoto.

## Repository analizzati

| Repository | Stack/architettura osservata | Esito per l’audit |
|---|---|---|
| `company-os` | Monorepo TypeScript/Node, CLI/API, SQLite, React/Vite UI, SDK, VS Code extension; `@xyflow/react`, `elkjs` | Fonte dominante: scanner, AST analyzer, catalogo, search, Repository Intelligence, Graph Workspace |
| `CurManLight_arena` | React 18, TypeScript, Vite, Zustand, Dexie, feature/domain modules | Modello curricolare a nodi/relazioni e artefatti Graphify; nessun renderer graph applicativo equivalente trovato |
| `curmanlight` | Più applicazioni storiche; React/Vite/Dexie e strumenti di sincronizzazione/validazione | Prevalentemente dominio e workflow curricolare; utilità repository-intelligence non emerse |
| `DocenteDocAi` | React/TypeScript con server Express, moduli cognitivi, agenti e servizi | Knowledge graph, embedding/ranking, workflow/orchestrazione; forte duplicazione con Beta |
| `DocenteDocAi_Beta` | Variante React/TypeScript di DocenteDocAi | Ampio codice hash-identico a `DocenteDocAi`, inclusi workflow, orchestratori e hook |
| `docentedoc-core` | Core TypeScript modulare | Servizi applicativi/AI; nessun motore repository o graph significativo rilevato |
| `opencode` | Go CLI/TUI, SQLite, agent tools, `mcp-go` | Ricerca filesystem/ripgrep, fuzzy file index e client MCP |
| `docentedoc_02_26` | React/Vite/TypeScript, document processing | Snapshot storico con duplicati DocenteDoc; nessuna capacità repository specifica superiore |
| `docentedoc-ai-old` | Grande snapshot storico TypeScript | Duplicati e codice storico; utile come provenienza, non come fonte primaria |
| `Curriculum-Manager` | Applicazione web curricolare legacy | Dominio applicativo; nessun componente target rilevante |
| `SchoolDocs` | Applicazione HTML/JS di documentazione scolastica | Nessun componente target sostanziale |
| `SchoolDocsAI` | React 19/Vite/TypeScript, Dexie, Gemini | Servizi AI e persistence applicativa; nessun repository scanner/graph workspace |
| `SchoolDocsDev` | Repository sostanzialmente vuoto | Nessun codice analizzabile |
| `human-work-os` | Documenti e scaffolding leggero | Nessun componente target implementato |
| `DocentOS` | PWA HTML/JS, Dexie, Chart.js | Nessun componente target |
| `UTI-AI` | React/TypeScript, Express, PostgreSQL/pgvector, Python agent engine | Vector infrastructure applicativa; non repository intelligence |
| `TrafficAI` | React/TypeScript, Express, SQLite, map UI | Nessun componente target |
| `GeoEngineAI` | React/TypeScript, Express, Postgres, geospatial stack | Parser e pipeline geospaziali non pertinenti al repository graph |
| `manus-github-test` | Repository vuoto/test | Nessun codice analizzabile |
| `DocenteDocAiCore` | Repository vuoto | Nessun codice analizzabile |
| `OrarioDoc` | PWA JavaScript | Nessun componente target |

Nota: l’elenco GitHub contiene 21 repository unici. La tabella raggruppa le varianti storiche; `SchoolDocsAI` non introduce una seconda fonte oltre a quella descritta.

## Componenti recuperati

### 1. Analyzer strutturale e TypeScript AST

**Repository:** `company-os`  
**File:** `scripts/analyze-productization.ts`  
**Responsabilità:** inventario ricorsivo; classificazione file; parsing TS/TSX/JS; entità, export, import e dipendenze; store e SQL; scoring; dependency graph, data interactions e logical clusters; report compact/enriched.  
**Dipendenze:** `node:fs/promises`, `node:path`, TypeScript Compiler API.  
**Riuso:** **92% — riutilizzabile direttamente**.  
**Motivazione:** è il nucleo più vicino a Repository Intelligence e produce già dati strutturati. L’accoppiamento principale è alle categorie e agli score Company OS.

### 2. Scanner di repository locali

**Repository:** `company-os`  
**File:** `src/local-repo/LocalRepoScanner.ts`  
**Responsabilità:** rileva `.git` nella root e nei figli immediati, analizza i candidati in parallelo, legge feature README e dipendenze note da `package.json`.  
**Dipendenze:** filesystem Node, `RepoAnalysisEngine`.  
**Riuso:** **78% — richiede refactoring**.  
**Motivazione:** comportamento reale e testato, ma profondità di discovery limitata ai figli immediati e fallback “simulato” specifico del prodotto.

### 3. Catalogazione componenti

**Repository:** `company-os`  
**File:** `src/catalog/ComponentScanner.ts`, `CatalogStore.ts`, `types.ts`  
**Responsabilità:** converte insight in prodotti rilevati, assegna tipo/maturità/capability, genera ID stabili SHA-256 e persiste in SQLite.  
**Dipendenze:** `LocalRepoScanner`, `better-sqlite3`, cache paths Company OS.  
**Riuso:** **72–82% — richiede refactoring**.

### 4. UI Repository Intelligence

**Repository:** `company-os`  
**File:** `ui/src/components/RepositoryIntelligencePanel.tsx`  
**Responsabilità:** mostra candidati ordinati, boundary di estrazione, moduli/dipendenze/store/tabelle, cluster e prove tecniche; supporta intent matching deterministico.  
**Dipendenze:** React, hook/API Company OS, i18n, guided experience e capability gates.  
**Riuso:** **68% — richiede refactoring**.  
**Motivazione:** la superficie esiste davvero, ma è fortemente integrata nel modello UI Company OS.

Componenti adiacenti letti: `RepoNavigator.tsx`, `SourceInspectorPanel.tsx`, `FileTreeView.tsx`, `FolderBrowser.tsx`.

### 5. Graph Workspace React Flow

**Repository:** `company-os`  
**File:** `ui/src/components/OperatingGraphReactFlowView.tsx`  
**Responsabilità:** renderer read-only con nodi custom, status, decision gate, accessibilità, fit view, controls e reduced motion.  
**Dipendenze:** React, `@xyflow/react`, mapper e layout.  
**Riuso:** **84% — richiede refactoring**.

**File:** `ui/src/components/operatingGraphReactFlowMapper.ts`  
**Responsabilità:** mapping di nodi/archi di dominio, semantica edge, feedback, gating ed enfasi.  
**Riuso:** **88% — richiede refactoring**.

**File:** `ui/src/components/operatingGraphElkLayout.ts`  
**Responsabilità:** layout layered verso destra con ELK e fallback deterministico.  
**Riuso:** **90% — riutilizzabile direttamente**.

I tre componenti hanno test dedicati.

### 6. Knowledge retrieval e search

**Repository:** `company-os`  
**File:** `src/knowledge/knowledgeRetrieval.ts`  
**Responsabilità:** parsing note, ranking deterministico, filtri access/freshness, citazioni e policy.  
**Riuso:** **86% — riutilizzabile direttamente**.

**File:** `src/llm/SemanticCache.ts`  
**Responsabilità:** cache semantica in-memory con vettori lessicali hashati, cosine similarity, TTL e LRU.  
**Riuso:** **76% — richiede refactoring**.

**File:** `src/actions/semanticSearch.action.ts`, `keywordSearch.action.ts`, `src/core/ai/vector.store.ts`  
**Responsabilità:** ricerca embedding con fallback keyword su store JSON.  
**Riuso:** **52% — richiede refactoring**; lo store usa un path globale e persistenza sincrona.

### 7. Knowledge graph

**Repository:** `DocenteDocAi`  
**Percorso:** `src/services/knowledgeGraph/`  
**Responsabilità:** tipi di grafo, store, linking engine, pipeline di ingestione e separazione tenant.  
**Dipendenze:** servizi knowledge/tenant DocenteDoc e bridge enterprise/scolastici.  
**Riuso:** **63% — richiede refactoring**.  
**Motivazione:** dominio implementato e consumato da più bridge, ma modellato su entità scolastiche DocenteDoc.

### 8. Ricerca filesystem

**Repository:** `opencode`  
**File:** `internal/llm/tools/grep.go`  
**Responsabilità:** tool agentico di ricerca con ripgrep, fallback regex, include glob, limite e metadati di truncation.  
**Riuso:** **58% — richiede refactoring**.

**File:** `internal/completions/files-folders.go`  
**Responsabilità:** enumerazione/fuzzy lookup con catena ripgrep + fzf, ripgrep-only, fzf-only e doublestar.  
**Riuso:** **46% — solo ispirazione**, perché dipende dal runtime Go/TUI.

### 9. MCP

**Repository:** `opencode`  
**File:** `internal/llm/agent/mcp-tools.go`  
**Responsabilità:** initialize/list/call MCP, tool wrapping, permission checks, trasporto stdio e SSE.  
**Dipendenze:** `mcp-go`, config e permission service OpenCode.  
**Riuso:** **48% — solo ispirazione** per un consumer TypeScript, ma implementazione completa nel proprio runtime.

### 10. Artefatti graph CurManLight

**Repository:** `CurManLight_arena`  
**Percorso:** `graphify-out/`  
**Responsabilità:** `graph.json`, `graph.html`, indice e cache AST generati.  
**Riuso:** **20% — solo ispirazione/evidenza**.  
**Motivazione:** gli artefatti confermano una precedente analisi di grafo, ma nell’albero applicativo ispezionato non è presente il generatore riutilizzabile; non sono quindi conteggiati come motore esistente.

## Componenti duplicati

La scansione SHA-256 dei file sorgente tracciati mostra una duplicazione estesa, non solo somiglianza, tra `DocenteDocAi` e `DocenteDocAi_Beta`. Esempi hash-identici:

- `src/core/workflows/WorkflowEngine.ts`
- `WorkflowExecutor.ts`
- `WorkflowRegistry.ts`
- `src/modules/orchestration/CognitiveOrchestrator.ts`
- `TaskPlanner.ts`
- `AgentManager.ts`
- `src/hooks/usePersistence.ts`
- `src/integrations/chat/actionRouter.ts`

Duplicati identici su quattro repository (`docentedoc-ai-old`, `DocenteDocAi`, `DocenteDocAi_Beta`, `docentedoc_02_26`):

- `constants/systemManual.ts`
- `scripts/generate-docs.mjs`
- `service-worker.js` in percorsi equivalenti

Duplicazioni funzionali, non hash-identiche:

- ricerca: retrieval Company OS, semantic/keyword search Company OS, grep/fuzzy search OpenCode;
- cache: `SemanticCache` Company OS e servizi memory/embedding DocenteDoc;
- graph model: operating graph Company OS, knowledge graph DocenteDoc, curriculum node/link CurManLight;
- orchestrazione: Company OS planner/Jarvis e numerosi engine/workflow DocenteDoc.

## Possibili librerie condivise

Questa sezione registra soltanto boundary già osservabili nel codice.

| Nome descrittivo | Origine | Utilizzatori già osservati | Vantaggio dell’estrazione |
|---|---|---|---|
| Repository analysis core | `company-os` analyzer + analysis/local-repo | CLI/script, catalogo, UI Repository Intelligence | Unica sorgente per facts AST, dependency edges e scoring già consumati internamente |
| Graph projection UI | `company-os` renderer/mapper/layout | `OperatingGraphView`, preview harness, test | I tre livelli sono già separati e testati |
| Knowledge retrieval core | `company-os/src/knowledge` | knowledge/Jarvis bridge e test | Funzioni pure di ranking, citazioni e policy |
| Tenant knowledge graph domain | `DocenteDocAi/src/services/knowledgeGraph` | agenti enterprise e bridge scolastici | Modello già condiviso tra consumer reali |
| Repository search adapters | `opencode` grep/glob/completions | agent tools e completion provider | Fallback filesystem già implementati, pur legati a Go |

## Opportunità

Le opportunità di recupero, non di nuova implementazione, sono:

1. recuperare `analyze-productization.ts` come prova che l’analisi AST e il dependency graph esistono già;
2. recuperare la catena `LocalRepoScanner` → `RepoAnalysisEngine` → `ComponentScanner` → `CatalogStore`;
3. recuperare il pannello Repository Intelligence e le superfici Repo Navigator/Source Inspector come precedenti UI concreti;
4. recuperare insieme renderer, mapper e layout del grafo Company OS;
5. recuperare il knowledge graph DocenteDoc come modello distinto dal dependency graph;
6. usare OpenCode come precedente verificato per ripgrep/fallback e MCP, senza confonderne il runtime Go con quello TypeScript;
7. trattare le varianti DocenteDoc come una famiglia fortemente duplicata, evitando di conteggiare gli stessi componenti più volte.

## Matrice finale

| Repository | Componente | Riuso | Priorità |
|---|---|---:|---|
| company-os | `scripts/analyze-productization.ts` | 92% | Critica |
| company-os | `LocalRepoScanner` | 78% | Alta |
| company-os | catalog scanner/store | 82% / 72% | Alta |
| company-os | Repository Intelligence Panel | 68% | Alta |
| company-os | React Flow renderer | 84% | Critica |
| company-os | graph mapper | 88% | Critica |
| company-os | ELK layout | 90% | Critica |
| company-os | knowledge retrieval | 86% | Alta |
| company-os | semantic cache/search | 76% / 52% | Media |
| DocenteDocAi | knowledge graph services | 63% | Alta |
| opencode | ripgrep/regex search tool | 58% | Media |
| opencode | file/folder fuzzy index | 46% | Media |
| opencode | MCP client stdio/SSE | 48% | Media |
| CurManLight_arena | Graphify artifacts | 20% | Bassa |
| DocenteDocAi_Beta | componenti duplicati da DocenteDocAi | n/a | Bassa come fonte primaria |
| altri repository | nessun componente target superiore verificato | 0–25% | Bassa |

## Conclusione

**Repository Intelligence non parte da zero: la maggioranza delle sue capacità tecniche esiste già, soprattutto in `company-os`.** Il Graph Workspace ha già un’implementazione React Flow/ELK concreta e testata. Knowledge graph, ricerca filesystem e MCP esistono in repository separati.

La stima finale è **72% di capacità già presenti**, con tre cautele oggettive:

- “presente” non significa “integrabile senza adattamento”;
- una parte del codice è accoppiata al dominio Company OS o DocenteDoc;
- le varianti DocenteDoc contengono molte copie identiche e non aumentano la copertura reale.

I dati macchina dell’audit sono in `.ecosystem-audit/catalog.json`, `dependency-map.json`, `graph-components.json`, `reusable-components.json` e `duplicate-components.json`.
