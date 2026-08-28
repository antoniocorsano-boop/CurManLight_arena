import { describe, expect, it } from 'vitest';
import {
  assessElementBinding,
  assertCanonicalSourceText,
  type NationalCurriculumElementBinding,
} from '../domain/curriculum/national/elementBindings';

const baseBinding: NationalCurriculumElementBinding = {
  elementId: 'italiano-primary-section',
  segmentId: 'dm221-disc-italiano',
  elementKind: 'DISCIPLINE_SECTION',
  schoolOrder: 'primaria',
  sourceLocator: {
    sourceId: 'dm-221-2025-indicazioni-nazionali',
    section: 'Italiano',
  },
  sourceBindingStatus: 'SOURCE_LOCATED',
  verifiedByHuman: false,
  canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
  legacyCandidateRefs: ['curriculumKB.italiano.primaria'],
};

describe('DM221 element-level source bindings', () => {
  it('does not treat a located source as verified without human verification', () => {
    expect(assessElementBinding(baseBinding)).toMatchObject({
      canTreatAsSourceVerified: false,
      canUseAsCanonicalSourceText: false,
    });
  });

  it('does not let a SOURCE_VERIFIED flag bypass human verification', () => {
    const inconsistent = {
      ...baseBinding,
      sourceBindingStatus: 'SOURCE_VERIFIED' as const,
      verifiedByHuman: false,
    };

    expect(assessElementBinding(inconsistent).canTreatAsSourceVerified).toBe(false);
  });

  it('can verify provenance without importing or certifying canonical text', () => {
    const verifiedSource = {
      ...baseBinding,
      sourceBindingStatus: 'SOURCE_VERIFIED' as const,
      verifiedByHuman: true,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY' as const,
    };

    expect(assessElementBinding(verifiedSource)).toMatchObject({
      canTreatAsSourceVerified: true,
      canUseAsCanonicalSourceText: false,
    });
    expect(() => assertCanonicalSourceText(verifiedSource)).toThrow(
      /CURRICULUM_SOURCE_BINDING_BLOCKED/,
    );
  });

  it('requires human-verified source text before canonical use', () => {
    const verifiedCanonical = {
      ...baseBinding,
      sourceBindingStatus: 'SOURCE_VERIFIED' as const,
      verifiedByHuman: true,
      canonicalTextStatus: 'HUMAN_VERIFIED_SOURCE_TEXT' as const,
    };

    expect(assessElementBinding(verifiedCanonical)).toMatchObject({
      canTreatAsSourceVerified: true,
      canUseAsCanonicalSourceText: true,
    });
    expect(() => assertCanonicalSourceText(verifiedCanonical)).not.toThrow();
  });

  it('never grants authority from a legacy comparison link', () => {
    const legacyOnly = {
      ...baseBinding,
      sourceBindingStatus: 'LOCATOR_REQUIRED' as const,
      verifiedByHuman: false,
      canonicalTextStatus: 'NOT_IMPORTED' as const,
      sourceLocator: { sourceId: 'dm-221-2025-indicazioni-nazionali' as const },
      legacyCandidateRefs: ['curriculumKB.italiano.primaria'],
    };

    expect(assessElementBinding(legacyOnly).canTreatAsSourceVerified).toBe(false);
  });
});
