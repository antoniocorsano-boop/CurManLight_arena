import { describe, expect, it } from 'vitest';
import { createEntityReference } from '../domain/curriculum/identity';
import { resolveOperationalRole, type ResolvedWorkspaceRole } from '../domain/permissions';
import { createEmptyRevisionArchive } from '../domain/revision/constructors';
import { addProposal } from '../domain/revision/repository';
import {
  addRevisionProposalVersion,
  createRevisionProposal,
} from '../domain/revision/commands';
import type { RevisionArchive, RevisionProposalStatus } from '../domain/revision/types';

const NOW = '2026-08-03T10:00:00.000Z';

function input() {
  return {
    targetNodeRef: createEntityReference('node-1' as never, 'curriculum-node' as never, 'Nodo 1'),
    curriculumVersionRef: createEntityReference('version-1' as never, 'curriculum-version' as never),
    currentTextSnapshot: 'Testo vigente',
    proposedText: 'Testo proposto',
    rationale: 'Motivazione locale',
  };
}

function role(declaredRole: string | undefined): ResolvedWorkspaceRole {
  return resolveOperationalRole(declaredRole);
}

function archiveWithStatus(status: RevisionProposalStatus): RevisionArchive {
  const created = addProposal(createEmptyRevisionArchive(NOW), input(), NOW);
  if (!created.success) throw new Error('fixture proposal creation failed');
  return {
    ...created.archive,
    proposals: created.archive.proposals.map(proposal => ({ ...proposal, status })),
  };
}

describe('CML-635B3A guarded proposal commands', () => {
  it.each(['docente', 'dipartimento', 'referente'])('creates a local draft for allowed role %s', declaredRole => {
    const result = createRevisionProposal(role(declaredRole), createEmptyRevisionArchive(NOW), input(), NOW);

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error('expected creation to be allowed');
    expect(result.value.proposal.status).toBe('draft');
    expect(result.value.version.versionNumber).toBe(1);
    expect(result.value.version.frozen).toBe(true);
    expect(result.value.proposal.currentVersionRef).toBe(result.value.version.id);
    expect(result.value.archive.events).toHaveLength(1);
    expect(result.value.archive.events[0].eventType).toBe('proposal-created');
  });

  it.each(['dirigente', 'amministratore', undefined, 'future-role'] as const)('denies proposal creation for %s resolution', declaredRole => {
    const archive = createEmptyRevisionArchive(NOW);
    const before = JSON.parse(JSON.stringify(archive));
    const result = createRevisionProposal(role(declaredRole), archive, input(), NOW);

    expect(result).toMatchObject({ ok: false, reason: 'CAPABILITY_NOT_GRANTED' });
    expect(archive).toEqual(before);
  });

  it.each(['draft', 'changes-requested'] as const)('adds an immutable version while proposal is %s', status => {
    const archive = archiveWithStatus(status);
    const proposal = archive.proposals[0];
    const previousVersion = archive.versions[0];

    const result = addRevisionProposalVersion(
      role('docente'),
      archive,
      proposal.id,
      { currentTextSnapshot: 'Testo vigente', proposedText: 'Nuovo testo', changeNote: 'Aggiornamento locale' },
      NOW,
    );

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error('expected version creation to be allowed');
    expect(result.value.proposal.status).toBe(status);
    expect(result.value.version.versionNumber).toBe(2);
    expect(result.value.version.previousVersionRef).toBe(previousVersion.id);
    expect(result.value.version.frozen).toBe(true);
    expect(result.value.archive.proposals[0].currentVersionRef).toBe(result.value.version.id);
    expect(result.value.archive.versions[0]).toEqual(previousVersion);
    expect(result.value.archive.events[result.value.archive.events.length - 1]?.eventType).toBe('version-created');
  });

  it.each(['ready-for-review', 'submitted', 'under-review', 'accepted-for-decision', 'rejected', 'withdrawn', 'archived', 'legacy'] as const)(
    'rejects version creation in non-modifiable state %s without mutation',
    status => {
      const archive = archiveWithStatus(status);
      const before = JSON.parse(JSON.stringify(archive));
      const result = addRevisionProposalVersion(role('docente'), archive, archive.proposals[0].id, {
        currentTextSnapshot: 'Testo vigente',
        proposedText: 'Tentativo vietato',
      }, NOW);

      expect(result).toMatchObject({ ok: false, reason: 'REVISION_DOMAIN_INVALID' });
      expect(archive).toEqual(before);
    },
  );

  it('keeps capability denial distinct from domain/state rejection', () => {
    const archive = archiveWithStatus('archived');
    const denied = addRevisionProposalVersion(role(undefined), archive, archive.proposals[0].id, {
      currentTextSnapshot: 'Testo vigente',
      proposedText: 'Tentativo vietato',
    }, NOW);
    const invalidState = addRevisionProposalVersion(role('docente'), archive, archive.proposals[0].id, {
      currentTextSnapshot: 'Testo vigente',
      proposedText: 'Tentativo vietato',
    }, NOW);

    expect(denied).toMatchObject({ ok: false, reason: 'CAPABILITY_NOT_GRANTED' });
    expect(invalidState).toMatchObject({ ok: false, reason: 'REVISION_DOMAIN_INVALID' });
  });
});
