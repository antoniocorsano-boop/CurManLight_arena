import { generateEntityId } from '../curriculum/identity';
import type { EntityReference } from '../curriculum/identity';
import { isValidEntityReference } from '../curriculum/identity/validators';
import type { InstituteCurriculumVersion } from '../curriculum/version';
import type {
  RevisionArchive,
  RevisionEvidenceReference,
} from './types';
import { validateInstitutionalDecisionQualification } from './institutionalDecisionQualification';
import type { InstitutionalDecisionQualification } from './institutionalDecisionQualification';
export type { RevisionEvidenceReference } from './types';

export interface FormalInstitutionalValidation {
  validated: true;
  reference: EntityReference;
}

export interface CurriculumVersionRepositoryPort {
  list(): Promise<InstituteCurriculumVersion[]>;
  save(value: InstituteCurriculumVersion): Promise<void>;
}

export interface RevisionVersionBridgeInput {
  revisionArchive: RevisionArchive;
  proposalId: string;
  decisionId: string;
  versionRepository: CurriculumVersionRepositoryPort;
  requireFormalInstitutionalValidation: boolean;
  formalInstitutionalValidation?: FormalInstitutionalValidation;
  institutionalDecisionQualification?: InstitutionalDecisionQualification;
  targetStatus?: 'draft' | 'proposed-to-collegio' | 'approved';
  activation?: { effectiveFrom?: string; effectiveTo?: string };
}

export interface RevisionVersionBridgeResult {
  status: 'created-draft' | 'blocked';
  versionRef?: EntityReference;
  version?: InstituteCurriculumVersion;
  proposalRef?: EntityReference;
  decisionRef?: EntityReference;
  reason?: string;
}

function blocked(reason: string): RevisionVersionBridgeResult {
  return { status: 'blocked', reason };
}

function isR4DEvidence(value: unknown): value is RevisionEvidenceReference {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as RevisionEvidenceReference;
  return candidate.source === 'R4D'
    && typeof candidate.reportItemId === 'string'
    && candidate.reportItemId.trim().length > 0
    && Array.isArray(candidate.frameworkRefs)
    && Array.isArray(candidate.provenanceRefs)
    && candidate.frameworkRefs.every(ref => isValidEntityReference(ref))
    && candidate.provenanceRefs.every(ref => isValidEntityReference(ref));
}

function isValidRevisionEvidenceRef(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return isR4DEvidence(value) || isValidEntityReference(value);
}

function isValidPeriod(effectiveFrom?: string, effectiveTo?: string): boolean {
  const parseIsoDate = (value: string | undefined): number | undefined => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return undefined;
    }
    return date.getTime();
  };

  const fromTime = parseIsoDate(effectiveFrom);
  if (fromTime === undefined) return false;
  if (!effectiveTo) return true;
  const toTime = parseIsoDate(effectiveTo);
  return toTime !== undefined && fromTime < toTime;
}

export async function prepareCurriculumVersionFromDecision(
  input: RevisionVersionBridgeInput,
): Promise<RevisionVersionBridgeResult> {
  const proposal = input.revisionArchive.proposals.find(candidate => candidate.id === input.proposalId);
  if (!proposal) return blocked('Revision proposal is not registered in the existing revision repository.');

  const decision = input.revisionArchive.decisions.find(candidate => candidate.id === input.decisionId);
  if (!decision) return blocked('Decision must be recorded through the existing recordDecision workflow.');
  if (decision.proposalRef.id !== proposal.id) return blocked('Decision does not reference the selected proposal.');
  if (decision.proposalVersionRef.id !== proposal.currentVersionRef) return blocked('Decision does not reference the current proposal version.');
  if (!proposal.decisionRefs.some(reference => reference.id === decision.id)) return blocked('Decision is not linked from the proposal decision references.');
  if (!['approve', 'approve-with-changes'].includes(decision.outcome)) return blocked('Decision outcome does not authorize version preparation.');
  if (decision.status !== 'recorded-local') return blocked('Decision is not in the existing recorded-local state.');
  if (!decision.authority?.declaredRole) return blocked('Decision authority is required.');
  if (input.formalInstitutionalValidation && !isValidEntityReference(input.formalInstitutionalValidation.reference)) {
    return blocked('Formal institutional validation reference is invalid.');
  }
  if (input.requireFormalInstitutionalValidation) {
    if (!input.institutionalDecisionQualification) {
      return blocked('Formal institutional validation is required; recorded-local is not formal institutional validation.');
    }
    const qualification = validateInstitutionalDecisionQualification(
      input.institutionalDecisionQualification,
      { id: decision.id, entityType: 'decision' },
    );
    if (!qualification.valid) return blocked(`Institutional decision qualification is invalid: ${qualification.errors.join(' ')}`);
  } else if (input.institutionalDecisionQualification) {
    const qualification = validateInstitutionalDecisionQualification(
      input.institutionalDecisionQualification,
      { id: decision.id, entityType: 'decision' },
    );
    if (!qualification.valid) return blocked(`Institutional decision qualification is invalid: ${qualification.errors.join(' ')}`);
  }

  if (proposal.evidenceRefs.some(reference => !isValidRevisionEvidenceRef(reference))) {
    return blocked('R4D evidence reference is invalid.');
  }

  const currentVersions = await input.versionRepository.list();
  const previousVersion = currentVersions.find(version => version.id === proposal.curriculumVersionRef.id);
  if (!previousVersion) return blocked('Proposal curriculum version reference is not resolvable.');

  if (input.targetStatus === 'approved' || input.activation) {
    if (!input.activation || !isValidPeriod(input.activation.effectiveFrom, input.activation.effectiveTo)) {
      return blocked('Approval/activation requires a valid effective period.');
    }
    return blocked('The bridge prepares a draft/proposed version only; approval and activation remain existing institutional workflow steps.');
  }

  const now = new Date().toISOString();
  const version: InstituteCurriculumVersion = {
    id: generateEntityId(),
    institutionId: previousVersion.institutionId,
    title: `${previousVersion.title} — revisione ${proposal.id}`,
    versionNumber: `${previousVersion.versionNumber}.1`,
    status: input.targetStatus ?? 'draft',
    previousVersionId: previousVersion.id,
    revisionProposalId: proposal.id,
    decisionId: decision.id,
    createdAt: now,
    updatedAt: now,
  };
  await input.versionRepository.save(version);

  return {
    status: 'created-draft',
    version,
    versionRef: { id: version.id as never, entityType: 'curriculum-version', snapshotLabel: version.title },
    proposalRef: { id: proposal.id as never, entityType: 'revision-proposal' },
    decisionRef: { id: decision.id as never, entityType: 'decision' },
  };
}
