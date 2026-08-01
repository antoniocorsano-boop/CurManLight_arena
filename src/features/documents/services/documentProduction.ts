import type { UdaModel } from '../../../types/curriculum';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';
import type { A04ToA07Payload } from '../../../domain/transfer/areaContracts';
import type {
  DocumentArchive,
  DocumentEntity,
  DocumentError,
  DocumentVersion,
} from '../../../domain/documents';
import { validateDocumentArchiveIntegrity, createDocumentInArchive } from '../../../domain/documents';
import type { CreateDocumentInput } from '../../../domain/documents/constructors';
import { getDocumentList, getCurrentVersionForDocument } from '../../../domain/documents/selectors';
import { executeA04ToA07DocumentTransfer } from '../../../domain/documents/contracts';
import type {
  DecisionStatus,
  RevisionArchive,
  RevisionProposalStatus,
  RevisionWarning,
} from '../../../domain/revision';
import {
  generateProposalDocument,
  generateDecisionDocument,
  getLatestProposalVersion,
} from '../../../domain/revision';
import {
  buildA04ToA07PayloadFromUda,
  validateUdaForDocumentMapping,
  type UdaMappingProblem,
} from '../mappers/udaToA07Payload';

export type DocumentProductionResult =
  | { status: 'mapping-invalid'; errors: UdaMappingProblem[] }
  | { status: 'transfer-failed'; errors: DocumentError[] }
  | { status: 'archive-invalid'; errors: DocumentError[] }
  | { status: 'already-exists'; document: DocumentEntity; version: DocumentVersion }
  | { status: 'created'; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive };

export interface CanonicalDocumentMatch {
  document: DocumentEntity;
  version: DocumentVersion;
}

export function findCanonicalDocumentByUda(
  archive: DocumentArchive,
  udaId: string,
): CanonicalDocumentMatch | undefined {
  const match = getDocumentList(archive).find((d) =>
    d.sourceRefs.some((s) => s.id === udaId && s.entityType === 'source'),
  );
  if (!match) return undefined;
  const version = getCurrentVersionForDocument(archive, match);
  if (!version) return undefined;
  return { document: match, version };
}

export function produceCanonicalDocumentFromPayload(
  payload: A04ToA07Payload,
  archive: DocumentArchive,
): DocumentProductionResult {
  const transfer = executeA04ToA07DocumentTransfer(payload, archive);
  if (transfer.status === 'failed') {
    return { status: 'transfer-failed', errors: transfer.errors };
  }

  const integrity = validateDocumentArchiveIntegrity(transfer.archive);
  if (!integrity.valid) {
    return { status: 'archive-invalid', errors: integrity.errors };
  }

  return {
    status: 'created',
    document: transfer.document,
    version: transfer.version,
    archive: transfer.archive,
  };
}

export function produceCanonicalDocumentFromUda(
  uda: UdaModel,
  institutionalRead: A07InstitutionalDocumentRead,
  archive: DocumentArchive,
): DocumentProductionResult {
  const validation = validateUdaForDocumentMapping(uda);
  if (!validation.valid) {
    return { status: 'mapping-invalid', errors: validation.errors };
  }

  const existing = findCanonicalDocumentByUda(archive, uda.id);
  if (existing) {
    return { status: 'already-exists', document: existing.document, version: existing.version };
  }

  const payload = buildA04ToA07PayloadFromUda(uda, institutionalRead);
  return produceCanonicalDocumentFromPayload(payload, archive);
}

// ─── A03 → A07 (revision proposals and decisions) ───────────────────────────

const BLOCKED_PROPOSAL_STATUSES: ReadonlySet<RevisionProposalStatus> = new Set([
  'withdrawn',
  'rejected',
  'archived',
]);

const INACTIVE_DECISION_STATUSES: ReadonlySet<DecisionStatus> = new Set([
  'superseded',
  'revoked',
  'archived',
  'legacy',
]);

export type RevisionTransferBlockReason =
  | 'proposal-withdrawn'
  | 'proposal-rejected'
  | 'proposal-archived'
  | 'proposal-has-no-version'
  | 'decision-inactive'
  | 'decision-proposal-missing';

export type RevisionToDocumentResult =
  | { status: 'revision-not-found'; kind: 'proposal' | 'decision' }
  | { status: 'revision-not-transferable'; reason: RevisionTransferBlockReason }
  | { status: 'generation-failed'; warnings: RevisionWarning[] }
  | { status: 'archive-invalid'; errors: DocumentError[] }
  | { status: 'already-exists'; document: DocumentEntity; version: DocumentVersion }
  | { status: 'created'; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive };

