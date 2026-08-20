import { describe, expect, it } from 'vitest';
import {
  addProposal,
  createEmptyRevisionStore,
  recordDecision,
  type Decision,
  type RevisionArchive,
  type RevisionProposal,
  type RevisionEvidenceReference,
} from '../../domain/revision';
import { createEntityReference, generateEntityId } from '../../domain/curriculum/identity';
import type { EntityId, EntityReference } from '../../domain/curriculum/identity';
import {
  prepareCurriculumVersionFromDecision,
  type RevisionVersionBridgeInput,
} from '../../domain/revision/curriculumVersionBridge';

const id = (value: string) => value as EntityId;
const ref = (value: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: id(value),
  entityType,
  snapshotLabel: value,
});
const validRef = (label: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: generateEntityId(),
  entityType,
  snapshotLabel: label,
});

const evidence: RevisionEvidenceReference = {
  source: 'R4D',
  reportItemId: 'r4d-item-1',
  frameworkRefs: [validRef('in2012-node-1', 'curriculum-node')],
  provenanceRefs: [validRef('r4d-provenance-1', 'source')],
};

function makeProposalArchive(evidenceRefs: RevisionEvidenceReference[] = [evidence]): {
  archive: RevisionArchive;
  proposal: RevisionProposal;
} {
  const archive = createEmptyRevisionStore('2026-08-20T10:00:00.000Z');
  const result = addProposal(archive, {
    targetNodeRef: ref('node-1', 'curriculum-node'),
    curriculumVersionRef: ref('version-1', 'curriculum-version'),
    currentTextSnapshot: 'testo corrente',
    proposedText: 'testo proposto',
    rationale: 'motivazione',
    evidenceRefs,
  }, '2026-08-20T10:00:00.000Z');
  if (!result.success) throw new Error(result.errors[0]?.message ?? 'fixture proposal creation failed');
  return { archive: result.archive, proposal: result.proposal };
}

function makeRecordedDecision(archive: RevisionArchive, proposal: RevisionProposal, status: Decision['status'] = 'recorded-local') {
  const result = recordDecision(archive, {
    proposalRef: createEntityReference(proposal.id, 'revision-proposal'),
    proposalVersionRef: createEntityReference(proposal.currentVersionRef, 'revision-proposal'),
    outcome: 'approve',
    rationale: 'decisione locale registrata',
    authority: { declaredRole: 'collegio-docenti' },
    effectiveFrom: '2026-09-01T00:00:00.000Z',
  }, '2026-08-20T11:00:00.000Z');
  if (!result.success) throw new Error('fixture decision creation failed');
  const decision = { ...result.decision, status };
  return { archive: { ...result.archive, decisions: [decision] }, decision };
}

const versionRepository = (versions: Array<{ id: string; versionNumber: string; title: string; status: 'draft' | 'under-review' | 'proposed-to-collegio' | 'approved' | 'superseded'; createdAt: string; updatedAt: string; institutionId?: string; effectiveFrom?: string; effectiveTo?: string; previousVersionId?: string; approvedAt?: string }>) => ({
  list: async () => versions,
  save: async (version: typeof versions[number]) => { versions.push(version); },
});

