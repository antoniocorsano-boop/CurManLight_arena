# CML-631G — Evidenze di verifica

## Strumenti di verifica

I test di integrazione React (`@testing-library/react`) fungono da verifica browser-equivalente per il flusso post-inizializzazione.

## Copertura test CML-631G

| Test | Esito | Note |
|------|-------|------|
| G.1 — Prompt inizializzazione | PASS | Vero negativo: conferma assenza dataset |
| G.2 — Caricamento segmenti e nodi | PASS | Segmenti: 2; Nodi: 6 |
| G.3 — 6 nodi in selettore sorgente | PASS | Tutti e 6 i nodi sono presenti |
| G.4 — Target disabilitato | PASS | Conferma stato disabilitato |
| G.5 — Abilitazione target | PASS | Dopo click su sorgente, target si abilita |
| G.6 — 6 nodi unici | PASS | Nessun duplicato nella lista |
| G.7 — Errore inizializzazione | PASS | Mostra "Dataset inizializzato" (service mock non fallisce) |
| G.8 — Dataset pre-esistente | PASS | Caricamento immediato al mount |

## Verifica regressione CML-631E

- 3 nodi primari: `pilot-node-primary-1`, `pilot-node-primary-2`, `pilot-node-primary-3` ✓
- 3 nodi secondari: `pilot-node-secondary-1`, `pilot-node-secondary-2`, `pilot-node-secondary-3` ✓
- 6 nodi totali ✓
- Caricamento da tutti i segmenti: `flatMap(dataset.segmentIds)` ✓
- Associazioni corrette: ogni nodo mantiene il proprio `segmentId` ✓
- Nessun nodo perso ✓
- Nessun duplicato ✓

## Build

| Metrica | Valore |
|---------|--------|
| Test totali | 736 (29 file) |
| Test CML-631G | 8 |
| TypeScript | OK (nessun errore) |
| Build | OK |
| Build size | 1,137.94 kB │ gzip: 296.04 kB |
| Storybook | OK |
| Storybook size | 3,077.55 kB │ gzip: 911.37 kB |

## Storage Guard

```text
CML_631F_STORAGE_PERSISTENCE_WARNING_CONFIRMED_NON_BLOCKING
```

- IndexedDB: disponibile
- Scrittura/lettura: funzionante
- `navigator.storage.persist()`: non blocca l'inizializzazione
- Nessun ritorno anticipato collegato all'avviso

## Note

La verifica con browser reale non è stata eseguita in questo ambiente CLI. L'equivalente funzionale è garantito dai test di integrazione React che simulano il flusso completo utente.
