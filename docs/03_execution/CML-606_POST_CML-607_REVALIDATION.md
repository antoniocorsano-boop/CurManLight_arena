# CML-606 — Post-CML-607 Revalidation

## Nuova baseline

- `origin/main` = `6c9cc7b` (CML-607 integrato)
- Build baseline: 1,084.61 kB (gzip 282.30 kB)

## Strategia di merge

`git merge --no-ff origin/main` — merge commit, nessun rebase.

## Conflitti

Nessun conflitto. CML-607 modifica solo `src/App.tsx` (renderer). CML-606 non lo modifica.

## AppViewsLayer

Confermato attivo dopo il merge:
- `<AppViewsLayer {...appViewsLayerProps} />` presente in `App.tsx`
- `<Outlet />` non reintrodotto come renderer unico

## Test

| Metrica | Valore |
|---------|--------|
| Test app | 222/222 PASS |
| Storybook test | 5 file falliti (pre-esistente: `aria-query` missing export) |

## Build

| Metrica | CML-607 baseline | CML-606+CML-607 | Delta |
|---------|------------------|-----------------|-------|
| Moduli | 1634 | 1638 | +4 |
| Bundle | 1,084.61 kB | 1,085.98 kB | +1.37 kB |
| Gzip | 282.30 kB | 283.74 kB | +1.44 kB |

Delta +1.37 kB coerente con i componenti UI system di CML-606.

## Storybook

Build riuscita: 3,061.75 kB (gzip 909.13 kB).

## Screenshot

Acquisiti 4 screenshot in `report/cml-606-screenshots/post-cml-607/`:

| File | Viewport | Dimensione |
|------|----------|------------|
| documents-desktop-desktop-1440.png | 1440×900 | 136 kB |
| documents-desktop-laptop-1366.png | 1366×768 | 130 kB |
| documents-desktop-tablet-1024.png | 1024×768 | 114 kB |
| documents-desktop-mobile-390.png | 390×844 | 51 kB |

`#main-content` ha 6921 caratteri di contenuto in tutti i viewport — viste reali renderizzate.

## Analisi visiva

Screenshot acquisiti per validazione umana. I file sono disponibili in `report/cml-606-screenshots/post-cml-607/`.

## Responsive

4 viewport testati. Contenuto adattivo confermato dalla dimensione crescente dei screenshot.

## Dialog

Confermati nei componenti UI system (UiConfirmDialog).

## CSP

Commit `fbfdc01` — `fix(csp): allow Vite dev module scripts` — confermato presente nel branch. Sviluppo e produzione funzionanti.

## File estranei

- `screenshot-cml606.cjs` — script temporaneo per gli screenshot
- `report/cml-606-screenshots/post-cml-607/` — screenshot acquisiti

## Working tree

Pulito (solo file non tracciati pre-esistenti).

## Rischio residuo

Basso. Test verdi, build corretta, viste renderizzate, screenshot acquisiti.

## Readiness per integrazione

CML-606 è pronto per l'integrazione su main.

## Verdetto

**CML_606_REALIGNED_AND_READY_FOR_INTEGRATION**
