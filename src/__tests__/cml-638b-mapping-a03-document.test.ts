import { describe, it, expect } from 'vitest';
import type {
  DecisionStatus,
  RevisionArchive,
  RevisionProposalStatus,
  ActorReference,
} from '../domain/revision';
import {
  createEmptyRevisionArchive,
  createProposal,
  createInitialProposalVersion,
  createDecision,
  createDecisionAuthority,
  createInstitutionalContext,
} from '../domain/revision';
import { createEntityReference, type EntityId } from '../domain/curriculum/identity';
import { createEmptyDocumentArchive } from '../domain/documents';
import { getDocumentList, getDocumentHistory } from '../domain/documents/selectors';
import {
  produceCanonicalDocumentFromProposal,
  produceCanonicalDocumentFromDecision,
} from '../features/documents/services/documentProduction';

const actor: ActorReference = {
  displayName: 'Docente Rossi',
  role: 'docente',
  assertion: 'self-declared',
};

interface FixtureOptions {
  proposalStatus?: RevisionProposalStatus;
  proposalHasVersion?: boolean;
  withDecision?: boolean;
  decisionStatus?: DecisionStatus;
  decisionProposalMissing?: boolean;
}

function buildRevisionArchive(options: FixtureOptions = {}): RevisionArchive {
  const archive = createEmptyRevisionArchive();

  const proposal = createProposal({
    targetNodeRef: createEntityReference('node-1' as EntityId, 'curriculum-node', 'Obiettivo 1'),
    curriculumVersionRef: createEntityReference('cv-1' as EntityId, 'curriculum-version'),
    currentTextSnapshot: 'Testo vigente',
    proposedText: 'Testo proposto',
    rationale: 'Motivazione della proposta',
    author: actor,
    sourceRefs: [createEntityReference('src-1' as EntityId, 'source', 'Rapporto di dipartimento')],
    institutionalContext: createInstitutionalContext(createEntityReference('inst-1' as EntityId, 'institute')),
  });

  const version = createInitialProposalVersion(proposal, {
    currentTextSnapshot: 'Testo vigente',
    proposedText: 'Testo proposto',
    rationale: 'Motivazione della proposta',
  });

  const hasVersion = options.proposalHasVersion !== false;
  archive.proposals.push({
    ...proposal,
    status: options.proposalStatus ?? 'accepted-for-decision',
    currentVersionRef: hasVersion ? version.id : proposal.id,
  });
  if (hasVersion) archive.versions.push(version);

  const withDecision = options.withDecision ?? true;
  if (withDecision) {
    const decision = createDecision({
      proposalRef: createEntityReference(proposal.id, 'revision-proposal'),
      proposalVersionRef: createEntityReference(version.id, 'revision-proposal'),
      outcome: 'approve',
      rationale: 'Approvato dal dipartimento',
      authority: createDecisionAuthority('dipartimento'),
      decidedBy: actor,
      sourceRefs: [createEntityReference('src-1' as EntityId, 'source', 'Rapporto di dipartimento')],
    });
    archive.decisions.push({
      ...decision,
      status: options.decisionStatus ?? 'recorded-local',
    });
  }

  if (options.decisionProposalMissing) {
    archive.proposals = [];
  }

  return archive;
}

