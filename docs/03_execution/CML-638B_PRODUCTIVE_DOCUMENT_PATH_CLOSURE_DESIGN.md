# CML-638B — Productive Document Path Closure — Design

> Documento di design. Nessun codice applicativo implementato in questa fase.
> Fase di implementazione successiva basata sulle evidenze reali raccolte.

## 1. Baseline

| Campo | Valore |
|---|---|
| Repository | `C:\Users\anton\CurManLight_arena` |
| Branch | `feat/cml-638b-productive-document-path-closure` |
| Worktree | `C:\Users\anton\CurManLight_arena_cml638b` |
| Baseline | `main = f5289703dbe1daa4bd09cb8e7cdb638aa0988186` |
| HEAD | `f528970` |
| Data | 2026-08-01 |
| Stato | DESIGN (implementazione NON avviata) |
| `kilo.jsonc` | skip-worktree `S` |

Verdetti già acquisiti (prerequisiti):

```text
CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE_MERGED_MAIN
CML_630F2_LEGACY_COMPATIBILITY_EXTENDED_MERGED_MAIN
CML_630F2_CANONICAL_TRANSITION_RESOLVER_CLOSED
CML_POST_PR17_PR18_INTEGRATION_VERIFIED
CML_POST_MERGE_BRANCH_AND_WORKTREE_CLEANUP_COMPLETE
CML_REPOSITORY_READY_FOR_CML_638B
```

## 2. Stato reale del percorso

Ricostruzione del flusso **realmente implementato** in `src/` (verifica diretta su codice, non su documentazione).

### 2.1 Catena sintetica

| Trasferimento | Dominio | UI | Test |
|---|---|---|---|
| A02→A03 | `executeA02ToA03ProposalTransfer` (`domain/revision/transferIntegration.ts`) | ASSENTE | non dedicato |
| A02→A04 | `executeA02ToA04Transfer` (`domain/design/transferA02.ts`) + `validateA02ToA04` | ASSENTE (nessun pulsante "Usa nella progettazione") | `design-transfer-a02.test.ts` |
| A03→A04 | `executeA03ToA04Transfer` (`domain/design/transferA03.ts`) + matrix CML-633G | ASSENTE | `design-transfer-a03.test.ts` |
| A03→A07 | `generateProposalDocument` / `generateDecisionDocument` (`domain/revision/documentIntegration.ts`) | ASSENTE (non persistono in archive) | `document-integration.test.ts` |
| A04→A07 | `executeA04ToA07DocumentTransfer` (`domain/documents/contracts.ts`) | ASSENTE (nessun caller) | `document-transfer.test.ts` |

### 2.2 Matrice per area

| Area | Stato | Input reale | Output reale | Contratto usato | Blocco |
|---|---|---|---|---|---|
| **A02 — Consultazione** | **IMPLEMENTATO (legacy)** | `localCurriculum` da localStorage `curmanlight-custom-curriculum-v2` (fallback `getCurriculumBaseline()`); sub-view home/albero/mappa/popolamento/pilota in `CurriculumTab.tsx` (757 righe) | consultazione traguardi/obiettivi/proposals/evidenze; nessun trasferimento verso A04 | `useLocalCurriculum.ts`, `useCurriculumImportHandlers.ts` | Nessuna azione "Usa nella progettazione"; dati legacy non canonici |
| **A03 — Revisione** | **DUAL (legacy + canonico)** | legacy: `proposals` del baseline + `decisions`/`customTexts` nel store; canonico: `revisionArchive.proposals` | `RevisioneTab.tsx` (561 righe): sezione legacy (setDecision/resetDecision/setCustomText) + `CanonicalProposalsSection` (transitionProposalStatus, createDraft, stati completi) | `domain/revision/repository.ts`, `queries.ts`, `eventLog.ts` | `recordDecision` canonico **senza caller UI**; nessun A03→A04/A03→A07 wired |
| **A04 — Progettazione** | **IMPLEMENTATO (legacy)** | `savedUda` (store), `targetClass/Section`, `selectedTraguardi/Obiettivi/Evidenze`, wizard step 1–5 | `ProgettazioneTab.tsx`; `useUdaProgrammingHandlers` → `addUda` (UdaModel); `useUdaPackageHandlers` | `domain/institution` `getA04InstitutionalRead` | `designArchive` **write-orphaned**: `replaceDesignArchive` ha 0 caller in `src/features`; `DesignSelezioniPanel` mai montato |
| **A07 — Documenti/Export** | **PARZIALE** | `localCurriculum`, `decisions`, `customTexts`, `savedUda`, `institutionalProfile` (`A07InstitutionalDocumentRead` via `getA07InstitutionalDocumentRead`) | export legacy 10+ formati; template engine IA; `CanonicalDocumentTab` su `documentArchive` (sempre vuoto: "Nessun documento presente. Crea un documento dal trasferimento A04.") | `useDocumentExportHandlers.ts` (819 righe), `useDocumentContinuity.ts`, `domain/documents/*` | Nulla crea `DocumentEntity`; `executeA04ToA07DocumentTransfer` mai chiamato; template engine IA **DIMOSTRATIVO** |

### 2.3 Funzionamento runtime reale

