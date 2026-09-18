import type { WorkspaceActorContext, WorkspaceMemberRole } from '../institution/sharedWorkspacePort';
import type {
  VerticalReviewFinding,
  VerticalReviewMasterReference,
  VerticalReviewOutcomeReceipt,
  VerticalReviewOutcomeState,
  VerticalReviewSourceSnapshot,
} from './verticalReview';

export type InstitutionalReviewHandoffState = 'READY_FOR_INSTITUTIONAL_REVIEW';

export interface InstitutionalReviewHandoffReceipt {
  id: string;
  kind: 'INSTITUTIONAL_REVIEW_HANDOFF';
  workspaceId: string;
  verticalReviewOutcomeId: string;
  master: VerticalReviewMasterReference;
  sourceTeamOutcomeIds: [string, string];
  sourceTeamOutcomes: VerticalReviewSourceSnapshot[];
  reviewedUnitKeys: [string, string];
  discipline: string;
  verticalOutcome: Exclude<VerticalReviewOutcomeState, 'DEFERRED'>;
  findings: VerticalReviewFinding[];
  verticalRationale: string;
  handoffState: InstitutionalReviewHandoffState;
  requiredAuthorityRole: 'collegio';
  preparedByUserId: string;
  preparedByRole: Extract<WorkspaceMemberRole, 'dipartimento' | 'referente' | 'dirigente'>;
  preparedAt: string;
  clientRequestId: string;
  institutionalDecisionCreated: false;
  adoptionReceiptCreated: false;
  curriculumInForceChanged: false;
  automaticMasterPromotion: false;
}

export interface InstitutionalReviewHandoffRepository {
  prepare(
    context: WorkspaceActorContext,
    verticalReviewOutcome: VerticalReviewOutcomeReceipt,
    clientRequestId: string,
  ): Promise<InstitutionalReviewHandoffReceipt>;

  list(
    context: WorkspaceActorContext,
    workspaceId: string,
    master: VerticalReviewMasterReference,
  ): Promise<InstitutionalReviewHandoffReceipt[]>;
}

export const canPrepareInstitutionalReviewHandoff = (
  outcome: Pick<
    VerticalReviewOutcomeReceipt,
    | 'outcome'
    | 'institutionalDecisionCreated'
    | 'adoptionReceiptCreated'
    | 'curriculumInForceChanged'
    | 'automaticMasterPromotion'
  >,
): boolean => outcome.outcome !== 'DEFERRED'
  && !outcome.institutionalDecisionCreated
  && !outcome.adoptionReceiptCreated
  && !outcome.curriculumInForceChanged
  && !outcome.automaticMasterPromotion;

export const assertInstitutionalReviewHandoffEligible = (
  outcome: Pick<
    VerticalReviewOutcomeReceipt,
    | 'outcome'
    | 'institutionalDecisionCreated'
    | 'adoptionReceiptCreated'
    | 'curriculumInForceChanged'
    | 'automaticMasterPromotion'
  >,
): void => {
  if (!canPrepareInstitutionalReviewHandoff(outcome)) {
    throw new Error('VERTICAL_REVIEW_NOT_ELIGIBLE_FOR_INSTITUTIONAL_HANDOFF');
  }
};
