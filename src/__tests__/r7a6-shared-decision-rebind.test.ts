import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import { SupabaseSharedRevisionDecisionRepository } from '../infrastructure/supabase/sharedRevisionDecisionRepository';
import sql from '../../supabase/migrations/20260902070000_r7a6_shared_decision_rebind.sql?raw';

const context: WorkspaceActorContext = {
  assurance: 'authenticated-workspace',
  membership: {
    workspaceId: '11111111-1111-4111-8111-111111111111',
    userId: '22222222-2222-4222-8222-222222222222',
    role: 'collegio',
    status: 'active',
  },
};

const input = {
  workspaceId: context.membership.workspaceId,
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-v1',
  proposalVersionFingerprint: 'a'.repeat(64),
  proposalVersionSnapshotPayload: '{"legacy":"must-not-be-used"}',
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  outcome: 'approve' as const,
  rationale: 'Decisione collegiale.',
  clientRequestId: '33333333-3333-4333-8333-333333333333',
};

const row = {
  id: '44444444-4444-4444-8444-444444444444',
  workspace_id: input.workspaceId,
  proposal_ref: input.proposalRef,
  proposal_version_ref: input.proposalVersionRef,
  proposal_version_fingerprint: input.proposalVersionFingerprint,
  proposal_snapshot_version: null,
  shared_proposal_authority_version: 1,
  adoption_binding_version: 2,
  adoption_target_node_ref: input.targetNodeRef,
  adoption_base_curriculum_version_ref: input.baseCurriculumVersionRef,
  adoption_binding_fingerprint: 'b'.repeat(64),
  outcome: input.outcome,
  rationale: input.rationale,
  decided_by: context.membership.userId,
  authority_role: 'collegio',
  decided_at: '2026-09-02T07:00:00.000Z',
  client_request_id: input.clientRequestId,
};

const allowWorkspace = { can: vi.fn().mockResolvedValue(true) };

describe('R7A6 shared decision rebind', () => {
  it('records through v4 shared authority without freezing the legacy snapshot payload', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [row], error: null });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, allowWorkspace as never);

    await expect(repository.recordInstitutionalDecision(context, input)).resolves.toMatchObject({
      sharedProposalAuthorityVersion: 1,
      proposalVersionRef: input.proposalVersionRef,
    });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('record_institutional_revision_decision_v4', expect.objectContaining({
      p_expected_context_user_id: context.membership.userId,
      p_proposal_version_ref: input.proposalVersionRef,
    }));
    expect(JSON.stringify(rpc.mock.calls)).not.toContain('freeze_institutional_revision_proposal_snapshot_v1');
    expect(JSON.stringify(rpc.mock.calls)).not.toContain('legacy');
  });

  it('reads decisions through a principal-bound RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [row], error: null });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, allowWorkspace as never);

    await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(rpc).toHaveBeenCalledWith('get_institutional_revision_decision_for_shared_version_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_proposal_version_ref: input.proposalVersionRef,
    });
  });

  it('requires current shared head, accepted-for-decision, exact fingerprint and exact scope server-side', () => {
    expect(sql).toContain("v_head is distinct from p_proposal_version_ref");
    expect(sql).toContain("v_shared_state is distinct from 'accepted-for-decision'");
    expect(sql).toContain('v_shared_fingerprint is distinct from p_proposal_version_fingerprint');
    expect(sql).toContain('v_shared_target is distinct from p_target_node_ref');
    expect(sql).toContain('v_shared_base is distinct from p_base_curriculum_version_ref');
  });

  it('binds the context principal and fresh membership before authority success', () => {
    expect(sql).toContain('p_expected_context_user_id <> v_user_id');
    expect(sql).toContain("raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED'");
    expect(sql).toContain("v_role is distinct from 'collegio'");
  });

  it('marks only the new shared authority path and does not materialize canonical adoption', () => {
    expect(sql).toContain('shared_proposal_authority_version');
    expect(sql).toContain('null, 1,');
    expect(sql).not.toContain('CURRICULUM_ADOPT');
    expect(sql).not.toContain('adopt_curriculum');
  });
});
