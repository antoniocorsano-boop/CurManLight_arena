import type {
  ImplementationObservation,
  ImplementationSignal,
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
  basis?: RevisionTrigger['qualificationBasis'];
  recurringSignal?: ImplementationSignal;
  recurringCount: number;
  relatedObservations: ImplementationObservation[];
}

const normalizeReason = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 800);
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

  if (normalizeReason(explicitProfessionalReason)) {
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
}: BuildPracticeRevisionTriggerInput): RevisionTrigger {
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

  const professionalReason = normalizeReason(explicitProfessionalReason);
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
    recordedAt,
    applicability: {
      order: reference.curriculumUnit.order,
      classOrAgeBand: reference.curriculumUnit.classOrAgeBand,
      disciplineOrField: reference.curriculumUnit.disciplineOrField,
    },
    potentialCurriculumScope: {
      curriculumUnitKey: reference.curriculumUnit.unitKey,
      signal,
    },
    qualificationState: 'QUALIFIED_FOR_TARGETED_REVIEW',
    qualificationBasis: qualification.basis,
    professionalReason,
    currentMaster: {
      id: reference.curriculumUnit.masterId,
      driveFileId: reference.curriculumUnit.masterDriveFileId,
      version: reference.curriculumUnit.masterVersion,
    },
    cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM',
    automaticCurriculumChange: false,
    automaticReviewCaseOpening: false,
    parallelCurriculumBaselineCreation: false,
  };
}
