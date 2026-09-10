import { buildCaseScopedCurriculumWorkSession } from './caseWorkSession';
import type { CaseScopedCurriculumWorkSession, CurriculumReviewCase, Proposal } from '../../types/curriculum';

export interface DeferredTeamReviewContinuationState {
  proposalRef: string;
  latestOutcomeId: string | null;
  latestOutcome: 'accept-proposal' | 'keep-previous' | 'shared-text' | 'defer' | null;
  continuationId: string | null;
  continuationOpen: boolean;
  canResume: boolean;
  openedAt: string | null;
}

export function buildDeferredCaseContinuationWorkSession(input: {
  reviewCase: CurriculumReviewCase;
  availableProposals: Proposal[];
  proposalRef: string;
  actorId?: string;
  startedAt?: string;
}): CaseScopedCurriculumWorkSession {
  const { reviewCase, availableProposals, proposalRef, actorId, startedAt } = input;
  if (!reviewCase.targetedProposalRefs.includes(proposalRef)) {
    throw new Error('DEFERRED_CONTINUATION_PROPOSAL_OUT_OF_CASE_SCOPE');
  }
  if (!availableProposals.some((proposal) => proposal.id === proposalRef)) {
    throw new Error('DEFERRED_CONTINUATION_PROPOSAL_NOT_AVAILABLE');
  }

  // The original CurriculumReviewCase opening snapshot remains immutable. A
  // continuation creates only a fresh professional work session for the exact
  // deferred item. No previous decision or professional contribution is
  // carried forward into the new round.
  const continuationCase: CurriculumReviewCase = {
    ...reviewCase,
    targetedProposalRefs: [proposalRef],
    caseState: 'OPEN_AT_APPLICABLE_CURRICULUM',
    currentHumanPhase: 'H1_APPLICABLE_CURRICULUM',
    professionalValidationState: 'NOT_STARTED',
    workSession: undefined,
  };

  const session = buildCaseScopedCurriculumWorkSession({
    reviewCase: continuationCase,
    availableProposals,
    actorId,
    startedAt,
  });

  if (
    session.previousDecisionCarryForward
    || session.previousProfessionalContributionReuse
    || Object.keys(session.decisions).length > 0
    || Object.keys(session.customTexts).length > 0
  ) {
    throw new Error('DEFERRED_CONTINUATION_CARRY_FORWARD_FORBIDDEN');
  }

  return session;
}
