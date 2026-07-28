import type { DocumentArchive, DocumentEntity, DocumentVersion, ExportPayload, ExportFormat, DocumentFilter } from './types';
import { getDocument, getCurrentVersion, getVersionList, listDocuments } from './repository';

export function getDocumentById(
  archive: DocumentArchive,
  id: string,
): DocumentEntity | undefined {
  return getDocument(archive, id);
}

export function getCurrentVersionForDocument(
  archive: DocumentArchive,
  document: DocumentEntity,
): DocumentVersion | undefined {
  return getCurrentVersion(archive, document);
}

export function getDocumentList(
  archive: DocumentArchive,
  filter?: DocumentFilter,
): DocumentEntity[] {
  return listDocuments(archive, filter);
}

export function getDocumentWithVersion(
  archive: DocumentArchive,
  id: string,
): { document: DocumentEntity; version: DocumentVersion } | undefined {
  const document = getDocument(archive, id);
  if (!document) return undefined;
  const version = getCurrentVersion(archive, document);
  if (!version) return undefined;
  return { document, version };
}

export function getDocumentsByType(
  archive: DocumentArchive,
  documentType: string,
): DocumentEntity[] {
  return listDocuments(archive, { documentType });
}

export function getDocumentsByStatus(
  archive: DocumentArchive,
  status: string,
): DocumentEntity[] {
  return listDocuments(archive, { status });
}

export function getDocumentHistory(
  archive: DocumentArchive,
  documentId: string,
): DocumentVersion[] {
  return getVersionList(archive, documentId);
}

export function getDocumentExportPayload(
  archive: DocumentArchive,
  documentId: string,
  format: ExportFormat,
): ExportPayload | undefined {
  const doc = getDocument(archive, documentId);
  if (!doc) return undefined;
  const version = getCurrentVersion(archive, doc);
  if (!version) return undefined;
  return { format, document: doc, version, archive };
}

export function getDocumentsByInstitute(
  archive: DocumentArchive,
  instituteId: string,
): DocumentEntity[] {
  return listDocuments(archive, { instituteRef: instituteId });
}

export function getDocumentsByAcademicYear(
  archive: DocumentArchive,
  academicYearRef: string,
): DocumentEntity[] {
  return listDocuments(archive, { academicYearRef: academicYearRef });
}