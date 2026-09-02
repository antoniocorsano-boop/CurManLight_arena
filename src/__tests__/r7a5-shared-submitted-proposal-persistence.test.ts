import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import { SupabaseSharedSubmittedProposalRepository } from '../infrastructure/supabase/sharedSubmittedProposalRepository';

const context: WorkspaceActorContext = {
  assurance: 'authenticated-workspace',
  membership: {
    workspaceId: '11111111-1111-4111-8111-111111111111',
    userId: '22222222-2222-4222-8222-222222222222',
    role: 'docente',
    status: 'active',
  },
};

const command = {
  workspaceId: context.membership.workspaceId,
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-v1',
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload: '{"id":"proposal-v1"}',
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  expectedCurrentSharedProposalVersionRef: null,
  clientRequestId: 'request-1',
} as const;

const submitted = {
  schemaVersion: 1,
  workspaceId: context.membership.workspaceId,
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-v1',
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload: command.canonicalPayload,
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  submittedByUserId: context.membership.userId,
  submittedByRole: 'docente',
  submittedAt: '2026-09-02T06:00:00.000Z',
  submittedAtSource: 'server-transaction-clock',
  submittedPrincipalSource: 'server-session',
  lifecycleState: 'submitted',
  previousSharedProposalVersionRef: null,
} as const;

describe('R7A5 shared submitted proposal persistence', () => {
  it('maps first shared submission to the authoritative RPC without changing the frozen command', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: submitted, error: null });
    const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedSubmittedProposalRepository(client);

    await expect(repository.submitVersion(context, command)).resolves.toEqual(submitted);
    expect(rpc).toHaveBeenCalledWith('submit_shared_revision_proposal_version_v1', {
      p_workspace_id: command.workspaceId,
      p_proposal_ref: command.proposalRef,
      p_proposal_version_ref: command.proposalVersionRef,
      p_proposal_version_fingerprint: command.proposalVersionFingerprint,
      p_canonical_payload: command.canonicalPayload,
      p_target_node_ref: command.targetNodeRef,
      p_base_curriculum_version_ref: command.baseCurriculumVersionRef,
      p_expected_current_proposal_version_ref: null,
      p_client_request_id: command.clientRequestId,
    });
  });

  it('rejects workspace mismatch before authority RPC execution', async () => {
    const rpc = vi.fn();
    const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedSubmittedProposalRepository(client);

    await expect(repository.submitVersion(context, { ...command, workspaceId: '33333333-3333-4333-8333-333333333333' }))
      .rejects.toThrow('workspace autenticato');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects non-canonical request ids before persistence lookup', async () => {
    const rpc = vi.fn();
    const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedSubmittedProposalRepository(client);

    await expect(repository.submitVersion(context, { ...command, clientRequestId: ' request-1 ' }))
      .rejects.toThrow('clientRequestId non canonico');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('uses only the closed R7A4 lifecycle policy', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        version: { ...submitted, lifecycleState: 'under-review' },
        receipt: {
          schemaVersion: 1,
          workspaceId: command.workspaceId,
          proposalRef: command.proposalRef,
          proposalVersionRef: command.proposalVersionRef,
          fromState: 'submitted',
          toState: 'under-review',
          capabilityUsed: 'REVISION_REVIEW',
          transitionedByUserId: '33333333-3333-4333-8333-333333333333',
          transitionedByRole: 'dipartimento',
          transitionedAt: '2026-09-02T06:10:00.000Z',
          transitionedAtSource: 'server-transaction-clock',
          transitionedPrincipalSource: 'server-session',
          clientRequestId: 'request-2',
        },
      },
      error: null,
    });
    const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedSubmittedProposalRepository(client);

    await repository.advanceLifecycle(context, {
      workspaceId: command.workspaceId,
      proposalRef: command.proposalRef,
      proposalVersionRef: command.proposalVersionRef,
      expectedLifecycleState: 'submitted',
      nextLifecycleState: 'under-review',
      clientRequestId: 'request-2',
    });

    expect(rpc).toHaveBeenCalledWith('advance_shared_revision_proposal_lifecycle_v1', expect.objectContaining({
      p_expected_lifecycle_state: 'submitted',
      p_next_lifecycle_state: 'under-review',
    }));
  });
});
