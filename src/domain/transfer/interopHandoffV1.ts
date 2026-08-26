import { computeStructuralFootprint } from './signatures';
import {
  type AnnualPlanningFrameworkPayload,
  type CmlInteropEnvelope,
  type CurriculumAdoptedPayload,
  validateCmlInteropEnvelope,
} from './interopV1';

export const CML_LOCAL_HANDOFF_FORMAT = 'CML_LOCAL_HANDOFF_V1' as const;

export interface CmlLocalHandoffV1 {
  readonly format: typeof CML_LOCAL_HANDOFF_FORMAT;
  readonly targetProduct: 'DOCENTE_OS';
  readonly acceptanceRequired: true;
  readonly importMode: 'PREVIEW_ONLY';
  readonly generatedAt: string;
  readonly curriculumAdopted: CmlInteropEnvelope<CurriculumAdoptedPayload>;
  readonly annualPlanningFramework: CmlInteropEnvelope<AnnualPlanningFrameworkPayload>;
  readonly structuralFootprint: {
    readonly algorithm: 'fnv1a';
    readonly version: 1;
    readonly hash: string;
  };
}

export interface CmlLocalHandoffValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function sameRef(a: { namespace: string; entityType: string; entityId: string; versionId?: string }, b: { namespace: string; entityType: string; entityId: string; versionId?: string }): boolean {
  return a.namespace === b.namespace
    && a.entityType === b.entityType
    && a.entityId === b.entityId
    && a.versionId === b.versionId;
}

function footprintMaterial(handoff: Omit<CmlLocalHandoffV1, 'structuralFootprint'>): Record<string, unknown> {
  return {
    format: handoff.format,
    targetProduct: handoff.targetProduct,
    acceptanceRequired: handoff.acceptanceRequired,
    importMode: handoff.importMode,
    curriculumAdopted: handoff.curriculumAdopted,
    annualPlanningFramework: handoff.annualPlanningFramework,
  };
}

export function createCmlLocalHandoffV1(input: {
  readonly curriculumAdopted: CmlInteropEnvelope<CurriculumAdoptedPayload>;
  readonly annualPlanningFramework: CmlInteropEnvelope<AnnualPlanningFrameworkPayload>;
  readonly generatedAt?: string;
}): CmlLocalHandoffV1 {
  const candidateWithoutFootprint: Omit<CmlLocalHandoffV1, 'structuralFootprint'> = {
    format: CML_LOCAL_HANDOFF_FORMAT,
    targetProduct: 'DOCENTE_OS',
    acceptanceRequired: true,
    importMode: 'PREVIEW_ONLY',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    curriculumAdopted: input.curriculumAdopted,
    annualPlanningFramework: input.annualPlanningFramework,
  };

  const validation = validateCmlLocalHandoffV1({
    ...candidateWithoutFootprint,
    structuralFootprint: { algorithm: 'fnv1a', version: 1, hash: 'pending' },
  }, { skipFootprint: true });

  if (!validation.valid) {
    throw new Error(`CML local handoff rejected: ${validation.errors.join('; ')}`);
  }

  const footprint = computeStructuralFootprint(footprintMaterial(candidateWithoutFootprint));
  return {
    ...candidateWithoutFootprint,
    structuralFootprint: {
      algorithm: footprint.algorithm,
      version: footprint.version,
      hash: footprint.hash,
    },
  };
}

