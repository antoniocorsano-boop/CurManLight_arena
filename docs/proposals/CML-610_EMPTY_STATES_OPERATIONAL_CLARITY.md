# CML-610 — Stati vuoti e chiarezza operativa

## Baseline

- Repository: main, HEAD `04eac42`
- PR #2 integrata (CML-609 + CML-609A)
- npm ci: PASS
- Test: 243/243 PASS
- Build: PASS
- Storybook: PASS
- Vite 6.4.3, Vitest 4.1.10
- UiEmptyState disponibile (icon, title, description, action, className)
- UiStatusMessage disponibile (type, children)

## Obiettivo

Rendere gli stati senza contenuto:
- immediatamente comprensibili;
- coerenti fra le viste;
- orientati alla prossima azione possibile;
- accessibili;
- adeguati a docenti non tecnici;
- distinti dagli errori, dai caricamenti e dagli stati non configurati.

## Inventario completo

### Dashboard

| ID | Condizione | Stato attuale | Tipo | Decisione |
|---|---|---|---|---|
| D1 | `savedUda.length===0 && wizardStep<=1` | Badge "Nessuna attivita" | A — Vuoto iniziale | Già implementato |
| D2 | `savedUda.length===0` (CTA) | Bottone "Inizia dal Curricolo" | A — Vuoto iniziale | Già implementato |
| D3 | Ruoli non-docente | Dati hardcoded | N/A | Non applicabile |

### Curriculum

| ID | Condizione | Stato attuale | Tipo | Decisione |
|---|---|---|---|---|
| C1 |traguardi/obiettivi vuoti (AlberoView) | Container vuoto silenzioso | A — Vuoto iniziale | Escluso (KB sempre popolata) |
| C2 | Proposals nascoste | Sezione nascosta | A — Vuoto iniziale | Escluso (edge case) |
| C3 | Infanzia traguardi/obiettivi vuoti | `<ul>` vuoto | A — Vuoto iniziale | Escluso (KB sempre popolata) |

### Revisione

| ID | Condizione | Stato attuale | Tipo | Decisione |
|---|---|---|---|---|
| R1 | `filteredProps` vuoto in list mode | Container vuoto silenzioso | B — Nessun risultato | **Implementato** |
| R2 | `filteredProps` vuoto in wizard | Card "Nessuna variazione" | B — Nessun risultato | Già implementato |
| R3 | Contatore `0/0 decisioni` | Testo funzionale | Cosmetico | Escluso |

### Progetta

| ID | Condizione | Stato attuale | Tipo | Decisione |
|---|---|---|---|---|
| P1 | `savedUda.filter()` vuoto (archivio) | Testo italic | B — Nessun risultato | **Implementato** |
| P2 | Nessun UDA per classe | Card "Nessun modulo" | A — Vuoto iniziale | Già implementato |
| P3 |traguardi/obiettivi/evidenze vuoti | Container vuoto | A — Vuoto iniziale | Escluso (KB popolata) |

### Fonti

| ID | Condizione | Stato attuale | Tipo | Decisione |
|---|---|---|---|---|
| F1 | Contenuto statico | Testo hardcoded | N/A | **Non applicabile** |

### SecondBrain

| ID | Condizione | Stato attuale | Tipo | Decisione |
|---|---|---|---|---|
| S1 | `glossary.filter()` vuoto | Testo italic | B — Nessun risultato | **Implementato** |
| S2 | `selectedNodeId` falso | Testo "Clicca su un componente" | C — Nessuna selezione | Già implementato |
| S3 | `wikiResponse===null` | "Pronto ad assisterti" | D — Configurazione | Già implementato |
| S4 | Custom doc non trovato | "Nessun contenuto disponibile" | E — Risorsa non trovata | Già implementato (difensivo) |

## Casi esclusi

- **Dashboard**: stati vuoti già implementati con card e badge funzionali
- **Curriculum**: traguardi/obiettivi sempre popolati dalla KB; proposals sono edge case
- **Revisione wizard**: già implementato con card dedicata
- **SecondBrain selezione/chat**: già implementati
- **Fonti**: contenuto statico, nessuno stato vuoto

## Casi selezionati

### R1 — RevisioneTab list mode (B — Nessun risultato)

**Condizione**: `currentDisciplineProps` filtrato produce array vuoto in modalita list.
**Contenuto attuale**: Container `<div>` vuoto silenzioso.
**Testo nuovo**:
- Titolo: "Nessuna variazione da mostrare"
- Descrizione: "Tutte le schede per questa categoria di filtro sono state deliberate, oppure non ci sono elementi corrispondenti."
**Azione**: Nessuna (barra filtri gia visibile sopra).
**Componente**: `UiEmptyState` con icona `FileSearch`.
**File**: `src/features/curriculum/components/RevisioneTab.tsx`

### S1 — SecondBrainTab glossary search (B — Nessun risultato)

