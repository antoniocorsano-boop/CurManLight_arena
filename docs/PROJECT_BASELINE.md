# CurManLight - Project Baseline

> Punto di ingresso ufficiale per lo stato architetturale, di navigazione e di prodotto.

## Stato corrente

| Area | Stato | Evidenza |
|---|---|---|
| Architettura | **Congelata** | CML-603 Gate PASSED |
| Navigazione | **Congelata** | CML-604 Gate PASSED |
| Fase | **Evoluzione prodotto** | `docs/WORKING_PROTOCOL.md` |
| Teacher Workspace | **Operativo** | CML-616, CML-617A, CML-617B |
| Test | **324/324 superati** | Baseline CML-619: 18 file, verificata il 24 luglio 2026 |
| TypeScript | **Zero errori noti** | CML-613 e CML-614 |
| Blocker critici | **Nessuno** | BL-001 è aperto ma accettato |

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
3. quale attività può essere ripresa subito.

La Dashboard docente presenta Stato del lavoro, Attività recenti, quindi card e widget successivi. Il contratto e il mock approvato sono:

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
npm run build-storybook
npm run build
git diff --check -- . ':!index.html'
```

- Baseline CML-619: `npm test` comprende 324 test in 18 file, inclusi i test Storybook.
- `npm run build` aggiorna anche `index.html` e può sporcare il working tree.
- Il diff check esclude `index.html` finché BL-001 non sarà risolto.
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
| BL-001 | Aperto e accettato: la build modifica `index.html`; candidato CML-622 |
| Tempo del wizard | Usare l'ultimo salvataggio senza nuova persistenza; CML-620 |
| Rilevanza attività | Decisione prodotto tra categorie ed eventi reali; CML-621 |
| `AppViewsLayerProps` | Nessuna nuova prop senza verifica di derivazione o contratto esistente |
| Dipendenze dev | Riclassificare separatamente dalle slice prodotto |

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

*Ultimo aggiornamento: CML-619, 24 luglio 2026.*
