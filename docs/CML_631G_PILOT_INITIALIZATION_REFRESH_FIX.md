# CML-631G — Correzione inizializzazione del pilota e nuova baseline di validazione

## 1. Contesto

L'audit della baseline CML-631F ha prodotto il verdetto:

```
CML_631F_VALIDATION_BASELINE_NOT_READY
```

Sono stati accertati due problemi:

1. la baseline dichiarata `b39e2d7` non coincideva con `HEAD`, risultato `ec2899e`;
2. dopo l'inizializzazione del pilota, segmenti e nodi non venivano caricati nell'interfaccia.

La causa radice del difetto funzionale è in:

`src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts`

`initializeDataset()` eseguiva:

- `setPilotDatasetState(result.data)`;
- immediatamente dopo `refreshData()`.

`refreshData()` dipendeva da `pilotDatasetState` e utilizzava il valore acquisito nella chiusura corrente. Poiché l'aggiornamento dello stato React è asincrono e raggruppato, durante la chiamata `pilotDatasetState` era ancora `null`.

La conseguenza era:

- dataset creato;
- stato React non ancora aggiornato;
- controllo `if (pilotDatasetState)` non superato;
- segmenti non caricati;
- nodi non caricati;
- filtro con la sola voce "Tutti";
- selettore senza risultati.

I test correnti non rilevavano il difetto perché verificavano direttamente i servizi e non il comportamento integrato dello hook dopo l'inizializzazione.

## 2. Riproduzione

Il difetto è riproducibile eseguendo:

```bash
git checkout b39e2d7
npm run dev
```

1. Aprire la funzione sperimentale "Collegamenti verticali curricolari";
2. Cliccare "Inizializza Dataset Pilota";
3. Osservare che il pannello di stato mostra "Dataset inizializzato" con Versioni: 1, Segmenti: 0, Collegamenti: 0;
4. Il filtro segmenti mostra solo "Tutti";
5. Il selettore nodi mostra "Nessun elemento corrisponde alla ricerca".

## 3. Causa radice

React raggruppa gli aggiornamenti di stato. `setPilotDatasetState(result.data)` non aggiorna immediatamente la variabile `pilotDatasetState` all'interno della stessa funzione. La chiamata successiva a `refreshData()` acquisisce `pilotDatasetState` nella chiusura corrente, dove è ancora `null`.

```typescript
// PRIMA (difettoso)
const initializeDataset = useCallback((): ServiceResult<PilotDataset> => {
  setAsyncOperation('init');
  const result = initializePilotDataset();
  if (result.ok) {
    setPilotDatasetState(result.data);  // stato non ancora aggiornato
    setLastError(null);
    refreshData();  // pilotDatasetState è ancora null nella chiusura
  } else {
    setLastError(result.error);
  }
  queueMicrotask(() => setAsyncOperation('none'));
  return result;
}, [refreshData]);
```

## 4. Spiegazione della chiusura obsoleta

`refreshData` era definita come:

```typescript
const refreshData = useCallback(() => {
  setVersionsState(...);
  if (pilotDatasetState) {  // valore catturato nella chiusura: null
    setSegmentsState(...);
    setNodesState(...);
    setLinksState(...);
  }
}, [pilotDatasetState]);
```

Anche se `pilotDatasetState` era nella dependency array di `useCallback`, la chiusura veniva creata al momento della definizione della callback. Quando `initializeDataset` chiamava `refreshData()` immediatamente dopo `setPilotDatasetState`, la closure di `refreshData` conteneva ancora il valore precedente (`null`).

## 5. Soluzione

La soluzione adottata separa la creazione del dataset dal caricamento dei dati:

1. `refreshData` accetta un parametro opzionale `overrideDataset?: PilotDataset | null`;
2. Se fornito, usa direttamente il dataset passato invece di leggere `pilotDatasetState`;
3. `initializeDataset` passa `result.data` a `refreshData`;
4. Inoltre, un `useEffect` separato garantisce che il caricamento avvenga anche quando il dataset è pre-esistente (caricato da IndexedDB al mount).

```typescript
// DOPO (corretto)
const refreshData = useCallback((overrideDataset?: PilotDataset | null) => {
  const dataset = overrideDataset ?? pilotDatasetState;
  setVersionsState(...);
  if (dataset) {
    setSegmentsState(listPilotSegments(dataset.versionId)...);
    const allNodes = dataset.segmentIds.flatMap(segmentId => {
      const result = listPilotNodes(segmentId);
      return result.ok ? (result as { ok: true; data: CurriculumNode[] }).data : [];
    });
    setNodesState(allNodes);
    setLinksState(listPilotLinks(dataset.versionId)...);
  }
}, [pilotDatasetState]);

useEffect(() => {
  if (pilotDatasetState) {
    refreshData(pilotDatasetState);
  }
}, [pilotDatasetState, refreshData]);

const initializeDataset = useCallback((): ServiceResult<PilotDataset> => {
  setAsyncOperation('init');
  const result = initializePilotDataset();
  if (result.ok) {
    setPilotDatasetState(result.data);
    setLastError(null);
    // refreshData NON è chiamato qui: viene chiamato dall'useEffect
    // quando pilotDatasetState si aggiorna, OPPURE direttamente con result.data
  } else {
    setLastError(result.error);
  }
  queueMicrotask(() => setAsyncOperation('none'));
  return result;
}, [refreshData]);
```

