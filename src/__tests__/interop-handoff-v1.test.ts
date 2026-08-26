import { describe, expect, it } from 'vitest';
import {
  annualPlanningFrameworkFixture,
  curriculumAdoptedFixture,
} from '../domain/transfer/interopV1Fixtures';
import {
  createCmlLocalHandoffV1,
  parseCmlLocalHandoffV1,
  serializeCmlLocalHandoffV1,
  validateCmlLocalHandoffV1,
} from '../domain/transfer/interopHandoffV1';

describe('CML local handoff v1', () => {
  it('creates a preview-only artifact requiring teacher acceptance', () => {
    const handoff = createCmlLocalHandoffV1({
      curriculumAdopted: curriculumAdoptedFixture,
      annualPlanningFramework: annualPlanningFrameworkFixture,
      generatedAt: '2026-08-26T12:30:00.000Z',
    });

    expect(handoff.targetProduct).toBe('DOCENTE_OS');
    expect(handoff.importMode).toBe('PREVIEW_ONLY');
    expect(handoff.acceptanceRequired).toBe(true);
    expect(validateCmlLocalHandoffV1(handoff).valid).toBe(true);
  });

  it('round-trips through serialized local artifact', () => {
    const handoff = createCmlLocalHandoffV1({
      curriculumAdopted: curriculumAdoptedFixture,
      annualPlanningFramework: annualPlanningFrameworkFixture,
      generatedAt: '2026-08-26T12:30:00.000Z',
    });
    expect(parseCmlLocalHandoffV1(serializeCmlLocalHandoffV1(handoff))).toEqual(handoff);
  });

  it('rejects attempts to disable teacher acceptance', () => {
    const handoff = createCmlLocalHandoffV1({
      curriculumAdopted: curriculumAdoptedFixture,
      annualPlanningFramework: annualPlanningFrameworkFixture,
    });
    const tampered = { ...handoff, acceptanceRequired: false };
    const result = validateCmlLocalHandoffV1(tampered);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('teacher acceptance must be required');
  });

  it('rejects a curriculum/framework mismatch', () => {
    const incompatibleFramework = {
      ...annualPlanningFrameworkFixture,
      payload: { ...annualPlanningFrameworkFixture.payload, gradeRef: 'grade-2' },
    };
    expect(() => createCmlLocalHandoffV1({
      curriculumAdopted: curriculumAdoptedFixture,
      annualPlanningFramework: incompatibleFramework,
    })).toThrow('gradeRef mismatch');
  });

  it('rejects tampering after export through structural footprint', () => {
    const handoff = createCmlLocalHandoffV1({
      curriculumAdopted: curriculumAdoptedFixture,
      annualPlanningFramework: annualPlanningFrameworkFixture,
    });
    const tampered = {
      ...handoff,
      annualPlanningFramework: {
        ...handoff.annualPlanningFramework,
        payload: { ...handoff.annualPlanningFramework.payload, disciplineRef: 'other' },
      },
    };
    expect(validateCmlLocalHandoffV1(tampered).valid).toBe(false);
  });
});
