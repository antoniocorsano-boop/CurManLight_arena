import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext, WorkspaceMemberRole } from '../../domain/institution/sharedWorkspacePort';
import type {
  RecordTeamReviewOutcomeInput,
  SharedTeamReviewRepository,
  TeamReviewContribution,
  TeamReviewOrientation,
  TeamReviewOutcome,
  TeamReviewOutcomeReceipt,
  UpsertTeamReviewContributionInput,
} from '../../domain/revision/teamReview';

interface ContributionRow {
  workspace_id: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  contributor_user_id: string;
  contributor_role: string;
  orientation: string;
  custom_text: string | null;
  updated_at: string;
}

interface OutcomeRow {
  id: string;
  workspace_id: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  outcome: string;
  shared_text: string | null;
  rationale: string;
  recorded_by_user_id: string;
  recorded_by_role: string;
  recorded_at: string;
  client_request_id: string;
}

const CONTRIBUTION_ORIENTATIONS: readonly TeamReviewOrientation[] = [
  'confirm-proposal',
  'propose-change',
  'keep-previous',
];

const TEAM_OUTCOMES: readonly TeamReviewOutcome[] = [
  'accept-proposal',
  'keep-previous',
  'shared-text',
  'defer',
];

const CONTRIBUTOR_ROLES: readonly WorkspaceMemberRole[] = ['docente', 'dipartimento', 'referente'];
const TEAM_OUTCOME_ROLES: readonly WorkspaceMemberRole[] = ['dipartimento', 'referente'];
const FINGERPRINT_RE = /^[0-9a-f]{64}$/;

const assertContextWorkspace = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('TEAM_REVIEW_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('La richiesta non appartiene a una membership attiva del workspace corrente.');
  }
};

const assertRef = (value: string, field: string): void => {
  if (!value || value !== value.trim() || value.includes(String.fromCharCode(31))) {
    throw new Error(`${field} non canonico.`);
  }
};

const assertFingerprint = (value: string): void => {
  if (!FINGERPRINT_RE.test(value)) throw new Error('Fingerprint della scheda non valido.');
};

const isContributorRole = (value: string): value is WorkspaceMemberRole => CONTRIBUTOR_ROLES.includes(value as WorkspaceMemberRole);
const isTeamOutcomeRole = (value: string): value is Extract<WorkspaceMemberRole, 'dipartimento' | 'referente'> => TEAM_OUTCOME_ROLES.includes(value as WorkspaceMemberRole);
const isOrientation = (value: string): value is TeamReviewOrientation => CONTRIBUTION_ORIENTATIONS.includes(value as TeamReviewOrientation);
const isOutcome = (value: string): value is TeamReviewOutcome => TEAM_OUTCOMES.includes(value as TeamReviewOutcome);

const toContribution = (row: ContributionRow): TeamReviewContribution => {
  if (!isContributorRole(row.contributor_role) || !isOrientation(row.orientation)) {
    throw new Error('Contributo del team non valido.');
  }
  assertFingerprint(row.proposal_fingerprint);
  return {
    workspaceId: row.workspace_id,
    proposalRef: row.proposal_ref,
    proposalFingerprint: row.proposal_fingerprint,
    contributorUserId: row.contributor_user_id,
    contributorRole: row.contributor_role,
    orientation: row.orientation,
    customText: row.custom_text,
    updatedAt: row.updated_at,
  };
};

const toOutcome = (row: OutcomeRow): TeamReviewOutcomeReceipt => {
  if (!isTeamOutcomeRole(row.recorded_by_role) || !isOutcome(row.outcome)) {
    throw new Error('Esito del team non valido.');
  }
  assertFingerprint(row.proposal_fingerprint);
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    proposalRef: row.proposal_ref,
    proposalFingerprint: row.proposal_fingerprint,
    outcome: row.outcome,
    sharedText: row.shared_text,
    rationale: row.rationale,
    recordedByUserId: row.recorded_by_user_id,
    recordedByRole: row.recorded_by_role,
    recordedAt: row.recorded_at,
    clientRequestId: row.client_request_id,
  };
};

