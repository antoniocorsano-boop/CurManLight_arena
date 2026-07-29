# CML-633H — Legacy Design Migration

## UDA Adapter

### enrichUdaWithSelections(uda, selections)
Returns `UdaDesignReadModel` with:
- `udaId`: the original UDA identifier
- `fallbackText`: text extracted from `traguardi` and `obiettivi` arrays
- `curriculumReferences`: array of `EnrichedCurriculumReference` objects

Each `EnrichedCurriculumReference` contains:
- `sourceArea`: `'A02'` or `'A03'`
- `qualification`: one of the five qualifications
- `qualificationLabel`: human-readable Italian label
- `textSnapshot`: the selected text
- `nodeId`, `versionId`: curriculum references from canonical model
- `sourceRefs`, `evidenceRefs`: string representations
- `transferredAt`, `warnings`, `comparisonState`, `isLegacy`

### extractSelectionsFromUda(uda)
Returns empty array. Existing UDAs have no canonical selections. No data invention.

### classifyLegacyUdaContent(hasNode, hasVersion, hasSource, hasEvidence)
Returns `{ qualification: 'legacy-content', warnings: [...] }` with specific warnings for each missing field.

## Principles
- No mutation of source UDA
- No destructive migration
- Legacy UDAs remain readable
- Existing text preserved
- Canonical references available separately
- No double-write
- No invention of nodes, versions, sources, authors, or dates