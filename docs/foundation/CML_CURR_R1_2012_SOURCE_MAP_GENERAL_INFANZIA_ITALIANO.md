# CML CURR-R1 — 2012 Official Source Map: General + Infanzia + Italiano

> **Purpose:** establish stable provenance anchors for the first 2012 acquisition lot before any canonical data ingestion.
> **Normative source:** D.M. 16 novembre 2012, n. 254, Allegato — Indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione.
> **Official publication:** Gazzetta Ufficiale, Serie Generale n. 30 del 5 febbraio 2013.
> **Source ID:** `national-2012|dm-254-2012`
> **Status:** SOURCE MAP VERIFIED

## 1. Official source locators

The Gazzetta Ufficiale HTML annex is split into two official parts. CURR-R1 must retain the source part plus structural heading as provenance; line numbers are audit aids, not durable identifiers by themselves.

- Annex part 1: official Gazzetta HTML, `progressivo=1`.
- Annex part 2: official Gazzetta HTML, `progressivo=2`.

Durable identity remains the decree + annex + semantic section path.

## 2. Macrostructure verified from the official index

The source index contains, in order:

1. `CULTURA SCUOLA PERSONA`
   - La scuola nel nuovo scenario
   - Centralità della persona
   - Per una nuova cittadinanza
   - Per un nuovo umanesimo
2. `FINALITÀ GENERALI`
   - Scuola, Costituzione, Europa
   - Profilo dello studente
3. `L'ORGANIZZAZIONE DEL CURRICOLO`
   - Dalle Indicazioni al curricolo
   - Aree disciplinari e discipline
   - Continuità ed unitarietà del curricolo
   - Traguardi per lo sviluppo delle competenze
   - Obiettivi di apprendimento
   - Valutazione
   - Certificazione delle competenze
   - Una scuola di tutti e di ciascuno
   - Comunità educativa, comunità professionale, cittadinanza
4. `LA SCUOLA DELL'INFANZIA`
5. `LA SCUOLA DEL PRIMO CICLO`

## 3. Source-native curricular rules already verified

The official framing states that:

- competence targets are fixed at the end of scuola dell'infanzia, scuola primaria, and scuola secondaria di primo grado;
- learning objectives identify indispensable knowledge/skills and are organised in thematic nuclei;
- objectives are defined over long teaching periods;
- for Italiano, English, second community language, History, Geography, Mathematics, and Science, additional primary objectives are also specified at the end of class 3.

### Consequence for CML

CML must preserve these checkpoints. Annual class-by-class national objectives are not to be generated and then represented as if they were official 2012 source content.

## 4. Scuola dell'infanzia — verified source hierarchy

The official source has five **campi di esperienza**, not subject disciplines:

1. `Il sé e l'altro`
2. `Il corpo e il movimento`
3. `Immagini, suoni, colori`
4. `I discorsi e le parole`
5. `La conoscenza del mondo`

Each field contains narrative framing followed by `Traguardi per lo sviluppo della competenza` at the end of the scuola dell'infanzia.

`La conoscenza del mondo` also contains explicit internal narrative articulations such as `Oggetti, fenomeni, viventi` and `Numero e spazio`; these headings must be preserved as source-native structure and must not automatically be promoted to disciplines.

The section `Dalla scuola dell'infanzia alla scuola primaria` describes expected basic competences at the transition. It is a transition/profile section, not a sixth field of experience.

### Canonical projection rule

- field of experience → segment/area preserving its source-native identity;
- end-of-infanzia target → curriculum node attached to that field;
- internal headings → nucleus/section metadata only when explicitly present in the source;
- no forced mapping of fields to modern school subjects in the national layer.

Any school-level mapping such as `I discorsi e le parole → Italiano` belongs to an institutional or planning layer.

## 5. Italiano — verified source hierarchy

Official section path:

`LA SCUOLA DEL PRIMO CICLO / ITALIANO`

The section contains:

1. discipline narrative and pedagogical/epistemic framing;
2. `Traguardi per lo sviluppo delle competenze al termine della scuola primaria`;
3. `Obiettivi di apprendimento al termine della classe terza della scuola primaria`;
4. `Obiettivi di apprendimento al termine della classe quinta della scuola primaria`;
5. `Traguardi per lo sviluppo delle competenze al termine della scuola secondaria di primo grado`;
6. `Obiettivi di apprendimento al termine della classe terza della scuola secondaria di primo grado`.

Verified objective nuclei include:

- `Ascolto e parlato`
- `Lettura`
- `Scrittura`
- `Acquisizione ed espansione del lessico ricettivo e produttivo`
- `Elementi di grammatica esplicita e riflessione sugli usi della lingua`

These nuclei recur across checkpoints but CML must not assume that every discipline uses the same nuclei or the same checkpoint layout.

## 6. Provenance identity for normalized records

Every normalized national 2012 record produced from this lot must be reconstructable through at least:

```text
sourceId = national-2012|dm-254-2012
sourceVersion = official annex published with GU n.30 05-02-2013
sectionPath = semantic hierarchy from the official annex
schoolOrder = source-native order
subjectOrField = source-native discipline/field identity
checkpoint = source-native temporal checkpoint when present
nodeKind = source-native role (e.g. traguardo / obiettivo)
```

A locator may additionally retain:

```text
officialPart = allegato-1 | allegato-2
officialHeading = exact structural heading
```

Line positions are useful for audit but are not the canonical identity because HTML rendering may change.

## 7. Separation rules

The following transformations are forbidden during national-source ingestion:

- turning a field of experience into a primary/secondary discipline;
- turning a narrative statement into an objective without explicit source evidence;
- splitting one official objective into multiple canonical objectives without retaining derivation semantics;
- merging multiple official objectives into one source node;
- inserting institutional examples, assessment evidence, UDA, or annual planning into the national source layer;
- labeling paraphrases as official normative wording.

## 8. Gate result

```text
CURR_R1_LOT_A_SOURCE_MAP = PASS
GENERAL_STRUCTURE = VERIFIED
INFANZIA_SOURCE_HIERARCHY = VERIFIED
ITALIANO_SOURCE_HIERARCHY = VERIFIED
CANONICAL_DATA_INGESTION = NOT_YET_AUTHORIZED_BY_THIS_DOCUMENT
RUNTIME_CHANGE = NONE
```

Next operation: inspect the existing canonical TypeScript contracts and define the smallest lossless projection needed to ingest this source lot without adding a competing curriculum model.
