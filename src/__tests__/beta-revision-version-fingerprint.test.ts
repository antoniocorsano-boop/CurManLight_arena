import { describe, expect, it } from 'vitest';
import type { RevisionProposalVersion } from '../domain/revision';
import { fingerprintRevisionProposalVersion } from '../domain/revision/versionFingerprint';

const version: RevisionProposalVersion = {
  id: 'version-1' as never,
  proposalRef: 'proposal-1' as never,
  versionNumber: 1,
  currentTextSnapshot: 'Testo vigente',
  proposedText: 'Testo proposto',
  rationale: 'Motivazione verificabile',
  sourceRefs: [
    { id: 'source-1' as never, entityType: 'source', snapshotLabel: 'Fonte locale dichiarata' },
  ],
  evidenceRefs: [
    { id: 'evidence-1' as never, entityType: 'source', snapshotLabel: 'Evidenza dichiarata' },
  ],
  createdAt: '2026-08-27T09:30:00.000Z',
  structuralFootprint: 'fp-v1',
  frozen: true,
};

describe('BETA-G4 proposal-version fingerprint', () => {
  it('produce la stessa impronta per la stessa versione immutabile', async () => {
    const first = await fingerprintRevisionProposalVersion(version);
    const second = await fingerprintRevisionProposalVersion({ ...version });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
  });

  it('cambia se cambia il contenuto proposto', async () => {
    const first = await fingerprintRevisionProposalVersion(version);
    const changed = await fingerprintRevisionProposalVersion({
      ...version,
      proposedText: 'Testo proposto modificato',
    });

    expect(changed).not.toBe(first);
  });

  it('cambia se cambia la provenienza della versione', async () => {
    const first = await fingerprintRevisionProposalVersion(version);
    const changed = await fingerprintRevisionProposalVersion({
      ...version,
      sourceRefs: [{ id: 'source-2' as never, entityType: 'source', snapshotLabel: 'Altra fonte' }],
    });

    expect(changed).not.toBe(first);
  });
});
