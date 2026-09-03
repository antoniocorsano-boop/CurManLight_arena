# Arena — Audit architetturale del sistema curricolo

Data: 2026-09-03  
Baseline analizzata: `main@bc23f708be83029733f93f5c6a6fb13290e76f2a`  
Tranche candidata analizzata separatamente: PR #174 / `feature/r7b3-infanzia-canonical-curriculum`  
Perimetro: fonte nazionale → struttura canonica → curricolo d'istituto → analisi → revisione/decisione/adozione → persistenza → UI → progettazione/UDA → documenti/evidenze.

## 1. Verdetto

Arena possiede oggi **due piani architetturali reali ma non ancora unificati**.

### Piano A — autorità istituzionale R7

È il piano più maturo. Sono presenti contratti e runtime per:

`P1 fonte → P2 contesto → P3 analisi → P4 revisione → P5 decisione → P6 adozione canonica → P7 passaggio alla progettazione`.

Proposal condivise, decisioni e adozione canonica dispongono di persistenza server-side, vincoli di ruolo, immutabilità, ricevute e materializzazioni.

### Piano B — curricolo operativo legacy

Le viste produttive continuano invece a usare `CurriculumMap`, una struttura:

`disciplina → ordine scolastico → traguardi / obiettivi / evidenze / nuclei / proposals`.

La copia modificabile è ancora salvata in `localStorage` con chiave `curmanlight-custom-curriculum-v2`. Import, popolamento, UDA e handoff leggono questo piano.

Il repository contiene già il nuovo dominio produttivo `InstituteCurriculumVersion / CurriculumSegment / CurriculumNode / VerticalCurriculumLink`, con schema Dexie, repository e migrazione, ma la modalità esplicita resta:

`CURRICULUM_PERSISTENCE_MODE = 'legacy-only'`.

Il report CML-630E2 conferma che il nuovo dominio è persistibile ma **non attivo nei flussi produttivi**.

**Conclusione:** R7 ha chiuso la catena di autorità per il perimetro dichiarato, ma Arena non è ancora un sistema curricolare IN2025 semanticamente completo. Il principale lavoro residuo è sostituire il piano operativo legacy con un aggregato curricolare canonico che riusi, e non duplichi, l'autorità R7.

---

## 2. Stato per componente

| Componente | Stato | Evidenza principale | Valutazione |
| --- | --- | --- | --- |
| Identità fonte D.M. 221/2025 | IMPLEMENTATO | `domain/curriculum/national/dm2212025.ts` | Fonte, date, locator e stati di verifica espliciti. |
| Struttura nazionale per ordini | IMPLEMENTATO | `canonicalStructure.ts` | Distingue correttamente infanzia, discipline del primo ciclo e segmenti speciali. |
| Profilo requisiti D.M. 221 | IMPLEMENTATO | `requirementProfile.ts` | Universalità, condizionalità, autorità esterna e transizione sono modellate. |
| Inventario IN2025 elemento-per-elemento | PARZIALE | `technologyElementInventory.ts` | Su `main` esiste in dettaglio solo per Tecnologia. PR #174 aggiunge l'infanzia. |
| Verifica umana del testo nazionale | PARZIALE | `technologyHumanVerification.ts`, `TechnologySourceReviewTask.tsx` | Processo valido come pilota, ma receipts e stato operativo restano locali e specifici di Tecnologia. |
| Dominio curricolo d'istituto versionato | IMPLEMENTATO COME DOMINIO | `domain/curriculum/{version,segment,node,verticalLink}.ts` | Modello valido e persistibile. |
| Attivazione del nuovo dominio nei flussi | BLOCCATO / NON ATTIVO | `persistence/compatibilityMode.ts` | Modalità corrente `legacy-only`. |
| Persistenza locale nuovo dominio | IMPLEMENTATA, NON ATTIVA | `persistence/backend.ts` e report CML-630E2 | Tabelle e repository esistono, ma non sono la fonte primaria dell'app. |
| P1 qualificazione fonti | IMPLEMENTATO | R7B1 / `processRoleModel.ts` | Confine consultazione/evidenza esplicito. |
| P2 contesto curricolare | IMPLEMENTATO | `processRoleModel.ts` | Applicabilità e transizione disponibili. |
| P3 primo ciclo | IMPLEMENTATO STRUTTURALMENTE | `curriculumAnalysis.ts` | Analizza presenza/assenza di traguardi e obiettivi su `CurriculumMap`; non è confronto semantico elemento-per-elemento. |
| P3 infanzia | BLOCCATO | `DM221_FIRST_CYCLE_ONLY` | PR #174 rimuove una parte del blocco strutturale, non abilita ancora il runtime infanzia. |
| P4 proposta/revisione | IMPLEMENTATO | dominio revision + R7A4/A5 | Versionamento e authority boundary presenti. |
| P5 decisione | IMPLEMENTATO | R7A6 | Decisione umana autenticata e receipt. |
| P6 adozione | IMPLEMENTATO COME TRANSIZIONE DI AUTORITÀ | R7A7/A8/A9 | Adozione server-side e materializzazione esistono. |
| Contenuto della materializzazione canonica | PARZIALE | migration R7A8 | Envelope validato; il campo `curriculum` è ancora payload JSON opaco al gate SQL. |
| P7 handoff | IMPLEMENTATO, SEMANTICA PARZIALE | `planningHandoffPreview.ts`, `interopRuntimeBindingV2.ts` | Handoff verificabile, ma proietta ancora dal `CurriculumMap` legacy. |
| UDA | LEGACY OPERATIVO | `UdaModel`, `useUdaProgrammingHandlers.ts` | Salva testi copiati, non riferimenti stabili a nodi/versioni curricolari. |
| Rubriche/griglie/portfolio/monitoraggio | PARZIALE / NON PRIMO-CITTADINO | tipi e viste esistenti | Non formano ancora un grafo di artefatti curricolari versionati e collegati agli elementi canonici. |

