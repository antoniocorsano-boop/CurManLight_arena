import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type { InstitutionalDecisionOutcome } from '../../domain/revision/sharedDecisionPort';
import type {
  DevelopmentPilotAuthorityAssignment,
  H3BoundInstitutionalAuthorityContext,
  H3BoundInstitutionalDecisionReceipt,
} from '../../domain/revision/h3BoundInstitutionalDecision';

interface DevelopmentAuthorityRow {
  id: string;
  workspace_id: string;
  user_id: string;
  authority_role: 'collegio' | 'dirigente';
  scope: 'BETA_DEVELOPMENT_PILOT';
  status: 'active' | 'revoked';
  previous_workspace_role: string;
  basis: string;
  source_ref: string;
  assigned_at: string;
  revoked_at: string | null;
}

interface H3BoundDecisionRow {
  id: string;
  workspace_id: string;
  vertical_review_handoff_id: string;
  vertical_review_outcome_id: string;
  vertical_review_master_id: string;
  vertical_review_master_version: string;
  vertical_review_discipline: string;
  vertical_review_binding_version: number;
  vertical_review_binding_fingerprint: string;
  outcome: InstitutionalDecisionOutcome;
  rationale: string;
  decided_by: string;
  authority_role: 'collegio';
  authority_context: H3BoundInstitutionalAuthorityContext;
  authority_assignment_id: string | null;
  decided_at: string;
  client_request_id: string;
  decision_basis: 'VERTICAL_REVIEW_HANDOFF';
}

const mapDevelopmentAuthority = (row: DevelopmentAuthorityRow): DevelopmentPilotAuthorityAssignment => ({
  id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  authorityRole: row.authority_role,
  scope: row.scope,
  status: row.status,
  previousWorkspaceRole: row.previous_workspace_role,
  basis: row.basis,
  sourceRef: row.source_ref,
  assignedAt: row.assigned_at,
  revokedAt: row.revoked_at ?? undefined,
});

const mapDecision = (row: H3BoundDecisionRow): H3BoundInstitutionalDecisionReceipt => ({
  id: row.id,
  workspaceId: row.workspace_id,
  handoffId: row.vertical_review_handoff_id,
  verticalReviewOutcomeId: row.vertical_review_outcome_id,
  masterId: row.vertical_review_master_id,
  masterVersion: row.vertical_review_master_version,
  discipline: row.vertical_review_discipline,
  bindingVersion: 1,
  bindingFingerprint: row.vertical_review_binding_fingerprint,
  outcome: row.outcome,
  rationale: row.rationale,
  decidedByUserId: row.decided_by,
  authorityRole: row.authority_role,
  authorityContext: row.authority_context,
  authorityAssignmentId: row.authority_assignment_id ?? undefined,
  decidedAt: row.decided_at,
  clientRequestId: row.client_request_id,
});

export class SupabaseH3BoundInstitutionalDecisionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findActiveDevelopmentAuthority(
    context: WorkspaceActorContext,
  ): Promise<DevelopmentPilotAuthorityAssignment | null> {
    const { data, error } = await this.client
      .from('development_pilot_authority_assignments')
      .select('id,workspace_id,user_id,authority_role,scope,status,previous_workspace_role,basis,source_ref,assigned_at,revoked_at')
      .eq('workspace_id', context.membership.workspaceId)
      .eq('user_id', context.membership.userId)
      .eq('authority_role', 'collegio')
      .eq('scope', 'BETA_DEVELOPMENT_PILOT')
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw new Error(`Autorità di sviluppo non verificabile: ${error.message}`);
    return data ? mapDevelopmentAuthority(data as DevelopmentAuthorityRow) : null;
  }

  async listForHandoff(
    context: WorkspaceActorContext,
    handoffId: string,
  ): Promise<H3BoundInstitutionalDecisionReceipt[]> {
    const { data, error } = await this.client
      .from('institutional_revision_decisions')
      .select('id,workspace_id,vertical_review_handoff_id,vertical_review_outcome_id,vertical_review_master_id,vertical_review_master_version,vertical_review_discipline,vertical_review_binding_version,vertical_review_binding_fingerprint,outcome,rationale,decided_by,authority_role,authority_context,authority_assignment_id,decided_at,client_request_id,decision_basis')
      .eq('workspace_id', context.membership.workspaceId)
      .eq('vertical_review_handoff_id', handoffId)
      .eq('decision_basis', 'VERTICAL_REVIEW_HANDOFF')
      .order('decided_at', { ascending: false })
      .order('id', { ascending: false });

    if (error) throw new Error(`Ricevute H4 non leggibili: ${error.message}`);
    return ((data ?? []) as H3BoundDecisionRow[]).map(mapDecision);
  }

  async record(
    context: WorkspaceActorContext,
    handoffId: string,
    outcome: InstitutionalDecisionOutcome,
    rationale: string,
    clientRequestId: string,
  ): Promise<H3BoundInstitutionalDecisionReceipt> {
    const { data, error } = await this.client.rpc('record_h3_bound_institutional_decision_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_handoff_id: handoffId,
      p_outcome: outcome,
      p_rationale: rationale,
      p_client_request_id: clientRequestId,
    });

    if (error) throw new Error(`Decisione H4 non registrata: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Decisione H4 non registrata: risposta server vuota.');
    return mapDecision(row as H3BoundDecisionRow);
  }
}
