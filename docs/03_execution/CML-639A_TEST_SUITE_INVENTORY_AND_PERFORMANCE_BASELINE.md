# CML-639A — Test Suite Inventory and Performance Baseline

## 1. Identificazione

| Campo | Valore |
|---|---|
| Repository | `antoniocorsano-boop/CurManLight_arena` |
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD analizzato | `6591ebd73a3d34618c762f91f53fca3f75fd8d36` |
| Data | 2026-08-03 |
| Ambito | inventario, misurazione e proposta; nessuna modifica funzionale |
| Ambiente | Windows, Node `v24.13.1`, npm `11.7.0`, Vitest `4.1.10` |

Il worktree contiene esclusivamente modifiche locali già escluse dal branch: `kilo.jsonc`, il rapporto S0 e la directory `session/`. Nessun file di prodotto o test è stato modificato da CML-639A.

## 2. Metodo e limiti

Sono stati analizzati gli script, le configurazioni, i setup condivisi, i file di test, le storie Storybook e i workflow presenti nel repository. Il censimento statico conta le dichiarazioni `it/test`; le dichiarazioni parametrizzate `it.each/test.each` sono marcate con `*` e possono espandersi in più casi eseguiti.

Misure eseguite:

- `npm run test:fast`: exit 0, 8 file e 273 test passati; durata Vitest 30,29 s, tempo parete 44,73 s.
- Esecuzione individuale dei medesimi 8 file: tutti exit 0, da 11,20 s a 14,97 s.
- `npx vitest list --project unit --json`: non completato entro 120 s; nessun conteggio viene inventato.
- La suite completa precedente (`npm test`) aveva superato 364 s senza riepilogo; in questa sessione la raccolta completa ha nuovamente superato il timeout operativo senza summary.
- `npm run build-storybook`: già riprodotto con `spawn EPERM` in `Building manager..`; non viene classificato come PASS.

Per i file non appartenenti a `test:fast`, la durata per file è `NOT_MEASURED_ENVIRONMENT_BLOCKED`: l’esecuzione singola dell’intero inventario non è stata possibile in modo riproducibile entro il budget, e non sono stati fabbricati tempi.

## 3. Configurazioni analizzate

| File | Funzione | Suite coinvolta | Dipendenze ambientali | Criticità |
|---|---|---|---|---|
| `package.json` | script `test`, `test:fast`, progetti separati, build | tutte | Node/npm, esbuild, Chromium, Storybook | `npm test` usa il progetto Vitest multi-suite; `test:fast` è separata e curata manualmente |
| `vitest.config.ts` | tre progetti: `unit`, `indexeddb-browser`, `storybook` | completa, browser, Storybook | JSDOM, worker threads, Playwright Chromium, Storybook addon | un comando aggrega ambienti diversi e può attendere processi/browser |
| `vitest.fast.config.ts` | otto file unitari scelti, pool threads, max 2 worker | `test:fast` | JSDOM, esbuild, worker threads | nessun test UI, persistence, browser o Storybook; copertura concentrata su AI/identity/transfer/revision |
| `vite.config.ts` | React + `vite-plugin-singlefile`, bundle inline | build applicativa | esbuild/Rollup | non è un test runner; build costosa ma deterministica |
| `src/__tests__/setup.ts` | registra `jest-dom` | unità e fast | JSDOM/Testing Library | setup comune importato da ogni file unitario |
| `.storybook/main.ts` | cinque glob story, addon a11y/docs | Storybook build/test | Storybook 10.5.5, Vite, esbuild | build fallisce prima della compilazione delle storie con `spawn EPERM` |
| `.storybook/preview.tsx` | importa CSS globale e parametri controls | Storybook | Vite/CSS | semplice; non causa evidente del blocco |
| Playwright standalone | `curmanlight.spec.js` | E2E esterno a Vitest | Playwright, `dist/index.html`, onboarding, file URL | non è incluso negli script npm e contiene 29 test E2E legacy |
| `.github/workflows/**` | nessun workflow test rilevato | — | — | manca una pipeline versionata che separi unit, browser e Storybook |

## 4. Inventario completo dei test

Il repository contiene 100 file sotto `src/` con pattern di test: 98 file nel progetto Vitest `unit` e 2 file nel progetto `indexeddb-browser`. Sono censite 1.855 dichiarazioni `it/test`, di cui 15 parametrizzate. `curmanlight.spec.js` è un test Playwright standalone aggiuntivo e non rientra nei glob Vitest.

Legenda: `*` = contiene almeno una dichiarazione parametrizzata; `NOT_MEASURED_ENVIRONMENT_BLOCKED` = durata non ottenuta senza forzare una suite completa già bloccata.

