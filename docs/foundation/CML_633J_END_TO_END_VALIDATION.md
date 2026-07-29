# CML-633J — End-to-End Validation

## Validation Scenarios

### Scenario A: No institute → consultation → personal design → neutral document

**Preconditions**: No institution configured in institutionalArchive.

**Steps**:
1. Open application — landing at context/configurazione step
2. Navigate to curriculum consultation — no curricolo loaded yet
3. Create personal design (no institute identity) — progettazione personale
4. Generate document — output is neutral, no institution header, no official claims

**Expected results**:
- Document contains no institute name, code, or identity
- Document disclaims: "Non costituisce adozione ufficiale"
- Export produces real HTML file
- No errors in console

**Viewport**: Desktop 1440×1000, Mobile 390×844

---

### Scenario B: Institute configured → curriculum → design → local document

**Preconditions**: Institution configured with valid archive (integrity check passes).

**Steps**:
1. Open application — context step shows institution configured
2. Navigate to curriculum consultation — curricolo loaded from canonical curriculum source
3. Create design referencing curriculum selections — progettazione con riferimenti curricolari
4. Generate document — output includes local institution header, neutral disclaimer

**Expected results**:
- Document includes local institution header only if schoolYear is configured
- Document disclaims: "Non costituisce adozione ufficiale"
- Export produces real HTML file
- No errors in console
- No approval claims

**Viewport**: Desktop 1440×1000, Mobile 390×844

---

### Scenario C: Proposal in review → proposed content → design → qualified document

**Preconditions**: Proposal in `provisional-proposal` state, content tagged as proposed.

**Steps**:
1. Open application — context step shows provisional proposal
2. Navigate to design creation using proposed content
3. Generate document — output is qualified as proposed content
4. Export document

**Expected results**:
- Document includes "Proposta ancora in revisione" warning
- Document header shows "Contenuto proposto"
- Export produces real HTML file with qualification preserved
- No approval claims

**Viewport**: Desktop 1440×1000, Mobile 390×844

---

### Scenario D: Recorded-local decision → planned content → non-official document

**Preconditions**: Decision stored as `recorded-local` (not official adoption). Content tagged as `planned-institute-content`.

**Steps**:
1. Open application — context step shows local decision only
2. Navigate to design creation using planned content
3. Generate document — output is non-official
4. Export document

**Expected results**:
- Document disclaims: "Non costituisce adozione ufficiale"
- No words "approvato", "adottato", "curricolo ufficiale", "decisione ufficiale", "contenuto ufficiale" appear as positive claims
- Disclaimer "Non costituisce adozione ufficiale" is present (allowed)
- Export produces real HTML file

**Viewport**: Desktop 1440×1000, Mobile 390×844

---

### Scenario E: UDA legacy → reading → adaptation → document with warning

**Preconditions**: UDA (Unità Didattica Autonoma) legacy content present in curriculumKB (legacy-content qualification).

**Steps**:
1. Open application — curriculum consultation shows legacy UDA entries
2. System issues warning: "Contenuto legacy utilizzato"
3. Create design using legacy UDA content
4. Generate document — output includes legacy warning
5. Export document

**Expected results**:
- Document includes "legacy warning" in Avvisi section
- Content is preserved as-is from legacy source
- Export produces real HTML file
- No approval claims made on legacy content

**Viewport**: Desktop 1440×1000, Mobile 390×844

---

## Browser Validation Checklist

| Check | Desktop 1440×1000 | Mobile 390×844 |
|-------|-------------------|-----------------|
| Navigation works | ✓ | ✓ |
| Focus visible | ✓ | ✓ |
| No overflow | ✓ | ✓ |
| Readable text | ✓ | ✓ |
| Refresh (F5) preserves state | ✓ | ✓ |
| Resume (return to app) works | ✓ | ✓ |
| Export (HTML + JSON) works | ✓ | ✓ |
| No console errors | ✓ | ✓ |

## Export Format Verification

| Format | Real? | Purpose |
|--------|-------|---------|
| HTML (.html) | Yes | Document rendering in browser |
| JSON (.json) | Yes | Machine-readable structured data |
| Print (browser print) | Yes | Print directly via browser print dialog |
| DOCX (.docx) | No (not generated) | Not produced by CML-633 system |
| ODT (.odt) | No (not generated) | Not produced by CML-633 system |
| PDF | No (not generated) | Not produced by CML-633 system |