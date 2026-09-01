import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SharedWorkspaceRepository, WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import type { InstitutionalRevisionDecisionInput } from '../domain/revision/sharedDecisionPort';
import { SupabaseSharedRevisionDecisionRepository } from '../infrastructure/supabase/sharedRevisionDecisionRepository';

const context: WorkspaceActorContext = {
  membership: { workspaceId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222', role: 'collegio', status: 'active' },
  assurance: 'authenticated-workspace',
};
const snapshotPayload = JSON.stringify({
  id: 'proposal-version-03',
  proposalRef: 'proposal-01',
  versionNumber: 3,
  currentTextSnapshot: 'Testo curricolare vigente.',
  proposedText: 'Testo curricolare revisionato.',
  rationale: 'Ragioni della revisione.',
  sourceRefs: [{ id: 'source-1', entityType: 'source', snapshotLabel: 'Fonte deliberata' }],
  evidenceRefs: [{ id: 'evidence-1', entityType: 'curriculum-node', snapshotLabel: 'Evidenza deliberata' }],
  createdAt: '2026-09-01T08:00:00.000Z',
  structuralFootprint: 'text-only',
  previousVersionRef: 'proposal-version-02',
  changeNote: 'Versione pronta per decisione.',
  frozen: true,
});
const input: InstitutionalRevisionDecisionInput = {
  workspaceId: context.membership.workspaceId,
  proposalRef: 'proposal-01',
  proposalVersionRef: 'proposal-version-03',
  proposalVersionFingerprint: 'a'.repeat(64),
  proposalVersionSnapshotPayload: snapshotPayload,
  targetNodeRef: 'node-17',
  baseCurriculumVersionRef: 'curriculum-v4',
  outcome: 'approve',
  rationale: 'Decisione assunta sul contenuto revisionato e sulle evidenze mostrate.',
  clientRequestId: '33333333-3333-4333-8333-333333333333',
};
const createWorkspaceRepository = (allowed: boolean): SharedWorkspaceRepository => ({ getMembership: vi.fn(async () => context.membership), can: vi.fn(async () => allowed) });

const serverRow = (snapshotVersion: number | null = 1) => ({
  id: '44444444-4444-4444-8444-444444444444', workspace_id: input.workspaceId,
  proposal_ref: input.proposalRef, proposal_version_ref: input.proposalVersionRef,
  proposal_version_fingerprint: input.proposalVersionFingerprint,
  proposal_snapshot_version: snapshotVersion,
  adoption_binding_version: 2, adoption_target_node_ref: input.targetNodeRef,
  adoption_base_curriculum_version_ref: input.baseCurriculumVersionRef,
  adoption_binding_fingerprint: 'b'.repeat(64), outcome: input.outcome, rationale: input.rationale,
  decided_by: context.membership.userId, authority_role: 'collegio',
  decided_at: '2026-09-01T09:30:00.000Z', client_request_id: input.clientRequestId,
});
const snapshotRow = () => ({
  workspace_id: input.workspaceId,
  proposal_ref: input.proposalRef,
  proposal_version_ref: input.proposalVersionRef,
  proposal_version_fingerprint: input.proposalVersionFingerprint,
  snapshot_payload: input.proposalVersionSnapshotPayload,
});

const successfulRpc = vi.fn(async (name: string) => name === 'freeze_institutional_revision_proposal_snapshot_v1'
  ? { data: [snapshotRow()], error: null }
  : { data: [serverRow()], error: null });

describe('BETA-G4/R7A3 shared institutional decision boundary', () => {
  it('blocca la decisione prima di ogni RPC quando REVISION_DECIDE non è verificata', async () => {
    const rpc = vi.fn(); const client = { rpc } as unknown as SupabaseClient;
    const repository = new SupabaseSharedRevisionDecisionRepository(client, createWorkspaceRepository(false));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('REVISION_DECIDE');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('congela e verifica lo snapshot prima della RPC decisionale v3', async () => {
    const rpc = vi.fn(async (name: string) => name === 'freeze_institutional_revision_proposal_snapshot_v1'
      ? { data: [snapshotRow()], error: null }
      : { data: [serverRow()], error: null });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    const receipt = await repository.recordInstitutionalDecision(context, input);
    expect(rpc).toHaveBeenNthCalledWith(1, 'freeze_institutional_revision_proposal_snapshot_v1', {
      p_workspace_id: input.workspaceId,
      p_proposal_ref: input.proposalRef,
      p_proposal_version_ref: input.proposalVersionRef,
      p_expected_fingerprint: input.proposalVersionFingerprint,
      p_snapshot_payload: input.proposalVersionSnapshotPayload,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'record_institutional_revision_decision_v3', {
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
    expect(receipt.adoptionBinding).toEqual({ version: 2, targetNodeRef: input.targetNodeRef, baseCurriculumVersionRef: input.baseCurriculumVersionRef, bindingFingerprint: 'b'.repeat(64), proposalSnapshotVersion: 1 });
  });

  it('non chiama la decisione se il server rifiuta il congelamento', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { message: 'FROZEN_PROPOSAL_SNAPSHOT_FINGERPRINT_MISMATCH' } }));
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('FROZEN_PROPOSAL_SNAPSHOT_FINGERPRINT_MISMATCH');
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('fallisce chiuso se la ricevuta snapshot non corrisponde al payload richiesto', async () => {
    const rpc = vi.fn(async (name: string) => name === 'freeze_institutional_revision_proposal_snapshot_v1'
      ? { data: [{ ...snapshotRow(), snapshot_payload: '{"tampered":true}' }], error: null }
      : { data: [serverRow()], error: null });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('stesso snapshot congelato');
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('fallisce chiuso se la decisione v3 non ritorna il marker snapshot', async () => {
    const rpc = vi.fn(async (name: string) => name === 'freeze_institutional_revision_proposal_snapshot_v1'
      ? { data: [snapshotRow()], error: null }
      : { data: [serverRow(null)], error: null });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('snapshot congelato');
  });

  it('rifiuta input privo del payload congelato prima delle RPC', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, { ...input, proposalVersionSnapshotPayload: undefined })).rejects.toThrow('snapshot congelato');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('legge le ricevute R7A2 v2 senza promuoverle implicitamente a snapshot-backed', async () => {
    const legacyV2 = serverRow(null);
    const maybeSingle = vi.fn(async () => ({ data: legacyV2, error: null }));
    const client = { from: vi.fn(() => ({ select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }) }) }) })) } as unknown as SupabaseClient;
    const repository = new SupabaseSharedRevisionDecisionRepository(client, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(receipt?.adoptionBinding?.version).toBe(2);
    expect(receipt?.adoptionBinding?.proposalSnapshotVersion).toBeUndefined();
  });

  it('resta compatibile in lettura con ricevute storiche prive di binding', async () => {
    const historical = { ...serverRow(null), adoption_binding_version: null, adoption_target_node_ref: null, adoption_base_curriculum_version_ref: null, adoption_binding_fingerprint: null };
    const maybeSingle = vi.fn(async () => ({ data: historical, error: null }));
    const client = { from: vi.fn(() => ({ select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }) }) }) })) } as unknown as SupabaseClient;
    const repository = new SupabaseSharedRevisionDecisionRepository(client, createWorkspaceRepository(true));
    const receipt = await repository.findInstitutionalDecisionForVersion(context, input.proposalVersionRef);
    expect(receipt?.adoptionBinding).toBeUndefined();
  });

  it('fallisce chiuso se il server restituisce un binding parziale', async () => {
    const rpc = vi.fn(async (name: string) => name === 'freeze_institutional_revision_proposal_snapshot_v1'
      ? { data: [snapshotRow()], error: null }
      : { data: [{ ...serverRow(), adoption_binding_fingerprint: null }], error: null });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('binding di adozione incompleto');
  });

  it('fallisce chiuso se il server rifiuta la decisione e non crea fallback locale', async () => {
    const rpc = vi.fn(async (name: string) => name === 'freeze_institutional_revision_proposal_snapshot_v1'
      ? { data: [snapshotRow()], error: null }
      : { data: null, error: { message: 'REVISION_DECIDE_REQUIRED' } });
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, input)).rejects.toThrow('REVISION_DECIDE_REQUIRED');
  });

  it('rifiuta un contesto autenticato appartenente a un workspace diverso', async () => {
    const rpc = vi.fn(); const repository = new SupabaseSharedRevisionDecisionRepository({ rpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await expect(repository.recordInstitutionalDecision(context, { ...input, workspaceId: '55555555-5555-4555-8555-555555555555' })).rejects.toThrow('workspace autenticato corrente');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('mantiene il mock di successo coerente con entrambe le RPC', async () => {
    successfulRpc.mockClear();
    const repository = new SupabaseSharedRevisionDecisionRepository({ rpc: successfulRpc } as unknown as SupabaseClient, createWorkspaceRepository(true));
    await repository.recordInstitutionalDecision(context, input);
    expect(successfulRpc).toHaveBeenCalledTimes(2);
  });
});
