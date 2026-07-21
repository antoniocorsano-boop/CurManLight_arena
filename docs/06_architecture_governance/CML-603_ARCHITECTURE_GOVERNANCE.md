# CML-603 - Architecture Governance

> CurManLight ha completato la fase di migrazione tecnologica ed entra nella fase di stabilizzazione architetturale. Le decisioni assunte in questa milestone costituiscono il riferimento per l'evoluzione futura del prodotto.

## Purpose

CML-603 non e' una milestone di feature delivery. E' una milestone di governance architetturale: definisce le regole, le decisioni e i gate con cui CurManLight evolvera' prima della successiva fase di sviluppo funzionale sistematico.

Durante CML-603 non si introducono nuove funzionalita' utente, salvo interventi strettamente necessari per completare le decisioni architetturali approvate.

## ADR-0001 - Consolidamento Architetturale Di CurManLight

### Contesto

La migrazione React e' sostanzialmente completata. Il prodotto e' stabile: TypeScript passa, i test passano, la build e' riproducibile e non risultano vulnerabilita' note dalle verifiche npm.

Restano pero' decisioni architetturali da consolidare:

- runtime e distribuzione dell'applicazione;
- confini dei domini;
- duplicazioni tra layer utility;
- strategia di tipizzazione;
- modularita' dei domini principali;
- test di interazione;
- criteri di health architetturale.

### Decisione

Si interrompe lo sviluppo di nuove funzionalita' fino al completamento della stabilizzazione architetturale CML-603.

La priorita' di CML-603 e' definire e applicare le regole con cui il prodotto dovra' evolvere: runtime, domini, tipi, modularita', test e review architetturale.

### Conseguenze

- Nessuna nuova feature durante CML-603.
- Ogni modifica deve essere collegata a una sotto-milestone CML-603A-F.
- Le decisioni architetturali devono essere documentate prima dell'implementazione.
- I domini diventano l'unita' principale di pianificazione.
- Il debito tecnico viene ridotto per dominio, non tramite refactor trasversali casuali.
- Il passaggio a CML-604 richiede il superamento dell'Architecture Gate CML-603F.

## Milestone Structure

```text
CML-603
|
+-- ADR-0001 - Consolidamento architetturale di CurManLight
+-- 603A - Runtime & Distribution Strategy
+-- 603B - Utility Layer Consolidation
+-- 603C - Type Boundary Strategy
+-- 603D - Interaction Tests
+-- 603E - Domain Modularization
+-- 603F - Product Architecture Review
+-- Architectural Health Dashboard
```

## Architectural Principles

1. **I domini sono indipendenti**
   Ogni dominio possiede componenti, hook, tipi, stato e regole applicative.

2. **I componenti sono composti, non monolitici**
   Un file grande non e' automaticamente sbagliato; lo diventa quando contiene responsabilita' non coese.

3. **Le dipendenze puntano verso il dominio, mai verso l'interfaccia**
   La UI consuma ViewModel e contratti stabili. Il dominio non dipende dalla forma dei componenti.

4. **Il runtime e' progettato, non emergente**
   Browser, PWA, file locale, deploy statico, cache, storage e sync devono essere scelte esplicite.

5. **Il mobile e' un'esperienza dedicata, non una riduzione del desktop**
   Layout, navigazione e interazioni mobile devono essere progettati come flussi propri.

6. **Ogni decisione architetturale e' documentata prima di essere implementata**
   Le modifiche strutturali richiedono decision record, criteri di accettazione e verifica.

## CML-603A - Runtime & Distribution Strategy

**Decision Paper:** [CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md)

### Scope

Definire come vive CurManLight nei diversi contesti di distribuzione ed esecuzione.

### Questions

- Quali target sono supportati ufficialmente: browser, PWA installabile, file locale, Netlify, GitHub Pages?
- L'app e' online-first, offline-capable, offline-first, cache-first o network-first?
- Come vengono gestiti service worker, manifest, cache e invalidazione?
- Come avviene l'aggiornamento: silenzioso, con prompt utente, tramite reload guidato?
- Come si gestiscono versioni incompatibili, migrazioni dati e rollback?
- Quali strategie di persistenza sono supportate: locale, Drive personale, Workspace d'Istituto?
- Quando si sincronizza: mai, manualmente, automaticamente, prima della chiusura?
- Come reagisce l'app in assenza di rete, cache cancellata, storage negato o versione cambiata?

### Exit Criteria

- Strategia runtime approvata e documentata.
- Politica service worker/cache definita.
- Politica aggiornamenti e rollback definita.
- Strategie di storage e sync classificate.
- Comportamento `file:` documentato.

