import { describe, expect, it } from 'vitest';
import {
  addProposal,
  createEmptyRevisionStore,
  recordDecision,
  type RevisionArchive,
  type RevisionProposal,
} from '../../domain/revision';
import { createEntityReference, generateEntityId } from '../../domain/curriculum/identity';
import type { EntityId, EntityReference } from '../../domain/curriculum/identity';
import type { InstituteCurriculumVersion } from '../../domain/curriculum/version';
import {
  createInstitutionalDecisionQualification,
  type InstitutionalDecisionQualification,
} from '../../domain/revision/institutionalDecisionQualification';
import {
  prepareEffectiveVersionActivation,
  type EffectiveVersionActivationInput,
} from '../../domain/revision/effectiveVersionActivation';

const id = (value: string) => value as EntityId;
const ref = (value: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: id(value),
  entityType,
  snapshotLabel: value,
});

function makeRevision(): { archive: RevisionArchive; proposal: RevisionProposal; decisionId: EntityId } {
  const initial = createEmptyRevisionStore('2026-08-20T10:00:00.000Z');
  const proposalResult = addProposal(initial, {
    targetNodeRef: ref('node-0001', 'curriculum-node'),
    curriculumVersionRef: ref('version-0001', 'curriculum-version'),
    currentTextSnapshot: 'testo corrente',
    proposedText: 'testo revisionato',
    rationale: 'motivazione',
    evidenceRefs: [],
  }, '2026-08-20T10:00:00.000Z');
  if (!proposalResult.success) throw new Error('proposal fixture failed');

  const decisionResult = recordDecision(proposalResult.archive, {
    proposalRef: createEntityReference(proposalResult.proposal.id, 'revision-proposal'),
    proposalVersionRef: createEntityReference(proposalResult.proposal.currentVersionRef, 'revision-proposal'),
    outcome: 'approve',
    rationale: 'decisione registrata',
    authority: { declaredRole: 'collegio-docenti' },
  }, '2026-08-20T11:00:00.000Z');
  if (!decisionResult.success) throw new Error('decision fixture failed');
  const recordedDecision = { ...decisionResult.decision, status: 'recorded-local' as const };

  return {
    archive: { ...decisionResult.archive, decisions: [recordedDecision] },
    proposal: proposalResult.proposal,
    decisionId: recordedDecision.id,
  };
}

function makeQualification(decisionId: EntityId, status: InstitutionalDecisionQualification['status'] = 'qualified') {
  return {
    decisionRef: ref(decisionId, 'decision'),
    authorityRef: { id: generateEntityId(), entityType: 'institute', snapshotLabel: 'authority' },
    status,
    validationRef: { id: generateEntityId(), entityType: 'source', snapshotLabel: 'validation' },
    validatedAt: '2026-08-21',
  } as InstitutionalDecisionQualification;
}

function makeVersions(proposal: RevisionProposal, decisionId: EntityId): InstituteCurriculumVersion[] {
  return [
    {
      id: 'version-0001',
      title: 'Curricolo corrente',
      versionNumber: '1.0',
      status: 'approved',
      approvedAt: '2025-09-01T00:00:00.000Z',
      createdAt: '2025-09-01T00:00:00.000Z',
      updatedAt: '2025-09-01T00:00:00.000Z',
    },
    {
      id: 'version-0002',
      title: 'Curricolo revisionato',
      versionNumber: '1.1',
      status: 'approved',
      approvedAt: '2026-08-22T00:00:00.000Z',
      createdAt: '2026-08-22T00:00:00.000Z',
      updatedAt: '2026-08-22T00:00:00.000Z',
      previousVersionId: proposal.curriculumVersionRef.id,
      revisionProposalId: proposal.id,
      decisionId,
    },
  ];
}

function repository(versions: InstituteCurriculumVersion[]) {
  return {
    list: async () => versions,
    save: async (value: InstituteCurriculumVersion) => {
      const index = versions.findIndex(candidate => candidate.id === value.id);
      if (index >= 0) versions[index] = value;
      else versions.push(value);
    },
  };
}

