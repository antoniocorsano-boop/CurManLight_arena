# Arena Canonical Curriculum UI Materialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materializzare `CAN-CURR-MASTER-00@1.3` revisione Drive `27` in un artefatto Arena deterministico e versionato e rendere i suoi 113 scope consultabili dal `ProfessionalCurriculumReader` in sola lettura, senza dipendenza runtime da Drive o persistenza parallela Supabase.

**Architecture:** La generazione avviene fuori dal runtime browser a partire dallo snapshot testuale della revisione Drive verificata, usando il materializzatore già presente nella PR #347. Il prodotto importa un JSON versionato, lo valida con un contratto fail-closed e lo trasforma in un modello di lettura che alimenta il lettore professionale rispettando `ARENA_UX_CONTRACT@1.0.0`; il vecchio fascicolo dipartimentale resta archivio/provenienza e non autorità di copertura.

**Tech Stack:** TypeScript, React 18, Vite 6, Vitest 4, Testing Library, Node 22, JSON versionato, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-19-arena-canonical-curriculum-ui-materialization-design.md`

## Global Constraints

- Autorità unica: `CAN-CURR-MASTER-00@1.3`, Drive file ID `12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4`, A.S. `2026/2027`.
- Revisione Drive verificata al momento della pianificazione: `27`. **Prima della generazione reale va riletta la revisione corrente; se non è più `27`, fermarsi e non generare un artefatto stale.**
- Copertura attesa: esattamente `113` scope e `113` elementi in `perimeter.expected`.
- Stato istituzionale invariato: `humanProfessionalValidation = OPEN`, `curricoloVigente = false`, versione `under-review`, segmenti `under-review`, nodi/link `proposed`.
- Nessun accesso Drive/Docs dal browser; nessuna nuova persistenza Supabase; nessuna seconda autorità curricolare.
- L’artefatto persistito non contiene timestamp di generazione variabili né `computedAt` nelle impronte stabili.
- Gerarchia di consultazione invariata: `disciplina/campo/asse → ordine di scuola → annualità/scope → contenuti`.
- Copia primaria conforme a `ARENA_UX_CONTRACT@1.0.0`: non esporre al primo livello `master canonico`, `baseline`, `fingerprint`, `SHA` o altri identificativi tecnici.
- Trama canonica fail-closed: nessuna inferenza `same-nucleus` nel percorso canonico e nessun `verticalLink` `proposed` presentato come relazione professionale validata.
- Nessun merge, deploy Beta, deploy produzione o promozione istituzionale in questo piano.
- TDD obbligatorio per ogni modifica produttiva: RED verificato → implementazione minima → GREEN → regressione.

## Review Focus

1. **Revisione Drive cambiata da `27`:** il passo di generazione deve interrompersi e richiedere riallineamento della fonte, non produrre silenziosamente un artefatto vecchio.
2. **Artefatto corrotto o copertura diversa da 113:** il modello di lettura deve fallire chiuso e la UI deve mostrare `Curricolo d’Istituto non verificabile`, senza ripiego al fascicolo pilota.
3. **Infanzia `school-level`:** non deve comparire alcuna classe numerica inventata; i 3/4/5 anni restano contenuto del campo di esperienza.
4. **Scope `grade-range`:** intervalli come AI literacy I–II o III–V devono restare intervalli nativi, senza annualità sintetiche.
5. **Trama canonica:** nessuna relazione deve nascere da coincidenza testuale del nucleo e i link `proposed` non devono essere rappresentati come già validati.

---

### Task 1: Contratto deterministico dell’artefatto canonico

**Files:**
- Create: `src/__tests__/fixtures/curricoloVerticaleMasterFixture.ts`
- Modify: `src/__tests__/curricolo-verticale-master-materialization-v1.test.ts`
- Create: `src/domain/transfer/curricoloVerticaleArtifactV1.ts`
- Create: `src/__tests__/curricolo-verticale-artifact-v1.test.ts`

**Interfaces:**
- Consumes: `materializeCurricoloVerticaleMasterV1`, `canonicalSerialize`, `computeStructuralFootprint`, tipi `CurricoloVerticaleCanonicalSourceMasterV1` e `CurricoloVerticaleMasterMaterializationV1`.
- Produces:
  - `StableFootprintV1 = { algorithm: 'fnv1a'; version: 1; hash: string }`
  - `CurricoloVerticaleArtifactV1`
  - `createCurricoloVerticaleArtifactV1(input: CreateCurricoloVerticaleArtifactV1Input): CurricoloVerticaleArtifactV1`
  - `validateCurricoloVerticaleArtifactV1(input: unknown): { valid: boolean; errors: string[] }`
  - `serializeCurricoloVerticaleArtifactV1(artifact: CurricoloVerticaleArtifactV1): string`

- [ ] **Step 1: Estrarre la fixture testuale senza cambiare il comportamento esistente**

Spostare `buildMasterFixture`, il master fixture e l’helper di materializzazione in `src/__tests__/fixtures/curricoloVerticaleMasterFixture.ts`; aggiornare il test esistente a importarli.

- [ ] **Step 2: Verificare che il refactoring test-only sia GREEN**

Run: `npx vitest run --project unit src/__tests__/curricolo-verticale-master-materialization-v1.test.ts`

Expected: PASS con gli stessi quattro casi già presenti.

- [ ] **Step 3: Scrivere il test RED del contratto artefatto**

In `curricolo-verticale-artifact-v1.test.ts` fissare questi casi:

```ts
it('creates a stable non-authoritative artifact for all 113 scopes')
it('serializes byte-identically for the same snapshot and metadata')
it('changes artifact footprint when revisionId changes')
it('rejects tampered coverage or approved/effective authority drift')
it('persists no computedAt field in stable footprints')
```

Asserzioni chiave: schema `ARENA_CANONICAL_CURRICULUM_ARTIFACT_V1`, master `CAN-CURR-MASTER-00`, versione `1.3`, 113 segmenti, 113 scope attesi, `OPEN`, `false`, nessun `approved/effective`, nessun `computedAt` nella serializzazione.

- [ ] **Step 4: Eseguire il RED e confermare che fallisca per modulo/funzioni mancanti**

Run: `npx vitest run --project unit src/__tests__/curricolo-verticale-artifact-v1.test.ts`

Expected: FAIL specifico perché `curricoloVerticaleArtifactV1` non esiste ancora.

- [ ] **Step 5: Implementare il contratto minimo**

In `src/domain/transfer/curricoloVerticaleArtifactV1.ts`:

- chiamare il materializzatore esistente, senza duplicarne la logica;
- ridurre ogni `StructuralFootprint` a `{ algorithm, version, hash }`;
- calcolare `artifactFootprint` sul payload escluso `artifactFootprint` stesso;
- validare identità, versione, revisione non vuota, 113/113, stati non approvati e impronte;
- serializzare con `canonicalSerialize`.

- [ ] **Step 6: Eseguire il GREEN del contratto**

Run: `npx vitest run --project unit src/__tests__/curricolo-verticale-artifact-v1.test.ts src/__tests__/curricolo-verticale-master-materialization-v1.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/domain/transfer/curricoloVerticaleArtifactV1.ts src/__tests__/fixtures/curricoloVerticaleMasterFixture.ts src/__tests__/curricolo-verticale-master-materialization-v1.test.ts src/__tests__/curricolo-verticale-artifact-v1.test.ts
git commit -m "feat(arena): define canonical curriculum artifact"
```

---

### Task 2: Generatore riproducibile e artefatto reale della revisione 27

**Files:**
- Create: `scripts/materialize-canonical-curriculum-v1.mjs`
- Modify: `package.json`
- Create: `src/__tests__/curricolo-verticale-artifact-generator-v1.test.ts`
- Create: `src/features/curriculum/data/canonicalCurriculumV13.generated.json`

**Interfaces:**
- Consumes: `createCurricoloVerticaleArtifactV1` e `serializeCurricoloVerticaleArtifactV1` dalla Task 1.
- Produces: comando `npm run curriculum:materialize-master -- --input <file> --revision-id <id> --output <file>` e artefatto JSON reale importabile dal prodotto.

- [ ] **Step 1: Scrivere il test RED del generatore**

Il test deve avviare il comando su una fixture temporanea e verificare:

```ts
it('requires an explicit revision id')
it('generates byte-identical output twice from the same input')
it('writes a valid 113-scope artifact without computedAt')
```

- [ ] **Step 2: Verificare il RED**

Run: `npx vitest run --project unit src/__tests__/curricolo-verticale-artifact-generator-v1.test.ts`

Expected: FAIL perché script e comando npm non esistono.

- [ ] **Step 3: Implementare il generatore senza nuove dipendenze**

Creare `scripts/materialize-canonical-curriculum-v1.mjs` con parametri obbligatori `--input`, `--revision-id`, `--output`. Usare Vite in modalità server-side per caricare il modulo TypeScript del contratto artefatto, quindi leggere il testo locale, costruire il master metadata fisso e scrivere la serializzazione canonica.

Metadati fissi del generatore:

```text
masterId = CAN-CURR-MASTER-00
masterVersion = 1.3
driveFileId = 12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4
institutionId = ics-lorenzo-milani
schoolYearRef = 2026/2027
authority = INSTITUTE_CANONICAL_WORKING_BASELINE
humanProfessionalValidation = OPEN
curricoloVigente = false
```

Aggiungere a `package.json`:

```json
"curriculum:materialize-master": "node scripts/materialize-canonical-curriculum-v1.mjs"
```

- [ ] **Step 4: Eseguire il GREEN del generatore su fixture**

Run: `npx vitest run --project unit src/__tests__/curricolo-verticale-artifact-generator-v1.test.ts`

Expected: PASS.

- [ ] **Step 5: Rileggere la revisione Drive prima della generazione reale**

Verificare il file Drive canonico e richiedere `currentRevisionId === "27"`.

Expected: `27`. Se il valore è diverso, **STOP**: non proseguire con i passi 6–8 finché fonte, specifica e piano non sono riallineati.

- [ ] **Step 6: Esportare in locale la revisione 27 come `text/plain` senza versionarla**

Usare il connettore Drive per la revisione `27`; salvare il testo in un file temporaneo locale. Non aggiungere lo snapshot sorgente al repository.

- [ ] **Step 7: Generare l’artefatto reale**

Run:

```bash
npm run curriculum:materialize-master -- --input <snapshot-rev27.txt> --revision-id 27 --output src/features/curriculum/data/canonicalCurriculumV13.generated.json
```

Expected: file generato valido, 113 scope, nessun `computedAt`, nessuna rete richiesta dall’applicazione.

- [ ] **Step 8: Rigenerare una seconda volta e verificare identità byte-per-byte**

Run dello stesso comando verso un file temporaneo e confronto binario con `canonicalCurriculumV13.generated.json`.

Expected: identico.

- [ ] **Step 9: Commit Task 2**

```bash
git add package.json scripts/materialize-canonical-curriculum-v1.mjs src/__tests__/curricolo-verticale-artifact-generator-v1.test.ts src/features/curriculum/data/canonicalCurriculumV13.generated.json
git commit -m "feat(arena): materialize canonical curriculum artifact"
```

---

### Task 3: Modello di lettura canonico fail-closed

**Files:**
- Create: `src/features/curriculum/data/canonicalCurriculumReadModel.ts`
- Create: `src/__tests__/canonical-curriculum-read-model.test.ts`

**Interfaces:**
- Consumes: `CurricoloVerticaleArtifactV1`, `validateCurricoloVerticaleArtifactV1`, tipi di proiezione di `CurriculumExploreTrama`.
- Produces:
  - `CanonicalCurriculumReadModel`
  - `CanonicalCurriculumReadResult = { ok: true; value: CanonicalCurriculumReadModel } | { ok: false; errors: string[] }`
  - `buildCanonicalCurriculumReadModel(artifact: CurricoloVerticaleArtifactV1): CanonicalCurriculumReadModel`
  - `loadCanonicalCurriculumReadModel(input: unknown): CanonicalCurriculumReadResult`

- [ ] **Step 1: Scrivere il test RED del modello di lettura**

Casi obbligatori:

```ts
it('derives disciplines fields orders and scopes from the 113 canonical segments')
it('keeps infancy school-level without a numeric class')
it('keeps AI literacy grade ranges native')
it('reaches civic education and Latin without a hardcoded coverage registry')
it('fails closed when the artifact is invalid or incomplete')
it('retains proposed relation status without promoting it')
```

- [ ] **Step 2: Verificare il RED**

Run: `npx vitest run --project unit src/__tests__/canonical-curriculum-read-model.test.ts`

Expected: FAIL perché il read model non esiste.

- [ ] **Step 3: Implementare il read model minimo**

Derivare il catalogo esclusivamente da `artifact.materialization.segments`; un piccolo dizionario di etichette umane per gli ID di dominio è ammesso, ma non deve decidere quali discipline/campi esistono.

Regole di scope:

```text
school-level infanzia -> etichetta 3–5 anni, targetClass vuoto
grade -> classe romana coerente con 1–5 / 1–3
grade-range -> intervallo nativo, targetClass vuoto
```

Aggregare nei campi visibili soltanto collezioni non vuote del segmento. Conservare `verticalLinks` con `relationType` e `status`, senza trasformare `proposed` in `validated`.

- [ ] **Step 4: Eseguire il GREEN**

Run: `npx vitest run --project unit src/__tests__/canonical-curriculum-read-model.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/features/curriculum/data/canonicalCurriculumReadModel.ts src/__tests__/canonical-curriculum-read-model.test.ts
git commit -m "feat(arena): add canonical curriculum read model"
```

---

### Task 4: Collegare ProfessionalCurriculumReader ai 113 scope

**Files:**
- Modify: `src/features/curriculum/components/ProfessionalCurriculumReader.tsx`
- Modify: `src/features/curriculum/components/CurriculumExploreTrama.tsx`
- Modify: `src/__tests__/curriculum-information-architecture.test.tsx`
- Modify: `src/__tests__/canonical-curriculum-entry.test.ts`
- Modify: `src/__tests__/curriculum-explore-trama-v2-contract.test.ts`
- Modify if required by the same behavior: `src/__tests__/curriculum-mobile-compact-contract.test.ts`
- Create: `src/__tests__/canonical-curriculum-reader.test.tsx`

**Interfaces:**
- Consumes: generated JSON della Task 2 e `loadCanonicalCurriculumReadModel` della Task 3.
- Produces: `ProfessionalCurriculumReader` canonico; `CurriculumExploreTrama` accetta un catalogo pre-costruito e una modalità sorgente canonica mantenendo compatibilità interna col percorso precedente.

- [ ] **Step 1: Scrivere/aggiornare i test RED della UI**

Fissare almeno questi comportamenti:

```ts
it('shows Versione di lavoro 1.3, validation open and Non vigente')
it('does not show pilot or not-acquired coverage labels')
it('keeps the selector hierarchy discipline-field then order then scope')
it('can reach an infancy field without a numeric class')
it('can reach primary, secondary, civic education, Latin and AI literacy')
it('shows native grade ranges without synthetic annualities')
it('fails closed instead of silently falling back to the pilot catalog')
it('does not infer canonical Trama edges from equal nucleus text')
it('does not present proposed vertical links as validated relations')
```

Aggiornare i contratti raw-source esistenti soltanto per rimuovere assunzioni ormai superate sul fascicolo dipartimentale; mantenere invariati i requisiti di `ARENA_UX_CONTRACT@1.0.0`.

- [ ] **Step 2: Eseguire il RED mirato**

Run:

```bash
npx vitest run --project unit \
  src/__tests__/canonical-curriculum-reader.test.tsx \
  src/__tests__/curriculum-information-architecture.test.tsx \
  src/__tests__/canonical-curriculum-entry.test.ts \
  src/__tests__/curriculum-explore-trama-v2-contract.test.ts \
  src/__tests__/curriculum-mobile-compact-contract.test.ts
