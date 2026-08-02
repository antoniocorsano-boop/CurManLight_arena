# CML-639B — Fast Deterministic Test Execution Model

## 1. Identificazione

| Campo | Valore |
|---|---|
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD iniziale | `118e4b1efde516b84921cef99963ce0a565182ff` |
| Baseline | CML-639A, commit `dc90833` + correzione `118e4b1` |
| Data | 2026-08-03 |
| Modifiche funzionali prodotto | Nessuna |
| Obiettivo | separare bootstrap, ambiente e suite per ridurre il feedback locale |

## 2. Baseline CML-639A

Prima di CML-639B:

| Indicatore | Prima |
|---|---:|
| `test:fast` tempo interno Vitest | 30,29 s |
| `test:fast` tempo reale | 44,73 s |
| 8 avvii singoli | 112,37 s |
| Suite completa | oltre 364 s, non conclusa |
| Storybook | `spawn EPERM` |

## 3. Diagnostica del costo fisso

Il test vuoto temporaneo è stato eseguito tre volte e poi rimosso. La suite principale usava JSDOM e importava `cjsEsmBridge` dal file multi-progetto `vitest.config.ts`; questo caricava indirettamente dipendenze Storybook/Playwright anche per `test:fast`.

| Tipo | File | Tempo interno mediano | Tempo reale mediano | Sovraccosto | Ambiente |
|---|---|---:|---:|---:|---|
| vuoto | `cml-639b-empty.test.ts` | 9,57 s | 26,16 s | 16,59 s | JSDOM + setup |
| dominio | `academicYear.test.ts` | 9,23 s | 32,57 s | 23,34 s | JSDOM + setup |
| UI | `app-header-task10.test.tsx` | 12,24 s | 30,55 s | 18,31 s | JSDOM + Testing Library |
| persistenza | `cml-638b-persistence.test.ts` | 10,20 s | 28,74 s | 18,54 s | JSDOM + storage |

Probe minima senza configurazione multi-progetto, JSDOM o setup globale:

- test vuoto: 2,68 s reali, 210 ms interni;
- dominio: 3,15 s reali, 1,02 s interni.

Questo conferma che il costo primario è bootstrap/configurazione/ambiente, non il numero di asserzioni.

## 4. Pool e worker

Con il test vuoto e configurazione preesistente, i confronti singoli hanno dato:

| Configurazione | Tempo reale | Esito |
|---|---:|---|
| `--pool=threads` | 15,63 s | PASS |
| `--pool=forks` | 16,93 s | PASS |
| `--maxWorkers=1` | 13,54 s | PASS |
| `--maxWorkers=2` | 12,91 s | PASS |
| `--no-file-parallelism` | 15,16 s | PASS |

Due worker e parallelismo file sono il compromesso più rapido osservato, ma il vantaggio è secondario rispetto alla rimozione di JSDOM e dell’import multi-progetto.

## 5. Setup e teardown

`src/__tests__/setup.ts` importa soltanto `@testing-library/jest-dom`; non inizializza IndexedDB, store, server, timer o processi. È però costoso quando viene caricato insieme a JSDOM in ogni file.

| Operazione | Necessaria per tutti | Solo UI | Solo persistenza | Decisione |
|---|---:|---:|---:|---|
| `jest-dom` | no | sì | no | rimosso da `test:fast` |
| JSDOM | no | sì | sì, quando usa window/storage | escluso dal dominio/fast |
| IndexedDB reale | no | no | browser | resta T5 |
| reset Zustand/localStorage | no | sì/integrazione | sì | setup locale al file |
| timer reali | no | alcuni test | alcuni provider | non aggiungere teardown generico |

Non sono stati introdotti teardown generici. La suite completa è stata tentata una sola volta con timeout di 180 s; non ha prodotto summary e il processo Vitest residuo è stato terminato esplicitamente. Il problema residuo è quindi runner/aggregazione/teardown da isolare ulteriormente, non dimostrato come leak di una singola fixture.

## 6. Modifiche implementate

1. Estratto `cjsEsmBridge` in `vitest.shared.ts`, evitando che la suite fast importi l’intero config Storybook/Playwright.
2. Portato `vitest.fast.config.ts` a `environment: 'node'`, senza `setupFiles` globale.
3. Creati config separati:
   - `vitest.unit.config.ts` — unità JSDOM complete;
   - `vitest.domain.config.ts` — dominio Node;
   - `vitest.ui.config.ts` — React/JSDOM;
   - `vitest.persistence.config.ts` — persistence/JSDOM.
4. Aggiunti script `typecheck`, `test:related`, `test:documents`, `test:curriculum`, `test:persistence`, `test:ui`, `verify:fast`, `verify:documents`, `verify:storybook`.
5. Mantenuto `test:full` come comando separato `vitest run`; non è incluso nei gate locali rapidi.
6. Corretti i falsi positivi `if (!result.success/ok) return` nelle aree transfer, document repository, integration e caricamento pilota, con asserzione esplicita e narrowing.
7. Creata la fixture pilota `src/__tests__/fixtures/documents.ts`, usata dal test UI CML-631F.

Nessun test è stato eliminato. I test spostati in suite specifiche restano presenti.

## 7. Prestazioni prima/dopo

### Misure ripetute dopo le modifiche

