# Knowledge Companion — Closure

> Iniziativa di prodotto completata e congelata.

## 1. Obiettivo originario

> Il docente potrà trovare, nei passaggi centrali della progettazione UDA, riferimenti pertinenti e comprensibili senza perdere il contesto operativo.

## 2. Baseline iniziale

| Campo | Valore |
|---|---|
| Stato pre-iniziativa | Nessun riferimento contestuale nei passi 2–4 della wizard |
| Architettura | Congelata (CML-603) |
| Navigazione | Congelata (CML-604) |
| Persistenza | Zustand + Dexie + localStorage |

## 3. Soluzione implementata

### Hook `useKnowledgeCompanion`

- Input: `wizardStep`, `discipline`, `order`
- Output: `visible`, `intro`, `mainRef`, `additionalRefs`, `expanded`, `overlayContent`, `toggleExpand`, `openOverlay`, `closeOverlay`
- Visibilità: step 2, 3, 4 (range [2, 4])
- Logica: mapping statico step → riferimenti; nessuna chiamata LLM, nessuna search

### Componente `KnowledgeCompanionPanel`

- Mostra intro testuale + mainRef card + expand/collapse per additionalRefs
- Footer: "Puoi continuare anche senza consultare i riferimenti."
- Badge categoria: Curricolo (emerald), Fonte normativa (violet), Approfondimento (cyan)

### Componente `VolumeReaderOverlay`

- Overlay modale con titolo, HTML content, chiudi su backdrop o X
- Contenuto proveniente da `volumesKB`

### Integrazione `ProgettazioneTab`

- Dopo step 2: riferimenti curricolo (vol4 main, vol8, vol6)
- Dopo step 3: riferimenti evidenze (vol3 main, vol6)
- Dopo step 4: riferimenti compito di realtà e inclusione (vol6 main, vol3, vol19)
- Nessuna modifica a shell, routing, store, o persistenza

## 4. Volumi utilizzati

| Volume | Categoria | Step | Ruolo |
|---|---|---|---|
| vol4 | Curricolo | 2 | Main — curricolo fondativo |
| vol3 | Fonte normativa | 3, 4 | Main al step 3 — evidenze DM 14/2024 |
| vol6 | Approfondimento | 2, 3, 4 | Main al step 4 — compito di realtà |
| vol8 | Curricolo | 2 | Additional — dettaglio discipline |
| vol19 | Approfondimento | 4 | Additional — ambienti cooperativi |

## 5. Bug corretto durante l'implementazione

**Prop `ref` riservata a React**: il componente `MainRefCard` e `AdditionalRefCard` usavano `ref` come nome della prop, ma React intercetta `ref` come keyword speciale. Risultato: `undefined` al posto del KnowledgeReference.

**Fix**: rinominato `ref` → `knowledgeRef` in `RefCardProps`, `MainRefCard`, `AdditionalRefCard`, e nei siti di chiamata JSX.

## 6. Test

| Categoria | File | Test | Risultato |
|---|---|---|---|
| Hook KC | `knowledge-companion.test.tsx` | 18 | PASS |
| Panel KC | `knowledge-companion.test.tsx` | 13 | PASS |
| Overlay KC | `knowledge-companion.test.tsx` | 8 | PASS |
| Pre-esistenti | (8 file) | 128 | PASS |
| **Totale** | | **167** | **PASS** |

### Casi testati

- Hook: visibilità per step (1/2/3/4/5), mappatura corretta dei volumi, categoria, toggle expand, apertura/chiusura overlay, assenza WikiLLM/Copilot, volumi autorizzati, preservazione wizardStep
- Panel: rendering condizionale, badge categoria, expand/collapse, callback, optionality hint, assenza linguaggio prescrittivo, volume ID, relevance
- Overlay: rendering null, titolo, HTML, chiusura backdrop, chiusura X, stopPropagation, vincoli dimensione, scroll

## 7. Verifica linguistica

| Check | Risultato |
|---|---|
| Linguaggio prescrittivo ("devi", "scegli", "obbligatoriamente") | Assente |
| Opzionalità dichiarata | "La consultazione è facoltativa" × 4, "Puoi continuare anche senza consultare i riferimenti" |
| Riferimenti a LLM/Copilot | Assenti |
| Tono | Descrittivo, non imperativo |

## 8. Conferma di assenza di modifiche a shell e routing

| Area | Modifiche |
|---|---|
| Shell (`App.tsx`) | NESSUNE |
| Routing (`routes/`) | NESSUNE |
| Navigazione sidebar/header | NESSUNE |
| Nuove rotte | NESSUNE |
| Nuove viste | NESSUNE |
| Nuove chiavi localStorage | NESSUNE |
| Nuove dipendenze | NESSUNE |
| Store (Zustand) | NESSUNE |
| Persistenza (Dexie) | NESSUNE |

## 9. Verifica build

| Check | Risultato |
|---|---|
| `npx vitest run` | 167/167 PASS |
| `npm run build` | 784 KB (green) |
| `npx tsc --noEmit` | Nessun nuovo error (pre-esistenti invariati) |
| Linguaggio prescrittivo | Assente nel codice KC |
| Git diff scope | Solo file KC + test + docs |

## 10. File modificati/creati

| File | Azione |
|---|---|
| `src/features/progettazione/hooks/useKnowledgeCompanion.ts` | CREATO |
| `src/features/progettazione/components/KnowledgeCompanionPanel.tsx` | CREATO |
| `src/features/progettazione/components/ProgettazioneTab.tsx` | MODIFICATO (integrazione KC) |
| `src/__tests__/knowledge-companion.test.tsx` | CREATO |
| `docs/proposals/KNOWLEDGE_COMPANION.md` | CREATO (analisi) |
| `docs/proposals/KNOWLEDGE_COMPANION_VALIDATION_PLAN.md` | CREATO (piano validazione) |
| `docs/proposals/KNOWLEDGE_COMPANION_VALIDATION_OUTCOME.md` | CREATO (template esito) |
| `docs/proposals/KNOWLEDGE_COMPANION_CLOSURE.md` | CREATO (questo documento) |
| `mocks/knowledge-companion/` | CREATO (mock interattivo HTML) |

## 11. Risultato per il docente

> Il docente potrà trovare, nei passaggi centrali della progettazione UDA (step 2–4), riferimenti pertinenti e comprensibili senza perdere il contesto operativo.

**Verificato su:**
- Step 2 (traguardi): riferimento principale vol4 + vol8 + vol6
- Step 3 (evidenze): riferimento principale vol3 + vol6
- Step 4 (compito/realtà): riferimento principale vol6 + vol3 + vol19
- Consultazione sempre facoltativa
- Nessuna interruzione del flusso wizard

## 12. Verdetto conclusivo

**KNOWLEDGE_COMPANION_INTEGRATED_AND_CLOSED**

- Branch: `main` su `4d416df`
- Test: 167/167 PASS (128 pre-esistenti + 39 KC)
- Build: 784 KB (green)
- TypeScript: 0 nuovi error
- Shell e routing: invariati
- Store e persistenza: invariati
- Linguaggio: non prescrittivo, opzionalità dichiarata

---

**L'iniziativa Knowledge Companion è funzionalmente completa e congelata.**

Qualunque evoluzione futura dovrà partire da una nuova osservazione di prodotto e non ampliare automaticamente il Knowledge Companion.
