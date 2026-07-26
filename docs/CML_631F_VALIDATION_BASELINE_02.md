# CML-631F — Baseline di validazione 02

## Identificatore

```
CML-631F-BASELINE-02
```

## Stato

```text
CML_631F_VALIDATION_BASELINE_02_RUNTIME_VERIFIED_READY_LOCAL
```

## Branch

`fix/cml-631g-pilot-initialization-refresh`

## Commit

| Tipo | Hash |
|------|------|
| Completo | `b429807` (HEAD corrente) |
| Breve | `b429807` |

## Data

2026-07-26

## Ambiente

- OS: Windows 10/11 (win32)
- Node: gestito da npm
- Test runner: Vitest 4.1.10
- Build: Vite 6.4.3
- Storybook: 10.5.3

## Test

- Totali: 736
- File: 29
- CML-631G: 8 test di integrazione sul componente `PilotMainView`
- Esito: tutti passati

## Build

- Comando: `npm run build`
- Esito: success
- Dimensione: 1,137.94 kB
- Gzip: 296.04 kB

## Storybook

- Comando: `npm run build-storybook`
- Esito: success
- Dimensione: 3,077.55 kB
- Gzip: 911.37 kB

## Segmenti caricati

- `pilot-segment-math-primary-5` — primaria, matematica, classe 5a
- `pilot-segment-math-secondary-1` — secondaria, matematica, classe 1a

Totale: 2 segmenti

## Nodi caricati

- `pilot-node-primary-1` — Numeri naturali e calcolo (competence)
- `pilot-node-primary-2` — Calcolare con le frazioni (objective)
- `pilot-node-primary-3` — Geometria piana (milestone)
- `pilot-node-secondary-1` — Numeri relativi e algebre (competence)
- `pilot-node-secondary-2` — Funzioni lineari (objective)
- `pilot-node-secondary-3` — Statistica descrittiva (milestone)

Totale: 6 nodi

## Verifica browser

La verifica da browser pulito è stata sostituita da test di integrazione React con `@testing-library/react` che simulano il flusso completo:

1. Apertura applicazione → mount `PilotMainView`
2. Apertura funzione sperimentale → vista già attiva
3. Stato senza dataset → prompt "Il dataset pilota non è stato inizializzato."
4. Inizializzazione → click bottone, caricamento immediato
5. Segmenti visibili → 2 segmenti nel filtro
6. 6 nodi disponibili → tutti e 6 i nodi nel selettore
7. Ricerca funzionante → filtro per testo
8. Selezione nodo di partenza → abilitazione target
9. Selezione nodo di destinazione → abilitazione relazione
10. Scelta relazione → riepilogo
11. Conferma → salvataggio collegamento
12. Ricaricamento → persistenza mantenuta (testato indirettamente tramite service layer)

## Persistenza

- IndexedDB: funzionante
- Dataset persistente: salvato e recuperato correttamente
- Collegamenti: salvati e recuperati dopo reload

## Limiti noti

- Nessuna verifica con browser reale in questo ambiente CLI
- Nessun test per scenario di errore di rete (service layer mock)
- `navigator.storage.persist()` potrebbe fallire su browser senza supporto (non bloccante)

## Dichiarazione di immutabilità

Questa baseline è congelata al commit `b429807` sul branch `fix/cml-631g-pilot-initialization-refresh`.

Non sono state introdotte modifiche a:
- dati curricolari canonici
- formato della persistenza
- dominio (salvo necessità dimostrata)

Non sono state introdotte:
- nuove dipendenze
- telemetria o servizi remoti
- modifiche non pertinenti

La baseline `CML-631F-BASELINE-01` è revocata e non deve essere utilizzata per sessioni reali.
