import { describe, expect, it } from 'vitest';
import { assessCanonicalAdoption } from '../domain/institution/canonicalAdoptionContract';
import { canUseCapability } from '../domain/institution/capabilities';
import { projectArenaWorkItem } from '../domain/institution/workQueue';
import type { InstitutionalRevisionDecisionReceipt } from '../domain/revision/sharedDecisionPort';

const receipt = (overrides: Partial<InstitutionalRevisionDecisionReceipt> = {}): InstitutionalRevisionDecisionReceipt => ({
  id: 'receipt-1', workspaceId: 'workspace-1', proposalRef: 'proposal-1', proposalVersionRef: 'version-1', proposalVersionFingerprint: 'fp-1',
  adoptionBinding: { version: 2, targetNodeRef: 'node-1', baseCurriculumVersionRef: 'canonical-v1', bindingFingerprint: 'b'.repeat(64) },
  outcome: 'approve', rationale: 'Delibera motivata', decidedByUserId: 'user-collegio', authorityRole: 'collegio', decidedAt: '2026-09-01T00:00:00.000Z', clientRequestId: 'request-1', ...overrides,
});
const baseInput = () => ({ workspaceId: 'workspace-1', proposalVersionRef: 'version-1', proposalVersionFingerprint: 'fp-1', targetNodeRef: 'node-1', targetCanonicalVersionRef: 'canonical-v1', targetCanonicalState: 'VERIFIED_CURRENT' as const, decisionReceipt: receipt(), decisionValidity: 'VERIFIED_ACTIVE' as const, actor: { role: 'collegio' as const, assurance: 'authenticated-workspace' as const, userId: 'user-collegio' } });

describe('R5/R7A2 Canonical Adoption Contract', () => {
  it('keeps P6 unavailable to all current roles even when authenticated', () => {
    for (const role of ['docente','dipartimento','referente','collegio','dirigente','amministratore'] as const) expect(canUseCapability(role, 'CURRICULUM_ADOPT', 'authenticated-workspace')).toBe(false);
  });
  it('separates institutional decision authority from canonical adoption authority', () => {
    expect(canUseCapability('collegio', 'REVISION_DECIDE', 'authenticated-workspace')).toBe(true);
    expect(canUseCapability('collegio', 'CURRICULUM_ADOPT', 'authenticated-workspace')).toBe(false);
  });
  it('fails closed for a v2-bound approved receipt because adoption authority is not assigned yet', () => {
    const result = assessCanonicalAdoption(baseInput());
    expect(result.readiness).toBe('BLOCKED'); expect(result.blockerCodes).toContain('ADOPTION_CAPABILITY_UNAVAILABLE'); expect(result.blockerCodes).not.toContain('ADOPTION_BINDING_MISSING');
  });
  it('blocks historical receipts that do not carry adoption binding v2', () => {
    const historical = receipt(); delete historical.adoptionBinding;
    const result = assessCanonicalAdoption({ ...baseInput(), decisionReceipt: historical });
    expect(result.blockerCodes).toContain('ADOPTION_BINDING_MISSING');
  });
  it('blocks target node and base curriculum mismatches', () => {
    const targetMismatch = assessCanonicalAdoption({ ...baseInput(), targetNodeRef: 'node-2' });
    expect(targetMismatch.blockerCodes).toContain('TARGET_NODE_MISMATCH');
    const baseMismatch = assessCanonicalAdoption({ ...baseInput(), targetCanonicalVersionRef: 'canonical-v2' });
    expect(baseMismatch.blockerCodes).toContain('BASE_CURRICULUM_VERSION_MISMATCH');
  });
  it('marks reject, defer and return-for-revision as non-adoptive outcomes', () => {
    for (const outcome of ['reject','defer','return-for-revision'] as const) {
      const result = assessCanonicalAdoption({ ...baseInput(), decisionReceipt: receipt({ outcome }) });
      expect(result.readiness).toBe('NOT_APPLICABLE'); expect(result.blockerCodes).toEqual(['NON_ADOPTIVE_DECISION']);
    }
  });
  it('blocks stale validity/target, version/fingerprint/workspace mismatch and repeats', () => {
    let result = assessCanonicalAdoption({ ...baseInput(), decisionValidity: 'UNKNOWN', targetCanonicalState: 'STALE' });
    expect(result.blockerCodes).toContain('DECISION_VALIDITY_NOT_VERIFIED'); expect(result.blockerCodes).toContain('CANONICAL_TARGET_NOT_CURRENT');
    result = assessCanonicalAdoption({ ...baseInput(), workspaceId: 'workspace-2', proposalVersionRef: 'version-2', proposalVersionFingerprint: 'fp-2' });
    expect(result.blockerCodes).toContain('WORKSPACE_MISMATCH'); expect(result.blockerCodes).toContain('PROPOSAL_VERSION_MISMATCH'); expect(result.blockerCodes).toContain('PROPOSAL_FINGERPRINT_MISMATCH');
    result = assessCanonicalAdoption({ ...baseInput(), existingAdoptionReceiptRef: 'adoption-1' }); expect(result.blockerCodes).toContain('ALREADY_ADOPTED');
  });
  it('keeps P6 work items read-only until runtime is implemented', () => {
    const projected = projectArenaWorkItem({ id:'p6-1', processId:'P6_CANONICAL_ADOPTION', title:'Adozione canonica', reason:'Decisione valida presente', queueState:'TO_DECIDE', evidenceState:'READY', requiredCapability:'REVISION_DECIDE', nextActionLabel:'Adotta', consequential:false, authenticatedAuthorityRequired:false, orderKey:'001' }, { role:'collegio', assurance:'authenticated-workspace' });
    expect(projected.requiredCapability).toBe('CURRICULUM_ADOPT'); expect(projected.access).toBe('READ_ONLY'); expect(projected.effectiveBlocker).toMatch(/non implementato/i);
  });
});
