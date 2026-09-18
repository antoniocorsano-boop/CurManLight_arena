import type {
  CurriculumUnitReference,
  ExternalNormativeRevisionTrigger,
  ExternalNormativeSourceType,
  ImplementationObservation,
  ImplementationSignal,
  InstituteNeedRevisionTrigger,
  PeriodicReviewRevisionTrigger,
  PracticeRevisionTrigger,
  RevisionTrigger,
} from '../../types/curriculum';

export const PRACTICE_TRIGGER_ELIGIBLE_SIGNALS: readonly ImplementationSignal[] = [
  'TOO_EARLY',
  'TOO_LATE',
  'DUPLICATED',
  'MISSING_PREREQUISITE',
  'WEAK_EVIDENCE',
  'UNSUSTAINABLE_LOAD',
  'OTHER',
] as const;

export interface PracticeTriggerQualification {
  qualified: boolean;
  basis?: PracticeRevisionTrigger['qualificationBasis'];
  recurringSignal?: ImplementationSignal;
  recurringCount: number;
  relatedObservations: ImplementationObservation[];
}

const normalizeText = (value: string | undefined, maxLength = 800): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
};

const requireText = (value: string | undefined, errorCode: string, maxLength = 800): string => {
  const normalized = normalizeText(value, maxLength);
  if (!normalized) throw new Error(errorCode);
  return normalized;
};

const assertCurrentMasterReference = (curriculumUnit: CurriculumUnitReference): void => {
  if (
    curriculumUnit.masterId !== 'CAN-CURR-MASTER-00'
    || !normalizeText(curriculumUnit.masterDriveFileId)
    || !normalizeText(curriculumUnit.masterVersion)
    || !normalizeText(curriculumUnit.unitKey)
  ) {
    throw new Error('CURRENT_MASTER_REFERENCE_REQUIRED');
  }
};

const buildCommonFields = (
  curriculumUnit: CurriculumUnitReference,
  recordedAt: string,
  professionalReason?: string,
  signal?: ImplementationSignal,
) => {
  assertCurrentMasterReference(curriculumUnit);
  return {
    recordedAt,
    applicability: {
      order: curriculumUnit.order,
      classOrAgeBand: curriculumUnit.classOrAgeBand,
      disciplineOrField: curriculumUnit.disciplineOrField,
    },
    potentialCurriculumScope: {
      curriculumUnitKey: curriculumUnit.unitKey,
      signal,
    },
    qualificationState: 'QUALIFIED_FOR_TARGETED_REVIEW' as const,
    professionalReason,
    currentMaster: {
      id: curriculumUnit.masterId,
      driveFileId: curriculumUnit.masterDriveFileId,
      version: curriculumUnit.masterVersion,
    },
    cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM' as const,
    automaticCurriculumChange: false as const,
    automaticReviewCaseOpening: false as const,
    parallelCurriculumBaselineCreation: false as const,
  };
};

export function collectObservationsForCurriculumUnit(
  observations: ImplementationObservation[],
  curriculumUnitKey: string,
): ImplementationObservation[] {
  return observations.filter((observation) => observation.curriculumUnit.unitKey === curriculumUnitKey);
}

export function qualifyPracticeSignal(
  observations: ImplementationObservation[],
  curriculumUnitKey: string,
  explicitProfessionalReason?: string,
): PracticeTriggerQualification {
  const relatedObservations = collectObservationsForCurriculumUnit(observations, curriculumUnitKey);
  const counts = new Map<ImplementationSignal, number>();

  for (const observation of relatedObservations) {
    if (!PRACTICE_TRIGGER_ELIGIBLE_SIGNALS.includes(observation.signal)) continue;
    counts.set(observation.signal, (counts.get(observation.signal) ?? 0) + 1);
  }

  let recurringSignal: ImplementationSignal | undefined;
  let recurringCount = 0;
  for (const [signal, count] of counts.entries()) {
    if (count > recurringCount) {
      recurringSignal = signal;
      recurringCount = count;
    }
  }

  if (recurringSignal && recurringCount >= 2) {
    return {
      qualified: true,
      basis: 'AGGREGATED_PRACTICE_SIGNAL',
      recurringSignal,
      recurringCount,
      relatedObservations,
    };
  }

  if (normalizeText(explicitProfessionalReason)) {
    return {
      qualified: true,
      basis: 'EXPLICIT_PROFESSIONAL_REASON',
      recurringSignal,
      recurringCount,
      relatedObservations,
    };
  }

  return {
    qualified: false,
    recurringSignal,
    recurringCount,
    relatedObservations,
  };
}