function validInput(overrides: Partial<EffectiveVersionActivationInput> = {}): EffectiveVersionActivationInput {
  const { archive, proposal, decisionId } = makeRevision();
  const versions = makeVersions(proposal, decisionId);
  return {
    revisionArchive: archive,
    proposalId: proposal.id,
    decisionId,
    versionId: 'version-0002',
    institutionalDecisionQualification: createInstitutionalDecisionQualification(makeQualification(decisionId)),
    versionRepository: repository(versions),
    effectivePeriod: { effectiveFrom: '2026-09-01' },
    ...overrides,
  };
}

describe('CURR-R5-E effective version activation orchestration', () => {
  it('distinguishes approved from effective and activates only the approved derived version', async () => {
    const input = validInput();
    const result = await prepareEffectiveVersionActivation(input);

    expect(result.status).toBe('activated-effective');
    expect(result.version?.status).toBe('effective');
    expect(result.version?.effectiveFrom).toBe('2026-09-01');
    expect(input.versionRepository).toBeDefined();
  });

  it.each(['unverified', 'rejected'] as const)('blocks a %s qualification fail-closed', async status => {
    const input = validInput();
    const invalidQualification = {
      ...input.institutionalDecisionQualification,
      status,
    } as InstitutionalDecisionQualification;
    const result = await prepareEffectiveVersionActivation({
      ...input,
      institutionalDecisionQualification: invalidQualification,
    });

    expect(result.status).toBe('blocked');
  });

  it('blocks proposal, decision, and version reference mismatches', async () => {
    const input = validInput();
    const result = await prepareEffectiveVersionActivation({ ...input, versionId: 'version-0001' });

    expect(result.status).toBe('blocked');
    expect(result.reason).toMatch(/version|derived|proposal|decision/i);
  });

  it('requires strict effective dates and rejects inverted periods', async () => {
    const input = validInput();
    const invalid = await prepareEffectiveVersionActivation({ ...input, effectivePeriod: { effectiveFrom: '2026/09/01' } });
    const inverted = await prepareEffectiveVersionActivation({ ...input, effectivePeriod: { effectiveFrom: '2026-10-01', effectiveTo: '2026-09-01' } });

    expect(invalid.status).toBe('blocked');
    expect(inverted.status).toBe('blocked');
  });

  it('blocks overlap with an already effective version without superseding it', async () => {
    const input = validInput();
    const versions = await input.versionRepository.list();
    versions[0] = {
      ...versions[0],
      status: 'effective',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2027-01-01',
    };
    const result = await prepareEffectiveVersionActivation({ ...input, effectivePeriod: { effectiveFrom: '2026-09-01' } });

    expect(result.status).toBe('blocked');
    expect(versions[0].status).toBe('effective');
  });

  it('blocks overlap with an already approved version without superseding it', async () => {
    const input = validInput();
    const versions = await input.versionRepository.list();
    versions[0] = {
      ...versions[0],
      status: 'approved',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2027-01-01',
    };
    const result = await prepareEffectiveVersionActivation({ ...input, effectivePeriod: { effectiveFrom: '2026-09-01' } });

    expect(result.status).toBe('blocked');
    expect(versions[0].status).toBe('approved');
  });

  it.each(['proposalRef', 'proposalVersionRef'] as const)(
    'blocks a decision reference with the same id but wrong entityType (%s)',
    async referenceName => {
      const input = validInput();
      const decision = input.revisionArchive.decisions[0];
      if (!decision) throw new Error('decision fixture missing');
      const malformedDecision = {
        ...decision,
        [referenceName]: {
          ...decision[referenceName],
          entityType: 'curriculum-version' as const,
        },
      };
      const result = await prepareEffectiveVersionActivation({
        ...input,
        revisionArchive: {
          ...input.revisionArchive,
          decisions: [malformedDecision],
        },
      });

      expect(result.status).toBe('blocked');
    },
  );

  it('preserves the proposal decision qualification version period chain and does not mutate R4 evidence', async () => {
    const input = validInput();
    const before = structuredClone(input.revisionArchive);
    const result = await prepareEffectiveVersionActivation(input);

    expect(result.proposalRef?.id).toBe(input.proposalId);
    expect(result.decisionRef?.id).toBe(input.decisionId);
    expect(result.versionRef?.id).toBe(input.versionId);
    expect(input.revisionArchive).toEqual(before);
    expect(JSON.stringify(result)).not.toMatch(/signature|authentication|protocol/i);
  });
});
