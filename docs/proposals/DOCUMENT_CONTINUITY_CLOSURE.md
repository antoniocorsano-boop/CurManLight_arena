# Document Continuity — Chiusura CML-605

## Sintesi
Implementazione del registro locale essenziale delle esportazioni. Il docente puo ritrovare le ultime 5 esportazioni prodotte, comprenderne il contesto e sapere se il lavoro locale e rimasto invariato o e stato modificato.

## Obiettivo di prodotto
"Il docente puo ritrovare le ultime esportazioni prodotte, comprenderne il contesto e sapere se il lavoro locale e rimasto invariato o e stato modificato successivamente."

## Baseline
- main = origin/main = 41a16a2
- test: 167/167 PASS
- build: 784 KB

## Validazione
- Tipo: qualitativa informale
- Esito: DOCUMENT_CONTINUITY_VALIDATED_FOR_PROTOTYPE
- Mock: mocks/document-continuity/

## Implementazione
- Branch: feat/cml-605-document-continuity
- Commit documentale: 39853f5
- Nuovi file: 5 (types, utils, hook, component, test)
- File modificati: 7 (curriculum.ts, store, App.tsx, EsportazioniTab, index, AppViewsLayer, appViewContracts)

## Modello dati
DocumentExportEvent: id, documentType, format, label, sourceKind, sourceId, sourceTitle, discipline, order, classLabel, workStatus, exportedAt, sourceSignature, sourceView, coherence.

## Store
- addDocumentExportEvent(event) — max 5, testa
- clearDocumentExportHistory() — solo metadati

## Eventi
- DOC, DOCX, ODF, PDF (x2), TXT, CML, Markdown, confronto DOC

## Coerenza
- current: firma uguale
- modified: firma diversa
- unverifiable: senza sorgente

## Test
- 55 CML-605, 222 totali, 0 regressioni

## Build
- 788 KB (+4 KB), verde

## TypeScript
- 0 nuovi errori

## Perimetro
- Max 5 eventi
- Solo metadati locali
- Nessun file binario
- Nessun backend
- Nessuna nuova rotta
- Nessuna modifica a WS/KC

## Rischi residui
- La coerenza confronta lo stato locale sorgente, non il file esportato sul dispositivo
- I casi di tipo 'programmazione' o 'relazione' sono classificati unverifiable perche la sorgente e aggregata
- exportedAt e solo informazione visiva, non partecipa al confronto

## Verdetto
CML_605_DOCUMENT_CONTINUITY_READY_FOR_INTEGRATION
