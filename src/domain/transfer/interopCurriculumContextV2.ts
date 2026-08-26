import { computeStructuralFootprint } from './signatures';
import {
  type AnnualPlanningFrameworkPayload,
  type CmlCanonicalRef,
  type CmlInteropEnvelope,
  validateCmlInteropEnvelope,
} from './interopV1';

export const CML_LOCAL_HANDOFF_FORMAT_V2 = 'CML_LOCAL_HANDOFF_V2' as const;
export const CML_CURRICULUM_CONTEXT_CONTRACT = 'CML_CURRICULUM_CONTEXT_V1' as const;

export type CurriculumApprovalState = 'APPROVED' | 'PROVISIONAL_COMPLETE';
export type CurriculumApplicabilityStatus = 'APPLICABLE' | 'TRANSITIONAL';
export type TransitionRemodulationState = 'NOT_REQUIRED' | 'HYPOTHESIS' | 'APPROVED';
export type CurriculumRequirementAuthority =
  | 'NATIONAL_PRESCRIPTIVE'
  | 'INSTITUTIONAL_REQUIRED'
  | 'TRANSITION_REQUIRED'
  | 'RECOMMENDED';
export type CurriculumRequirementKind =
  | 'COMPETENCE'
  | 'GENERAL_OBJECTIVE'
  | 'SPECIFIC_LEARNING_OBJECTIVE'
  | 'ESSENTIAL_KNOWLEDGE'
  | 'INSTITUTIONAL_REQUIREMENT';

export interface CurriculumRequirementV1 {
  readonly requirementId: string;
  readonly kind: CurriculumRequirementKind;
  readonly authorityLevel: CurriculumRequirementAuthority;
  readonly curriculumNodeRef: CmlCanonicalRef;
  readonly description: string;
  readonly coverageRequired: boolean;
  readonly sourceRefs: readonly CmlCanonicalRef[];
  readonly transitionOriginRef?: CmlCanonicalRef;
}

export interface TransitionRemodulationV1 {
  readonly state: TransitionRemodulationState;
  readonly rationale: string;
  readonly sourceRefs: readonly CmlCanonicalRef[];
  readonly affectedRequirementIds: readonly string[];
  readonly usableForPlanning: boolean;
  readonly institutionallyApproved: boolean;
  readonly proposalRef?: CmlCanonicalRef;
  readonly approvalDecisionRef?: CmlCanonicalRef;
}

export interface CurriculumContextForClassV1 {
  readonly contract: typeof CML_CURRICULUM_CONTEXT_CONTRACT;
  readonly contextId: string;
  readonly institutionRef: CmlCanonicalRef;
  readonly schoolYearRef: string;
  readonly disciplineRef: string;
  readonly gradeRef: string;
  readonly sectionRef?: string;
  readonly cohortRef?: string;
  readonly curriculumRef: CmlCanonicalRef;
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly curriculumState: CurriculumApprovalState;
  readonly approvalProcessRef: CmlCanonicalRef;
  readonly approvalDecisionRef?: CmlCanonicalRef;
  readonly applicabilityStatus: CurriculumApplicabilityStatus;
  readonly transitionRuleRef: CmlCanonicalRef;
  readonly completeForPlanning: true;
  readonly requirements: readonly CurriculumRequirementV1[];
  readonly transitionRemodulation: TransitionRemodulationV1;
  readonly sourceRefs: readonly CmlCanonicalRef[];
}

export interface CmlLocalHandoffV2 {
  readonly format: typeof CML_LOCAL_HANDOFF_FORMAT_V2;
  readonly targetProduct: 'DOCENTE_OS';
  readonly acceptanceRequired: true;
  readonly importMode: 'PREVIEW_ONLY';
  readonly generatedAt: string;
  readonly curricularContext: CurriculumContextForClassV1;
  readonly annualPlanningFramework: CmlInteropEnvelope<AnnualPlanningFrameworkPayload>;
  readonly structuralFootprint: {
    readonly algorithm: 'fnv1a';
    readonly version: 1;
    readonly hash: string;
  };
}

