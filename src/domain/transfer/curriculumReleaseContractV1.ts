import {
  CML_CURRICULUM_CONTEXT_CONTRACT,
  CML_LOCAL_HANDOFF_FORMAT_V2,
  validateCmlLocalHandoffV2,
  type CmlLocalHandoffV2,
  type CurriculumApprovalState,
  type CurriculumRequirementAuthority,
  type CurriculumRequirementKind,
} from './interopCurriculumContextV2';
import {
  CML_INTEROP_PRIVACY_CLASS,
  type CmlCanonicalRef,
} from './interopV1';

/**
 * C2P-02 / C1 semantic profile.
 *
 * This is deliberately a projection of CML_LOCAL_HANDOFF_V2, not a second
 * transport or persistence model. The serialized handoff remains unchanged
 * until the Docente OS receiver tranche is explicitly activated.
 */
export const CML_CURRICULUM_RELEASE_CONTRACT_V1 = 'CML_CURRICULUM_RELEASE_CONTRACT_V1' as const;
export const CML_CURRICULUM_RELEASE_CONTRACT_VERSION = 1 as const;

export interface CurriculumReleaseApplicabilityContextV1 {
  readonly institutionRef: CmlCanonicalRef;
  readonly schoolYearRef: string;
  readonly disciplineRef: string;
  readonly gradeRef: string;
  readonly sectionRef?: string;
  readonly cohortRef?: string;
  readonly applicabilityStatus: 'APPLICABLE' | 'TRANSITIONAL';
  readonly transitionRuleRef: CmlCanonicalRef;
}

export interface CurriculumReleaseRequirementRefV1 {
  readonly requirementId: string;
  readonly kind: CurriculumRequirementKind;
  readonly authorityLevel: CurriculumRequirementAuthority;
  readonly curriculumNodeRef: CmlCanonicalRef;
  readonly coverageRequired: boolean;
  readonly sourceRefs: readonly CmlCanonicalRef[];
  readonly transitionOriginRef?: CmlCanonicalRef;
}

export interface CurriculumReleaseContractV1 {
  readonly contract: typeof CML_CURRICULUM_RELEASE_CONTRACT_V1;
  readonly contractVersion: typeof CML_CURRICULUM_RELEASE_CONTRACT_VERSION;
  readonly sourceHandoffFormat: typeof CML_LOCAL_HANDOFF_FORMAT_V2;
  readonly sourceContextContract: typeof CML_CURRICULUM_CONTEXT_CONTRACT;

  readonly curriculumId: CmlCanonicalRef;
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly authorityState: CurriculumApprovalState;
  readonly authorityReceiptRef?: CmlCanonicalRef;

  readonly structuralFingerprint: CmlLocalHandoffV2['structuralFootprint'];
  readonly applicabilityContext: CurriculumReleaseApplicabilityContextV1;
  readonly provenanceRefs: readonly CmlCanonicalRef[];

  readonly planningSemantics: {
    readonly requirements: readonly CurriculumReleaseRequirementRefV1[];
    readonly nodeRefs: readonly CmlCanonicalRef[];
  };

  readonly issuedAt: string;
  readonly privacyClass: typeof CML_INTEROP_PRIVACY_CLASS;
  readonly downstreamPolicy: {
    readonly targetProduct: 'DOCENTE_OS';
    readonly importMode: 'PREVIEW_ONLY';
    readonly acceptanceRequired: true;
    readonly automaticWriteAllowed: false;
  };
}

export interface CurriculumReleaseContractValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validRef(value: unknown): value is CmlCanonicalRef {
  return isRecord(value)
    && nonEmpty(value.namespace)
    && nonEmpty(value.entityType)
    && nonEmpty(value.entityId)
    && (value.versionId === undefined || nonEmpty(value.versionId));
}

function refKey(ref: CmlCanonicalRef): string {
  return `${ref.namespace}|${ref.entityType}|${ref.entityId}|${ref.versionId ?? ''}`;
}

function sameRef(a: CmlCanonicalRef, b: CmlCanonicalRef): boolean {
  return refKey(a) === refKey(b);
}

function dedupeRefs(refs: readonly CmlCanonicalRef[]): readonly CmlCanonicalRef[] {
  const seen = new Set<string>();
  const result: CmlCanonicalRef[] = [];
  for (const ref of refs) {
    const key = refKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(ref);
  }
  return result;
}

function projectProvenanceRefs(handoff: CmlLocalHandoffV2): readonly CmlCanonicalRef[] {
  return dedupeRefs([
    ...handoff.curricularContext.sourceRefs,
    ...handoff.curricularContext.transitionRemodulation.sourceRefs,
    ...handoff.curricularContext.requirements.flatMap(requirement => requirement.sourceRefs),
    ...handoff.annualPlanningFramework.provenance.sourceRefs,
  ]);
}