```

Expected: FAIL per il percorso canonico ancora non collegato.

- [ ] **Step 3: Adattare `CurriculumExploreTrama` senza cambiare la gerarchia UX**

Consentire un `catalog` già costruito come fonte primaria; mantenere la costruzione da sezioni solo per compatibilità del percorso precedente. La modalità canonica deve essere identificabile con un attributo macchina e deve mantenere `disciplina/campo → ordine → annualità`.

Per la Trama:

- modalità precedente: può conservare la policy esistente `same-nucleus-exact-only`;
- modalità canonica: nessuna inferenza `same-nucleus`; i link `proposed` non sono presentati come validati e, in questa fase, vengono omessi dalla relazione professionale visibile.

- [ ] **Step 4: Collegare `ProfessionalCurriculumReader` all’artefatto generato**

Importare `canonicalCurriculumV13.generated.json`, validarlo tramite il read model e usare il catalogo risultante come fonte della consultazione principale.

Copia primaria obbligatoria:

```text
Curricolo verticale d’Istituto
Versione di lavoro · 1.3
Validazione professionale aperta
Non vigente
A.S. 2026/2027
```

Non mostrare al primo livello `CAN-CURR-MASTER-00`, revisione o impronte; mantenerli nella tracciabilità/attributi macchina.

Se la validazione fallisce, mostrare `Curricolo d’Istituto non verificabile` e non usare il vecchio catalogo come sostituto.

- [ ] **Step 5: Rendere la proiezione Documento subordinata allo stesso read model**

La modalità `Documento` del percorso canonico deve leggere lo stesso catalogo strutturato e renderlo sequenzialmente; non deve usare il fascicolo dipartimentale come seconda fonte di verità. I documenti dipartimentali esistenti restano raggiungibili solo come provenienza/archivio dal percorso già previsto nel Fascicolo/Archivio precedente.

- [ ] **Step 6: Eseguire il GREEN mirato**

Run dello stesso comando del passo 2.

Expected: PASS.

- [ ] **Step 7: Verificare esplicitamente il contratto UX canonico**

Run: `npx vitest run --project unit src/__tests__/arena-canonical-ux-contract.test.ts`

Expected: PASS senza modifica di `.human/arena-ux.contract.json`.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/features/curriculum/components/ProfessionalCurriculumReader.tsx src/features/curriculum/components/CurriculumExploreTrama.tsx src/__tests__/curriculum-information-architecture.test.tsx src/__tests__/canonical-curriculum-entry.test.ts src/__tests__/curriculum-explore-trama-v2-contract.test.ts src/__tests__/curriculum-mobile-compact-contract.test.ts src/__tests__/canonical-curriculum-reader.test.tsx
git commit -m "feat(arena): read canonical curriculum in professional UI"
```