export interface CmlLocalHandoffV2ValidationResult {
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

function sameRef(a: CmlCanonicalRef, b: CmlCanonicalRef): boolean {
  return a.namespace === b.namespace
    && a.entityType === b.entityType
    && a.entityId === b.entityId
    && (a.versionId ?? null) === (b.versionId ?? null);
}

function validateRefArray(value: unknown, field: string, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${field} must contain at least one canonical reference`);
    return;
  }
  value.forEach((entry, index) => {
    if (!validRef(entry)) errors.push(`${field}[${index}] is invalid`);
  });
}

export function validateCurriculumContextForClassV1(input: unknown): CmlLocalHandoffV2ValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { valid: false, errors: ['curricularContext must be an object'] };

  if (input.contract !== CML_CURRICULUM_CONTEXT_CONTRACT) errors.push('unsupported curricular context contract');
  ['contextId', 'schoolYearRef', 'disciplineRef', 'gradeRef'].forEach(field => {
    if (!nonEmpty(input[field])) errors.push(`${field} is required`);
  });
  if (!nonEmpty(input.sectionRef) && !nonEmpty(input.cohortRef)) errors.push('sectionRef or cohortRef is required');
  ['institutionRef', 'curriculumRef', 'curriculumVersionRef', 'approvalProcessRef', 'transitionRuleRef'].forEach(field => {
    if (!validRef(input[field])) errors.push(`${field} is invalid`);
  });

  if (input.curriculumState !== 'APPROVED' && input.curriculumState !== 'PROVISIONAL_COMPLETE') errors.push('curriculumState is invalid');
  if (input.curriculumState === 'APPROVED' && !validRef(input.approvalDecisionRef)) errors.push('approved curriculum requires approvalDecisionRef');
  if (input.curriculumState === 'PROVISIONAL_COMPLETE' && input.approvalDecisionRef !== undefined) errors.push('provisional curriculum cannot claim approvalDecisionRef');
  if (input.applicabilityStatus !== 'APPLICABLE' && input.applicabilityStatus !== 'TRANSITIONAL') errors.push('applicabilityStatus is invalid');
  if (input.completeForPlanning !== true) errors.push('curriculum context must be completeForPlanning');

  if (!Array.isArray(input.requirements) || input.requirements.length === 0) {
    errors.push('requirements must contain at least one curricular requirement');
  } else {
    const seen = new Set<string>();
    input.requirements.forEach((candidate, index) => {
      if (!isRecord(candidate)) {
        errors.push(`requirements[${index}] is invalid`);
        return;
      }
      if (!nonEmpty(candidate.requirementId)) errors.push(`requirements[${index}].requirementId is required`);
      else if (seen.has(candidate.requirementId)) errors.push(`duplicate requirementId ${candidate.requirementId}`);
      else seen.add(candidate.requirementId);
      if (!['COMPETENCE','GENERAL_OBJECTIVE','SPECIFIC_LEARNING_OBJECTIVE','ESSENTIAL_KNOWLEDGE','INSTITUTIONAL_REQUIREMENT'].includes(String(candidate.kind))) errors.push(`requirements[${index}].kind is invalid`);
      if (!['NATIONAL_PRESCRIPTIVE','INSTITUTIONAL_REQUIRED','TRANSITION_REQUIRED','RECOMMENDED'].includes(String(candidate.authorityLevel))) errors.push(`requirements[${index}].authorityLevel is invalid`);
      if (!validRef(candidate.curriculumNodeRef)) errors.push(`requirements[${index}].curriculumNodeRef is invalid`);
      if (!nonEmpty(candidate.description)) errors.push(`requirements[${index}].description is required`);
      if (typeof candidate.coverageRequired !== 'boolean') errors.push(`requirements[${index}].coverageRequired must be boolean`);
      if (candidate.authorityLevel !== 'RECOMMENDED' && candidate.coverageRequired !== true) errors.push(`requirements[${index}] mandatory authority requires coverageRequired=true`);
      validateRefArray(candidate.sourceRefs, `requirements[${index}].sourceRefs`, errors);
      if (candidate.authorityLevel === 'TRANSITION_REQUIRED' && !validRef(candidate.transitionOriginRef)) errors.push(`requirements[${index}].transitionOriginRef is required`);
    });
  }

  validateRefArray(input.sourceRefs, 'sourceRefs', errors);

  if (!isRecord(input.transitionRemodulation)) {
    errors.push('transitionRemodulation is required');
  } else {
    const remod = input.transitionRemodulation;
    if (!['NOT_REQUIRED','HYPOTHESIS','APPROVED'].includes(String(remod.state))) errors.push('transitionRemodulation.state is invalid');
    if (!nonEmpty(remod.rationale)) errors.push('transitionRemodulation.rationale is required');
    validateRefArray(remod.sourceRefs, 'transitionRemodulation.sourceRefs', errors);
    if (!Array.isArray(remod.affectedRequirementIds)) errors.push('transitionRemodulation.affectedRequirementIds must be an array');
    if (typeof remod.usableForPlanning !== 'boolean') errors.push('transitionRemodulation.usableForPlanning must be boolean');
    if (typeof remod.institutionallyApproved !== 'boolean') errors.push('transitionRemodulation.institutionallyApproved must be boolean');

    if (input.applicabilityStatus === 'TRANSITIONAL' && remod.state === 'NOT_REQUIRED') errors.push('transitional applicability requires remodulation hypothesis or approval');
    if (remod.state === 'HYPOTHESIS') {
      if (remod.institutionallyApproved !== false) errors.push('remodulation hypothesis cannot be institutionally approved');
      if (remod.usableForPlanning !== true) errors.push('remodulation hypothesis must be explicitly usableForPlanning');
      if (!validRef(remod.proposalRef)) errors.push('remodulation hypothesis requires proposalRef');
      if (remod.approvalDecisionRef !== undefined) errors.push('remodulation hypothesis cannot claim approvalDecisionRef');
    }
    if (remod.state === 'APPROVED') {
      if (remod.institutionallyApproved !== true) errors.push('approved remodulation must be institutionallyApproved');
      if (!validRef(remod.approvalDecisionRef)) errors.push('approved remodulation requires approvalDecisionRef');
    }
    if (remod.state === 'NOT_REQUIRED' && input.applicabilityStatus !== 'APPLICABLE') errors.push('NOT_REQUIRED remodulation is allowed only for APPLICABLE context');
  }

  return { valid: errors.length === 0, errors };
}

function footprintMaterial(handoff: Omit<CmlLocalHandoffV2, 'structuralFootprint'>): Record<string, unknown> {
  return {
    format: handoff.format,
    targetProduct: handoff.targetProduct,
    acceptanceRequired: handoff.acceptanceRequired,
    importMode: handoff.importMode,
    curricularContext: handoff.curricularContext,
    annualPlanningFramework: handoff.annualPlanningFramework,
  };
}

export function createCmlLocalHandoffV2(input: {
  readonly curricularContext: CurriculumContextForClassV1;
  readonly annualPlanningFramework: CmlInteropEnvelope<AnnualPlanningFrameworkPayload>;
  readonly generatedAt?: string;
}): CmlLocalHandoffV2 {
  const candidate: Omit<CmlLocalHandoffV2, 'structuralFootprint'> = {
    format: CML_LOCAL_HANDOFF_FORMAT_V2,
    targetProduct: 'DOCENTE_OS',
    acceptanceRequired: true,
    importMode: 'PREVIEW_ONLY',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    curricularContext: input.curricularContext,
    annualPlanningFramework: input.annualPlanningFramework,
  };
  const validation = validateCmlLocalHandoffV2({ ...candidate, structuralFootprint: { algorithm: 'fnv1a', version: 1, hash: 'pending' } }, { skipFootprint: true });
  if (!validation.valid) throw new Error(`CML local handoff v2 rejected: ${validation.errors.join('; ')}`);
  const footprint = computeStructuralFootprint(footprintMaterial(candidate));
  return { ...candidate, structuralFootprint: footprint };
}

export function validateCmlLocalHandoffV2(input: unknown, options: { readonly skipFootprint?: boolean } = {}): CmlLocalHandoffV2ValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { valid: false, errors: ['handoff must be an object'] };
  if (input.format !== CML_LOCAL_HANDOFF_FORMAT_V2) errors.push('unsupported handoff v2 format');
  if (input.targetProduct !== 'DOCENTE_OS') errors.push('targetProduct must be DOCENTE_OS');
  if (input.acceptanceRequired !== true) errors.push('teacher acceptance must be required');
  if (input.importMode !== 'PREVIEW_ONLY') errors.push('importMode must remain PREVIEW_ONLY');
  if (!nonEmpty(input.generatedAt) || Number.isNaN(Date.parse(input.generatedAt))) errors.push('generatedAt must be an ISO-compatible date');

  const contextValidation = validateCurriculumContextForClassV1(input.curricularContext);
  errors.push(...contextValidation.errors.map(error => `curricularContext:${error}`));

  const frameworkValidation = validateCmlInteropEnvelope(input.annualPlanningFramework);
  if (!frameworkValidation.valid) errors.push(...frameworkValidation.errors.map(error => `annualPlanningFramework:${error.code}:${error.field}`));

  if (isRecord(input.curricularContext) && isRecord(input.annualPlanningFramework) && isRecord(input.annualPlanningFramework.payload)) {
    const context = input.curricularContext as unknown as CurriculumContextForClassV1;
    const framework = input.annualPlanningFramework as unknown as CmlInteropEnvelope<AnnualPlanningFrameworkPayload>;
    if (framework.messageType !== 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE') errors.push('annualPlanningFramework messageType is invalid');
    if (framework.sourceProduct !== 'CURMANLIGHT_ARENA') errors.push('annualPlanningFramework must originate from CURMANLIGHT_ARENA');
    if (!sameRef(context.curriculumVersionRef, framework.payload.curriculumVersionRef)) errors.push('curriculumVersionRef mismatch');
    if (context.disciplineRef !== framework.payload.disciplineRef) errors.push('disciplineRef mismatch');
    if (context.gradeRef !== framework.payload.gradeRef) errors.push('gradeRef mismatch');
  }

  if (!options.skipFootprint) {
    if (!isRecord(input.structuralFootprint) || input.structuralFootprint.algorithm !== 'fnv1a' || input.structuralFootprint.version !== 1 || !nonEmpty(input.structuralFootprint.hash)) {
      errors.push('structuralFootprint is invalid');
    } else if (isRecord(input.curricularContext) && isRecord(input.annualPlanningFramework)) {
      const material: Omit<CmlLocalHandoffV2, 'structuralFootprint'> = {
        format: CML_LOCAL_HANDOFF_FORMAT_V2,
        targetProduct: 'DOCENTE_OS',
        acceptanceRequired: true,
        importMode: 'PREVIEW_ONLY',
        generatedAt: input.generatedAt as string,
        curricularContext: input.curricularContext as unknown as CurriculumContextForClassV1,
        annualPlanningFramework: input.annualPlanningFramework as unknown as CmlInteropEnvelope<AnnualPlanningFrameworkPayload>,
      };
      const expected = computeStructuralFootprint(footprintMaterial(material));
      if (expected.hash !== input.structuralFootprint.hash) errors.push('structuralFootprint mismatch');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function serializeCmlLocalHandoffV2(handoff: CmlLocalHandoffV2): string {
  const validation = validateCmlLocalHandoffV2(handoff);
  if (!validation.valid) throw new Error(`Cannot serialize invalid CML local handoff v2: ${validation.errors.join('; ')}`);
  return JSON.stringify(handoff, null, 2);
}

export function parseCmlLocalHandoffV2(serialized: string): CmlLocalHandoffV2 {
  const parsed: unknown = JSON.parse(serialized);
  const validation = validateCmlLocalHandoffV2(parsed);
  if (!validation.valid) throw new Error(`CML local handoff v2 rejected: ${validation.errors.join('; ')}`);
  return parsed as CmlLocalHandoffV2;
}
