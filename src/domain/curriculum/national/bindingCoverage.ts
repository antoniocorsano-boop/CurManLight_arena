import type { NationalCurriculumRequirement } from './requirementProfile';
import type { NationalCurriculumElementBinding } from './elementBindings';
import { assessElementBinding } from './elementBindings';

export interface SegmentBindingCoverage {
  requirementId: string;
  segmentId: string;
  schoolOrder: NationalCurriculumRequirement['schoolOrder'];
  applicable: boolean;
  locatedBindings: number;
  verifiedBindings: number;
  verifiedCanonicalTextBindings: number;
  sourceCoverageReady: boolean;
}

export interface BindingCoverageAudit {
  segments: SegmentBindingCoverage[];
  universalRequirements: number;
  universalRequirementsWithVerifiedSource: number;
  universalRequirementsWithVerifiedCanonicalText: number;
  canClaimUniversalSourceCoverage: boolean;
  canClaimUniversalCanonicalTextCoverage: boolean;
}

/**
 * Misura la copertura soltanto rispetto ai requisiti già risolti come
 * applicabili alla coorte/contesto. Il chiamante deve quindi applicare prima il
 * resolver di transizione e le eventuali condizioni di attivazione.
 */
export function auditBindingCoverage(
  applicableRequirements: readonly NationalCurriculumRequirement[],
  bindings: readonly NationalCurriculumElementBinding[],
): BindingCoverageAudit {
  const universal = applicableRequirements.filter(
    (requirement) => requirement.applicability === 'UNIVERSAL',
  );

  const segments = universal.map((requirement): SegmentBindingCoverage => {
    const segmentBindings = bindings.filter(
      (binding) =>
        binding.segmentId === requirement.segmentId &&
        binding.schoolOrder === requirement.schoolOrder,
    );
    const assessments = segmentBindings.map(assessElementBinding);
    const verifiedBindings = assessments.filter(
      (assessment) => assessment.canTreatAsSourceVerified,
    ).length;
    const verifiedCanonicalTextBindings = assessments.filter(
      (assessment) => assessment.canUseAsCanonicalSourceText,
    ).length;

    return {
      requirementId: requirement.requirementId,
      segmentId: requirement.segmentId,
      schoolOrder: requirement.schoolOrder,
      applicable: true,
      locatedBindings: segmentBindings.filter(
        (binding) => binding.sourceBindingStatus !== 'LOCATOR_REQUIRED',
      ).length,
      verifiedBindings,
      verifiedCanonicalTextBindings,
      sourceCoverageReady: verifiedBindings > 0,
    };
  });

  const universalRequirementsWithVerifiedSource = segments.filter(
    (segment) => segment.verifiedBindings > 0,
  ).length;
  const universalRequirementsWithVerifiedCanonicalText = segments.filter(
    (segment) => segment.verifiedCanonicalTextBindings > 0,
  ).length;

  return {
    segments,
    universalRequirements: universal.length,
    universalRequirementsWithVerifiedSource,
    universalRequirementsWithVerifiedCanonicalText,
    canClaimUniversalSourceCoverage:
      universal.length > 0 && universalRequirementsWithVerifiedSource === universal.length,
    canClaimUniversalCanonicalTextCoverage:
      universal.length > 0 &&
      universalRequirementsWithVerifiedCanonicalText === universal.length,
  };
}
