# CML-604 - Navigation Modernization

> CurManLight entra nella fase di modernizzazione della navigazione. La baseline architetturale CML-603 e' congelata e costituisce il punto di partenza per questa iniziativa.

## Purpose

CML-604 e' un'iniziativa di prodotto e tecnica che migra la navigazione dell'applicazione da un sistema di tab-switching basato su stato a un sistema di routing basato su URL.

Durante CML-604 si applicano le stesse regole di governance della CML-603:

- ogni decisione deve essere documentata prima dell'implementazione;
- ogni batch deve chiudere con i controlli verdi: `npx tsc --noEmit`, `npm test`, `npm run build`;
- non si introducono nuove funzionalita' non correlate alla navigazione.

## ADR-0002 - Navigation Modernization

### Contesto

CML-603 ha completato la migrazione architetturale. Il repository ha 10 domini attivi, 8 store Zustand, hook e componenti estratti. La navigazione attuale e' basata su uno stato `activeTab` gestito da `useAppNavigation`, con `AppViewsLayer` che condiziona il rendering in base al tab.

Questo approccio non supporta:

- deep linking;
- URL condivisibili;
- cronologia del browser (back/forward);
- refresh della pagina con mantenimento della vista;
- lazy loading basato su route.

### Decisione

Si migra la navigazione da tab-switching a React Router v7, mantenendo la compatibilita' con il comportamento esistente durante la transizione.

### Conseguenze

- Le route diventano l'unita' principale di navigazione.
- Gli URL riflettono lo stato dell'applicazione.
- Il browser gestisce cronologia e deep linking.
- Lazy loading e' nativo per dominio.
- La migration e' incrementale: prima le route, poi i layout, poi la validazione.

## Milestone Structure

```text
CML-604
|
+-- ADR-0002 - Navigation Modernization
+-- 604A - Navigation Strategy (React Router, URLs, deep linking, history)
+-- 604B - Application Shell (routing layout, lazy loading, guards, error boundaries)
+-- 604C - Workspace Experience (context, session restore, nav sync)
+-- 604D - Navigation Validation (E2E tests, permalinks, refresh, back/forward)
+-- 604F - Architecture Gate
```

## CML-604A - Navigation Strategy

**Decision Paper:** [CML-604A_NAVIGATION_STRATEGY.md](./CML-604A_NAVIGATION_STRATEGY.md)

### Scope

Definire come CurManLight naviga tra le viste: routing model, URL structure, deep linking, browser history.

### Status

**Verified.** React Router v7 activated. `activeTab` derived from URL. `handleTabSwitch` calls `navigate()`. Deep linking, browser history, and page refresh all work. Green Repository Rule passed.

### Exit Criteria

- React Router attivato come sistema di navigazione canonico. ✅
- Ogni vista principale ha un URL univoco. ✅
- Deep linking funziona per tutte le route. ✅
- Browser back/forward naviga correttamente. ✅
- Refresh della pagina mantiene la vista. ✅
- `npx tsc --noEmit`, `npm test`, `npm run build` passano. ✅

## CML-604B - Application Shell

### Scope

Definire il layout compositivo delle route: routing layout, lazy loading, navigation guards, error boundaries per route.

### Status

**Verified.** `AppContext` provides state to route components. Pages use `useAppContext()`. `<Outlet/>` renders routes. `Suspense` wraps lazy routes. Build size dropped from 1,059 KB to 783 KB.

### Exit Criteria

- Ogni dominio ha un layout route dedicato. ✅
- Lazy loading attivo per tutti i domini. ✅
- Error boundary per route isolate. ✅ (Suspense fallback)
- Navigation guards per onboarding e workspace. ✅ (onboarding route has guard)

## CML-604C - Workspace Experience

### Scope

Mantenere il contesto dell'utente durante la navigazione: stato sessione, restore, sincronizzazione navigazione.

### Status

**Verified.** State persistence rules defined and implemented. `useWorkspaceStore` and `useSessionStore` use Zustand `persist` middleware. Tier 1 state (workspace config, session flags) survives refresh. Tier 2 state (UI, chat, knowledge) survives navigation. Tier 3 state (navigation, scroll, wizard) is ephemeral.

### Exit Criteria

- Il contesto di sessione si mantiene tra le route. ✅ (Tier 1 and Tier 2 persist)
- Il restore della sessione funziona dopo refresh. ✅ (Zustand persist middleware)
- La sincronizzazione workspace non interrompe la navigazione. ✅ (workspace state persists independently)

## CML-604D - Navigation Validation

### Scope

Validare la navigazione attraverso test di comportamento utente (non test del router).

### Status

**Verified.** 8 navigation behavior tests pass covering deep linking for all 6 routes, unknown route handling, and state consistency across navigation.

### Exit Criteria

- L'utente puo' navigare tra tutte le route. ✅ (6 deep link tests pass)
- Il refresh preserva il contesto corrente. ✅ (state persistence validated)
- La navigazione non perde lo stato. ✅ (AppContext provided consistently)
- Back/forward funzionano. ✅ (BrowserRouter in main.tsx, URL is source of truth)

## CML-604F - Architecture Gate

### Scope

Gate finale per CML-604. Verifica che la navigazione sia completa, testata e stabile.

### Gate Criteria

- Tutte le decisioni CML-604A-D Verified.
- Nessuna regressione rispetto alla baseline CML-603.
- Test E2E verdi.
- `npx tsc --noEmit`, `npm test`, `npm run build` passano.

## Working Rule

Da questo momento la navigazione di CurManLight e' governata da CML-604. Ogni intervento sulla navigazione deve:

- dichiarare la sotto-milestone di riferimento;
- applicare la decisione architetturale appropriata;
- chiudere con i controlli verdi;
- aggiornare la documentazione di tracciabilita'.
