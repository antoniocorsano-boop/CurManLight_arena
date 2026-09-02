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
  if (
    row.schemaVersion !== 1 ||
    !isCanonicalSharedProposalIdentityRef(row.proposalRef) ||
    !isCanonicalSharedProposalIdentityRef(row.proposalVersionRef) ||
    !isCanonicalSharedProposalVersionFingerprint(row.proposalVersionFingerprint)
  ) {
    throw new Error('La versione condivisa restituita dal server viola il contratto R7A4.');
  }
  return row;
};

const expectedContextUserId = (context: WorkspaceActorContext): string => context.membership.userId;

export class SupabaseSharedSubmittedProposalRepository implements SharedSubmittedProposalAuthorityPort {
  constructor(private readonly client: SupabaseClient) {}

  async submitVersion(context: WorkspaceActorContext, command: SubmitSharedProposalVersionCommand): Promise<SharedSubmittedProposalVersion> {
    assertContextWorkspace(context, command.workspaceId);
    assertSubmissionCommand(command);
    const { data, error } = await this.client.rpc('submit_shared_revision_proposal_version_v1', {
      p_workspace_id: command.workspaceId,
      p_expected_context_user_id: expectedContextUserId(context),
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
    if (version.workspaceId !== command.workspaceId || version.submittedByUserId !== context.membership.userId) {
      throw new Error('La submission condivisa non è legata al WorkspaceActorContext richiesto.');
    }
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
      p_expected_context_user_id: expectedContextUserId(context),
      p_proposal_ref: command.proposalRef,
      p_proposal_version_ref: command.proposalVersionRef,
      p_expected_lifecycle_state: command.expectedLifecycleState,
      p_next_lifecycle_state: command.nextLifecycleState,
      p_client_request_id: command.clientRequestId,
    });
    if (error) throw new Error(`Lifecycle condiviso non aggiornato: ${error.message}`);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito il risultato lifecycle condiviso.');
    const result = data as unknown as SharedProposalLifecycleTransitionResultFor<T>;
    const version = assertSharedVersion(result.version);
    if (
      version.workspaceId !== command.workspaceId ||
      result.version.lifecycleState !== command.nextLifecycleState ||
      result.receipt.fromState !== command.expectedLifecycleState ||
      result.receipt.toState !== command.nextLifecycleState ||
      result.receipt.clientRequestId !== command.clientRequestId ||
      result.receipt.transitionedByUserId !== context.membership.userId
    ) {
      throw new Error('Il risultato lifecycle restituito dal server non corrisponde alla transizione o al principal richiesti.');
    }
    return result;
  }

  async getCurrentSharedVersion(context: WorkspaceActorContext, workspaceId: string, proposalRef: string): Promise<SharedProposalVersion | null> {
    assertContextWorkspace(context, workspaceId);
    if (!isCanonicalSharedProposalIdentityRef(proposalRef)) throw new Error('proposalRef non canonico.');
    const { data, error } = await this.client.rpc('get_current_shared_revision_proposal_version_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: expectedContextUserId(context),
      p_proposal_ref: proposalRef,
    });
    if (error) throw new Error(`Head condiviso non leggibile: ${error.message}`);
    if (data === null) return null;
    const version = assertSharedVersion(data);
    if (version.workspaceId !== workspaceId || version.proposalRef !== proposalRef) {
      throw new Error('Il server ha restituito un head condiviso fuori contesto.');
    }
    return version;
  }

  async getSharedVersion(context: WorkspaceActorContext, workspaceId: string, proposalVersionRef: string): Promise<SharedProposalVersion | null> {
    assertContextWorkspace(context, workspaceId);
    if (!isCanonicalSharedProposalIdentityRef(proposalVersionRef)) throw new Error('proposalVersionRef non canonico.');
    const { data, error } = await this.client.rpc('get_shared_revision_proposal_version_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: expectedContextUserId(context),
      p_proposal_version_ref: proposalVersionRef,
    });
    if (error) throw new Error(`Versione condivisa non leggibile: ${error.message}`);
    if (data === null) return null;
    const version = assertSharedVersion(data);
    if (version.workspaceId !== workspaceId || version.proposalVersionRef !== proposalVersionRef) {
      throw new Error('Il server ha restituito una versione condivisa fuori contesto.');
    }
    return version;
  }
}
