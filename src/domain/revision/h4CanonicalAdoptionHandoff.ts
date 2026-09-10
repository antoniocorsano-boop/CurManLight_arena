import type { H3BoundInstitutionalAuthorityContext } from './h3BoundInstitutionalDecision';

export type H4CanonicalAdoptionHandoffState = 'READY_FOR_ADOPTION_REVIEW';

export interface H4CanonicalAdoptionHandoffReceipt {
  id: string;
  workspaceId: string;
  institutionalDecisionId: string;
  verticalReviewHandoffId: string;
  verticalReviewOutcomeId: string;
  masterId: string;
  masterVersion: string;
  discipline: string;
  reviewedUnitKeys: string[];
  sourceTeamOutcomeIds: string[];
  h4BindingVersion: 1;
  h4BindingFingerprint: string;
  h4Outcome: 'approve' | 'approve-with-changes';
  h4Rationale: string;
  h4AuthorityContext: H3BoundInstitutionalAuthorityContext;
  h4AuthorityAssignmentId?: string;
  handoffBindingVersion: 1;
  handoffBindingFingerprint: string;
  adoptionState: H4CanonicalAdoptionHandoffState;
  requiredAdoptionRole: 'dirigente';
  preparedByUserId: string;
  preparedByRole: 'collegio' | 'dirigente';
  preparedAt: string;
  clientRequestId: string;
  adoptionReceiptCreated: false;
  curriculumInForceChanged: false;
  automaticMasterPromotion: false;
}

export const isH4OutcomeEligibleForAdoptionHandoff = (
  outcome: string,
): outcome is H4CanonicalAdoptionHandoffReceipt['h4Outcome'] => (
  outcome === 'approve' || outcome === 'approve-with-changes'
);