| Comando | Prima | Mediana dopo | Intervallo osservato | Budget | Esito |
|---|---:|---:|---:|---:|---|
| `npm run typecheck` | n.d. | 23,71 s | 20,99–27,99 s | 10 s | fuori budget |
| `npm run test:related -- src/domain/documents/repository.ts` | n.d. | 10,53 s | 10,31–11,41 s | 15 s | PASS |
| `npm run test:fast` | 44,73 s | 8,77 s | 7,29–9,15 s | 20 s | PASS |
| `npm run test:documents` | n.d. | 7,78 s | 7,69–9,80 s | 90 s | PASS |
| `npm run build` | n.d. | 24,76 s | 24,38–29,93 s | separato | PASS |

`test:fast` conserva 8 file e 273 test, ma passa da 44,73 s a una mediana reale di 8,77 s: riduzione osservata circa 80,4%.

Conferme aggiuntive:

- `test:documents`: 10 file, 234 test passati, 10,37 s in una misura precedente;
- `test:curriculum`: 11 file, 425 test passati, circa 4,4 s in una misura di conferma;
- `test:persistence`: 6 file, 68 test passati, 23,46 s;
- `test:ui`: 31 file, 494 test passati, 102,8 s; supera il budget area e resta da ottimizzare.

## 8. Copertura mantenuta

La suite fast mantiene tutti i suoi 273 test. CML-631F mantiene i 26 test focalizzati. Le aree documents, curriculum, persistence e UI hanno comandi distinti; la UI non è stata compressa nella suite fast per ottenere artificialmente il budget.

## 9. Falsi positivi corretti

Sono stati modificati sette file di test nelle aree indicate da CML-639A. Le guardie che potevano terminare il test senza asserire il successo ora eseguono `expect(...).toBe(true)` e lanciano un errore di narrowing se il risultato resta fallito. Restano deliberate le guardie già espresse come `throw new Error(...)` e i rami in cui il fallimento è il comportamento atteso.

## 10. Fixture pilota

`src/__tests__/fixtures/documents.ts` centralizza documento didattico minimo, snapshot istituzionale, attore docente e source reference opzionale. È stata applicata al test UI CML-631F; ulteriori estrazioni restano per una fase successiva per evitare una riscrittura massiva.

## 11. Modello T0–T5

| Livello | Script/config | Uso |
|---|---|---|
| T0 | `npm run typecheck` | ogni modifica; il budget ≤10 s non è ancora raggiunto |
| T1 | `npm run test:related -- <source>` | rischio dominio correlato; mediana 10,53 s |
| T2 | `npm run test:fast` / `verify:fast` | ogni commit locale; mediana 8,77 s |
| T3 | `test:documents`, `test:curriculum`, `test:persistence`, `test:ui` | area mirata |
| T4 | `test:full` | CI/notturno, fuori commit locale |
| T5 | `test:browser`, `verify:storybook` | pipeline browser separata |

## 12. Limiti ambientali

Persistono due limiti:

- esecuzioni concorrenti possono produrre `spawn EPERM` durante il bundling esbuild;
- `npm test` supera 180 s senza summary; non è stato dichiarato PASS e il processo è stato chiuso.

Storybook resta separato e la precedente diagnosi `spawn EPERM` in `Building manager..` resta valida.

## 13. Rischi residui e piano successivo

- T0 TypeScript è sopra budget: valutare incremental build, progetto TS separato o cache in una fase dedicata.
- T3 UI è sopra 90 s: dividere UI per area e ridurre setup/montaggi prima di estrarre test.
- T4 richiede un ambiente dedicato con teardown osservabile.
- `test:related` è ottimizzato per sorgenti di dominio; modifiche UI devono usare `test:ui` o una related UI dedicata.
- Le fixture condivise vanno estese solo con misure di beneficio.

## 14. Verdetto

```text
CML_639B_EXECUTION_MODEL_IMPLEMENTED_PARTIAL_PERFORMANCE_TARGETS
CML_639B_FURTHER_OPTIMIZATION_REQUIRED
```

Il modello T1–T3 è funzionante e T2 è sostenibile nel ciclo locale. T0 e T3 UI non rispettano ancora i budget; full suite e Storybook restano separati e non verificati integralmente.

## Rapporto finale

| Voce | Risultato |
|---|---|
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD iniziale | `118e4b1efde516b84921cef99963ce0a565182ff` |
| Test vuoto | mediana 26,16 s JSDOM; probe Node 2,68 s |
| Bootstrap | causa primaria: JSDOM/setup + import config multi-progetto |
| Worker migliori | threads, maxWorkers 2; vantaggio secondario |
| Setup globale | rimosso da fast; conservato per UI/persistence |
| Teardown | suite completa ancora bloccata; nessun teardown generico aggiunto |
| Script introdotti | typecheck, related, documents, curriculum, persistence, ui, verify |
| Configurazioni create | shared, unit, domain, ui, persistence |
| Falsi positivi corretti | sette file, aree transfer/document/integration |
| Fixture condivise | fixture documents pilota |
| Typecheck reale | PASS, mediana 23,71 s; budget non raggiunto |
| Test related reale | 13 file/272 test, mediana 10,53 s |
| Test fast prima/dopo | 44,73 s → 8,77 s reali; 273 test PASS |
| Test documents | 10 file/234 test PASS, mediana 7,78 s |
| Build | PASS, mediana 24,76 s |
| Suite completa | timeout 180 s, non conclusa |
| Storybook | `spawn EPERM`, separato |
| File locali esclusi | `kilo.jsonc`, rapporto S0, `session/` |
| Modifiche funzionali | Nessuna |
| Verdetto | modello implementato; T0 e UI richiedono ulteriore ottimizzazione |
