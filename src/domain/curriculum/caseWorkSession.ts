import type {
  CaseScopedCurriculumWorkSession,
  CurriculumReviewCase,
  CurriculumWorkSessionStage,
  DecisionStatus,
  Proposal,
} from '../../types/curriculum';

const normalizeText = (value: string | undefined, maxLength = 2400): string =>
  value?.trim().replace(/\s+/g, ' ').slice(0, maxLength) ?? '';

const caseProposalSet = (reviewCase: CurriculumReviewCase): Set<string> =>
  new Set(reviewCase.targetedProposalRefs);

export function getCaseScopedProposals(
  reviewCase: CurriculumReviewCase,
  availableProposals: Proposal[],
): Proposal[] {
  const byId = new Map(availableProposals.map((proposal) => [proposal.id, proposal]));
  return reviewCase.targetedProposalRefs
    .map((proposalRef) => byId.get(proposalRef))
    .filter((proposal): proposal is Proposal => Boolean(proposal));
}

export function assertCaseScopeIsResolvable(
  reviewCase: CurriculumReviewCase,
  availableProposals: Proposal[],
): void {
  if (reviewCase.targetedProposalRefs.length === 0) throw new Error('CASE_WORK_SESSION_EMPTY_SCOPE');
  const available = new Set(availableProposals.map((proposal) => proposal.id));
  if (!reviewCase.targetedProposalRefs.every((proposalRef) => available.has(proposalRef))) {
    throw new Error('CASE_WORK_SESSION_SCOPE_NOT_RESOLVABLE');
  }
}

export function buildCaseScopedCurriculumWorkSession(input: {
  reviewCase: CurriculumReviewCase;
  availableProposals: Proposal[];
  actorId?: string;
  startedAt?: string;
}): CaseScopedCurriculumWorkSession {
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
  session: CaseScopedCurriculumWorkSession,
  proposalRef: string,
): boolean {
  if (!session.targetedProposalRefs.includes(proposalRef)) return false;
  const decision = session.decisions[proposalRef];
  if (!decision) return false;
  if (decision === 'custom') return Boolean(normalizeText(session.customTexts[proposalRef]));
  return true;
}

export function casePreparedCount(session: CaseScopedCurriculumWorkSession): number {
  return session.targetedProposalRefs.filter((proposalRef) => isCaseDecisionPrepared(session, proposalRef)).length;
}

export function isCasePersonalReviewComplete(session: CaseScopedCurriculumWorkSession): boolean {
  return session.targetedProposalRefs.length > 0
    && casePreparedCount(session) === session.targetedProposalRefs.length;
}

export function recordCaseDecision(input: {
  session: CaseScopedCurriculumWorkSession;
  proposalRef: string;
  decision: DecisionStatus;
  customText?: string;
  updatedAt?: string;
}): CaseScopedCurriculumWorkSession {
  const { session, proposalRef, decision, updatedAt = new Date().toISOString() } = input;
  if (!caseProposalSet({ targetedProposalRefs: session.targetedProposalRefs } as CurriculumReviewCase).has(proposalRef)) {
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
  session: CaseScopedCurriculumWorkSession,
  proposalRef: string,
  updatedAt = new Date().toISOString(),
): CaseScopedCurriculumWorkSession {
  if (!session.targetedProposalRefs.includes(proposalRef)) throw new Error('CASE_WORK_SESSION_PROPOSAL_OUT_OF_SCOPE');
  const decisions = { ...session.decisions };
  const customTexts = { ...session.customTexts };
  delete decisions[proposalRef];
  delete customTexts[proposalRef];
  return { ...session, decisions, customTexts, stage: 'EXAMINE', updatedAt };
}

export function transitionCaseWorkSessionStage(input: {
  session: CaseScopedCurriculumWorkSession;
  nextStage: CurriculumWorkSessionStage;
  persistedShareComplete?: boolean;
  teamOutcomeComplete?: boolean;
  updatedAt?: string;
}): CaseScopedCurriculumWorkSession {
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
  session: CaseScopedCurriculumWorkSession,
  updatedAt = new Date().toISOString(),
): CaseScopedCurriculumWorkSession {
  if (session.sessionState === 'COMPLETE') return session;
  return { ...session, sessionState: 'PAUSED', updatedAt };
}

export function resumeCaseWorkSession(
  session: CaseScopedCurriculumWorkSession,
  actorId?: string,
  updatedAt = new Date().toISOString(),
): CaseScopedCurriculumWorkSession {
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
  session: CaseScopedCurriculumWorkSession,
  updatedAt = new Date().toISOString(),
): CaseScopedCurriculumWorkSession {
  if (!isCasePersonalReviewComplete(session)) throw new Error('CASE_PERSONAL_REVIEW_INCOMPLETE');
  return { ...session, sessionState: 'COMPLETE', stage: 'RECORD_TEAM_OUTCOME', updatedAt };
}
