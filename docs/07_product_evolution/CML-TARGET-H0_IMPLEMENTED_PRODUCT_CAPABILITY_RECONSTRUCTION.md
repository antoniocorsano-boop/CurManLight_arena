# CML-TARGET-H0 — Implemented Product Capability Reconstruction

**Stato:** audit del prodotto implementato, non piano d'implementazione  
**Baseline verificato:** `9f2ac12` — `feat(product): establish canonical workspace grammar`  
**Branch di audit:** `feat/cml-target-canonical-human-workflow`  
**Scopo:** distinguere ciò che il baseline esegue realmente da ciò che esiste in linee locali o storiche non confluite.

## 1. Esito sintetico

La gestione del curricolo non è soltanto un'idea progettuale. Nel baseline `9f2ac12` sono presenti:

- consultazione curricolare locale e struttura verticale;
- archivio di revisione `revisionArchive` persistito e validato;
- superficie canonica A03/A03G in `RevisioneTab`;
- creazione e versionamento di proposte locali tramite comandi protetti da `proposal.create`;
- stati, eventi, decisioni e trasferimenti di dominio nel modello revisionale;
- produzione documentale canonica da UDA, proposta o decisione a livello di servizio;
- import/consolidamento legacy `.cml` protetto da `department.consolidate`.

Nel baseline non sono invece presenti come runtime completo:

- il boundary B3B guardato per tutte le transizioni di revisione;
- il comando tecnico/protetto `validateCurriculumData`;
- il dominio della decisione collegiale e il suo archivio;
- `ConsolidationArchive` e la persistenza del consolidamento multi-livello;
- un collegamento UI canonico completo Curricolo → Revisione/Progettazione → Documento.

Le slice B3B, B3C, B3D, B3E e B3F esistono in branch locali, ma il controllo di antenato mostra che non discendono da `9f2ac12`: condividono il merge-base `1516acd`. Sono quindi evidenza storica/progettuale separata, non capacità attribuibile al runtime P1.2 congelato.

Il commit storico `1f1661d4` (`feat(CML-633G): add canonical A03 revision surface`) conferma che la superficie canonica di revisione è stata effettivamente sviluppata in precedenza: modifica `RevisioneTab.tsx` e il documento di avanzamento CML-633G. Questo conferma l'esistenza storica della capacità, ma il baseline da usare per il prodotto corrente resta `9f2ac12`.

## 2. Matrice del baseline `9f2ac12`

| Funzione umana | Componente UI | Comando/servizio | Dominio | Persistenza | Capability | Stato runtime nel baseline |
|---|---|---|---|---|---|---|
| Consultare il curricolo vigente | `CurriculumTab`, `AlberoView`, `MappaView`, popolamento locale | handler locali di consultazione/importazione; nessun comando di mutazione professionale | `src/domain/curriculum`, adapter legacy, `curriculumKB` | stato locale del curricolo; store/legacy adapter secondo il percorso | `curriculum.consult` esiste nella matrice, ma la consultazione UI non usa un guard esplicito | **IMPLEMENTED_LOCAL_CONSULTATION** |
| Creare una proposta di revisione | `RevisioneTab` → `CanonicalProposalsSection` | `createRevisionProposal` | `src/domain/revision` | `revisionArchive` in `useCurriculumStore`, con integrità e persistenza Zustand/IndexedDB | `proposal.create`, verificata dal comando | **IMPLEMENTED_GUARDED_B3A** |
| Creare una nuova versione immutabile | `RevisioneTab`, azione “Nuova versione locale” | `addRevisionProposalVersion` | costruttori/repository revisioni | `revisionArchive.versions` + riferimenti versione corrente | `proposal.create` | **IMPLEMENTED_GUARDED_B3A** |
| Inviare, ritirare o far avanzare una proposta | azioni in `RevisioneTab` | `transitionProposalStatus` direttamente dal componente | repository revisioni, vocabolari ed eventi | `revisionArchive.proposals` + `events` | `document.review` esiste nella matrice, ma il baseline UI non usa un comando protetto B3B per tutte le transizioni | **PARTIAL_DOMAIN_UI_BYPASS** |
| Prendere in carico e revisionare | semantica rappresentata dagli stati revisioni; UI canonica parziale | transizione repository; comandi B3B presenti solo nella linea locale separata | `src/domain/revision` | `revisionArchive` nel baseline | `document.review` dichiarata ma non completamente applicata al boundary baseline | **DESIGNED/PARTIAL, NOT_BASELINE_COMPLETE** |
| Registrare una decisione revisionale | query e repository revisioni; nessun percorso UI completo | `recordDecision`, `transitionDecisionStatus` | decisioni e decision effects in `src/domain/revision` | `revisionArchive.decisions`, `effects`, `events` | capability di decisione non definita come boundary autonomo nel baseline | **DOMAIN_AVAILABLE_UI_NOT_WIRED** |
| Validare tecnicamente i dati curricolari | validatori dominio; superfici pilota separate | `validation.ts` e validazioni pure presenti; `validateCurriculumData` non trovato nel baseline | `src/domain/curriculum/validation.ts`, curriculum pilot | nessuna attestazione professionale persistita | `curriculum.validate` esiste nella matrice, ma non protegge un comando di validazione curricolare nel baseline | **TECHNICAL_DOMAIN_ONLY** |
| Produrre un documento da una UDA | `EsportazioniTab`, `CanonicalDocumentTab`; hook disponibile | `useDocumentProduction.createDocumentFromUda`, `produceCanonicalDocumentFromUda` | `src/domain/documents` | `documentArchive` validato e persistito | `document.create`/`document.preview`/`document.export` secondo il percorso | **IMPLEMENTED_CANONICAL_DOCUMENT_PATH** |
| Produrre un documento da proposta o decisione | servizio e hook di produzione | `produceCanonicalDocumentFromProposal`, `produceCanonicalDocumentFromDecision` | integrazione revisioni → documenti | `documentArchive`, con origine e riferimenti | nessun nuovo guard specifico di transfer nel servizio di produzione baseline | **DOMAIN/SERVICE_AVAILABLE, UI CONTINUITY PARTIAL** |
| Importare e consolidare un file `.cml` legacy | `ProcessoTab` e handler backup | `parseCmlImport`, `executeDepartmentConsolidation` | transfer legacy, decisioni e `customTexts` | store legacy: `decisions` e `customTexts` | `department.consolidate` applicata nel servizio | **IMPLEMENTED_GUARDED_LEGACY_TRANSFER** |
| Decisione collegiale | nessun `CollegeDecisionTab` nel baseline | `recordCollegeDecision` assente nel baseline | dominio college decision assente | archivio college decision assente | `college.record` assente nel baseline | **NOT_IN_BASELINE** |
| Consolidamento multi-livello | nessuna UI/feature di `ConsolidationArchive` nel baseline | comandi consolidation assenti nel baseline | dominio consolidation assente nel baseline | archivio consolidation assente nel baseline | decisioni B3D non presenti nel baseline | **NOT_IN_BASELINE** |

