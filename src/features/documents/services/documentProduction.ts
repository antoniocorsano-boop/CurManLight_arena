import type { UdaModel } from '../../../types/curriculum';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';
import type { A04ToA07Payload } from '../../../domain/transfer/areaContracts';
import type {
  DocumentArchive,
  DocumentEntity,
  DocumentError,
  DocumentVersion,
} from '../../../domain/documents';
import { validateDocumentArchiveIntegrity } from '../../../domain/documents';
import { getDocumentList, getCurrentVersionForDocument } from '../../../domain/documents/selectors';
import { executeA04ToA07DocumentTransfer } from '../../../domain/documents/contracts';
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
