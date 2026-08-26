import { describe, expect, it } from 'vitest';
import { annualPlanningFrameworkFixture, curriculumAdoptedFixture } from '../domain/transfer/interopV1Fixtures';
import { parseCmlInteropEnvelope, validateCmlInteropEnvelope } from '../domain/transfer/interopV1';

describe('CML Interoperability Contract v1', () => {
  it('accepts a human-confirmed adopted curriculum export from Arena', () => {
    expect(validateCmlInteropEnvelope(curriculumAdoptedFixture)).toEqual({ valid: true, errors: [] });
  });

  it('accepts an annual planning framework export from Arena', () => {
    expect(validateCmlInteropEnvelope(annualPlanningFrameworkFixture).valid).toBe(true);
  });

  it('fails closed on unsupported contract versions', () => {
    const input = { ...curriculumAdoptedFixture, payloadVersion: 2 };
    const result = validateCmlInteropEnvelope(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.code === 'INTEROP_CONTRACT_UNSUPPORTED')).toBe(true);
  });

  it('fails closed when adopted curriculum lacks human confirmation', () => {
    const input = { ...curriculumAdoptedFixture, provenance: { ...curriculumAdoptedFixture.provenance, humanConfirmed: false } };
    const result = validateCmlInteropEnvelope(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.code === 'INTEROP_PROVENANCE_INVALID')).toBe(true);
  });

  it('rejects a Docente OS mutation direction for CURRICULUM_ADOPTED', () => {
    const input = { ...curriculumAdoptedFixture, sourceProduct: 'DOCENTE_OS' };
    const result = validateCmlInteropEnvelope(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.code === 'INTEROP_DIRECTION_INVALID')).toBe(true);
  });

  it('rejects school personal data even when privacyClass is falsely declared safe', () => {
    const input = {
      ...annualPlanningFrameworkFixture,
      payload: { ...annualPlanningFrameworkFixture.payload, studentName: 'Example Student' },
    };
    const result = validateCmlInteropEnvelope(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.code === 'INTEROP_PRIVACY_REJECTED')).toBe(true);
  });

  it('requires canonical reference identity fields', () => {
    const input = {
      ...curriculumAdoptedFixture,
      payload: { ...curriculumAdoptedFixture.payload, curriculumVersionRef: { namespace: '', entityType: 'CurriculumVersion', entityId: 'x' } },
    };
    const result = validateCmlInteropEnvelope(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.code === 'INTEROP_REFERENCE_INVALID')).toBe(true);
  });

  it('parse rejects invalid envelopes instead of coercing them', () => {
    expect(() => parseCmlInteropEnvelope({ contract: 'wrong' })).toThrow('CML interoperability envelope rejected');
  });
});