## CML-603B - Utility Layer Consolidation

### Scope

Eliminare duplicazioni strutturali tra `src/lib` e `src/utils` e definire il layer utility canonico.

### Exit Criteria

- Un solo layer utility canonico.
- Nessun duplicato strutturale tra `lib` e `utils`.
- Test aggiornati per importare dal layer canonico.
- Barrel exports coerenti.
- Verifiche: `npx tsc --noEmit`, `npm test`, `npm run build`.

## CML-603C - Type Boundary Strategy

**Decision Paper:** [CML-603C_TYPE_BOUNDARY_STRATEGY.md](./CML-603C_TYPE_BOUNDARY_STRATEGY.md)

### Rule

```text
Boundary
->
DTO
->
Domain
->
ViewModel
->
UI
```

### Principles

- Le boundary esterne possono usare `unknown`.
- I parser convertono `unknown` in DTO validati.
- Il dominio usa tipi espliciti.
- I ViewModel stabilizzano i contratti verso la UI.
- Le props UI stabili non usano `any`.
- `any` e' ammesso solo temporaneamente con motivazione e piano di rimozione.

### First Targets

- `AppViewsLayerProps`
- `AppModalsLayerProps`
- payload storage/import/export
- payload Workspace/Drive
- stato classroom/social

## CML-603D - Interaction Tests

**Decision Paper:** [CML-603D_INTERACTION_TESTS.md](./CML-603D_INTERACTION_TESTS.md)

### Scope

Passare da test prevalentemente unitari a test verticali sui flussi principali.

### Priority Flows

1. Home -> Curricolo -> Classe -> UDA -> Export -> Import
2. Onboarding -> scelta profilo -> navigazione iniziale
3. Progettazione -> wizard -> salvataggio UDA
4. Knowledge -> custom doc -> query -> reader
5. Workspace -> login state -> sync manuale -> logout

### Exit Criteria

- Almeno un interaction test per flusso prioritario.
- Test stabili in CI/local run.
- Nessun test che dipenda da rete reale.

## CML-603E - Domain Modularization

**Decision Paper:** [CML-603E_DOMAIN_MODULARIZATION.md](./CML-603E_DOMAIN_MODULARIZATION.md)

### Scope

Modularizzare per dominio, non per dimensione file.

### Target Domains

- Classroom
- Planning
- Curriculum
- Review
- Documents
- Knowledge
- Settings
- Workspace
- Copilot

### Rule

Ogni intervento deve migliorare insieme:

- coesione del dominio;
- contratti TypeScript;
- test;
- composizione React;
- separazione tra dominio e UI.

## CML-603F - Product Architecture Review

**Architecture Gate Report:** [CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md](./CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md)

### Scope

Architecture Gate tra CML-603 e CML-604.

### Gate Criteria

- Nessuna duplicazione strutturale `lib`/`utils`.
- Strategia runtime approvata.
- Confini dei domini documentati.
- Strategia di tipizzazione approvata.
- Roadmap React aggiornata.
- Architectural Health Dashboard aggiornato.
- Review architetturale completata.
- Nessuna nuova feature introdotta fuori da CML-603 durante la fase.
- Ogni batch implementativo CML-603 deve chiudersi con i controlli del proprio perimetro verdi: `npx tsc --noEmit`, `npm test`, `npm run build` e controlli specifici del batch.
- Una decisione puo essere promossa a `Verified` se eventuali blocker esterni sono censiti nell'ADI, tracciati e formalmente esclusi dal perimetro della decisione.
- La CML-603F Architecture Gate deve riesaminare ogni blocker esterno aperto prima della baseline CML-604.

Solo dopo il superamento di questo gate si riprende lo sviluppo funzionale sistematico.

### Gate Result

**PASSED.** The CML-603F review verified 4/4 implementation decisions, accepted BL-001 as an open generated-artifact exception with no architectural impact, and established the CML-603 Architecture Baseline.

## Architectural Health Dashboard

| Indicatore | CML-603 | CML-604 | Target finale |
|---|:---:|:---:|:---:|
| Runtime | 1/5 | 4/5 | 5/5 |
| Domini | 5/5 | 5/5 | 5/5 |
| Tipizzazione | 4/5 | 4/5 | 5/5 |
| Boundary Coverage | 5/5 | 5/5 | 5/5 |
| Modularita' | 5/5 | 5/5 | 5/5 |
| Test | 4/5 | 4/5 | 5/5 |
| Mobile | 3/5 | 5/5 | 5/5 |
| Accessibilita' | 3/5 | 4/5 | 5/5 |
| Utility Layer | 5/5 | 5/5 | 5/5 |
| Developer Experience | 5/5 | 5/5 | 5/5 |
| Maintainability | 5/5 | 5/5 | 5/5 |


