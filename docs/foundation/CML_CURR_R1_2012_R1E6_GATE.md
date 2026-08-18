# CML CURR-R1 — R1E-6 Global Completeness Gate

> **Status:** PASS
> **Date:** 2026-08-18
> **Normative baseline:** D.M. 16 novembre 2012, n. 254 — Gazzetta Ufficiale, Serie Generale n. 30 del 05-02-2013
> **Fixture baseline:** `cb1e7e3` through `08ab296`
> **Evidence:** automated curriculum-domain tests, fast test suite, TypeScript typecheck, production build

## 1. Structural coverage

| Dimension | Result |
|---|---|
| 5 infanzia experience fields | PASS |
| All primo ciclo disciplines present | PASS |
| `general-section` / `transversal-area` sections present | PASS |
| No invented disciplines | PASS |

## 2. Textual coverage

| Dimension | Result |
|---|---|
| All required traguardi acquired | PASS |
| All required obiettivi acquired | PASS |
| No paraphrase/synthesis in place of canonical text | PASS |
| No narrative content artificially converted into nodes | PASS |

Key rule enforced: `NODES_2012_INFANZIA` now generates nodes only for `experience-field` segments; general-section narrative segments do not produce synthetic `traguardo`/`obiettivo` nodes.

## 3. Semantic coverage

| Dimension | Result |
|---|---|
| Controlled normative checkpoints only | PASS |
| Source-native nuclei / `sourceArea` preserved | PASS |
| Infanzia experience fields kept distinct from disciplines | PASS |
| `Cittadinanza e Costituzione` not mapped to `educazioneCivica` | PASS |
| IRC excluded as separate source | PASS |

## 4. Provenance coverage

| Dimension | Result |
|---|---|
| `metadata.origin = normative-source` on all segments | PASS |
| `dataOrigin = normative-source` on all segments | PASS |
| `sourceRefs` valid towards `SOURCE_2012` | PASS |
| `provenance != legacy` on all nodes | PASS |
| Referential integrity complete | PASS |

## 5. Architecture regression

| Check | Result |
|---|---|
| R1A fixture validators | PASS |
| R1B national curriculum read model | PASS |
| R1C national curriculum consultation boundary | PASS |
| R1D national curriculum consultation UI | PASS |
| `test:fast` | 273/273 PASS |
| `tsc --noEmit` | PASS |
| `npm run build` | PASS |

## 6. Verdict

```text
CURR_R1_2012_NORMATIVE_COMPLETENESS = VERIFIED
CURR_R1_2012_CANONICAL_INGESTION = VERIFIED
R1E-6_GLOBAL_COMPLETENESS_GATE = PASS
```

All four completeness dimensions — structural, textual, semantic, and provenance — are green simultaneously. No further content acquisition is required for the D.M. 254/2012 national source lot represented in `fixture2012.ts`.
