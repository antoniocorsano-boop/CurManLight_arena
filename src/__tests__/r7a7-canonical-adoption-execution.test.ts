import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SharedWorkspaceRepository, WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import { SupabaseSharedCanonicalAdoptionRepository } from '../infrastructure/supabase/sharedCanonicalAdoptionRepository';

const context: WorkspaceActorContext = {
  membership: { workspaceId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222', role: 'dirigente', status: 'active' },
  assurance: 'authenticated-workspace',
};
const command = {
  workspaceId: context.membership.workspaceId,
  decisionReceiptRef: '33333333-3333-4333-8333-333333333333',
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-version-1',
  proposalVersionFingerprint: 'a'.repeat(64),
  expectedCurrentCanonicalVersionRef: 'canonical-v1',
  candidateCanonicalVersionRef: 'canonical-v2',
  clientRequestId: 'adopt-request-1',
};
const workspaceRepository = (allowed: boolean): SharedWorkspaceRepository => ({
  getMembership: vi.fn(async () => context.membership),
  can: vi.fn(async () => allowed),
});
const receipt = {
  schemaVersion: 1,
  id: '44444444-4444-4444-8444-444444444444',
  workspaceId: command.workspaceId,
  decisionReceiptRef: command.decisionReceiptRef,
  proposalRef: command.proposalRef,
  proposalVersionRef: command.proposalVersionRef,
  proposalVersionFingerprint: command.proposalVersionFingerprint,
  previousCanonicalVersionRef: command.expectedCurrentCanonicalVersionRef,
  adoptedCanonicalVersionRef: command.candidateCanonicalVersionRef,
  adoptedByUserId: context.membership.userId,
  adoptedByRole: 'dirigente',
  adoptedAt: '2026-09-02T08:00:00.000Z',
  status: 'ADOPTED',
};
const result = {
  receipt,
  previousHead: { workspaceId: command.workspaceId, canonicalVersionRef: 'canonical-v1', status: 'ACTIVE', activatedAt: '2026-08-01T08:00:00.000Z', adoptionReceiptRef: 'old-receipt' },
  currentHead: { workspaceId: command.workspaceId, canonicalVersionRef: 'canonical-v2', status: 'ACTIVE', activatedAt: receipt.adoptedAt, adoptionReceiptRef: receipt.id },
};

describe('R7A7 canonical adoption execution', () => {
  it('calls only the authoritative adoption RPC with context principal and CAS refs', async () => {
    const rpc = vi.fn(async () => ({ data: result, error: null }));
    const repository = new SupabaseSharedCanonicalAdoptionRepository({ rpc } as unknown as SupabaseClient, workspaceRepository(true));
    await expect(repository.adoptCanonicalCurriculum(context, command)).resolves.toEqual(result);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('adopt_shared_canonical_curriculum_v1', {
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
  });

  it('blocks before the RPC when CURRICULUM_ADOPT is unavailable', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedCanonicalAdoptionRepository({ rpc } as unknown as SupabaseClient, workspaceRepository(false));
    await expect(repository.adoptCanonicalCurriculum(context, command)).rejects.toThrow('CURRICULUM_ADOPT_REQUIRED');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects stale/self candidate intent before the RPC', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedCanonicalAdoptionRepository({ rpc } as unknown as SupabaseClient, workspaceRepository(true));
    await expect(repository.adoptCanonicalCurriculum(context, { ...command, candidateCanonicalVersionRef: command.expectedCurrentCanonicalVersionRef })).rejects.toThrow('distinto');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('fails closed when the server returns an incoherent receipt/head tuple', async () => {
    const rpc = vi.fn(async () => ({ data: { ...result, currentHead: { ...result.currentHead, adoptionReceiptRef: 'other-receipt' } }, error: null }));
    const repository = new SupabaseSharedCanonicalAdoptionRepository({ rpc } as unknown as SupabaseClient, workspaceRepository(true));
    await expect(repository.adoptCanonicalCurriculum(context, command)).rejects.toThrow('incoerente');
  });

  it('does not convert server rejection into local success', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { message: 'CANONICAL_HEAD_CAS_MISMATCH' } }));
    const repository = new SupabaseSharedCanonicalAdoptionRepository({ rpc } as unknown as SupabaseClient, workspaceRepository(true));
    await expect(repository.adoptCanonicalCurriculum(context, command)).rejects.toThrow('CANONICAL_HEAD_CAS_MISMATCH');
  });
});
