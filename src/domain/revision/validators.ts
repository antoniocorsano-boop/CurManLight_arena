import { isValidEntityId } from '../curriculum/identity';
import { isValidEntityReference } from '../curriculum/identity/validators';
import type {
  RevisionArchive,
  RevisionProposal,
  Decision,
  RevisionError,
  RevisionWarning,
  RevisionValidationResult,
  RevisionEvidenceRef,
} from './types';
import {
  REVISION_ARCHIVE_SCHEMA_VERSION,
  VALID_PROPOSAL_STATUSES,
  VALID_DECISION_STATUSES,
  VALID_DECISION_OUTCOMES,
  canTransitionProposalStatus,
  canTransitionDecisionStatus,
} from './vocabularies';

function error(code: string, message: string, field?: string): RevisionError {
  return { code, message, field };
}

function isRevisionEvidenceReference(value: unknown): value is RevisionEvidenceRef {
  if (!value || typeof value !== 'object') return false;
  if (isValidEntityReference(value)) return true;
  const candidate = value as Extract<RevisionEvidenceRef, { source: 'R4D' }>;
  return candidate.source === 'R4D'
    && typeof candidate.reportItemId === 'string'
    && candidate.reportItemId.trim().length > 0
    && Array.isArray(candidate.frameworkRefs)
    && Array.isArray(candidate.provenanceRefs)
    && candidate.frameworkRefs.every(ref => isValidEntityReference(ref))
    && candidate.provenanceRefs.every(ref => isValidEntityReference(ref));
}

export function validateProposal(proposal: unknown): RevisionValidationResult {
  const errors: RevisionError[] = [];
  if (!proposal || typeof proposal !== 'object') {
    return { valid: false, errors: [error('INVALID_PROPOSAL', 'Proposal must be an object')], warnings: [] };
  }
  const p = proposal as Record<string, unknown>;
  if (typeof p.id !== 'string' || !isValidEntityId(p.id)) errors.push(error('INVALID_ID', 'Invalid proposal id', 'id'));
  if (!VALID_PROPOSAL_STATUSES.includes(p.status as never)) errors.push(error('INVALID_STATUS', `Invalid status: ${String(p.status)}`, 'status'));
  if (!p.targetNodeRef || typeof p.targetNodeRef !== 'object') errors.push(error('MISSING_TARGET_NODE', 'targetNodeRef required', 'targetNodeRef'));
  if (!p.curriculumVersionRef || typeof p.curriculumVersionRef !== 'object') errors.push(error('MISSING_CURRICULUM_VERSION', 'curriculumVersionRef required', 'curriculumVersionRef'));
  if (typeof p.currentTextSnapshot !== 'string') errors.push(error('MISSING_SNAPSHOT', 'currentTextSnapshot required', 'currentTextSnapshot'));
  if (typeof p.proposedText !== 'string') errors.push(error('MISSING_PROPOSED_TEXT', 'proposedText required', 'proposedText'));
  if (Array.isArray(p.evidenceRefs)) {
    for (const evidenceRef of p.evidenceRefs as RevisionEvidenceRef[]) {
      if (!evidenceRef || typeof evidenceRef !== 'object' || !isRevisionEvidenceReference(evidenceRef)) {
        errors.push(error('INVALID_EVIDENCE_REFERENCE', 'R4D evidence reference is invalid', 'evidenceRefs'));
      }
    }
  }
  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}

export function validateProposalVersion(version: unknown): RevisionValidationResult {
  const errors: RevisionError[] = [];
  if (!version || typeof version !== 'object') {
    return { valid: false, errors: [error('INVALID_VERSION', 'Version must be an object')], warnings: [] };
  }
  const v = version as Record<string, unknown>;
  if (typeof v.id !== 'string') errors.push(error('INVALID_VERSION_ID', 'Invalid version id', 'id'));
  if (typeof v.proposalRef !== 'string') errors.push(error('MISSING_PROPOSAL_REF', 'proposalRef required', 'proposalRef'));
  if (typeof v.versionNumber !== 'number' || (v.versionNumber as number) < 1) errors.push(error('INVALID_VERSION_NUMBER', 'versionNumber must be >= 1', 'versionNumber'));
  if (v.frozen !== true) errors.push(error('VERSION_NOT_FROZEN', 'Version must be frozen', 'frozen'));
  if (typeof v.currentTextSnapshot !== 'string') errors.push(error('MISSING_SNAPSHOT', 'currentTextSnapshot required', 'currentTextSnapshot'));
  if (typeof v.proposedText !== 'string') errors.push(error('MISSING_PROPOSED_TEXT', 'proposedText required', 'proposedText'));
  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}

