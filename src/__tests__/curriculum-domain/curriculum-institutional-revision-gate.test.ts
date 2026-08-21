import { describe, expect, it } from 'vitest';
import {
  addProposal,
  createEmptyRevisionStore,
  recordDecision,
  transitionProposalStatus,
  type RevisionArchive,
  type RevisionEvidenceReference,
} from '../../domain/revision';
import { createEntityReference, generateEntityId } from '../../domain/curriculum/identity';
import type { EntityId, EntityReference } from '../../domain/curriculum/identity';
import {
  createNationalCurriculumComparisonService,
  createSemanticMappingCandidateService,
  createCurriculumGapContinuityReport,
} from '../../domain/curriculum';
import {
  createInstitutionalDecisionQualification,
  type InstitutionalDecisionQualification,
} from '../../domain/revision/institutionalDecisionQualification';
import {
  runInstitutionalRevisionGate,
  type InstitutionalRevisionGateInput,
} from '../../domain/revision/institutionalRevisionGate';
import { prepareCurriculumVersionFromDecision } from '../../domain/revision/curriculumVersionBridge';
import type { InstituteCurriculumVersion } from '../../domain/curriculum/version';

const id = (value: string) => value as EntityId;
const ref = (value: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: id(value),
  entityType,
  snapshotLabel: value,
});
const generatedRef = (label: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: generateEntityId(),
  entityType,
  snapshotLabel: label,
});

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

function makeR4DEvidence(): RevisionEvidenceReference {
  const comparisonService = createNationalCurriculumComparisonService();
  const candidateService = createSemanticMappingCandidateService(comparisonService);
  const scope = {};
  const comparison = comparisonService.compare('IN2012', 'IN2025', scope);
  const candidates = candidateService.generateCandidates('IN2012', 'IN2025', scope);
  const report = createCurriculumGapContinuityReport(comparison, candidates, scope);
  const finding = report.findings[0];
  if (!finding) throw new Error('R4D fixture produced no finding');

  return {
    source: 'R4D',
    reportItemId: `r4d-${finding.type}`,
    frameworkRefs: finding.frameworks.map(framework => generatedRef(framework, 'source')),
    provenanceRefs: finding.provenance.sources.map(source => generatedRef(source, 'source')),
  };
}

function makeGateInput(overrides: Partial<InstitutionalRevisionGateInput> = {}): InstitutionalRevisionGateInput {
  const evidence = makeR4DEvidence();
  const initial = createEmptyRevisionStore('2026-08-21T10:00:00.000Z');
  const proposalResult = addProposal(initial, {
    targetNodeRef: ref('node-0001', 'curriculum-node'),
    curriculumVersionRef: ref('version-0001', 'curriculum-version'),
    currentTextSnapshot: 'testo corrente',
    proposedText: 'testo revisionato',
    rationale: 'evidenza R4D da sottoporre a revisione',
    evidenceRefs: [evidence],
  }, '2026-08-21T10:00:00.000Z');
  if (!proposalResult.success) throw new Error(`proposal fixture failed: ${JSON.stringify(proposalResult.errors)}`);

  const reviewResult = transitionProposalStatus(
    proposalResult.archive,
    proposalResult.proposal.id,
    'ready-for-review',
    undefined,
    'avvio revisione',
    '2026-08-21T10:01:00.000Z',
  );
  if (!reviewResult.success) throw new Error('review fixture failed');

  const submittedResult = transitionProposalStatus(
    reviewResult.archive,
    proposalResult.proposal.id,
    'submitted',
    undefined,
    'proposta sottoposta',
    '2026-08-21T10:01:30.000Z',
  );
  if (!submittedResult.success) throw new Error('submitted fixture failed');

  const acceptedResult = transitionProposalStatus(
    submittedResult.archive,
    proposalResult.proposal.id,
    'under-review',
    undefined,
    'revisione tecnica',
    '2026-08-21T10:02:00.000Z',
  );
  if (!acceptedResult.success) throw new Error('under-review fixture failed');

  const decisionResult = recordDecision(acceptedResult.archive, {
    proposalRef: createEntityReference(proposalResult.proposal.id, 'revision-proposal'),
    proposalVersionRef: createEntityReference(proposalResult.proposal.currentVersionRef, 'revision-proposal'),
    outcome: 'approve',
    rationale: 'decisione registrata localmente',
    authority: { declaredRole: 'collegio-docenti' },
  }, '2026-08-21T10:03:00.000Z');
  if (!decisionResult.success) throw new Error('decision fixture failed');
  const decision = { ...decisionResult.decision, status: 'recorded-local' as const };
  const archive: RevisionArchive = { ...decisionResult.archive, decisions: [decision] };

  const qualification: InstitutionalDecisionQualification = createInstitutionalDecisionQualification({
    decisionRef: ref(decision.id, 'decision'),
    authorityRef: generatedRef('authority-0001', 'institute'),
    status: 'qualified',
    validationRef: generatedRef('validation-0001', 'source'),
    validatedAt: '2026-08-21',
  });

  const versions: InstituteCurriculumVersion[] = [
    {
      id: 'version-0001',
      title: 'Curricolo corrente',
      versionNumber: '1.0',
      status: 'approved',
      createdAt: '2025-09-01T00:00:00.000Z',
      updatedAt: '2025-09-01T00:00:00.000Z',
      approvedAt: '2025-09-01T00:00:00.000Z',
    },
    {
      id: 'version-0002',
      title: 'Curricolo revisionato',
      versionNumber: '1.1',
      status: 'approved',
      previousVersionId: 'version-0001',
      revisionProposalId: proposalResult.proposal.id,
      decisionId: decision.id,
      createdAt: '2026-08-21T10:04:00.000Z',
      updatedAt: '2026-08-21T10:04:00.000Z',
      approvedAt: '2026-08-21T10:05:00.000Z',
    },
  ];

  return {
    revisionArchive: archive,
    proposalId: proposalResult.proposal.id,
    decisionId: decision.id,
    institutionalDecisionQualification: qualification,
    versionId: 'version-0002',
    versionRepository: repository(versions),
    effectivePeriod: { effectiveFrom: '2026-09-01' },
    ...overrides,
  };
}

