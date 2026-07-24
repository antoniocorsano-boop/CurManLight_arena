import { describe, it, expect } from 'vitest';
import {
  createAcademicYear,
  formatAcademicYear,
  isValidAcademicYear,
  resolveNationalFramework,
} from '../lib/curriculumTransitionResolver';
import type { TransitionPolicy, SchoolOrder } from '../types/curriculumTransition';

const y = createAcademicYear;

describe('AcademicYear helpers', () => {
  it('createAcademicYear builds correct structure', () => {
    expect(y(2026)).toEqual({ startYear: 2026, endYear: 2027 });
  });

  it('formatAcademicYear returns "YYYY/YYYY+1"', () => {
    expect(formatAcademicYear(y(2026))).toBe('2026/2027');
  });

  it('isValidAcademicYear returns true for valid year', () => {
    expect(isValidAcademicYear(y(2026))).toBe(true);
  });

  it('isValidAcademicYear rejects non-consecutive years', () => {
    expect(isValidAcademicYear({ startYear: 2026, endYear: 2029 })).toBe(false);
  });

  it('isValidAcademicYear rejects non-integer years', () => {
    expect(isValidAcademicYear({ startYear: 2026.5, endYear: 2027.5 })).toBe(false);
  });

  it('isValidAcademicYear rejects infinite years', () => {
    expect(isValidAcademicYear({ startYear: Infinity, endYear: Infinity })).toBe(false);
  });

  it('isValidAcademicYear rejects NaN years', () => {
    expect(isValidAcademicYear({ startYear: NaN, endYear: NaN })).toBe(false);
  });
});

describe('resolveNationalFramework — 2025/2026 (before transition)', () => {
  const year = y(2025);

  it('infanzia → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'infanzia', schoolYear: year })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'BEFORE_TRANSITION',
    });
  });

  it('primaria 1ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'BEFORE_TRANSITION',
    });
  });

  it('primaria 5ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 5 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'BEFORE_TRANSITION',
    });
  });

  it('secondaria 1ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'BEFORE_TRANSITION',
    });
  });

  it('secondaria 3ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'BEFORE_TRANSITION',
    });
  });
});

describe('resolveNationalFramework — 2026/2027 (first transition year)', () => {
  const year = y(2026);

  it('infanzia → IN2025 (immediate order)', () => {
    expect(resolveNationalFramework({ schoolOrder: 'infanzia', schoolYear: year })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'IMMEDIATE_ORDER_FROM_EFFECTIVE_YEAR',
    });
  });

  it('primaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('primaria 2ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2025,
    });
  });

  it('primaria 3ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2024,
    });
  });

  it('primaria 4ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 4 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2023,
    });
  });

  it('primaria 5ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 5 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2022,
    });
  });

  it('secondaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('secondaria 2ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2025,
    });
  });

  it('secondaria 3ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2024,
    });
  });
});

describe('resolveNationalFramework — 2027/2028', () => {
  const year = y(2027);

  it('infanzia → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'infanzia', schoolYear: year })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'IMMEDIATE_ORDER_FROM_EFFECTIVE_YEAR',
    });
  });

  it('primaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });

  it('primaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('primaria 3ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2025,
    });
  });

  it('primaria 4ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 4 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2024,
    });
  });

  it('primaria 5ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 5 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2023,
    });
  });

  it('secondaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });

  it('secondaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('secondaria 3ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2025,
    });
  });
});

describe('resolveNationalFramework — 2028/2029', () => {
  const year = y(2028);

  it('primaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2028,
    });
  });

  it('primaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });

  it('primaria 3ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('primaria 4ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 4 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2025,
    });
  });

  it('primaria 5ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 5 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2024,
    });
  });

  it('secondaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2028,
    });
  });

  it('secondaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });

  it('secondaria 3ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });
});

describe('resolveNationalFramework — 2029/2030', () => {
  const year = y(2029);

  it('primaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2029,
    });
  });

  it('primaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2028,
    });
  });

  it('primaria 3ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });

  it('primaria 4ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 4 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('primaria 5ª → IN2012', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 5 })).toEqual({
      framework: 'IN2012',
      status: 'resolved',
      reason: 'PRE_TRANSITION_COHORT',
      cohortEntryYear: 2025,
    });
  });

  it('secondaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2029,
    });
  });

  it('secondaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2028,
    });
  });

  it('secondaria 3ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });
});

describe('resolveNationalFramework — 2030/2031 (transition complete)', () => {
  const year = y(2030);

  it('primaria 1ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2030,
    });
  });

  it('primaria 2ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 2 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2029,
    });
  });

  it('primaria 3ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 3 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2028,
    });
  });

  it('primaria 4ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 4 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2027,
    });
  });

  it('primaria 5ª → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 5 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2026,
    });
  });

  it('secondaria tutta → IN2025', () => {
    for (let cl = 1; cl <= 3; cl++) {
      expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: cl })).toEqual({
        framework: 'IN2025',
        status: 'resolved',
        reason: 'ENTRY_COHORT_2026_OR_LATER',
        cohortEntryYear: 2030 - (cl - 1),
      });
    }
  });
});

