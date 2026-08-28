import { describe, expect, it } from 'vitest';
import {
  DM221_REQUIREMENT_PROFILE,
  getConditionalNationalRequirements,
  getExternalAuthorityRequirements,
  getUniversalNationalRequirements,
} from '../domain/curriculum/national/requirementProfile';

describe('DM221 national requirement profile', () => {
  it('is explicitly versioned and bound to the official source registry', () => {
    expect(DM221_REQUIREMENT_PROFILE).toMatchObject({
      id: 'dm221-requirements-2026-v1',
      structureVersion: 'dm221-structure-v1',
      sourceId: 'dm-221-2025-indicazioni-nazionali',
      academicStart: '2026/2027',
    });
  });

  it('contains the five infancy fields as universal requirements', () => {
    const infancy = getUniversalNationalRequirements().filter(
      (requirement) => requirement.schoolOrder === 'infanzia',
    );

    expect(infancy).toHaveLength(5);
    expect(infancy.every((requirement) => requirement.kind === 'INFANZIA_FIELD_OF_EXPERIENCE')).toBe(true);
  });

  it('never exposes a first-cycle discipline as an infancy requirement', () => {
    const invalid = getUniversalNationalRequirements().filter(
      (requirement) =>
        requirement.schoolOrder === 'infanzia' && requirement.kind === 'FIRST_CYCLE_DISCIPLINE',
    );

    expect(invalid).toHaveLength(0);
  });

  it('keeps LEL and musical instrument conditional rather than universal', () => {
    const conditionalLabels = getConditionalNationalRequirements().map((requirement) => requirement.label);
    const universalLabels = getUniversalNationalRequirements().map((requirement) => requirement.label);

    expect(conditionalLabels).toContain('Latino per l’educazione linguistica (LEL)');
    expect(conditionalLabels).toContain('Strumento musicale');
    expect(universalLabels).not.toContain('Latino per l’educazione linguistica (LEL)');
    expect(universalLabels).not.toContain('Strumento musicale');
  });

  it('keeps religion behind its external authority source family', () => {
    const external = getExternalAuthorityRequirements();

    expect(external.length).toBeGreaterThan(0);
    expect(external.every((requirement) => requirement.label === 'Religione cattolica')).toBe(true);
    expect(external.every((requirement) => requirement.applicability === 'EXTERNAL_AUTHORITY')).toBe(true);
  });
});
