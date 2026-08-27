import type { SupabaseClient } from '@supabase/supabase-js';
import type { SharedWorkspaceRepository, WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type {
  InstitutionalDecisionOutcome,
  InstitutionalRevisionDecisionInput,
  InstitutionalRevisionDecisionReceipt,
  SharedRevisionDecisionRepository,
} from '../../domain/revision/sharedDecisionPort';
import { SupabaseSharedWorkspaceRepository } from './sharedWorkspaceRepository';

const VALID_OUTCOMES: readonly InstitutionalDecisionOutcome[] = [
  'approve',
  'approve-with-changes',
  'reject',
  'defer',
  'return-for-revision',
];

interface InstitutionalDecisionRow {
  id: string;
  workspace_id: string;
  proposal_ref: string;
  proposal_version_ref: string;
  proposal_version_fingerprint: string;
  outcome: string;
  rationale: string;
  decided_by: string;
  authority_role: string;
  decided_at: string;
  client_request_id: string;
}

const SELECT_COLUMNS = 'id,workspace_id,proposal_ref,proposal_version_ref,proposal_version_fingerprint,outcome,rationale,decided_by,authority_role,decided_at,client_request_id';

const isInstitutionalOutcome = (value: string): value is InstitutionalDecisionOutcome =>
  VALID_OUTCOMES.includes(value as InstitutionalDecisionOutcome);

const toReceipt = (row: InstitutionalDecisionRow): InstitutionalRevisionDecisionReceipt => {
  if (!isInstitutionalOutcome(row.outcome)) {
    throw new Error('Il server ha restituito un esito di decisione istituzionale non riconosciuto.');
  }
  if (row.authority_role !== 'collegio') {
    throw new Error('Il server ha restituito un ruolo di autorità non ammesso per la Beta.');
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    proposalRef: row.proposal_ref,
    proposalVersionRef: row.proposal_version_ref,
    proposalVersionFingerprint: row.proposal_version_fingerprint,
    outcome: row.outcome,
    rationale: row.rationale,
    decidedByUserId: row.decided_by,
    authorityRole: 'collegio',
    decidedAt: row.decided_at,
    clientRequestId: row.client_request_id,
  };
};

const assertInput = (input: InstitutionalRevisionDecisionInput): void => {
  if (!input.workspaceId.trim() || !input.proposalRef.trim() || !input.proposalVersionRef.trim()) {
    throw new Error('Workspace, proposta e versione della proposta sono obbligatori.');
  }
  if (!/^[a-f0-9]{64}$/i.test(input.proposalVersionFingerprint)) {
    throw new Error('L’impronta della versione della proposta deve essere SHA-256 esadecimale.');
  }
  if (!VALID_OUTCOMES.includes(input.outcome)) {
    throw new Error('Esito di decisione istituzionale non ammesso.');
  }
  if (!input.rationale.trim()) {
    throw new Error('La motivazione della decisione istituzionale è obbligatoria.');
  }
  if (!input.clientRequestId.trim()) {
    throw new Error('L’identificativo della richiesta è obbligatorio.');
  }
};

export class SupabaseSharedRevisionDecisionRepository implements SharedRevisionDecisionRepository {
  private readonly workspaceRepository: SharedWorkspaceRepository;

  constructor(
    private readonly client: SupabaseClient,
    workspaceRepository?: SharedWorkspaceRepository
  ) {
    this.workspaceRepository = workspaceRepository ?? new SupabaseSharedWorkspaceRepository(client);
  }

  async recordInstitutionalDecision(
    context: WorkspaceActorContext,
    input: InstitutionalRevisionDecisionInput
  ): Promise<InstitutionalRevisionDecisionReceipt> {
    assertInput(input);

    if (context.membership.workspaceId !== input.workspaceId) {
      throw new Error('La richiesta non appartiene al workspace autenticato corrente.');
    }

    const allowed = await this.workspaceRepository.can(context, 'REVISION_DECIDE');
    if (!allowed) {
      throw new Error('La membership autenticata non possiede REVISION_DECIDE.');
    }

    const { data, error } = await this.client.rpc('record_institutional_revision_decision', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_proposal_version_fingerprint: input.proposalVersionFingerprint.toLowerCase(),
      p_outcome: input.outcome,
      p_rationale: input.rationale.trim(),
      p_client_request_id: input.clientRequestId,
    });

    if (error) {
      throw new Error(`Decisione istituzionale non registrata: ${error.message}`);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error('Il server non ha restituito la ricevuta della decisione istituzionale.');
    }

    return toReceipt(row as InstitutionalDecisionRow);
  }

  async listInstitutionalDecisions(
    context: WorkspaceActorContext,
    proposalRef: string,
    proposalVersionRef: string
  ): Promise<InstitutionalRevisionDecisionReceipt[]> {
    if (!proposalRef.trim() || !proposalVersionRef.trim()) {
      return [];
    }

    const allowed = await this.workspaceRepository.can(context, 'CURRICULUM_READ');
    if (!allowed) {
      throw new Error('La membership autenticata non può leggere le decisioni del workspace.');
    }

    const { data, error } = await this.client
      .from('institutional_revision_decisions')
      .select(SELECT_COLUMNS)
      .eq('workspace_id', context.membership.workspaceId)
      .eq('proposal_ref', proposalRef)
      .eq('proposal_version_ref', proposalVersionRef)
      .order('decided_at', { ascending: false });

    if (error) {
      throw new Error(`Decisioni istituzionali non leggibili: ${error.message}`);
    }

    return ((data ?? []) as InstitutionalDecisionRow[]).map(toReceipt);
  }
}