export interface BuildPracticeRevisionTriggerInput {
  observations: ImplementationObservation[];
  curriculumUnitKey: string;
  explicitProfessionalReason?: string;
  recordedAt?: string;
}

export function buildPracticeRevisionTrigger({
  observations,
  curriculumUnitKey,
  explicitProfessionalReason,
  recordedAt = new Date().toISOString(),
}: BuildPracticeRevisionTriggerInput): PracticeRevisionTrigger {
  const qualification = qualifyPracticeSignal(observations, curriculumUnitKey, explicitProfessionalReason);
  if (!qualification.qualified || !qualification.basis) {
    throw new Error('PRACTICE_SIGNAL_NOT_QUALIFIED');
  }

  const reference = qualification.relatedObservations[0];
  if (!reference) {
    throw new Error('PRACTICE_SIGNAL_WITHOUT_OBSERVATIONS');
  }

  const sameScope = qualification.relatedObservations.every((observation) => (
    observation.curriculumUnit.masterId === reference.curriculumUnit.masterId
    && observation.curriculumUnit.masterDriveFileId === reference.curriculumUnit.masterDriveFileId
    && observation.curriculumUnit.masterVersion === reference.curriculumUnit.masterVersion
    && observation.curriculumUnit.unitKey === reference.curriculumUnit.unitKey
  ));
  if (!sameScope) {
    throw new Error('MIXED_CURRICULUM_SCOPE');
  }

  const professionalReason = normalizeText(explicitProfessionalReason);
  const signal = qualification.basis === 'AGGREGATED_PRACTICE_SIGNAL'
    ? qualification.recurringSignal
    : undefined;

  return {
    id: `RT:PRACTICE:${reference.curriculumUnit.unitKey}:${recordedAt}`,
    kind: 'REVISION_TRIGGER',
    triggerType: 'PRACTICE_SIGNAL',
    originOrSource: {
      kind: 'PRACTICE_OBSERVATIONS',
      observationIds: qualification.relatedObservations.map((observation) => observation.id),
      sourceArtifactIds: [...new Set(qualification.relatedObservations.map((observation) => observation.sourceArtifact.id))],
    },
    ...buildCommonFields(reference.curriculumUnit, recordedAt, professionalReason, signal),
    qualificationBasis: qualification.basis,
  };
}

export interface BuildExternalNormativeRevisionTriggerInput {
  curriculumUnit: CurriculumUnitReference;
  sourceReference: string;
  sourceType: ExternalNormativeSourceType;
  sourceQualification: 'QUALIFIED' | 'UNQUALIFIED';
  applicabilityAssessment: string;
  recordedAt?: string;
}