- Routing reale: `App.tsx` `pathnameToTab`/`tabToPath` su `BrowserRouter` (`src/routes/index.tsx` è dead code, mai montato).
- Store: `useCurriculumStore` (zustand + persist) → Dexie/IndexedDB `'curmanlight-react-db-state-v1.4.0'` con fallback memoria; chiave localStorage legacy `curmanlight-custom-curriculum-v2`.
- Archivi persistenti: `institutionalArchive`, `documentArchive`, `revisionArchive`, `designArchive`, `guidedWorkflowState` (tutti validati al merge/reidratazione).
- Export legacy genera **file reali** (HTML/Word/ODF/PDF/TXT/CML/Markdown) da dati reali utente; il template engine IA produce solo toast/preview (pulsanti "Genera Modello Word (.docx)" e "Salva in PDF" chiamano solo `showToast`).
- Feature flag: **nessun sistema di feature flag** nel repo (grep zero match).

## 3. Verifica contratti canonici

### 3.1 Dominio documentale (CML-633F) — `src/domain/documents/`

**Entità canoniche disponibili e usabili:**

| Entità | Tipo | File | Stato |
|---|---|---|---|
| `DocumentEntity` | `id, metadata, documentType, title, status, currentVersionRef, instituteRef?, academicYearRef?, author?, sourceRefs, originRefs, tags?` | `types.ts:37` | USABILE |
| `DocumentVersion` | `id, documentRef, versionNumber, content, createdAt, author?, reason?, sourceRefs, institutionalSnapshot, previousVersionRef?, frozen: true, metadata` | `types.ts:52` | USABILE |
| `DocumentContent` / `DocumentSection` | 7 tipi di sezione (heading, paragraph, list, table, curriculum-reference, source-reference, teaching-design, metadata) | `types.ts:67–133` | USABILE |
| `DocumentArchive` | `schemaVersion, updatedAt, documents[], versions[]` | `types.ts:128` | USABILE |
| `DocumentType` (9) / `DocumentStatus` (7) / `ExportFormat` (3) | vocabolari + `DOCUMENT_STATUS_TRANSITIONS`, `canTransitionDocumentStatus` | `vocabularies.ts` | USABILE |
| `InstitutionalSnapshot` | `instituteName, mechanicalCode?, siteName?, academicYearLabel?, declaredRole?, configured` | `types.ts:28` | USABILE |

**Funzioni disponibili:**
- `constructors.ts`: `createEmptyDocumentArchive`, `createDocument`, `createInitialVersion`, `createNextVersion` (richiede precedente `frozen`), `restoreVersionFrom`, `createSection*` (9), `createInstitutionalSnapshot`, `cloneDocumentArchive`.
- `versioning.ts`: `createVersion`, `setCurrentVersion`, `restoreVersion`, `listVersions`, `getLatestVersion`.
- `repository.ts`: `createDocumentInArchive` (valida documento/contenuto/versione, crea doc+v1), `getDocument`, `listDocuments` (filter per type/status/institute/year), `getVersion`, `getVersionList`, `getCurrentVersion`, `setCurrentVersion`, `transitionDocumentStatus`, `archiveDocument`, `supersedeDocument`, `duplicateDocument`, `verifyIntegrity`, `addVersion`, `updateDocument`.
- `validators.ts`: `validateDocument`, `validateVersion`, `validateContent`, `validateTransition`, `validateArchiveIntegrity`.
- `rendering.ts`: `renderSection`, `renderDocumentContent`, `renderSnapshotHeader`, `renderDocument` (HTML completo).
- `exportPolicy.ts`: `validateExportFormat`, `getExportExtension`, `getExportMime`, `buildExportFilename`, `validateExportContent`, `checkFormatConsistency`.
- `serialization.ts`: `serializeDocumentArchive`, `deserializeDocumentArchive`, `fingerprintDocumentArchive`.
- `selectors.ts`: `getDocumentById`, `getCurrentVersionForDocument`, `getDocumentList`, `getDocumentWithVersion`, `getDocumentsByType/Status/Institute/AcademicYear`, `getDocumentHistory`, `getDocumentExportPayload`.
- `legacyAdapters.ts`: `adaptLegacyUdaHtml`, `adaptLegacyExportEvent`, `adaptLegacyHtmlDocument`, `isLegacyDocumentPromotable`, `hasNoPhantomSource/Author`.
- `contracts.ts`: `executeA04ToA07DocumentTransfer(payload, archive)` → valida, costruisce sezioni, crea doc+v1 via `createDocumentInArchive`; **mai chiamato da features**.

**NOTA — Template:** nessun contratto `Template` canonico in `src/domain/` (assente, previsto solo in doc di design CML-633). Non serve introdurlo: le sezioni `DocumentSection` coprono il caso d'uso.

### 3.2 Workflow revisione (CML-633G) — `src/domain/revision/`

- `types.ts`: `RevisionProposal`, `RevisionProposalVersion`, `Decision`, `RevisionProposalStatus` (draft → ready-for-review → submitted → under-review → accepted-for-decision / withdrawn / changes-requested / rejected → archived), `DecisionOutcome` (approve / approve-with-changes / reject / defer / record-only), `RevisionEventType`.
- `repository.ts`: `createEmptyRevisionStore`, `addProposal`, `addProposalVersion`, `recordDecision`, `transitionProposalStatus`, `transitionDecisionStatus`, `verifyArchiveIntegrity`.
- `queries.ts`, `eventLog.ts`, `decisionEffects.ts`, `constructors.ts`, `validators.ts`, `serialization.ts`, `legacyAdapter.ts`, `transferIntegration.ts` (A02→A03 + A03→A04 matrix), `documentIntegration.ts`.
- **`documentIntegration.ts` (A03→A07 bridge):** `generateProposalSheet`, `generateDecisionRecord`, `generateSourceAttachment`, `generateEventHistory`, `generateProposalDocument`, `generateDecisionDocument`. Questi ultimi due restituiscono `DocumentEntity` + `DocumentVersion` (stato `draft`, `frozen: true`) ma **NON li aggiungono a `documentArchive`** — manca la persistenza.
- `recordDecision` canonico: nessun caller UI (solo legacy `setDecision('approved'|'rejected'|'custom')`).

