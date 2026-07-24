# CurManLight - Project Baseline

> Punto di ingresso ufficiale per lo stato architetturale, di navigazione e di prodotto.

## Stato corrente

| Area | Stato | Evidenza |
|---|---|---|
| Architettura | **Congelata** | CML-603 Gate PASSED |
| Navigazione | **Congelata** | CML-604 Gate PASSED |
| Fase | **Evoluzione prodotto** | `docs/WORKING_PROTOCOL.md` |
| Teacher Workspace | **Operativo** | CML-616, CML-617A/B, CML-620, CML-621, CML-625 |
| Test | **Suite completa verde** | Ultima evidenza registrata: 327/327 test in 18 file, verificata con CML-626 |
| TypeScript | **Zero errori noti** | CML-613 e CML-614 |
| Blocker critici | **Nessuno** | BL-001 risolto da CML-622 |

La baseline stabilisce i vincoli entro cui evolvere il prodotto. Non autorizza refactoring strutturali, nuovi pattern, modifiche alla shell o al routing.

## Milestone consolidate

| Milestone | Risultato |
|---|---|
| CML-603 | Baseline architetturale approvata e congelata |
| CML-604 | Navigazione, shell e persistenza congelate |
| CML-609A | Storybook reintegrato nella suite ordinaria |
| CML-610 | Stati vuoti e chiarezza operativa |
| CML-611 | Dialoghi e conferme distruttive |
| CML-613/614 | Risanamento TypeScript dei test |
| CML-616 | Contratto prodotto Teacher Workspace |
| CML-617A/B | Mock e attività recenti nella Dashboard docente |
| CML-618 | Politica LF tramite `.gitattributes` |
| CML-619 | Riallineamento di questa baseline |
| CML-620 | Integrità temporale delle attività recenti |
| CML-621 | Rilevanza e ordinamento globale delle attività recenti |
| CML-622 | Build Vite non mutante e `dist/index.html` come artefatto distribuibile |
| CML-624 | Riallineamento della baseline post-CML-622 |
| CML-625 | Teacher Workspace Action Consolidation: wizard e CTA primaria mantenuti in Stato del lavoro; Attività recenti riservate a un massimo di tre UDA o esportazioni, con stato vuoto senza CTA e regole CML-620/621 preservate |

## Baseline architetturale (CML-603)

| Componente | Stato verificato |
|---|---|
| Contratti tipizzati | API pubbliche in `src/features/<dominio>/index.ts` |
| Test di interazione | Flussi prioritari coperti dalla suite Vitest |
| Domini | 15 directory sotto `src/features/` |
| Utility condivise | Implementazioni consolidate in `src/lib/` |
| `App.tsx` | 1.213 righe; nessun intervento strutturale autorizzato |

Domini correnti:

```text
classroom, copilot, curriculum, documents, graphs,
knowledge, navigation, onboarding, processo, progettazione,
session, social, tep, voice, workspace
```

## Baseline di navigazione (CML-604)

| Componente | Decisione verificata |
|---|---|
| Router | React Router v7, `BrowserRouter` in `main.tsx` |
| Shell | `AppContext`, `<Outlet />` e lazy loading |
| Persistenza | Tier 1 refresh, Tier 2 navigazione, Tier 3 effimero |
| Test | `src/__tests__/navigation.cml604d.test.tsx` |
| Governance | Shell, routing e persistenza sono congelati |

## Teacher Workspace

Il Teacher Workspace non è una nuova vista o un nuovo dominio. Compone le superfici esistenti affinché il docente possa capire:

1. qual è lo stato del lavoro;
2. cosa è successo di recente;
3. quale azione eseguire per proseguire il lavoro corrente.

La Dashboard docente presenta Stato del lavoro, Attività recenti, quindi card e widget successivi. Il contratto corrente distingue:

```text
Stato del lavoro → lavoro corrente e prossima azione
Attività recenti → UDA salvate ed esportazioni recenti
```

Il wizard attivo compare esclusivamente in Stato del lavoro e `Continua UDA` è la sua unica CTA di ripresa. `RecentActivity` non rappresenta il wizard: assegna tutti e tre gli slot al pool globale di UDA salvate ed esportazioni recenti. In assenza di eventi mostra uno stato vuoto informativo senza CTA. Le regole CML-620 e CML-621 restano operative per timestamp, ranking deterministico e deduplicazione tramite `sourceId`.

