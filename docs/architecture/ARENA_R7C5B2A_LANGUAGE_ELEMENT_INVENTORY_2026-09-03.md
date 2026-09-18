# ARENA R7C5B2A - Final publication language element inventory

## Scope

R7C5B2A extends the fail-closed R7C5B1 inventory contract to the four language sections of the final MIM publication printed in March 2026:

- Italiano, pp. 68-79;
- Latino per l'educazione linguistica (LEL), pp. 80-82;
- Lingua inglese, pp. 83-90;
- Seconda lingua comunitaria, pp. 91-95.

This tranche counts structural curriculum elements only. It does not import source text, verify source wording element-by-element, map institute content to national elements, or promote any institute content to national authority.

## Counting rule

The inventory follows the source-native structure instead of forcing all disciplines into one normalized template:

- each typographic bullet under `Competenze attese` is one structural element;
- each typographic bullet under `Obiettivi specifici di apprendimento` is one structural element;
- bulletized knowledge items are counted individually;
- narrative knowledge is counted by semantically distinct titled block when no bullet list exists;
- rationale and explanatory narrative (`Perché si studia...`) are not counted as curriculum elements in the disciplinary inventory.

## Verified counts

### Italiano - 36

- primaria competenze attese: 5;
- primaria obiettivi classe terza: 9;
- primaria obiettivi classe quinta: 6;
- primaria conoscenze: 2 titled blocks (`Lingua`, `Letteratura`);
- secondaria competenze attese: 5;
- secondaria obiettivi classe terza: 7;
- secondaria conoscenze: 2 titled blocks (`Lingua`, `Letteratura`).

### LEL - 21

- secondaria competenze attese: 5;
- secondaria obiettivi classe terza: 15;
- conoscenze: 1 narrative block.

LEL remains a `CONDITIONAL_OFFERING`; counting it does not turn it into a universal first-cycle discipline.

### Lingua inglese - 51

- primaria competenze attese: 5;
- primaria obiettivi classe terza: 10;
- primaria obiettivi classe quinta: 12;
- primaria conoscenze: 1 narrative block;
- secondaria competenze attese: 5;
- secondaria obiettivi classe terza: 17;
- secondaria conoscenze: 1 narrative block.

### Seconda lingua comunitaria - 30

- secondaria competenze attese: 6;
- secondaria obiettivi: 13;
- conoscenze: 11 structural items, comprising 5 general titled blocks and 6 language-specific socio-cultural bullets (2 French, 2 Spanish, 2 German).

The six language-specific knowledge bullets remain inside the canonical `SECONDA_LINGUA_COMUNITARIA` segment. R7C5B2A does not create universal national discipline identities for French, Spanish, or German.

## Ledger effect

R7C5B1 had 123 verified structural elements. R7C5B2A adds 138 concrete language elements, producing:

- verified structural elements: 261;
- ledger entries: 22;
- `COUNT_VERIFIED`: 11;
- `COUNT_REQUIRED`: 11.

Still pending:

- general infanzia framework;
- Storia;
- Geografia;
- STEM;
- Matematica;
- Scienze;
- Musica;
- Strumento musicale;
- Arte e immagine;
- Educazione motoria primaria;
- Educazione fisica secondaria.

## Authority invariants

Every new item remains:

- `sourceBindingStatus = SOURCE_LOCATED`;
- `verifiedByHuman = false`;
- `canonicalTextStatus = SOURCE_LOCATED_ONLY`.

Therefore R7C5B2A authorizes none of the following:

- `SOURCE_VERIFIED`;
- `HUMAN_VERIFIED_SOURCE_TEXT`;
- automatic institute-national semantic mapping;
- `NATIONAL_PRESCRIPTIVE` attribution of institute curriculum content;
- P3/P7 mutation;
- runtime or persistence mutation;
- institutional adoption or deployment.

## Next work

R7C5B2B should count Storia, Geografia, STEM, Matematica and Scienze directly from the same final publication, preserving the same fail-closed rules.
