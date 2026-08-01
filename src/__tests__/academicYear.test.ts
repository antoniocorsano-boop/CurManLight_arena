import { describe, expect, it } from 'vitest';
import {
  parseSchoolYear,
  formatInstitutionalAcademicYear,
  createAcademicYear,
  isValidAcademicYear,
  schoolYearToInstitutionalLabel,
  institutionalLabelToSchoolYear,
  type AcademicYear,
} from '../lib/academicYear';

describe('academicYear utilities', () => {
  describe('parseSchoolYear', () => {
    it('parses valid school year string', () => {
      expect(parseSchoolYear('2026-2027')).toEqual({ startYear: 2026, endYear: 2027 });
      expect(parseSchoolYear('2025-2026')).toEqual({ startYear: 2025, endYear: 2026 });
      expect(parseSchoolYear('2030-2031')).toEqual({ startYear: 2030, endYear: 2031 });
    });

    it('returns null for invalid format', () => {
      expect(parseSchoolYear('2026/2027')).toBeNull();
      expect(parseSchoolYear('2026')).toBeNull();
      expect(parseSchoolYear('')).toBeNull();
      expect(parseSchoolYear('invalid')).toBeNull();
      expect(parseSchoolYear(null as any)).toBeNull();
      expect(parseSchoolYear(undefined as any)).toBeNull();
    });

    it('returns null for non-consecutive years', () => {
      expect(parseSchoolYear('2026-2028')).toBeNull();
      expect(parseSchoolYear('2026-2025')).toBeNull();
      expect(parseSchoolYear('2026-2026')).toBeNull();
    });
  });

  describe('formatInstitutionalAcademicYear', () => {
    it('formats AcademicYear as YYYY/YYYY+1', () => {
      expect(formatInstitutionalAcademicYear({ startYear: 2026, endYear: 2027 })).toBe('2026/2027');
      expect(formatInstitutionalAcademicYear({ startYear: 2025, endYear: 2026 })).toBe('2025/2026');
    });
  });

  describe('createAcademicYear', () => {
    it('creates AcademicYear from start year', () => {
      expect(createAcademicYear(2026)).toEqual({ startYear: 2026, endYear: 2027 });
      expect(createAcademicYear(2025)).toEqual({ startYear: 2025, endYear: 2026 });
    });
  });

  describe('isValidAcademicYear', () => {
    it('returns true for valid AcademicYear', () => {
      expect(isValidAcademicYear({ startYear: 2026, endYear: 2027 })).toBe(true);
      expect(isValidAcademicYear({ startYear: 2025, endYear: 2026 })).toBe(true);
    });

    it('returns false for non-consecutive years', () => {
      expect(isValidAcademicYear({ startYear: 2026, endYear: 2028 })).toBe(false);
      expect(isValidAcademicYear({ startYear: 2026, endYear: 2026 })).toBe(false);
    });

    it('returns false for non-integer years', () => {
      expect(isValidAcademicYear({ startYear: 2026.5, endYear: 2027.5 })).toBe(false);
    });

    it('returns false for non-finite years', () => {
      expect(isValidAcademicYear({ startYear: Infinity, endYear: Infinity })).toBe(false);
      expect(isValidAcademicYear({ startYear: NaN, endYear: NaN })).toBe(false);
    });
  });

  describe('schoolYearToInstitutionalLabel', () => {
    it('converts YYYY-YYYY to YYYY/YYYY', () => {
      expect(schoolYearToInstitutionalLabel('2026-2027')).toBe('2026/2027');
      expect(schoolYearToInstitutionalLabel('2025-2026')).toBe('2025/2026');
    });

    it('returns original string for invalid format', () => {
      expect(schoolYearToInstitutionalLabel('2026/2027')).toBe('2026/2027');
      expect(schoolYearToInstitutionalLabel('invalid')).toBe('invalid');
      expect(schoolYearToInstitutionalLabel('')).toBe('');
    });
  });

  describe('institutionalLabelToSchoolYear', () => {
    it('converts YYYY/YYYY to YYYY-YYYY', () => {
      expect(institutionalLabelToSchoolYear('2026/2027')).toBe('2026-2027');
      expect(institutionalLabelToSchoolYear('2025/2026')).toBe('2025-2026');
    });

    it('returns original string for invalid format', () => {
      expect(institutionalLabelToSchoolYear('2026-2027')).toBe('2026-2027');
      expect(institutionalLabelToSchoolYear('invalid')).toBe('invalid');
      expect(institutionalLabelToSchoolYear('')).toBe('');
    });
  });

  describe('AcademicYear type compatibility', () => {
    it('matches canonical AcademicYear structure', () => {
      const year: AcademicYear = { startYear: 2026, endYear: 2027 };
      expect(year.startYear).toBe(2026);
      expect(year.endYear).toBe(2027);
    });
  });
});
