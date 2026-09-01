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
  targetNodeRef: 'node-17',
  baseCurriculumVersionRef: 'curriculum-v4',
  outcome: 'approve',
  rationale: 'Decisione assunta sul contenuto revisionato e sulle evidenze mostrate.',
  clientRequestId: '33333333-3333-4333-8333-333333333333',
};
const createWorkspaceRepository = (allowed: boolean): SharedWorkspaceRepository => ({ getMembership: vi.fn(async () => context.membership), can: vi.fn(async () => allowed) });

const serverRow = () => ({
  id: '44444444-4444-4444-8444-444444444444', workspace_id: input.workspaceId,
  proposal_ref: input.proposalRef, proposal_version_ref: input.proposalVersionRef,
  proposal_version_fingerprint: input.proposalVersionFingerprint,
  adoption_binding_version: 2, adoption_target_node_ref: input.targetNodeRef,
  adoption_base_curriculum_version_ref: input.baseCurriculumVersionRef,
  adoption_binding_fingerprint: 'b'.repeat(64), outcome: input.outcome, rationale: input.rationale,
  decided_by: context.membership.userId, authority_role: 'collegio',
  decided_at: '2026-09-01T09:30:00.000Z', client_request_id: input.clientRequestId,
});

describe('BETA-G4 shared institutional decision boundary', () => {
  it('blocca la decisione prima della RPC quando REVISION_DECIDE non è verificata', async () => {
    const rpc = vi.fn(); const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedRevisionDecisionRepository(client, createWorkspaceRepository(false));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('REVISION_DECIDE');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('usa la RPC v2 e lega la decisione a versione, nodo target e baseline', async () => {
    const rpc = vi.fn(async () => ({ data: [serverRow()], error: null }));
    const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedRevisionDecisionRepository(client, createWorkspaceRepository(true));
    const receipt = await repository.recordInstitutionalDecision(context, input);
    expect(rpc).toHaveBeenCalledWith('record_institutional_revision_decision_v2', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_proposal_version_fingerprint: input.proposalVersionFingerprint,
      p_target_node_ref: input.targetNodeRef,
      p_base_curriculum_version_ref: input.baseCurriculumVersionRef,
      p_outcome: input.outcome,
      p_rationale: input.rationale,
      p_client_request_id: input.clientRequestId,
    });
    expect(receipt.adoptionBinding).toEqual({ version: 2, targetNodeRef: input.targetNodeRef, baseCurriculumVersionRef: input.baseCurriculumVersionRef, bindingFingerprint: 'b'.repeat(64) });
  });

  it('resta compatibile in lettura con ricevute storiche prive di binding', async () => {
    const historical = { ...serverRow(), adoption_binding_version: null, adoption_target_node_ref: null, adoption_base_curriculum_version_ref: null, adoption_binding_fingerprint: null };
    const maybeSingle = vi.fn(async () => ({ data: historical, error: null }));
    const client = { from: vi.fn(() => ({ select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }) }) }) })) } as unknown as SupabaseClient;
    const repository = new SupabaseSharedRevisionDecisionRepository(client, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(receipt?.adoptionBinding).toBeUndefined();
  });

  it('fallisce chiuso se il server restituisce un binding parziale', async () => {
    const invalid = { ...serverRow(), adoption_binding_fingerprint: null };
    const rpc = vi.fn(async () => ({ data: [invalid], error: null }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('binding di adozione incompleto');
  });

  it('fallisce chiuso se il server rifiuta la scrittura e non crea fallback locale', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { message: 'REVISION_DECIDE_REQUIRED' } }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('REVISION_DECIDE_REQUIRED');
  });

  it('rifiuta un contesto autenticato appartenente a un workspace diverso', async () => {
    const rpc = vi.fn(); const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, { ...input, workspaceId: '55555555-5555-4555-8555-555555555555' })).rejects.toThrow('workspace autenticato corrente');
    expect(rpc).not.toHaveBeenCalled();
  });
});