export function buildExternalNormativeRevisionTrigger({
  curriculumUnit,
  sourceReference,
  sourceType,
  sourceQualification,
  applicabilityAssessment,
  recordedAt = new Date().toISOString(),
}: BuildExternalNormativeRevisionTriggerInput): ExternalNormativeRevisionTrigger {
  if (sourceQualification !== 'QUALIFIED') {
    throw new Error('EXTERNAL_NORMATIVE_SOURCE_NOT_QUALIFIED');
  }
  const normalizedSourceReference = requireText(sourceReference, 'EXTERNAL_NORMATIVE_SOURCE_REQUIRED');
  const normalizedApplicability = requireText(
    applicabilityAssessment,
    'EXTERNAL_NORMATIVE_APPLICABILITY_REQUIRED',
    1200,
  );

  return {
    id: `RT:NORMATIVE:${curriculumUnit.unitKey}:${recordedAt}`,
    kind: 'REVISION_TRIGGER',
    triggerType: 'EXTERNAL_NORMATIVE',
    originOrSource: {
      kind: 'EXTERNAL_NORMATIVE_SOURCE',
      sourceReference: normalizedSourceReference,
      sourceType,
      sourceQualification: 'QUALIFIED',
      applicabilityAssessment: normalizedApplicability,
    },
    ...buildCommonFields(curriculumUnit, recordedAt),
    qualificationBasis: 'QUALIFIED_EXTERNAL_NORMATIVE_SOURCE',
  };
}

export interface BuildInstituteNeedRevisionTriggerInput {
  curriculumUnit: CurriculumUnitReference;
  needReference: string;
  needStatement: string;
  declaredNonNational: boolean;
  recordedAt?: string;
}

export function buildInstituteNeedRevisionTrigger({
  curriculumUnit,
  needReference,
  needStatement,
  declaredNonNational,
  recordedAt = new Date().toISOString(),
}: BuildInstituteNeedRevisionTriggerInput): InstituteNeedRevisionTrigger {
  if (!declaredNonNational) {
    throw new Error('INSTITUTE_NEED_MUST_REMAIN_NON_NATIONAL');
  }
  const normalizedReference = requireText(needReference, 'INSTITUTE_NEED_REFERENCE_REQUIRED');
  const normalizedNeed = requireText(needStatement, 'INSTITUTE_NEED_REQUIRED', 1200);

  return {
    id: `RT:INSTITUTE:${curriculumUnit.unitKey}:${recordedAt}`,
    kind: 'REVISION_TRIGGER',
    triggerType: 'INSTITUTE_NEED',
    originOrSource: {
      kind: 'INSTITUTE_NEED',
      needReference: normalizedReference,
      needStatement: normalizedNeed,
      nationalSource: false,
    },
    ...buildCommonFields(curriculumUnit, recordedAt, normalizedNeed),
    qualificationBasis: 'EXPLICIT_INSTITUTE_NEED',
    professionalReason: normalizedNeed,
  };
}

export interface BuildPeriodicReviewRevisionTriggerInput {
  curriculumUnit: CurriculumUnitReference;
  reviewCycle: 'ANNUAL' | 'MULTIYEAR' | 'OTHER';
  reviewReason: string;
  recordedAt?: string;
}

export function buildPeriodicReviewRevisionTrigger({
  curriculumUnit,
  reviewCycle,
  reviewReason,
  recordedAt = new Date().toISOString(),
}: BuildPeriodicReviewRevisionTriggerInput): PeriodicReviewRevisionTrigger {
  const normalizedReason = requireText(reviewReason, 'PERIODIC_REVIEW_REASON_REQUIRED', 1200);

  return {
    id: `RT:PERIODIC:${curriculumUnit.unitKey}:${recordedAt}`,
    kind: 'REVISION_TRIGGER',
    triggerType: 'PERIODIC_REVIEW',
    originOrSource: {
      kind: 'PERIODIC_REVIEW',
      reviewCycle,
    },
    ...buildCommonFields(curriculumUnit, recordedAt, normalizedReason),
    qualificationBasis: 'PERIODIC_REVIEW_WITH_EXPLICIT_REASON',
    professionalReason: normalizedReason,
  };
}

export function isQualifiedRevisionTrigger(trigger: RevisionTrigger): boolean {
  return trigger.qualificationState === 'QUALIFIED_FOR_TARGETED_REVIEW'
    && trigger.currentMaster.id === 'CAN-CURR-MASTER-00'
    && trigger.cycleReentryPhase === 'H1_APPLICABLE_CURRICULUM'
    && trigger.automaticCurriculumChange === false
    && trigger.automaticReviewCaseOpening === false
    && trigger.parallelCurriculumBaselineCreation === false;
}
