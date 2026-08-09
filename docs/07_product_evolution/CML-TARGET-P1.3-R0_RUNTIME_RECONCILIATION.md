# CML-TARGET-P1.3-R0 — Runtime Reconciliation

**Stato:** reconnaissance completata; nessuna modifica runtime  
**Branch:** `feat/cml-p1-3-curriculum-consultation`  
**Punto di partenza:** checkpoint documentale `c50208b`  
**Scope:** CURR-01..04 e continuità verso PLAN-02

## Verdetto

```text
CML_TARGET_P1_3_R0_RUNTIME_RECONCILIATION_COMPLETE
CML_TARGET_P1_3_EXISTING_CAPABILITIES_MAPPED
CML_TARGET_P1_3_MINIMAL_IMPLEMENTATION_SLICES_DEFINED
CML_TARGET_P1_3_READY_FOR_RUNTIME_IMPLEMENTATION
NO_RUNTIME_CHANGE_PERFORMED
```

## 1. Matrice runtime

| Vista | Runtime esistente | Riutilizzabile | Gap | Intervento minimo |
|---|---|---|---|---|
| CURR-01 — vigente | `CurriculumTab` + `useCurriculumStore` + `useLocalCurriculum`; dati in `CurriculumMap` legacy | layout, disciplina, contenuti locali, `setOrder` già presente nello store | nessun read model consultivo unico; versione/provenienza sono assenti nella UI; home descrive dati legacy non verificati | P1.3-A: proiezione read-only canonica con versione, ordine, disciplina e provenienza espliciti |
| CURR-02 — albero | `AlberoView` in `src/features/curriculum/components/CurriculumTab.tsx` | struttura disciplina → traguardi/obiettivi; filtri esistenti | usa array di testo e indici, non nodi canonici; nessun dettaglio selezionabile | P1.3-B: proiettare lo stesso read model e rendere selezionabile il nodo |
| CURR-03 — grafo | `MappaView` in `CurriculumTab.tsx`; oggi timeline/progressione verticale basata su testi legacy | contesto ordine/disciplina e progressione visuale | non è un grafo di `CurriculumLink`; l'adapter legacy restituisce `links: []`; non sono autorizzati edge dedotti | P1.3-D: grafo consultivo solo per link reali; stato vuoto esplicito se non ci sono relazioni |
| CURR-04 — dettaglio nodo | nessuna superficie dedicata; esistono card di liste e `selectedNodeId` generico di sessione | componenti card e stato di disciplina/ordine | mancano identità nodo, fonte, versione, relazioni, evidenze e CTA contestuale | P1.3-C: dettaglio read-only collegato al read model |
| PLAN-02 — usa nella progettazione | `executeA02ToA04Transfer` e validatori in `src/domain/design/transferA02.ts` / `src/domain/transfer/areaContracts.ts`; `ProgettazioneTab` usa selezioni per indice | contratto A02→A04 preserva nodo, versione, snapshot, fonti ed evidenze; `activeProgTab` e `setActiveProgTab` esistono | il percorso UI non invoca il contratto; la selezione attuale trasferisce testo/indici e non identità persistente del riferimento | P1.3-E: CTA dal dettaglio che passa identità/versione al planning senza duplicare il dominio |

## 2. Read model e stato di continuità

Il dominio canonico dispone già di:

- `CurriculumVersion`, `CurriculumSegment`, `CurriculumNode` e `CurriculumLink`;
- `createA02CurriculumReadModel` in `src/domain/curriculum/readModels.ts`;
- metadati di provenienza e riferimenti a versione/segmento nel modello canonico;
- `CurriculumLinkRepository` e validazione dei link.

Il percorso UI non usa però quel modello: `useLocalCurriculum` restituisce il
`CurriculumMap` legacy e `CurriculumTab` legge direttamente array di testo.
L'adapter `adaptCurriculumKB` è riutilizzabile per la proiezione e dichiara
esplicitamente `links: []`; questo rende corretto mostrare un grafo senza edge,
non creare collegamenti plausibili.

La continuità P1.3 deve quindi avere una forma esplicita equivalente a:

```text
curriculumVersionRef
→ schoolOrder
→ disciplineCode
→ curriculumNodeRef
→ segmentRef/provenance
→ classe, se disponibile
→ planning destination
```

