# CML CURR-R0 — Source and Domain Reconciliation

> **Status:** CANONICAL RECONCILIATION BASELINE
> **Date:** 2026-08-17
> **Scope:** curriculum knowledge, source authority, domain survival map
> **Runtime changes:** none
> **Data migration:** none

## 1. Purpose

CURR-R0 opens the parallel curriculum-content workstream without creating a second curriculum domain.

The objective is to reconcile the curriculum assets already present in CurManLight, distinguish normative sources from institutional or generated material, and establish the single canonical base on which complete 2012 and 2025 curriculum knowledge will be acquired.

The governing rule is:

> **Structured content is not automatically normative content, and content declaring itself approved is not automatically evidence of institutional approval.**

## 2. Canonical domain survival map

| Area | Existing asset | Classification | Decision |
|---|---|---|---|
| Identity and metadata | CML-633B | canonical | reuse |
| Sources and source versions | `Source`, `SourceVersion` CML-633C | canonical | reuse |
| Curriculum version | canonical curriculum version contracts | canonical | reconcile naming only; do not duplicate |
| Segments | `CurriculumSegment` | canonical | reuse |
| Curriculum elements | `CurriculumNode` | canonical | reuse |
| Relations | `CurriculumLink` plus existing vertical-link contracts | canonical to reconcile | converge on one final relation contract |
| National-framework applicability | existing national-framework resolver | canonical capability | verify and extend only if evidence requires it |
| Institutional revision | CML-633G assets | canonical but incomplete | complete; do not replace |
| Curriculum → planning transfer | existing transfer/planning contracts | canonical | preserve |
| Curriculum graph | CML-637A design/specification assets | derived product projection | use selectively; no second domain |
| `curriculumKB` | legacy archive | legacy/read-only | never promote to normative authority automatically |
| `CURRICOLO_VERTICALE_COMPLETO_MILANI.md` | structured institutional corpus | institutional candidate, unverified | preserve; do not treat internal labels as proof of approval |
| `CURRICOLO_VERTICALE_D_ISTITUTO_COMPLETO_AVIC849003.csv` | structured institutional dataset | institutional candidate/test corpus | reusable after source classification |
| curriculum density/pervasiveness audit | diagnostic report | quality-control material | not curriculum authority |
| task-force/governance documents | process material | governance candidate, unverified | not equivalent to an institutional act without external evidence |

## 3. Existing legacy corpus

The existing CML-633C migration matrix identifies the legacy `curriculumKB` as a read-only authority for legacy compatibility only. It contains 471 adapted active nodes plus 22 proposals, but the active nodes do not carry a resolvable normative source.

Consequently:

- `curriculumKB` remains readable for backward compatibility;
- it must not be enriched as the new normative archive;
- no legacy node becomes `NATIONAL_2012` or `NATIONAL_2025` by inference;
- no proposal becomes active curriculum by import or adaptation;
- deterministic adapters remain adapters, not persistent migration.

## 4. Existing institutional candidate corpus

### 4.1 Structured CSV

`CURRICOLO_VERTICALE_D_ISTITUTO_COMPLETO_AVIC849003.csv` is retained as an institutional-curriculum candidate and test corpus.

It contains structured rows using discipline/order/type/content semantics and includes traguardi, obiettivi and evidenze. The associated repository audit counts 395 structured elements (107 traguardi, 144 obiettivi, 144 evidenze).

The same audit explicitly recognises insufficient curricular granularity and recurring generative/template structures. Therefore the corpus is useful for migration, completeness testing and institutional modelling, but it is not a substitute for the national normative corpus.

### 4.2 Markdown curriculum book

`CURRICOLO_VERTICALE_COMPLETO_MILANI.md` is retained as an institutional candidate corpus.

Internal labels such as `APPROVATO 2025`, `vigente`, `certificato`, or equivalent wording are assertions contained in the document. They are not, by themselves, evidence of a real deliberation, approval act or institutional validity.

### 4.3 Governance/process documents

Repository documents describing task forces, decrees, validation bodies, approval steps or institutional decisions may be useful product/process artefacts. Unless linked to an independently verifiable institutional source, they remain unverified governance material.

## 5. Verified national normative sources

### NATIONAL_2012

- **Act:** Decreto 16 novembre 2012, n. 254
- **Subject:** Regolamento recante indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione
- **Publication:** Gazzetta Ufficiale, Serie Generale n. 30 del 05-02-2013
- **Entry into force:** 20-02-2013
- **Authority:** official national normative source
- **Canonical role:** immutable national source/version for the 2012 framework