describe('resolveNationalFramework — future stability (2031/2032+)', () => {
  it('2031/2032: primaria tutta IN2025 senza nuove regole', () => {
    const year = y(2031);
    for (let cl = 1; cl <= 5; cl++) {
      expect(resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: cl })).toEqual({
        framework: 'IN2025',
        status: 'resolved',
        reason: 'ENTRY_COHORT_2026_OR_LATER',
        cohortEntryYear: 2031 - (cl - 1),
      });
    }
  });

  it('2035/2036: secondaria classe 3 → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: y(2035), classLevel: 3 })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2033,
    });
  });

  it('2050/2051: infanzia → IN2025', () => {
    expect(resolveNationalFramework({ schoolOrder: 'infanzia', schoolYear: y(2050) })).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'IMMEDIATE_ORDER_FROM_EFFECTIVE_YEAR',
    });
  });
});

describe('resolveNationalFramework — invalid contexts', () => {
  it('invalid school order', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'universita' as SchoolOrder,
      schoolYear: y(2026),
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('invalid academic year (non-consecutive)', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'primaria',
      schoolYear: { startYear: 2026, endYear: 2029 },
      classLevel: 1,
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('invalid academic year (non-integer)', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'primaria',
      schoolYear: { startYear: 2026.5, endYear: 2027.5 },
      classLevel: 1,
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('primaria classLevel 0', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'primaria',
      schoolYear: y(2026),
      classLevel: 0,
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('primaria classLevel 6 (above max)', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'primaria',
      schoolYear: y(2026),
      classLevel: 6,
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('secondaria classLevel 4 (above max)', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'secondaria',
      schoolYear: y(2026),
      classLevel: 4,
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('primaria missing classLevel', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'primaria',
      schoolYear: y(2026),
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('secondaria missing classLevel', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'secondaria',
      schoolYear: y(2026),
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });

  it('primaria classLevel as float', () => {
    const result = resolveNationalFramework({
      schoolOrder: 'primaria',
      schoolYear: y(2026),
      classLevel: 2.5,
    });
    expect(result).toEqual({
      framework: null,
      status: 'requires-context-confirmation',
      reason: 'INVALID_CONTEXT',
    });
  });
});

describe('resolveNationalFramework — properties', () => {
  it('pure function: input not mutated', () => {
    const input = { startYear: 2026, endYear: 2027 };
    const original = { ...input };
    resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: input, classLevel: 1 });
    expect(input).toEqual(original);
  });

  it('deterministic: same input always same output', () => {
    const a = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: y(2026), classLevel: 1 });
    const b = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: y(2026), classLevel: 1 });
    expect(a).toEqual(b);
  });

  it('no Date.now() dependency', () => {
    const a = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: y(2026), classLevel: 1 });
    const b = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: y(2026), classLevel: 1 });
    expect(a).toEqual(b);
  });

  it('policy is customizable', () => {
    const customPolicy: TransitionPolicy = {
      targetFramework: 'IN2025',
      firstEntrySchoolYear: 2030,
      strategy: 'entry-cohort-progression',
      immediateOrders: ['infanzia'],
      progressiveOrders: ['primaria', 'secondaria'],
    };
    const result = resolveNationalFramework(
      { schoolOrder: 'primaria', schoolYear: y(2030), classLevel: 1 },
      customPolicy
    );
    expect(result).toEqual({
      framework: 'IN2025',
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear: 2030,
    });
  });

  it('reason matches result for all orders in transition year', () => {
    const year = y(2026);

    const inf = resolveNationalFramework({ schoolOrder: 'infanzia', schoolYear: year });
    expect(inf.reason).toBe('IMMEDIATE_ORDER_FROM_EFFECTIVE_YEAR');
    expect(inf.framework).toBe('IN2025');

    const prim1 = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 1 });
    expect(prim1.reason).toBe('ENTRY_COHORT_2026_OR_LATER');
    expect(prim1.framework).toBe('IN2025');

    const prim2 = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: year, classLevel: 2 });
    expect(prim2.reason).toBe('PRE_TRANSITION_COHORT');
    expect(prim2.framework).toBe('IN2012');

    const sec1 = resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 1 });
    expect(sec1.reason).toBe('ENTRY_COHORT_2026_OR_LATER');
    expect(sec1.framework).toBe('IN2025');

    const sec2 = resolveNationalFramework({ schoolOrder: 'secondaria', schoolYear: year, classLevel: 2 });
    expect(sec2.reason).toBe('PRE_TRANSITION_COHORT');
    expect(sec2.framework).toBe('IN2012');
  });

  it('cohortEntryYear is set for progressive orders', () => {
    const result = resolveNationalFramework({ schoolOrder: 'primaria', schoolYear: y(2028), classLevel: 3 });
    expect(result.cohortEntryYear).toBe(2026);
  });

  it('cohortEntryYear is not set for immediate orders', () => {
    const result = resolveNationalFramework({ schoolOrder: 'infanzia', schoolYear: y(2026) });
    expect(result.cohortEntryYear).toBeUndefined();
  });
});

