import { describe, expect, it } from 'vitest';
import { getRoleCapabilities } from '../domain/institution/capabilities';
import { assessCanonicalAdoption } from '../domain/institution/canonicalAdoptionContract';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  type SharedSubmittedProposalVersion,
  type SubmitSharedProposalVersionCommand,
} from '../domain/revision';
import type { InstitutionalRole } from '../domain/curriculum/types';

const roles: InstitutionalRole[] = [
  'non-dichiarato',
  'docente',
  'dipartimento',
  'referente',
  'collegio',
  'dirigente',
  'amministratore',
];

const sharedVersionFixture = (): SharedSubmittedProposalVersion => ({
  schemaVersion: 1,
  workspaceId: 'workspace-1',
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-version-1',
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload: '{"id":"proposal-version-1"}',
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  submittedByUserId: 'user-1',
  submittedByRole: 'docente',
  submittedAt: '2026-09-01T12:00:00.000Z',
  lifecycleState: 'submitted',
});

const submitCommandFixture = (
  expectedCurrentSharedProposalVersionRef: string | null,
): SubmitSharedProposalVersionCommand => ({
  workspaceId: 'workspace-1',
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-version-1',
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload: '{"id":"proposal-version-1"}',
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  expectedCurrentSharedProposalVersionRef,
  clientRequestId: 'client-request-submit-1',
});

describe('R7A4 shared submitted proposal authority boundary', () => {
  it('keeps draft preparation local and makes submitted the first shared state', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.localPreparationStates).toEqual([
      'draft',
      'ready-for-review',
    ]);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.firstSharedState).toBe('submitted');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresAuthenticatedWorkspace).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiredCapability).toBe('CURRICULUM_PROPOSE');
  });

  it('requires explicit CAS intent for both first and replacement submission', () => {
    const firstSubmission = submitCommandFixture(null);
    const replacement = submitCommandFixture('proposal-version-0');

    expect(firstSubmission.expectedCurrentSharedProposalVersionRef).toBeNull();
    expect(replacement.expectedCurrentSharedProposalVersionRef).toBe('proposal-version-0');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresCompareAndSwapHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.firstSubmissionExpectedHead).toBeNull();
  });

  it('requires immutable submitted versions and no local institutional fallback', () => {
    const version = sharedVersionFixture();
    expect(version.lifecycleState).toBe('submitted');
    expect(version.submittedByRole).not.toBe('non-dichiarato');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.submittedVersionsAreImmutable).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.allowsLocalInstitutionalSuccessFallback).toBe(false);
  });

  it('does not assign CURRICULUM_ADOPT to any current role', () => {
    for (const role of roles) {
      expect(getRoleCapabilities(role)).not.toContain('CURRICULUM_ADOPT');
    }
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.assignsCurriculumAdopt).toBe(false);
  });

  it('does not remove the proposal-authority blocker before runtime authority exists', () => {
    const assessment = assessCanonicalAdoption({
      workspaceId: 'workspace-1',
      proposalVersionRef: 'proposal-version-1',
      proposalVersionFingerprint: 'a'.repeat(64),
      targetNodeRef: 'node-1',
      targetCanonicalVersionRef: 'curriculum-v1',
      targetCanonicalState: 'VERIFIED_CURRENT',
      decisionValidity: 'VERIFIED_ACTIVE',
      actor: {
        role: 'collegio',
        assurance: 'authenticated-workspace',
        userId: 'user-collegio',
      },
      decisionReceipt: {
        id: 'decision-1',
        workspaceId: 'workspace-1',
        proposalRef: 'proposal-1',
        proposalVersionRef: 'proposal-version-1',
        proposalVersionFingerprint: 'a'.repeat(64),
        outcome: 'approve',
        rationale: 'approved',
        decidedByUserId: 'user-collegio',
        authorityRole: 'collegio',
        decidedAt: '2026-09-01T12:00:00.000Z',
        clientRequestId: 'client-request-1',
        adoptionBinding: {
          version: 2,
          bindingFingerprint: 'b'.repeat(64),
          targetNodeRef: 'node-1',
          baseCurriculumVersionRef: 'curriculum-v1',
          proposalSnapshotVersion: 1,
        },
      },
    });

    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.removesProposalAuthorityBlocker).toBe(false);
    expect(assessment.blockerCodes).toContain('PROPOSAL_AUTHORITY_UNAVAILABLE');
    expect(assessment.blockerCodes).toContain('ADOPTION_CAPABILITY_UNAVAILABLE');
    expect(assessment.readiness).toBe('BLOCKED');
  });
});
