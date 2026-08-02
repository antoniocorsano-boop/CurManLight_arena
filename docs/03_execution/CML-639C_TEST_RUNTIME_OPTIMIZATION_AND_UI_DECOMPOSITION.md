# CML-639C — Test Runtime Optimization and UI Suite Decomposition

## Identificazione

- Branch: `feat/cml-636b-canonical-document-preview-export`
- HEAD iniziale: `bb5f570d98ee56a1947a16d3906e69d80fd07672`
- Obiettivo: ridurre il feedback locale e separare le verifiche UI senza modificare il prodotto o ridurre la copertura.

## Baseline CML-639B e misurazione iniziale

La baseline storica CML-639B era `test:fast` a 25,2 s reali nell'ultima esecuzione, suite UI oltre 90 s e T0 oltre 10 s.

La baseline ripetuta prima di CML-639C ha prodotto:

| Comando | Esecuzioni | Minimo | Massimo | Mediana | Budget |
| --- | ---: | ---: | ---: | ---: | ---: |
| `typecheck` | 3 | 20,39 s | 26,32 s | 20,62 s | 10 s |
| `test:fast` | 5 | 6,03 s | 22,76 s | 6,67 s | 20 s |
| `test:ui` | 1 | 94,07 s | 94,07 s | 94,07 s | 90 s |

La baseline fast ha eseguito sempre 8 file e 273 test. I tempi interni Vitest osservati nelle cinque ripetizioni sono stati 18,66 s, 2,82 s, 4,45 s, 4,26 s e 7,32 s: il costo esterno e l'avvio dei processi restano variabili.

## Diagnosi T0

`tsconfig.json` controlla `src`, usa `strict`, `skipLibCheck` e `moduleResolution: bundler`, ma non usa `incremental`, `composite` o `tsBuildInfoFile`. Non risultano inclusi test browser, Storybook, Playwright, `dist` o `storybook-static`.

Il fallimento ripetibile corrente è indipendente dal tempo: l'ambiente contiene `@types/node@26.1.2` extraneous, mentre `AgentSetupModal.tsx` conserva una ref `number[]` per gli interval browser. Il merge delle dichiarazioni Node/DOM produce dieci errori `Timeout`/`number`. Anche il comando diagnostico con tipi espliciti non li elimina. Non viene modificato il prodotto né ridotto il controllo TypeScript per nascondere l'errore.

## Diagnosi T2 e worker

La configurazione fast usa pool `threads`, due worker, file parallelism, ambiente Node e nessun setup globale. Questa separazione resta la scelta meno costosa per la suite di dominio; la variabilità residua è ambientale e di bootstrap.

Per la UI, il primo confronto esteso di nove lanci (tre modalità per tre ripetizioni) è terminato per timeout del processo aggregatore senza restituire una tabella affidabile; i processi Vitest residui sono stati identificati e terminati. Non viene dichiarato un vincitore non misurato.

## Analisi UI, setup e teardown

Il setup comune contiene soltanto `@testing-library/jest-dom`; non carica IndexedDB, Storybook, Playwright, dataset o store. La suite UI completa includeva 31 file `.test.tsx`, con costo interno rilevante di import, ambiente JSDOM e trasformazione.

La ricerca dei rischi di teardown ha censito timer, listener, `URL.createObjectURL`, IndexedDB, store subscription e fake timers. I test che usano queste risorse restano nelle suite workflow/extended o documents; non vengono introdotti reset globali costosi.

## Modifiche implementate

- aggiunto `vitest.ui-suites.ts` per la configurazione comune delle suite UI;
- aggiunte configurazioni esplicite `ui-smoke`, `ui-documents`, `ui-workflow` e `ui-extended`;
- aggiunti gli script `test:ui:smoke`, `test:ui:documents`, `test:ui:workflow`, `test:ui:extended`;
- aggiunto `typecheck:full` come verifica completa separata;
- esteso `verify:documents` a `typecheck + test:fast + test:documents + build`;
- nessuna modifica a funzionalità, routing, shell o dominio applicativo.

## Classificazione delle suite

| Suite | File | Scopo | Copertura |
| --- | ---: | --- | --- |
| `ui:smoke` | 2 | montaggio principale e interazione essenziale | app header, classroom |
| `ui:documents` | 5 | documenti canonici, preview, continuità e regressioni | CML-631F, CML-636B, CML-638B |
| `ui:workflow` | 13 | workspace, navigazione, wizard e integrazioni guidate | workflow e transfer |
| `ui:extended` | 11 | scenari lunghi, copilot, integrazioni e fixture complesse | suite UI precedentemente completa |