| File | Area | Categoria | Test | Ambiente | Suite attuale | Durata | Note |
|---|---|---:|---:|---|---|---|---|
| `src/__tests__/academicYear.test.ts` | miscellaneous | unit | 14 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | utility |
| `src/__tests__/ai-provider-implementation.test.ts` | AI/integration | unit | 6 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | provider |
| `src/__tests__/app-header-task10.test.tsx` | miscellaneous | ui | 1 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | header |
| `src/__tests__/classroom-task10.test.tsx` | workflow/UI | ui | 7 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | classroom |
| `src/__tests__/cml610-empty-states.test.tsx` | miscellaneous | ui | 4 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | empty states |
| `src/__tests__/cml611-dialogs-confirmations.test.tsx` | miscellaneous | ui | 37 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | dialogs |
| `src/__tests__/cml617b-activity.test.tsx` | workflow/UI | ui | 48 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | activity |
| `src/__tests__/cml-631f-r1-canonical-ui.test.tsx` | documents/export/preview | ui | 9 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | CML-631F |
| `src/__tests__/cml-631f-r1-regression.test.ts` | documents/export/preview | unit | 17 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | CML-631F |
| `src/__tests__/cml-633j-data-authority.test.ts` | miscellaneous | unit | 4 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | authority |
| `src/__tests__/cml-633j-document-export.test.ts` | documents/export/preview | unit | 5 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | export |
| `src/__tests__/cml-633j-end-to-end-flow.test.tsx` | miscellaneous | ui | 7 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | flow |
| `src/__tests__/cml-633j-legacy-containment.test.ts` | persistence/migration | integration/persistence | 6 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | legacy |
| `src/__tests__/cml-633j-migration.test.ts` | persistence/migration | integration/persistence | 4 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | migration |
| `src/__tests__/cml-633j-navigation.test.ts` | workflow/UI | unit | 6 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | navigation |
| `src/__tests__/cml-633j-rehydration.test.ts` | persistence/migration | integration/persistence | 4 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | rehydration |
| `src/__tests__/cml-634a-ai-provider-boundary.test.ts` | AI/integration | unit | 14 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | boundary |
| `src/__tests__/cml-634b-ai-provider-implementation.test.ts` | AI/integration | unit | 4 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | provider |
| `src/__tests__/cml-634b-ai-provider-pilot.test.ts` | AI/integration | unit | 32 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | pilot |
| `src/__tests__/cml-634b-local-provider-integration.test.ts` | AI/integration | integration/persistence | 18 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | local provider |
| `src/__tests__/cml-634b-r4b-teacher-local-ai-ui.test.tsx` | workflow/UI | ui | 55 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | local AI UI |
| `src/__tests__/cml-634b-r4-teacher-local-ai-interface.test.ts` | workflow/UI | unit | 19 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | local AI interface |
| `src/__tests__/cml-636b-canonical-preview-ui.test.tsx` | documents/export/preview | ui | 16 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | preview UI |
| `src/__tests__/cml-636b-exportability-validator.test.ts` | documents/export/preview | unit | 27 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | exportability |
| `src/__tests__/cml-636b-preview-persistence-integration.test.ts` | documents/export/preview | integration/persistence | 12 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | persistence |
| `src/__tests__/cml-636b-preview-rendering.test.ts` | documents/export/preview | unit | 43 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | rendering |
| `src/__tests__/cml-638b-a07-canonical-ui.test.tsx` | documents/export/preview | ui | 3 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | canonical UI |
| `src/__tests__/cml-638b-hook.test.tsx` | documents/export/preview | ui | 4 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | hook |
| `src/__tests__/cml-638b-mapping-a03-document.test.ts` | documents/export/preview | unit | 12* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | mapping |
| `src/__tests__/cml-638b-mapping-a04-document.test.ts` | documents/export/preview | unit | 15 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | mapping |
| `src/__tests__/cml-638b-persistence.browser.test.ts` | documents/export/preview | browser | 4 | Chromium | indexeddb-browser | NOT_MEASURED_ENVIRONMENT_BLOCKED | IndexedDB |
| `src/__tests__/cml-638b-persistence.test.ts` | documents/export/preview | integration/persistence | 6 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | persistence |
| `src/__tests__/cml-638b-production-service.test.ts` | documents/export/preview | unit | 7 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | service |
| `src/__tests__/copilot.test.tsx` | workflow/UI | ui | 12 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | copilot |
| `src/__tests__/copilot-authority-task10.test.ts` | workflow/UI | unit | 1* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | authority |
| `src/__tests__/curriculumBaseline.test.ts` | curriculum/workflow | unit | 9 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | baseline |
| `src/__tests__/curriculum-domain/curriculum-domain.test.ts` | curriculum/workflow | unit | 55 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | domain |
| `src/__tests__/curriculum-domain/curriculum-domain-cml633c.test.ts` | curriculum/workflow | unit | 61 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | domain |
| `src/__tests__/curriculum-domain/curriculum-public-api-compatibility.test.ts` | curriculum/workflow | unit | 2 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | public API |
| `src/__tests__/curriculum-etwin/etwin-domain.test.ts` | curriculum/workflow | unit | 35 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | e-twin |
| `src/__tests__/curriculum-functional-pilot/cml631e-data-loading.test.ts` | curriculum/workflow | unit | 8 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | loading |
| `src/__tests__/curriculum-functional-pilot/cml631g-pilot-init.test.tsx` | curriculum/workflow | ui | 9 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | pilot UI |
| `src/__tests__/curriculum-functional-pilot/cml631i-pedagogical-suggestion-engine.test.ts` | curriculum/workflow | unit | 18 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | suggestions |
| `src/__tests__/curriculum-functional-pilot/pilot-evaluation.test.ts` | curriculum/workflow | unit | 37 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | evaluation |
| `src/__tests__/curriculum-functional-pilot/pilot-service.test.ts` | curriculum/workflow | unit | 66 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | service |
| `src/__tests__/curriculum-persistence/migration.test.ts` | persistence/migration | integration/persistence | 22* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | migration |
| `src/__tests__/curriculum-persistence/repositories.test.ts` | persistence/migration | integration/persistence | 13* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | repository |
| `src/__tests__/curriculum-persistence/schema.browser.test.ts` | persistence/migration | browser | 1 | Chromium | indexeddb-browser | NOT_MEASURED_ENVIRONMENT_BLOCKED | IndexedDB |
| `src/__tests__/curriculum-persistence/schema.test.ts` | persistence/migration | integration/persistence | 5* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | schema |
| `src/__tests__/curriculum-transition-resolver.test.ts` | curriculum/workflow | unit | 72* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | resolver |
| `src/__tests__/curriculumTransitionUi.test.ts` | curriculum/workflow | unit | 12 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transition UI |
| `src/__tests__/dashboard-task10.test.tsx` | workflow/UI | ui | 0 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | no declarations found |
| `src/__tests__/design-transfer-a02.test.ts` | curriculum/workflow | unit | 11 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transfer |
| `src/__tests__/design-transfer-a03.test.ts` | curriculum/workflow | unit | 15 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transfer |
| `src/__tests__/design-transfer-domain.test.ts` | curriculum/workflow | unit | 19 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transfer domain |
| `src/__tests__/design-transfer-export.test.ts` | documents/export/preview | unit | 13 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transfer export |
| `src/__tests__/design-transfer-integration.test.tsx` | curriculum/workflow | ui | 3 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transfer UI |
| `src/__tests__/design-transfer-legacy.test.ts` | curriculum/workflow | integration/persistence | 9 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | legacy |
| `src/__tests__/design-transfer-repository.test.ts` | curriculum/workflow | integration/persistence | 15 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | repository |
| `src/__tests__/document-continuity.test.tsx` | documents/export/preview | ui | 55 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | continuity |
| `src/__tests__/document-domain.test.ts` | documents/export/preview | unit | 37 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | domain |
| `src/__tests__/document-export.test.ts` | documents/export/preview | unit | 28 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | export |
| `src/__tests__/document-integration.test.ts` | documents/export/preview | integration/persistence | 7 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | integration |
| `src/__tests__/document-legacy.test.ts` | documents/export/preview | integration/persistence | 19 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | legacy |
| `src/__tests__/document-rendering.test.ts` | documents/export/preview | unit | 27 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | rendering |
| `src/__tests__/document-repository.test.ts` | documents/export/preview | integration/persistence | 18 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | repository |
| `src/__tests__/document-transfer.test.ts` | documents/export/preview | unit | 11 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | transfer |
| `src/__tests__/guided-workflow-accessibility.test.tsx` | accessibility/workflow | ui | 1 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | accessibility |
| `src/__tests__/guided-workflow-curriculum-selection.test.tsx` | curriculum/workflow | ui | 5 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | selection |
| `src/__tests__/guided-workflow-design.test.tsx` | curriculum/workflow | ui | 3 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | design |
| `src/__tests__/guided-workflow-document.test.tsx` | documents/export/preview | ui | 3 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | document |
| `src/__tests__/guided-workflow-domain.test.ts` | workflow/UI | unit | 4 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | domain |
| `src/__tests__/guided-workflow-navigation.test.tsx` | workflow/UI | ui | 3 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | navigation |
| `src/__tests__/guided-workflow-recovery.test.ts` | workflow/UI | unit | 3 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | recovery |
| `src/__tests__/identity.test.ts` | identity/institution | unit | 70 | JSDOM | test:fast + unit | 14.58 s |
| `src/__tests__/institution-domain.test.ts` | identity/institution | unit | 55* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | domain |
| `src/__tests__/institution-hardcodes.test.ts` | identity/institution | unit | 13* | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | static hardcodes |
| `src/__tests__/institution-integration.test.tsx` | identity/institution | ui | 53* | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | integration |
| `src/__tests__/interaction.cml603d.test.tsx` | miscellaneous | ui | 5 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | interaction |
| `src/__tests__/knowledge-companion.test.tsx` | workflow/UI | ui | 39 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | knowledge |
| `src/__tests__/navigation.cml604d.test.tsx` | workflow/UI | ui | 8 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | navigation |
| `src/__tests__/revision-domain.test.ts` | workflow | unit | 44 | JSDOM | test:fast + unit | 14.90 s |
| `src/__tests__/role-onboarding-task10.test.ts` | identity/institution | unit | 4 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | onboarding |
| `src/__tests__/social-task10.test.tsx` | workflow/UI | ui | 3 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | social |
| `src/__tests__/storage.test.ts` | persistence/migration | integration/persistence | 17 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | local storage |
| `src/__tests__/teacher-workspace-part1.test.tsx` | workflow/UI | ui | 14 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | workspace |
| `src/__tests__/teacher-workspace-part2.test.tsx` | workflow/UI | ui | 28 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | workspace |
| `src/__tests__/teacher-workspace-part3.test.tsx` | workflow/UI | ui | 14 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | workspace |
| `src/__tests__/transfer-boundary.test.ts` | curriculum/workflow | unit | 38 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | boundary |
| `src/__tests__/transfer-domain.test.ts` | curriculum/workflow | unit | 97 | JSDOM | test:fast + unit | 14.72 s |
| `src/__tests__/transfer-errors.test.ts` | curriculum/workflow | unit | 10 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | errors |
| `src/__tests__/uda-detail-modal.test.tsx` | curriculum/workflow | ui | 18 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | modal |
| `src/__tests__/wikiLLM.test.ts` | workflow/UI | unit | 30 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | WikiLLM |
| `src/__tests__/workspace-neutral-state.test.ts` | miscellaneous | unit | 2 | JSDOM | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | neutral state |
| `src/domain/ai/executionService.test.ts` | AI/integration | unit | 6 | JSDOM | test:fast + unit | 14.33 s |
| `src/domain/ai/localOllamaProvider.test.ts` | AI/integration | unit | 13 | JSDOM | test:fast + unit | 13.83 s |
| `src/domain/ai/ollamaModelDiscovery.test.ts` | AI/integration | unit | 19 | JSDOM | test:fast + unit | 14.97 s |
| `src/domain/ai/ollamaTransport.test.ts` | AI/integration | unit | 14 | JSDOM | test:fast + unit | 13.84 s |
| `src/domain/ai/requestPreview.test.ts` | documents/export/preview | unit | 10 | JSDOM | test:fast + unit | 11.20 s |
| `src/features/ai/components/LocalAiModelSelector.test.tsx` | AI/integration | ui | 14 | JSDOM + Testing Library | unit | NOT_MEASURED_ENVIRONMENT_BLOCKED | selector |

