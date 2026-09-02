import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SharedWorkspaceRepository, WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import type { InstitutionalRevisionDecisionInput } from '../domain/revision/sharedDecisionPort';
import { SupabaseSharedRevisionDecisionRepository } from '../infrastructure/supabase/sharedRevisionDecisionRepository';

const context: WorkspaceActorContext = {
  membership: { workspaceId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222', role: 'collegio', status: 'active' },
  assurance: 'authenticated-workspace',
};
const input: InstitutionalRevisionDecisionInput = {
  workspaceId: context.membership.workspaceId,
  proposalRef: 'proposal-01',
  proposalVersionRef: 'proposal-version-03',
  proposalVersionFingerprint: 'a'.repeat(64),
  proposalVersionSnapshotPayload: JSON.stringify({ frozen: true }),
  targetNodeRef: 'node-17',
  baseCurriculumVersionRef: 'curriculum-v4',
  outcome: 'approve',
  rationale: 'Decisione assunta sul contenuto revisionato e sulle evidenze mostrate.',
  clientRequestId: '33333333-3333-4333-8333-333333333333',
};
const createWorkspaceRepository = (allowed: boolean): SharedWorkspaceRepository => ({
  getMembership: vi.fn(async () => context.membership),
  can: vi.fn(async () => allowed),
});

const serverRow = (overrides: Record<string, unknown> = {}) => ({
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
  decided_at: '2026-09-01T09:30:00.000Z',
  client_request_id: input.clientRequestId,
  ...overrides,
});

describe('BETA-G4/R7A6 shared institutional decision boundary', () => {
  it('blocca la decisione prima di ogni RPC quando REVISION_DECIDE non è verificata', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(false));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('REVISION_DECIDE');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('scrive soltanto tramite decisione v4 vincolata alla shared proposal authority', async () => {
    const rpc = vi.fn(async () => ({ data: [serverRow()], error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    const receipt = await repository.recordInstitutionalDecision(context, input);

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('record_institutional_revision_decision_v4', {
      p_workspace_id: input.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_proposal_version_fingerprint: input.proposalVersionFingerprint,
      p_target_node_ref: input.targetNodeRef,
      p_base_curriculum_version_ref: input.baseCurriculumVersionRef,
      p_outcome: input.outcome,
      p_rationale: input.rationale,
      p_client_request_id: input.clientRequestId,
    });
    expect(rpc).not.toHaveBeenCalledWith('freeze_institutional_revision_proposal_snapshot_v1', expect.anything());
    expect(rpc).not.toHaveBeenCalledWith('record_institutional_revision_decision_v3', expect.anything());
    expect(receipt.sharedProposalAuthorityVersion).toBe(1);
    expect(receipt.adoptionBinding).toEqual({
      version: 2,
      targetNodeRef: input.targetNodeRef,
      baseCurriculumVersionRef: input.baseCurriculumVersionRef,
      bindingFingerprint: 'b'.repeat(64),
    });
  });

  it('non richiede più il payload snapshot storico per produrre la decisione canonica', async () => {
    const rpc = vi.fn(async () => ({ data: [serverRow()], error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, { ...input, proposalVersionSnapshotPayload: undefined })).resolves.toMatchObject({ sharedProposalAuthorityVersion: 1 });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('fallisce chiuso se il server non marca la decisione come R7A6 authority-bound', async () => {
    const rpc = vi.fn(async () => ({ data: [serverRow({ shared_proposal_authority_version: null })], error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('shared proposal authority');
  });

  it('fallisce chiuso se il server restituisce un binding parziale', async () => {
    const rpc = vi.fn(async () => ({ data: [serverRow({ adoption_binding_fingerprint: null })], error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('binding di adozione incompleto');
  });

  it('fallisce chiuso se il server rifiuta la decisione e non crea fallback locale', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { message: 'SHARED_PROPOSAL_NOT_ACCEPTED_FOR_DECISION' } }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('SHARED_PROPOSAL_NOT_ACCEPTED_FOR_DECISION');
  });

  it('rifiuta un contesto autenticato appartenente a un workspace diverso', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, { ...input, workspaceId: '55555555-5555-4555-8555-555555555555' })).rejects.toThrow('workspace autenticato corrente');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('legge la decisione corrente tramite RPC principal-bound', async () => {
    const rpc = vi.fn(async () => ({ data: serverRow(), error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(rpc).toHaveBeenCalledWith('get_institutional_revision_decision_for_shared_version_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_proposal_version_ref: input.proposalVersionRef,
    });
    expect(receipt?.sharedProposalAuthorityVersion).toBe(1);
  });

  it('resta compatibile in lettura con ricevute R7A2 v2 senza promuoverle a R7A6', async () => {
    const rpc = vi.fn(async () => ({ data: serverRow({ shared_proposal_authority_version: null, proposal_snapshot_version: null }), error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(receipt?.adoptionBinding?.version).toBe(2);
    expect(receipt?.adoptionBinding?.proposalSnapshotVersion).toBeUndefined();
    expect(receipt?.sharedProposalAuthorityVersion).toBeUndefined();
  });

  it('resta compatibile in lettura con ricevute R7A3 snapshot-backed senza promuoverle a R7A6', async () => {
    const rpc = vi.fn(async () => ({ data: serverRow({ shared_proposal_authority_version: null, proposal_snapshot_version: 1 }), error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(receipt?.adoptionBinding?.proposalSnapshotVersion).toBe(1);
    expect(receipt?.sharedProposalAuthorityVersion).toBeUndefined();
  });

  it('resta compatibile in lettura con ricevute storiche prive di binding', async () => {
    const rpc = vi.fn(async () => ({ data: serverRow({
      shared_proposal_authority_version: null,
      proposal_snapshot_version: null,
      adoption_binding_version: null,
      adoption_target_node_ref: null,
      adoption_base_curriculum_version_ref: null,
      adoption_binding_fingerprint: null,
    }), error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(receipt?.adoptionBinding).toBeUndefined();
    expect(receipt?.sharedProposalAuthorityVersion).toBeUndefined();
  });
});
