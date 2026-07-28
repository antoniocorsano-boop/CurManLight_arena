# CML-633F Rendering and Export Policy

## Rendering

### Approach
HTML is a **derived representation** — the authoritative content is `DocumentEntity → DocumentVersion → DocumentContent` structured data.

### Safety
All text content is explicitly escaped:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#39;`

### Forbidden
- `document.write()`
- `dangerouslySetInnerHTML` with unsanitized content
- User HTML interpreted as markup
- `<script>` tags
- Inline event handlers (`onclick`, etc.)
- `javascript:` URLs

### Output
- Semantic HTML5 (headings `<h1>`–`<h6>`, paragraphs `<p>`, lists `<ul>`/`<ol>`, tables `<table>`, blockquotes)
- Testable without DOM

## Export Formats

| Format | Extension | MIME | Implementation |
|--------|-----------|------|----------------|
| HTML | `.html` | `text/html` | From `renderDocument()` |
| JSON | `.json` | `application/json` | Serialized archive |
| PDF (browser) | `.pdf` | `application/pdf` | Browser print |

### NOT supported (without real implementation)
- DOCX — not declared
- ODT — not declared
- ODF — not declared
- Native PDF — not declared

### Consistency Checks
Each format must pass:
```
label → extension → MIME → content
```
Verified by `checkFormatConsistency()` and `validateExportContent()`.

### Filename Policy
- Lowercase, sanitized (only a-z, 0-9, hyphens)
- Max 100 characters
- Version suffix when available: `-v{N}`
- Correct extension per format