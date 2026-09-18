import type { DevelopmentPilotAuthorityAssignment, H3BoundInstitutionalAuthorityContext } from './h3BoundInstitutionalDecision';

export type H4BoundCanonicalAdoptionStatus = 'ADOPTED_PENDING_MATERIALIZATION';

export interface H4BoundCanonicalAdoptionSubject {
  schemaVersion: 1;
  kind: 'H4_BOUND_ADOPTION_SUBJECT';
  master: {
    id: string;
    driveFileId: string;
    version: string;
  };
  discipline: string;
  reviewedUnitKeys: string[];
  sourceTeamOutcomes: Array<{
    team_outcome_id?: string;
    proposal_ref?: string;
    proposal_fingerprint?: string;
    curriculum_unit_key?: string;
    class_or_age_band?: string;
    team_outcome?: string;
    [key: string]: unknown;
  }>;
  verticalReview: {
    id: string;
    outcome: string;
    findings: unknown;
    rationale: string;
  };
  institutionalDecision: {
    id: string;
    outcome: string;
    rationale: string;
    authorityContext: H3BoundInstitutionalAuthorityContext;
    bindingFingerprint: string;
  };
  adoptionHandoff: {
    id: string;
    bindingFingerprint: string;
  };
}

export interface H4BoundCanonicalAdoptionReceipt {
  id: string;
  workspaceId: string;
  adoptionHandoffId: string;
  institutionalDecisionId: string;
  verticalReviewHandoffId: string;
  verticalReviewOutcomeId: string;
  masterId: string;
  masterVersion: string;
  discipline: string;
  reviewedUnitKeys: string[];
  sourceTeamOutcomeIds: string[];
  adoptionSubjectSnapshot: H4BoundCanonicalAdoptionSubject;
  adoptionSubjectFingerprint: string;
  adoptionBindingVersion: 1;
  adoptionBindingFingerprint: string;
  status: H4BoundCanonicalAdoptionStatus;
  rationale: string;
  authorityRole: 'dirigente';
  authorityContext: H3BoundInstitutionalAuthorityContext;
  authorityAssignmentId?: string;
  adoptedByUserId: string;
  adoptedAt: string;
  clientRequestId: string;
  materializationCreated: false;
  curriculumInForceChanged: false;
  automaticMasterPromotion: false;
}

export type DevelopmentPilotAdoptionAuthority = DevelopmentPilotAuthorityAssignment & {
  authorityRole: 'dirigente';
};

export const isAdoptionRecordedWithoutVigency = (
  receipt: H4BoundCanonicalAdoptionReceipt,
): boolean => (
  receipt.status === 'ADOPTED_PENDING_MATERIALIZATION'
  && receipt.materializationCreated === false
  && receipt.curriculumInForceChanged === false
  && receipt.automaticMasterPromotion === false
);
