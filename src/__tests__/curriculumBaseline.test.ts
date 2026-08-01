import { describe, expect, it, beforeEach } from 'vitest';
import {
  getCurriculumBaseline,
  setCurriculumBaseline,
  resetCurriculumBaseline,
} from '../lib/curriculumBaseline';
import type { CurriculumMap } from '../features/session/types/appViewContracts';

describe('curriculumBaseline', () => {
  beforeEach(() => {
    resetCurriculumBaseline();
  });

  describe('getCurriculumBaseline', () => {
    it('returns a baseline curriculum map', () => {
      const baseline = getCurriculumBaseline();
      expect(baseline).toBeDefined();
      expect(typeof baseline).toBe('object');
      expect(Object.keys(baseline).length).toBeGreaterThan(0);
    });

    it('includes expected disciplines', () => {
      const baseline = getCurriculumBaseline();
      expect(baseline.italiano).toBeDefined();
      expect(baseline.matematica).toBeDefined();
      expect(baseline.scienze).toBeDefined();
    });

    it('includes expected school orders', () => {
      const baseline = getCurriculumBaseline();
      expect(baseline.italiano.infanzia).toBeDefined();
      expect(baseline.italiano.primaria).toBeDefined();
      expect(baseline.italiano.secondaria).toBeDefined();
    });

    it('returns a deep clone (not the same object reference)', () => {
      const baseline1 = getCurriculumBaseline();
      const baseline2 = getCurriculumBaseline();
      expect(baseline1).not.toBe(baseline2);
      expect(baseline1).toEqual(baseline2);
    });

    it('modifications to returned object do not affect cached baseline', () => {
      const baseline1 = getCurriculumBaseline();
      baseline1.italiano.primaria.traguardi.push('TEST MODIFICATION');

      const baseline2 = getCurriculumBaseline();
      expect(baseline2.italiano.primaria.traguardi).not.toContain('TEST MODIFICATION');
    });
  });

  describe('setCurriculumBaseline', () => {
    it('sets a custom baseline', () => {
      const customBaseline: CurriculumMap = {
        italiano: {
          infanzia: { traguardi: ['custom'], obiettivi: [], evidenze: [], proposals: [] },
          primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
          secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
        },
      };

      setCurriculumBaseline(customBaseline);
      const baseline = getCurriculumBaseline();

      expect(baseline.italiano.infanzia.traguardi).toEqual(['custom']);
    });

    it('returns a deep clone of the set baseline', () => {
      const customBaseline: CurriculumMap = {
        italiano: {
          infanzia: { traguardi: ['custom'], obiettivi: [], evidenze: [], proposals: [] },
          primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
          secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
        },
      };

      setCurriculumBaseline(customBaseline);
      const baseline1 = getCurriculumBaseline();
      const baseline2 = getCurriculumBaseline();

      expect(baseline1).not.toBe(baseline2);
      expect(baseline1).toEqual(baseline2);
    });

    it('modifications to returned object do not affect cached baseline', () => {
      const customBaseline: CurriculumMap = {
        italiano: {
          infanzia: { traguardi: ['custom'], obiettivi: [], evidenze: [], proposals: [] },
          primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
          secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
        },
      };

      setCurriculumBaseline(customBaseline);
      const baseline1 = getCurriculumBaseline();
      baseline1.italiano.infanzia.traguardi.push('MODIFIED');

      const baseline2 = getCurriculumBaseline();
      expect(baseline2.italiano.infanzia.traguardi).not.toContain('MODIFIED');
    });
  });

  describe('resetCurriculumBaseline', () => {
    it('resets to default baseline', () => {
      const customBaseline: CurriculumMap = {
        italiano: {
          infanzia: { traguardi: ['custom'], obiettivi: [], evidenze: [], proposals: [] },
          primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
          secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
        },
      };

      setCurriculumBaseline(customBaseline);
      resetCurriculumBaseline();

      const baseline = getCurriculumBaseline();
      expect(baseline.italiano.infanzia.traguardi).not.toEqual(['custom']);
      expect(baseline.italiano.infanzia.traguardi.length).toBeGreaterThan(0);
    });
  });
});
