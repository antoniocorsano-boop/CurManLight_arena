import type {
  CaseScopedCurricoloWorkSession,
  CurricoloReviewCase,
  CurricoloWorkSessionStage,
} from '../../types/curricolo';
import type { DecisionStatus, Proposal } from '../../types/curriculum';

const normalizeText = (value: string | undefined, maxLength = 2400): string =>
  value?.trim().replace(/\s+/g, ' ').slice(0, maxLength) ?? '';

export function getCaseScopedProposals(
  reviewCase: CurricoloReviewCase,
  availableProposals: Proposal[],
): Proposal[] {
  const byId = new Map(availableProposals.map((proposal) => [proposal.id, proposal]));
  return reviewCase.targetedProposalRefs
    .map((proposalRef) => byId.get(proposalRef))
    .filter((proposal): proposal is Proposal => Boolean(proposal));
}

export function assertCaseScopeIsResolvable(
  reviewCase: CurricoloReviewCase,
  availableProposals: Proposal[],
): void {
  if (reviewCase.targetedProposalRefs.length === 0) throw new Error('CASE_WORK_SESSION_EMPTY_SCOPE');
  const available = new Set(availableProposals.map((proposal) => proposal.id));
  if (!reviewCase.targetedProposalRefs.every((proposalRef) => available.has(proposalRef))) {
    throw new Error('CASE_WORK_SESSION_SCOPE_NOT_RESOLVABLE');
  }
}

export function buildCaseScopedCurriculumWorkSession(input: {
  reviewCase: CurricoloReviewCase;
  availableProposals: Proposal[];
  actorId?: string;
  startedAt?: string;
}): CaseScopedCurricoloWorkSession {
  const { reviewCase, availableProposals, actorId, startedAt = new Date().toISOString() } = input;
  assertCaseScopeIsResolvable(reviewCase, availableProposals);
  if (reviewCase.caseState === 'PROFESSIONAL_REVIEW_COMPLETE') throw new Error('REVIEW_CASE_ALREADY_COMPLETE');
  if (reviewCase.currentHumanPhase !== 'H1_APPLICABLE_CURRICULUM') throw new Error('REVIEW_CASE_NOT_AT_APPLICABLE_CURRICULUM');
  if (reviewCase.professionalValidationState !== 'NOT_STARTED') throw new Error('REVIEW_CASE_VALIDATION_ALREADY_STARTED');

  return {
    id: `CWS:${reviewCase.id}:${startedAt}`,
    kind: 'CURRICULUM_WORK_SESSION',
    reviewCaseId: reviewCase.id,
    sessionState: 'ACTIVE',
    stage: 'EXAMINE',
    startedAt,
    updatedAt: startedAt,
    actor: {
      actorId: normalizeText(actorId, 300) || undefined,
      identityState: actorId ? 'AUTHENTICATED_SESSION' : 'LOCAL_SESSION_UNVERIFIED',
    },
    currentMaster: { ...reviewCase.currentMaster },
    curriculumUnitKey: reviewCase.curriculumUnit.unitKey,
    targetedProposalRefs: [...reviewCase.targetedProposalRefs],
    targetScopeFrozen: true,
    decisions: {},
    customTexts: {},
    previousDecisionCarryForward: false,
    previousProfessionalContributionReuse: false,
    sharedContributionMustMatchReviewCase: true,
    automaticTeamOutcome: false,
    automaticInstitutionalDecision: false,
    automaticCurriculumChange: false,
  };
}

export function isCaseDecisionPrepared(
  session: CaseScopedCurricoloWorkSession,
  proposalRef: string,
): boolean {
  if (!session.targetedProposalRefs.includes(proposalRef)) return false;
  const decision = session.decisions[proposalRef];
  if (!decision) return false;
  if (decision === 'custom') return Boolean(normalizeText(session.customTexts[proposalRef]));
  return true;
}

export function casePreparedCount(session: CaseScopedCurricoloWorkSession): number {
  return session.targetedProposalRefs.filter((proposalRef) => isCaseDecisionPrepared(session, proposalRef)).length;
}

export function isCasePersonalReviewComplete(session: CaseScopedCurricoloWorkSession): boolean {
  return session.targetedProposalRefs.length > 0
    && casePreparedCount(session) === session.targetedProposalRefs.length;
}

