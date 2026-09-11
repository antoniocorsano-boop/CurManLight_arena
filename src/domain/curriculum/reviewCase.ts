import type {
  CurriculumReviewCase,
  CurriculumReviewCaseReadiness,
  CurriculumUnitReference,
  RevisionTrigger,
} from '../../types/curriculum';
import { isQualifiedRevisionTrigger } from './revisionTrigger';

const normalizeText = (value: string | undefined, maxLength = 1200): string | undefined => {
  const normalized = value?.trim().replace(/\s+/g, ' ');
  return normalized ? normalized.slice(0, maxLength) : undefined;
};

const sameMaster = (trigger: RevisionTrigger, curriculumUnit: CurriculumUnitReference): boolean => (
  trigger.currentMaster.id === curriculumUnit.masterId
  && trigger.currentMaster.driveFileId === curriculumUnit.masterDriveFileId
  && trigger.currentMaster.version === curriculumUnit.masterVersion
);

const sameUnitScope = (trigger: RevisionTrigger, curriculumUnit: CurriculumUnitReference): boolean => (
  trigger.potentialCurriculumScope.curriculumUnitKey === curriculumUnit.unitKey
  && trigger.applicability.order === curriculumUnit.order
  && trigger.applicability.classOrAgeBand === curriculumUnit.classOrAgeBand
  && trigger.applicability.disciplineOrField === curriculumUnit.disciplineOrField
);

export interface EvaluateCurriculumReviewCaseReadinessInput {
  trigger: RevisionTrigger;
  curriculumUnit: CurriculumUnitReference;
  availableProposalRefs: string[];
  selectedProposalRefs: string[];
  scopeReason?: string;
}

export function evaluateCurriculumReviewCaseReadiness({
  trigger,
  curriculumUnit,
  availableProposalRefs,
  selectedProposalRefs,
  scopeReason,
}: EvaluateCurriculumReviewCaseReadinessInput): CurriculumReviewCaseReadiness {
  const available = new Set(availableProposalRefs);
  const selected = [...new Set(selectedProposalRefs.filter(Boolean))];
  const checks = {
    qualifiedTrigger: isQualifiedRevisionTrigger(trigger),
    currentMasterMatch: sameMaster(trigger, curriculumUnit),
    curriculumUnitScopeMatch: sameUnitScope(trigger, curriculumUnit),
    targetedProposalSelection: selected.length > 0,
    targetedProposalsKnown: selected.length > 0 && selected.every((proposalRef) => available.has(proposalRef)),
    explicitScopeReason: Boolean(normalizeText(scopeReason)),
  };

  const blockers: CurriculumReviewCaseReadiness['blockers'] = [];
  if (!checks.qualifiedTrigger) blockers.push('TRIGGER_NOT_QUALIFIED');
  if (!checks.currentMasterMatch) blockers.push('CURRENT_MASTER_MISMATCH');
  if (!checks.curriculumUnitScopeMatch) blockers.push('CURRICULUM_UNIT_SCOPE_MISMATCH');
  if (!checks.targetedProposalSelection) blockers.push('NO_TARGETED_PROPOSALS');
  if (checks.targetedProposalSelection && !checks.targetedProposalsKnown) blockers.push('UNKNOWN_TARGETED_PROPOSAL');
  if (!checks.explicitScopeReason) blockers.push('CASE_SCOPE_REASON_REQUIRED');

  return {
    state: blockers.length === 0 ? 'READY_TO_OPEN' : 'BLOCKED',
    checks,
    blockers,
  };
}

export interface BuildCurriculumReviewCaseInput extends EvaluateCurriculumReviewCaseReadinessInput {
  existingCases?: CurriculumReviewCase[];
  openedAt?: string;
  actorId?: string;
  roleContext?: string;
}

export function buildCurriculumReviewCase({
  trigger,
  curriculumUnit,
  availableProposalRefs,
  selectedProposalRefs,
  scopeReason,
  existingCases = [],
  openedAt = new Date().toISOString(),
  actorId,
  roleContext,
}: BuildCurriculumReviewCaseInput): CurriculumReviewCase {
  const alreadyOpen = existingCases.some((reviewCase) => (
    reviewCase.originTriggerSnapshot.id === trigger.id
    && reviewCase.currentMaster.id === trigger.currentMaster.id
    && reviewCase.currentMaster.version === trigger.currentMaster.version
    && reviewCase.caseState !== 'PROFESSIONAL_REVIEW_COMPLETE'
  ));
  if (alreadyOpen) throw new Error('REVIEW_CASE_ALREADY_OPEN_FOR_TRIGGER');

  const readiness = evaluateCurriculumReviewCaseReadiness({
    trigger,
    curriculumUnit,
    availableProposalRefs,
    selectedProposalRefs,
    scopeReason,
  });
  if (readiness.state !== 'READY_TO_OPEN') {
    throw new Error(`REVIEW_CASE_NOT_READY:${readiness.blockers.join(',')}`);
  }

  const normalizedReason = normalizeText(scopeReason);
  if (!normalizedReason) throw new Error('CASE_SCOPE_REASON_REQUIRED');
  const targetedProposalRefs = [...new Set(selectedProposalRefs)].filter((proposalRef) => availableProposalRefs.includes(proposalRef));

  return {
    id: `CRC:${curriculumUnit.unitKey}:${openedAt}`,
    kind: 'CURRICULUM_REVIEW_CASE',
    originTriggerSnapshot: {
      id: trigger.id,
      triggerType: trigger.triggerType,
      qualificationBasis: trigger.qualificationBasis,
      recordedAt: trigger.recordedAt,
    },
    openedAt,
    openedBy: {
      actorId: normalizeText(actorId, 300),
      roleContext: normalizeText(roleContext, 120),
      identityState: actorId ? 'AUTHENTICATED_SESSION' : 'LOCAL_SESSION_UNVERIFIED',
      institutionalAuthorityInferred: false,
    },
    curriculumUnit: { ...curriculumUnit },
    currentMaster: { ...trigger.currentMaster },
    targetedProposalRefs,
    scopeReason: normalizedReason,
    targetScopeFrozen: true,
    readinessAtOpening: { ...readiness, state: 'READY_TO_OPEN' },
    caseState: 'OPEN_AT_APPLICABLE_CURRICULUM',
    cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM',
    currentHumanPhase: 'H1_APPLICABLE_CURRICULUM',
    professionalValidationState: 'NOT_STARTED',
    explicitHumanOpening: true,
    automaticProfessionalContributionReuse: false,
    decisionCarryForwardFromPreviousReview: false,
    automaticCurriculumChange: false,
    automaticTeamOutcome: false,
    automaticInstitutionalDecision: false,
    automaticMasterPromotion: false,
    parallelCurriculumBaselineCreation: false,
  };
}

export function reviewCaseMatchesCurrentUnit(
  reviewCase: CurriculumReviewCase,
  curriculumUnit: CurriculumUnitReference,
): boolean {
  return reviewCase.curriculumUnit.unitKey === curriculumUnit.unitKey
    && reviewCase.currentMaster.id === curriculumUnit.masterId
    && reviewCase.currentMaster.driveFileId === curriculumUnit.masterDriveFileId
    && reviewCase.currentMaster.version === curriculumUnit.masterVersion;
}