### 3.3 Trasferimenti — `src/domain/transfer/`

- Payload: `A02ToA04Payload`, `A03ToA04Payload`, `A04ToA07Payload` (`areaContracts.ts:7–34`).
- Validazioni: `validateA02ToA04`, `validateA03ToA04`, `validateA04ToA07` (REFERENCE_MISSING, STATUS_VIOLATION, METADATA_MISSING, blocco auto-created via `checkNoAutoCreated`).
- Esecuzioni: `executeA02ToA04`, `executeA03ToA04`, `executeA04ToA07` → `AreaContractResult` (transferId, footprint, evento append-only).
- `A04ToA07Payload` richiede: `designId`, `curriculumRefs[]`, `sources[]`, `institutionalContext{}`, `teachingStructure{}`, `assistedContentOrigin`, `versionOrSnapshot`, `warnings[]`, `metadata.sessionTimestamp`.

### 3.4 Identità e metadati — `src/domain/curriculum/identity/`

- `EntityId` (branded), `SchemaVersion`, `CURRENT_SCHEMA_VERSION`, `ContentOrigin` (9 valori), `CONTENT_ORIGIN_REGISTRY` (con `exportable`, `requiresHumanConfirmation`, `reliability`, `promotableToInstitute`), `ActorReference`, `EntityReference`, `EntityType` (16 valori), `EntityMetadata` (id, createdAt/updatedAt, createdBy/updatedBy, origin, schemaVersion, migration), `MigrationMetadata`.
- Funzioni: `generateEntityId`, `createMetadata`, `createEntityReference` (via `index.ts`).

### 3.5 Istituzione — `src/domain/institution/`

- `getA07InstitutionalDocumentRead(archive): A07InstitutionalDocumentRead` (configured, instituteName, mechanicalCode, siteName, siteAddress, academicYearLabel, declaredRole, organizationId, warning).
- `projectA07InstitutionalDocumentHeader(profile)` → `primaryHeading`, `displayName`, `secondaryLines`, `footer`, `declaredRoleLine`.
- `getA04InstitutionalRead(archive, selectedOrder, contextOrder)` → `A04InstitutionalReadModel` (configured, orderAvailable, orderWarning, academicYearLabel…).
- Già iniettato in `EsportazioniTab` e in `useDocumentExportHandlers` (`institutionalProfile`).

### 3.6 Design selections — `src/domain/design/`

- `DesignCurriculumSelection` (immutable snapshot con qualification, sourceRefs, evidenceRefs, structuralFootprint), `DesignArchive`.
- `transferA02.ts`, `transferA03.ts` (matrix CML-633G: draft/ready-for-review/changes-requested/rejected/withdrawn/archived → non trasferibili; legacy+reject → no; approve → planned-institute-content; record-only → proposed-content).
- `archive.ts`: `addSelection`, `getSelection`, `listSelectionsForDesign`, `replaceSelectionSnapshot`, `removeSelectionLogically`, `findSelectionBySource`, `verifyDesignIntegrity`, `compareSelectionWithSource`.
- `udaAdapter.ts`: `enrichUdaWithSelections` (read model senza mutazione), `extractSelectionsFromUda` (ritorna []), `classifyLegacyUdaContent`.
- `traceabilityA07.ts`: tracciabilità design → document.
- **Quirk:** `transferA02.ts` ritorna solo `createdSelections[0]` e non chiama `addSelection` — le funzioni di transfer sono factory di snapshot pure, la persistenza spetta al chiamante (nessun chiamante).

### 3.7 Entità canoniche: verdetto

| Entità | Presente | Usabile as-is | Note |
|---|---|---|---|
| `Document` | SÌ | SÌ | `DocumentEntity` |
| `DocumentVersion` | SÌ | SÌ | versioning reale, `frozen` |
| `Template` | NO | — | non necessario (sezioni `DocumentSection`) |
| `Proposal` | SÌ (dual) | SÌ canonico (`RevisionProposal`) | legacy `Proposal` separato |
| `CurriculumVersion/Segment/Node` | SÌ | SÌ | `domain/curriculum` |
| `ActorReference` | SÌ | SÌ | self-declared, non autenticato |
| `Institute` | SÌ | SÌ | `domain/institution` |
| `Metadata` | SÌ | SÌ | `EntityMetadata` |
| event log | SÌ | SÌ | `domain/transfer/eventLog`, `domain/revision/eventLog` |
| transfer payload | SÌ | SÌ | 3 payload area |

**Conclusione:** non è necessario introdurre nuovi modelli. Il dominio esistente è sufficiente per l'incremento.

## 4. Casi d'uso