The standalone `curmanlight.spec.js` contains 29 Playwright E2E tests, uses a file URL to `dist/index.html`, waits 1.2 seconds for onboarding, and is not included by any npm script listed in `package.json`.

## 5. Misurazioni e test più costosi

### 5.1 Suite rapida

| File | Test dichiarati | Durata singola |
|---|---:|---:|
| `src/domain/ai/ollamaModelDiscovery.test.ts` | 19 | 14.97 s |
| `src/__tests__/transfer-domain.test.ts` | 97 | 14.72 s |
| `src/__tests__/identity.test.ts` | 70 | 14.58 s |
| `src/__tests__/revision-domain.test.ts` | 44 | 14.90 s |
| `src/domain/ai/executionService.test.ts` | 6 | 14.33 s |
| `src/domain/ai/ollamaTransport.test.ts` | 14 | 13.84 s |
| `src/domain/ai/localOllamaProvider.test.ts` | 13 | 13.83 s |
| `src/domain/ai/requestPreview.test.ts` | 10 | 11.20 s |

Il costo medio apparente per test varia molto: `executionService` costa circa 2,39 s per dichiarazione, mentre `transfer-domain` circa 0,15 s. Questo indica che il tempo è principalmente startup/setup/JSDOM, non proporzionale al numero di asserzioni.

