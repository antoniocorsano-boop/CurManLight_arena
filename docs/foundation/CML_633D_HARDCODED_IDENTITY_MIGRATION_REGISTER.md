# CML-633D Hardcoded Identity Migration Register

> Complete record of institutional identity occurrences found, classified, and treated during CML-633D.

## Methodology

- Source scan via `institution-hardcodes.test.ts` (automated regression)
- Manual `git grep` and `Grep` searches across `src/**/*.{ts,tsx}`
- Patterns: institute names, codes, addresses, principal names, email domains, static years, signatures, authority claims

## Migration Categories

| Category | Meaning |
|---|---|
| Removed from production | No longer present in active code |
| Replaced with selector | Now derived from institutional archive |
| Preserved as fixture | Intentionally kept in test fixtures only |
| Preserved as example | Documentation or storybook example |
| Importable as legacy | Can be imported via `importLegacyInstitutions` but not activated |

## Allowlisted Historical Archives

| File | Classification | Rationale |
|---|---|---|
| `src/data/volumesKB.ts` | Historical archive | Immutable CML-633C authoritative legacy curriculum; contains `Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani"`, `AVIC849003`, `Maria Letizia`, etc. |
| `src/data/curriculumKB.ts` | Historical archive | Immutable CML-633C authoritative legacy curriculum content |

These files are explicitly excluded from the hardcode scan in `institution-hardcodes.test.ts` via `exactFileAllowlist`.

## Production Code Removals

### Previously hardcoded institute identity

| Previous Value | Files Affected | Treatment |
|---|---|---|
| `Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani"` | A04, A07, copilot, navigation, workspace, dashboard, social, classroom | Replaced with `getNeutralInstituteName(archive)` or `'Istituto non configurato'` |
| `AVIC849003` | A04, A07 exports, template engine, SCORM | Removed; code now reads `institute.mechanicalCode` from archive |
| `Via Calvario` / `Via Covotta` / `Via Marconi` | A07 document headers, template previews | Replaced with `getMainInstituteSite(archive).address` |
| `Prof.ssa Maria Letizia` / `Maria Letizia CML` | A07 signatures, print headers | Removed; replaced with declared actor from context |
| `I.C. don Milani` / `donmilani` | Email domains, file names, backup labels | Removed; no institutional email assumed |
| `2025-2026` static year | Multiple surfaces | Replaced with `getActiveAcademicYear(archive).label` |

### Previously hardcoded authority claims

| Claim | Treatment |
|---|---|
| `VALIDATO ED APPROVATO DAL COLLEGIO DOCENTI` | Removed from SCORM/export; replaced with neutral |
| `MOCK_SIGNATURE_DON_MILANI` | Removed from all active code |
| `MINISTERO DELL'ISTRUZIONE E DEL MERITO` | Removed from A07 headers |
| `UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA` | Removed from A07 headers |
| `d'Istituto` institutional authority phrasing | Removed from active UI surfaces (see pattern list in hardcodes test) |

### Previously hardcoded defaults

| Default | Treatment |
|---|---|
| `role: 'insegnante'` as useState default | Replaced with `'non-dichiarato'` or no default |
| `assignedClasses: ['1', '2']` fixture | Removed from production code |
| `selfEvaluation \|\| 4` synthesized metrics | Removed; values are user-entered or undefined |
| `46 / 46` and `94.5%` dashboard metrics | Removed; no fabricated metrics |

## Test Fixture Preservation

All test files (`__tests__/`) use the removed values only in negative assertions:

```typescript
expect(output).not.toMatch(/AVIC849003|don Lorenzo Milani|Calvario-Covotta/);
```

No test creates or promotes institutional identity. The regression scan in `institution-hardcodes.test.ts` enforces this automatically.

## Migration Scan Results

| Pattern | Production Occurrences | Test Occurrences | Historical Archive |
|---|---|---|---|
| `AVIC849003` | 0 | 10 (negative assertions) | ~15 (volumesKB) |
| `don Lorenzo Milani` | 0 | 6 (negative assertions) | ~25 (volumesKB) |
| `Calvario-Covotta` | 0 | 3 (negative assertions) | ~15 (volumesKB) |
| `Maria Letizia` | 0 | 5 (negative assertions) | 1 (volumesKB Vol.10) |
| `Via Calvario` / `Via Covotta` | 0 | 0 | 0 |
| `2025-2026` static year | 0 | 1 (hardcodes test) | 0 |
| `docente@gmail.com` | 0 | 0 | 0 |
| `MOCK_SIGNATURE` | 0 | 1 (negative assertion) | 0 |