function projectNodeRefs(handoff: CmlLocalHandoffV2): readonly CmlCanonicalRef[] {
  return dedupeRefs([
    ...handoff.curricularContext.requirements.map(requirement => requirement.curriculumNodeRef),
    ...handoff.annualPlanningFramework.payload.periods.flatMap(period => period.suggestedNodeRefs),
  ]);
}

export function createCurriculumReleaseContractV1(handoff: CmlLocalHandoffV2): CurriculumReleaseContractV1 {
  const handoffValidation = validateCmlLocalHandoffV2(handoff);
  if (!handoffValidation.valid) {
    throw new Error(`Cannot project C1 release from invalid handoff v2: ${handoffValidation.errors.join('; ')}`);
  }

  const context = handoff.curricularContext;
  const release: CurriculumReleaseContractV1 = {
    contract: CML_CURRICULUM_RELEASE_CONTRACT_V1,
    contractVersion: CML_CURRICULUM_RELEASE_CONTRACT_VERSION,
    sourceHandoffFormat: CML_LOCAL_HANDOFF_FORMAT_V2,
    sourceContextContract: CML_CURRICULUM_CONTEXT_CONTRACT,
    curriculumId: context.curriculumRef,
    curriculumVersionRef: context.curriculumVersionRef,
    authorityState: context.curriculumState,
    ...(context.approvalDecisionRef ? { authorityReceiptRef: context.approvalDecisionRef } : {}),
    structuralFingerprint: handoff.structuralFootprint,
    applicabilityContext: {
      institutionRef: context.institutionRef,
      schoolYearRef: context.schoolYearRef,
      disciplineRef: context.disciplineRef,
      gradeRef: context.gradeRef,
      ...(context.sectionRef ? { sectionRef: context.sectionRef } : {}),
      ...(context.cohortRef ? { cohortRef: context.cohortRef } : {}),
      applicabilityStatus: context.applicabilityStatus,
      transitionRuleRef: context.transitionRuleRef,
    },
    provenanceRefs: projectProvenanceRefs(handoff),
    planningSemantics: {
      requirements: context.requirements.map(requirement => ({
        requirementId: requirement.requirementId,
        kind: requirement.kind,
        authorityLevel: requirement.authorityLevel,
        curriculumNodeRef: requirement.curriculumNodeRef,
        coverageRequired: requirement.coverageRequired,
        sourceRefs: requirement.sourceRefs,
        ...(requirement.transitionOriginRef ? { transitionOriginRef: requirement.transitionOriginRef } : {}),
      })),
      nodeRefs: projectNodeRefs(handoff),
    },
    issuedAt: handoff.generatedAt,
    privacyClass: CML_INTEROP_PRIVACY_CLASS,
    downstreamPolicy: {
      targetProduct: 'DOCENTE_OS',
      importMode: 'PREVIEW_ONLY',
      acceptanceRequired: true,
      automaticWriteAllowed: false,
    },
  };

  const validation = validateCurriculumReleaseContractV1(release, handoff);
  if (!validation.valid) {
    throw new Error(`Projected C1 release is invalid: ${validation.errors.join('; ')}`);
  }
  return release;
}

