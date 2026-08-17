# CML CURR-R1 — 2012 Canonical Projection Gap

> **Status:** ANALYSIS COMPLETE — NO RUNTIME CHANGE
> **Scope:** compare the existing CML-633C canonical contracts with the first verified 2012 source lot (general structure, infanzia, Italiano).
> **Principle:** change the canonical domain only where the official source cannot be represented losslessly.

## 1. Result

The existing CML-633C entities remain sufficient at the top level:

- `Source` / `SourceVersion`
- `CurriculumVersion`
- `CurriculumSegment`
- `CurriculumNode`
- `CurriculumLink`

No competing curriculum domain is required.

Two representation gaps and one vocabulary-quality gap must be resolved before canonical 2012 ingestion.

## 2. GAP-1 — Scuola dell'infanzia is flattened into disciplines

Current `DisciplineCode` and `DISCIPLINES` allow, among others:

- `italiano` on `infanzia`;
- `matematica` on `infanzia`;
- `educazione-fisica` on `infanzia`.

The official D.M. 254/2012 source does not organise scuola dell'infanzia as those subject disciplines. It uses five source-native `campi di esperienza`:

1. Il sé e l'altro
2. Il corpo e il movimento
3. Immagini, suoni, colori
4. I discorsi e le parole
5. La conoscenza del mondo

### Risk

If national 2012 data are ingested through the current discipline vocabulary, the application can falsely represent `I discorsi e le parole` as national `Italiano`, or `La conoscenza del mondo` as national `Matematica`/`Scienze`.

That would mix a legitimate later institutional/planning mapping with the normative source itself.

### Minimal requirement

The canonical segment must be able to identify a source-native curricular area independently of a subject discipline.

Do **not** create five fake disciplines merely to fit the current `disciplineCode` field.

Preferred minimal direction:

- keep `disciplineCode` for actual disciplinary segments;
- introduce a small source-native segment classification / area identity usable for fields of experience and other non-disciplinary source sections;
- preserve compatibility for existing legacy adapters until explicit migration.

Exact TypeScript shape remains a separate implementation decision after compatibility inspection.

## 3. GAP-2 — National checkpoint semantics are currently free text

`CurriculumNode` currently exposes optional:

- `grade?: string`
- `period?: string`

This can technically hold the 2012 checkpoints but does not constrain or distinguish source-native meanings such as:

- end of scuola dell'infanzia;
- end of class 3 primary;
- end of class 5 primary;
- end of class 3 lower-secondary.

### Risk

Free text can create variants (`classe 3`, `terza primaria`, `P3`, etc.) and make completeness validation unreliable.

### Minimal requirement

Introduce one canonical checkpoint vocabulary/value object for normative source nodes, without manufacturing annual checkpoints absent from the source.

It may coexist with legacy `grade` / `period` during migration rather than replacing them abruptly.

## 4. GAP-3 — Existing nuclei are legacy approximations, not normative vocabulary

`NUCLEI_FONDANTI` is explicitly described as nuclei known from `curriculumKB`.

For Italiano it currently includes labels such as:

- `Acquisizione e Lessico`
- `Riflessione sulla lingua`
- secondary labels `Comunicazione`, `Letteratura`, `Grammatica e Analisi`.

The official 2012 objective headings verified for Italiano use source-native nuclei including:

- `Ascolto e parlato`
- `Lettura`
- `Scrittura`
- `Acquisizione ed espansione del lessico ricettivo e produttivo`
- `Elementi di grammatica esplicita e riflessione sugli usi della lingua`

### Risk

Using the legacy nuclei as normative identifiers would silently paraphrase and sometimes restructure the official source.

### Minimal requirement

Do not overwrite the legacy nucleus registry in place.

Normative source ingestion needs exact source-native nucleus identities linked to source/version. Legacy nuclei remain compatibility vocabulary until migrated.

## 5. What does NOT require a new domain

The existing node model already supports the principal atomic normative roles needed for the first lot:

- `traguardo`
- `obiettivo`
- provenance `normative`
- `sourceRefs`
- grade/period compatibility fields
- cross-curricular flag

Narrative source sections should not automatically be forced into `CurriculumNode` if they are better represented as source/segment description or dedicated source-section metadata. The normalization design must prefer the smallest faithful representation.

## 6. Minimal target before ingestion

The 2012 ingestion boundary needs only three precise additions/reconciliations:

```text
A. source-native segment/area identity
B. normalized normative checkpoint
C. source-native nucleus identity
```

Everything else should reuse CML-633C.

## 7. Compatibility rule

No existing runtime consumer may be forced to migrate merely to ingest the national source.

Required sequence:

1. define additive canonical fields/types;
2. keep legacy adapters readable;
3. ingest a small verified Italiano + infanzia fixture;
4. validate lossless round-trip/provenance;
5. only then consider migration of existing consumers.

## 8. Gate

```text
CURR_R1_EXISTING_DOMAIN_REUSE = PASS
NEW_CURRICULUM_DOMAIN = REJECTED
GAP_SOURCE_NATIVE_AREA = CONFIRMED
GAP_NORMATIVE_CHECKPOINT = CONFIRMED
GAP_SOURCE_NATIVE_NUCLEUS = CONFIRMED
RUNTIME_CHANGE = NONE
NEXT = ADDITIVE_DOMAIN_DECISION + FOCUSED TESTS
```