## Decision Progress Snapshot

| Indicatore | Stato | Nota |
|---|:---:|---|
| Decisioni implementative Verified | 4 / 4 | UT-001, TY-001, TS-001 e DM-001 Verified |
| Decisioni runtime Approved | 11 / 11 | RT-001..RT-011 sono vincolanti ma non ancora promosse a Verified nell'ADI |
| Architecture Gate | PASSED | CML-603F ha verificato 4/4 decisioni implementative e accettato BL-001 |
| CML-603 Status | **Completed** | Milestone chiusa; baseline architetturale congelata |
| Prossimo passo di programma | CML-604 | Freeze formale della Architecture Baseline e sviluppo funzionale |
## Architecture Decision Index

The central decision map for CML-603 and future architecture work is [ARCHITECTURE_DECISION_INDEX.md](./ARCHITECTURE_DECISION_INDEX.md).

Every future architecture decision must be registered there before implementation, with document source, implementation location, verification method and lifecycle status.
## Decision Paper Standard

From CML-603B onward, every governance document must use this decision-oriented structure:

1. **Contesto**
2. **Problema**
3. **Alternative considerate**
4. **Decisione approvata**
5. **Conseguenze**
6. **Criteri di verifica**
7. **Decision Register**
8. **Architectural Health impact**
9. **Decision Outcome** per ogni decisione verificata

Documentation must be decision-grade: each document ends with approved decisions, motivations, consequences, verification criteria, and observed outcomes when a decision reaches Verified. Descriptive-only documents are not sufficient for CML-603 governance.

Every new Decision Paper must produce a verifiable repository change within one or two implementation milestones. Governance that does not lead to code, structure, tests, or traceability changes is considered incomplete.

## CML-604 Architecture Baseline

After CML-603A-F are complete, CurManLight will open a CML-604 Architecture Baseline before resuming systematic functional development.

The baseline freezes:

- all approved decisions;
- all ADRs and decision papers;
- the updated Architectural Health Dashboard;
- passed Architecture Gate evidence;
- the official starting point for subsequent feature implementation.
## Working Rule For CML-603

Da questo momento CurManLight non viene pianificato file per file. Ogni intervento viene pianificato per dominio o decisione architetturale.

Ogni task CML-603 deve dichiarare:

- sotto-milestone di riferimento;
- dominio coinvolto;
- decisione architetturale applicata;
- verifica prevista;
- effetto sull'Architectural Health Dashboard.

## CML-603 Closure

**Closure date:** 2026-07-21
**Final status:** Completed

### Closure Evidence

| Verification | Result | Date |
|---|---|---|
| `npx tsc --noEmit` | Exit code 0, zero errors | 2026-07-21 |
| `npm test` | 4 files, 64/64 tests passed | 2026-07-21 |
| `npm run build` | 1,619 modules; production single-file (1,024 KB) | 2026-07-21 |
| `src/utils` directory | Does not exist (UT-001 verified) | 2026-07-21 |
| `src/features` `any` scan | Zero matches (TY-001 verified) | 2026-07-21 |
| Active domain entrypoints | 10/10 domains expose `index.ts` (DM-001 verified) | 2026-07-21 |
| Interaction tests | 5/5 priority flows covered (TS-001 verified) | 2026-07-21 |

### Closure Summary

CML-603 has successfully completed its mandate:

- **4/4 implementation decisions** (UT-001, TY-001, TS-001, DM-001) are Verified with traceable outcomes.
- **11 runtime decisions** (RT-001..RT-011) are Approved and binding for future runtime work.
- **Architecture Gate PASSED** (CML-603F).
- **BL-001** accepted as generated-artifact exception with no architectural impact.
- **Repository is green**: TypeScript, tests, and build all pass.
- **App.tsx reduced from ~12,500 to ~1,100 lines** through domain-based feature extraction.
- **No new features introduced** during CML-603 (governance-only milestone).

The CML-603 Architecture Baseline is now frozen. Future architectural changes require new decisions registered in the ADI. The four verified CML-603 decisions must not be rewritten retroactively except to record corrections or deprecation history.

### Next Program Step

**CML-604** will freeze this baseline as the official reference for subsequent functional evolution. React Router activation, deep linking, and navigation modernization should be proposed as a dedicated CML-604 initiative with explicit product and technical decisions.
