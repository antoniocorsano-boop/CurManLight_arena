# Arena — collegamento UI al curricolo canonico materializzato

**Data:** 19 ottobre 2026  
**Ambito:** PR #347 — `TRAMA-CURRICOLO-VERT-01`  
**Baseline di partenza:** `70be6761c4c3d4413881286754ced2f1a39c0005`  
**Autorità curricolare:** `CAN-CURR-MASTER-00@1.3`  
**Stato istituzionale:** materializzazione documentale completa, validazione professionale `OPEN`, curricolo `NON VIGENTE`

## 1. Obiettivo

Rendere consultabili nella UI professionale di Arena i **113 scope governati** già prodotti dal materializzatore `materializeCurricoloVerticaleMasterV1`, senza creare una seconda autorità curricolare e senza dipendenza runtime da Google Drive o da una persistenza parallela in Supabase.

Il risultato deve sostituire, come percorso principale del lettore professionale, il catalogo pilota statico che oggi presenta soltanto il fascicolo scientifico-matematico-tecnologico e marca le altre aree come non acquisite.

## 2. Vincoli non negoziabili

1. `CAN-CURR-MASTER-00@1.3` resta l’unica baseline curricolare canonica di lavoro.
2. La UI è **read-only** rispetto al master: non modifica il documento Drive e non promuove stati istituzionali.
3. Nessun `fetch` runtime verso Google Drive o Google Docs per ottenere il master canonico.
4. Nessuna nuova tabella, replica o persistenza Supabase per questo collegamento.
5. Il materiale resta `under-review` / `proposed`; la UI deve mostrare esplicitamente **Validazione professionale aperta** e **Non vigente**.
6. Il collegamento deve essere tracciabile almeno a: `masterId`, `masterVersion`, `revisionId`, impronta strutturale del contenuto sorgente e impronta dell’artefatto materializzato.
7. La generazione deve essere deterministica: a parità di snapshot e metadati sorgente, l’artefatto prodotto deve essere byte-per-byte identico.
8. Nessun merge, deploy o promozione Beta è parte di questo intervento.

## 3. Stato attuale verificato

La PR #347 contiene già il motore produttivo `src/domain/transfer/curricoloVerticaleMasterMaterializationV1.ts`, che:

- valida il master canonico;
- materializza esattamente 113 scope;
- produce `version`, `segments`, `nodes`, `verticalLinks` e `perimeter`;
- mantiene versioni e segmenti in stato non approvato;
- fallisce chiuso in caso di sezioni canoniche mancanti o versione incoerente.

La UI principale `ProfessionalCurriculumReader.tsx`, invece, usa ancora `curriculumPublicationRegistry.ts` e il vecchio fascicolo dipartimentale statico. Di conseguenza continua a presentare aree e Infanzia come non acquisite, nonostante il master 1.3 sia materialmente completo.

## 4. Architettura scelta

Catena canonica:

`CAN-CURR-MASTER-00@1.3`  
`→ snapshot sorgente controllato fuori dal runtime browser`  
`→ materializeCurricoloVerticaleMasterV1()`  
`→ artefatto repository versionato e deterministico`  
`→ adattatore di sola lettura`  
`→ ProfessionalCurriculumReader`

### 4.1 Artefatto repository

Introdurre un artefatto generato, versionato nel repository, con struttura logica:

```ts
interface StableFootprintV1 {
  algorithm: 'fnv1a';
  version: 1;
  hash: string;
}

interface CanonicalCurriculumMaterializedArtifactV1 {
  schemaVersion: 'ARENA_CANONICAL_CURRICULUM_ARTIFACT_V1';
  source: {
    masterId: 'CAN-CURR-MASTER-00';
    masterVersion: string;
    revisionId: string;
    sourceContentFootprint: StableFootprintV1;
    authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE';
    humanProfessionalValidation: 'OPEN';
    curricoloVigente: false;
  };
  materialization: {
    version: InstituteCurricoloVersion;
    segments: CurricoloSegment[];
    nodes: CurricoloNode[];
    verticalLinks: VerticalCurricoloLink[];
    perimeter: CurricoloVerticalePerimeterV1;
  };
  artifactFootprint: StableFootprintV1;
}
```

