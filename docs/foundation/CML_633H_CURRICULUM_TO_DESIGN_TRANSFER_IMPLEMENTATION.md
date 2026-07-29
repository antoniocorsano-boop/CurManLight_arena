# CML-633H — Curriculum-to-Design Transfer: Implementation

> **Branch:** `feat/cml-633h-curriculum-to-design-transfer` (from `f93da3d`)
> **Baseline:** `f93da3d` (CML-633G COMPLETE)
> **Commits:** `9aa6099`, `4660123`, `4068fea`, `5d6276d`, `bd5986e`

## Architecture

11 files in `src/domain/design/`:

| File | Purpose |
|------|---------|
| `types.ts` | DesignCurriculumSelection, DesignArchive, qualifications, discriminated results |
| `vocabularies.ts` | DESIGN_ARCHIVE_SCHEMA_VERSION = 1 |
| `constructors.ts` | createEmptyDesignArchive, createDesignCurriculumSelection, cloneDesignArchive |
| `validators.ts` | Structural, archive integrity, internal reference validation |
| `archive.ts` | Repository: add, get, list, replaceSnapshot, remove, findBySource, compareWithSource |
| `transferA02.ts` | executeA02ToA04Transfer: snapshot, structural footprint, current-curriculum |
| `transferA03.ts` | executeA03ToA04Transfer: CML-633G matrix |
| `conflicts.ts` | detectConflicts, addSelectionWithConflictResolution, markSourceStatusChanged |
| `udaAdapter.ts` | enrichUdaWithSelections, classifyLegacyUdaContent |
| `traceabilityA07.ts` | createDocumentSectionsFromDesignSelections, enrichDocumentContentWithSelections |
| `index.ts` | Barrel export |

## Store Integration

`designArchive: DesignArchive` in Zustand `useCurriculumStore` with `replaceDesignArchive` action and validated rehydration. No new Dexie tables.

## Qualifications

`current-curriculum`, `proposed-content`, `planned-institute-content`, `legacy-content`, `experimental-content`

## A02→A04 Transfer

Creates immutable snapshots from curriculum consultation. Validates payload, computes structural footprint, qualifies as `current-curriculum`.

## A03→A04 Transfer Matrix

| Status | Result |
|--------|--------|
| draft, ready-for-review, changes-requested, withdrawn, archived | Not transferable |
| submitted, under-review, accepted-for-decision | `proposed-content` |
| recorded-local approve | `planned-institute-content` |
| record-only | `proposed-content` |
| legacy | `legacy-content` with warnings |

## A04 Surface

`DesignSelezioniPanel.tsx` — shows selections with qualification, source state, warnings, sources.

## Constraints

No new dependencies, no Dexie changes, no curriculum modification, no official/adopted claims, no double-write.