Lo store attuale conserva `discipline`, `order` e selezioni come indici
(`selectedTraguardi`, `selectedObiettivi`) ma non una selezione curricolare
identificata. Questi indici possono restare compatibili per il planning esistente,
ma non sono sufficienti come contratto canonico di CURR-04.

## 3. File rilevanti

### File da modificare nella futura implementazione

| File | Responsabilità | Intervento previsto |
|---|---|---|
| `src/domain/curriculum/readModels.ts` | query read-only A02 | estendere la proiezione con contesto, dettaglio e relazioni reali |
| `src/features/curriculum/components/CurriculumTab.tsx` | CURR-01/02/03 | consumare una proiezione comune; introdurre selezione/dettaglio senza mutazione |
| `src/features/curriculum/components/CurriculumNodeDetail.tsx` | CURR-04 | nuovo dettaglio read-only e CTA contestuale |
| `src/features/curriculum/components/CurriculumGraphView.tsx` | CURR-03 | nuova vista solo se alimentata da link reali |
| `src/domain/design/transferA02.ts` | trasferimento A02→A04 | riutilizzare e, solo se necessario, allineare il payload al riferimento selezionato |
| `src/features/progettazione/components/ProgettazioneTab.tsx` | destinazione PLAN-02 | ricevere il riferimento senza perdere contesto |
| `src/store/useCurriculumStore.ts` | continuità di sessione | aggiungere selezione canonica solo se il contratto UI non può essere mantenuto localmente |

### Test rilevanti

| Test | Copertura |
|---|---|
| `src/__tests__/curriculum-domain/curriculum-domain.test.ts` | tipi e invarianti del dominio |
| `src/__tests__/curriculum-domain/curriculum-public-api-compatibility.test.ts` | superficie pubblica del dominio |
| `src/__tests__/curriculumBaseline.test.ts` | dati baseline |
| `src/__tests__/design-transfer-a02.test.ts` | preservazione nodo, versione, snapshot, fonti ed evidenze |
| `src/__tests__/guided-workflow-curriculum-selection.test.tsx` | selezione curricolare guidata |
| `src/__tests__/institution-integration.test.tsx` | integrazioni UI/store esistenti |
| nuovo focused test P1.3 | continuità CURR-01→02→03→04→PLAN-02 |

### Pattern riutilizzabili

| Pattern | Fonte |
|---|---|
| query read-only | `src/domain/curriculum/readModels.ts` |
| riferimenti identitari | `src/domain/curriculum/identity/` |
| transfer con snapshot e provenienza | `src/domain/design/transferA02.ts` |
| stato globale disciplina/ordine | `src/store/useCurriculumStore.ts` |
| contratti UI di sessione | `src/features/session/types/appViewContracts.ts` |

## 4. Decomposizione tecnica minima

```text
P1.3-A  read model consultivo + continuità di stato
  → P1.3-B  CURR-01 + CURR-02 dalla stessa proiezione
  → P1.3-C  CURR-04 dettaglio nodo
  → P1.3-D  CURR-03 grafo con edge reali o stato vuoto esplicito
  → P1.3-E  CURR-04 → PLAN-02 con identità/versione
  → P1.3-R1  test focused, verifica visuale e smoke umano
```

## 5. Vincoli non negoziabili

- P1.3 resta consultiva;
- nessuna proposta B3B, verifica B3C, revisione istituzionale o decisione;
- nessun edge grafo dedotto da ordine, testo o posizione visiva;
- lista, albero e grafo devono essere proiezioni dello stesso modello;
- CURR-04 deve mostrare versione, provenienza e relazioni disponibili;
- “Usa nella progettazione” non modifica il curricolo vigente;
- il transfer deve conservare identità del nodo e versione, non solo testo copiato;
- nessuna nuova dipendenza remota o nuova architettura;
- dati non disponibili devono essere dichiarati.

## 6. Rischi

- **Alto:** ricostruire un grafo visuale senza `CurriculumLink` reali.
- **Alto:** mantenere indici locali come unica identità del riferimento.
- **Medio:** mescolare nel read model contenuti legacy, proposte e vigente.
- **Medio:** introdurre il dettaglio come nuova fonte dati invece che come proiezione.
- **Basso:** riutilizzare il contratto A02→A04 già testato.

La reconnaissance non autorizza ancora modifiche a questi file. Prima deve essere
approvata la decomposizione P1.3-A…E.