Percorso previsto:

`src/features/curriculum/data/canonicalCurriculumV13.generated.json`

L’artefatto **non deve contenere timestamp variabili di generazione**. In particolare, i `computedAt` prodotti dalle primitive di impronta esistenti non fanno parte dell’artefatto persistito: si conservano soltanto algoritmo, versione e hash. Le date necessarie devono derivare dal master o essere escluse dal materiale firmato, così da preservare il determinismo.

`artifactFootprint` è calcolata sulla rappresentazione canonica dell’artefatto **escludendo il campo `artifactFootprint` stesso**, evitando una definizione auto-referenziale. `revisionId` e l’impronta del contenuto sorgente rientrano invece nel materiale firmato: una loro modifica produce quindi una nuova impronta dell’artefatto.

### 4.2 Generazione

Aggiungere un generatore repository esplicito, ad esempio:

`scripts/materialize-canonical-curriculum-v1.ts`

Il generatore:

- riceve un file di snapshot testuale già acquisito in un contesto autorizzato;
- riceve i metadati del master (`masterId`, `masterVersion`, `revisionId`);
- calcola l’impronta stabile del contenuto sorgente;
- invoca **esclusivamente** `materializeCurricoloVerticaleMasterV1` per produrre i dati curricolari;
- verifica i 113 scope e lo stato non vigente;
- serializza con ordinamento stabile;
- calcola l’impronta stabile dell’artefatto sul payload privo del campo `artifactFootprint`;
- scrive il file generato.

Il file sorgente fornito al generatore è un input operativo controllato e non è una dipendenza dell’applicazione. Il generatore non introduce codice di rete nel prodotto e non rende Drive una dipendenza runtime.

## 5. Modello di lettura UI

Aggiungere un adattatore puro, ad esempio:

`src/features/curriculum/data/canonicalCurriculumReadModel.ts`

Responsabilità:

- validare l’artefatto importato prima dell’uso;
- raggruppare i 113 segmenti per ordine di scuola, disciplina/campo/asse e scope;
- produrre etichette leggibili senza alterare gli identificativi governati;
- esporre i contenuti materializzati (`competenze`, `obiettivi`, `conoscenze`, `evidenze`, `nucleiFondanti`, ecc.);
- esporre i raccordi soltanto quando presenti nei `verticalLinks` materializzati;
- fornire a `ProfessionalCurriculumReader` fonte, versione, revisione, stato di validazione e vigenza.

L’adattatore non interpreta l’assenza di un dato come autorizzazione a inventarlo.

## 6. Collegamento al lettore professionale

`ProfessionalCurriculumReader` deve usare il nuovo modello canonico come percorso principale.

### Catalogo

La prima vista non deve più derivare da `CURRICULUM_AREA_REGISTRY` come fonte di copertura istituzionale. Deve presentare la copertura reale del master:

- Infanzia — campi di esperienza;
- Primaria I–V;
- Secondaria di primo grado I–III;
- IRC;
- Latino per l’Educazione Linguistica II–III;
- Educazione civica 3–14;
- alfabetizzazione all’intelligenza artificiale 3–14;
- discipline effettivamente presenti nel master.

Non devono più comparire, sul percorso canonico, le etichette **“Non acquisito nella Beta”** o **“Fascicolo pilota disponibile”**.

### Identità e stato

Nel primo livello informativo devono essere visibili:

- `Curricolo verticale d’Istituto`;
- `CAN-CURR-MASTER-00 · versione 1.3`;
- `Validazione professionale aperta`;
- `Non vigente`;
- anno scolastico `2026/2027`.

La presenza del master non equivale ad adozione collegiale.

### Esplorazione

Il lettore deve consentire la sequenza:

`ordine di scuola → disciplina/campo/asse → annualità/scope → contenuti`

Per Infanzia non viene inventata una classe numerica: lo scope resta `school-level` e i riferimenti 3/4/5 anni rimangono nel contenuto governato.

