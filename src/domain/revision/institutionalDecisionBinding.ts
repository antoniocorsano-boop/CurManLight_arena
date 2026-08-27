import type { RevisionProposal, RevisionProposalVersion } from './types';

interface StableEntityReference {
  id: string;
  entityType?: string;
  snapshotLabel?: string;
}

const toStableReference = (reference: { id: string; entityType?: string; snapshotLabel?: string }): StableEntityReference => ({
  id: String(reference.id),
  entityType: reference.entityType,
  snapshotLabel: reference.snapshotLabel,
});

/**
 * Produces the exact semantic payload that an institutional decision signs off.
 * No timestamp, UI state or mutable archive field is included.
 */
export const buildInstitutionalDecisionBindingPayload = (
  proposal: RevisionProposal,
  version: RevisionProposalVersion
): string => JSON.stringify({
  schema: 'curmanlight-arena/institutional-decision-binding/v1',
  proposal: {
    id: String(proposal.id),
    targetNodeRef: toStableReference(proposal.targetNodeRef),
    curriculumVersionRef: toStableReference(proposal.curriculumVersionRef),
  },
  version: {
    id: String(version.id),
    versionNumber: version.versionNumber,
    currentTextSnapshot: version.currentTextSnapshot,
    proposedText: version.proposedText,
    rationale: version.rationale,
    sourceRefs: version.sourceRefs.map(toStableReference),
    evidenceRefs: version.evidenceRefs.map(toStableReference),
    structuralFootprint: version.structuralFootprint,
  },
});

export const sha256Hex = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const fingerprintProposalVersionForInstitutionalDecision = async (
  proposal: RevisionProposal,
  version: RevisionProposalVersion
): Promise<string> => sha256Hex(buildInstitutionalDecisionBindingPayload(proposal, version));