### 5.2 Top 20 per carico statico

La durata reale dei file non rapidi è `NOT_MEASURED_ENVIRONMENT_BLOCKED`; la graduatoria seguente usa il numero di dichiarazioni come proxy trasparente, non come misura temporale.

| Posizione | File | Dichiarazioni | Categoria | Possibile causa |
|---:|---|---:|---|---|
| 1 | `transfer-domain.test.ts` | 97 | unit | grande matrice di dominio |
| 2 | `curriculum-transition-resolver.test.ts` | 72* | unit | casi parametrizzati |
| 3 | `identity.test.ts` | 70 | unit/fast | fixture identità e migrazione |
| 4 | `pilot-service.test.ts` | 66 | integration | servizio pilota esteso |
| 5 | `curriculum-domain-cml633c.test.ts` | 61 | unit | numerose entità |
| 6 | `document-continuity.test.tsx` | 55 | UI | montaggi React e store |
| 7 | `institution-domain.test.ts` | 55* | unit | vocabolari parametrizzati |
| 8 | `cml-634b-r4b-teacher-local-ai-ui.test.tsx` | 55 | UI | molti montaggi e waitFor |
| 9 | `curriculum-domain.test.ts` | 55 | unit | dominio curricolo |
| 10 | `institution-integration.test.tsx` | 53* | integration/UI | storage e render |
| 11 | `cml617b-activity.test.tsx` | 48 | UI | molti casi di attività |
| 12 | `revision-domain.test.ts` | 44 | unit/fast | matrice revisioni |
| 13 | `cml-636b-preview-rendering.test.ts` | 43 | unit | render HTML ripetuto |
| 14 | `knowledge-companion.test.tsx` | 39 | UI | montaggi e stati |
| 15 | `transfer-boundary.test.ts` | 38 | unit | eventi e confini |
| 16 | `cml611-dialogs-confirmations.test.tsx` | 37 | UI | interazioni DOM |
| 17 | `pilot-evaluation.test.ts` | 37 | integration | dataset e valutazione |
| 18 | `document-domain.test.ts` | 37 | unit | archivio documentale |
| 19 | `etwin-domain.test.ts` | 35 | unit | entità e relazioni |
| 20 | `cml-634b-ai-provider-pilot.test.ts` | 32 | integration | mock provider e timer |

