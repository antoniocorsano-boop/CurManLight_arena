import { describe, expect, it } from 'vitest';
import { resolveShownFrameworkForCurriculum } from '../lib/curriculumTransitionUi';

describe('resolveShownFrameworkForCurriculum — UI regression against canonical resolver', () => {
  it('2026/2027: infanzia → IN2025', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2026-2027', order: 'infanzia', targetClass: '' }))
      .toBe('IN2025');
  });

  it('2026/2027: primaria classe 1 → IN2025', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2026-2027', order: 'primaria', targetClass: '1' }))
      .toBe('IN2025');
  });

  it('2026/2027: primaria classe 2 → IN2012', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2026-2027', order: 'primaria', targetClass: '2' }))
      .toBe('IN2012');
  });

  it('2027/2028: primaria classe 2 → IN2025', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2027-2028', order: 'primaria', targetClass: '2' }))
      .toBe('IN2025');
  });

  it('2027/2028: primaria classe 3 → IN2012', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2027-2028', order: 'primaria', targetClass: '3' }))
      .toBe('IN2012');
  });

  it('2027/2028: secondaria classe 3 → IN2012', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2027-2028', order: 'secondaria', targetClass: '3' }))
      .toBe('IN2012');
  });

  it('2028/2029: primaria classe 4 (residua pre-2026) → IN2012', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2028-2029', order: 'primaria', targetClass: '4' }))
      .toBe('IN2012');
  });

  it('2028/2029: primaria classe 5 (residua pre-2026) → IN2012', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2028-2029', order: 'primaria', targetClass: '5' }))
      .toBe('IN2012');
  });

  it('2029/2030: primaria classe 5 (residua pre-2026) → IN2012', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2029-2030', order: 'primaria', targetClass: '5' }))
      .toBe('IN2012');
  });

  it('2030/2031: primaria classe 5 → IN2025', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2030-2031', order: 'primaria', targetClass: '5' }))
      .toBe('IN2025');
  });

  it('anno non valido → null (fallback prodotto, nessun framework inventato)', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '', order: 'primaria', targetClass: '1' })).toBeNull();
    expect(resolveShownFrameworkForCurriculum({ schoolYear: 'invalid', order: 'primaria', targetClass: '1' })).toBeNull();
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2026/2027', order: 'primaria', targetClass: '1' })).toBeNull();
  });

  it('classe non valida → null (fallback prodotto)', () => {
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2026-2027', order: 'primaria', targetClass: 'abc' })).toBeNull();
    expect(resolveShownFrameworkForCurriculum({ schoolYear: '2026-2027', order: 'primaria', targetClass: '' })).toBeNull();
  });
});
