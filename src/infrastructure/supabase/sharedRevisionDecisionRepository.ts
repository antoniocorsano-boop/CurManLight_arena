import type { SupabaseClient } from '@supabase/supabase-js';
import type { SharedWorkspaceRepository, WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type {
  InstitutionalAdoptionBindingV2,
  InstitutionalDecisionOutcome,
  InstitutionalRevisionDecisionInput,
  InstitutionalRevisionDecisionReceipt,
  SharedRevisionDecisionRepository,
} from '../../domain/revision';
import { SupabaseSharedWorkspaceRepository } from './sharedWorkspaceRepository';

const VALID_OUTCOMES: readonly InstitutionalDecisionOutcome[] = [
  'approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision',
];

interface InstitutionalDecisionRow {
  id: string; workspace_id: string; proposal_ref: string; proposal_version_ref: string;
  proposal_version_fingerprint: string; proposal_snapshot_version: number | null;
  shared_proposal_authority_version: number | null;
  adoption_binding_version: number | null; adoption_target_node_ref: string | null;
  adoption_base_curriculum_version_ref: string | null; adoption_binding_fingerprint: string | null;
  outcome: string; rationale: string; decided_by: string; authority_role: string;
  decided_at: string; client_request_id: string;
}

const isInstitutionalOutcome = (value: string): value is InstitutionalDecisionOutcome =>
  VALID_OUTCOMES.includes(value as InstitutionalDecisionOutcome);

const readAdoptionBinding = (row: InstitutionalDecisionRow): InstitutionalAdoptionBindingV2 | undefined => {
  const fields = [row.adoption_binding_version, row.adoption_target_node_ref, row.adoption_base_curriculum_version_ref, row.adoption_binding_fingerprint];
  if (fields.every((value) => value == null)) return undefined;
  if (row.adoption_binding_version !== 2 || !row.adoption_target_node_ref || !row.adoption_base_curriculum_version_ref || !row.adoption_binding_fingerprint || !/^[a-f0-9]{64}$/.test(row.adoption_binding_fingerprint)) {
    throw new Error('La ricevuta istituzionale contiene un binding di adozione incompleto o non valido.');
  }
  if (row.proposal_snapshot_version != null && row.proposal_snapshot_version !== 1) {
    throw new Error('La ricevuta istituzionale contiene un marker snapshot non valido.');
  }
  return {
    version: 2,
    targetNodeRef: row.adoption_target_node_ref,
    baseCurriculumVersionRef: row.adoption_base_curriculum_version_ref,
    bindingFingerprint: row.adoption_binding_fingerprint,
    ...(row.proposal_snapshot_version === 1 ? { proposalSnapshotVersion: 1 as const } : {}),
  };
};

const toReceipt = (row: InstitutionalDecisionRow): InstitutionalRevisionDecisionReceipt => {
  if (!isInstitutionalOutcome(row.outcome)) throw new Error('Il server ha restituito un esito di decisione istituzionale non riconosciuto.');
  if (row.authority_role !== 'collegio') throw new Error('Il server ha restituito un ruolo di autorità non ammesso per la Beta.');
  if (row.shared_proposal_authority_version != null && row.shared_proposal_authority_version !== 1) {
    throw new Error('La ricevuta istituzionale contiene un marker shared authority non valido.');
  }
  const adoptionBinding = readAdoptionBinding(row);
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    proposalRef: row.proposal_ref,
    proposalVersionRef: row.proposal_version_ref,
    proposalVersionFingerprint: row.proposal_version_fingerprint,
    ...(row.shared_proposal_authority_version === 1 ? { sharedProposalAuthorityVersion: 1 as const } : {}),
    ...(adoptionBinding ? { adoptionBinding } : {}),
    outcome: row.outcome,
    rationale: row.rationale,
    decidedByUserId: row.decided_by,
    authorityRole: 'collegio',
    decidedAt: row.decided_at,
    clientRequestId: row.client_request_id,
  };
};

const assertInput = (input: InstitutionalRevisionDecisionInput): void => {
  if (!input.workspaceId.trim() || !input.proposalRef.trim() || !input.proposalVersionRef.trim()) throw new Error('Workspace, proposta e versione della proposta sono obbligatori.');
  if (!input.targetNodeRef.trim() || !input.baseCurriculumVersionRef.trim()) throw new Error('Nodo target e versione curricolare di base sono obbligatori per una decisione adottabile.');
  if (!/^[a-f0-9]{64}$/.test(input.proposalVersionFingerprint)) throw new Error('L’impronta della versione della proposta deve essere SHA-256 esadecimale canonico.');
  if (!VALID_OUTCOMES.includes(input.outcome)) throw new Error('Esito di decisione istituzionale non ammesso.');
  if (!input.rationale.trim()) throw new Error('La motivazione della decisione istituzionale è obbligatoria.');
  if (!input.clientRequestId.trim()) throw new Error('L’identificativo della richiesta è obbligatorio.');
};

export class SupabaseSharedRevisionDecisionRepository implements SharedRevisionDecisionRepository {
  private readonly workspaceRepository: SharedWorkspaceRepository;
  constructor(private readonly client: SupabaseClient, workspaceRepository?: SharedWorkspaceRepository) {
    this.workspaceRepository = workspaceRepository ?? new SupabaseSharedWorkspaceRepository(client);
  }

  async findInstitutionalDecisionForVersion(context: WorkspaceActorContext, proposalVersionRef: string): Promise<InstitutionalRevisionDecisionReceipt | null> {
    if (!proposalVersionRef.trim()) throw new Error('La versione della proposta è obbligatoria.');
    const allowed = await this.workspaceRepository.can(context, 'CURRICULUM_READ');
    if (!allowed) throw new Error('La membership autenticata non può leggere le decisioni del workspace.');
    const { data, error } = await this.client.rpc('get_institutional_revision_decision_for_shared_version_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_proposal_version_ref: proposalVersionRef,
    });
    if (error) throw new Error(`Ricevuta istituzionale non leggibile: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    return row ? toReceipt(row as InstitutionalDecisionRow) : null;
  }

  async recordInstitutionalDecision(context: WorkspaceActorContext, input: InstitutionalRevisionDecisionInput): Promise<InstitutionalRevisionDecisionReceipt> {
    assertInput(input);
    if (context.membership.workspaceId !== input.workspaceId) throw new Error('La richiesta non appartiene al workspace autenticato corrente.');
    const allowed = await this.workspaceRepository.can(context, 'REVISION_DECIDE');
    if (!allowed) throw new Error('La membership autenticata non possiede REVISION_DECIDE.');

    const { data, error } = await this.client.rpc('record_institutional_revision_decision_v4', {
      p_workspace_id: input.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_proposal_version_fingerprint: input.proposalVersionFingerprint,
      p_target_node_ref: input.targetNodeRef,
      p_base_curriculum_version_ref: input.baseCurriculumVersionRef,
      p_outcome: input.outcome,
      p_rationale: input.rationale.trim(),
      p_client_request_id: input.clientRequestId,
    });
    if (error) throw new Error(`Decisione istituzionale non registrata: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Il server non ha restituito la ricevuta della decisione istituzionale.');
    const receipt = toReceipt(row as InstitutionalDecisionRow);
    if (receipt.sharedProposalAuthorityVersion !== 1) {
      throw new Error('Il server non ha marcato la decisione come vincolata alla shared proposal authority.');
    }
    if (!receipt.adoptionBinding || receipt.adoptionBinding.proposalSnapshotVersion === 1) {
      throw new Error('La decisione R7A6 non deve dipendere dal precedente snapshot authority path.');
    }
    return receipt;
  }
}