| # | Caso d'uso | Implementato | File coinvolti | Evidenza | Blocco | Severità |
|---|---|---|---|---|---|---|
| 1 | Creare un documento da una progettazione (UDA salvata) | NO (UI) / SÌ (funzione) | `savedUda` store, `executeA04ToA07DocumentTransfer` | Il payload A04→A07 richiede `teachingStructure`, mai costruito da `UdaModel`; nessun caller | Manca mapper `UdaModel→A04ToA07Payload` + hook + UI | BLOCKING |
| 2 | Creare un documento da una revisione approvata | NO (persistenza) | `generateProposalDocument`, `generateDecisionDocument` | Restituiscono doc+v1 ma non li salvano in `documentArchive` | Manca persistenza + UI | BLOCKING |
| 3 | Mantenere provenienza e metadati | PARZIALE | `sourceRefs`, `originRefs`, `EntityMetadata`, `ContentOrigin` | Dominio completo; percorso UI assente | Wiring | SIGNIFICANT |
| 4 | Assegnare tipo documento | PARZIALE | `DocumentType` (9) | `executeA04ToA07DocumentTransfer` fissa `'teaching-design'` | Selettore tipo in UI | MINOR |
| 5 | Associare istituto | PARZIALE | `InstitutionalSnapshot`, `instituteRef`, `academicYearRef` | Snapshot ok nel dominio; nessun flusso UI | Wiring | SIGNIFICANT |
| 6 | Generare una prima versione | PARZIALE | `createInitialVersion`, `createDocumentInArchive` | Dominio ok (v1, frozen); nessun caller | Wiring | SIGNIFICANT |
| 7 | Modificare il contenuto | NO | `createNextVersion`, `updateDocument`, `addVersion` | Dominio ok; nessun editor/sezione UI | Editor contenuto | SIGNIFICANT |
| 8 | Creare una nuova versione | NO | `createNextVersion`, `setCurrentVersion` | Dominio ok; nessun flusso UI | Wiring | SIGNIFICANT |
| 9 | Visualizzare anteprima | PARZIALE | `renderDocument`, `renderSnapshotHeader` | Rendering completo; `CanonicalDocumentTab` non mostra preview; template engine IA preview è solo UI demo | Anteprima canonica | SIGNIFICANT |
| 10 | Esportare | PARZIALE | `CanonicalDocumentTab` (HTML/JSON/"pdf"), `exportPolicy` | File generati solo se ci sono doc (mai); export legacy separato | Connettere export canonico | BLOCKING |
| 11 | Riaprire il documento | PARZIALE | `documentArchive` (IndexedDB persist), `getDocumentList` | Archivio persistente e validato; sempre vuoto in pratica | Wiring | SIGNIFICANT |
| 12 | Recuperare da errore | PARZIALE | `DocumentError`, `DocumentValidationResult`, try/catch handler | Validazioni robuste nel dominio; nessun flusso di errore UI | Handler UI | SIGNIFICANT |
| 13 | Distinguere bozza/finale | PARZIALE | `DocumentStatus` (draft/in-progress/completed/…) + transizioni | `canTransitionDocumentStatus` ok; nessun pannello stato UI | Wiring | MINOR |
| 14 | Preservare la validazione umana | PARZIALE | `ContentOrigin` (`requiresHumanConfirmation`, `exportable`), `assistedContentOrigin` | Registry pronto; nessun gate di conferma prima dell'export | Gate conferma | BLOCKING |

## 5. Analisi A07 (superfici)

### 5.1 EsportazioniTab (standard)

| Funzionalità | Pulsante | Genera file reale | Dati | Formato | Stato |
|---|---|---|---|---|---|
| Scarica Word (.doc) | `handleDownloadWordDefinitivo` | SÌ | curricolo legacy + decisioni + institutionalProfile | .doc (HTML Word) | IMPLEMENTATO |
| Scarica Word (.docx) | `handleDownloadWordDocx` | SÌ | idem | .docx | IMPLEMENTATO |
| LibreOffice/ODF | `handleDownloadODF` | SÌ | idem | .odt | IMPLEMENTATO |
| Salva Curricolo PDF | `handleDownloadCurricoloPDF` | SÌ | idem | .pdf (stampa browser) | IMPLEMENTATO |
| Copia Tabella | `handleCopyToClipboardFormatted` | clipboard | idem | testo | IMPLEMENTATO |
| Scarica .txt | `handleDownloadTxt` | SÌ | disciplina selezionata | .txt | IMPLEMENTATO |
| Proposta .cml | `handleDownloadCml` | SÌ | proposte | .cml | IMPLEMENTATO |
| Word confronto | `handleDownloadWordConfronto` | SÌ | tavole confronto | .doc | IMPLEMENTATO |
| Markdown | `handleDownloadRichMarkdown` | SÌ | contenuto | .md | IMPLEMENTATO |
| Salva in PDF | `handleDownloadPdfDirect` | SÌ | contenuto | .pdf | IMPLEMENTATO |
| Programmazione Annuale | `handleGenerateProgrammazioneAnnualeDoc` | SÌ | `generateProgrammazioneAnnuale` (documentGenerator) | .doc | IMPLEMENTATO (placeholder di contenuto) |
| Relazione Scolastica | `handleGenerateRelazioneDoc` | SÌ | `generateRelazione` (documentGenerator) | .doc | IMPLEMENTATO (placeholder) |
| Documento Specifico | `handleGenerateSpecificoGradoDoc` | SÌ | `generateSpecificoGrado` (documentGenerator) | .doc | IMPLEMENTATO (placeholder) |

### 5.2 EsportazioniTab (template engine IA)

