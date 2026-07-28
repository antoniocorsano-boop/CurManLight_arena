# CML-633F Legacy Document Migration

## Legacy Sources

Three legacy document sources are supported:

1. **UDA HTML** — Old HTML-based UDA exports
2. **Export events** — Historical `DocumentExportEvent` records
3. **Generic HTML** — Any HTML document

## Import Rules

### Status
Imported as:
- `legacy` — for pure legacy imports
- `draft` — when minimal metadata available

Never imported as:
- `completed`
- `approved`
- `official`
- `adopted`

### Warnings
Missing fields are registered as warnings (never invented):
- `MISSING_TITLE` — title not provided
- `MISSING_DATE` — date not provided
- `MISSING_AUTHOR` — author not provided
- `MISSING_SOURCE` — source not provided

### Author
Never invent an author. If not provided, set `undefined`.

### Original Date
Never invent an original date. Use current timestamp when missing.

### Sources
Never invent sources. Register as warning when missing.

## Legacy HTML Handling
- HTML content is preserved as legacy attachment reference (not converted to canonical sections)
- A heading and note paragraph are created as minimal canonical content
- If the HTML is empty, the import fails with `EMPTY_HTML`

## Verification
- `isLegacyDocumentPromotable()` — checks if legacy can be promoted (only `legacy` and `draft`)
- `hasNoPhantomSource()` — ensures no invented sources
- `hasNoPhantomAuthor()` — ensures no invented authors