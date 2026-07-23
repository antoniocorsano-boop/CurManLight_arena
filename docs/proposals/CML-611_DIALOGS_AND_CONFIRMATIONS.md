# CML-611 — Dialoghi e conferme operative

## Baseline

- Repository: main, HEAD `437ca70` (post merge PR #3)
- Branch: `feat/cml-611-dialogs-confirmations`
- npm test: 247/247 PASS
- npm run build: PASS
- npx tsc --noEmit: 0 source errors, 143 pre-existing test errors
- Node v24.13.1, Vite 6.4.3, Vitest 4.1.10
- UiConfirmDialog già disponibile (open, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel)

## Obiettivo

1. Inventario completo di dialoghi e conferme operative nel codebase
2. Classificazione per rischio (A-G) di ogni interazione
3. Implementazione di conferme uniformi per azioni destructive/overwrite/abandon
4. Rimozione di `confirm()` nativo nei punti implementati
5. Fix della doppia conferma in C7 (reset memoria)

## Scopo

- 4 casi implementati: C28, C29, C30, C7
- 44 casi esclusi con motivazione documentata
- 0 nuove dipendenze, 0 modifiche architetturali

## Inventario completo (48 casi, 33 componenti)

### Casi implementati

| ID | Componente | Azione | Categoria | Stato |
|---|---|---|---|---|
| C28 | ProgettazioneTab | Elimina singola UDA | A — Destructive | **Implementato** |
| C29 | ProgettazioneTab | Svuota archivio UDA | A — Destructive | **Implementato** |
| C30 | SecondBrainTab + KnowledgeModals | Elimina documento KB personalizzato | A — Destructive | **Implementato** |
| C7 | AppHeader + SessionModals + useAppLocalHandlers | Reset memoria (fix doppia conferma) | A — Destructive | **Implementato** |

### Casi esclusi — per categoria

| Categoria | Descrizione | Casi | Esempi | Motivazione esclusione |
|---|---|---|---|---|
| A — Destructive | Cancellazione irreversibile | 4 | C5, C6, C33 | Già con conferma o non destructive |
| B — Overwrite | Sovrascrittura dati | 2 | C2, C4 | Già gestiti da workspacesync |
| C — Abandon | Abbandono lavoro | 1 | C3 | Disconnessione cloud, già con conferma |
| D — Reversible | Azione reversibile | 3 | C1, C32, C33 | RAM warning, export history, roster |
| E — No confirm | Azioni sicure/readonly | 24 | Navigation, filtri, copia, export | Navigazione, filtri, copia, condivisione, export, lettura |
| F — Modale informativa | Dialoghi informativi | 7 | Tour, onboarding, motto | Tour, onboarding, motto, copilot, cloud account, agent setup, save settings |
| G — Non applicabile | Struttura hardcoded | 3 | Dashboard, fonti, curriculum | Dashboard hardcoded, fonti statico, curriculum KB popolata |

## Implementazione — Dettaglio per caso

### C28 — Elimina singola UDA

- **File**: `src/features/progettazione/components/ProgettazioneTab.tsx`
- **Prima**: `deleteUda(u.id)` senza conferma
- **Dopo**: `setUdaToDelete(u.id)` → UiConfirmDialog → `deleteUda(udaToDelete)`
- **Dialogo**: "Rimuovi UDA" / "Vuoi davvero rimuovere questa UDA dall'archivio? L'operazione non può essere annullata." / "Rimuovi" (danger)

### C29 — Svuota archivio UDA

- **File**: `src/features/progettazione/components/ProgettazioneTab.tsx`
- **Prima**: `clearUdaLibrary()` senza conferma
- **Dopo**: `setShowClearAllConfirm(true)` → UiConfirmDialog → `clearUdaLibrary()`
- **Dialogo**: "Svuota archivio UDA" / "Questa operazione cancellerà tutte le UDA salvate. L'operazione non può essere annullata." / "Svuota tutto" (danger)

### C30 — Elimina documento KB personalizzato

- **File**: `src/features/documents/components/SecondBrainTab.tsx`, `src/features/documents/components/KnowledgeModals.tsx`
- **Prima**: `handleDeleteCustomKbDoc(id)` senza conferma
- **Dopo**: `setDocToDelete(id)` → UiConfirmDialog → `handleDeleteCustomKbDoc(docToDelete)`
- **Dialogo**: "Elimina documento" / "Vuoi davvero eliminare questo documento dalla Second Brain? L'operazione non può essere annullata." / "Elimina" (danger)
- **Nota**: `docToDelete` preservato in state fino alla conferma

### C7 — Fix doppia conferma reset memoria

- **File**: `src/features/session/hooks/useAppLocalHandlers.ts`, `src/features/navigation/components/AppHeader.tsx`, `src/features/session/components/SessionModals.tsx`
- **Problema**: `useAppLocalHandlers` conteneva `if (confirm(...))` + EsportazioniTab mostrava UiConfirmDialog → doppia conferma; AppHeader e SessionModals chiamavano handler senza alcuna conferma
- **Fix**: Rimosso `confirm()` dal handler; aggiunto UiConfirmDialog ad AppHeader e SessionModals; EsportazioniTab già protetto
- **Tutti i punti di chiamata**: 3 (EsportazioniTab, AppHeader, SessionModals) — tutti protetti

## Verifica

### Test

| Metrica | Valore |
|---|---|
| Test precedenti | 247/247 |
| Nuovi test | 37 |
| Test finali | 284/284 |
| Copertura | Contratto UiConfirmDialog + tutti e 4 i casi (C28, C29, C30, C7) |

### Build

| Comando | Risultato |
|---|---|
| npm test | EXIT CODE 0, 284/284 |
| npm run build | EXIT CODE 0, 1,091.81 kB |
| npm run build-storybook | EXIT CODE 0 |
| npx tsc --noEmit | EXIT CODE 2 (errori preesistenti in test files, 0 source errors) |

### TypeScript

| Metrica | Baseline | Branch | Delta |
|---|---|---|---|
| Errori sorgente | 0 | 0 | 0 |
| Errori test preesistenti | 143 | 143 | 0 |

### Verifica visiva

- 9 screenshot acquisiti (C7 + C29 a 3 viewports)
- C28 e C30 non acquisibili (archivio vuoto / nessun doc personalizzato in sessione fresh)
- Nessun regression visivo

### Accessibilità

- `role="dialog"` nativo via `<dialog>`
- `aria-modal` nativo via `showModal()`
- Focus iniziale su conferma via `confirmButtonRef`
- Escape chiude il dialogo via `onCancel`
- Close button con `aria-label="Chiudi"`

## File modificati

| File | Tipo |
|---|---|
| `src/features/progettazione/components/ProgettazioneTab.tsx` | Modified |
| `src/features/documents/components/SecondBrainTab.tsx` | Modified |
| `src/features/documents/components/KnowledgeModals.tsx` | Modified |
| `src/features/session/hooks/useAppLocalHandlers.ts` | Modified |
| `src/features/navigation/components/AppHeader.tsx` | Modified |
| `src/features/session/components/SessionModals.tsx` | Modified |
| `src/__tests__/cml611-dialogs-confirmations.test.tsx` | Added |
| `docs/03_execution/CML-611.md` | Added |

## Rischio residuo

- **Basso**: UiConfirmDialog usato senza modifiche al contratto
- **Basso**: Nessuna dipendenza funzionale aggiunta
- **Basso**: Tutte le azioni destructive hanno conferma uniforme
- **Basso**: `confirm()` nativi rimasti solo per azioni reversibili/abbandono (categorie D/C)

## Stato finale

```
CML_611_DIALOGS_AND_CONFIRMATIONS_COMPLETE_LOCAL
```
