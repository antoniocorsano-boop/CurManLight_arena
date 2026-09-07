import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  assertReviewCaseId,
  type CaseScopedTeamReviewContribution,
  type CaseScopedTeamReviewOutcomeReceipt,
  type CaseScopedTeamReviewScope,
  type RecordCaseScopedTeamReviewOutcomeInput,
  type UpsertCaseScopedTeamReviewContributionInput,
} from '../../domain/revision/caseScopedTeamReview';
import type { TeamReviewOrientation, TeamReviewOutcome } from '../../domain/revision/teamReview';

interface ContributionRow {
  workspace_id: string;
  academic_year: string;
  group_code: string;
  discipline: string;
  review_case_id: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  contributor_user_id: string;
  contributor_role: 'docente' | 'dipartimento' | 'referente';
  orientation: TeamReviewOrientation;
  custom_text: string | null;
  updated_at: string;
}

interface OutcomeRow {
  id: string;
  workspace_id: string;
  academic_year: string;
  group_code: string;
  discipline: string;
  review_case_id: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  outcome: TeamReviewOutcome;
  shared_text: string | null;
  rationale: string;
  recorded_by_user_id: string;
  recorded_by_role: 'dipartimento' | 'referente';
  recorded_by_operational_role: 'docente' | 'coordinatore' | null;
  authority_state: 'OPERATIVO_PROVVISORIO' | 'FORMALIZZATO';
  recorded_at: string;
  client_request_id: string;
}

const FINGERPRINT_RE = /^[0-9a-f]{64}$/;

const assertContext = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('TEAM_REVIEW_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('La richiesta non appartiene a una membership attiva del workspace corrente.');
  }
};

const assertScope = (scope: CaseScopedTeamReviewScope): void => {
  assertReviewCaseId(scope.reviewCaseId);
  if (!/^\d{4}\/\d{4}$/.test(scope.academicYear)) throw new Error('Anno scolastico non valido.');
  if (!scope.discipline.trim() || !scope.groupCode.trim()) throw new Error('Ambito disciplinare non valido.');
};

const assertRef = (value: string, field: string): void => {
  if (!value || value !== value.trim() || value.includes(String.fromCharCode(31))) throw new Error(`${field} non canonico.`);
};

const assertFingerprint = (value: string): void => {
  if (!FINGERPRINT_RE.test(value)) throw new Error('Fingerprint della scheda non valido.');
};

const toContribution = (row: ContributionRow): CaseScopedTeamReviewContribution => ({
  workspaceId: row.workspace_id,
  academicYear: row.academic_year,
  order: row.group_code.startsWith('P-') ? 'primaria' : 'secondaria',
  groupCode: row.group_code as CaseScopedTeamReviewContribution['groupCode'],
  discipline: row.discipline,
  reviewCaseId: row.review_case_id,
  proposalRef: row.proposal_ref,
  proposalFingerprint: row.proposal_fingerprint,
  contributorUserId: row.contributor_user_id,
  contributorRole: row.contributor_role,
  orientation: row.orientation,
  customText: row.custom_text,
  updatedAt: row.updated_at,
});

const toOutcome = (row: OutcomeRow): CaseScopedTeamReviewOutcomeReceipt => ({
  id: row.id,
  workspaceId: row.workspace_id,
  academicYear: row.academic_year,
  order: row.group_code.startsWith('P-') ? 'primaria' : 'secondaria',
  groupCode: row.group_code as CaseScopedTeamReviewOutcomeReceipt['groupCode'],
  discipline: row.discipline,
  reviewCaseId: row.review_case_id,
  proposalRef: row.proposal_ref,
  proposalFingerprint: row.proposal_fingerprint,
  outcome: row.outcome,
  sharedText: row.shared_text,
  rationale: row.rationale,
  recordedByUserId: row.recorded_by_user_id,
  recordedByRole: row.recorded_by_role,
  recordedByOperationalRole: row.recorded_by_operational_role,
  authorityState: row.authority_state,
  recordedAt: row.recorded_at,
  clientRequestId: row.client_request_id,
});

export class SupabaseCaseScopedTeamReviewRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsertContribution(
    context: WorkspaceActorContext,
    input: UpsertCaseScopedTeamReviewContributionInput,
  ): Promise<CaseScopedTeamReviewContribution> {
    assertContext(context, input.workspaceId);
    assertScope(input);
    assertRef(input.proposalRef, 'proposalRef');
    assertFingerprint(input.proposalFingerprint);
    const { data, error } = await this.client.rpc('upsert_team_review_contribution_v3', {
      p_workspace_id: input.workspaceId,
      p_academic_year: input.academicYear,
      p_group_code: input.groupCode,
      p_discipline: input.discipline,
      p_review_case_id: input.reviewCaseId,
      p_proposal_ref: input.proposalRef,
      p_proposal_fingerprint: input.proposalFingerprint,
      p_orientation: input.orientation,
      p_custom_text: input.orientation === 'propose-change' ? input.customText?.trim() ?? null : null,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito il contributo del caso.');
    return toContribution(data as ContributionRow);
  }

  async listContributions(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: CaseScopedTeamReviewScope,
  ): Promise<CaseScopedTeamReviewContribution[]> {
    assertContext(context, workspaceId);
    assertScope(scope);
    const { data, error } = await this.client
      .from('team_review_contributions')
      .select('workspace_id,academic_year,group_code,discipline,review_case_id,proposal_ref,proposal_fingerprint,contributor_user_id,contributor_role,orientation,custom_text,updated_at')
      .eq('workspace_id', workspaceId)
      .eq('academic_year', scope.academicYear)
      .eq('group_code', scope.groupCode)
      .eq('discipline', scope.discipline)
      .eq('review_case_id', scope.reviewCaseId);
    if (error) throw new Error(`Contributi del caso non leggibili: ${error.message}`);
    return ((data ?? []) as ContributionRow[]).map(toContribution);
  }

  async recordTeamOutcome(
    context: WorkspaceActorContext,
    input: RecordCaseScopedTeamReviewOutcomeInput,
  ): Promise<CaseScopedTeamReviewOutcomeReceipt> {
    assertContext(context, input.workspaceId);
    assertScope(input);
    assertRef(input.proposalRef, 'proposalRef');
    assertRef(input.clientRequestId, 'clientRequestId');
    assertFingerprint(input.proposalFingerprint);
    const { data, error } = await this.client.rpc('record_team_review_outcome_v3', {
      p_workspace_id: input.workspaceId,
      p_academic_year: input.academicYear,
      p_group_code: input.groupCode,
      p_discipline: input.discipline,
      p_review_case_id: input.reviewCaseId,
      p_proposal_ref: input.proposalRef,
      p_proposal_fingerprint: input.proposalFingerprint,
      p_outcome: input.outcome,
      p_shared_text: input.outcome === 'shared-text' ? input.sharedText?.trim() ?? null : null,
      p_rationale: input.rationale.trim(),
      p_client_request_id: input.clientRequestId,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito l’esito del caso.');
    return toOutcome(data as OutcomeRow);
  }

  async listTeamOutcomes(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: CaseScopedTeamReviewScope,
  ): Promise<CaseScopedTeamReviewOutcomeReceipt[]> {
    assertContext(context, workspaceId);
    assertScope(scope);
    const { data, error } = await this.client
      .from('team_review_outcomes')
      .select('id,workspace_id,academic_year,group_code,discipline,review_case_id,proposal_ref,proposal_fingerprint,outcome,shared_text,rationale,recorded_by_user_id,recorded_by_role,recorded_by_operational_role,authority_state,recorded_at,client_request_id')
      .eq('workspace_id', workspaceId)
      .eq('academic_year', scope.academicYear)
      .eq('group_code', scope.groupCode)
      .eq('discipline', scope.discipline)
      .eq('review_case_id', scope.reviewCaseId)
      .order('recorded_at', { ascending: false });
    if (error) throw new Error(`Esiti del caso non leggibili: ${error.message}`);
    return ((data ?? []) as OutcomeRow[]).map(toOutcome);
  }
}
