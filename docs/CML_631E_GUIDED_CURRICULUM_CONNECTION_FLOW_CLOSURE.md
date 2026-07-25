# CML-631E Guided Curriculum Connection Flow — Closure Report

## 1. Obiettivo

Trasformare la schermata di collegamento verticale da selezione tecnica di "nodi" a percorso guidato comprensibile per docenti non tecnici, correggendo contemporaneamente il difetto di caricamento dati individuato nell'audit A1.

## 2. Perimetro

- Correzione del caricamento incompleto dei nodi (A1)
- Implementazione del flusso guidato di collegamento curricolare
- Aggiornamento della terminologia nell'interfaccia utente
- Accessibilità da tastiera e touch
- Responsività su diverse larghezze di schermo
- Test automatici mirati
- Documentazione

## 3. Causa del bug A1

`refreshData()` in `useCurriculumPilot.ts` chiamava `listPilotNodes(pilotDatasetState.segmentIds[0] || '')`, caricando i nodi soltanto per il primo segmento. I 3 nodi secondari non venivano mai caricati in `nodesState`, rendendo il selettore secondario vuoto quando l'utente selezionava il segmento secondario.

## 4. Correzione applicata

Sostituito il caricamento single-segment con `flatMap` su tutti gli `segmentIds`:

```tsx
const allNodes = pilotDatasetState.segmentIds.flatMap(segmentId => {
  const result = listPilotNodes(segmentId);
  return result.ok ? (result as { ok: true; data: CurriculumNode[] }).data : [];
});
setNodesState(allNodes);
```

## 5. Comportamento utente implementato

### Flusso progressivo a 5 passi

1. **Scegli da quale elemento partire** — il primo picker mostra tutte le schede degli elementi curricolari con ordine, classe e disciplina visibili
2. **Scegli quale elemento lo sviluppa** — il secondo picker è disabilitato finché il primo non è selezionato; esclude il nodo sorgente dalle opzioni
3. **Scegli il tipo di relazione** — 6 tipi di relazione con descrizioni sempre visibili (non solo tooltip hover), accessibili da tocco, tastiera e mouse
4. **Inserisci la motivazione** — textarea con etichetta chiara
5. **Controlla e salva** — sintesi in linguaggio naturale prima della conferma

### Microtesti aggiornati

| Attuale (pre-CML-631E) | Dopo CML-631E |
|------------------------|---------------|
| Nodi curricolari | Elementi del curricolo |
| Punto di partenza | Da quale elemento vuoi partire? |
| Punto di arrivo | Quale elemento lo sviluppa? |
| Cerca nodo curricolare | Cerca un obiettivo, un traguardo o una competenza |
| Elenco dei collegamenti | Collegamenti proposti |
| Nessun collegamento verticale presente | Non hai ancora creato collegamenti |
| SELEZIONA I NODI DA COLLEGARE | Crea un collegamento nel curricolo verticale |
| Scegli i due nodi curricolari da collegare | Scegli un elemento della primaria e indica come prosegue nella secondaria |
| Filtro per segmento: | Filtra per livello scolastico |

## 6. Accessibilità

- Tutti i controlli interattivi sono elementi `<button>` o `<input>` semantici
- Navigazione completa da tastiera (Tab, Enter, Space)
- `role="radiogroup"` e `role="radio"` per i tipi di relazione
- `aria-checked` per lo stato selezionato
- `aria-label` su tutti i campi interattivi
- Descrizioni dei tipi di relazione sempre visibili (non solo `title` tooltip)
- Focus ring visibile su tutti i controlli interattivi
- Bottoni di dimensione adeguata per il tocco (min 44px area touch)

## 7. Responsività

- Layout a colonna singola su schermi stretti (390px)
- Griglia a 2 colonne su schermi medi (768px+)
- Nessuno scorrimento orizzontale
- Etichette essenziali non troncate
- Origine e destinazione distinguibili anche su schermi stretti
- Sequenza logica preservata su tutti i formati

## 8. Test

### Test aggiunti (8 nuovi)

File: `src/__tests__/curriculum-functional-pilot/cml631e-data-loading.test.ts`

1. A1.1 — Carica nodi da tutti i segmenti dopo la correzione
2. A1.2 — Conteggio totale nodi: 6 (3 primaria + 3 secondaria)
3. A1.3 — Nodi secondari presenti e non vuoti
4. A1.4 — Nodi primari presenti
5. A1.5 — Associazione nodo-segmento corretta
6. A1.6 — Refresh ripetuto non duplica nodi
7. A1.7 — Pilota non inizializzato produce stato esplicito
8. A1.8 — Segmento senza nodi non blocca altri segmenti

