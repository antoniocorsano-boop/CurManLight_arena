import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type { DeferredTeamReviewContinuationState } from '../../domain/curriculum/deferredCaseContinuation';
import type { CaseScopedTeamReviewScope } from '../../domain/revision/caseScopedTeamReview';

interface DeferredContinuationStateRow {
  proposal_ref: string;
  latest_outcome_id: string | null;
  latest_outcome: DeferredTeamReviewContinuationState['latestOutcome'];
  continuation_id: string | null;
  continuation_open: boolean;
  can_resume: boolean;
  opened_at: string | null;
}

export interface ResumeDeferredTeamReviewReceipt {
  continuationId: string;
  sourceOutcomeId: string;
  proposalRef: string;
  archivedContributionCount: number;
  openedAt: string;
}

const assertContext = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('DEFERRED_CONTINUATION_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('La richiesta non appartiene a una membership attiva del workspace corrente.');
  }
};

const toState = (row: DeferredContinuationStateRow): DeferredTeamReviewContinuationState => ({
  proposalRef: row.proposal_ref,
  latestOutcomeId: row.latest_outcome_id,
  latestOutcome: row.latest_outcome,
  continuationId: row.continuation_id,
  continuationOpen: row.continuation_open,
  canResume: row.can_resume,
  openedAt: row.opened_at,
});

export class SupabaseDeferredTeamReviewContinuationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listStates(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: CaseScopedTeamReviewScope,
  ): Promise<DeferredTeamReviewContinuationState[]> {
    assertContext(context, workspaceId);
    const { data, error } = await this.client.rpc('list_deferred_team_review_states_v1', {
      p_workspace_id: workspaceId,
      p_academic_year: scope.academicYear,
      p_group_code: scope.groupCode,
      p_discipline: scope.discipline,
      p_review_case_id: scope.reviewCaseId,
    });
    if (error) throw new Error(`Stato della ripresa H2 non leggibile: ${error.message}`);
    return ((data ?? []) as DeferredContinuationStateRow[]).map(toState);
  }

  async resumeDeferredItem(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: CaseScopedTeamReviewScope,
    proposalRef: string,
  ): Promise<ResumeDeferredTeamReviewReceipt> {
    assertContext(context, workspaceId);
    const { data, error } = await this.client.rpc('resume_deferred_team_review_item_v1', {
      p_workspace_id: workspaceId,
      p_academic_year: scope.academicYear,
      p_group_code: scope.groupCode,
      p_discipline: scope.discipline,
      p_review_case_id: scope.reviewCaseId,
      p_proposal_ref: proposalRef,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito la ricevuta di ripresa H2.');
    const row = data as Record<string, unknown>;
    return {
      continuationId: String(row.continuation_id ?? ''),
      sourceOutcomeId: String(row.source_outcome_id ?? ''),
      proposalRef: String(row.proposal_ref ?? ''),
      archivedContributionCount: Number(row.archived_contribution_count ?? 0),
      openedAt: String(row.opened_at ?? ''),
    };
  }
}