## 3. Inventario per capacità

### 3.1 Consultazione curricolare

La consultazione esiste realmente come esperienza locale:

- `CurriculumTab` espone home, vista ad albero, mappa verticale e popolamento;
- `useLocalCurriculum` e gli adapter collegano dati legacy e modello curricolare locale;
- il dominio `src/domain/curriculum` contiene versioni, segmenti, nodi, relazioni verticali, validatori e persistenza;
- `curriculum.consult` è definita nella matrice dei ruoli.

Il limite è semantico e di enforcement: la consultazione è disponibile nel runtime, ma il baseline non la espone attraverso un comando professionale protetto. La capability è quindi una classificazione del ruolo, non ancora un boundary applicativo della sola lettura.

### 3.2 Proposta di revisione

Questa è la parte più solida del baseline:

```text
RevisioneTab
  → useCanonicalRevisionActions
    → createRevisionProposal / addRevisionProposalVersion
      → requireCapability(proposal.create)
        → addProposal / addProposalVersion
          → revisionArchive
```

La proposta ha stato `draft`, riferimenti a nodo e versione curricolare, snapshot del testo vigente, testo proposto, motivazione e versioni immutabili. Il comando non avvia automaticamente la revisione e la UI dichiara che la bozza è locale e non costituisce protocollo ufficiale.

**Conclusione:** la creazione e il versionamento B3A sono capacità implementate nel baseline, non soltanto progettate.

### 3.3 Workflow di revisione

Il dominio revisionale contiene gli stati e le transizioni necessarie, inclusi:

```text
draft → ready-for-review → submitted → under-review
under-review → changes-requested | accepted-for-decision | rejected
submitted → withdrawn
```

Il baseline espone però una situazione mista:

- la UI chiama direttamente `transitionProposalStatus`;
- gli stati e gli eventi sono reali e persistibili;
- `document.review` è presente nella matrice, ma il percorso baseline non usa ancora il boundary B3B guardato per le transizioni;
- i comandi B3B (`submit`, `takeOver`, `requestChanges`, `admit`, `reject`) appartengono a branch locali separati non discendenti da `9f2ac12`.

**Conclusione:** il workflow è implementato a livello di dominio e parzialmente esposto, ma non può essere dichiarato completo come workflow umano governato nel baseline.

### 3.4 Validazione curricolare

Nel baseline esistono validatori tecnici e superfici pilota. Essi possono verificare struttura, consistenza e invarianti, ma non producono automaticamente un giudizio professionale o un atto collegiale.

Il simbolo `validateCurriculumData` e il relativo scope tipizzato appartengono alla linea B3C locale, non al baseline `9f2ac12`. Il baseline contiene invece `curriculum.validate` nella matrice dei ruoli senza un comando applicativo corrispondente.

**Conclusione:** validazione tecnica disponibile; validazione professionale/istituzionale non attribuibile al baseline.

### 3.5 Decisione collegiale

