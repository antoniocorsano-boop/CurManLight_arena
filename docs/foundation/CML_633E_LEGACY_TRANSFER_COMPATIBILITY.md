# CML-633E Legacy Transfer Compatibility

> Legacy data compatibility adapters for cross-area transfers.

## Design Principle

Internal adapters return `LegacyAdaptationResult<T>` (discriminated union). The `null` return is only exposed by explicit `tryAdaptLegacy*` compatibility wrappers.

## Discriminated Result

```typescript
type LegacyAdaptationResult<T> =
  | { ok: true; value: T; warnings: TransferWarning[] }
  | { ok: false; error: TransferError; warnings: TransferWarning[] };
```

## Adapter Functions

### adaptLegacyCurriculumNode

Handles old-format curriculum nodes from `curriculumKB`.

- **Input:** `unknown` (old format: `{ id, name, type, ... }`)
- **Output:** `LegacyAdaptationResult<{ entityId, entityType, text?, origin? }>`
- **Behavior:** Preserves text, classifies origin as 'legacy', records missing fields as warnings

### adaptLegacyUdaModel

Handles old-format UDA models.

- **Input:** `unknown` (old format: `{ nodes, sources, ... }`)
- **Output:** `LegacyAdaptationResult<{ nodeRefs, sources, origin }>`
- **Behavior:** Maps old nodes to entity references, preserves sources, classifies origin as 'legacy'

### tryAdaptLegacyCurriculumNode

Compatibility wrapper returning `null` on failure.

### tryAdaptLegacyUdaModel

Compatibility wrapper returning `null` on failure.

### isLegacyFormat

Detects legacy vs canonical format.

## Rules

1. **Preserve text:** Original text content is never modified
2. **Classify origin:** All legacy data is classified as origin 'legacy'
3. **Record missing fields:** Missing optional fields produce warnings
4. **Never invent sources:** Empty sources array, not fabricated references
5. **Never invent metadata:** Only explicitly present metadata is included
6. **Never promote content:** Legacy content stays in legacy status
7. **Discriminated results:** Internal paths always return ok/error union
8. **Null only at boundary:** `try*` wrappers are the only null-returning functions