## 6. Cause della lentezza

| Causa | Evidenza | File coinvolti | Impatto | Intervento futuro |
|---|---|---|---|---|
| Setup JSDOM per file | `test:fast`: ambiente 44,06 s contro test 1,43 s | tutti i file Vitest | alto | T0/T1 con ambiente Node per dominio puro |
| Pool e isolamento per file | `vitest.config.ts`: `pool: threads`, max 2, file isolation | unit e fast | medio/alto | misurare pool singolo, batch per area e `--no-file-parallelism` |
| Suite multi-progetto aggregata | `npm test` include unit, browser e Storybook | `vitest.config.ts` | molto alto | separare comandi e pipeline |
| React Testing Library ripetuta | numerosi `render`, `waitFor`, store reset | file `.tsx`, integrazioni | alto | UI in T3, estrarre logica pura in T1/T2 |
| Fixture/archivi ricreati | costruttori locali ripetuti in document, curriculum, institution | documenti, curriculum, institution | medio | fixture condivise per area |
| Persistenza simulata | `localStorage`, `sessionStorage`, IndexedDB, serializzazione | storage, institution, persistence, CML-638B | medio/alto | isolare persistence T3/T5 |
| Timer reali e attese | `setTimeout`, `waitFor`, sleep 25 ms | AI provider, UI, browser | medio/alto | fake timers e API deterministiche |
| Rendering/serializzazione ripetuta | preview rendering, document export, persistence roundtrip | documents/export | medio | unità pure per fingerprint/render; integrazione solo per contratto |
| Browser/Storybook avviati nello stesso modello | Storybook fallisce con `spawn EPERM`; browser richiede Chromium | browser, Storybook | bloccante per T4/T5 | pipeline separata e ambiente dedicato |
| Processi figli non chiusi o saturi | timeout globale precedente e runner Node residui osservati | suite completa | bloccante diagnostico | teardown audit, timeout espliciti e monitoraggio processi |

## 7. Duplicazioni e livello primario

| Comportamento | Unit | Integration | UI | Browser | Ridondanza | Proposta |
|---|---:|---:|---:|---:|---|---|
| Documento canonico, versioni e transizioni | sì | sì | sì | — | utile/complementare | dominio come primario; UI solo flusso; browser solo smoke |
| Preview/render/export | sì | sì | sì | — | parzialmente eccessiva | renderer/validator unitari; una integrazione di contratto |
| Persistenza archivi documenti | sì | sì | — | sì | complementare | roundtrip unitario + un browser IndexedDB |
| Curriculum transition resolver | sì, con parametri | — | UI indiretta | — | eccessiva se ripetuta | unitario come fonte primaria |
| Identity/institution roles | sì | sì | sì | — | utile | dominio/vocabulary primari; UI per selezione/accessibilità |
| Design transfer | sì | sì | sì | — | utile ma ampia | boundary/domain primari; UI solo happy path |
| Local AI provider | sì | sì | sì | — | complementare | transport/provider unitari; un’integrazione; UI smoke |
| Onboarding/workspace/navigation | — | — | sì | E2E legacy | possibile duplicazione | UI unitario per stati; E2E solo percorso critico |

