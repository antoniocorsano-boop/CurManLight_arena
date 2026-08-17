# CML CURR-R1 — 2012 Normative Completeness Contract

> **Status:** OPEN / ACQUISITION AUTHORISED
> **Date:** 2026-08-17
> **Normative baseline:** D.M. 16 novembre 2012, n. 254 — Gazzetta Ufficiale, Serie Generale n. 30 del 05-02-2013
> **Runtime changes:** none
> **Authority:** official national source only

## 1. Objective

Acquire the complete 2012 national curriculum corpus for scuola dell'infanzia and primo ciclo directly from the official D.M. 254/2012 annex, preserving the source-native hierarchy and provenance.

CURR-R1 is a content/completeness programme, not a redesign of the curriculum domain.

## 2. Official source-native macrostructure

The annex is structured as follows:

1. **Cultura scuola persona**
   - La scuola nel nuovo scenario
   - Centralità della persona
   - Per una nuova cittadinanza
   - Per un nuovo umanesimo
2. **Finalità generali**
   - Scuola, Costituzione, Europa
   - Profilo dello studente
3. **L'organizzazione del curricolo**
   - Dalle Indicazioni al curricolo
   - Aree disciplinari e discipline
   - Continuità ed unitarietà del curricolo
   - Traguardi per lo sviluppo delle competenze
   - Obiettivi di apprendimento
   - Valutazione
   - Certificazione delle competenze
   - Una scuola di tutti e di ciascuno
   - Comunità educativa, comunità professionale, cittadinanza
4. **La scuola dell'infanzia**
   - I bambini, le famiglie, i docenti, l'ambiente di apprendimento
   - I campi di esperienza
   - Il sé e l'altro
   - Il corpo e il movimento
   - Immagini, suoni, colori
   - I discorsi e le parole
   - La conoscenza del mondo
   - Dalla scuola dell'infanzia alla scuola primaria
5. **La scuola del primo ciclo**
   - Il senso dell'esperienza educativa
   - L'alfabetizzazione culturale di base
   - Cittadinanza e Costituzione
   - L'ambiente di apprendimento
   - Italiano
   - Lingua inglese e seconda lingua comunitaria
   - Storia
   - Geografia
   - Matematica
   - Scienze
   - Musica
   - Arte e immagine
   - Educazione fisica
   - Tecnologia

This hierarchy is normative source structure and must not be flattened into a discipline-only list.

## 3. Native curricular element types

The 2012 source distinguishes at least:

- general framing / rationale text;
- student profile;
- field-of-experience narrative;
- discipline narrative / epistemic and methodological framing;
- **traguardi per lo sviluppo delle competenze**;
- **obiettivi di apprendimento**;
- **nuclei tematici** organising objectives;
- temporal applicability / milestone;
- transversal citizenship and curriculum-organisation provisions.

The normalised CML read model may project these elements, but acquisition must preserve their native role and parent section.

## 4. Temporal structure to preserve

The annex defines traguardi at the end of:

- scuola dell'infanzia;
- scuola primaria;
- scuola secondaria di primo grado.

Learning objectives are defined for long periods. For primary school, the official source explicitly provides an additional end-of-class-3 milestone for:

- Italiano;
- Lingua inglese;
- Seconda lingua comunitaria where applicable in the source structure;
- Storia;
- Geografia;
- Matematica;
- Scienze.

The end-of-class-5 primary milestone and end-of-class-3 lower-secondary milestone must be preserved where present in the source.

CML must not manufacture annual class-by-class national objectives when the national source does not provide them.

## 5. Religion and citizenship boundary

### Religione cattolica

D.M. 254/2012 explicitly states that Catholic Religion competency targets and learning objectives are defined separately by agreement with ecclesiastical authority, referring to D.P.R. 11 febbraio 2010.

Therefore:

- IRC must not be represented as missing data from the D.M. 254/2012 annex;
- any complete first-cycle curriculum knowledge base may include IRC only through its own verified normative source;
- IRC nodes must not be attributed falsely to D.M. 254/2012.

### Cittadinanza e Costituzione

In the 2012 annex, `Cittadinanza e Costituzione` is a transversal part of the first-cycle framing, not a discipline section parallel to Italiano, Matematica, Tecnologia, etc.

Therefore an existing legacy `educazioneCivica` discipline cannot be back-attributed wholesale to the 2012 annex. Later civic-education legislation must remain source-distinct.

## 6. Acquisition unit

