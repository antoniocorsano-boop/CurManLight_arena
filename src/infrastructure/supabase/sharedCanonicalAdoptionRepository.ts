import type { SupabaseClient } from '@supabase/supabase-js';
import type { CanonicalAdoptionReceipt } from '../../domain/institution/canonicalAdoptionContract';
import type {
  SharedCanonicalAdoptionCommand,
  SharedCanonicalAdoptionRepository,
  SharedCanonicalAdoptionResult,
  SharedCanonicalVersionHead,
} from '../../domain/institution/sharedCanonicalAdoptionPort';
import type { SharedWorkspaceRepository, WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import { SupabaseSharedWorkspaceRepository } from './sharedWorkspaceRepository';

const SHA256 = /^[a-f0-9]{64}$/;

const assertContextWorkspace = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (!workspaceId.trim()) throw new Error('Il workspace è obbligatorio.');
  if (context.assurance !== 'authenticated-workspace') throw new Error('L’adozione canonica richiede un workspace autenticato.');
  if (context.membership.workspaceId !== workspaceId) throw new Error('La richiesta non appartiene al workspace autenticato corrente.');
};

const assertCommand = (command: SharedCanonicalAdoptionCommand): void => {
  if (!command.decisionReceiptRef.trim() || !command.proposalRef.trim() || !command.proposalVersionRef.trim()) {
    throw new Error('Decisione, proposta e versione della proposta sono obbligatorie.');
  }
  if (!SHA256.test(command.proposalVersionFingerprint)) throw new Error('L’impronta della proposta deve essere SHA-256 lowercase.');
  if (!command.expectedCurrentCanonicalVersionRef.trim() || !command.candidateCanonicalVersionRef.trim()) {
    throw new Error('Baseline e candidato canonico sono obbligatori.');
  }
  if (command.expectedCurrentCanonicalVersionRef === command.candidateCanonicalVersionRef) {
    throw new Error('Il candidato canonico deve essere distinto dalla baseline corrente.');
  }
  if (!command.clientRequestId.trim()) throw new Error('L’identificativo della richiesta è obbligatorio.');
};

const asHead = (value: unknown): SharedCanonicalVersionHead => {
  const row = value as Partial<SharedCanonicalVersionHead> | null;
  if (!row || typeof row.workspaceId !== 'string' || typeof row.canonicalVersionRef !== 'string' || row.status !== 'ACTIVE' || typeof row.activatedAt !== 'string' || typeof row.adoptionReceiptRef !== 'string') {
    throw new Error('Il server ha restituito una canonical head non valida.');
  }
  return row as SharedCanonicalVersionHead;
};

const asReceipt = (value: unknown): CanonicalAdoptionReceipt => {
  const row = value as Partial<CanonicalAdoptionReceipt> | null;
  if (!row || row.schemaVersion !== 1 || typeof row.id !== 'string' || typeof row.workspaceId !== 'string' || typeof row.decisionReceiptRef !== 'string' || typeof row.proposalRef !== 'string' || typeof row.proposalVersionRef !== 'string' || typeof row.proposalVersionFingerprint !== 'string' || !SHA256.test(row.proposalVersionFingerprint) || typeof row.previousCanonicalVersionRef !== 'string' || typeof row.adoptedCanonicalVersionRef !== 'string' || typeof row.adoptedByUserId !== 'string' || row.adoptedByRole !== 'dirigente' || typeof row.adoptedAt !== 'string' || row.status !== 'ADOPTED') {
    throw new Error('Il server ha restituito una ricevuta di adozione canonica non valida.');
  }
  return row as CanonicalAdoptionReceipt;
};

const asResult = (value: unknown): SharedCanonicalAdoptionResult => {
  const row = value as { receipt?: unknown; previousHead?: unknown; currentHead?: unknown } | null;
  if (!row) throw new Error('Il server non ha restituito l’esito dell’adozione canonica.');
  const receipt = asReceipt(row.receipt);
  const previousHead = asHead(row.previousHead);
  const currentHead = asHead(row.currentHead);
  if (receipt.workspaceId !== currentHead.workspaceId || receipt.workspaceId !== previousHead.workspaceId || receipt.previousCanonicalVersionRef !== previousHead.canonicalVersionRef || receipt.adoptedCanonicalVersionRef !== currentHead.canonicalVersionRef || currentHead.adoptionReceiptRef !== receipt.id) {
    throw new Error('Il server ha restituito un esito di adozione canonicalmente incoerente.');
  }
  return { receipt, previousHead, currentHead };
};

export class SupabaseSharedCanonicalAdoptionRepository implements SharedCanonicalAdoptionRepository {
  private readonly workspaceRepository: SharedWorkspaceRepository;

  constructor(private readonly client: SupabaseClient, workspaceRepository?: SharedWorkspaceRepository) {
    this.workspaceRepository = workspaceRepository ?? new SupabaseSharedWorkspaceRepository(client);
  }

  async getCurrentCanonicalHead(context: WorkspaceActorContext, workspaceId: string): Promise<SharedCanonicalVersionHead | null> {
    assertContextWorkspace(context, workspaceId);
    if (!(await this.workspaceRepository.can(context, 'CURRICULUM_READ'))) throw new Error('CURRICULUM_READ_REQUIRED');
    const { data, error } = await this.client.rpc('get_shared_canonical_head_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: context.membership.userId,
    });
    if (error) throw new Error(`Canonical head non leggibile: ${error.message}`);
    return data == null ? null : asHead(data);
  }

  async findAdoptionForDecision(context: WorkspaceActorContext, decisionReceiptRef: string): Promise<CanonicalAdoptionReceipt | null> {
    assertContextWorkspace(context, context.membership.workspaceId);
    if (!decisionReceiptRef.trim()) throw new Error('La ricevuta decisionale è obbligatoria.');
    if (!(await this.workspaceRepository.can(context, 'CURRICULUM_READ'))) throw new Error('CURRICULUM_READ_REQUIRED');
    const { data, error } = await this.client.rpc('get_canonical_adoption_for_decision_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_decision_receipt_ref: decisionReceiptRef,
    });
    if (error) throw new Error(`Ricevuta di adozione non leggibile: ${error.message}`);
    return data == null ? null : asReceipt(data);
  }

  async adoptCanonicalCurriculum(context: WorkspaceActorContext, command: SharedCanonicalAdoptionCommand): Promise<SharedCanonicalAdoptionResult> {
    assertContextWorkspace(context, command.workspaceId);
    assertCommand(command);
    if (!(await this.workspaceRepository.can(context, 'CURRICULUM_ADOPT'))) throw new Error('CURRICULUM_ADOPT_REQUIRED');
    const { data, error } = await this.client.rpc('adopt_shared_canonical_curriculum_v1', {
      p_workspace_id: command.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_decision_receipt_ref: command.decisionReceiptRef,
      p_proposal_ref: command.proposalRef,
      p_proposal_version_ref: command.proposalVersionRef,
      p_proposal_version_fingerprint: command.proposalVersionFingerprint,
      p_expected_current_canonical_version_ref: command.expectedCurrentCanonicalVersionRef,
      p_candidate_canonical_version_ref: command.candidateCanonicalVersionRef,
      p_client_request_id: command.clientRequestId,
    });
    if (error) throw new Error(`Adozione canonica non registrata: ${error.message}`);
    const result = asResult(data);
    if (result.receipt.adoptedByUserId !== context.membership.userId) throw new Error('Il server non ha vincolato l’adozione al principal autenticato corrente.');
    return result;
  }
}