export function validateCurriculumReleaseContractV1(
  input: unknown,
  sourceHandoff?: CmlLocalHandoffV2,
): CurriculumReleaseContractValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { valid: false, errors: ['release must be an object'] };

  if (input.contract !== CML_CURRICULUM_RELEASE_CONTRACT_V1) errors.push('unsupported curriculum release contract');
  if (input.contractVersion !== CML_CURRICULUM_RELEASE_CONTRACT_VERSION) errors.push('unsupported curriculum release contractVersion');
  if (input.sourceHandoffFormat !== CML_LOCAL_HANDOFF_FORMAT_V2) errors.push('release must profile CML_LOCAL_HANDOFF_V2');
  if (input.sourceContextContract !== CML_CURRICULUM_CONTEXT_CONTRACT) errors.push('release source context contract is invalid');
  if (input.privacyClass !== CML_INTEROP_PRIVACY_CLASS) errors.push('release privacyClass must remain PROFESSIONAL_NON_PERSONAL');

  if (!validRef(input.curriculumId)) errors.push('curriculumId is invalid');
  if (!validRef(input.curriculumVersionRef)) errors.push('curriculumVersionRef is invalid');
  if (input.authorityState !== 'APPROVED' && input.authorityState !== 'PROVISIONAL_COMPLETE') errors.push('authorityState is invalid');
  if (input.authorityState === 'APPROVED' && !validRef(input.authorityReceiptRef)) errors.push('APPROVED release requires authorityReceiptRef');
  if (input.authorityState === 'PROVISIONAL_COMPLETE' && input.authorityReceiptRef !== undefined) errors.push('PROVISIONAL_COMPLETE release cannot claim authorityReceiptRef');

  if (!isRecord(input.structuralFingerprint)
    || input.structuralFingerprint.algorithm !== 'fnv1a'
    || input.structuralFingerprint.version !== 1
    || !nonEmpty(input.structuralFingerprint.hash)) {
    errors.push('structuralFingerprint is invalid');
  }

  if (!isRecord(input.applicabilityContext)) {
    errors.push('applicabilityContext is required');
  } else {
    const applicability = input.applicabilityContext;
    if (!validRef(applicability.institutionRef)) errors.push('applicabilityContext.institutionRef is invalid');
    ['schoolYearRef', 'disciplineRef', 'gradeRef'].forEach(field => {
      if (!nonEmpty(applicability[field])) errors.push(`applicabilityContext.${field} is required`);
    });
    if (!nonEmpty(applicability.sectionRef) && !nonEmpty(applicability.cohortRef)) errors.push('applicabilityContext requires sectionRef or cohortRef');
    if (applicability.applicabilityStatus !== 'APPLICABLE' && applicability.applicabilityStatus !== 'TRANSITIONAL') errors.push('applicabilityContext.applicabilityStatus is invalid');
    if (!validRef(applicability.transitionRuleRef)) errors.push('applicabilityContext.transitionRuleRef is invalid');
  }

  if (!Array.isArray(input.provenanceRefs) || input.provenanceRefs.length === 0) {
    errors.push('provenanceRefs must contain at least one canonical reference');
  } else {
    input.provenanceRefs.forEach((ref, index) => {
      if (!validRef(ref)) errors.push(`provenanceRefs[${index}] is invalid`);
    });
  }

  if (!isRecord(input.planningSemantics)) {
    errors.push('planningSemantics is required');
  } else {
    if (!Array.isArray(input.planningSemantics.requirements) || input.planningSemantics.requirements.length === 0) errors.push('planningSemantics.requirements must not be empty');
    if (!Array.isArray(input.planningSemantics.nodeRefs) || input.planningSemantics.nodeRefs.length === 0) errors.push('planningSemantics.nodeRefs must not be empty');
    else input.planningSemantics.nodeRefs.forEach((ref, index) => {
      if (!validRef(ref)) errors.push(`planningSemantics.nodeRefs[${index}] is invalid`);
    });
  }

  if (!nonEmpty(input.issuedAt) || Number.isNaN(Date.parse(input.issuedAt))) errors.push('issuedAt must be an ISO-compatible date');

  if (!isRecord(input.downstreamPolicy)) {
    errors.push('downstreamPolicy is required');
  } else {
    if (input.downstreamPolicy.targetProduct !== 'DOCENTE_OS') errors.push('downstreamPolicy.targetProduct must be DOCENTE_OS');
    if (input.downstreamPolicy.importMode !== 'PREVIEW_ONLY') errors.push('downstreamPolicy.importMode must remain PREVIEW_ONLY');
    if (input.downstreamPolicy.acceptanceRequired !== true) errors.push('downstreamPolicy.acceptanceRequired must remain true');
    if (input.downstreamPolicy.automaticWriteAllowed !== false) errors.push('downstreamPolicy.automaticWriteAllowed must remain false');
  }

  if (sourceHandoff) {
    const sourceValidation = validateCmlLocalHandoffV2(sourceHandoff);
    if (!sourceValidation.valid) {
      errors.push('source handoff v2 is invalid');
    } else {
      const context = sourceHandoff.curricularContext;
      if (validRef(input.curriculumId) && !sameRef(input.curriculumId, context.curriculumRef)) errors.push('curriculumId does not match source handoff');
      if (validRef(input.curriculumVersionRef) && !sameRef(input.curriculumVersionRef, context.curriculumVersionRef)) errors.push('curriculumVersionRef does not match source handoff');
      if (input.authorityState !== context.curriculumState) errors.push('authorityState does not match source handoff');
      if (context.approvalDecisionRef) {
        if (!validRef(input.authorityReceiptRef) || !sameRef(input.authorityReceiptRef, context.approvalDecisionRef)) errors.push('authorityReceiptRef does not match source handoff');
      } else if (input.authorityReceiptRef !== undefined) {
        errors.push('source handoff has no authority receipt');
      }
      if (isRecord(input.structuralFingerprint)
        && input.structuralFingerprint.hash !== sourceHandoff.structuralFootprint.hash) errors.push('structuralFingerprint does not match source handoff');
      if (input.issuedAt !== sourceHandoff.generatedAt) errors.push('issuedAt does not match source handoff');
    }
  }

  return { valid: errors.length === 0, errors };
}