Every extracted normative unit must retain sufficient provenance to reconstruct where it came from. Minimum logical record:

```text
sourceId = national-2012|dm-254-2012
sourceVersion
sectionPath
schoolOrder
fieldOrDiscipline
nativeElementType
nativeHeading
milestone / temporalScope
nucleus (when explicit)
text
sourceLocator
sequence
notes
```

This is a content-ingestion contract, not authorisation to replace existing canonical entity names. Equivalent CML-633C fields must be reused.

## 7. Discipline / field completeness matrix

### Scuola dell'infanzia

| Area | Required status |
|---|---|
| General childhood-school framing | required |
| Il sé e l'altro | full |
| Il corpo e il movimento | full |
| Immagini, suoni, colori | full |
| I discorsi e le parole | full |
| La conoscenza del mondo | full |
| Transition to primary | required |

### Scuola primaria + secondaria di primo grado

| Discipline/area | Primary | Lower secondary | Required source-native components |
|---|---|---|---|
| Italiano | full | full | narrative, traguardi, objectives, nuclei, milestones |
| Lingua inglese | full | full | narrative, CEFR-linked targets where source states them, objectives, nuclei, milestones |
| Seconda lingua comunitaria | source-native applicability | full | preserve separate source structure and milestones |
| Storia | full | full | narrative, temporal knowledge distribution, traguardi, objectives, nuclei |
| Geografia | full | full | narrative, traguardi, objectives, nuclei |
| Matematica | full | full | narrative, traguardi, objectives, nuclei |
| Scienze | full | full | narrative, traguardi, objectives, nuclei |
| Musica | full | full | narrative, traguardi, objectives |
| Arte e immagine | full | full | narrative, traguardi, objectives, nuclei where explicit |
| Educazione fisica | full | full | narrative, traguardi, objectives, nuclei where explicit |
| Tecnologia | full | full | narrative, traguardi, objectives, nuclei where explicit |
| Cittadinanza e Costituzione | transversal | transversal | preserve as transversal framework, not invented discipline nodes |
| Religione cattolica | separate source | separate source | not attributed to D.M. 254/2012 annex |

## 8. Completeness rules

CURR-R1 cannot be marked complete by node count alone.

For every source section, completeness requires:

1. all official headings represented;
2. all normative narrative sections preserved or intentionally classified as source context;
3. all traguardi captured without synthetic rewriting;
4. all learning objectives captured without synthetic rewriting;
5. all explicit nuclei retained;
6. all official temporal milestones retained;
7. source order recoverable;
8. provenance resolvable to the official source;
9. no generated completion of missing text;
10. no institutional enrichment mixed into the national layer.

## 9. Validation strategy

Validation must operate on both structure and content:

- **section coverage:** every source heading accounted for;
- **discipline coverage:** every discipline/field in the annex accounted for;
- **milestone coverage:** primary end-3/end-5 and lower-secondary end-3 only where source defines them;
- **element coverage:** traguardi/objectives/nuclei count and sequence reconciled against source;
- **provenance coverage:** 100% of normative nodes resolve to `national-2012|dm-254-2012` plus a source locator;
- **contamination check:** zero institutional/generated nodes inside the national 2012 source version;
- **legacy check:** zero automatic promotion from `curriculumKB`.

## 10. Relation to institutional curriculum

The national 2012 corpus is immutable reference knowledge.

Institutional curriculum elements may later link to it using explicit derivation/contextualisation relations. They must not overwrite or edit the national node.

Target direction:

```text
NATIONAL_2012 node
   ↓ contextualised_by / implemented_by
INSTITUTION curriculum node
   ↓ operationalised_by
ANNUAL planning objective
   ↓ realised_by
UDA / activity
```

## 11. Immediate execution sequence

1. Acquire the annex macrostructure and all general sections.
2. Acquire all five scuola dell'infanzia fields of experience.
3. Acquire primary/lower-secondary discipline sections in official order.
4. Reconcile traguardi, nuclei and objective milestones per discipline.
5. Produce a machine-checkable completeness manifest.
6. Only after complete coverage, authorise persistent normative dataset generation.

## 12. Gate

CURR-R1 is complete only when the entire official D.M. 254/2012 annex has a lossless, source-traceable representation suitable for canonical import, with all exclusions and separately governed sources explicitly recorded.

Current verdict:

`CURR_R1_2012_NORMATIVE_COMPLETENESS = OPEN`