Non è stata proposta alcuna eliminazione automatica. La duplicazione va ridotta solo dopo aver fissato il test primario e una prova complementare con valore distinto.

## 8. Falsi positivi e robustezza

È stato trovato un gruppo concreto di guardie che assorbono un fallimento atteso:

| File | Righe indicative | Pattern | Rischio | Gravità | Correzione futura |
|---|---:|---|---|---|---|
| `src/__tests__/design-transfer-repository.test.ts` | 39, 69, 80, 131, 153, 165 | `if (!result.success) return` | test terminabile senza asserire successo | alta | `expect(...).toBe(true)` + throw di narrowing |
| `src/__tests__/design-transfer-domain.test.ts` | 124, 157, 171 | `if (!r.success) return` | copertura condizionale | alta | asserzione esplicita |
| `src/__tests__/design-transfer-a03.test.ts` | 83, 92, 101, 145, 204, 226 | `if (!result.ok) return` | falso positivo su trasferimenti | alta | asserzione esplicita |
| `src/__tests__/document-repository.test.ts` | 37–241 | molte guardie `success` | interi scenari possono saltare | alta | correggere per blocchi, senza riscrivere la suite |
| `src/__tests__/document-integration.test.ts` | 32, 60, 80, 104, 124, 140, 160 | `if (!created.success) return` | integrazione non garantisce creazione | alta | asserzione esplicita |
| `src/__tests__/document-legacy.test.ts` | 19–107 | `if (!result.ok) return` | adapter legacy non verificato | media/alta | asserzione esplicita |
| `src/__tests__/curriculum-functional-pilot/cml631e-data-loading.test.ts` | 21 | `if (!segments.ok) return` | caricamento non obbligatorio | media | asserzione esplicita |
| `src/__tests__/curriculum-persistence/migration.test.ts` | 197 | `if (!result.value) return result` | migrazione può non essere esercitata | media | asserzione e diagnostica |

Sono presenti molte asserzioni `toBeDefined`/`toBeTruthy`; non sono automaticamente errate, ma nei test UI spesso verificano solo l’esistenza generica invece del comportamento. Non sono stati trovati `it.skip`, `it.todo`, `it.only` o `describe.only` nei file censiti. Il file `dashboard-task10.test.tsx` non contiene dichiarazioni rilevate ed è un candidato da ispezionare prima di inserirlo in qualsiasi suite.

## 9. Fixture

Le fixture sono prevalentemente locali ai file. Si osservano ripetizioni di:

- archivi vuoti e archivi con un documento/versione;
- snapshot istituzionali e ruoli dichiarati;
- attori `Docente Test` e ID generati;
- archivi curricolari e segmenti minimi;
- reset dello store e pulizia di `localStorage`;
- dati per migration/legacy e roundtrip di serializzazione;
- montaggio di componenti con store Zustand inizializzato.

Una libreria futura, senza introdurla in CML-639A, potrebbe essere:

```text
src/__tests__/fixtures/
  documents.ts
  curriculum.ts
  identity.ts
  institution.ts
  persistence.ts
```

La libreria dovrebbe esporre fixture minime e nominate per rischio, non un mega-fixture condiviso. Prima estrarre i costruttori documentali e di identity, poi quelli persistence.

## 10. Valutazione di `test:fast`

Include esattamente:

1. `src/domain/ai/executionService.test.ts`
2. `src/domain/ai/localOllamaProvider.test.ts`
3. `src/domain/ai/ollamaModelDiscovery.test.ts`
4. `src/domain/ai/ollamaTransport.test.ts`
5. `src/domain/ai/requestPreview.test.ts`
6. `src/__tests__/transfer-domain.test.ts`
7. `src/__tests__/revision-domain.test.ts`
8. `src/__tests__/identity.test.ts`

Risultato misurato: 273 test passati. La suite è vicina al budget dichiarato di 30 s nel tempo interno Vitest (30,29 s), ma supera il budget nel tempo parete (44,73 s). Il dato mostra che il numero dei test non è il principale costo: l’ambiente JSDOM/setup pesa 44,06 s e l’esecuzione dei test 1,43 s.

