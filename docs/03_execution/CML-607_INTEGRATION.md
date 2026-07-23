# CML-607 — Integrazione

## Baseline

- Repository: `C:\Users\anton\CurManLight_arena`
- Remoto: `https://github.com/antoniocorsano-boop/CurManLight_arena.git`

## Cronologia

| Campo | Valore |
|-------|--------|
| HEAD iniziale main | `be3ddb9` |
| HEAD finale main | `f55c4a7` |
| origin/main prima | `be3ddb9` |
| origin/main dopo | `f55c4a7` |

## Commit integrati

| Commit | Messaggio |
|--------|-----------|
| `00ca69d` | `fix(runtime): restore application view rendering` |
| `f55c4a7` | `docs: close CML-607 runtime view recovery` |

## Commit di chiusura

| Commit | Messaggio |
|--------|-----------|
| (questo) | `docs: close CML-607 integration` |

## Strategia

Fast-forward (`git merge --ff-only`). Nessun merge commit creato.

## File funzionale modificato

`src/App.tsx` — 1 file, 4 righe

- Rimosso import inutilizzato di `Outlet`
- Aggiunto import di `AppViewsLayer`
- Sostituito `<Outlet />` con `<AppViewsLayer {...appViewsLayerProps} />`

## Renderer

| Stato | Prima | Dopo |
|-------|-------|------|
| Componente | `<Outlet />` | `<AppViewsLayer {...appViewsLayerProps} />` |
| Output | `null` (nessuna route) | Vista attiva basata su `activeTab` |

## Viste ripristinate

- Dashboard (default)
- Curriculum (`/curriculum`)
- Revisione
- Progetta Annuale (`/planning`)
- Processo & Consenso
- Esportazioni / Documenti (`/documents`)
- Fonti & Sezioni Generali
- Second Brain & WikiLLM

## Test

| Metrica | Valore |
|---------|--------|
| File test | 10 |
| Test totali | 222 |
| Test passati | 222 |
| Fallimenti | 0 |

## Build

| Metrica | Valore |
|---------|--------|
| Moduli | 1634 |
| Bundle | 1,084.61 kB |
| Gzip | 282.30 kB |

## TypeScript

Errori pre-esistenti nei file di test (`navigation.cml604d.test.tsx`, `teacher-workspace-part1.test.tsx`). Nessun nuovo errore introdotto da CML-607.

## Sviluppo

`npm run dev` — viste reali raggiungibili, sidebar funzionante, mobile nav funzionante.

## Produzione

`npm run build` — bundle corretto, moduli viste inclusi, `#main-content` non vuoto.

## Navigazione

- Sidebar desktop: funzionante
- Mobile bottom nav: funzionante
- URL-based tab derivation: funzionante

## CI

Push eseguito su `origin/main`. Verificare GitHub Actions per build e test automatici.

## Allineamento

| Branch | HEAD | Stato |
|--------|------|-------|
| main | `f55c4a7` | Aggiornato |
| origin/main | `f55c4a7` | Aggiornato |
| Divergenza | 0/0 | Allineati |

## Working tree

4 file uncommitati pre-esistenti (`index.html`, `kilo.jsonc`, session files). Estranei a CML-607.

## Baseline congelate

- CML-605: invariata
- CML-606: sospesa, da riallineare dopo CML-607

## Rischio residuo

Basso. Modifica minima, test verdi, build corretta.

## Relazione con CML-606

CML-607 è ora integrato su main. Il prossimo passo è:

1. Riallineare `feat/cml-606-ui-system-documents-pilot` alla nuova main
2. Rieseguire i test
3. Ricostruire la build
4. Ripetere gli screenshot reali di Documenti
5. Confermare `CML-606_VISUAL_PASS`
6. Integrare CML-606

## Verdetto

**CML_607_INTEGRATED_AND_CLOSED**
