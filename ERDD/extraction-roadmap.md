# ERDD Extraction Roadmap

Questa roadmap non progetta l’architettura futura e non autorizza implementazioni. Ordina esclusivamente i boundary osservati usando:

1. dependency graph;
2. ordinamento topologico;
3. appartenenza al core;
4. classificazione;
5. consumer/test disponibili come validatori.

## Regola di derivazione

Un componente appare prima dei propri consumer. I componenti Reference non vengono indicati come “da estrarre”: diventano punti di validazione o gap. Gli adapter/superfici vengono dopo il core.

## Roadmap derivata

| Fase | Prerequisiti | Componente | Stato ERDD | Azione analiticamente consentita | Esito verificabile |
|---|---|---|---|---|---|
| E0 | — | C01 Metadata contracts | Adapt | Delimitare i tipi generici dai tipi candidate/product | Contratto core candidato isolato sulla carta |
| E1 | E0 | C03 Repository module analysis | Adapt | Separare discovery facts da capability/product taxonomy | Boundary scanner/analyzer esplicito |
| E2 | E1 | C02 Local repository scanner | Adapt | Verificare sostituzione di `RepoInsights` e simulation behavior | Discovery core candidata con test sorgente identificati |
| E3 | E0 | C05 + M02 AST facts/API | Reference + Missing | Usare C05 come evidenza per definire il gap M02 | Elenco esatto dei facts AST già implementati e di quelli senza API/test |
| E4 | E0,E2,E3 | C04 Live Repository Intelligence engine | Adapt | Separare facts, score, cluster e cache nelle responsabilità osservate | Boundary del motore documentato, non implementato |
| E5 | E0 | C07 Catalog persistence | Adapt | Mappare schema `DetectedProduct` contro metadata core | Delta schema e I/O documentati |
| E6 | E0 | C18 Code search | Adapt | Mappare ToolCall/Response OpenCode contro un contratto search neutro | Dipendenze runtime Go esplicitate |
| E7 | E0 | C08 Graph projection | Adapt | Distinguere grafo generico da operating phases/status | Delta del projection model documentato |
| E8 | E7 | C10 ELK layout | Adapt | Isolare node sizing e fallback IDs specifici | Layout boundary candidato |
| E9 | E7 | C09 React Flow mapper | Adapt | Mappare semantica operating su input generico | Adapter UI candidato |
| E10 | E8,E9 | C11 React Flow surface | Adapt | Inventariare copy, node types e policy read-only specifiche | Superficie opzionale delimitata |
| E11 | E4,E6 | M01 MCP server | Missing | Confermare soltanto il contratto di esposizione necessario | Gap MCP server invariato finché non autorizzato sviluppo |

## Componenti esclusi dal percorso core

- C06 ComponentScanner: tassonomia di prodotto; Reference.
- C12 Knowledge retrieval: Extract, ma non necessario al core repository iniziale.
- C13 SemanticCache: G3, nessun consumer.
- C14 JSON vector search: Reference; non sostituisce code search/index.
- C15–C17 DocenteDoc KG: Reference di dominio.
- C19 MCP client: utile come precedente, non come server.

## Primo boundary con rapporto migliore

Secondo score e dipendenze, il primo elemento core da sottoporre a un’eventuale estrazione futura non è la UI e non è l’AST script. È **C01, Metadata contracts**, perché:

- non ha I/O;
- è prerequisito di scanner, analyzer, index e graph projection;
- ha consumer reali;
- la modifica necessaria è identificabile: rimuovere semantica product/candidate.

Questa è una conclusione della matrice, non un’autorizzazione a procedere.
