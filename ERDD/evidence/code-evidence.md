# ERDD Code Evidence

## Scope

Repository con componenti candidati:

- `company-os`
- `DocenteDocAi`
- `opencode`

Sono stati letti i file sorgente, non soltanto README o nomi. `node_modules`, build, coverage, vendor, cache e artefatti generati sono stati esclusi.

## Evidence checks

### Symbols and consumers

Le occorrenze sono state cercate con `rg -F` sui file sorgente. Consumer principali verificati:

- `LocalRepoScanner`: sei superfici tra CLI, route, orchestrator, skill e catalogo;
- `RepoAnalysisEngine`: scanner, Repository Intelligence, workspace e CLI;
- `OperatingGraphProjection`: mapper React Flow, source inspector, exporter Obsidian e test;
- `retrieveKnowledge`: `jarvisKnowledgeContextBridge`;
- `getTenantGraph`: `schoolInsights`;
- OpenCode `GetMcpTools`: root command e agent tool registry.

Nessun consumer di produzione è stato trovato per `SemanticCache` o `semanticSearch.action`.

### Tests

Test dedicati verificati:

- `LocalRepoScanner.test.ts`
- `RepoAnalysisEngine.test.ts`
- `RepositoryIntelligenceEngine.test.ts`
- `operatingGraphProjection.test.ts`
- `operatingGraphReactFlowMapper.test.ts`
- `operatingGraphElkLayout.test.ts`
- `OperatingGraphReactFlowView.test.tsx`
- `knowledgeRetrieval.test.ts`
- `SemanticCache.test.ts`

Non sono stati trovati test dedicati per:

- AST analyzer script;
- ComponentScanner;
- DocenteDoc knowledge graph;
- OpenCode grep/MCP nei file del fork ispezionato;
- Company OS vector search.

### I/O

- Scanner Company OS: read-only filesystem.
- RepositoryIntelligenceEngine: filesystem reads e cache JSON sotto `rootDir/data/cache`.
- AST analyzer: filesystem reads e report/snapshot writes configurati da CLI.
- CatalogStore: SQLite, path configurabile.
- SemanticCache: memoria.
- Vector store: `./data/vector-store.json` hardcoded, sync.
- DocenteDoc graph stores: localStorage e singleton/cache globali.
- OpenCode grep: process execution/read-only walk.
- OpenCode MCP: stdio/SSE e cache package-level.

### History

I tre checkout sono stati convertiti da shallow a cronologia completa prima del conteggio. I dati puntuali sono in `stability-evidence.json`.

### License

- OpenCode: MIT LICENSE presente.
- Company OS: manifest `license: MIT`, LICENSE root assente.
- DocenteDocAi: LICENSE root assente.

## Reproducibility

I dati strutturati sono:

- `../recovery-matrix.json`
- `dependency-graph.json`
- `stability-evidence.json`

La roadmap riporta solo dipendenze presenti in `dependency-graph.json` o gap esplicitamente marcati come Missing.