---

### Task 5: Inserire le prove nei gate e qualificare l’exact head

**Files:**
- Modify: `vitest.fast.config.ts`
- Modify: `.github/workflows/curriculum-alignment.yml`
- No product changes after qualification starts.

**Interfaces:**
- Consumes: tutti i test e il comportamento delle Task 1–4.
- Produces: exact head qualificato della PR #347 con evidenze riproducibili; nessun deploy.

- [ ] **Step 1: Scrivere il RED di aggancio ai gate**

Aggiornare i controlli del piano per richiedere che `vitest.fast.config.ts` includa i nuovi test essenziali e che `Curriculum Alignment` esegua almeno:

```text
curricolo-verticale-artifact-v1.test.ts
canonical-curriculum-read-model.test.ts
canonical-curriculum-reader.test.tsx
curriculum-information-architecture.test.tsx
canonical-curriculum-entry.test.ts
```

Verificare prima della modifica che i nuovi nomi non siano presenti nelle configurazioni.

- [ ] **Step 2: Agganciare i test ai gate**

Aggiungere i test essenziali a `vitest.fast.config.ts` e al comando Vitest di `.github/workflows/curriculum-alignment.yml`, senza rimuovere test esistenti.

- [ ] **Step 3: Eseguire regressione locale completa**

