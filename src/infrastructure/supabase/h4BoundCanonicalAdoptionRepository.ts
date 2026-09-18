import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type {
  DevelopmentPilotAdoptionAuthority,
  H4BoundCanonicalAdoptionReceipt,
  H4BoundCanonicalAdoptionSubject,
} from '../../domain/revision/h4BoundCanonicalAdoption';

interface PilotAuthorityRow {
  id: string;
  workspace_id: string;
  user_id: string;
  authority_role: 'dirigente';
  scope: 'BETA_DEVELOPMENT_PILOT';
  status: 'active' | 'revoked';
  previous_workspace_role: string;
  basis: string;
  source_ref: string;
  assigned_at: string;
  revoked_at: string | null;
}

interface AdoptionRow {
  id: string;
  workspace_id: string;
  adoption_handoff_id: string;
  institutional_decision_id: string;
  vertical_review_handoff_id: string;
  vertical_review_outcome_id: string;
  master_id: string;
  master_drive_file_id: string;
  master_version: string;
  discipline: string;
  reviewed_unit_keys: string[];
  source_team_outcome_ids: string[];
  adoption_subject_snapshot: H4BoundCanonicalAdoptionSubject;
  adoption_subject_fingerprint: string;
  adoption_binding_version: number;
  adoption_binding_fingerprint: string;
  status: 'ADOPTED_PENDING_MATERIALIZATION';
  rationale: string;
  authority_role: 'dirigente';
  authority_context: 'INSTITUTIONAL' | 'DEVELOPMENT_PILOT';
  authority_assignment_id: string | null;
  adopted_by_user_id: string;
  adopted_at: string;
  client_request_id: string;
  materialization_created: false;
  curriculum_in_force_changed: false;
  automatic_master_promotion: false;
}

const SHA256 = /^[a-f0-9]{64}$/;

const mapPilotAuthority = (row: PilotAuthorityRow): DevelopmentPilotAdoptionAuthority => ({
  id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  authorityRole: 'dirigente',
  scope: row.scope,
  status: row.status,
  previousWorkspaceRole: row.previous_workspace_role,
  basis: row.basis,
  sourceRef: row.source_ref,
  assignedAt: row.assigned_at,
  revokedAt: row.revoked_at ?? undefined,
});

const mapReceipt = (row: AdoptionRow): H4BoundCanonicalAdoptionReceipt => {
  if (
    row.adoption_binding_version !== 1
    || !SHA256.test(row.adoption_subject_fingerprint)
    || !SHA256.test(row.adoption_binding_fingerprint)
    || row.status !== 'ADOPTED_PENDING_MATERIALIZATION'
    || row.authority_role !== 'dirigente'
    || row.materialization_created !== false
    || row.curriculum_in_force_changed !== false
    || row.automatic_master_promotion !== false
  ) {
    throw new Error('Il server ha restituito una ricevuta di adozione H4-bound non valida.');
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    adoptionHandoffId: row.adoption_handoff_id,
    institutionalDecisionId: row.institutional_decision_id,
    verticalReviewHandoffId: row.vertical_review_handoff_id,
    verticalReviewOutcomeId: row.vertical_review_outcome_id,
    masterId: row.master_id,
    masterVersion: row.master_version,
    discipline: row.discipline,
    reviewedUnitKeys: row.reviewed_unit_keys,
    sourceTeamOutcomeIds: row.source_team_outcome_ids,
    adoptionSubjectSnapshot: row.adoption_subject_snapshot,
    adoptionSubjectFingerprint: row.adoption_subject_fingerprint,
    adoptionBindingVersion: 1,
    adoptionBindingFingerprint: row.adoption_binding_fingerprint,
    status: row.status,
    rationale: row.rationale,
    authorityRole: 'dirigente',
    authorityContext: row.authority_context,
    authorityAssignmentId: row.authority_assignment_id ?? undefined,
    adoptedByUserId: row.adopted_by_user_id,
    adoptedAt: row.adopted_at,
    clientRequestId: row.client_request_id,
    materializationCreated: false,
    curriculumInForceChanged: false,
    automaticMasterPromotion: false,
  };
};

export class SupabaseH4BoundCanonicalAdoptionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findActiveDevelopmentAuthority(
    context: WorkspaceActorContext,
  ): Promise<DevelopmentPilotAdoptionAuthority | null> {
    const { data, error } = await this.client
      .from('development_pilot_authority_assignments')
      .select('id,workspace_id,user_id,authority_role,scope,status,previous_workspace_role,basis,source_ref,assigned_at,revoked_at')
      .eq('workspace_id', context.membership.workspaceId)
      .eq('user_id', context.membership.userId)
      .eq('authority_role', 'dirigente')
      .eq('scope', 'BETA_DEVELOPMENT_PILOT')
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw new Error(`Autorità di adozione del pilot non verificabile: ${error.message}`);
    return data ? mapPilotAuthority(data as PilotAuthorityRow) : null;
  }

  async findForHandoff(
    context: WorkspaceActorContext,
    adoptionHandoffId: string,
  ): Promise<H4BoundCanonicalAdoptionReceipt | null> {
    if (!adoptionHandoffId.trim()) throw new Error('L’handoff di adozione è obbligatorio.');
    const { data, error } = await this.client
      .from('h4_bound_canonical_adoption_receipts')
      .select('*')
      .eq('workspace_id', context.membership.workspaceId)
      .eq('adoption_handoff_id', adoptionHandoffId)
      .maybeSingle();

    if (error) throw new Error(`Ricevuta di adozione non leggibile: ${error.message}`);
    return data ? mapReceipt(data as AdoptionRow) : null;
  }

  async record(
    context: WorkspaceActorContext,
    adoptionHandoffId: string,
    rationale: string,
    clientRequestId: string,
  ): Promise<H4BoundCanonicalAdoptionReceipt> {
    if (!adoptionHandoffId.trim() || !rationale.trim() || !clientRequestId.trim()) {
      throw new Error('Handoff, motivazione e identificativo della richiesta sono obbligatori.');
    }

    const { data, error } = await this.client.rpc('record_h4_bound_canonical_adoption_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_adoption_handoff_id: adoptionHandoffId,
      p_rationale: rationale.trim(),
      p_client_request_id: clientRequestId,
    });

    if (error) throw new Error(`Adozione non registrata: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Adozione non registrata: risposta server vuota.');
    return mapReceipt(row as AdoptionRow);
  }
}
