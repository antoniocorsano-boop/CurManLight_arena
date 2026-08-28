import { describe, expect, it } from 'vitest';
import { auditBindingCoverage } from '../domain/curriculum/national/bindingCoverage';
import type { NationalCurriculumElementBinding } from '../domain/curriculum/national/elementBindings';
import type { NationalCurriculumRequirement } from '../domain/curriculum/national/requirementProfile';

const requirements: NationalCurriculumRequirement[] = [
  {
    requirementId: 'italiano-primary',
    segmentId: 'dm221-disc-italiano',
    kind: 'FIRST_CYCLE_DISCIPLINE',
    label: 'Italiano',
    schoolOrder: 'primaria',
    applicability: 'UNIVERSAL',
    regimeScope: 'DM221_2025',
    transitionResolutionRequired: true,
    sourceLocator: { sourceId: 'dm-221-2025-indicazioni-nazionali', section: 'Italiano' },
  },
  {
    requirementId: 'matematica-primary',
    segmentId: 'dm221-disc-matematica',
    kind: 'FIRST_CYCLE_DISCIPLINE',
    label: 'Matematica',
    schoolOrder: 'primaria',
    applicability: 'UNIVERSAL',
    regimeScope: 'DM221_2025',
    transitionResolutionRequired: true,
    sourceLocator: { sourceId: 'dm-221-2025-indicazioni-nazionali', section: 'Matematica' },
  },
];

function binding(segmentId: string, canonicalText = false): NationalCurriculumElementBinding {
  return {
    elementId: `${segmentId}-section`,
    segmentId,
    elementKind: 'DISCIPLINE_SECTION',
    schoolOrder: 'primaria',
    sourceLocator: { sourceId: 'dm-221-2025-indicazioni-nazionali', section: segmentId },
    sourceBindingStatus: 'SOURCE_VERIFIED',
    verifiedByHuman: true,
    canonicalTextStatus: canonicalText ? 'HUMAN_VERIFIED_SOURCE_TEXT' : 'SOURCE_LOCATED_ONLY',
  };
}

describe('DM221 verified binding coverage', () => {
  it('does not claim source coverage when one universal requirement is missing', () => {
    const audit = auditBindingCoverage(requirements, [binding('dm221-disc-italiano')]);

    expect(audit.universalRequirements).toBe(2);
    expect(audit.universalRequirementsWithVerifiedSource).toBe(1);
    expect(audit.canClaimUniversalSourceCoverage).toBe(false);
  });

  it('separates verified source coverage from verified canonical text coverage', () => {
    const audit = auditBindingCoverage(requirements, [
      binding('dm221-disc-italiano'),
      binding('dm221-disc-matematica'),
    ]);

    expect(audit.canClaimUniversalSourceCoverage).toBe(true);
    expect(audit.canClaimUniversalCanonicalTextCoverage).toBe(false);
  });

  it('requires verified canonical text for every universal requirement before text-coverage claim', () => {
    const audit = auditBindingCoverage(requirements, [
      binding('dm221-disc-italiano', true),
      binding('dm221-disc-matematica', true),
    ]);

    expect(audit.canClaimUniversalSourceCoverage).toBe(true);
    expect(audit.canClaimUniversalCanonicalTextCoverage).toBe(true);
  });

  it('fails closed on an empty applicable-requirement set', () => {
    const audit = auditBindingCoverage([], []);

    expect(audit.canClaimUniversalSourceCoverage).toBe(false);
    expect(audit.canClaimUniversalCanonicalTextCoverage).toBe(false);
  });
});
