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

const DECISION_SELECT = [
  'id', 'workspace_id', 'proposal_ref', 'proposal_version_ref',
  'proposal_version_fingerprint', 'adoption_binding_version',
  'adoption_target_node_ref', 'adoption_base_curriculum_version_ref',
  'adoption_binding_fingerprint', 'outcome', 'rationale', 'decided_by',
  'authority_role', 'decided_at', 'client_request_id',
].join(',');

interface InstitutionalDecisionRow {
  id: string; workspace_id: string; proposal_ref: string; proposal_version_ref: string;
  proposal_version_fingerprint: string; adoption_binding_version: number | null;
  adoption_target_node_ref: string | null; adoption_base_curriculum_version_ref: string | null;
  adoption_binding_fingerprint: string | null; outcome: string; rationale: string;
  decided_by: string; authority_role: string; decided_at: string; client_request_id: string;
}

interface FrozenProposalSnapshotRow {
  workspace_id: string;
  proposal_ref: string;
  proposal_version_ref: string;
  proposal_version_fingerprint: string;
  snapshot_payload: string;
}

const isInstitutionalOutcome = (value: string): value is InstitutionalDecisionOutcome =>
  VALID_OUTCOMES.includes(value as InstitutionalDecisionOutcome);

const readAdoptionBinding = (row: InstitutionalDecisionRow): InstitutionalAdoptionBindingV2 | undefined => {
  const fields = [row.adoption_binding_version, row.adoption_target_node_ref, row.adoption_base_curriculum_version_ref, row.adoption_binding_fingerprint];
  if (fields.every((value) => value == null)) return undefined;
  if (row.adoption_binding_version !== 2 || !row.adoption_target_node_ref || !row.adoption_base_curriculum_version_ref || !row.adoption_binding_fingerprint || !/^[a-f0-9]{64}$/.test(row.adoption_binding_fingerprint)) {
    throw new Error('La ricevuta istituzionale contiene un binding di adozione incompleto o non valido.');
  }
  return { version: 2, targetNodeRef: row.adoption_target_node_ref, baseCurriculumVersionRef: row.adoption_base_curriculum_version_ref, bindingFingerprint: row.adoption_binding_fingerprint };
};

const toReceipt = (row: InstitutionalDecisionRow): InstitutionalRevisionDecisionReceipt => {
  if (!isInstitutionalOutcome(row.outcome)) throw new Error('Il server ha restituito un esito di decisione istituzionale non riconosciuto.');
  if (row.authority_role !== 'collegio') throw new Error('Il server ha restituito un ruolo di autorità non ammesso per la Beta.');
  const adoptionBinding = readAdoptionBinding(row);
  return {
    id: row.id, workspaceId: row.workspace_id, proposalRef: row.proposal_ref,
    proposalVersionRef: row.proposal_version_ref, proposalVersionFingerprint: row.proposal_version_fingerprint,
    ...(adoptionBinding ? { adoptionBinding } : {}), outcome: row.outcome, rationale: row.rationale,
    decidedByUserId: row.decided_by, authorityRole: 'collegio', decidedAt: row.decided_at, clientRequestId: row.client_request_id,
  };
};

const assertInput = (input: InstitutionalRevisionDecisionInput): void => {
  if (!input.workspaceId.trim() || !input.proposalRef.trim() || !input.proposalVersionRef.trim()) throw new Error('Workspace, proposta e versione della proposta sono obbligatori.');
  if (!input.targetNodeRef.trim() || !input.baseCurriculumVersionRef.trim()) throw new Error('Nodo target e versione curricolare di base sono obbligatori per una decisione adottabile.');
  if (!/^[a-f0-9]{64}$/i.test(input.proposalVersionFingerprint)) throw new Error('L’impronta della versione della proposta deve essere SHA-256 esadecimale.');
  if (!input.proposalVersionSnapshotPayload?.trim()) throw new Error('Lo snapshot congelato della versione della proposta è obbligatorio.');
  if (!VALID_OUTCOMES.includes(input.outcome)) throw new Error('Esito di decisione istituzionale non ammesso.');
  if (!input.rationale.trim()) throw new Error('La motivazione della decisione istituzionale è obbligatoria.');
  if (!input.clientRequestId.trim()) throw new Error('L’identificativo della richiesta è obbligatorio.');
};

const assertSnapshotReceipt = (row: FrozenProposalSnapshotRow, input: InstitutionalRevisionDecisionInput): void => {
  if (row.workspace_id !== input.workspaceId || row.proposal_ref !== input.proposalRef || row.proposal_version_ref !== input.proposalVersionRef || row.proposal_version_fingerprint !== input.proposalVersionFingerprint.toLowerCase() || row.snapshot_payload !== input.proposalVersionSnapshotPayload) {
    throw new Error('Il server non ha confermato lo stesso snapshot congelato richiesto per la decisione.');
  }
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
    const { data, error } = await this.client.from('institutional_revision_decisions').select(DECISION_SELECT)
      .eq('workspace_id', context.membership.workspaceId).eq('proposal_version_ref', proposalVersionRef)
      .order('decided_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(`Ricevuta istituzionale non leggibile: ${error.message}`);
    return data ? toReceipt(data as unknown as InstitutionalDecisionRow) : null;
  }

  async recordInstitutionalDecision(context: WorkspaceActorContext, input: InstitutionalRevisionDecisionInput): Promise<InstitutionalRevisionDecisionReceipt> {
    assertInput(input);
    if (context.membership.workspaceId !== input.workspaceId) throw new Error('La richiesta non appartiene al workspace autenticato corrente.');
    const allowed = await this.workspaceRepository.can(context, 'REVISION_DECIDE');
    if (!allowed) throw new Error('La membership autenticata non possiede REVISION_DECIDE.');

    const snapshotResult = await this.client.rpc('freeze_institutional_revision_proposal_snapshot_v1', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_expected_fingerprint: input.proposalVersionFingerprint.toLowerCase(),
      p_snapshot_payload: input.proposalVersionSnapshotPayload,
    });
    if (snapshotResult.error) throw new Error(`Snapshot istituzionale non congelato: ${snapshotResult.error.message}`);
    const snapshotRow = Array.isArray(snapshotResult.data) ? snapshotResult.data[0] : snapshotResult.data;
    if (!snapshotRow) throw new Error('Il server non ha restituito lo snapshot congelato della versione.');
    assertSnapshotReceipt(snapshotRow as FrozenProposalSnapshotRow, input);

    const { data, error } = await this.client.rpc('record_institutional_revision_decision_v2', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_proposal_version_fingerprint: input.proposalVersionFingerprint.toLowerCase(),
      p_target_node_ref: input.targetNodeRef,
      p_base_curriculum_version_ref: input.baseCurriculumVersionRef,
      p_outcome: input.outcome,
      p_rationale: input.rationale.trim(),
      p_client_request_id: input.clientRequestId,
    });
    if (error) throw new Error(`Decisione istituzionale non registrata: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Il server non ha restituito la ricevuta della decisione istituzionale.');
    return toReceipt(row as InstitutionalDecisionRow);
  }
}
