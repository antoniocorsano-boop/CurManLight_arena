import type { RevisionProposalVersion } from './types';

export interface RevisionProposalVersionFingerprintPayload {
  id: string;
  proposalRef: string;
  versionNumber: number;
  currentTextSnapshot: string;
  proposedText: string;
  rationale: string;
  sourceRefs: Array<{ id: string; entityType: string; snapshotLabel?: string }>;
  evidenceRefs: Array<{ id: string; entityType: string; snapshotLabel?: string }>;
  createdAt: string;
  structuralFootprint: string;
  previousVersionRef?: string;
  changeNote?: string;
  frozen: true;
}

export const buildRevisionProposalVersionFingerprintPayload = (
  version: RevisionProposalVersion
): RevisionProposalVersionFingerprintPayload => ({
  id: version.id,
  proposalRef: version.proposalRef,
  versionNumber: version.versionNumber,
  currentTextSnapshot: version.currentTextSnapshot,
  proposedText: version.proposedText,
  rationale: version.rationale,
  sourceRefs: version.sourceRefs.map((ref) => ({
    id: ref.id,
    entityType: ref.entityType,
    ...(ref.snapshotLabel ? { snapshotLabel: ref.snapshotLabel } : {}),
  })),
  evidenceRefs: version.evidenceRefs.map((ref) => ({
    id: ref.id,
    entityType: ref.entityType,
    ...(ref.snapshotLabel ? { snapshotLabel: ref.snapshotLabel } : {}),
  })),
  createdAt: version.createdAt,
  structuralFootprint: version.structuralFootprint,
  ...(version.previousVersionRef ? { previousVersionRef: version.previousVersionRef } : {}),
  ...(version.changeNote ? { changeNote: version.changeNote } : {}),
  frozen: true,
});

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');

export const fingerprintRevisionProposalVersion = async (
  version: RevisionProposalVersion
): Promise<string> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SHA-256 non disponibile nel contesto corrente.');
  }

  const payload = JSON.stringify(buildRevisionProposalVersionFingerprintPayload(version));
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(payload)
  );
  return toHex(digest);
};