describe('CURR-R5-F end-to-end institutional revision gate', () => {
  it('composes R4D evidence, review, decision, qualification, bridge, and activation', async () => {
    const input = makeGateInput();
    const before = structuredClone(input.revisionArchive);
    const result = await runInstitutionalRevisionGate(input);

    expect(result.status).toBe('effective');
    expect(result.stages).toEqual({ evidence: 'present', review: 'present', decision: 'recorded-local', qualification: 'qualified', version: 'effective' });
    expect(result.proposalRef?.id).toBe(input.proposalId);
    expect(result.decisionRef?.id).toBe(input.decisionId);
    expect(result.versionRef?.id).toBe(input.versionId);
    expect(result.effectivePeriod).toEqual(input.effectivePeriod);
    expect(input.revisionArchive).toEqual(before);
  });

  it('blocks recorded-local decisions without qualification and unverified/rejected qualification', async () => {
    const local = await runInstitutionalRevisionGate(makeGateInput({ institutionalDecisionQualification: undefined }));
    expect(local.status).toBe('blocked');

    for (const status of ['unverified', 'rejected'] as const) {
      const input = makeGateInput();
      input.institutionalDecisionQualification = {
        ...input.institutionalDecisionQualification!,
        status,
      };
      const result = await runInstitutionalRevisionGate(input);
      expect(result.status).toBe('blocked');
    }
  });

  it('keeps bridge output non-effective and blocks activation unless version and period are valid', async () => {
    const bridgeInput = makeGateInput();
    const bridgeResult = await prepareCurriculumVersionFromDecision({
      revisionArchive: bridgeInput.revisionArchive,
      proposalId: bridgeInput.proposalId,
      decisionId: bridgeInput.decisionId,
      versionRepository: bridgeInput.versionRepository,
      requireFormalInstitutionalValidation: true,
      institutionalDecisionQualification: bridgeInput.institutionalDecisionQualification,
    });
    expect(bridgeResult.status).toBe('created-draft');
    expect(bridgeResult.version?.status).toBe('draft');
    expect(bridgeResult.version?.effectiveFrom).toBeUndefined();

    const notApproved = await runInstitutionalRevisionGate(makeGateInput({ versionId: 'version-0001' }));
    expect(notApproved.status).toBe('blocked');

    const invalidPeriod = await runInstitutionalRevisionGate(makeGateInput({ effectivePeriod: { effectiveFrom: '2026/09/01' } }));
    expect(invalidPeriod.status).toBe('blocked');

    const overlap = makeGateInput();
    const versions = await overlap.versionRepository.list();
    versions[0] = { ...versions[0], status: 'effective', effectiveFrom: '2026-01-01', effectiveTo: '2027-01-01' };
    const overlapping = await runInstitutionalRevisionGate(overlap);
    expect(overlapping.status).toBe('blocked');
    expect(versions[0].status).toBe('effective');

    const approvedOverlap = makeGateInput();
    const approvedVersions = await approvedOverlap.versionRepository.list();
    approvedVersions[0] = { ...approvedVersions[0], status: 'approved', effectiveFrom: '2026-01-01', effectiveTo: '2027-01-01' };
    const approvedConflict = await runInstitutionalRevisionGate(approvedOverlap);
    expect(approvedConflict.status).toBe('blocked');
    expect(approvedVersions[0].status).toBe('approved');
  });

  it('does not expose signature, authentication, protocol, or CurriculumLink behavior', async () => {
    const result = await runInstitutionalRevisionGate(makeGateInput());
    expect(JSON.stringify(result)).not.toMatch(/signature|authentication|protocol|CurriculumLink/i);
  });
});