export function validateDecision(decision: unknown): RevisionValidationResult {
  const errors: RevisionError[] = [];
  if (!decision || typeof decision !== 'object') {
    return { valid: false, errors: [error('INVALID_DECISION', 'Decision must be an object')], warnings: [] };
  }
  const d = decision as Record<string, unknown>;
  if (typeof d.id !== 'string') errors.push(error('INVALID_DECISION_ID', 'Invalid decision id', 'id'));
  if (!VALID_DECISION_STATUSES.includes(d.status as never)) errors.push(error('INVALID_DECISION_STATUS', `Invalid status: ${String(d.status)}`, 'status'));
  if (!VALID_DECISION_OUTCOMES.includes(d.outcome as never)) errors.push(error('INVALID_OUTCOME', `Invalid outcome: ${String(d.outcome)}`, 'outcome'));
  if (!d.proposalRef || typeof d.proposalRef !== 'object') errors.push(error('MISSING_PROPOSAL_REF', 'proposalRef required', 'proposalRef'));
  if (!d.proposalVersionRef || typeof d.proposalVersionRef !== 'object') errors.push(error('MISSING_PROPOSAL_VERSION_REF', 'proposalVersionRef required', 'proposalVersionRef'));
  if (typeof d.rationale !== 'string' || (d.rationale as string).trim().length === 0) errors.push(error('MISSING_RATIONALE', 'Decision rationale is required', 'rationale'));
  if (!d.authority || typeof d.authority !== 'object') errors.push(error('MISSING_AUTHORITY', 'Decision authority required', 'authority'));
  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}

export function validateProposalMandatoryRationale(proposal: RevisionProposal): RevisionValidationResult {
  if (proposal.status !== 'ready-for-review' && proposal.status !== 'submitted') {
    return { valid: true, errors: [], warnings: [] };
  }
  if (!proposal.rationale || proposal.rationale.trim().length === 0) {
    return { valid: false, errors: [error('MISSING_RATIONALE', 'Rationale required before submission', 'rationale')], warnings: [] };
  }
  return { valid: true, errors: [], warnings: [] };
}

export function validateProposalTransition(proposal: RevisionProposal, newStatus: string): RevisionValidationResult {
  const errors: RevisionError[] = [];
  if (!VALID_PROPOSAL_STATUSES.includes(newStatus as never)) {
    return { valid: false, errors: [error('INVALID_STATUS', `Invalid target status: ${newStatus}`)], warnings: [] };
  }
  if (!canTransitionProposalStatus(proposal.status, newStatus as RevisionProposal['status'])) {
    errors.push(error('INVALID_TRANSITION', `Cannot transition from ${proposal.status} to ${newStatus}`));
  }
  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}

export function validateDecisionTransition(decision: Decision, newStatus: string): RevisionValidationResult {
  const errors: RevisionError[] = [];
  if (!VALID_DECISION_STATUSES.includes(newStatus as never)) {
    return { valid: false, errors: [error('INVALID_STATUS', `Invalid target status: ${newStatus}`)], warnings: [] };
  }
  if (!canTransitionDecisionStatus(decision.status, newStatus as Decision['status'])) {
    errors.push(error('INVALID_TRANSITION', `Cannot transition from ${decision.status} to ${newStatus}`));
  }
  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}

