import { describe, expect, it } from 'vitest';
import {
  LEGACY_CURRICULUM_KB_PROVENANCE,
  assessCurriculumAuthority,
  assertInstitutionalCurriculumProjection,
  type CurriculumBaselineProvenance,
} from '../domain/curriculum/foundationAuthority';
import {
  getCurriculumBaseline,
  getCurriculumBaselineAuthority,
  getCurriculumBaselineProvenance,
  resetCurriculumBaseline,
  setCurriculumBaseline,
} from '../lib/curriculumBaseline';

describe('curriculum foundation authority', () => {
  it('classifies the embedded legacy KB as demonstration and unverified', () => {
    resetCurriculumBaseline();
    getCurriculumBaseline();

    expect(getCurriculumBaselineProvenance()).toMatchObject({
      sourceType: 'demonstration',
      sourceStatus: 'unverified',
      authorityLevel: 'DEMONSTRATION_UNVERIFIED',
      institutionallyAdopted: false,
    });
    expect(getCurriculumBaselineAuthority()).toMatchObject({
      canPresentAsVerifiedSource: false,
      canPresentAsInstitutionallyAdopted: false,
    });
  });

  it('never treats the presence of curriculum data as institutional adoption', () => {
    const data = getCurriculumBaseline();
    setCurriculumBaseline(data);

    expect(getCurriculumBaselineAuthority().canPresentAsInstitutionallyAdopted).toBe(false);
  });

  it('fails closed when an unverified source is projected as institutional curriculum', () => {
    expect(() => assertInstitutionalCurriculumProjection(LEGACY_CURRICULUM_KB_PROVENANCE)).toThrow(
      /CURRICULUM_AUTHORITY_BLOCKED/,
    );
  });

  it('allows verified source status without inventing institutional adoption', () => {
    const verifiedSource: CurriculumBaselineProvenance = {
      ...LEGACY_CURRICULUM_KB_PROVENANCE,
      sourceType: 'normative-national',
      sourceStatus: 'active',
      authorityLevel: 'SOURCE_VERIFIED',
      sourceLocator: 'verified-source-id',
      institutionallyAdopted: false,
    };

    expect(assessCurriculumAuthority(verifiedSource)).toMatchObject({
      canPresentAsVerifiedSource: true,
      canPresentAsInstitutionallyAdopted: false,
      authorityLevel: 'SOURCE_VERIFIED',
    });
  });

  it('requires both verified source and explicit adoption for institutional authority', () => {
    const adopted: CurriculumBaselineProvenance = {
      ...LEGACY_CURRICULUM_KB_PROVENANCE,
      sourceType: 'institute-curriculum',
      sourceStatus: 'active',
      authorityLevel: 'INSTITUTIONALLY_ADOPTED',
      sourceLocator: 'institutional-curriculum-version-id',
      institutionallyAdopted: true,
    };

    expect(assessCurriculumAuthority(adopted)).toMatchObject({
      canPresentAsVerifiedSource: true,
      canPresentAsInstitutionallyAdopted: true,
      authorityLevel: 'INSTITUTIONALLY_ADOPTED',
    });
    expect(() => assertInstitutionalCurriculumProjection(adopted)).not.toThrow();
  });

  it('does not upgrade active metadata when the declared authority remains unverified', () => {
    const inconsistent: CurriculumBaselineProvenance = {
      ...LEGACY_CURRICULUM_KB_PROVENANCE,
      sourceType: 'normative-national',
      sourceStatus: 'active',
      authorityLevel: 'DEMONSTRATION_UNVERIFIED',
      sourceLocator: 'dm221-source',
      institutionallyAdopted: false,
    };

    expect(assessCurriculumAuthority(inconsistent)).toMatchObject({
      canPresentAsVerifiedSource: false,
      canPresentAsInstitutionallyAdopted: false,
      authorityLevel: 'DEMONSTRATION_UNVERIFIED',
    });
  });

  it('fails closed when adoption metadata and declared authority disagree', () => {
    const inconsistent: CurriculumBaselineProvenance = {
      ...LEGACY_CURRICULUM_KB_PROVENANCE,
      sourceType: 'institute-curriculum',
      sourceStatus: 'active',
      authorityLevel: 'INSTITUTIONALLY_ADOPTED',
      sourceLocator: 'institutional-curriculum-version-id',
      institutionallyAdopted: false,
    };

    expect(assessCurriculumAuthority(inconsistent)).toMatchObject({
      canPresentAsVerifiedSource: false,
      canPresentAsInstitutionallyAdopted: false,
      authorityLevel: 'DEMONSTRATION_UNVERIFIED',
    });
    expect(() => assertInstitutionalCurriculumProjection(inconsistent)).toThrow(
      /CURRICULUM_AUTHORITY_BLOCKED/,
    );
  });
});
