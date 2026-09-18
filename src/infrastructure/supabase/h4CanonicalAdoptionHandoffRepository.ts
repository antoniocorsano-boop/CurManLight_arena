import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type { H4CanonicalAdoptionHandoffReceipt } from '../../domain/revision/h4CanonicalAdoptionHandoff';

interface H4CanonicalAdoptionHandoffRow {
  id: string;
  workspace_id: string;
  institutional_decision_id: string;
  vertical_review_handoff_id: string;
  vertical_review_outcome_id: string;
  master_id: string;
  master_drive_file_id: string;
  master_version: string;
  discipline: string;
  reviewed_unit_keys: string[];
  source_team_outcome_ids: string[];
  h4_binding_version: number;
  h4_binding_fingerprint: string;
  h4_outcome: 'approve' | 'approve-with-changes';
  h4_rationale: string;
  h4_authority_context: 'INSTITUTIONAL' | 'DEVELOPMENT_PILOT';
  h4_authority_assignment_id: string | null;
  handoff_binding_version: number;
  handoff_binding_fingerprint: string;
  adoption_state: 'READY_FOR_ADOPTION_REVIEW';
  required_adoption_role: 'dirigente';
  prepared_by_user_id: string;
  prepared_by_role: 'collegio' | 'dirigente';
  prepared_at: string;
  client_request_id: string;
  adoption_receipt_created: false;
  curriculum_in_force_changed: false;
  automatic_master_promotion: false;
}

const SHA256 = /^[a-f0-9]{64}$/;

const mapReceipt = (row: H4CanonicalAdoptionHandoffRow): H4CanonicalAdoptionHandoffReceipt => {
  if (
    row.h4_binding_version !== 1
    || row.handoff_binding_version !== 1
    || !SHA256.test(row.h4_binding_fingerprint)
    || !SHA256.test(row.handoff_binding_fingerprint)
    || row.adoption_state !== 'READY_FOR_ADOPTION_REVIEW'
    || row.required_adoption_role !== 'dirigente'
    || row.adoption_receipt_created !== false
    || row.curriculum_in_force_changed !== false
    || row.automatic_master_promotion !== false
  ) {
    throw new Error('Il server ha restituito un handoff H4→adozione non valido.');
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    institutionalDecisionId: row.institutional_decision_id,
    verticalReviewHandoffId: row.vertical_review_handoff_id,
    verticalReviewOutcomeId: row.vertical_review_outcome_id,
    masterId: row.master_id,
    masterVersion: row.master_version,
    discipline: row.discipline,
    reviewedUnitKeys: row.reviewed_unit_keys,
    sourceTeamOutcomeIds: row.source_team_outcome_ids,
    h4BindingVersion: 1,
    h4BindingFingerprint: row.h4_binding_fingerprint,
    h4Outcome: row.h4_outcome,
    h4Rationale: row.h4_rationale,
    h4AuthorityContext: row.h4_authority_context,
    h4AuthorityAssignmentId: row.h4_authority_assignment_id ?? undefined,
    handoffBindingVersion: 1,
    handoffBindingFingerprint: row.handoff_binding_fingerprint,
    adoptionState: row.adoption_state,
    requiredAdoptionRole: row.required_adoption_role,
    preparedByUserId: row.prepared_by_user_id,
    preparedByRole: row.prepared_by_role,
    preparedAt: row.prepared_at,
    clientRequestId: row.client_request_id,
    adoptionReceiptCreated: false,
    curriculumInForceChanged: false,
    automaticMasterPromotion: false,
  };
};

export class SupabaseH4CanonicalAdoptionHandoffRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findForDecision(
    context: WorkspaceActorContext,
    institutionalDecisionId: string,
  ): Promise<H4CanonicalAdoptionHandoffReceipt | null> {
    if (!institutionalDecisionId.trim()) throw new Error('La ricevuta H4 è obbligatoria.');
    const { data, error } = await this.client
      .from('h4_canonical_adoption_handoffs')
      .select('*')
      .eq('workspace_id', context.membership.workspaceId)
      .eq('institutional_decision_id', institutionalDecisionId)
      .maybeSingle();

    if (error) throw new Error(`Handoff H4→adozione non leggibile: ${error.message}`);
    return data ? mapReceipt(data as H4CanonicalAdoptionHandoffRow) : null;
  }

  async prepare(
    context: WorkspaceActorContext,
    institutionalDecisionId: string,
    clientRequestId: string,
  ): Promise<H4CanonicalAdoptionHandoffReceipt> {
    if (!institutionalDecisionId.trim() || !clientRequestId.trim()) {
      throw new Error('Decisione H4 e identificativo della richiesta sono obbligatori.');
    }

    const { data, error } = await this.client.rpc('prepare_h4_canonical_adoption_handoff_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_institutional_decision_id: institutionalDecisionId,
      p_client_request_id: clientRequestId,
    });

    if (error) throw new Error(`Handoff H4→adozione non preparato: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Handoff H4→adozione non preparato: risposta server vuota.');
    return mapReceipt(row as H4CanonicalAdoptionHandoffRow);
  }
}