| Funzionalità | Stato |
|---|---|
| Chat "Co-pilota dei modelli locali" | DIMOSTRATIVO (chat locale, nessuna IA remota; comandi applicano solo stilistiche) |
| Selettore modello (relazione/UDA/greci) | DIMOSTRATIVO (default: 3 sezioni fisse hardcoded) |
| Anteprima foglio bianco | DIMOSTRATIVO (testi placeholder fissi, non dati reali utente) |
| Genera Modello Word (.docx) | DIMOSTRATIVO (chiama solo `showToast`, nessun file) |
| Salva in PDF | DIMOSTRATIVO (solo `showToast`) |

### 5.3 CanonicalDocumentTab

| Funzionalità | Stato |
|---|---|
| Elenco documenti | IMPLEMENTATO ma sempre vuoto (nessun creatore) |
| Export HTML | IMPLEMENTATO (blob reale) |
| Export JSON | IMPLEMENTATO (archivio serializzato) |
| "pdf-browser" | IMPLEMENTATO ma il blob è HTML con estensione/mime `.pdf` (fake) |
| Duplica | IMPLEMENTATO (dominio) |
| Archivia | IMPLEMENTATO (dominio) |
| Anteprima | ASSENTE (mostra solo metadati versione, non il rendering) |
| Versioning incrementale | ASSENTE (nessuna azione "nuova versione") |
| Identità stabile | SÌ (EntityId) |
| Ricostruzione dopo reload | SÌ (archivio persistito IndexedDB, validato al merge) |
| Metadata persistiti | SÌ (sourceRefs, originRefs, origin, institutionalSnapshot) |

### 5.4 Verdetto A07

- **Export legacy**: produttivo (10+ formati) ma disconnesso dal dominio canonico (nessuna `DocumentEntity`), perdita di metadata/versioning/identity.
- **Template engine IA**: DIMOSTRATIVO — nessun file reale, testi placeholder, coerente con blocco #1 della CML-638A (BLOCKING).
- **Documenti canonici**: infrastruttura completa ma **nessun creatore** → superficie morta.

## 6. Gap end-to-end

Catena richiesta: **A02 → A03 → A04 → A07 → Document → DocumentVersion → Render → Export**

| Passaggio | Input | Output | Mapping | File | Test | Perdita dati | Stato |
|---|---|---|---|---|---|---|---|
| A02→A03 | nodo curricolo | `RevisionProposal` | `executeA02ToA03ProposalTransfer` | `revision/transferIntegration.ts` | — | nessuna (dominio) | Dominio SÌ / UI NO |
| A02→A04 | nodi curricolo | `DesignCurriculumSelection` | `executeA02ToA04Transfer` | `design/transferA02.ts` | `design-transfer-a02` | — | Dominio SÌ / UI NO |
| A03→A04 | proposta (status/matrix) | selection qualificata | `executeA03ToA04Transfer` | `design/transferA03.ts` | `design-transfer-a03` | — | Dominio SÌ / UI NO |
| A03→A07 | proposta/decisione | doc+v1 (non persistito) | `generateProposalDocument`/`generateDecisionDocument` | `revision/documentIntegration.ts` | `document-integration` | **archivio** | Dominio SÌ / persistenza NO |
| A04→A07 | UDA salvata | `A04ToA07Payload` | **mancante** | — | `document-transfer` (payload manuale) | **payload non costruito da UdaModel** | **ASSENTE** |
| A07→Document | payload | `DocumentEntity` | `executeA04ToA07DocumentTransfer` | `documents/contracts.ts` | `document-transfer` | nessuna | Dominio SÌ / caller NO |
| Document→Version | doc | v1 (frozen) | `createDocumentInArchive` | `documents/repository.ts` | `document-repository` | nessuna | Dominio SÌ / caller NO |
| Version→Render | version | HTML | `renderDocument` | `documents/rendering.ts` | `document-rendering` | nessuna | SÌ (non esposto) |
| Render→Export | HTML | file locale | `CanonicalDocumentTab` handlers + `exportPolicy` | `features/documents/components` | `document-export` | nessuna | SÌ (su doc esistenti) |

### 6.1 Primo punto di interruzione produttiva

**A04→A07, esattamente tra `savedUda` (store) e `executeA04ToA07DocumentTransfer` (dominio).**

Il percorso si ferma perché:
1. esiste la UDA salvata (`UdaModel` nel store, `addUda` in `useUdaProgrammingHandlers`), persistita via IndexedDB;
2. esiste `executeA04ToA07DocumentTransfer` già testato che creerebbe il documento canonico;
3. **manca il bridge applicativo**: nessun mapper `UdaModel → A04ToA07Payload`, nessun hook/servizio che lo invochi, nessun pulsante UI.

Di conseguenza `documentArchive` resta sempre vuoto, `CanonicalDocumentTab` non mostra nulla e l'export canonico (HTML/JSON) è irraggiungibile.

### 6.2 Blocchi secondari

- `generateProposalDocument`/`generateDecisionDocument` non persistono in `documentArchive` (bisogno: `createDocumentInArchive` + `replaceDocumentArchive`).
- Export legacy non produce `DocumentEntity` (bisogno: non toccare il flusso legacy, aggiungere percorso canonico parallelo).
- Gate di conferma umana prima dell'export assente (requisito da `CONTENT_ORIGIN_REGISTRY`).

## 7. Incremento minimo CML-638B

**Frase "Il docente potrà...":** *Il docente potrà trasformare una propria UDA salvata (o una proposta/revisione approvata) in un documento strutturato con identità, provenienza e versioni, verificarne l'anteprima e scaricarlo localmente senza perdere il lavoro di progettazione.*