export function findCanonicalDocumentByProposal(
  archive: DocumentArchive,
  proposalId: string,
): CanonicalDocumentMatch | undefined {
  const match = getDocumentList(archive).find((d) =>
    d.originRefs.some((r) => r.entityType === 'revision-proposal' && r.id === proposalId),
  );
  if (!match) return undefined;
  const version = getCurrentVersionForDocument(archive, match);
  if (!version) return undefined;
  return { document: match, version };
}

export function findCanonicalDocumentByDecision(
  archive: DocumentArchive,
  decisionId: string,
): CanonicalDocumentMatch | undefined {
  const match = getDocumentList(archive).find((d) =>
    d.originRefs.some((r) => r.entityType === 'decision' && r.id === decisionId),
  );
  if (!match) return undefined;
  const version = getCurrentVersionForDocument(archive, match);
  if (!version) return undefined;
  return { document: match, version };
}

function persistGeneratedDocument(
  archive: DocumentArchive,
  generated: { document: DocumentEntity; version: DocumentVersion },
):
  | { success: true; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const input: CreateDocumentInput = {
    documentType: generated.document.documentType,
    title: generated.document.title,
    author: generated.document.author,
    instituteRef: generated.document.instituteRef,
    academicYearRef: generated.document.academicYearRef,
    sourceRefs: generated.document.sourceRefs,
    originRefs: generated.document.originRefs,
    tags: generated.document.tags,
    origin: generated.document.metadata.origin,
  };
  return createDocumentInArchive(archive, input, generated.version.content, generated.version.institutionalSnapshot);
}

export function produceCanonicalDocumentFromProposal(
  proposalId: string,
  revisionArchive: RevisionArchive,
  archive: DocumentArchive,
): RevisionToDocumentResult {
  const proposal = revisionArchive.proposals.find((p) => p.id === proposalId);
  if (!proposal) {
    return { status: 'revision-not-found', kind: 'proposal' };
  }

  if (BLOCKED_PROPOSAL_STATUSES.has(proposal.status)) {
    return { status: 'revision-not-transferable', reason: `proposal-${proposal.status}` as RevisionTransferBlockReason };
  }

  if (!getLatestProposalVersion(revisionArchive, proposal)) {
    return { status: 'revision-not-transferable', reason: 'proposal-has-no-version' };
  }

  const existing = findCanonicalDocumentByProposal(archive, proposalId);
  if (existing) {
    return { status: 'already-exists', document: existing.document, version: existing.version };
  }

  const generated = generateProposalDocument(proposal, revisionArchive);
  if (!generated.success || !generated.document || !generated.version) {
    return { status: 'generation-failed', warnings: generated.warnings };
  }

  const persisted = persistGeneratedDocument(archive, { document: generated.document, version: generated.version });
  if (!persisted.success) {
    return { status: 'archive-invalid', errors: persisted.errors };
  }

  return {
    status: 'created',
    document: persisted.document,
    version: persisted.version,
    archive: persisted.archive,
  };
}

export function produceCanonicalDocumentFromDecision(
  decisionId: string,
  revisionArchive: RevisionArchive,
  archive: DocumentArchive,
): RevisionToDocumentResult {
  const decision = revisionArchive.decisions.find((d) => d.id === decisionId);
  if (!decision) {
    return { status: 'revision-not-found', kind: 'decision' };
  }

  if (INACTIVE_DECISION_STATUSES.has(decision.status)) {
    return { status: 'revision-not-transferable', reason: 'decision-inactive' };
  }

  const proposal = revisionArchive.proposals.find((p) => p.id === decision.proposalRef.id);
  if (!proposal) {
    return { status: 'revision-not-transferable', reason: 'decision-proposal-missing' };
  }

  const existing = findCanonicalDocumentByDecision(archive, decisionId);
  if (existing) {
    return { status: 'already-exists', document: existing.document, version: existing.version };
  }

  const generated = generateDecisionDocument(proposal, decision, revisionArchive);
  if (!generated.success || !generated.document || !generated.version) {
    return { status: 'generation-failed', warnings: generated.warnings };
  }

  const persisted = persistGeneratedDocument(archive, { document: generated.document, version: generated.version });
  if (!persisted.success) {
    return { status: 'archive-invalid', errors: persisted.errors };
  }

  return {
    status: 'created',
    document: persisted.document,
    version: persisted.version,
    archive: persisted.archive,
  };
}
