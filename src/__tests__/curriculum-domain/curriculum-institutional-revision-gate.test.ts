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
  prepareCurriculumVersionFromDecision,
  type CurriculumVersionRepositoryPort,
} from '../../domain/revision/curriculumVersionBridge';
import { prepareEffectiveVersionActivation } from '../../domain/revision/effectiveVersionActivation';
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

function repository(versions: InstituteCurriculumVersion[]): CurriculumVersionRepositoryPort {
  return {
    list: async () => versions,
    save: async (value: InstituteCurriculumVersion) => {
      const index = versions.findIndex(candidate => candidate.id === value.id);
      if (index >= 0) versions[index] = value;
      else versions.push(value);
    },
  };
}

type InstitutionalRevisionGateInput = {
  revisionArchive: RevisionArchive;
  proposalId: string;
  decisionId: string;
  versionId: string;
  institutionalDecisionQualification?: InstitutionalDecisionQualification;
  versionRepository: CurriculumVersionRepositoryPort;
  effectivePeriod: { effectiveFrom?: string; effectiveTo?: string };
};

type InstitutionalRevisionGateResult = {
  status: 'effective' | 'blocked';
  stages: {
    evidence: 'present' | 'missing';
    review: 'present' | 'missing';
    decision: 'recorded-local' | 'missing' | 'invalid';
    qualification: 'qualified' | 'unverified' | 'rejected' | 'missing' | 'invalid';
    version: 'effective' | 'blocked';
  };
  proposalRef?: EntityReference;
  decisionRef?: EntityReference;
  versionRef?: EntityReference;
  effectivePeriod?: { effectiveFrom?: string; effectiveTo?: string };
  reason?: string;
};

function blocked(
  stages: InstitutionalRevisionGateResult['stages'],
  reason: string,
): InstitutionalRevisionGateResult {
  return { status: 'blocked', stages, reason };
}

