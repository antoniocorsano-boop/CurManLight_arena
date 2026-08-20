import type { EntityReference } from '../curriculum/identity';
import type { InstituteCurriculumVersion } from '../curriculum/version';
import type { RevisionArchive } from './types';
import type { CurriculumVersionRepositoryPort } from './curriculumVersionBridge';
import type { InstitutionalDecisionQualification } from './institutionalDecisionQualification';
import { validateInstitutionalDecisionQualification } from './institutionalDecisionQualification';

export interface EffectiveVersionActivationInput {
  revisionArchive: RevisionArchive;
  proposalId: string;
  decisionId: string;
  versionId: string;
  institutionalDecisionQualification: InstitutionalDecisionQualification;
  versionRepository: CurriculumVersionRepositoryPort;
  effectivePeriod: { effectiveFrom?: string; effectiveTo?: string };
}

export interface EffectiveVersionActivationResult {
  status: 'activated-effective' | 'blocked';
  versionRef?: EntityReference;
  version?: InstituteCurriculumVersion;
  proposalRef?: EntityReference;
  decisionRef?: EntityReference;
  reason?: string;
}

function blocked(reason: string): EffectiveVersionActivationResult {
  return { status: 'blocked', reason };
}

function parseCanonicalDate(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date.getTime();
}

function hasValidPeriod(period: EffectiveVersionActivationInput['effectivePeriod']): boolean {
  const from = parseCanonicalDate(period.effectiveFrom);
  if (from === undefined) return false;
  if (period.effectiveTo === undefined) return true;
  const to = parseCanonicalDate(period.effectiveTo);
  return to !== undefined && from < to;
}

function intervalsOverlap(
  left: { effectiveFrom?: string; effectiveTo?: string },
  right: { effectiveFrom?: string; effectiveTo?: string },
): boolean {
  const leftFrom = parseCanonicalDate(left.effectiveFrom);
  const rightFrom = parseCanonicalDate(right.effectiveFrom);
  if (leftFrom === undefined || rightFrom === undefined) return false;
  const leftTo = left.effectiveTo === undefined ? Number.POSITIVE_INFINITY : parseCanonicalDate(left.effectiveTo);
  const rightTo = right.effectiveTo === undefined ? Number.POSITIVE_INFINITY : parseCanonicalDate(right.effectiveTo);
  if (leftTo === undefined || rightTo === undefined) return false;
  return leftFrom < rightTo && rightFrom < leftTo;
}

export async function prepareEffectiveVersionActivation(
  input: EffectiveVersionActivationInput,
): Promise<EffectiveVersionActivationResult> {
  const proposal = input.revisionArchive.proposals.find(candidate => candidate.id === input.proposalId);
  if (!proposal) return blocked('Revision proposal is not registered.');

  const decision = input.revisionArchive.decisions.find(candidate => candidate.id === input.decisionId);
  if (!decision) return blocked('Decision is not registered through the existing workflow.');
  if (decision.status !== 'recorded-local') return blocked('Only a recorded-local decision can be qualified for activation.');
  if (decision.proposalRef.id !== proposal.id || decision.proposalRef.entityType !== 'revision-proposal') {
    return blocked('Decision does not reference the selected proposal.');
  }
  if (decision.proposalVersionRef.id !== proposal.currentVersionRef) return blocked('Decision does not reference the current proposal version.');
  if (!proposal.decisionRefs.some(reference => reference.id === decision.id && reference.entityType === 'decision')) {
    return blocked('Decision is not linked from the proposal.');
  }
  if (!['approve', 'approve-with-changes'].includes(decision.outcome)) return blocked('Decision outcome does not authorize activation.');

  const qualification = validateInstitutionalDecisionQualification(
    input.institutionalDecisionQualification,
    { id: decision.id, entityType: 'decision' },
  );
  if (!qualification.valid) return blocked(`Institutional decision qualification is invalid: ${qualification.errors.join(' ')}`);

  if (!hasValidPeriod(input.effectivePeriod)) return blocked('Effective period must use valid YYYY-MM-DD dates.');

  const versions = await input.versionRepository.list();
  const version = versions.find(candidate => candidate.id === input.versionId);
  if (!version) return blocked('Target curriculum version is not registered.');
  if (version.status !== 'approved') return blocked('Only an approved version can become effective; approval is not activation.');
  if (version.revisionProposalId !== proposal.id || version.decisionId !== decision.id) {
    return blocked('Target version is not derived from the selected proposal and decision.');
  }
  if (version.previousVersionId !== proposal.curriculumVersionRef.id) {
    return blocked('Target version does not preserve the proposal source version.');
  }

  const conflictingVersion = versions.find(candidate => candidate.id !== version.id
    && (candidate.status === 'effective' || candidate.status === 'approved')
    && intervalsOverlap(candidate, input.effectivePeriod));
  if (conflictingVersion) return blocked(`Effective period overlaps curriculum version '${conflictingVersion.id}'.`);

  const activated: InstituteCurriculumVersion = {
    ...version,
    status: 'effective',
    effectiveFrom: input.effectivePeriod.effectiveFrom,
    effectiveTo: input.effectivePeriod.effectiveTo,
    updatedAt: new Date().toISOString(),
  };
  await input.versionRepository.save(activated);

  return {
    status: 'activated-effective',
    version: activated,
    versionRef: { id: activated.id as never, entityType: 'curriculum-version', snapshotLabel: activated.title },
    proposalRef: { id: proposal.id, entityType: 'revision-proposal' },
    decisionRef: { id: decision.id, entityType: 'decision' },
  };
}