export class SupabaseSharedTeamReviewRepository implements SharedTeamReviewRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsertContribution(
    context: WorkspaceActorContext,
    input: UpsertTeamReviewContributionInput,
  ): Promise<TeamReviewContribution> {
    assertContextWorkspace(context, input.workspaceId);
    assertRef(input.proposalRef, 'proposalRef');
    assertFingerprint(input.proposalFingerprint);
    if (!CONTRIBUTOR_ROLES.includes(context.membership.role)) throw new Error('TEAM_REVIEW_CONTRIBUTE_REQUIRED');
    if (!CONTRIBUTION_ORIENTATIONS.includes(input.orientation)) throw new Error('Orientamento non valido.');
    if (input.orientation === 'propose-change' && !input.customText?.trim()) {
      throw new Error('La modifica proposta richiede una formulazione esplicita.');
    }

    const { data, error } = await this.client.rpc('upsert_team_review_contribution_v1', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_fingerprint: input.proposalFingerprint,
      p_orientation: input.orientation,
      p_custom_text: input.orientation === 'propose-change' ? input.customText?.trim() ?? null : null,
    });
    if (error) throw new Error(`Contributo non registrato: ${error.message}`);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito il contributo registrato.');
    const contribution = toContribution(data as ContributionRow);
    if (
      contribution.workspaceId !== input.workspaceId ||
      contribution.contributorUserId !== context.membership.userId ||
      contribution.proposalRef !== input.proposalRef
    ) {
      throw new Error('Il contributo restituito dal server non corrisponde al principal o alla scheda richiesti.');
    }
    return contribution;
  }

  async listContributions(
    context: WorkspaceActorContext,
    workspaceId: string,
  ): Promise<TeamReviewContribution[]> {
    assertContextWorkspace(context, workspaceId);
    const { data, error } = await this.client
      .from('team_review_contributions')
      .select('workspace_id,proposal_ref,proposal_fingerprint,contributor_user_id,contributor_role,orientation,custom_text,updated_at')
      .eq('workspace_id', workspaceId);
    if (error) throw new Error(`Contributi del team non leggibili: ${error.message}`);
    return ((data ?? []) as ContributionRow[]).map(toContribution);
  }

  async recordTeamOutcome(
    context: WorkspaceActorContext,
    input: RecordTeamReviewOutcomeInput,
  ): Promise<TeamReviewOutcomeReceipt> {
    assertContextWorkspace(context, input.workspaceId);
    assertRef(input.proposalRef, 'proposalRef');
    assertFingerprint(input.proposalFingerprint);
    assertRef(input.clientRequestId, 'clientRequestId');
    if (!TEAM_OUTCOME_ROLES.includes(context.membership.role)) throw new Error('TEAM_REVIEW_DECIDE_REQUIRED');
    if (!TEAM_OUTCOMES.includes(input.outcome)) throw new Error('Esito del team non valido.');
    if (!input.rationale.trim()) throw new Error('La motivazione dell’esito del team è obbligatoria.');
    if (input.outcome === 'shared-text' && !input.sharedText?.trim()) {
      throw new Error('Il testo condiviso è obbligatorio per questo esito.');
    }

    const { data, error } = await this.client.rpc('record_team_review_outcome_v1', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_fingerprint: input.proposalFingerprint,
      p_outcome: input.outcome,
      p_shared_text: input.outcome === 'shared-text' ? input.sharedText?.trim() ?? null : null,
      p_rationale: input.rationale.trim(),
      p_client_request_id: input.clientRequestId,
    });
    if (error) throw new Error(`Esito del team non registrato: ${error.message}`);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito la ricevuta dell’esito del team.');
    const receipt = toOutcome(data as OutcomeRow);
    if (
      receipt.workspaceId !== input.workspaceId ||
      receipt.recordedByUserId !== context.membership.userId ||
      receipt.proposalRef !== input.proposalRef
    ) {
      throw new Error('La ricevuta del team restituita dal server non corrisponde al principal o alla scheda richiesti.');
    }
    return receipt;
  }

  async listTeamOutcomes(
    context: WorkspaceActorContext,
    workspaceId: string,
  ): Promise<TeamReviewOutcomeReceipt[]> {
    assertContextWorkspace(context, workspaceId);
    const { data, error } = await this.client
      .from('team_review_outcomes')
      .select('id,workspace_id,proposal_ref,proposal_fingerprint,outcome,shared_text,rationale,recorded_by_user_id,recorded_by_role,recorded_at,client_request_id')
      .eq('workspace_id', workspaceId)
      .order('recorded_at', { ascending: false });
    if (error) throw new Error(`Esiti del team non leggibili: ${error.message}`);
    return ((data ?? []) as OutcomeRow[]).map(toOutcome);
  }
}
