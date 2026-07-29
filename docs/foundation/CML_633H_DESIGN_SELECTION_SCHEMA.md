# CML-633H — Design Curriculum Selection Schema

## DesignCurriculumSelection

| Field | Type | Required |
|-------|------|----------|
| `id` | `EntityId` | ✅ |
| `metadata` | `EntityMetadata` | ✅ |
| `designRef` | `EntityReference` | ✅ |
| `sourceArea` | `'A02' \| 'A03'` | ✅ |
| `sourceEntityRef` | `EntityReference` | ✅ |
| `sourceVersionRef` | `EntityReference` | No |
| `curriculumNodeRef` | `EntityReference` | No |
| `curriculumVersionRef` | `EntityReference` | No |
| `currentTextSnapshot` | `string` | ✅ |
| `selectedTextSnapshot` | `string` | ✅ |
| `qualification` | `DesignQualification` | ✅ |
| `sourceRefs` | `EntityReference[]` | ✅ |
| `evidenceRefs` | `EntityReference[]` | ✅ |
| `transferredAt` | `string` (ISO 8601) | ✅ |
| `transferredBy` | `ActorReference` | No |
| `transferContractVersion` | `string` | ✅ |
| `structuralFootprint` | `string` | ✅ |
| `comparisonState` | `SourceComparisonState` | No |
| `warnings` | `DesignTransferWarning[]` | ✅ |

## Qualifications

- `current-curriculum`: from A02 consultation. Refers to a curriculum version node. NOT "approved."
- `proposed-content`: from A03 revision. Proposal still in review. Must remain visible as proposed.
- `planned-institute-content`: linked to a `recorded-local` decision. Planned locally, not officially adopted.
- `legacy-content`: pre-canonical data with incomplete fields. Carries warnings.
- `experimental-content`: explicitly marked experimental. Requires confirmation before transfer.

## DesignArchive

```typescript
interface DesignArchive {
  schemaVersion: number;  // = 1
  updatedAt: string;
  selections: DesignCurriculumSelection[];
}
```

## Source Comparison States

`source-current` — snapshot matches current source  
`source-updated` — source has been modified after snapshot  
`source-unavailable` — source no longer resolvable  
`source-legacy` — qualification is legacy-content