export function validateCmlLocalHandoffV1(
  input: unknown,
  options: { readonly skipFootprint?: boolean } = {},
): CmlLocalHandoffValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['handoff must be an object'] };
  }

  const handoff = input as Partial<CmlLocalHandoffV1>;
  if (handoff.format !== CML_LOCAL_HANDOFF_FORMAT) errors.push('unsupported handoff format');
  if (handoff.targetProduct !== 'DOCENTE_OS') errors.push('targetProduct must be DOCENTE_OS');
  if (handoff.acceptanceRequired !== true) errors.push('teacher acceptance must be required');
  if (handoff.importMode !== 'PREVIEW_ONLY') errors.push('importMode must remain PREVIEW_ONLY');
  if (typeof handoff.generatedAt !== 'string' || Number.isNaN(Date.parse(handoff.generatedAt))) errors.push('generatedAt must be an ISO-compatible date');

  const adoptedValidation = validateCmlInteropEnvelope(handoff.curriculumAdopted);
  if (!adoptedValidation.valid) errors.push(...adoptedValidation.errors.map(error => `curriculumAdopted:${error.code}:${error.field}`));
  const frameworkValidation = validateCmlInteropEnvelope(handoff.annualPlanningFramework);
  if (!frameworkValidation.valid) errors.push(...frameworkValidation.errors.map(error => `annualPlanningFramework:${error.code}:${error.field}`));

  if (handoff.curriculumAdopted?.messageType !== 'CURRICULUM_ADOPTED') errors.push('curriculumAdopted messageType is invalid');
  if (handoff.annualPlanningFramework?.messageType !== 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE') errors.push('annualPlanningFramework messageType is invalid');
  if (handoff.curriculumAdopted?.sourceProduct !== 'CURMANLIGHT_ARENA' || handoff.annualPlanningFramework?.sourceProduct !== 'CURMANLIGHT_ARENA') errors.push('both messages must originate from CURMANLIGHT_ARENA');

  const adoptedPayload = handoff.curriculumAdopted?.payload as CurriculumAdoptedPayload | undefined;
  const frameworkPayload = handoff.annualPlanningFramework?.payload as AnnualPlanningFrameworkPayload | undefined;
  if (adoptedPayload && frameworkPayload) {
    if (!sameRef(adoptedPayload.curriculumVersionRef, frameworkPayload.curriculumVersionRef)) errors.push('curriculumVersionRef mismatch');
    if (adoptedPayload.disciplineRef !== frameworkPayload.disciplineRef) errors.push('disciplineRef mismatch');
    if (adoptedPayload.gradeRef !== frameworkPayload.gradeRef) errors.push('gradeRef mismatch');
  }

  if (!options.skipFootprint) {
    if (!handoff.structuralFootprint || handoff.structuralFootprint.algorithm !== 'fnv1a' || handoff.structuralFootprint.version !== 1 || !handoff.structuralFootprint.hash) {
      errors.push('structuralFootprint is invalid');
    } else {
      const material: Omit<CmlLocalHandoffV1, 'structuralFootprint'> = {
        format: handoff.format as typeof CML_LOCAL_HANDOFF_FORMAT,
        targetProduct: handoff.targetProduct as 'DOCENTE_OS',
        acceptanceRequired: handoff.acceptanceRequired as true,
        importMode: handoff.importMode as 'PREVIEW_ONLY',
        generatedAt: handoff.generatedAt as string,
        curriculumAdopted: handoff.curriculumAdopted as CmlInteropEnvelope<CurriculumAdoptedPayload>,
        annualPlanningFramework: handoff.annualPlanningFramework as CmlInteropEnvelope<AnnualPlanningFrameworkPayload>,
      };
      const expected = computeStructuralFootprint(footprintMaterial(material));
      if (expected.hash !== handoff.structuralFootprint.hash) errors.push('structuralFootprint mismatch');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function serializeCmlLocalHandoffV1(handoff: CmlLocalHandoffV1): string {
  const validation = validateCmlLocalHandoffV1(handoff);
  if (!validation.valid) throw new Error(`Cannot serialize invalid CML local handoff: ${validation.errors.join('; ')}`);
  return JSON.stringify(handoff, null, 2);
}

export function parseCmlLocalHandoffV1(serialized: string): CmlLocalHandoffV1 {
  const parsed: unknown = JSON.parse(serialized);
  const validation = validateCmlLocalHandoffV1(parsed);
  if (!validation.valid) throw new Error(`CML local handoff rejected: ${validation.errors.join('; ')}`);
  return parsed as CmlLocalHandoffV1;
}
