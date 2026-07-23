# CML-607 — Runtime View Rendering Recovery

## Problema

L'applicazione CurManLight non visualizza nessuna vista nella shell. L'area contenuto principale (`#main-content`) resta vuota.

## Diagnosi

### Catena del rendering (stato before)

```
src/main.tsx
  → BrowserRouter
    → App
      → <Outlet />  ← null (nessuna route collegata)
```

### Catena del rendering (stato after)

```
src/main.tsx
  → BrowserRouter
    → App
      → <AppViewsLayer {...appViewsLayerProps} />
        → DashboardView / CurriculumTab / RevisioneTab / ProgettazioneTab / ProcessoTab / EsportazioniTab / InfoViews / SecondBrainTab
```

### File chiave

| File | Ruolo |
|------|-------|
| `src/main.tsx` | Bootstrap: monta `App` dentro `BrowserRouter` |
| `src/App.tsx` | Shell: header, sidebar, contenuto, modals, copilot |
| `src/features/session/components/AppViewsLayer.tsx` | Renderer canonico: seleziona vista basandosi su `activeTab` |
| `src/routes/index.tsx` | Router alternativo (non attivo) |

### Come funziona la navigazione

1. `App.tsx` deriva `activeTab` da `location.pathname` tramite `pathnameToTab()`
2. `AppViewsLayer` rende la vista corrispondente a `activeTab`
3. Sidebar e mobile nav chiamano `handleTabSwitch()` che naviga via `useNavigate()`
4. Il cambio di URL aggiorna `location.pathname` → `activeTab` cambia → la vista cambia

### Props di AppViewsLayer

`AppViewsLayerProps` è costruito in `App.tsx` (linee 733-969) e contiene tutte le props necessarie per tutte le viste. Il componente è già pronto e non richiede modifiche.

## Correzione

### Modifiche a `src/App.tsx`

1. **Rimosso** import di `Outlet` da `react-router-dom` (linea 4)
2. **Aggiunto** import di `AppViewsLayer` da `./features/session` (linea 7)
3. **Sostituito** `<Outlet />` con `<AppViewsLayer {...appViewsLayerProps} />` (linea 1173)

### Nessuna altra modifica

- `src/main.tsx` — invariato
- `src/routes/index.tsx` — invariato, non collegato
- Shell, sidebar, store, tipi — invariati
- Nessuna nuova dipendenza
- Nessuna nuova route

## Verifiche

### Test

| Metrica | Prima | Dopo | Stato |
|---------|-------|------|-------|
| File test | 10 | 10 | ✅ |
| Test totali | 222 | 222 | ✅ |
| Test passati | 222 | 222 | ✅ |

### Build

| Metrica | Prima | Dopo | Note |
|---------|-------|------|------|
| Moduli | 1634 | 1634 | Invariato |
| Bundle | 788.02 kB | 1,084.61 kB | +296.59 kB (atteso) |
| Gzip | 222.16 kB | 282.30 kB | +60.14 kB (atteso) |

L'aumento del bundle è atteso e corretto: prima le viste erano eliminate dal tree-shaking perché mai importate. Ora sono parte attiva della build.

### Viste ripristinate

- Dashboard (default)
- Curriculum (`/curriculum`)
- Revisione
- Progetta Annuale (`/planning`)
- Processo & Consenso
- Esportazioni / Documenti (`/documents`)
- Fonti & Sezioni Generali
- Second Brain & WikiLLM

### Navigazione

- Sidebar desktop: funzionante
- Mobile bottom nav: funzionante
- URL-based tab derivation: funzionante

## Rischio residuo

**Basso.** La modifica è minima (3 linee in 1 file) e ripristina il rendering che avrebbe dovuto essere attivo. Nessuna modifica architetturale.

## Debito tecnico documentato

- `src/routes/index.tsx` definisce `createBrowserRouter` ma non è importato
- Possibile baseline futura per migrazione a route-based navigation
- Non trattato in CML-607

## Verdetto

**CML_607_RUNTIME_VIEW_RENDERING_READY_FOR_INTEGRATION**