describe('CML-638B revision → canonical document mapping (A03 → A07)', () => {
  it('creates a revision-proposal document from an approved proposal', () => {
    const revision = buildRevisionArchive();
    const proposalId = revision.proposals[0].id;

    const result = produceCanonicalDocumentFromProposal(proposalId, revision, createEmptyDocumentArchive());

    expect(result.status).toBe('created');
    if (result.status !== 'created') return;

    expect(result.document.documentType).toBe('revision-proposal');
    expect(result.document.status).toBe('draft');
    expect(result.document.metadata.origin).toBe('teacher');
    expect(result.document.originRefs.some((r) => r.entityType === 'revision-proposal' && r.id === proposalId)).toBe(true);
    expect(result.version.versionNumber).toBe(1);
    expect(result.version.frozen).toBe(true);
    expect(getDocumentList(result.archive).length).toBe(1);
  });

  it('is idempotent for proposals: second create returns already-exists', () => {
    const revision = buildRevisionArchive();
    const proposalId = revision.proposals[0].id;
    const first = produceCanonicalDocumentFromProposal(proposalId, revision, createEmptyDocumentArchive());
    if (first.status !== 'created') throw new Error('first create failed');

    const second = produceCanonicalDocumentFromProposal(proposalId, revision, first.archive);
    expect(second.status).toBe('already-exists');
    if (second.status !== 'already-exists') return;
    expect(second.document.id).toBe(first.document.id);
    expect(getDocumentList(first.archive).length).toBe(1);
  });

  it('creates a decision-record document from an active decision', () => {
    const revision = buildRevisionArchive();
    const decisionId = revision.decisions[0].id;

    const result = produceCanonicalDocumentFromDecision(decisionId, revision, createEmptyDocumentArchive());

    expect(result.status).toBe('created');
    if (result.status !== 'created') return;

    expect(result.document.documentType).toBe('decision-record');
    expect(result.document.originRefs.some((r) => r.entityType === 'decision' && r.id === decisionId)).toBe(true);
    expect(result.version.institutionalSnapshot.declaredRole).toBe('dipartimento');
    expect(getDocumentHistory(result.archive, result.document.id).length).toBe(1);
  });

  it('is idempotent for decisions: second create returns already-exists', () => {
    const revision = buildRevisionArchive();
    const decisionId = revision.decisions[0].id;
    const first = produceCanonicalDocumentFromDecision(decisionId, revision, createEmptyDocumentArchive());
    if (first.status !== 'created') throw new Error('first create failed');

    const second = produceCanonicalDocumentFromDecision(decisionId, revision, first.archive);
    expect(second.status).toBe('already-exists');
    expect(getDocumentList(first.archive).length).toBe(1);
  });

  it('returns revision-not-found for an unknown proposal', () => {
    const revision = buildRevisionArchive();
    const result = produceCanonicalDocumentFromProposal('proposal-missing' as EntityId, revision, createEmptyDocumentArchive());
    expect(result.status).toBe('revision-not-found');
    if (result.status === 'revision-not-found') expect(result.kind).toBe('proposal');
  });

  it('returns revision-not-found for an unknown decision', () => {
    const revision = buildRevisionArchive();
    const result = produceCanonicalDocumentFromDecision('decision-missing' as EntityId, revision, createEmptyDocumentArchive());
    expect(result.status).toBe('revision-not-found');
    if (result.status === 'revision-not-found') expect(result.kind).toBe('decision');
  });

  it.each([
    ['withdrawn', 'proposal-withdrawn'],
    ['rejected', 'proposal-rejected'],
    ['archived', 'proposal-archived'],
  ] as const)('refuses a %s proposal', (status, reason) => {
    const revision = buildRevisionArchive({ proposalStatus: status });
    const proposalId = revision.proposals[0].id;
    const result = produceCanonicalDocumentFromProposal(proposalId, revision, createEmptyDocumentArchive());
    expect(result.status).toBe('revision-not-transferable');
    if (result.status === 'revision-not-transferable') expect(result.reason).toBe(reason);
  });

  it('refuses a proposal without a current version', () => {
    const revision = buildRevisionArchive({ proposalHasVersion: false });
    const proposalId = revision.proposals[0].id;
    const result = produceCanonicalDocumentFromProposal(proposalId, revision, createEmptyDocumentArchive());
    expect(result.status).toBe('revision-not-transferable');
    if (result.status === 'revision-not-transferable') expect(result.reason).toBe('proposal-has-no-version');
  });

  it.each(['superseded', 'revoked', 'archived'] as const)('refuses an inactive %s decision', (status) => {
    const revision = buildRevisionArchive({ decisionStatus: status });
    const decisionId = revision.decisions[0].id;
    const result = produceCanonicalDocumentFromDecision(decisionId, revision, createEmptyDocumentArchive());
    expect(result.status).toBe('revision-not-transferable');
    if (result.status === 'revision-not-transferable') expect(result.reason).toBe('decision-inactive');
  });

  it('refuses a decision whose referenced proposal is missing', () => {
    const revision = buildRevisionArchive({ decisionProposalMissing: true });
    const decisionId = revision.decisions[0].id;
    const result = produceCanonicalDocumentFromDecision(decisionId, revision, createEmptyDocumentArchive());
    expect(result.status).toBe('revision-not-transferable');
    if (result.status === 'revision-not-transferable') expect(result.reason).toBe('decision-proposal-missing');
  });

  it('does not mutate the revision archive when creating a document', () => {
    const revision = buildRevisionArchive();
    const snapshot = JSON.parse(JSON.stringify(revision)) as RevisionArchive;
    const proposalId = revision.proposals[0].id;

    produceCanonicalDocumentFromProposal(proposalId, revision, createEmptyDocumentArchive());
    produceCanonicalDocumentFromDecision(revision.decisions[0].id, revision, createEmptyDocumentArchive());
    expect(revision).toEqual(snapshot);
  });

  it('leaves the document archive untouched on refusal', () => {
    const revision = buildRevisionArchive({ proposalStatus: 'rejected' });
    const empty = createEmptyDocumentArchive();
    const snapshot = JSON.parse(JSON.stringify(empty));

    const result = produceCanonicalDocumentFromProposal(revision.proposals[0].id, revision, empty);
    expect(result.status).toBe('revision-not-transferable');
    expect(empty).toEqual(snapshot);
  });
});