export function validateInternalArchiveReferences(archive: RevisionArchive): RevisionValidationResult {
  const errors: RevisionError[] = [];
  const warnings: RevisionWarning[] = [];

  const proposalIds = new Set(archive.proposals.map(p => p.id));
  const versionIds = new Set(archive.versions.map(v => v.id));
  const decisionIds = new Set(archive.decisions.map(d => d.id));

  for (const p of archive.proposals) {
    if (!versionIds.has(p.currentVersionRef)) {
      errors.push(error('ORPHAN_VERSION_REF', `Proposal ${p.id} references missing version ${p.currentVersionRef}`, 'currentVersionRef'));
    }
    for (const dref of p.decisionRefs) {
      if (!decisionIds.has(dref.id)) {
        warnings.push({ code: 'ORPHAN_DECISION_REF', message: `Proposal ${p.id} references missing decision ${dref.id}`, field: 'decisionRefs' });
      }
    }
  }

  for (const v of archive.versions) {
    if (!proposalIds.has(v.proposalRef)) {
      errors.push(error('ORPHAN_VERSION', `Version ${v.id} references missing proposal ${v.proposalRef}`, 'proposalRef'));
    }
  }

  for (const d of archive.decisions) {
    if (!proposalIds.has(d.proposalRef.id)) {
      errors.push(error('ORPHAN_DECISION_PROPOSAL', `Decision ${d.id} references missing proposal ${d.proposalRef.id}`, 'proposalRef'));
    }
    if (!versionIds.has(d.proposalVersionRef.id)) {
      warnings.push(error('ORPHAN_DECISION_VERSION', `Decision ${d.id} references missing version ${d.proposalVersionRef.id}`, 'proposalVersionRef'));
    }
  }

  for (const e of archive.effects) {
    if (!decisionIds.has(e.decisionRef.id)) {
      warnings.push(error('ORPHAN_EFFECT_DECISION', `Effect ${e.id} references missing decision ${e.decisionRef.id}`, 'decisionRef'));
    }
  }

  return errors.length > 0 ? { valid: false, errors, warnings } : { valid: true, errors, warnings };
}

export function validateExternalRevisionReferences(
  archive: RevisionArchive,
  resolvers?: {
    resolveCurriculumNode?: (id: string) => boolean;
    resolveSource?: (id: string) => boolean;
    resolveDocument?: (id: string) => boolean;
    resolveInstitute?: (id: string) => boolean;
  },
): RevisionValidationResult {
  const warnings: RevisionWarning[] = [];
  if (!resolvers) return { valid: true, errors: [], warnings };

  const checked = new Set<string>();

  for (const p of archive.proposals) {
    if (!checked.has(p.targetNodeRef.id)) {
      checked.add(p.targetNodeRef.id);
      if (resolvers.resolveCurriculumNode && !resolvers.resolveCurriculumNode(p.targetNodeRef.id)) {
        warnings.push({ code: 'UNRESOLVABLE_CURRICULUM_NODE', message: `Curriculum node ${p.targetNodeRef.id} not resolvable`, field: 'targetNodeRef' });
      }
    }
    for (const src of p.sourceRefs) {
      if (resolvers.resolveSource && !resolvers.resolveSource(src.id)) {
        warnings.push({ code: 'UNRESOLVABLE_SOURCE', message: `Source ${src.id} not resolvable`, field: 'sourceRefs' });
      }
    }
  }

  return { valid: true, errors: [], warnings };
}

export function validateArchiveIntegrity(archive: unknown): RevisionValidationResult {
  const errors: RevisionError[] = [];
  if (!archive || typeof archive !== 'object') {
    return { valid: false, errors: [error('INVALID_ARCHIVE', 'Archive must be an object')], warnings: [] };
  }
  const a = archive as Record<string, unknown>;
  if (a.schemaVersion !== REVISION_ARCHIVE_SCHEMA_VERSION) {
    return { valid: false, errors: [error('UNSUPPORTED_SCHEMA', `Schema version ${String(a.schemaVersion)} not supported`)], warnings: [] };
  }
  const proposals = a.proposals;
  const versions = a.versions;
  const decisions = a.decisions;
  if (!Array.isArray(proposals)) return { valid: false, errors: [error('MISSING_PROPOSALS', 'Archive must have proposals array')], warnings: [] };
  if (!Array.isArray(versions)) return { valid: false, errors: [error('MISSING_VERSIONS', 'Archive must have versions array')], warnings: [] };
  if (!Array.isArray(decisions)) return { valid: false, errors: [error('MISSING_DECISIONS', 'Archive must have decisions array')], warnings: [] };

  const propIds = new Set<string>();
  for (const p of proposals) {
    if (typeof p.id === 'string') {
      if (propIds.has(p.id)) errors.push(error('DUPLICATE_PROPOSAL', `Duplicate proposal id: ${p.id}`));
      propIds.add(p.id);
    }
  }

  const verIds = new Set<string>();
  for (const v of versions) {
    if (typeof v.id === 'string') {
      if (verIds.has(v.id)) errors.push(error('DUPLICATE_VERSION', `Duplicate version id: ${v.id}`));
      verIds.add(v.id);
    }
  }

  const decIds = new Set<string>();
  for (const d of decisions) {
    if (typeof d.id === 'string') {
      if (decIds.has(d.id)) errors.push(error('DUPLICATE_DECISION', `Duplicate decision id: ${d.id}`));
      decIds.add(d.id);
    }
  }

  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}