### NATIONAL_2025

- **Act:** Decreto 9 dicembre 2025, n. 221
- **Subject:** Regolamento recante indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione
- **Publication:** Gazzetta Ufficiale, Serie Generale n. 21 del 27-01-2026
- **Entry into force:** 11-02-2026
- **Authority:** official national normative source
- **Canonical role:** immutable national source/version for the 2025 framework

The definitive 2025 corpus is the annex to D.M. 221/2025. Preliminary consultation/draft texts must not be used as the authoritative 2025 curriculum corpus when they differ from the adopted regulation.

## 6. Source authority classes

The existing source/provenance domain must represent at least the following semantic distinctions without introducing a parallel curriculum ontology:

1. **national normative — verified**;
2. **institutional — verified**;
3. **institutional — unverified/candidate**;
4. **diagnostic/analytical material**;
5. **experimental/generated/legacy material**.

If the current enums cannot express these distinctions exactly, any extension must be additive, explicit and backward compatible. No source class may be inferred from file naming or self-declared wording alone.

## 7. Non-ambiguity rules

The following rules are frozen for the curriculum-content programme:

1. National curriculum is not institutional curriculum.
2. 2012 and 2025 are distinct national versions sharing one canonical domain.
3. A source record is not a curriculum node.
4. Current institutional curriculum is not a revision proposal.
5. A revision proposal is not a decision.
6. A decision is not automatically a new effective curriculum version.
7. Generated or templated text is not documentary evidence.
8. A document self-declaring approval is not proof of approval.
9. The curriculum graph is a projection of canonical nodes/links, not a second curriculum model.
10. `curriculumKB` remains legacy/read-only until an explicitly governed migration is approved.
11. National normative text is immutable in CML; institutional and teacher artefacts derive from it.
12. Source-native structure must be preserved even when a normalised read model is provided.

## 8. Canonical conceptual hierarchy

```text
National Indicazioni (2012 / 2025)
        ↓ contextualise / implement
Institutional curriculum version
        ↓ operationalise
Disciplinary / vertical institutional curriculum
        ↓ plan
Annual class/discipline planning
        ↓ realise
UDA / activities / assessment
```

National sources are immutable. Institutional versions are adopted/versioned. Teacher planning and UDA remain operational layers.

## 9. Required source registry fields

Every corpus admitted into the curriculum knowledge base must be traceable through, at minimum:

```text
sourceId
title
sourceType
authority
verificationStatus
origin
version/date
normativeFramework
schoolOrderScope
disciplineOrAreaScope
locator
contentStatus
notes/warnings
```

These fields are a reconciliation requirement; they do not authorise replacement of the existing CML-633C contracts if equivalent metadata already exist under canonical names.

## 10. Target curriculum programme after CURR-R0

- **CURR-R1 — 2012 normative completeness:** acquire and validate the complete D.M. 254/2012 curriculum corpus at source-native granularity.
- **CURR-R2 — 2025 normative completeness:** acquire and validate the definitive D.M. 221/2025 annex at source-native granularity.
- **CURR-R3 — semantic correspondence:** build evidence-based 2012 ↔ 2025 mappings without flattening structural differences.
- **CURR-R4 — transition applicability:** resolve school year + school order + class to the applicable normative framework and transitional rules.
- **CURR-R5 — institutional derivation:** model the current/proposed/approved institutional curriculum as derivations from verified national sources.
- **CURR-R6 — revision governance:** complete proposal → review → decision → new version → entry-into-force workflow.
- **CURR-R7 — planning integration:** connect authoritative curriculum elements to annual planning and UDA.
- **CURR-R8 — final curriculum experience:** only after content and governance are sufficiently complete, consolidate the user-facing curriculum UX.

## 11. Gate

CURR-R0 is satisfied when:

- no new competing curriculum domain has been introduced;
- the canonical survivor contracts are identified;
- legacy/institutional/normative sources are explicitly separated;
- D.M. 254/2012 and D.M. 221/2025 are registered as the two national normative baselines;
- unverified institutional material cannot be promoted automatically;
- CURR-R1 can start without runtime changes.

**Verdict:** `CURR_R0_SOURCE_AND_DOMAIN_RECONCILIATION = BASELINED`