Per gli scope `grade-range` (ad esempio AI literacy) la UI mostra l’intervallo nativo e non lo espande artificialmente in annualità non presenti.

## 7. Riutilizzo dell’UI esistente

Per limitare il rischio, non va riscritto l’intero lettore.

`CurriculumExploreTrama` può essere adattato a ricevere un catalogo pre-costruito dal nuovo modello di lettura, mantenendo il percorso legacy soltanto come compatibilità interna dove ancora necessario.

Il vecchio fascicolo dipartimentale può restare nel repository come **provenienza/archivio**, ma non deve più determinare la copertura principale del curricolo d’Istituto.

La vista “Trama” non deve inferire nuovi raccordi dal semplice fatto che due annualità condividono una stringa. Sul percorso canonico, le relazioni mostrate devono derivare dai `verticalLinks` materializzati oppure essere omesse.

## 8. Gestione errori — fail closed

Se l’artefatto manca, è corrotto, non contiene 113 scope, ha impronte incoerenti, dichiara una versione diversa da `CAN-CURR-MASTER-00@1.3`, oppure presenta `curricoloVigente=true` / stato approvato incompatibile con la baseline corrente:

- il lettore canonico non viene presentato come valido;
- la UI mostra uno stato tecnico-istituzionale neutro di “baseline curricolare non verificabile”;
- non avviene fallback silenzioso al vecchio fascicolo pilota come se fosse il curricolo completo.

## 9. Strategia di test

L’implementazione deve seguire TDD RED → GREEN.

### Contratto dell’artefatto

Testare che:

- `masterId === CAN-CURR-MASTER-00`;
- `masterVersion === 1.3`;
- `revisionId` sia presente;
- impronta sorgente e impronta artefatto siano verificabili;
- `segments.length === 113` e `perimeter.expected.length === 113`;
- nessun segmento sia `effective` e nessuna versione sia `approved`;
- `curricoloVigente === false` e validazione professionale `OPEN`.

### Determinismo

La stessa coppia snapshot + metadati deve produrre esattamente gli stessi byte. Una modifica del contenuto o della revisione deve cambiare l’impronta o fallire quando incoerente.

### UI

Testare che il lettore:

- identifichi `CAN-CURR-MASTER-00@1.3`;
- mostri `Validazione professionale aperta` e `Non vigente`;
- non mostri più “Non acquisito nella Beta” sul percorso canonico;
- esponga campi di esperienza, ordini, discipline e assi realmente presenti;
- consenta di raggiungere almeno un caso Infanzia, uno Primaria, uno Secondaria, Educazione civica, Latino e AI literacy;
- non inventi classi per Infanzia o annualità per scope `grade-range`;
- non mostri relazioni non presenti nei `verticalLinks`.

### Regressione

Devono restare verdi i test esistenti della PR #347, compresi:

- materializzazione master;
- perimetro;
- release completa;
- export repository;
- snapshot sorgente;
- gate Product CI e relativi gate di interazione/contratto già attivi.

## 10. Fuori perimetro

Non fanno parte di questo intervento:

- chiusura della validazione professionale;
- modifica del master Drive;
- approvazione collegiale o promozione a curricolo vigente;
- sincronizzazione automatica verso Docente OS o Atlas;
- nuova persistenza Supabase;
- redesign generale di Arena;
- merge della PR #347;
- deploy Beta o produzione.

## 11. Criteri di completamento

Il collegamento può essere considerato tecnicamente qualificato quando, su un unico exact head della PR #347:

1. esiste l’artefatto canonico materializzato e versionato;
2. la sua provenienza è verificabile tramite versione, revisione e impronte;
3. i 113 scope sono leggibili dalla UI senza Drive runtime;
4. il vecchio catalogo pilota non determina più la copertura principale;
5. lo stato istituzionale resta esplicitamente `OPEN / NON VIGENTE`;
6. tutti i test mirati e i gate richiesti sono verdi;
7. la PR resta Draft, non mergiata e non deployata.
