# CML-633F Document Domain Schema

## Canonical Types

### DocumentArchive (v1)
```
schemaVersion: 1
updatedAt: string (ISO 8601)
documents: DocumentEntity[]
versions: DocumentVersion[]
```

### DocumentEntity
```
id: EntityId (branded string)
metadata: EntityMetadata (from identity domain)
documentType: DocumentType (closed union)
title: string
status: DocumentStatus
currentVersionRef: EntityId (points to DocumentVersion)
instituteRef?: EntityReference
academicYearRef?: EntityReference
author?: ActorReference
sourceRefs: EntityReference[]
originRefs: EntityReference[]
tags?: string[]
```

### DocumentVersion
```
id: EntityId
documentRef: EntityId (parent document)
versionNumber: number (starts at 1)
content: DocumentContent
createdAt: string (ISO 8601)
author?: ActorReference
reason?: string
sourceRefs: EntityReference[]
institutionalSnapshot: InstitutionalSnapshot
previousVersionRef?: EntityId
frozen: true (always true after creation)
metadata: EntityMetadata
```

### DocumentContent
```
sections: DocumentSection[]
```

### DocumentSection (discriminated union)
- `heading` — `{ type, level: 1-6, text }`
- `paragraph` — `{ type, text, format?: normal|bold|italic|quote }`
- `list` — `{ type, items: string[], ordered: boolean }`
- `table` — `{ type, headers: string[], rows: string[][] }`
- `curriculum-reference` — `{ type, refs: EntityReference[], description? }`
- `source-reference` — `{ type, refs: EntityReference[], description? }`
- `teaching-design` — `{ type, snapshot: Record<string, unknown>, description? }`
- `metadata` — `{ type, data: Record<string, string> }`

## Reused Contracts (from CML-633B/E)
- `EntityId`, `EntityMetadata`, `EntityReference`, `ContentOrigin`, `ActorReference` from identity domain
- `InstituteReference`, `AcademicYearReference` from institution domain
- `A04ToA07Payload`, `validateA04ToA07` from transfer domain

## Persistence
- Option A: aggregated in Zustand state record `documentArchive: DocumentArchive`
- Same IndexedDB persistence as existing state
- Schema version `DOCUMENT_ARCHIVE_SCHEMA_VERSION = 1`
- Logically separate from institutional archive