Il contratto e il mock approvato sono:

- `docs/07_product_evolution/CML-616_TEACHER_WORKSPACE_CONTRACT.md`;
- `docs/07_product_evolution/CML-617A_ACTIVITY_MOCK.md`.

## Stack tecnologico

| Livello | Tecnologia |
|---|---|
| UI | React 18.3 + TypeScript |
| Build | Vite 6 + `vite-plugin-singlefile` |
| Routing | React Router 7 |
| Stato | Zustand 4 + Dexie 4 |
| Stile | Tailwind CSS 3 |
| Test | Vitest 4, Testing Library, jsdom, Playwright |
| Componenti | Storybook 10 con addon accessibilità |

Le versioni esatte restano definite in `package.json` e `package-lock.json`.

## Struttura corrente

```text
src/
|-- components/          # layout e componenti condivisi
|-- features/            # 15 domini con entrypoint pubblici
|-- lib/                 # implementazioni condivise
|-- pages/               # componenti di rotta
|-- stores/              # 8 store Zustand e indice pubblico
|-- ui/                  # componenti UI e Storybook stories
`-- __tests__/           # suite applicativa e di integrazione
```

## Validazione ordinaria

```powershell
npm test
npx tsc --noEmit
npm run build
npm run build-storybook
git diff --check
git status --short
```

- Suite completa verde. Ultima evidenza registrata: 327/327 test in 18 file, verificata con CML-626.
- `index.html` è il sorgente Vite canonico e `npm run build` esegue `vite build`.
- `dist/index.html` è l'artefatto single-file distribuibile; `index.html.template` non esiste più.
- `npm run build` e `npm run build-storybook` non modificano file tracciati.
- `dist/` e `storybook-static/` sono artefatti generati ignorati da Git.
- Con Vitest 4 usare `npm test` senza l'opzione non supportata `--reporter=basic`.
- `.gitattributes` impone LF ai file di testo (CML-618).

## Decisioni attive

| ID | Decisione | Stato |
|---|---|---|
| NAV-002 | React Router come sistema di navigazione | Verified |
| Shell-001 | Application Shell con Context e Outlet | Verified |
| Persist-001 | Persistenza Tier 1/2/3 | Verified |
| NavTest-001 | Test del comportamento di navigazione | Verified |

Indice autorevole: `docs/06_architecture_governance/ARCHITECTURE_DECISION_INDEX.md`.

## Debiti aperti

| ID / area | Stato e trattamento |
|---|---|
| `AppViewsLayerProps` | Nessuna nuova prop senza verifica di derivazione o contratto esistente |
| Dipendenze dev | Riclassificare separatamente dalle slice prodotto |

## Debiti risolti

| ID / area | Risoluzione |
|---|---|
| BL-001 | Risolto da CML-622: la build Vite non modifica più file tracciati |
| Tempo del wizard | Risolto da CML-620 con fonti temporali attendibili e senza nuova persistenza |
| Rilevanza attività | Risolto da CML-621 con ordinamento globale deterministico |
| Duplicazione azione wizard | Risolta da CML-625 separando lavoro corrente e attività storiche |

## Prossima slice

```text
NEXT_SLICE_STATUS: DA_IDENTIFICARE
IMPLEMENTAZIONE: NON AUTORIZZATA
```

## Regole per l'evoluzione

Ogni proposta valuta, nell'ordine: valore per il docente, valore per il dipartimento, riduzione del tempo, riduzione della complessità percepita e, solo infine, impatto tecnico.

> **Il docente potrà...**

Sono consentiti miglioramenti di UX, workflow, onboarding, progettazione, gestione documentale, collaborazione, accessibilità e performance percepita. Non sono consentiti nuovi framework, state manager, layer, pattern, modifiche al routing o refactoring della baseline senza una nuova decisione.

## Percorso per nuovi contributori

1. Leggere questo documento e `docs/WORKING_PROTOCOL.md`.
2. Consultare `docs/06_architecture_governance/ARCHITECTURE_DECISION_INDEX.md`.
3. Consultare `docs/07_navigation_program/CML-604_GOVERNANCE.md`.
4. Consultare `docs/07_product_evolution/` per il Teacher Workspace.
5. Eseguire `npm test` prima di proporre modifiche.

---

*Ultimo aggiornamento: CML-626, 24 luglio 2026.*