---

## 3. Finding prioritari

### F1 — P1 — Il curricolo realmente modificato dall'utente è ancora legacy

`useLocalCurriculum.ts` legge direttamente `curmanlight-custom-curriculum-v2`; `useCurriculumImportHandlers.ts` vi scrive direttamente. Il nuovo database curricolare contiene versioni/segmenti/nodi/link, ma il report CML-630E2 dichiara esplicitamente che UI, UDA, programmazione, import/export non lo usano.

**Effetto:** qualunque estensione IN2025 costruita solo in `domain/curriculum/national/*` resta parallela al curricolo che il docente consulta e usa per progettare.

**Gate di chiusura:** portare il nuovo dominio almeno a `dual-read`, poi `dual-write`, infine `new-domain-primary`, con migrazione esplicita e rollback verificato.

### F2 — P1 — L'infanzia è ancora rappresentata operativamente tramite chiavi disciplinari

`CurriculumTab.tsx` visualizza correttamente i nomi dei cinque campi, ma li associa ancora a chiavi legacy:

- `italiano` → I discorsi e le parole;
- `matematica` → La conoscenza del mondo;
- `arteImmagine` → Immagini, suoni, colori;
- `educazioneFisica` → Il corpo e il movimento;
- `educazioneCivica` → Il sé e l'altro.

Questa è una **proiezione di interfaccia**, non un modello canonico dell'infanzia. È coerente con il blocker già rilevato da `legacyStructureAudit.ts`.

**Effetto:** una UI apparentemente corretta può continuare a produrre dati con identità semantica errata.

**Gate di chiusura:** `subjectOrFieldId` deve diventare l'identità operativa; per infanzia deve accettare solo i cinque `DM221_INFANZIA_FIELDS` e non alias disciplinari.

### F3 — P1 — Copertura nazionale elemento-per-elemento incompleta

Su `main`, la ricerca degli inventari dettagliati restituisce il solo `technologyElementInventory.ts`. PR #174 aggiunge l'inventario nativo dell'infanzia, ma Italiano, Inglese, seconda lingua, Storia, Geografia, Matematica, Scienze, Musica, Arte e immagine, Educazione motoria/fisica e gli altri segmenti previsti non dispongono ancora dello stesso inventario elemento-per-elemento.

**Effetto:** Arena conosce la struttura delle discipline ma non possiede ancora tutte le informazioni IN2025 richieste per confronto, tracciabilità e gestione completa.

**Gate di chiusura:** inventario nazionale completo con locator stabile, tipo elemento, ordine/classe, stato di verifica e testo verificato separato dal testo d'istituto.

### F4 — P1 — P3 è un'analisi strutturale, non ancora semantica

`curriculumAnalysis.ts` classifica:

- `GAP` se non trova contenuti;
- `OVERLAP` se trova più alias legacy;
- `COVERAGE` se sono presenti almeno un traguardo e un obiettivo;
- `DISCONTINUITY` se ne è presente solo uno.

Il target è `dm221:<DISCIPLINA>:<ordine>`, non il singolo elemento nazionale.

**Effetto:** `ADOPTION_FLOW_VALIDATED` significa che il percorso runtime P1–P7 è eseguibile nel perimetro dichiarato; **non significa che il curricolo locale copra semanticamente tutte le Indicazioni 2025**.

**Gate di chiusura:** P3-v2 deve confrontare nodi curricolari d'istituto con element binding nazionali verificati, generando coverage/gap a granularità di elemento e aggregandoli poi per disciplina/campo/ordine.