Ogni file UI precedente è presente in una sola nuova suite. Nessun test è stato eliminato.

## Matrice di riclassificazione

| File / gruppo | Suite precedente | Nuova suite | Copertura mantenuta | Motivo |
| --- | --- | --- | --- | --- |
| `app-header-task10`, `classroom-task10` | `test:ui` | `ui:smoke` | sì | feedback essenziale |
| `cml-631f-r1`, `cml-636b`, `document-continuity`, `guided-workflow-document`, `cml-638b-a07` | `test:ui` | `ui:documents` | sì | rischio documentale |
| workspace, navigation, guided workflow, interaction, transfer, pilot, social | `test:ui` | `ui:workflow` | sì | flussi guidati non necessari a ogni commit |
| modal, knowledge, institution, copilot, activity, AI, empty state e scenari lunghi | `test:ui` | `ui:extended` | sì | fixture o integrazioni costose |

## Misure dopo l'implementazione

Le prime verifiche degli script hanno dato:

| Comando | Risultato osservato |
| --- | --- |
| `test:ui:smoke` | 2 file, 8 test PASS, 47,7 s reali in una esecuzione |
| `test:ui:documents` | 5 file, 86 test PASS, 44,3 s reali in una esecuzione |

Il primo smoke precedente alla codifica, con gli stessi due file, era 22,5 s; la differenza conferma che il limite principale è la variabilità ambientale del bootstrap JSDOM, non la copertura dei test. Le misure finali ripetute sono registrate nella sezione seguente quando completate.

## Budget, limitazioni e rischi residui

- T0 resta sopra il budget e attualmente è bloccato da errori TypeScript ambientali ripetibili;
- T2 fast ha mediana iniziale sotto 20 s ma massimo sopra 25 s, quindi non è ancora stabile;
- il budget smoke non è dimostrato in modo stabile;
- suite completa e Storybook restano verifiche separate e possono essere bloccate da `spawn EPERM`;
- il confronto worker UI aggregato è stato interrotto per timeout e non viene usato come evidenza;
- nessuna modifica funzionale è stata introdotta.

## Piano successivo

1. risolvere nell'ambiente la provenienza di `@types/node@26.1.2` oppure correggere separatamente il contratto browser degli interval con attività dedicata;
2. ripetere le misure UI in processi singoli con timeout individuale;
3. valutare un setup JSDOM minimale solo se una misura dimostra un beneficio affidabile;
4. mantenere full suite, browser e Storybook fuori dal ciclo ordinario.

## Verdetto

```text
CML_639C_RUNTIME_OPTIMIZATION_PARTIAL
CML_639C_UI_SUITES_DECOMPOSED
CML_639C_ADDITIONAL_PERFORMANCE_WORK_REQUIRED
```

La struttura delle suite è stata migliorata e la copertura è mantenuta, ma i target prestazionali T0/T2/UI non sono ancora dimostrati in modo stabile.
## Addendum � misure finali richieste

| Comando | Risultato finale |
| --- | --- |
| test:related -- src/domain/documents/repository.ts | 3/3 PASS, 13 file/272 test, 24,10�26,05 s reali, mediana 24,75 s |
| test:fast | 5/5 PASS, 8 file/273 test, 8,02�20,94 s reali, mediana 10,28 s |
| test:ui:smoke | 3/3 PASS, 2 file/8 test, 20,43�23,86 s reali, mediana 23,80 s |
| test:ui:documents | PASS, 5 file/86 test, 41,13 s reali |
| test:ui:workflow | PASS, 13 file/100 test, 77,00 s reali |
| test:ui:extended | PASS, 11 file/300 test, 62,80 s reali |
| test:documents | PASS, 10 file/234 test |
| build | PASS, 1.753 moduli trasformati, 33,42 s interni |

Le quattro suite UI coprono complessivamente 31 file e 494 test (8 + 86 + 100 + 300), uguali alla suite UI precedente. Il budget smoke e il budget documents sono raggiunti nelle misure finali; T1 related resta sopra il budget.

## Verdetto aggiornato

CML_639C_RUNTIME_OPTIMIZATION_PARTIAL
CML_639C_UI_SUITES_DECOMPOSED
CML_639C_ADDITIONAL_PERFORMANCE_WORK_REQUIRED