Run, nell’ordine:

```bash
npm run test:fast
npm run test:unit
npx tsc --noEmit
npm run build
npm run build:beta
npm run beta:verify
```

Expected: tutti PASS.

- [ ] **Step 4: Eseguire i contratti curricolari della PR #347**

Run:

```bash
npx vitest run --project unit \
  src/__tests__/curricolo-verticale-master-materialization-v1.test.ts \
  src/__tests__/curricolo-verticale-perimeter-v1.test.ts \
  src/__tests__/curricolo-verticale-release-v1.test.ts \
  src/__tests__/curricolo-verticale-repository-export-v1.test.ts \
  src/__tests__/curricolo-verticale-source-snapshot-v1.test.ts \
  src/__tests__/curricolo-verticale-artifact-v1.test.ts \
  src/__tests__/curricolo-verticale-artifact-generator-v1.test.ts \
  src/__tests__/canonical-curriculum-read-model.test.ts \
  src/__tests__/canonical-curriculum-reader.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5 e congelare l’exact head candidato**

```bash
git add vitest.fast.config.ts .github/workflows/curriculum-alignment.yml
git commit -m "test(arena): gate canonical curriculum UI materialization"
git rev-parse HEAD
```

Da questo momento nessun’altra modifica prima della lettura dei gate; ogni fix crea un nuovo exact head e richiede nuova qualificazione.

- [ ] **Step 6: Verificare i workflow GitHub sul medesimo exact head**

Controllare almeno i workflow effettivamente attivati da questi path:

```text
CurManLight Product CI
Beta Release Contract
Beta E2E Workflow
S3 Critical Journey Browser Evidence
Human Interaction Model
Curriculum Alignment
TRAMA Perceptible Write
```

Un workflow non attivato per path filter va registrato come `N/A`, non come `PASS`.

Expected: tutti i workflow attivati sono PASS sullo stesso SHA.

- [ ] **Step 7: Verificare stato PR e registrare l’evidenza**

PR #347 deve risultare:

```text
open = true
draft = true
merged = false
```

Registrare in PR l’exact head, revisione Drive `27`, conteggio `113/113`, impronte artefatto/sorgente e risultati dei gate. Non cambiare lo stato Draft e non eseguire merge/deploy.