export function recordCaseDecision(input: {
  session: CaseScopedCurricoloWorkSession;
  proposalRef: string;
  decision: DecisionStatus;
  customText?: string;
  updatedAt?: string;
}): CaseScopedCurricoloWorkSession {
  const { session, proposalRef, decision, updatedAt = new Date().toISOString() } = input;
  if (!session.targetedProposalRefs.includes(proposalRef)) {
    throw new Error('CASE_WORK_SESSION_PROPOSAL_OUT_OF_SCOPE');
  }
  if (session.sessionState === 'COMPLETE') throw new Error('CASE_WORK_SESSION_COMPLETE');
  const customText = decision === 'custom' ? normalizeText(input.customText) : '';
  if (decision === 'custom' && !customText) throw new Error('CASE_CUSTOM_TEXT_REQUIRED');

  const decisions = { ...session.decisions, [proposalRef]: decision };
  const customTexts = { ...session.customTexts };
  if (decision === 'custom') customTexts[proposalRef] = customText;
  else delete customTexts[proposalRef];

  return {
    ...session,
    decisions,
    customTexts,
    stage: 'EXAMINE',
    updatedAt,
  };
}

export function resetCaseDecision(
  session: CaseScopedCurricoloWorkSession,
  proposalRef: string,
  updatedAt = new Date().toISOString(),
): CaseScopedCurricoloWorkSession {
  if (!session.targetedProposalRefs.includes(proposalRef)) throw new Error('CASE_WORK_SESSION_PROPOSAL_OUT_OF_SCOPE');
  const decisions = { ...session.decisions };
  const customTexts = { ...session.customTexts };
  delete decisions[proposalRef];
  delete customTexts[proposalRef];
  return { ...session, decisions, customTexts, stage: 'EXAMINE', updatedAt };
}

export function transitionCaseWorkSessionStage(input: {
  session: CaseScopedCurricoloWorkSession;
  nextStage: CurricoloWorkSessionStage;
  persistedShareComplete?: boolean;
  teamOutcomeComplete?: boolean;
  updatedAt?: string;
}): CaseScopedCurricoloWorkSession {
  const {
    session,
    nextStage,
    persistedShareComplete = false,
    teamOutcomeComplete = false,
    updatedAt = new Date().toISOString(),
  } = input;
  if (session.sessionState === 'COMPLETE') throw new Error('CASE_WORK_SESSION_COMPLETE');
  if (nextStage !== 'EXAMINE' && !isCasePersonalReviewComplete(session)) {
    throw new Error('CASE_PERSONAL_REVIEW_INCOMPLETE');
  }
  if ((nextStage === 'COMPARE' || nextStage === 'RECORD_TEAM_OUTCOME') && !persistedShareComplete) {
    throw new Error('CASE_CURRENT_SHARE_REQUIRED');
  }
  if (nextStage === 'RECORD_TEAM_OUTCOME' && session.stage !== 'COMPARE' && !teamOutcomeComplete) {
    throw new Error('CASE_COMPARE_STAGE_REQUIRED');
  }
  return { ...session, stage: nextStage, updatedAt };
}

export function pauseCaseWorkSession(
  session: CaseScopedCurricoloWorkSession,
  updatedAt = new Date().toISOString(),
): CaseScopedCurricoloWorkSession {
  if (session.sessionState === 'COMPLETE') return session;
  return { ...session, sessionState: 'PAUSED', updatedAt };
}

export function resumeCaseWorkSession(
  session: CaseScopedCurricoloWorkSession,
  actorId?: string,
  updatedAt = new Date().toISOString(),
): CaseScopedCurricoloWorkSession {
  if (session.sessionState === 'COMPLETE') throw new Error('CASE_WORK_SESSION_COMPLETE');
  const normalizedActor = normalizeText(actorId, 300) || undefined;
  if (session.actor.actorId && normalizedActor && session.actor.actorId !== normalizedActor) {
    throw new Error('CASE_WORK_SESSION_ACTOR_MISMATCH');
  }
  return {
    ...session,
    sessionState: 'ACTIVE',
    actor: {
      actorId: session.actor.actorId ?? normalizedActor,
      identityState: session.actor.actorId || normalizedActor ? 'AUTHENTICATED_SESSION' : 'LOCAL_SESSION_UNVERIFIED',
    },
    updatedAt,
  };
}

export function completeCaseWorkSession(
  session: CaseScopedCurricoloWorkSession,
  updatedAt = new Date().toISOString(),
): CaseScopedCurricoloWorkSession {
  if (!isCasePersonalReviewComplete(session)) throw new Error('CASE_PERSONAL_REVIEW_INCOMPLETE');
  return { ...session, sessionState: 'COMPLETE', stage: 'RECORD_TEAM_OUTCOME', updatedAt };
}
