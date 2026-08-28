import { describe, expect, it } from 'vitest';
import {
  DM221_FIRST_CYCLE_DISCIPLINES,
  DM221_INFANZIA_FIELDS,
  DM221_SPECIAL_SEGMENTS,
  getUniversalFirstCycleRequirements,
} from '../domain/curriculum/national/canonicalStructure';
import { DM221_2025_SOURCE } from '../domain/curriculum/national/dm2212025';
import { resolveExplicit2026Regime } from '../domain/curriculum/national/transition2026';

describe('DM 221/2025 canonical curriculum structure', () => {
  it('registers the primary official source without treating the legacy KB as that source', () => {
    expect(DM221_2025_SOURCE).toMatchObject({
      issuedAt: '2025-12-09',
      publishedAt: '2026-01-27',
      effectiveFrom: '2026-02-11',
      sourceType: 'normative-national',
      sourceStatus: 'active',
    });
  });

  it('models infancy through exactly five fields of experience, not first-cycle disciplines', () => {
    const fields = Object.values(DM221_INFANZIA_FIELDS);

    expect(fields).toHaveLength(5);
    expect(fields.every((field) => field.kind === 'INFANZIA_FIELD_OF_EXPERIENCE')).toBe(true);
    expect(fields.every((field) => field.schoolOrders.length === 1 && field.schoolOrders[0] === 'infanzia')).toBe(true);
    expect(Object.values(DM221_FIRST_CYCLE_DISCIPLINES).some((discipline) => discipline.schoolOrders.includes('infanzia' as never))).toBe(false);
  });

  it('requires second community language only in lower-secondary', () => {
    expect(DM221_FIRST_CYCLE_DISCIPLINES.SECONDA_LINGUA_COMUNITARIA.schoolOrders).toEqual(['secondaria']);
  });

  it('distinguishes primary motor education from lower-secondary physical education', () => {
    expect(DM221_FIRST_CYCLE_DISCIPLINES.EDUCAZIONE_MOTORIA.schoolOrders).toEqual(['primaria']);
    expect(DM221_FIRST_CYCLE_DISCIPLINES.EDUCAZIONE_FISICA.schoolOrders).toEqual(['secondaria']);
  });

  it('does not promote LEL, musical instrument, STEM, civic education or IRC to universal first-cycle disciplines', () => {
    const requirements = getUniversalFirstCycleRequirements();
    const requirementLabels = requirements.map((requirement) => requirement.disciplineLabel);

    expect(requirementLabels).not.toContain('Latino per l’educazione linguistica (LEL)');
    expect(requirementLabels).not.toContain('Strumento musicale');
    expect(requirementLabels).not.toContain('Educazione integrata matematico-scientifico-tecnologica (STEM)');
    expect(requirementLabels).not.toContain('Educazione civica');
    expect(requirementLabels).not.toContain('Religione cattolica');

    expect(DM221_SPECIAL_SEGMENTS.find((segment) => segment.label.includes('LEL'))?.kind).toBe('CONDITIONAL_OFFERING');
    expect(DM221_SPECIAL_SEGMENTS.find((segment) => segment.label === 'Religione cattolica')?.kind).toBe('EXTERNAL_AUTHORITY_SUBJECT');
  });

  it('encodes the 2026/27 transition without upgrading intermediate classes to DM221', () => {
    expect(resolveExplicit2026Regime('infanzia')).toMatchObject({ regime: 'DM221_2025', evidenceLevel: 'NORMATIVE_EXPLICIT' });
    expect(resolveExplicit2026Regime('primaria', 1)?.regime).toBe('DM221_2025');
    expect(resolveExplicit2026Regime('primaria', 2)?.regime).toBe('DM254_2012_CONTINUES');
    expect(resolveExplicit2026Regime('secondaria', 1)?.regime).toBe('DM221_2025');
    expect(resolveExplicit2026Regime('secondaria', 2)?.regime).toBe('DM254_2012_CONTINUES');
    expect(resolveExplicit2026Regime('secondaria', 3)?.regime).toBe('DM254_2012_CONTINUES');
  });
});