| File | Deve restare | Deve uscire | Motivo | Suite alternativa |
|---|---:|---:|---|---|
| AI execution/provider/discovery/transport/request | sì, ma con separazione futura | — | contratti AI rapidi, pur con startup dominante | T1 AI |
| `transfer-domain.test.ts` | sì | — | 97 casi di dominio ad alto valore | T1/T2 curriculum |
| `revision-domain.test.ts` | sì | — | dominio puro | T1/T2 workflow |
| `identity.test.ts` | sì, forse split | — | identity + migration aumenta il costo concettuale | T1 identity, T3 migration |

Elementi mancanti nella fast attuale: document domain/export, curriculum transition, persistence contract, CML-631F regression, accessibilità minima. Vanno aggiunti solo dopo misurazione e senza superare il budget; non si propone di aggiungerli indiscriminatamente.

## 11. Valutazione della suite completa

`npm test` non è una suite unit-only: il config principale espone tre progetti, in ordine `unit`, `indexeddb-browser`, `storybook`. Il comando può quindi:

1. inizializzare worker threads e JSDOM per il progetto unit;
2. avviare Playwright Chromium per IndexedDB;
3. avviare il plugin Storybook e il browser Storybook;
4. attendere teardown o processi figli di più ambienti.

La raccolta `vitest list --project unit --json` non ha restituito un risultato entro 120 s. `npm test` non ha prodotto un summary entro il timeout operativo. Non è possibile distinguere con certezza, dalla sola sessione locale, quale file unitario sia il primo responsabile del blocco. Le ipotesi da verificare in CML-639B sono teardown incompleto, worker/processi residui, test asincroni con timer reali e accoppiamento improprio dei progetti browser/Storybook.

Classificazione: `NOT_MEASURED_ENVIRONMENT_BLOCKED`, non regressione funzionale dimostrata.

## 12. Valutazione Storybook

Storybook è alla versione `10.5.5` risolta dall’intervallo `^10.5.3`, con framework `@storybook/react-vite`, builder Vite implicito e cinque storie UI. `npm run build-storybook` fallisce durante `Building manager..` con:

```text
Error: spawn EPERM
at ChildProcess.spawn
at ensureServiceIsRunning (.../esbuild/lib/main.js)
```

Il blocco avviene prima della compilazione delle storie. Cause plausibili da verificare in un ambiente dedicato: policy Windows/antivirus sull’avvio di esbuild, incompatibilità o combinazione Node 24 + esbuild/Storybook, processo figlio non autorizzato. Non è stata modificata la configurazione e non si attribuisce il problema al prodotto.

Storybook deve restare T5/pipeline separata, non un gate del ciclo locale ordinario.

## 13. Modello T0–T5 proposto

| Livello | Scopo | Contenuto | Frequenza | Budget |
|---|---|---|---|---:|
| T0 static | errori sintattici e tipi | `tsc --noEmit`, diff check | ogni modifica | < 10 s |
| T1 related | rischio direttamente toccato | file/domain correlati | ogni modifica | < 15 s |
| T2 fast | contratti essenziali | suite rapida curata | ogni commit locale | < 30 s |
| T3 area | regressione di un’area | documents, curriculum, persistence, workflow separati | prima del commit/PR | < 120 s |
| T4 full | regressione repository | tutti i progetti unit, senza browser aggregato | PR/notturna | separata dal commit locale |
| T5 browser/storybook | contratti reali browser e storie | IndexedDB Chromium, Storybook | PR/notturna | pipeline separata |

## 14. Script futuri proposti

Gli script sono proposte, non modifiche effettuate in CML-639A. Sono compatibili concettualmente con Vitest 4.1.10 e devono essere verificati con misure prima di essere aggiunti:

```json
{
  "typecheck": "tsc --noEmit",
  "test:related": "vitest run --project unit src/domain/documents src/features/documents src/__tests__/cml-631f-r1-*",
  "test:fast": "vitest run --config vitest.fast.config.ts",
  "test:documents": "vitest run --project unit src/__tests__/document-*.test.ts src/__tests__/cml-636b-*.test.* src/__tests__/cml-631f-r1-*",
  "test:curriculum": "vitest run --project unit src/__tests__/curriculum-* src/__tests__/design-transfer-*.test.* src/__tests__/transfer-*.test.ts",
  "test:persistence": "vitest run --project unit src/__tests__/**/*persistence*.test.ts src/__tests__/**/*migration*.test.ts src/__tests__/storage.test.ts",
  "test:full": "vitest run --project unit",
  "verify:fast": "npm run typecheck && npm run test:fast",
  "verify:documents": "npm run typecheck && npm run test:documents",
  "verify:storybook": "npm run build-storybook"
}
```

La proposta separa esplicitamente `test:full` dal browser e da Storybook; i glob devono essere validati su Windows prima di essere adottati.