Incremento che rende **produttivo** il percorso A04→A07 (e, come beneficio, A03→A07):

1. **Mapper puro** `buildA04ToA07PayloadFromUda(uda, institutionalRead): A04ToA07Payload` — converte `UdaModel` in payload valido (designId derivato stabile, curriculumRefs/sources dalle selezioni UDA, teachingStructure = struttura UDA, institutionalContext dallo snapshot istituzionale, assistedContentOrigin = `teacher`).
2. **Servizio applicativo** `useDocumentProduction` (hook) con azioni pure + effetti separati:
   - `createDocumentFromUda(uda)` → `executeA04ToA07DocumentTransfer` → `replaceDocumentArchive` (nessuna mutazione della UDA sorgente);
   - `createDocumentFromProposal(proposalId)` / `createDocumentFromDecision(...)` → `generateProposalDocument`/`generateDecisionDocument` → `createDocumentInArchive` → persist;
   - `createNextVersion(documentId, reason, content)` → `createNextVersion` + `addVersion` + `setCurrentVersion`;
   - `getDocumentPreview(documentId)` → `renderDocument` (HTML);
   - `exportDocument(documentId, format)` → `buildExportFilename` + blob (HTML/JSON; pdf-browser = stampa browser, non finto PDF);
   - `requireHumanConfirmation(document)` → gate basato su `CONTENT_ORIGIN_REGISTRY[origin].requiresHumanConfirmation` e `exportable`.
3. **UI minima in A07** (`EsportazioniTab` → sezione "Documenti dal percorso produttivo"):
   - selettore fonte: UDA salvata (da `savedUda`) oppure proposta/decisione (da `revisionArchive`);
   - pulsante "Crea documento" (crea `DocumentEntity` + v1, stato `draft`);
   - lista documenti canonici con stato/versione;
   - anteprima (render HTML in pannello);
   - "Nuova versione" (bozza modificabile → versione successiva);
   - "Esporta HTML/JSON" e "Stampa/PDF browser" **solo dopo conferma esplicita** se `origin` richiede conferma;
   - nessuna modifica automatica di `savedUda`/`revisionArchive`.
4. **Nessun nuovo modello**: riuso completo di `domain/documents`, `domain/transfer`, `domain/institution`, `domain/revision`.
5. **Persistence**: già presente (`documentArchive` persistito e validato). Eventuale azione store `restoreBackupState` da estendere a document/design **solo se necessario** (fuori scope minimo: documentArchive è già reidratato dal persist middleware).

Criterio di utilizzabilità: un docente con una UDA in `savedUda` deve poter produrre, in <5 interazioni, un documento canonico con v1, anteprima e download locale. Nulla di dimostrativo.

## 8. Decisioni architetturali

| Decisione | Scelta |
|---|---|
| Source of truth A04 | `savedUda` (store `UdaModel`) resta fonte per la creazione; il documento canonico è snapshot autonomo |
| Source of truth A07 | `documentArchive` (store) |
| Mapping A04→Document | Nuovo modulo puro `src/features/documents/mappers/udaToA07Payload.ts` (no store, no UI) |
| Mapping A03→Document | Riuso `domain/revision/documentIntegration.ts` (già genera doc+v1) + `createDocumentInArchive` per la persistenza |
| Creazione `DocumentVersion` | `createInitialVersion` (prima), `createNextVersion` (successive, `frozen` obbligatorio) via `repository.addVersion` + `setCurrentVersion` |
| Rendering | `renderDocument` / `renderDocumentContent` esistenti (HTML) |
| Export | `exportPolicy` (`buildExportFilename`, `getExportMime`, `validateExportContent`) + blob download locale; pdf-browser = stampa browser |
| Identità | `generateEntityId` (EntityId branded) — identità stabile |
| Riapertura | `documentArchive` persistito (IndexedDB) + `getDocumentList`/`getCurrentVersionForDocument` |
| Storage locale | IndexedDB esistente (`zustand persist`, chiave `curmanlight-react-db-state-v1.4.0`) — nessun nuovo backend |
| Errore | `DocumentError`/`DocumentValidationResult` del dominio + toast UI; nessuna corruzione del work docente |
| Funzioni pure | mapper, validazioni, versioning, rendering, export policy (già puri) |
| Effetti separati | persistenza archivio, download blob, event log (`documentExportHistory`) |
| API riusate | `executeA04ToA07DocumentTransfer`, `createDocumentInArchive`, `createNextVersion`/`addVersion`/`setCurrentVersion`, `renderDocument`, `serializeDocumentArchive`, `getA07InstitutionalDocumentRead`, `projectA07InstitutionalDocumentHeader`, `replaceDocumentArchive` |

Vincoli rispettati: nessun backend/OAuth/remoto/telemetria; nessuna modifica dati curricolari; nessun tocco a CML-634B/635/637; scope limitato al percorso documentale.

## 9. Test richiesti

