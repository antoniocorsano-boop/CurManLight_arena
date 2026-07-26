# CML-631F — Baseline di validazione 03

## Identificatore

```
CML-631F-BASELINE-03
```

## Stato

```text
CML_631F_VALIDATION_BASELINE_03_RUNTIME_VERIFIED_READY_LOCAL
```

## Branch

`fix/cml-631h-runtime-pilot-data-population`

## Commit

| Tipo | Hash |
|------|------|
| Fix | `aec39fc` |
| Test | `3517670` |
| Docs (HEAD) | `3de0801` |

## Data

2026-07-26

## Ambiente

- OS: Windows 10/11 (win32)
- Node: gestito da npm
- Test runner: Vitest 4.1.10
- Build: Vite 6.4.3
- Storybook: 10.5.3
- Browser verification: Playwright 1.61.1 (Chromium headless)

## Test

- Totali: 716
- File: 24
- CML-631G/CML-631H: 9 test di integrazione (G.1–G.9) su `PilotMainView`
- Esito: tutti passati

**Delta da baseline 02 (736 → 716)**: 20 test appartengono al progetto Storybook browser (Playwright-based), non inclusi in `vitest run` senza `--browser`. Nessun test funzionale rimosso.

## Build

- Comando: `npm run build`
- Esito: success
- Dimensione: 1,138.10 kB
- Gzip: 296.05 kB

## Storybook

- Comando: `npm run build-storybook`
- Esito: success
- Dimensione: 3,077.55 kB
- Gzip: 911.37 kB

## Verifica browser (Playwright)

Verifica eseguita con Playwright 1.61.1 (Chromium headless) sul commit `3de0801`.

| Passaggio | Risultato |
|-----------|-----------|
| Modalità disattivata → inizializzazione non disponibile | `init button disabled: true` ✓ |
| Attivazione Contributo → inizializzazione disponibile | `init button disabled: false` ✓ |
| Inizializzazione → completata senza ricaricare | init clicked, dataset created ✓ |
| Versioni | 1 ✓ |
| Segmenti | 2 (primaria + secondaria) ✓ |
| Nodi | 6/6 ✓ |
| Collegamenti | 0 (dataset iniziale vuoto) ✓ |
| Defensive path: disable → re-enable | data restored ✓ |
| Page errors | 0 ✓ |
| Console errors | 0 ✓ |

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

## Dichiarazione di immutabilità

Questa baseline è congelata al commit `3de0801` (docs-only, ultimo commit) sul branch `fix/cml-631h-runtime-pilot-data-population`.

Le modifiche rispetto alla baseline 02:
- Fix del bug di inizializzazione dataset con modalità disattivata
- Fix del test G.9 (selettore fragile)
- Aggiunta version check in `listPilotLinks`

Non sono state introdotte:
- nuove dipendenze
- telemetria o servizi remoti
- modifiche non pertinenti

La baseline `CML-631F-BASELINE-01` e `CML-631F-BASELINE-02` sono revocate.