describe('CURR-R5-B revision evidence / decision / version bridge', () => {
  it('keeps R4D evidence as references and does not copy report content', () => {
    const { archive, proposal } = makeProposalArchive();
    expect(proposal.evidenceRefs).toEqual([evidence]);
    expect(JSON.stringify(proposal)).not.toContain('structuralDifference');
    expect(archive.versions[0].evidenceRefs).toEqual([evidence]);
  });

  it('accepts a valid R4D reference and blocks malformed references closed', () => {
    expect(makeProposalArchive([evidence]).proposal.evidenceRefs).toHaveLength(1);
    expect(() => makeProposalArchive([{
      ...evidence,
      reportItemId: '',
    }])).toThrow(/R4D evidence/i);
  });

  it('blocks malformed R4D references with missing arrays instead of throwing TypeError', async () => {
    const { archive, proposal } = makeProposalArchive([]);
    const malformedArchive = {
      ...archive,
      proposals: archive.proposals.map(candidate => candidate.id === proposal.id
        ? { ...candidate, evidenceRefs: [{ source: 'R4D', reportItemId: 'r4d-malformed' }] }
        : candidate),
    } as RevisionArchive;
    const { archive: decided, decision } = makeRecordedDecision(malformedArchive, proposal);

    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
    });

    expect(result).toMatchObject({ status: 'blocked', reason: 'R4D evidence reference is invalid.' });
  });

  it('blocks recorded-local decisions when formal institutional validation is required', async () => {
    const { archive, proposal } = makeProposalArchive();
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal);
    const input: RevisionVersionBridgeInput = {
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([]),
      requireFormalInstitutionalValidation: true,
    };

    const result = await prepareCurriculumVersionFromDecision(input);
    expect(result).toMatchObject({ status: 'blocked' });
    expect(result.reason).toMatch(/formal institutional validation/i);
  });

  it('creates only a draft/proposed version from a valid decision and never effective', async () => {
    const { archive, proposal } = makeProposalArchive();
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal, 'recorded-local');
    const versions: Parameters<typeof versionRepository>[0] = [{
      id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved',
      createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z',
    }];
    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository(versions),
      requireFormalInstitutionalValidation: false,
      targetStatus: 'draft',
    });

    expect(result.status).toBe('created-draft');
    expect(result.version?.status).toBe('draft');
    expect(result.version?.effectiveFrom).toBeUndefined();
    expect(result.version?.approvedAt).toBeUndefined();
    expect(result.proposalRef?.id).toBe(proposal.id);
    expect(result.decisionRef?.id).toBe(decision.id);
  });

  it('requires a valid period before an explicit activation path and rejects effective-only input', async () => {
    const { archive, proposal } = makeProposalArchive();
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal);
    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
      targetStatus: 'approved',
      activation: { effectiveFrom: '2026-09-01T00:00:00.000Z' },
    });

    expect(result.status).toBe('blocked');
    expect(result.reason).toMatch(/approved|activation|period/i);
  });

  it('blocks an unparseable effectiveFrom even when effectiveTo is absent', async () => {
    const { archive, proposal } = makeProposalArchive();
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal);
    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
      activation: { effectiveFrom: 'not-a-date' },
    });

    expect(result).toMatchObject({ status: 'blocked', reason: 'Approval/activation requires a valid effective period.' });
  });

  it('blocks an effective period whose start is not before its end', async () => {
    const { archive, proposal } = makeProposalArchive();
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal);
    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
      activation: { effectiveFrom: '2026-10-01T00:00:00.000Z', effectiveTo: '2026-09-01T00:00:00.000Z' },
    });

    expect(result).toMatchObject({ status: 'blocked', reason: 'Approval/activation requires a valid effective period.' });
  });

  it.each([
    ['2026/09/01', undefined],
    ['2026-9-01', undefined],
    ['2026-02-30', undefined],
  ])('blocks non-canonical or impossible effectiveFrom %s', async (effectiveFrom, effectiveTo) => {
    const { archive, proposal } = makeProposalArchive();
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal);
    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
      activation: { effectiveFrom, effectiveTo },
    });

    expect(result).toMatchObject({ status: 'blocked', reason: 'Approval/activation requires a valid effective period.' });
  });

  it.each([null, 42, 'R4D'])('blocks arbitrary malformed evidence ref %j without throwing', async (malformedEvidence) => {
    const { archive, proposal } = makeProposalArchive([]);
    const malformedArchive = {
      ...archive,
      proposals: archive.proposals.map(candidate => candidate.id === proposal.id
        ? { ...candidate, evidenceRefs: [malformedEvidence] }
        : candidate),
    } as RevisionArchive;
    const { archive: decided, decision } = makeRecordedDecision(malformedArchive, proposal);

    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
    });

    expect(result).toMatchObject({ status: 'blocked', reason: 'R4D evidence reference is invalid.' });
  });

  it('does not mutate the R4 evidence/report input and does not emulate signature or protocol', async () => {
    const { archive, proposal } = makeProposalArchive();
    const before = structuredClone(archive);
    const { archive: decided, decision } = makeRecordedDecision(archive, proposal);
    const input = {
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: versionRepository([{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo corrente', status: 'approved', createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2025-09-01T00:00:00.000Z', approvedAt: '2025-09-01T00:00:00.000Z' }]),
      requireFormalInstitutionalValidation: false,
    } satisfies RevisionVersionBridgeInput;
    const result = await prepareCurriculumVersionFromDecision(input);
    expect(result.status).toBe('created-draft');
    expect(archive.proposals).toEqual(before.proposals);
    expect(JSON.stringify(result)).not.toMatch(/signature|protocol/i);
  });

  it('requires a decision already recorded through the existing repository workflow', async () => {
    const { archive, proposal } = makeProposalArchive();
    const result = await prepareCurriculumVersionFromDecision({
      revisionArchive: archive,
      proposalId: proposal.id,
      decisionId: id('decision-not-recorded'),
      versionRepository: versionRepository([]),
      requireFormalInstitutionalValidation: false,
    });
    expect(result.status).toBe('blocked');
    expect(result.reason).toMatch(/decision/i);
  });
});
