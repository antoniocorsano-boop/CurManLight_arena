import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  getSharedProposalLifecycleTransitionPolicy,
  isCanonicalSharedProposalIdentityRef,
  isCanonicalSharedProposalVersionFingerprint,
  isValidSharedProposalClientRequestId,
  isValidSharedProposalScopeRef,
  type AdvanceSharedProposalLifecycleCommand,
  type SharedProposalLifecycleCommandFor,
  type SharedProposalLifecycleTransitionDefinition,
  type SharedProposalLifecycleTransitionResultFor,
  type SharedProposalVersion,
  type SharedSubmittedProposalAuthorityPort,
  type SharedSubmittedProposalVersion,
  type SubmitSharedProposalVersionCommand,
} from '../../domain/revision';

const VERSION_SELECT = [
  'workspace_id', 'proposal_ref', 'proposal_version_ref', 'proposal_version_fingerprint',
  'canonical_payload', 'lifecycle_state', 'previous_shared_proposal_version_ref',
  'submitted_by', 'submitted_by_role', 'submitted_at',
].join(',');

interface SharedVersionRow {
  workspace_id: string;
  proposal_ref: string;
  proposal_version_ref: string;
  proposal_version_fingerprint: string;
  canonical_payload: string;
  lifecycle_state: SharedProposalVersion['lifecycleState'];
  previous_shared_proposal_version_ref: string | null;
  submitted_by: string;
  submitted_by_role: SharedProposalVersion['submittedByRole'];
  submitted_at: string;
}

interface SharedProposalRow {
  workspace_id: string;
  proposal_ref: string;
  current_proposal_version_ref: string | null;
  target_node_ref: string;
  base_curriculum_version_ref: string;
}

const assertContextWorkspace = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') {
    throw new Error('PROPOSAL_AUTHORITY_UNAVAILABLE');
  }
  if (context.membership.workspaceId !== workspaceId) {
    throw new Error('La richiesta non appartiene al workspace autenticato corrente.');
  }
};

const assertSubmissionCommand = (command: SubmitSharedProposalVersionCommand): void => {
  if (!isCanonicalSharedProposalIdentityRef(command.proposalRef)) throw new Error('proposalRef non canonico.');
  if (!isCanonicalSharedProposalIdentityRef(command.proposalVersionRef)) throw new Error('proposalVersionRef non canonico.');
  if (!isCanonicalSharedProposalVersionFingerprint(command.proposalVersionFingerprint)) throw new Error('Fingerprint proposta non canonico.');
  if (!isValidSharedProposalScopeRef(command.targetNodeRef)) throw new Error('targetNodeRef non canonico.');
  if (!isValidSharedProposalScopeRef(command.baseCurriculumVersionRef)) throw new Error('baseCurriculumVersionRef non canonico.');
  if (!isValidSharedProposalClientRequestId(command.clientRequestId)) throw new Error('clientRequestId non canonico.');
  if (command.expectedCurrentSharedProposalVersionRef !== null && !isCanonicalSharedProposalIdentityRef(command.expectedCurrentSharedProposalVersionRef)) {
    throw new Error('Expected shared head non canonico.');
  }
};

const assertLifecycleCommand = (command: AdvanceSharedProposalLifecycleCommand): void => {
  if (!isCanonicalSharedProposalIdentityRef(command.proposalRef)) throw new Error('proposalRef non canonico.');
  if (!isCanonicalSharedProposalIdentityRef(command.proposalVersionRef)) throw new Error('proposalVersionRef non canonico.');
  if (!isValidSharedProposalClientRequestId(command.clientRequestId)) throw new Error('clientRequestId non canonico.');
  if (!getSharedProposalLifecycleTransitionPolicy(command.expectedLifecycleState, command.nextLifecycleState)) {
    throw new Error('Transizione lifecycle condivisa non ammessa.');
  }
};

const assertSharedVersion = (value: unknown): SharedProposalVersion => {
  if (!value || typeof value !== 'object') throw new Error('Il server non ha restituito una versione condivisa valida.');
  const row = value as SharedProposalVersion;
  if (row.schemaVersion !== 1 || !isCanonicalSharedProposalIdentityRef(row.proposalRef) || !isCanonicalSharedProposalIdentityRef(row.proposalVersionRef) || !isCanonicalSharedProposalVersionFingerprint(row.proposalVersionFingerprint)) {
    throw new Error('La versione condivisa restituita dal server viola il contratto R7A4.');
  }
  return row;
};

const rowToVersion = (row: SharedVersionRow, proposal: SharedProposalRow): SharedProposalVersion => ({
  schemaVersion: 1,
  workspaceId: row.workspace_id,
  proposalRef: row.proposal_ref,
  proposalVersionRef: row.proposal_version_ref,
  proposalVersionFingerprint: row.proposal_version_fingerprint,
  canonicalPayload: row.canonical_payload,
  targetNodeRef: proposal.target_node_ref,
  baseCurriculumVersionRef: proposal.base_curriculum_version_ref,
  submittedByUserId: row.submitted_by,
  submittedByRole: row.submitted_by_role,
  submittedAt: row.submitted_at,
  submittedAtSource: 'server-transaction-clock',
  submittedPrincipalSource: 'server-session',
  lifecycleState: row.lifecycle_state,
  previousSharedProposalVersionRef: row.previous_shared_proposal_version_ref,
});

export class SupabaseSharedSubmittedProposalRepository implements SharedSubmittedProposalAuthorityPort {
  constructor(private readonly client: SupabaseClient) {}