## 15. Matrice per evento

| Evento | T0 | T1 | T2 | T3 | T4 | T5 |
|---|---:|---:|---:|---:|---:|---:|
| modifica locale | sì | sì, se correlato | opzionale | — | — | — |
| commit | sì | sì | sì | area interessata | — | — |
| richiesta di integrazione | sì | sì | sì | sì | sì | sì |
| merge | sì | sì | sì | sì | sì | sì |
| pubblicazione | sì | — | — | — | — | pipeline |
| esecuzione notturna | sì | — | — | — | sì | sì |

## 16. Piano CML-639B

`CML-639B — Fast Deterministic Test Execution Model`

1. Creare script separati senza spostare file.
2. Separare unit rapide, aree, browser e Storybook.
3. Introdurre test correlati basati sui file modificati.
4. Creare suite documents, curriculum, persistence e workflow.
5. Estrarre fixture minime condivise.
6. Correggere progressivamente i falsi positivi individuati.
7. Isolare persistence e IndexedDB.
8. Rimuovere browser/Storybook dal normale `npm test` aggregato.
9. Introdurre timeout, report per file e controllo dei processi residui.
10. Estendere il modello alle altre aree e fissare budget misurati.

Ogni passo deve mantenere uno script precedente funzionante e produrre un confronto temporale ripetibile.

## 17. Rischi

- Il conteggio statico delle dichiarazioni parametrizzate non equivale al numero espanso dei casi runtime.
- La raccolta completa bloccata impedisce la classifica temporale reale di tutti i file.
- Un test `toBeDefined` può essere corretto in un contesto e debole in un altro; la revisione deve essere semantica.
- Separare suite può nascondere dipendenze globali o ordine implicito; serve esecuzione isolata per area.
- Ridurre il numero di montaggi UI senza preservare i percorsi accessibili può diminuire la copertura utile.
- Node 24/esbuild/Storybook richiede una verifica in ambiente controllato prima di qualsiasi modifica configurativa.

## 18. Conclusioni

La lentezza non è spiegata dal solo numero di test. La misura più informativa è `test:fast`: 273 test eseguiti in 30,29 s nel runner, con 44,06 s di ambiente e 1,43 s di test effettivi. Il problema architetturale principale è l’aggregazione di unit, browser e Storybook nello stesso modello di esecuzione, aggravata da JSDOM per ogni file, montaggi React, persistence simulata, timer reali e alcuni guard clause che possono produrre falsi positivi.

La suite rapida è pronta come base di design, ma non è ancora sotto 20 s nel tempo parete. La suite completa e Storybook restano misurazioni bloccate dall’ambiente e devono essere separate prima di usarle come gate.

## 19. Verdetto

```text
CML_639A_INVENTORY_COMPLETE_MEASUREMENTS_PARTIALLY_ENVIRONMENT_BLOCKED
CML_639A_FAST_TEST_MODEL_READY_FOR_DESIGN_WITH_LIMITATIONS
```

## Rapporto finale

| Voce | Risultato |
|---|---|
| Repository | `antoniocorsano-boop/CurManLight_arena` |
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD iniziale | `6591ebd73a3d34618c762f91f53fca3f75fd8d36` |
| Configurazioni analizzate | `package.json`, Vitest, Vite, setup, Storybook, Playwright standalone |
| File di test censiti | 100 sotto `src/` + 1 Playwright standalone |
| Test censiti | 1.855 dichiarazioni `it/test`, 15 parametrizzate; 273 runtime fast verificati |
| Test misurati | 8 file fast individualmente + batch fast |
| Test non misurati | unit non-fast, browser, Storybook; `NOT_MEASURED_ENVIRONMENT_BLOCKED` |
| File più lento | `ollamaModelDiscovery.test.ts` tra i file misurati: 14,97 s |
| Durata `test:fast` | 30,29 s Vitest; 44,73 s wall clock |
| Cause principali | startup JSDOM, isolamento/worker, UI/persistence, suite multi-progetto, processi figli |
| Falsi positivi trovati | guardie `success/ok` con `return`, concentrate in repository/transfer/integration |
| Duplicazioni principali | dominio↔integrazione↔UI su documents, transfer, persistence e identity |
| Modello T0–T5 | proposto; T4 e T5 separati |
| Script proposti | typecheck, related, fast, area, full unit-only, verify |
| Documento creato | `docs/03_execution/CML-639A_TEST_SUITE_INVENTORY_AND_PERFORMANCE_BASELINE.md` |
| Commit creato | da eseguire dopo verifica del documento |
| HEAD finale | invariato al momento della redazione |
| Modifiche prodotto | Nessuna |
| Verdetto | inventario completo; misure parzialmente bloccate; modello fast pronto al design |