async function composeInstitutionalRevisionGate(
  input: InstitutionalRevisionGateInput,
): Promise<InstitutionalRevisionGateResult> {
  const proposal = input.revisionArchive.proposals.find(candidate => candidate.id === input.proposalId);
  if (!proposal) {
    return blocked({ evidence: 'missing', review: 'missing', decision: 'missing', qualification: 'missing', version: 'blocked' }, 'Revision proposal is not registered.');
  }

  const evidenceStage = proposal.evidenceRefs.length > 0 ? 'present' : 'missing';
  if (evidenceStage === 'missing') {
    return blocked({ evidence: evidenceStage, review: 'missing', decision: 'missing', qualification: 'missing', version: 'blocked' }, 'R4D evidence is required.');
  }

  const reviewStage = new Set(['ready-for-review', 'submitted', 'under-review', 'accepted-for-decision']).has(proposal.status) ? 'present' : 'missing';
  if (reviewStage === 'missing') {
    return blocked({ evidence: evidenceStage, review: reviewStage, decision: 'missing', qualification: 'missing', version: 'blocked' }, 'Proposal has not reached the existing review workflow.');
  }

  const decision = input.revisionArchive.decisions.find(candidate => candidate.id === input.decisionId);
  if (!decision) {
    return blocked({ evidence: evidenceStage, review: reviewStage, decision: 'missing', qualification: 'missing', version: 'blocked' }, 'Decision is not recorded through the existing workflow.');
  }
  const decisionStage = decision.status === 'recorded-local' ? 'recorded-local' : 'invalid';
  if (decisionStage !== 'recorded-local') {
    return blocked({ evidence: evidenceStage, review: reviewStage, decision: decisionStage, qualification: 'missing', version: 'blocked' }, 'Decision is not recorded-local.');
  }

  const qualificationStatus = input.institutionalDecisionQualification?.status;
  const qualificationStage = qualificationStatus === undefined ? 'missing' : qualificationStatus;
  const bridge = await prepareCurriculumVersionFromDecision({
    revisionArchive: input.revisionArchive,
    proposalId: input.proposalId,
    decisionId: input.decisionId,
    versionRepository: input.versionRepository,
    requireFormalInstitutionalValidation: true,
    institutionalDecisionQualification: input.institutionalDecisionQualification,
  });
  if (bridge.status === 'blocked') {
    return blocked({ evidence: evidenceStage, review: reviewStage, decision: decisionStage, qualification: qualificationStage, version: 'blocked' }, bridge.reason ?? 'Revision version bridge blocked.');
  }

  const activation = await prepareEffectiveVersionActivation({
    revisionArchive: input.revisionArchive,
    proposalId: input.proposalId,
    decisionId: input.decisionId,
    versionId: input.versionId,
    institutionalDecisionQualification: input.institutionalDecisionQualification!,
    versionRepository: input.versionRepository,
    effectivePeriod: input.effectivePeriod,
  });
  if (activation.status === 'blocked') {
    return blocked({ evidence: evidenceStage, review: reviewStage, decision: decisionStage, qualification: qualificationStage, version: 'blocked' }, activation.reason ?? 'Effective version activation blocked.');
  }

  return {
    status: 'effective',
    stages: { evidence: evidenceStage, review: reviewStage, decision: decisionStage, qualification: 'qualified', version: 'effective' },
    proposalRef: activation.proposalRef,
    decisionRef: activation.decisionRef,
    versionRef: activation.versionRef,
    effectivePeriod: input.effectivePeriod,
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
    const result = await composeInstitutionalRevisionGate(input);

    expect(result.status).toBe('effective');
    expect(result.stages).toEqual({ evidence: 'present', review: 'present', decision: 'recorded-local', qualification: 'qualified', version: 'effective' });
    expect(result.proposalRef?.id).toBe(input.proposalId);
    expect(result.decisionRef?.id).toBe(input.decisionId);
    expect(result.versionRef?.id).toBe(input.versionId);
    expect(result.effectivePeriod).toEqual(input.effectivePeriod);
    expect(input.revisionArchive).toEqual(before);
  });

  it('blocks recorded-local decisions without qualification and unverified/rejected qualification', async () => {
    const local = await composeInstitutionalRevisionGate(makeGateInput({ institutionalDecisionQualification: undefined }));
    expect(local.status).toBe('blocked');

    for (const status of ['unverified', 'rejected'] as const) {
      const input = makeGateInput();
      input.institutionalDecisionQualification = {
        ...input.institutionalDecisionQualification!,
        status,
      };
      const result = await composeInstitutionalRevisionGate(input);
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

    const notApproved = await composeInstitutionalRevisionGate(makeGateInput({ versionId: 'version-0001' }));
    expect(notApproved.status).toBe('blocked');

    const invalidPeriod = await composeInstitutionalRevisionGate(makeGateInput({ effectivePeriod: { effectiveFrom: '2026/09/01' } }));
    expect(invalidPeriod.status).toBe('blocked');

    const overlap = makeGateInput();
    const versions = await overlap.versionRepository.list();
    versions[0] = { ...versions[0], status: 'effective', effectiveFrom: '2026-01-01', effectiveTo: '2027-01-01' };
    const overlapping = await composeInstitutionalRevisionGate(overlap);
    expect(overlapping.status).toBe('blocked');
    expect(versions[0].status).toBe('effective');

    const approvedOverlap = makeGateInput();
    const approvedVersions = await approvedOverlap.versionRepository.list();
    approvedVersions[0] = { ...approvedVersions[0], status: 'approved', effectiveFrom: '2026-01-01', effectiveTo: '2027-01-01' };
    const approvedConflict = await composeInstitutionalRevisionGate(approvedOverlap);
    expect(approvedConflict.status).toBe('blocked');
    expect(approvedVersions[0].status).toBe('approved');
  });

  it('does not expose signature, authentication, protocol, or CurriculumLink behavior', async () => {
    const result = await composeInstitutionalRevisionGate(makeGateInput());
    expect(JSON.stringify(result)).not.toMatch(/signature|authentication|protocol|CurriculumLink/i);
  });
});
