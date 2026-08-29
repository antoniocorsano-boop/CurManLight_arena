import { describe, expect, it } from 'vitest';
import {
  assertDm221ProjectionAllowed,
  resolveCurriculumRuntimeApplicability,
} from '../domain/curriculum/national/runtimeApplicability';

describe('CNR-1 runtime applicability', () => {
  it('applies DM221/2025 to first year of lower secondary in 2026/27', () => {
    const result = resolveCurriculumRuntimeApplicability({
      academicYear: '2026/2027',
      schoolOrder: 'secondaria',
      classYear: 1,
    });

    expect(result.status).toBe('RESOLVED');
    expect(result.regime).toBe('DM221_2025');
    expect(result.dm221Applicable).toBe(true);
    expect(result.canProjectDm221Content).toBe(true);
  });

  it.each([2, 3] as const)(
    'keeps DM254/2012 for lower-secondary class %s in 2026/27',
    (classYear) => {
      const result = resolveCurriculumRuntimeApplicability({
        academicYear: '2026/2027',
        schoolOrder: 'secondaria',
        classYear,
      });

      expect(result.status).toBe('RESOLVED');
      expect(result.regime).toBe('DM254_2012_CONTINUES');
      expect(result.dm221Applicable).toBe(false);
      expect(result.canProjectDm221Content).toBe(false);
    },
  );

  it('applies DM221/2025 to first primary class and keeps 2012 for intermediate primary classes', () => {
    const first = resolveCurriculumRuntimeApplicability({
      academicYear: '2026/2027',
      schoolOrder: 'primaria',
      classYear: 1,
    });
    const fourth = resolveCurriculumRuntimeApplicability({
      academicYear: '2026/2027',
      schoolOrder: 'primaria',
      classYear: 4,
    });

    expect(first.regime).toBe('DM221_2025');
    expect(first.canProjectDm221Content).toBe(true);
    expect(fourth.regime).toBe('DM254_2012_CONTINUES');
    expect(fourth.canProjectDm221Content).toBe(false);
  });

  it('applies DM221/2025 to infanzia without inventing a class year', () => {
    const result = resolveCurriculumRuntimeApplicability({
      academicYear: '2026/2027',
      schoolOrder: 'infanzia',
    });

    expect(result.status).toBe('RESOLVED');
    expect(result.regime).toBe('DM221_2025');
    expect(result.canProjectDm221Content).toBe(true);
  });

  it('fails closed when primary or secondary class year is missing', () => {
    const result = resolveCurriculumRuntimeApplicability({
      academicYear: '2026/2027',
      schoolOrder: 'secondaria',
    });

    expect(result.status).toBe('UNRESOLVED_MISSING_CONTEXT');
    expect(result.regimeResolved).toBe(false);
    expect(result.canProjectDm221Content).toBe(false);
  });

  it('does not infer future cohort progression', () => {
    const result = resolveCurriculumRuntimeApplicability({
      academicYear: '2027/2028',
      schoolOrder: 'secondaria',
      classYear: 2,
    });

    expect(result.status).toBe('UNRESOLVED_UNSUPPORTED_ACADEMIC_YEAR');
    expect(result.regimeResolved).toBe(false);
    expect(result.canProjectDm221Content).toBe(false);
  });

  it('blocks DM221 projection for a 2026/27 second-year lower-secondary class', () => {
    expect(() =>
      assertDm221ProjectionAllowed({
        academicYear: '2026/2027',
        schoolOrder: 'secondaria',
        classYear: 2,
      }),
    ).toThrow(/CNR-1_DM221_PROJECTION_BLOCKED/);
  });
});
