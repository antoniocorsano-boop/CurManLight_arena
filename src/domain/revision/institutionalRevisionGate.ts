import type { EntityReference } from '../curriculum/identity';
import type { RevisionArchive } from './types';
import type { CurriculumVersionRepositoryPort } from './curriculumVersionBridge';
import type { InstitutionalDecisionQualification } from './institutionalDecisionQualification';
import { prepareCurriculumVersionFromDecision } from './curriculumVersionBridge';
import { prepareEffectiveVersionActivation } from './effectiveVersionActivation';

export interface InstitutionalRevisionGateInput {
  revisionArchive: RevisionArchive;
  proposalId: string;
  decisionId: string;
  versionId: string;
  institutionalDecisionQualification?: InstitutionalDecisionQualification;
  versionRepository: CurriculumVersionRepositoryPort;
  effectivePeriod: { effectiveFrom?: string; effectiveTo?: string };
}

export interface InstitutionalRevisionGateResult {
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
}

function blocked(
  stages: InstitutionalRevisionGateResult['stages'],
  reason: string,
): InstitutionalRevisionGateResult {
  return { status: 'blocked', stages, reason };
}

export async function runInstitutionalRevisionGate(
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

  const reviewStatuses = new Set(['ready-for-review', 'submitted', 'under-review', 'accepted-for-decision']);
  const reviewStage = reviewStatuses.has(proposal.status) ? 'present' : 'missing';
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