describe('resolveNationalFramework — full matrix cross-check', () => {
  const matrix: Array<{ year: number; order: SchoolOrder; cl: number; expected: 'IN2012' | 'IN2025' }> = [
    { year: 2025, order: 'infanzia', cl: 0, expected: 'IN2012' },
    { year: 2025, order: 'primaria', cl: 1, expected: 'IN2012' },
    { year: 2025, order: 'primaria', cl: 3, expected: 'IN2012' },
    { year: 2025, order: 'primaria', cl: 5, expected: 'IN2012' },
    { year: 2025, order: 'secondaria', cl: 1, expected: 'IN2012' },
    { year: 2025, order: 'secondaria', cl: 3, expected: 'IN2012' },
    { year: 2026, order: 'infanzia', cl: 0, expected: 'IN2025' },
    { year: 2026, order: 'primaria', cl: 1, expected: 'IN2025' },
    { year: 2026, order: 'primaria', cl: 2, expected: 'IN2012' },
    { year: 2026, order: 'primaria', cl: 3, expected: 'IN2012' },
    { year: 2026, order: 'primaria', cl: 4, expected: 'IN2012' },
    { year: 2026, order: 'primaria', cl: 5, expected: 'IN2012' },
    { year: 2026, order: 'secondaria', cl: 1, expected: 'IN2025' },
    { year: 2026, order: 'secondaria', cl: 2, expected: 'IN2012' },
    { year: 2026, order: 'secondaria', cl: 3, expected: 'IN2012' },
    { year: 2027, order: 'infanzia', cl: 0, expected: 'IN2025' },
    { year: 2027, order: 'primaria', cl: 1, expected: 'IN2025' },
    { year: 2027, order: 'primaria', cl: 2, expected: 'IN2025' },
    { year: 2027, order: 'primaria', cl: 3, expected: 'IN2012' },
    { year: 2027, order: 'primaria', cl: 4, expected: 'IN2012' },
    { year: 2027, order: 'primaria', cl: 5, expected: 'IN2012' },
    { year: 2027, order: 'secondaria', cl: 1, expected: 'IN2025' },
    { year: 2027, order: 'secondaria', cl: 2, expected: 'IN2025' },
    { year: 2027, order: 'secondaria', cl: 3, expected: 'IN2012' },
    { year: 2028, order: 'infanzia', cl: 0, expected: 'IN2025' },
    { year: 2028, order: 'primaria', cl: 1, expected: 'IN2025' },
    { year: 2028, order: 'primaria', cl: 2, expected: 'IN2025' },
    { year: 2028, order: 'primaria', cl: 3, expected: 'IN2025' },
    { year: 2028, order: 'primaria', cl: 4, expected: 'IN2012' },
    { year: 2028, order: 'primaria', cl: 5, expected: 'IN2012' },
    { year: 2028, order: 'secondaria', cl: 1, expected: 'IN2025' },
    { year: 2028, order: 'secondaria', cl: 2, expected: 'IN2025' },
    { year: 2028, order: 'secondaria', cl: 3, expected: 'IN2025' },
    { year: 2029, order: 'infanzia', cl: 0, expected: 'IN2025' },
    { year: 2029, order: 'primaria', cl: 1, expected: 'IN2025' },
    { year: 2029, order: 'primaria', cl: 2, expected: 'IN2025' },
    { year: 2029, order: 'primaria', cl: 3, expected: 'IN2025' },
    { year: 2029, order: 'primaria', cl: 4, expected: 'IN2025' },
    { year: 2029, order: 'primaria', cl: 5, expected: 'IN2012' },
    { year: 2029, order: 'secondaria', cl: 1, expected: 'IN2025' },
    { year: 2029, order: 'secondaria', cl: 2, expected: 'IN2025' },
    { year: 2029, order: 'secondaria', cl: 3, expected: 'IN2025' },
    { year: 2030, order: 'infanzia', cl: 0, expected: 'IN2025' },
    { year: 2030, order: 'primaria', cl: 1, expected: 'IN2025' },
    { year: 2030, order: 'primaria', cl: 2, expected: 'IN2025' },
    { year: 2030, order: 'primaria', cl: 3, expected: 'IN2025' },
    { year: 2030, order: 'primaria', cl: 4, expected: 'IN2025' },
    { year: 2030, order: 'primaria', cl: 5, expected: 'IN2025' },
    { year: 2030, order: 'secondaria', cl: 1, expected: 'IN2025' },
    { year: 2030, order: 'secondaria', cl: 2, expected: 'IN2025' },
    { year: 2030, order: 'secondaria', cl: 3, expected: 'IN2025' },
  ];

  it.each(matrix)(
    '$year · $order $clª → $expected',
    ({ year, order, cl, expected }) => {
      const ctx =
        order === 'infanzia'
          ? { schoolOrder: order, schoolYear: y(year) }
          : { schoolOrder: order, schoolYear: y(year), classLevel: cl };
      expect(resolveNationalFramework(ctx).framework).toBe(expected);
    }
  );
});
