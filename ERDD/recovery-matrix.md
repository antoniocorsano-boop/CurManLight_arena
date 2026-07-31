# ERDD Recovery Matrix

La matrice normativa completa e machine-readable è in `recovery-matrix.json`. Ogni riga seguente rappresenta un singolo componente o una singola capacità mancante.

## Risultato

| ID | Componente | Sorgente | Score | Gate | Classificazione | Confidence | Core |
|---|---|---|---:|---|---|---|---|
| C01 | Repository Intelligence metadata contracts | company-os | 85 | — | Adapt | Alta | Sì |
| C02 | Local repository scanner | company-os | 85 | — | Adapt | Alta | Sì |
| C03 | Repository module analysis | company-os | 67 | — | Adapt | Alta | Sì |
| C04 | Live Repository Intelligence engine | company-os | 68 | — | Adapt | Alta | Sì |
| C05 | TypeScript AST productization analyzer | company-os | 55 | G3 | Reference | Alta | Sì |
| C06 | Component catalog mapper | company-os | 54 | — | Reference | Alta | No |
| C07 | Catalog persistence | company-os | 68 | — | Adapt | Media | Sì |
| C08 | Operating graph projection model | company-os | 80 | — | Adapt | Alta | Sì |
| C09 | React Flow graph mapper | company-os | 72 | — | Adapt | Alta | No |
| C10 | ELK graph layout | company-os | 86 | — | Adapt | Alta | Sì |
| C11 | React Flow operating surface | company-os | 60 | — | Adapt | Alta | No |
| C12 | Knowledge retrieval core | company-os | 91 | — | **Extract** | Alta | No |
| C13 | Semantic cache | company-os | 94 | G3 | Reference | Alta | No |
| C14 | JSON vector semantic search | company-os | 49 | G3 | Reference | Alta | Sì |
| C15 | DocenteDoc knowledge graph contracts | DocenteDocAi | 59 | — | Reference | Alta | No |
| C16 | DocenteDoc graph store | DocenteDocAi | 48 | G2 | Reference | Alta | No |
| C17 | DocenteDoc tenant graph store | DocenteDocAi | 52 | G2 | Reference | Alta | No |
| C18 | Ripgrep code-search tool | opencode | 61 | — | Adapt | Alta | Sì |
| C19 | MCP client adapter | opencode | 55 | G2 | Reference | Alta | No |
| M01 | Repository Intelligence MCP server | — | — | — | Missing | Alta | No |
| M02 | Tested reusable AST analyzer API | — | — | — | Missing | Alta | Sì |

## Decision log sintetico

### C02 — Local repository scanner: Adapt

Evidenza positiva:

- classe esportata;
- sei consumer reali;
- test dedicati;
- I/O read-only.

Motivo dell’adattamento:

- restituisce `RepoInsights` Company OS;
- delega a un analyzer con capability/product taxonomy;
- limita la discovery ai figli immediati;
- genera risultati simulati per path mancanti.

### C04 — Live Repository Intelligence engine: Adapt

Evidenza positiva:

- API di classe usata dalle route;
- test con filesystem temporaneo;
- verifica dipendenze, store, tabelle, cache e stabilità dello scoring;
- root cache iniettabile.

Motivo dell’adattamento:

- cluster e score sono product-oriented;
- limiti e probe directory sono costanti;
- gli import live sono estratti con regex;
- unisce scanning, facts, scoring, clustering e cache.

### C05 — AST analyzer: Reference

Evidenza positiva:

- usa davvero `ts.createSourceFile` e `ts.forEachChild`;
- estrae entità, export, import, store, SQL e dependency edges;
- produce snapshot strutturati già consumati.

Limite decisivo:

- le funzioni non sono esportate;
- non esistono test dedicati;
- scoring e categorie Company OS sono nello stesso file;
- G3 limita la classificazione a Reference.

L’AST non è “assente”; è assente il suo boundary riutilizzabile e testato, registrato come M02.

### C10 — ELK layout: Adapt

È il candidato grafico più vicino a Extract: funzione esportata, testata, senza I/O. Rimane Adapt perché:

- accetta direttamente tipi React Flow;
- tratta `decision` con altezza speciale;
- il fallback usa ID fissi dell’Operating Graph.

### C12 — Knowledge retrieval: Extract

È l’unico componente che supera tutti i requisiti:

- funzioni pure;
- consumer reale;
- test dedicati;
- nessun I/O;
- nessuna dipendenza esterna;
- API esplicita.

Il contratto delle note è specifico, ma costituisce configurazione semantica circoscritta, non accoppiamento strutturale al prodotto.

### C13 — Semantic cache: Reference nonostante 94

È tecnicamente generico, configurabile e testato. Non è però usato da alcun consumer di produzione trovato. G3 impedisce di dichiararlo Extract sulla sola qualità interna.

### C15–C17 — Knowledge graph DocenteDoc: Reference

Il codice ha consumer reali, ma:

- i tipi modellano studente, classe, valutazione e documento;
- gli store usano `localStorage`;
- `graphStore` ha stato globale mutabile;
- `tenantGraph` mantiene una cache globale;
- non sono stati trovati test dedicati.

### C18 — Ripgrep search: Adapt

È il precedente più maturo per code search:

- 11 commit tra marzo e luglio 2025;
- consumer reale nel tool registry;
- ricerca read-only;
- fallback senza ripgrep.

Richiede adattamento perché l’API, la configurazione e le risposte appartengono al runtime Go di OpenCode.

### C19 e M01 — MCP

`opencode` prova l’esistenza di un **client MCP**, non di un server Repository Intelligence. Il client è accoppiato a permission/config/tool contracts OpenCode e usa una cache globale. Il server rimane **Missing**.

## Core minimo validato

Il core minimo è confermato come insieme di capacità, ma non ancora come insieme di librerie Extract:

1. Metadata & dependency contracts — C01, Adapt
2. Repository discovery — C02/C03, Adapt
3. Source/AST facts — C05 Reference + M02 Missing
4. Metadata index/persistence — C07, Adapt
5. Code search — C18, Adapt
6. Graph projection/layout — C08/C10, Adapt

Il risultato più importante è negativo ma utile: **il core non contiene oggi cinque componenti immediatamente estraibili**. Contiene boundary adattabili e un gap preciso, M02.
