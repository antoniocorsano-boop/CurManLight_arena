# ERDD Extraction Findings

## Executive finding

Il Recovery Audit aveva dimostrato che gran parte delle capacità esiste. ERDD dimostra qualcosa di più restrittivo:

- **1 componente Extract**
- **10 componenti Adapt**
- **8 componenti Reference**
- **0 componenti Not reusable**
- **2 capacità Missing**

Il numero di componenti realmente estraibili senza modifiche sostanziali non è 14: è **1**, in base ai gate concordati.

Questo non contraddice il 72% del Recovery Audit. Il 72% misurava presenza funzionale; ERDD misura qualità del boundary di estrazione.

## Finding F1 — Due motori di analisi diversi

`company-os` contiene:

1. `scripts/analyze-productization.ts`: Compiler API, fatti strutturali ricchi, nessuna API/test indipendente;
2. `RepositoryIntelligenceEngine`: API e test reali, ma parsing live euristico/regex e scoring Company OS.

Non possono essere catalogati come un solo analyzer. La capacità AST esiste; il componente AST riutilizzabile non esiste ancora.

## Finding F2 — Lo scanner principale è Company OS

`LocalRepoScanner` è il discovery component più vicino al core. OpenCode non offre un repository scanner equivalente: offre glob, grep e file completion.

## Finding F3 — Graph Engine non coincide con React Flow

Il patrimonio grafico è composto da boundary distinti:

- projection model;
- mapper React Flow;
- ELK layout;
- React surface.

Nessuno dei quattro è Extract allo stato corrente. Il layout ELK è il più vicino (86), ma include ancora convenzioni dell’Operating Graph.

## Finding F4 — Search è frammentata

- OpenCode: code/filesystem search matura, ma runtime Go-specifico.
- Company OS: knowledge retrieval estraibile.
- Company OS vector search: path hardcoded, nessun test o consumer.
- DocenteDoc: embedding/ranking applicativi, non un code-search index.

Non esiste un singolo Search & Index già pronto per il core.

## Finding F5 — Knowledge graph non è dependency graph

Il knowledge graph DocenteDoc ha consumer reali, ma modella il dominio scolastico e persiste in browser. È prova di esperienza sul problema, non un modello condiviso immediatamente recuperabile per repository dependencies.

## Finding F6 — MCP server realmente mancante

OpenCode implementa un client MCP stdio/SSE. Non è stato trovato un server che esponga repository, metadata, search o graph resources. M01 è quindi Missing con confidenza alta.

## Finding F7 — Stability Evidence

Le evidenze più forti:

- OpenCode grep: 11 commit e consumer reale, fermo da oltre un anno;
- OpenCode MCP client: 10 commit e due consumer;
- LocalRepoScanner/RepoAnalysisEngine: test e più consumer, basso churn;
- graph components: test estesi ma introdotti e modificati in una finestra di un solo giorno;
- knowledge retrieval: test e consumer, ma modificato fino al 7 luglio 2026;
- DocenteDoc knowledge graph: più consumer, ma un solo commit e nessun test dedicato.

Il basso churn dei componenti giovani non viene interpretato come prova sufficiente di stabilità.

## Finding F8 — Licenze

OpenCode è MIT. Company OS dichiara MIT nel manifest ma non espone un LICENSE root. DocenteDocAi non espone un LICENSE root. Non è stata rilevata incompatibilità; prima di distribuire codice estratto da Company OS o DocenteDocAi serve comunque verifica della provenienza/licenza.

## Exit Criteria

| Criterio | Stato |
|---|---|
| Tutti i candidati classificati | Completato |
| Evidenze, score e gate per ogni classificazione | Completato |
| Core minimo identificato | Completato |
| Dependency graph completato | Completato |
| Roadmap derivata dal grafo | Completato |
| Capacità mancanti validate | Completato: M01 e M02 |

ERDD è quindi chiusa come attività di analisi. Non autorizza né include estrazioni o refactoring.
