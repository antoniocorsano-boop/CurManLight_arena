# CML-631F — Baseline di validazione 04

## Identificatore

```
CML-631F-BASELINE-04
```

## Stato

```text
CML_631F_VALIDATION_BASELINE_04_READY_FOR_SESSIONS
```

## Branch

`feat/cml-631i-assisted-pedagogical-relation-suggestions`

## Commit

| Tipo | Hash |
|------|------|
| Docs (CML-631H alignment) | `24ca552` |
| Feat (engine) | `e656a94` |
| Feat (UI) | `41f6085` |
| Test | `7442494` |
| Docs (CML-631I) | `b403e4d` |
| Docs (protocol + baseline, HEAD) | `bd23ae3` |

## Data

2026-07-26

## Ambiente

- OS: Windows 10/11 (win32)
- Node: gestito da npm
- Test runner: Vitest 4.1.10
- Build: Vite 6.4.3
- Storybook: 10.5.3
- Browser verification: Playwright 1.61.1 (Chromium headless)

## Modifiche rispetto alla baseline 03

### CML-631I — Suggerimenti pedagogici assistiti

1. **Engine deterministico**: `pedagogicalSuggestionEngine.ts` — 13 regole locali, nessuna chiamata esterna
2. **UI integrata**: `PilotVerticalLinkForm.tsx` — sezione "Possibili relazioni suggerite" con "Usa questa proposta" / "Ignora"
3. **Moduli passati**: `PilotMainView.tsx` — passa `sourceNode` e `targetNode` al form
4. **Test**: `cml631i-pedagogical-suggestion-engine.test.ts` — 18 test (15 richiesti)
5. **Documentazione**: `CML_631I_ASSISTED_PEDAGOGICAL_RELATION_SUGGESTIONS.md`

### Protocollo di validazione aggiornato

- Checklist sessione: indicatori suggerimenti pedagogici
- Griglie osservazione T01–T05: sezione "CML-631I — Pedagogical Suggestion Indicators"
- Log sessione: riepilogo indicatori suggerimenti

## Test

- Totali: 137 (curriculum pilot)
- File: 20
- CML-631I: 18 test (engine deterministico)
- Esito: tutti passati

## Build

- Comando: `npm run build`
- Esito: success
- Moduli: 1656

## Storybook

- Comando: `npm run build-storybook`
- Esito: success

## Verifica browser (Playwright)

Verifica eseguita con Playwright 1.61.1 (Chromium headless).

| Passaggio | Risultato |
|-----------|-----------|
| Pagina caricata | ✓ |
| Vista pilot renderizzata | ✓ |
| Modalità contributo | ✓ |
| Inizializzazione | ✓ |
| Picker sorgente visibile | ✓ |
| Nodo sorgente selezionato | ✓ |
| Nodo destinazione selezionato | ✓ |
| Form collegamento visibile | ✓ |
| Suggerimenti visibili (2: Continuità HIGH, Sviluppo MEDIUM) | ✓ |
| Proposte 1–3 | ✓ |
| Badge confidenza | ✓ |
| "Ignora" presente | ✓ |
| Rationale auto-popolata dopo "Usa questa proposta" | ✓ |
| Tipo relazione auto-selezionato | ✓ |
| Rationale modificabile dopo auto-fill | ✓ |
| 6 tipi di relazione | ✓ |
| Override manuale funziona | ✓ |
| Nessun auto-confirm | ✓ |
| Nessun errore console | ✓ |

**Risultato: 19/19 controlli passati**

## Nodi del suggerimento engine

| Regola | Tipo | Confidenza | Condizione |
|--------|------|------------|------------|
| Cross-level senza overlap | discontinuity | low | segmenti diversi, nessun overlap |
| Cross-level con overlap | development | medium | segmenti diversi, overlap tematico |
| Stesso tipo + overlap | continuity | high | stesso type, overlap tematico |
| Stesso tipo senza overlap | development | high | stesso type, nessun overlap |
| objective → competence | integration | medium | tipi incrociati |
| competence → objective | development | medium | tipi incrociati |
| Tipi diversi + overlap | integration | medium | tipi diversi, overlap tematico |
| Statistica + dati | deepening | high | entrambi trattano dati |
| Geometria piana → spazio | prerequisite | high | geometria piana prerequisito |
| Milestone + overlap | prerequisite | high | traguardi con overlap |
| Stesso segmento + tipo fallback | continuity | low | fallback same-segment |
| Assoluto fallback | integration | low | ultimo ricorso |

Totale: 13 regole, max 3 suggerimenti per coppia, ordinati per confidenza.

## Limiti noti

1. Suggerimenti basati su testo e metadati; non analizzano contenuto pedagogico profondo
2. Non ci sono suggerimenti per relazioni cross-segmento senza overlap (solo "discontinuità")
3. Il max di 3 suggerimenti è arbitrario; potrebbe non coprire tutte le combinazioni valide
4. Nessun apprendimento adattativo: le regole sono fisse

## Dichiarazione di immutabilità

Questa baseline è congelata al commit HEAD sul branch `feat/cml-631i-assisted-pedagogical-relation-suggestions`.

Le modifiche rispetto alla baseline 03:
- Aggiunta engine di suggerimenti pedagogici (CML-631I)
- Integrazione UI suggerimenti nel form di collegamento
- Test e documentazione CML-631I
- Aggiornamento protocollo validazione con indicatori suggerimenti

Non sono state introdotte:
- nuove dipendenze
- telemetria o servizi remoti
- modifiche alla persistenza
- modifiche non pertinenti

La baseline `CML-631F-BASELINE-01` e `CML-631F-BASELINE-02` sono revocate.
La baseline `CML-631F-BASELINE-03` è supersedata.
