import { describe, expect, it } from 'vitest';
import {
  DM221_REQUIREMENT_PROFILE,
  getConditionalNationalRequirements,
  getExternalAuthorityRequirements,
  getUniversalNationalRequirements,
} from '../domain/curriculum/national/requirementProfile';

describe('DM221 national requirement profile', () => {
  it('is explicitly versioned, source-bound and transition-aware', () => {
    expect(DM221_REQUIREMENT_PROFILE).toMatchObject({
      id: 'dm221-requirements-2026-v1',
      structureVersion: 'dm221-structure-v1',
      sourceId: 'dm-221-2025-indicazioni-nazionali',
      academicStart: '2026/2027',
      regimeScope: 'DM221_2025',
      transitionResolutionRequired: true,
    });
    expect(
      DM221_REQUIREMENT_PROFILE.requirements.every(
        (requirement) =>
          requirement.regimeScope === 'DM221_2025' &&
          requirement.transitionResolutionRequired === true,
      ),
    ).toBe(true);
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

  it('keeps LEL and musical instrument conditional and preserves their activation rules', () => {
    const conditional = getConditionalNationalRequirements();
    const universalLabels = getUniversalNationalRequirements().map((requirement) => requirement.label);
    const lel = conditional.find((requirement) => requirement.label === 'Latino per l’educazione linguistica (LEL)');
    const instrument = conditional.find((requirement) => requirement.label === 'Strumento musicale');

    expect(lel?.activation).toMatchObject({ academicYear: '2026/2027', classYears: [2, 3] });
    expect(instrument?.activation).toMatchObject({ academicYear: '2026/2027', classYears: [1] });
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