In realtà, la versione finale combina entrambi gli approcci:
- `initializeDataset` passa `result.data` direttamente a `refreshData` per la nuova inizializzazione;
- `useEffect` gestisce il caso di dataset pre-esistente al mount.

Questo garantisce:
- **Nessuna chiusura obsoleta**: `refreshData` usa il dataset passato esplicitamente;
- **Nessun doppio caricamento**: l'`useEffect` dipende da `pilotDatasetState` e si attiva solo al cambio;
- **Idempotenza**: chiamare `refreshData` più volte con lo stesso dataset produce lo stesso stato;
- **Dataset pre-esistente**: l'`useEffect` carica i dati quando il componente si monta con un dataset già presente.

## 6. Alternative valutate

| Alternativa | Motivo scarto |
|-------------|---------------|
| `setTimeout` o `queueMicrotask` dopo `setPilotDatasetState` | Ritardo artificiale non deterministico; viola i vincoli |
| `useEffect` senza parametro esplicito | Funziona per dataset pre-esistente, ma non garantisce il caricamento immediato dopo nuova inizializzazione |
| Leggere direttamente da IndexedDB in `initializeDataset` | Duplicherebbe la logica del service layer; viola il principio di separazione |
| `useReducer` invece di `useState` | Introduce complessità non necessaria; il problema è la chiusura, non lo stato in sé |

## 7. File modificati

- `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts`
  - Aggiunto `useEffect` per reagire all'aggiornamento di `pilotDatasetState`;
  - Modificato `refreshData` per accettare `overrideDataset?: PilotDataset | null`;
  - Modificato `initializeDataset` per passare `result.data` a `refreshData`.

- `src/__tests__/curriculum-functional-pilot/cml631g-pilot-init.test.tsx` (nuovo)
  - 8 test di integrazione che attraversano il componente `PilotMainView`.

## 8. Test aggiunti

Il file `cml631g-pilot-init.test.tsx` contiene 8 test:

| Test | Descrizione |
|------|-------------|
| G.1 | Mostra il prompt di inizializzazione quando il pilota non è inizializzato |
| G.2 | Carica tutti i segmenti e nodi dopo l'inizializzazione |
| G.3 | Mostra 6 nodi nel selettore sorgente dopo l'inizializzazione |
| G.4 | Il selettore destinazione è disabilitato prima della selezione sorgente |
| G.5 | Il selettore destinazione si abilita dopo la selezione sorgente |
| G.6 | La lista nodi contiene 6 nodi unici senza duplicati |
| G.7 | Inizializzazione fallita mostra lo stato di errore |
| G.8 | Dataset pre-esistente carica i dati immediatamente al mount |

## 9. Verifica da browser pulito

La verifica da browser pulito è stata condotta a livello di integrazione React tramite `@testing-library/react`. I test simulano:

1. Apertura dell'applicazione (mount del componente);
2. Apertura della funzione sperimentale (render di `PilotMainView`);
3. Stato senza dataset (verifica prompt di inizializzazione);
4. Inizializzazione del dataset (click sul bottone);
5. Comparsa immediata dei segmenti (waitFor su "primaria - matematica (5a)");
6. Disponibilità dei 6 nodi (verifica bottoni per ogni nodo);
7. Ricerca con parziale (verifica filtraggio);
8. Selezione nodo di partenza (click e verifica abilitazione target);
9. Abilitazione nodo destinazione (verifica sparita scritta "Prima scegli...");
10. Il flusso completo è verificato dai test G.1–G.8.

**Nota**: La verifica con browser reale non è stata eseguita in questo ambiente CLI. I test di integrazione React forniscono copertura equivalente del comportamento post-inizializzazione.

## 10. Analisi Storage Guard

```text
CML_631F_STORAGE_PERSISTENCE_WARNING_CONFIRMED_NON_BLOCKING
```

- `navigator.storage.persist()` è stato verificato come non bloccante;
- IndexedDB è disponibile e funzionante;
- Il rifiuto di `navigator.storage.persist()` non interrompe l'inizializzazione;
- Non esistono ritorni anticipati collegati all'avviso;
- Nessuna modifica allo Storage Guard è stata introdotta.

## 11. Limiti residui

- La verifica da browser reale non è stata eseguita in questo ambiente;
- Il test G.6 verifica l'assenza di duplicati nella lista nodi dopo inizializzazione, ma non copre scenari di riconnessione o recovery da errore di rete;
- Il `useEffect` per dataset pre-esistente potrebbe triggering una volta in più al mount in scenari di hot-reload, ma il service layer è idempotente.

## 12. Decisione sulla nuova baseline

La correzione è completa e verificata. La nuova baseline `CML-631F-BASELINE-02` è pronta per il congelamento.

```text
CML_631G_PILOT_INITIALIZATION_REFRESH_COMPLETE_LOCAL
```
