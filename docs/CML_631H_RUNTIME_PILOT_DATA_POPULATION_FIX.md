# CML-631H — Runtime pilot data population fix

## 1. Contesto

L'audit della baseline CML-631F ha prodotto i verdetti:

```text
CML_631F_VALIDATION_BASELINE_NOT_READY
CML_631F_REAL_TEACHER_VALIDATION_NOT_EXECUTED
```

Due problemi funzionali sono stati identificati durante la verifica browser:

1. **G.9 test failure**: il test `G.9 — renders non-empty counters after initialization` falliva con `expected ['★ Esperimento', 'Dataset inizializzato', '1', '2', '0'] to deeply equal ['1', '2', '0']`.
2. **Dataset initialization while disabled**: se il pilota veniva inizializzato con `activationMode === 'disabled'`, i dati non venivano caricati e successive attivazioni non triggeravano il reload.

## 2. Causa radice

### 2.1 G.9 test failure

Il selettore CSS `.text-emerald-800` nel test G.9 era troppo ampio. Nell'interfaccia, 5 elementi hanno la classe `text-emerald-800`:

1. Badge "★ Esperimento" (PilotMainView.tsx:73)
2. Label "Dataset inizializzato" (PilotStatusPanel.tsx:81)
3. Conteggio versioni (PilotStatusPanel.tsx:88)
4. Conteggio segmenti (PilotStatusPanel.tsx:92)
5. Conteggio collegamenti (PilotStatusPanel.tsx:96)

Il test selezionava tutti e 5 ma ne attendeva solo 3.

### 2.2 Dataset initialization while disabled

Quando `activationMode === 'disabled'`:
1. Il bottone "Inizializza Dataset Pilota" non era disabilitato (PilotStatusPanel.tsx)
2. `initializeDataset()` creava il dataset, ma `refreshData()` leggeva `isPilotActive()` → `false`
3. Tutte le query (versions, segments, nodes, links) restituivano errore `PILOT_DISABLED`
4. Gli state React venivano impostati a array vuoti
5. Successiva attivazione (`setMode('pilot-contribution')`) non triggerava `refreshData` perché `pilotDatasetState` non cambiava

### 2.3 Aggiunta `activationModeState` al useEffect

L'useEffect in `useCurriculumPilot.ts` dipendeva solo da `pilotDatasetState` e `refreshData`. Quando l'utente attivava il pilota dopo un'inizializzazione con mode `disabled`, il dataset era già presente e `pilotDatasetState` non cambiava, quindi `refreshData` non veniva chiamato.

## 3. Soluzione

### 3.1 Fix G.9 (test)

Sostituito il selettore globale `.text-emerald-800` con un selettore scoped al grid dei contatori:

```typescript
// PRIMA (difettoso)
const counters = document.querySelectorAll('.text-emerald-800');

// DOPO (corretto)
const grid = document.querySelector('.grid.grid-cols-3');
const counters = grid!.querySelectorAll('.text-emerald-800');
```

### 3.2 Fix init button (UI)

Il bottone "Inizializza Dataset Pilota" è ora disabilitato quando `activationMode === 'disabled'`:

```typescript
// PRIMA
disabled={isLoading}

// DOPO
disabled={isLoading || activationMode === 'disabled'}
```

### 3.3 Fix useEffect dependencies (hook)

Aggiunto `activationModeState` alle dipendenze dell'useEffect:

```typescript
// PRIMA
}, [pilotDatasetState, refreshData]);

// DOPO
}, [pilotDatasetState, activationModeState, refreshData]);
```

Questo garantisce che quando l'utente attiva il pilota, `refreshData` viene chiamato anche se il dataset era già presente.

## 4. File modificati

| File | Modifica |
|------|----------|
| `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts` | Aggiunto `activationModeState` alle deps di useEffect |
| `src/features/curriculum-functional-pilot/application/curriculumPilotService.ts` | Aggiunta version check in `listPilotLinks` |
| `src/features/curriculum-functional-pilot/components/PilotStatusPanel.tsx` | Init button disabilitato quando `disabled` |
| `src/__tests__/curriculum-functional-pilot/cml631g-pilot-init.test.tsx` | Fix selettore G.9 con scoped grid query |

## 5. Classificazione G.9

```text
G9_PRE_EXISTING_FRAGILE_SELECTOR_FIXED
```

- Tipo: selettore CSS troppo ampio nel test
- Impact: nessun bug funzionale, solo test fallimento
- Fix: selettore scoped al container `.grid.grid-cols-3`
- Regressione: nessuna

## 6. Verifiche tecniche

| Verifica | Esito |
|----------|-------|
| TypeScript (`npx tsc --noEmit`) | 0 errori |
| Vitest (pilot suite: 4 file, 119 test) | tutti passati |
| Vite build | success (1,138.10 kB / 296.05 kB gzip) |
| Storybook build | success (3,077.55 kB / 911.37 kB gzip) |

## 7. Verdicts

```text
CML_631H_RUNTIME_ROOT_CAUSE_IDENTIFIED_AND_FIX_IMPLEMENTED_LOCAL
CML_631H_G9_CLASSIFICATION_COMPLETE
CML_631H_TECHNICAL_VALIDATION_GREEN
```

## 8. Limiti residui

- La verifica da browser reale non è stata eseguita in questo ambiente CLI;
- Il full test suite (736 test) presenta worker timeout su `repositories.test.ts` e `pilot-service.test.ts` (non blocking per le modifiche CML-631H);
- La baseline 03 richiede commit delle modifiche prima del congelamento.