  async submitVersion(context: WorkspaceActorContext, command: SubmitSharedProposalVersionCommand): Promise<SharedSubmittedProposalVersion> {
    assertContextWorkspace(context, command.workspaceId);
    assertSubmissionCommand(command);
    const { data, error } = await this.client.rpc('submit_shared_revision_proposal_version_v1', {
      p_workspace_id: command.workspaceId,
      p_proposal_ref: command.proposalRef,
      p_proposal_version_ref: command.proposalVersionRef,
      p_proposal_version_fingerprint: command.proposalVersionFingerprint,
      p_canonical_payload: command.canonicalPayload,
      p_target_node_ref: command.targetNodeRef,
      p_base_curriculum_version_ref: command.baseCurriculumVersionRef,
      p_expected_current_proposal_version_ref: command.expectedCurrentSharedProposalVersionRef,
      p_client_request_id: command.clientRequestId,
    });
    if (error) throw new Error(`Proposta condivisa non registrata: ${error.message}`);
    const version = assertSharedVersion(data);
    if (version.lifecycleState !== 'submitted') throw new Error('La submission non ha restituito lo stato shared iniziale submitted.');
    return version as SharedSubmittedProposalVersion;
  }

  async advanceLifecycle<T extends SharedProposalLifecycleTransitionDefinition>(
    context: WorkspaceActorContext,
    command: SharedProposalLifecycleCommandFor<T>,
  ): Promise<SharedProposalLifecycleTransitionResultFor<T>> {
    assertContextWorkspace(context, command.workspaceId);
    assertLifecycleCommand(command as AdvanceSharedProposalLifecycleCommand);
    const { data, error } = await this.client.rpc('advance_shared_revision_proposal_lifecycle_v1', {
      p_workspace_id: command.workspaceId,
      p_proposal_ref: command.proposalRef,
      p_proposal_version_ref: command.proposalVersionRef,
      p_expected_lifecycle_state: command.expectedLifecycleState,
      p_next_lifecycle_state: command.nextLifecycleState,
      p_client_request_id: command.clientRequestId,
    });
    if (error) throw new Error(`Lifecycle condiviso non aggiornato: ${error.message}`);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito il risultato lifecycle condiviso.');
    const result = data as unknown as SharedProposalLifecycleTransitionResultFor<T>;
    assertSharedVersion(result.version);
    if (result.version.lifecycleState !== command.nextLifecycleState || result.receipt.fromState !== command.expectedLifecycleState || result.receipt.toState !== command.nextLifecycleState || result.receipt.clientRequestId !== command.clientRequestId) {
      throw new Error('Il risultato lifecycle restituito dal server non corrisponde alla transizione richiesta.');
    }
    return result;
  }

  async getCurrentSharedVersion(context: WorkspaceActorContext, workspaceId: string, proposalRef: string): Promise<SharedProposalVersion | null> {
    assertContextWorkspace(context, workspaceId);
    if (!isCanonicalSharedProposalIdentityRef(proposalRef)) throw new Error('proposalRef non canonico.');
    const proposalResult = await this.client.from('shared_revision_proposals').select('workspace_id,proposal_ref,current_proposal_version_ref,target_node_ref,base_curriculum_version_ref')
      .eq('workspace_id', workspaceId).eq('proposal_ref', proposalRef).maybeSingle();
    if (proposalResult.error) throw new Error(`Head condiviso non leggibile: ${proposalResult.error.message}`);
    const proposal = proposalResult.data as unknown as SharedProposalRow | null;
    if (!proposal?.current_proposal_version_ref) return null;
    return this.readVersionRow(workspaceId, proposal.current_proposal_version_ref, proposal);
  }

  async getSharedVersion(context: WorkspaceActorContext, workspaceId: string, proposalVersionRef: string): Promise<SharedProposalVersion | null> {
    assertContextWorkspace(context, workspaceId);
    if (!isCanonicalSharedProposalIdentityRef(proposalVersionRef)) throw new Error('proposalVersionRef non canonico.');
    const versionResult = await this.client.from('shared_revision_proposal_versions').select(VERSION_SELECT)
      .eq('workspace_id', workspaceId).eq('proposal_version_ref', proposalVersionRef).maybeSingle();
    if (versionResult.error) throw new Error(`Versione condivisa non leggibile: ${versionResult.error.message}`);
    const row = versionResult.data as unknown as SharedVersionRow | null;
    if (!row) return null;
    const proposalResult = await this.client.from('shared_revision_proposals').select('workspace_id,proposal_ref,current_proposal_version_ref,target_node_ref,base_curriculum_version_ref')
      .eq('workspace_id', workspaceId).eq('proposal_ref', row.proposal_ref).maybeSingle();
    if (proposalResult.error) throw new Error(`Scope condiviso non leggibile: ${proposalResult.error.message}`);
    if (!proposalResult.data) throw new Error('Scope condiviso assente per una versione persistita.');
    return rowToVersion(row, proposalResult.data as unknown as SharedProposalRow);
  }

  private async readVersionRow(workspaceId: string, proposalVersionRef: string, proposal: SharedProposalRow): Promise<SharedProposalVersion | null> {
    const { data, error } = await this.client.from('shared_revision_proposal_versions').select(VERSION_SELECT)
      .eq('workspace_id', workspaceId).eq('proposal_version_ref', proposalVersionRef).maybeSingle();
    if (error) throw new Error(`Versione condivisa non leggibile: ${error.message}`);
    return data ? rowToVersion(data as unknown as SharedVersionRow, proposal) : null;
  }
}