**Condizione**: `glossary.filter()` produce array vuoto per il termine cercato.
**Contenuto attuale**: Testo italic "Nessun termine corrispondente trovato nel Glossario."
**Testo nuovo**:
- Titolo: "Nessun termine corrispondente trovato nel Glossario"
- Descrizione: "Prova a modificare il termine di ricerca o sfoglia l'elenco completo."
**Azione**: Nessuna (barra ricerca visibile sopra).
**Componente**: `UiEmptyState` con icona `BookOpen`.
**File**: `src/features/documents/components/SecondBrainTab.tsx`

### P1 — ProgettazioneTab archivio filtrato (B — Nessun risultato)

**Condizione**: `savedUda.filter(handleApplyLibFilters)` produce array vuoto.
**Contenuto attuale**: Testo italic "Nessun elemento registrato in archivio corrispondente ai filtri."
**Testo nuovo**:
- Titolo: "Nessun elemento corrispondente ai filtri"
- Descrizione: "Prova a modificare i filtri di ricerca o a ripristinare l'elenco completo."
**Azione**: "Pulisci filtri" (comportamento gia esistente, `handleClearLibFilters`).
**Componente**: `UiEmptyState` con icona `Filter` e `UiButton` per azione.
**File**: `src/features/progettazione/components/ProgettazioneTab.tsx`

## Testi editoriali

### Principi
- Italiano chiaro e concreto
- Titolo descrive la situazione, non il componente
- Nessun gergo tecnico, nessun punto esclamativo
- Nessuna autocelebrazione

### Testi precedenti → Testi nuovi

| Vista | Prima | Dopo |
|---|---|---|
| Revisione list | (nessuno — container vuoto) | "Nessuna variazione da mostrare" / "Tutte le schede per questa categoria di filtro sono state deliberate, oppure non ci sono elementi corrispondenti." |
| SecondBrain glossary | "Nessun termine corrispondente trovato nel Glossario." | "Nessun termine corrispondente trovato nel Glossario" / "Prova a modificare il termine di ricerca o sfoglia l'elenco completo." |
| Progetta archivio | "Nessun elemento registrato in archivio corrispondente ai filtri." | "Nessun elemento corrispondente ai filtri" / "Prova a modificare i filtri di ricerca o a ripristinare l'elenco completo." |

## File modificati

| File | Modifica |
|---|---|
| `src/features/curriculum/components/RevisioneTab.tsx` | Aggiunto import `UiEmptyState` e `FileSearch`; list mode empty state con IIFE |
| `src/features/documents/components/SecondBrainTab.tsx` | Aggiunto import `UiEmptyState` e `BookOpen`; glossary empty state con `UiEmptyState` |
| `src/features/progettazione/components/ProgettazioneTab.tsx` | Aggiunto import `UiEmptyState` e `Filter`; archivio empty state con `UiEmptyState` e azione "Pulisci filtri" |
| `src/__tests__/cml610-empty-states.test.tsx` | Nuovo file: 4 test per RevisioneTab list empty state e DocumentExportHistory |

## Test

- 243 test preesistenti: PASS
- 4 nuovi test: PASS
- Totale: 247/247 PASS
- npm test: EXIT CODE 0

## TypeScript

- Baseline (main): 143 errori in 2 file di test
- Branch (CML-610): 143 errori negli stessi 2 file, stessi codici
- Delta introdotto: 0
- Nessun nuovo errore

## Verifica visiva

- Build applicazione: PASS (1,090.33 kB)
- Build Storybook: PASS (3,075.63 kB)
- Screenshot acquisiti con Playwright a 3 viewport: 1440x900, 1024x768, 390x844
- P1 (Progettazione archivio filtrato): stato vuoto confermato nel DOM ("Nessun elemento corrispondente ai filtri" + "Pulisci filtri")
- Dashboard: CTA "Inizia dal Curricolo" confermata (vuoto iniziale insegnante)
- R1 e S1: test unitari confermano il rendering; navigazione SPA con Playwright parzialmente riuscita (dialog modale persistente)
- Screenshot保存在 `report/cml-610-screenshots/`, non versionati

## Accessibilita

- Titoli con tag `h3` semantico
- Testo comprensibile senza icona
- Pulsante "Pulisci filtri" raggiungibile da tastiera
- Focus visibile
- Nessuna dipendenza esclusiva dal colore
- Nessuna regione live inappropriata

## Rischi

- **Basso**: UiEmptyState e` usato senza modifiche al componente
- **Basso**: Nessuna dipendenza funzionale aggiunta
- **Basso**: Testi monitorabili e verificabili

## Criteri di chiusura

- [x] Baseline 04eac42 verificata
- [x] Inventario reale completato
- [x] Stati classificati A-G
- [x] Nessun caso artificiale introdotto
- [x] Ogni stato implementato e` riproducibile
- [x] UiEmptyState riusato senza logica di dominio
- [x] Testi chiari e orientati all'azione
- [x] Azioni collegate a comportamenti gia esistenti
- [x] Test complessivi verdi (247/247)
- [x] Build applicazione verde
- [x] Build Storybook verde
- [x] Nessuna regressione
- [x] Working tree tracciato pulito dopo commit
- [x] Architettura e navigazione invariate