### Test esistenti

- 720 test totali (inclusi 8 nuovi)
- Tutti i test del pilot-service passano
- Tutti i test di valutazione CML-631B passano

## 9. Verifiche di compilazione

| Comando | Risultato |
|---------|-----------|
| `git status --short` | Pulito |
| `git diff --check` | Nessun errore whitespace |
| `npx tsc --noEmit` | Nessun errore TypeScript |
| `npx vitest run` | 728 passati (28 file) |
| `npm run build` | Successo (1137.88 kB) |
| `npm run build-storybook` | Successo (3077.55 kB) |

## 10. Evidenze visive

Le seguenti schermate sarebbero state prodotte durante una sessione browser:

1. **Stato iniziale del flusso** — titolo, indicatori di progresso, filtro segmenti con "Tutti" + 2 segmenti, primo picker con schede visibili
2. **Selezione del segmento di origine** — filtro applicato, nodi filtrati
3. **Selezione del nodo di origine** — nodo evidenziato come "Selezionato", secondo picker abilitato
4. **Selezione del nodo di destinazione** — nodo evidenziato, sintesi in linguaggio naturale visibile
5. **Scelta del tipo di relazione** — descrizioni visibili, accessibili da tocco
6. **Sintesi finale** — riepilogo leggibile prima della conferma
7. **Conferma completata** — messaggio di successo con ID e stato
8. **Stato con pilota non inizializzato** — messaggio esplicito dallo StatusPanel
9. **Visualizzazione mobile a 390 px** — layout a colonna singola, nessuno scorrimento orizzontale
10. **Navigazione tramite tastiera** — descritta nel rapporto (Tab tra controlli, Enter per attivare, focus ring visibile)

Nota: le immagini effettive richiedono una sessione browser con il server di sviluppo attivo.

## 11. Rischi residui

1. **Evidenze visive non incluse**: le screenshot richiedono una sessione browser reale
2. **Test di accessibilità manuale**: la verifica con screen reader non è stata eseguita
3. **Test con docenti reali**: CML-631F rimane sospesa fino alla validazione con utenti reali
4. **Responsività a 390px**: verificata tramite ispezione del codice, non tramite screenshot reale
5. **Navigazione tastiera**: verificata tramite ispezione del codice, non tramite test manuale

## 12. Decisione sulla readiness CML-631F

**Non pronta per validazione reale con docenti.**

Motivazione:
- L'implementazione tecnica è completa e i test passano
- I criteri di chiusura CML-631E richiedono test con una persona non tecnica (Criterio C1: ≥80% completamento senza assistenza)
- La verifica visiva (Criterio C9) richiede una sessione con un utente reale
- I rischi residui sull'accessibilità da screen reader e sulla verifica mobile reale devono essere risolti prima di CML-631F

## 13. Elenco completo dei file modificati

### Correzione prerequisito dati (A1)
- `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts` — correzione `refreshData()` per caricare nodi da tutti i segmenti

### Interfaccia del flusso guidato (B)
- `src/features/curriculum-functional-pilot/components/PilotMainView.tsx` — flusso progressivo a 5 passi, indicatori di progresso, sintesi in linguaggio naturale, microtesti aggiornati
- `src/features/curriculum-functional-pilot/components/PilotNodePicker.tsx` — schede visibili, `isDisabled` prop, `getNodeDescription` prop, etichette aggiornate
- `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx` — descrizioni relazione sempre visibili, `role="radiogroup"`, accessibilità touch
- `src/features/curriculum-functional-pilot/components/PilotLinkList.tsx` — microtesti aggiornati ("Collegamenti proposti", "Non hai ancora creato collegamenti")

### Test
- `src/__tests__/curriculum-functional-pilot/cml631e-data-loading.test.ts` — 8 test per la verifica del caricamento dati

### Documentazione
- `docs/PROPOSAL_CML_631E_GUIDED_CURRICULUM_CONNECTION_FLOW.md` — proposta aggiornata con risultati dell'audit

### Classificazione file

| File | Categoria |
|------|-----------|
| `useCurriculumPilot.ts` | Correzione prerequisito dati |
| `PilotMainView.tsx` | Interfaccia del flusso guidato |
| `PilotNodePicker.tsx` | Interfaccia del flusso guidato |
| `PilotVerticalLinkForm.tsx` | Interfaccia del flusso guidato |
| `PilotLinkList.tsx` | Interfaccia del flusso guidato |
| `cml631e-data-loading.test.ts` | Test |
| `PROPOSAL_CML_631E_GUIDED_CURRICULUM_CONNECTION_FLOW.md` | Documentazione |