`recordCollegeDecision`, `CollegeDecisionArchive` e `CollegeDecisionTab` compaiono nella linea locale B3E, insieme a comandi di ricezione dossier, registrazione decisione e ripresa della revisione. Non compaiono nell'albero del baseline `9f2ac12`.

**Conclusione:** la decisione collegiale è una capacità sviluppata in una linea locale successiva/separata, non una capacità del runtime congelato P1.2.

### 3.6 Consolidamento

Il baseline possiede un consolidamento legacy `.cml`:

- parsing del formato;
- guard `department.consolidate`;
- merge in `decisions` e `customTexts`.

Questo non equivale al `ConsolidationArchive` multi-livello. Il dominio, i comandi, gli eventi e la persistenza di `ConsolidationArchive` appartengono a B3D/B3F locali non confluiti nel baseline.

**Conclusione:** transfer legacy protetto implementato; consolidamento curricolare governato multi-livello non presente nel baseline.

### 3.7 Collegamento Curricolo → Progettazione

Il repository contiene contratti A02→A03 e una funzione di trasferimento che può creare una bozza di proposta da un payload di consultazione, con warning esplicito `A02_TO_A03_DRAFT_CREATED` e senza modifica automatica del curricolo.

Nel runtime baseline, però, il passaggio umano è ancora incompleto:

- la UI può navigare verso Progettazione;
- il dominio possiede il contratto di trasferimento;
- non è presente un percorso unico che trasferisca in modo esplicito il riferimento selezionato, il contesto classe e l'oggetto di lavoro fino alla progettazione;
- la produzione documentale da proposta/decisione esiste a livello di servizio, ma non è una continuità UI completa.

**Conclusione:** il collegamento è presente come dominio/contratto e come navigazione parziale, non come workflow umano end-to-end.

## 4. Separazione delle fonti di evidenza

| Fonte | Cosa dimostra | Cosa non dimostra |
|---|---|---|
| Baseline `9f2ac12` | capacità realmente presenti nel codice congelato | capacità di branch non antenati |
| Commit storico `1f1661d4` | superficie canonica A03 sviluppata nella storia del progetto | che ogni evoluzione successiva sia nel baseline P1.2 |
| Branch B3B | design/implementazione locale del boundary di revisione | integrazione nel runtime P1.2 |
| Branch B3C | validazione tecnica protetta e report | presenza della stessa nel baseline |
| Branch B3D/B3E/B3F | consolidamento, decisione collegiale e persistenza avanzata | disponibilità nel worktree/runtime congelato |
| Documentazione precedente | intenzioni, decisioni e stato dichiarato | prova sufficiente di wiring runtime |

La regola per il prodotto è quindi:

```text
implemented in branch ≠ implemented in baseline
domain function ≠ human workflow complete
UI state ≠ guarded mutation
historical evidence ≠ current runtime capability
```

## 5. Correzione necessaria al modello umano H1

La precedente semplificazione “Curricolo = riferimento da consultare” è insufficiente.

Il modello corretto è:

```text
CURRICOLO
├── Vigente
│   ├── consultazione
│   ├── struttura verticale
│   ├── traguardi / obiettivi / evidenze
│   └── uso nella progettazione
├── Revisione
│   ├── proposta
│   ├── versioni
│   ├── invio
│   ├── revisione
│   └── richiesta modifiche
├── Decisione
│   ├── ammissione
│   ├── decisione locale/collegiale, se disponibile
│   └── esito
└── Consolidamento
    ├── decisioni registrate
    ├── archivio
    ├── provenienza
    └── nuova situazione curricolare
```

H1 deve quindi essere corretto dopo questo audit, non semplicemente implementato sopra la versione precedente. La correzione dovrà distinguere chiaramente:

- ciò che il docente può consultare;
- ciò che può proporre;
- ciò che è in revisione;
- ciò che è decisione locale o collegiale;
- ciò che è consolidato;
- ciò che è soltanto legacy o non disponibile nel runtime corrente.

## 6. Decisioni operative dell'audit

1. Non ricostruire da zero la gestione curricolare.
2. Non portare automaticamente nel baseline le implementazioni B3B–B3F locali.
3. Non descrivere come workflow umano completo una funzione disponibile solo nel dominio.
4. Non usare `Curricolo` come sinonimo di sola consultazione.
5. Aggiornare H1 dopo l'inventario, mantenendo separata la definizione umana dalla futura implementazione.
6. Prima di qualunque nuova slice, decidere quali capacità del baseline e quali capacità locali devono essere ammesse nel prodotto canonico.

## 7. Stato H0

```text
CML_TARGET_H0_IMPLEMENTED_PRODUCT_CAPABILITY_RECONSTRUCTION_COMPLETE
CML_TARGET_H0_BASELINE_9F2AC12_RECONSTRUCTED
CML_TARGET_H0_LOCAL_SUCCESSOR_LINES_SEPARATED
CML_TARGET_H1_REQUIRES_CORRECTION_BEFORE_APPROVAL
NO_RUNTIME_CHANGE_AUTHORIZED
```