### F5 — P1 — Il passaggio alla progettazione attribuisce autorità nazionale a testi provenienti dal legacy

`interopRuntimeBindingV2.ts` proietta `level.traguardi` e `level.obiettivi` del `CurriculumMap` in requisiti con `authorityLevel = NATIONAL_PRESCRIPTIVE`, associando come fonti il framework nazionale e il livello runtime legacy.

Il codice non richiede, per quel singolo testo, un `NationalCurriculumElementBinding` con `SOURCE_VERIFIED + HUMAN_VERIFIED_SOURCE_TEXT`.

**Effetto:** il confine di provenienza costruito dal nuovo registro nazionale non è ancora quello usato dal P7 operativo.

**Gate di chiusura:** un requisito può essere `NATIONAL_PRESCRIPTIVE` solo se porta un riferimento stabile a un elemento nazionale verificato; altrimenti deve restare `LOCAL_UNVERIFIED`/equivalente e non produrre una falsa attribuzione normativa.

### F6 — P1 — La materializzazione canonica server-side non valida ancora lo schema interno del curricolo

R7A8 verifica autenticazione, ruolo, binding alla decisione, fingerprint, immutabilità e struttura dell'envelope. Tuttavia, per il payload canonico, controlla che esista la chiave `curriculum`, senza validare server-side la sua struttura semantica interna.

**Effetto:** la catena di autorità è robusta, ma l'oggetto reso autorevole non è ancora vincolato allo stesso schema curricolare elementare che stiamo costruendo.

**Gate di chiusura:** definire `CanonicalInstituteCurriculumPayload v1`, validarlo prima della materializzazione e registrare versione schema, nodi, segmenti, provenienza e riferimenti nazionali.

### F7 — P2 — La verifica nazionale di Tecnologia è un buon pilota ma non ancora un registro operativo generale

La UI salva receipts in `localStorage` (`cml.dm221.technology.source-review.receipts.v1`). `promoteTechnologyElementFromHumanReceipt()` costruisce un `VerifiedTechnologyElement`, ma il componente usa la funzione come validazione e persiste il receipt, non un registro nazionale generale condiviso da P3/P7.

**Gate di chiusura:** introdurre un `NationalCurriculumSourceRegistry` disciplinariamente neutro; i receipts devono aggiornare quel registro e restare distinti dall'adozione d'istituto.

### F8 — P2 — UDA e programmazione sono snapshot testuali

`UdaModel` contiene `traguardi[]`, `obiettivi[]`, `evidenze[]` come stringhe. La generazione UDA seleziona gli elementi tramite indici della `CurriculumMap` e copia i testi.

**Effetto:** dopo una revisione del curricolo non è possibile stabilire automaticamente a quale nodo/versione originaria apparteneva un requisito dell'UDA, né distinguere testo nazionale, istituzionale o locale.

**Gate di chiusura:** UDA deve conservare `curriculumVersionRef`, `segmentRef`, `nodeRefs`, provenance e snapshot del testo per leggibilità storica.

### F9 — P2 — Gli Allegati A–H di Tecnologia non hanno ancora equivalenti completi come oggetti operativi

Il curricolo di Tecnologia richiede matrice variazioni, scheda per nucleo, UDA, rubriche, griglie di osservazione, autovalutazione/portfolio, monitoraggio e verbale/registro decisioni. Arena possiede parti di questi concetti, ma non un modello unico che li colleghi alla versione curricolare, ai nodi e alle decisioni.

**Gate di chiusura:** definire gli artefatti curricolari come entità versionate collegate a `InstituteCurriculumVersion`/`CurriculumSegment`/`CurriculumNode`, non come soli documenti esportati.

---

## 4. Infanzia

La PR #174 va mantenuta **separata dall'espansione del runtime P3**.

R7B3 è corretta come fondazione perché:

- usa cinque campi di esperienza;
- separa finalità, suggerimenti metodologici, competenze attese e obiettivi;
- tratta il profilo infanzia → primaria separatamente;
- non dichiara automaticamente `SOURCE_VERIFIED`;
- non promuove celle disciplinari legacy.

Ma la PR non chiude ancora F2: l'interfaccia e `CurriculumMap` continuano a rappresentare l'infanzia attraverso chiavi disciplinari. Pertanto `DM221_FIRST_CYCLE_ONLY` deve restare invariato fino alla migrazione semantica del piano operativo.

---

## 5. Tecnologia come pilota completo

Tecnologia è il caso migliore per chiudere l'architettura perché oggi dispone contemporaneamente di:

