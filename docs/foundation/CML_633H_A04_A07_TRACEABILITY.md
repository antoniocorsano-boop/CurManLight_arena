# CML-633H — A04→A07 Traceability

## Functions

### createDocumentSectionsFromDesignSelections(selections)
Converts `DesignCurriculumSelection[]` to `DocumentSection[]`. Generates structured sections:
- Heading: "Selezioni curricolari"
- Disclaimer: "Registro locale… Non costituisce adozione ufficiale."
- Per selection: qualification heading, quoted text, metadata list, sources, evidences, warnings

### enrichDocumentContentWithSelections(content, selections)
Appends design selection sections to an existing `DocumentContent`.

## Data Preserved in A07

| Data | Section |
|------|---------|
| Qualification label | Heading level 2 |
| Source area (A02/A03) | Heading |
| Selected text snapshot | Quote paragraph |
| Curriculum node | Metadata list |
| Source version | Metadata list |
| Transfer timestamp | Metadata list |
| Source comparison state | Metadata list |
| Source references | "Fonti" section |
| Evidence references | "Evidenze" section |
| Warnings | "Avvisi" section |

## Document Formulas

Qualification labels in A07:
- `current-curriculum` → "Dal curricolo vigente"
- `proposed-content` → "Da proposta in revisione"
- `planned-institute-content` → "Da decisione locale pianificata"
- `legacy-content` → "Contenuto legacy"
- `experimental-content` → "Contenuto sperimentale"

## What is NOT Declared
- "Curricolo approvato"
- "Contenuto ufficiale"
- "Decisione certificata"
- "Contenuto adottato"
- "Verbalizzazione ufficiale"

## Preview/Export Consistency
The same `DocumentVersion` feeds both preview and export. Qualification, snapshot, sources, evidence, warnings must be present in both.