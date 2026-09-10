import type { InstitutionalDecisionOutcome } from './sharedDecisionPort';

export type H3BoundInstitutionalAuthorityContext = 'INSTITUTIONAL' | 'DEVELOPMENT_PILOT';
export type DevelopmentPilotAuthorityRole = 'collegio' | 'dirigente';

export interface DevelopmentPilotAuthorityAssignment {
  id: string;
  workspaceId: string;
  userId: string;
  authorityRole: DevelopmentPilotAuthorityRole;
  scope: 'BETA_DEVELOPMENT_PILOT';
  status: 'active' | 'revoked';
  previousWorkspaceRole: string;
  basis: string;
  sourceRef: string;
  assignedAt: string;
  revokedAt?: string;
}

export interface H3BoundInstitutionalDecisionReceipt {
  id: string;
  workspaceId: string;
  handoffId: string;
  verticalReviewOutcomeId: string;
  masterId: string;
  masterVersion: string;
  discipline: string;
  bindingVersion: 1;
  bindingFingerprint: string;
  outcome: InstitutionalDecisionOutcome;
  rationale: string;
  decidedByUserId: string;
  authorityRole: 'collegio';
  authorityContext: H3BoundInstitutionalAuthorityContext;
  authorityAssignmentId?: string;
  decidedAt: string;
  clientRequestId: string;
}

export const isFinalH3BoundInstitutionalDecision = (
  outcome: InstitutionalDecisionOutcome,
): boolean => outcome === 'approve' || outcome === 'approve-with-changes' || outcome === 'reject';