1. inventario nazionale D.M. 221 elemento-per-elemento;
2. coda di verifica umana della fonte;
3. curricolo verticale d'istituto esterno già strutturato con nuclei, progressione, conoscenze, abilità, competenze ed evidenze;
4. allegati operativi A–H già definiti nel lavoro corrente;
5. UDA e progettazione già presenti nell'app.

Il pilota non deve copiare il documento di Tecnologia dentro `CurriculumMap`. Deve dimostrare la nuova catena:

`NationalCurriculumElement → InstituteCurriculumVersion → CurriculumSegment → CurriculumNode → VerticalCurriculumLink → UDA/strumento → Evidence/monitoraggio`.

Solo dopo questa prova è opportuno replicare il processo alle altre discipline.

---

## 6. Sequenza di intervento proposta

### R7B3 — fondazione infanzia

Completare e validare PR #174 senza estendere P3.

### R7C1 — contratto unico del curricolo canonico operativo

Definire il payload/aggregato che unifica:

- versione d'istituto;
- segmenti disciplina/campo;
- nodi;
- link verticali;
- riferimenti nazionali verificati;
- provenance;
- stato istituzionale.

Nessuna UI nuova in questa tranche.

### R7C2 — Tecnologia end-to-end sul nuovo dominio

Migrare **solo Tecnologia** dal legacy al nuovo dominio e verificare:

- fonte nazionale;
- curricolo d'istituto;
- progressione prima/seconda/terza;
- nuclei;
- UDA;
- rubriche/griglie;
- monitoraggio;
- decisioni;
- handoff alla progettazione.

### R7C3 — P3-v2 semantico

Coverage/gap/discontinuità/overlap a livello di element binding, non di semplice presenza delle liste.

### R7C4 — Infanzia operativa nativa

Sostituire gli alias disciplinari dell'infanzia con `DM221_INFANZIA_FIELDS`, migrare semanticamente i dati che possono essere dimostrati e lasciare `ND/REVIEW_REQUIRED` ciò che non può esserlo.

### R7C5 — acquisizione IN2025 completa

Applicare l'inventario e la verifica fonte a tutte le discipline e ai segmenti trasversali/condizionali, con gate di completezza macchina-legibile.

### R7C6 — migrazione del runtime

`legacy-only → dual-read → dual-write → new-domain-primary`.

Il legacy viene rimosso solo dopo confronto deterministico, backup, rollback e human acceptance.

---

## 7. Gate di completezza dell'intero sistema curricolo

Arena potrà dichiarare il curricolo IN2025 pienamente gestibile soltanto quando saranno vere contemporaneamente queste condizioni:

1. ogni ordine usa la propria struttura canonica nativa;
2. ogni disciplina/campo previsto dispone di inventario nazionale completo;
3. ogni elemento nazionale usato come autorità è source-verified;
4. il curricolo d'istituto è una versione canonica, non una `CurriculumMap` locale;
5. P3 lavora sui medesimi elementi/versioni usati da P4–P7;
6. P6 materializza un payload semanticamente validato;
7. P7 trasferisce riferimenti canonici verificabili, non soli testi legacy;
8. UDA e strumenti mantengono riferimenti/versioni/provenienza;
9. infanzia è gestita per campi di esperienza senza alias disciplinari;
10. rubriche, griglie, portfolio, monitoraggio e verbali sono collegati alla versione curricolare;
11. Technology pilot passa end-to-end con i documenti reali;
12. tutte le altre discipline passano lo stesso gate di completezza;
13. same-SHA CI/release e validazione umana rappresentativa risultano PASS.

## 8. Decisione architetturale

**Non aggiungere un secondo modello curricolare.** Il nuovo dominio CML-630E deve diventare il piano operativo che R7 governa. `CurriculumMap` deve essere trattata esclusivamente come formato legacy da migrare e, durante la transizione, come adattatore read-only/compatibilità.

Questo evita tre fonti di verità concorrenti:

- struttura nazionale `domain/curriculum/national`;
- nuovo dominio d'istituto CML-630E;
- `CurriculumMap` locale.

Il target corretto è:

```text
D.M. 221/2025 source registry
        ↓
NationalCurriculumElement (verificato)
        ↓
InstituteCurriculumVersion
        ↓
CurriculumSegment / CurriculumNode / VerticalCurriculumLink
        ↓
R7 review → decision → canonical adoption
        ↓
UDA / rubriche / griglie / portfolio / monitoraggio / verbali
        ↓
planning handoff con refs + provenance
```

Finché questa convergenza non è completata, `ADOPTION_FLOW_VALIDATED` deve essere letto esclusivamente come **validazione del percorso di autorità nel perimetro R7 dichiarato**, non come attestazione di completezza semantica del curricolo IN2025 dell'intero istituto.