Distinzione per livello. Stima mirata (test nuovi per l'incremento).

### Unit (dominio puro) — `src/__tests__/`
| Test | File previsto | Casi |
|---|---|---|
| Mapping A03→Document | `cml-638b-mapping-a03-document.test.ts` | proposta approvata → doc tipo `revision-proposal`; decisione → `decision-record`; versione v1 frozen; provenienza `sourceRefs`/`originRefs` |
| Mapping A04→Document | `cml-638b-mapping-a04-document.test.ts` | `buildA04ToA07PayloadFromUda` da `UdaModel` completo; payload valido con designId stabile; institutionalContext corretto; `assistedContentOrigin` = teacher |
| Creazione prima versione | `cml-638b-version-creation.test.ts` | v1 con `versionNumber=1`, `frozen`, `previousVersionRef` undefined |
| Incremento versione | `cml-638b-version-increment.test.ts` | v2 da v1 frozen; refuso se v1 non frozen; `setCurrentVersion` aggiorna `currentVersionRef` |
| Provenienza | `cml-638b-provenance.test.ts` | `sourceRefs`/`originRefs`/`metadata.origin` conservati dal trasferimento |
| Metadata | `cml-638b-metadata.test.ts` | createdAt/updatedAt, author, institutionalSnapshot |
| Stato bozza | `cml-638b-status-draft.test.ts` | nuovo documento = `draft`; transizioni valide/invalide via `canTransitionDocumentStatus` |
| Rendering | `cml-638b-rendering.test.ts` | `renderDocument` produce HTML con sezioni, senza `<script>`, header istituzionale |
| Export | `cml-638b-export.test.ts` | `buildExportFilename`/`getExportMime`/`validateExportContent` per html/json; pdf-browser coerente con stampa |
| Input incompleto | `cml-638b-incomplete-input.test.ts` | UDA senza titolo/struttura → errore `REFERENCE_MISSING`/`VALIDATION_FAILED`, nessun doc creato |
| Errore | `cml-638b-error.test.ts` | payload non valido → `A04ToA07DocumentResult.status='failed'`, archivio immutato |
| Recovery | `cml-638b-recovery.test.ts` | errori idempotenti; nessun doc parziale dopo fallimento |
| Round trip locale | `cml-638b-roundtrip.test.ts` | serialize→deserialize→fingerprint stabile; document ricostruibile dopo reload (merge persist) |
| Nessuna mutazione sorgente | `cml-638b-no-mutation.test.ts` | `savedUda` e `revisionArchive` invariati dopo creazione documento |
| Nessuna perdita dati | `cml-638b-no-loss.test.ts` | tutte le sezioni originali presenti nel doc; `validateArchiveIntegrity` ok dopo operazioni |

**Totale unit ≈ 15 file / ~55–70 casi.**

### Integration (store + hook)
| Test | File | Casi |
|---|---|---|
| `replaceDocumentArchive` valida e persiste | `cml-638b-store.test.ts` | creazione → archivio aggiornato; archivio non valido rifiutato |
| Hook `useDocumentProduction` | `cml-638b-hook.test.ts` | create/createNextVersion/preview/export senza mutare sorgente; event log |

**Totale integration ≈ 2 file / ~10 casi.**

### UI (component) — `.test.tsx`
| Test | File | Casi |
|---|---|---|
| Sezione "Documenti dal percorso produttivo" | `cml-638b-ui.test.tsx` | selettore UDA/proposta; crea doc; lista; anteprima; esporta; conferma richiesta |

**Totale UI ≈ 1 file / ~6–8 casi.**

### Browser
- Verifica manuale (livello 2/4): crea UDA → crea documento → anteprima → download HTML/JSON → reload → documento presente. Non automatizzata in questa fase (fuori budget, coerente con CML-638A).

## 10. Piano di implementazione

Sequenza adattata al codice reale (dominio già presente → si parte dal bridge applicativo). Ogni commit piccolo e revisionabile.

| # | Commit | Obiettivo | File | Test | Rischio | Criterio di accettazione |
|---|---|---|---|---|---|---|
| 1 | `feat(CML-638B): add UdaModel → A04ToA07 payload mapper` | Bridge A04→A07 (puro) | `src/features/documents/mappers/udaToA07Payload.ts` (+ test) | `cml-638b-mapping-a04-document` | Basso (puro) | payload valido da UDA; test verdi |
| 2 | `feat(CML-638B): add document production service` | Hook applicativo (create/preview/export/version/conferma) | `src/features/documents/hooks/useDocumentProduction.ts` (+ test) | `cml-638b-hook`, store | Medio (effetti) | create→archive persistito; nessuna mutazione sorgente |
| 3 | `feat(CML-638B): persist A03-generated documents` | Collega `generateProposalDocument`/`generateDecisionDocument` all'archivio | `src/features/documents/hooks/useDocumentProduction.ts` (extend) | `cml-638b-mapping-a03-document`, `cml-638b-no-loss` | Medio | doc da proposta/decisione persistito |
| 4 | `feat(CML-638B): wire A07 document production UI` | Sezione UI in `EsportazioniTab` (selettore, crea, lista) | `src/features/documents/components/*` + `EsportazioniTab.tsx` | `cml-638b-ui` | Medio (props) | docente crea documento in <5 interazioni |
| 5 | `feat(CML-638B): add document preview` | Anteprima render HTML | componente preview | `cml-638b-rendering`, UI | Basso | anteprima visibile prima dell'export |
| 6 | `feat(CML-638B): add canonical export with human confirmation` | Export HTML/JSON + gate conferma | `useDocumentProduction` (exportDocument) + UI | `cml-638b-export`, `cml-638b-ui` | Medio | nessun export senza conferma quando richiesta |
| 7 | `feat(CML-638B): add recovery handling` | Errori UI, idempotenza, archivio immutato | hook + UI | `cml-638b-error`, `cml-638b-recovery` | Basso | fallimento non corrompe work |
| 8 | `test(CML-638B): end-to-end document path tests` | Test di integrazione round trip | `cml-638b-roundtrip`, `cml-638b-no-mutation`, `cml-638b-no-loss` | — | Basso | catena completa coperta |
| 9 | `docs(CML-638B): implementation closure` | Documentazione finale | `docs/03_execution/CML-638B_*.md` | — | Basso | verifiche + verdetti |

## 11. Verifica scope

Conferma esplicita: l'incremento **non prevede modifiche** a:
- autenticazione — ASSENTE (nessuna)
- ruoli/permessi — ASSENTE (fuori CML-635)
- Workspace/shell/routing — ASSENTE (solo aggiunta sezione in tab esistente)
- AI provider / IA — ASSENTE (nessun uso; template engine IA resta com'è, non toccato)
- servizi remoti — ASSENTE (nessun backend/OAuth/telemetria)
- telemetria — ASSENTE
- dati curricolari — ASSENTE (`curriculumKB`, baseline, `localCurriculum` intatti; nessuna scrittura su curricolo)
- dipendenze — ASSENTE (nessuna nuova libreria; nessun modificato package.json)
- aree fuori A02/A03/A04/A07 — ASSENTE (nessun tocco a CML-634B, CML-635, CML-637)
- flusso export legacy — ASSENTE (rimane intatto; percorso canonico parallelo)

## 12. Output previsto

Documento di design: `docs/03_execution/CML-638B_PRODUCTIVE_DOCUMENT_PATH_CLOSURE_DESIGN.md` (questo file).
Implementazione applicativa: **non avviata** in questa fase.

## 13. Verifiche finali (design)

- `git status --short` → pulito, unico file nuovo
- `git diff --check` → nessun warning
- `git diff --stat` → 1 file
- Commit: `docs(CML-638B): design productive document path closure`
- Nessun push

## 14. Criteri di accettazione (per la fase di implementazione)

1. Da una UDA salvata si crea un `DocumentEntity` con v1 `frozen`, stato `draft`, identità stabile, `sourceRefs`/`originRefs`/`metadata.origin` corretti.
2. Da proposta/decisione approvata si crea documento canonico persistito.
3. `documentArchive` ricostruibile dopo reload (IndexedDB).
4. Anteprima render HTML verificabile prima dell'export.
5. Export HTML/JSON locale con `buildExportFilename`/mime corretti; pdf-browser = stampa browser.
6. Conferma umana richiesta quando `CONTENT_ORIGIN_REGISTRY[origin].requiresHumanConfirmation === true`.
7. `savedUda` e `revisionArchive` immutati da ogni operazione.
8. Nessuna mutazione dei dati curricolari.
9. tsc + `test:fast` + build verdi.
10. Nessun backend/remote/telemetria introdotto.

## 15. Rischi

| Rischio | Mitigazione |
|---|---|
| `A04ToA07Payload` è stringa-based (designId, curriculumRefs) — mapping a `UdaModel` deve restare stabile | mapper puro testato; `designId` derivato deterministico (`uda-<id>`) |
| `executeA04ToA07DocumentTransfer` fissa `documentType='teaching-design'` | accettabile per l'incremento; selettore tipo = estensione futura |
| Export pdf-browser "finto" (HTML con mime pdf) | usare stampa browser (`window.print`) e non claim di PDF reale |
| Store persist già valida `documentArchive` al merge → rischio di scarto dati se schema cambia | nessuna modifica schema; `DOCUMENT_ARCHIVE_SCHEMA_VERSION` invariato |
| `restoreBackupState` non ripristina document/design | fuori scope; documentArchive già persistito dal middleware |
| Hook con effetti multipli (persist + event log + toast) | separare funzioni pure (mapper/dominio) da effetti; test unit + integration |
| Scope creep verso editor completo o template engine | blocco incremento ai 9 commit; template engine resta DIMOSTRATIVO/fuori scope |

## 16. Out of scope

- Editor documentale completo / WYSIWYG
- Template engine A07 (consolidamento CML-636A/B)
- Export docx/odf canonico da `DocumentEntity` (resta legacy)
- Ruoli, permessi, repository condiviso, sync (CML-635)
- IA locale (CML-634) e fonti/volumi (CML-637)
- Riavvio percorso guidato (CML-631)
- Refactoring di `App.tsx`, routing, shell, store legacy

## 17. Verdict (attesi a fine design)

```text
CML_638B_PRODUCTIVE_DOCUMENT_PATH_CLOSURE_DESIGN_COMPLETE_LOCAL
CML_638B_IMPLEMENTATION_NOT_STARTED
```

## Evidenze

- Baseline: `main = f528970`
- Contratti verificati: `src/domain/documents/*` (index 127 righe), `src/domain/transfer/areaContracts.ts` (338 righe), `src/domain/revision/documentIntegration.ts` (361 righe), `src/domain/design/{types,transferA03,udaAdapter}.ts`, `src/domain/institution/selectors.ts` (151 righe), `src/domain/curriculum/identity/types.ts` (289 righe)
- Store: `src/store/useCurriculumStore.ts` (341 righe) — persist IndexedDB
- A07: `EsportazioniTab.tsx` (454 righe), `CanonicalDocumentTab.tsx` (169 righe), `useDocumentExportHandlers.ts` (819 righe)
- Test dominio documentale esistenti: `document-{domain,export,integration,legacy,rendering,repository,transfer}.test.ts` (es. `document-transfer.test.ts` 121 righe, 11 casi)
- Baseline CML-638A: blocco #1 A07 template engine (BLOCKING), blocco #2 qualità output (SIGNIFICANT)
