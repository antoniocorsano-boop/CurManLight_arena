# CML-631F — Chiusura del percorso di validazione esperta (Expert Validation Track Closure)

> Nota di chiusura tecnica del percorso esperto CML-631F (S0 → R1 → R2 → C1).
> **Non dichiara CML-631F completata**: la validazione con docenti reali resta una condizione aperta della roadmap.
> Nota versionata con il consolidamento C1; il rapporto `CML-631F-S0_EXPERT_SELF_TEST.md` resta locale e non committato.

## Identificazione

| Campo | Valore |
|-------|--------|
| Fase | CML-631F — Real Teacher Validation (percorso esperto: S0, R1, R2, C1) |
| Ramo | `feat/cml-636b-canonical-document-preview-export` |
| HEAD di riferimento | `7daa00f2974191b253e4af0717f73021ce2c67ae` (approvazione protocollo) |
| Rapporto di riferimento | `docs/03_execution/CML-631F-S0_EXPERT_SELF_TEST.md` (sezioni originali + Appendici A e B; NON committato) |
| Data | 2026-08-02 |

## Evidenze acquisite

1. **Autovalutazione esperta iniziale (S0)** completata: percorso S1–S10 esercitato, verdetto preliminare `CORRECT_PRODUCT_BEFORE_EXTERNAL_VALIDATION`.
2. **Problemi bloccanti e significativi identificati** (P1–P4): recovery attore non percorribile su documenti esistenti; archiviazione `draft→archived` con fallimento silenzioso; nessuna UI di avanzamento stato; scenario 7 (modifica→nuova resa) non esercitabile.
3. **Correzioni implementate (R1)**: `applyDocumentActorContext` (recupero attore senza ricreazione, nuova versione con snapshot `declaredRole`), `createDocumentRevision` (nuova versione con motivo, snapshot ereditato), UI `CanonicalDocumentTab` (transizioni di stato, errore esplicito archiviazione, pannello recovery, creazione versione, autore in card, banner read-only, notifiche `aria-live`). Fix N1: permanenza della notifica "Documento archiviato.".
4. **Riesecuzione focalizzata S6–S10 (R1)** superata (PASS); evidenza in `Temp\opencode\cml631f-r1\`.
5. **Riesecuzione pulita S1–S10 (R2)** superata da stato applicativo vuoto: 42/42 controlli, 0 errori console, 12/12 controlli specifici R1; evidenza in `Temp\opencode\cml631f-r2\`.
6. **Nessun problema bloccante o significativo residuo**: unica osservazione O1 (vedi sotto), rinviata alla verifica con utente indipendente.
7. **Consolidamento (C1)**: differenziale classificato, verifiche tecniche verdi, commit atomico delle sole correzioni prodotto (codice + test R1).

## Limiti

- **Stesso soggetto** nei ruoli di progettista, correttore e valutatore.
- **Elevata familiarità** con flussi e terminologia del prodotto.
- **Automazione Playwright** non equivalente all'esperienza spontanea di un docente.
- **Nessuna evidenza** sulla comprensibilità iniziale per utenti esterni.

## Osservazione O1 (registrata, non corretta)

```text
O1 — Il recupero dell'attore genera una nuova versione documentale.

Classificazione: osservazione.
Gravità: non bloccante.
Motivazione tecnica: conservazione della tracciabilità e della provenienza
(institutionalSnapshot.declaredRole applicato su nuova versione).
Questione aperta: comprensibilità della numerazione delle versioni per un utilizzatore indipendente.
Decisione: nessuna modifica preventiva; verificare durante la futura validazione reale.
```

O1 non è trasformata in difetto significativo in assenza di evidenza fornita da un utilizzatore indipendente.

## Verifiche tecniche (consolidamento)

| Verifica | Risultato |
|----------|-----------|
| `npx tsc --noEmit` | 0 errori |
| Test focalizzati R1 | 2 file, 26 test superati |
| Suite completa (`npm test`) | 105 file, 1981 test superati; nessun test ignorato |
| `npm run build` | Superata (dist `index.html`, gzip 326.07 kB) |
| `npm run build-storybook` | Superata |
| `git diff --cached --check` | Superata, nessun errore di spaziatura |

## Commit di consolidamento

- Singolo commit atomico: `fix(documents): complete CML-631F pre-validation corrections`.
- Contenuto: codice R1 (`src/domain/documents/index.ts`, `src/domain/documents/repository.ts`, `src/features/documents/components/CanonicalDocumentTab.tsx`), test R1 (`src/__tests__/cml-631f-r1-regression.test.ts`, `src/__tests__/cml-631f-r1-canonical-ui.test.tsx`) e questa nota di chiusura C1.
- Esclusi dal commit: `docs/03_execution/CML-631F-S0_EXPERT_SELF_TEST.md` (rapporto di validazione, evidenza locale non versionata), `session/`, evidenze temporanee in `Temp\opencode\`.
- Nessun push, merge, rebase o PR.

## Stato finale

```text
CML_631F_EXPERT_VALIDATION_TRACK_COMPLETE
CML_631F_PRODUCT_READY_FOR_INDEPENDENT_VALIDATION
CML_631F_INDEPENDENT_VALIDATION_DEFERRED
CML_631F_REAL_TEACHER_VALIDATION_NOT_YET_EXECUTED
CML_631F_REQUIRES_REAL_VALIDATION
```

Verdetto di consolidamento atteso: **`CML_631F_C1_PRODUCT_CORRECTIONS_CONSOLIDATED_LOCAL`**.

Non utilizzare:

```text
CML_631F_COMPLETE
CML_631F_REAL_TEACHER_VALIDATION_COMPLETE
CML_631F_VALIDATED_WITH_TEACHERS
```

CML-631F resta aperta esclusivamente per la futura evidenza indipendente, senza bloccare tecnicamente le successive estensioni del prodotto.
