# ARENA R7C5B2B - Humanities, STEM, Mathematics and Science inventory

## Scope

R7C5B2B extends the fail-closed final-publication inventory to:

- Storia, pp. 96-104;
- Geografia, pp. 105-112;
- Educazione integrata matematico-scientifico-tecnologica (STEM), pp. 113-117;
- Matematica, pp. 118-129;
- Scienze, pp. 130-139.

The work counts structural curriculum elements in the final MIM publication printed in March 2026. It does not import source wording, verify the wording element-by-element, map institute content to national elements, or promote institute content to national authority.

## Counting rules

The inventory follows the native visual/semantic structure of each section:

- competencies, objectives and bulletized knowledge: one structural item per typographic bullet;
- narrative knowledge without bullets: one item per visually separated, semantically autonomous paragraph;
- Mathematics keeps Informatica inside the Mathematics segment wherever the source places it;
- STEM is inventoried as a cross-disciplinary framework, never transformed into a discipline;
- explanatory rationale outside the curriculum-element structure is not counted as a disciplinary element.

## Verified structural totals

### Storia - 93

- primary expected competences: 4;
- primary grade-3 objectives: 3;
- primary grade-5 objectives: 4;
- primary knowledge: 36;
- lower-secondary expected competences: 3;
- lower-secondary grade-3 objectives: 5;
- lower-secondary knowledge: 38.

### Geografia - 81

- primary expected competences: 5;
- primary grade-3 objectives: 17;
- primary grade-5 objectives: 14;
- primary knowledge: 6 narrative blocks;
- lower-secondary expected competences: 4;
- lower-secondary grade-3 objectives: 25;
- lower-secondary knowledge: 10 narrative blocks.

### STEM - 8

- general integrated framework narrative: 1;
- primary guidance narrative: 1;
- lower-secondary guidance narrative: 1;
- innovative aspects: 5 typographic bullets.

All eight items retain `dm221-framework-stem` and `CROSS_DISCIPLINARY_FRAMEWORK`. Their inventory does not create a STEM discipline.

### Matematica - 78

- primary expected competences: 8;
- primary grade-3 objectives: 11;
- primary grade-5 objectives: 14;
- primary knowledge: 4;
- lower-secondary expected competences: 8;
- lower-secondary grade-3 objectives: 28;
- lower-secondary knowledge: 5.

The Informatica components explicitly present in the source remain internal to `dm221-disc-matematica`; R7C5B2B does not create a separate canonical Informatica discipline.

### Scienze - 113

- primary expected competences: 3;
- primary grade-3 objectives: 15;
- primary grade-5 objectives: 34;
- primary knowledge: 5;
- lower-secondary expected competences: 3;
- lower-secondary grade-3 objectives: 47;
- lower-secondary knowledge: 6.

Visual verification is material for two rows that could otherwise be misread as headings: `Esplorazione sensoriale dei fenomeni fisici` in primary grade-5 objectives and `Sperimentazione e analisi dell’energia nei fenomeni fisici` in lower-secondary objectives are typographic bullet rows and are included in the structural count.

## Ledger effect

R7C5B2A had 261 verified structural elements. R7C5B2B adds 373 concrete items:

- verified structural elements: 634;
- ledger entries: 22;
- `COUNT_VERIFIED`: 16;
- `COUNT_REQUIRED`: 6.

Still pending:

- general infanzia framework;
- Musica;
- Strumento musicale;
- Arte e immagine;
- Educazione motoria (primary);
- Educazione fisica (lower secondary).

## Authority invariants

Every new concrete item remains:

- `sourceBindingStatus = SOURCE_LOCATED`;
- `verifiedByHuman = false`;
- `canonicalTextStatus = SOURCE_LOCATED_ONLY`.

R7C5B2B therefore authorizes none of the following:

- `SOURCE_VERIFIED`;
- `HUMAN_VERIFIED_SOURCE_TEXT`;
- institute-national semantic matching;
- `NATIONAL_PRESCRIPTIVE` attribution to institute curriculum content;
- P3/P7 mutation;
- runtime or persistence mutation;
- institutional adoption or deployment.

## Next work

R7C5B2C should close the six remaining inventory scopes: general infanzia framework, Musica, Strumento musicale, Arte e immagine, Educazione motoria primaria and Educazione fisica secondaria.
