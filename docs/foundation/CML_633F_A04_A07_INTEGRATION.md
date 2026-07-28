# CML-633F A04→A07 Integration

## Contract

The integration uses the existing CML-633E `A04ToA07Payload` contract:

```typescript
interface A04ToA07Payload {
  readonly designId: string;
  readonly curriculumRefs: ReadonlyArray<string>;
  readonly sources: ReadonlyArray<string>;
  readonly institutionalContext: Record<string, unknown>;
  readonly teachingStructure: Record<string, unknown>;
  readonly assistedContentOrigin: string;
  readonly versionOrSnapshot: string;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: { readonly sessionTimestamp: string };
}
```

## Execution (`executeA04ToA07DocumentTransfer`)

1. **Validate** — Use `validateA04ToA07` from CML-633E transfer module
2. **Transfer event** — Call `executeA04ToA07` for cross-area event logging
3. **Create canonical document** — `DocumentEntity` with type `teaching-design`, status `draft`
4. **Create initial version** — Version 1 with structural content:
   - Heading with title
   - Paragraph with transfer note
   - `CurriculumReferenceSection` for curriculum refs
   - `SourceReferenceSection` for sources
   - `TeachingDesignSection` for teaching structure snapshot
   - Warning notes (if any)
5. **Capture institutional snapshot** — From payload context
6. **Persist** — Add to `DocumentArchive`

## Preserved Data
- Curriculum references → `originRefs` + `CurriculumReferenceSection`
- Sources → `sourceRefs` + `SourceReferenceSection`
- Evidences and assisted content → `TeachingDesignSection`
- Content origin → `document.metadata.origin`
- Institute, academic year → `InstitutionalSnapshot` in version

## Forbidden
- Auto-approval (document always starts as `draft`)
- Document creation when validation fails
- Phantom data (never invent what wasn't provided)

## Result
```typescript
type A04ToA07DocumentResult =
  | { status: 'completed'; document: DocumentEntity; version: DocumentVersion;
      archive: DocumentArchive; transferId: string; warnings: TransferWarning[] }
  | { status: 'failed'; errors: DocumentError[]; transferId: string };
```