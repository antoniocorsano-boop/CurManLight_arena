import type {
  DocumentArchive,
  DocumentContent,
  DocumentEntity,
  DocumentError,
  DocumentVersion,
} from './types';
import type { EntityId } from '../curriculum/identity';
import { cloneDocumentArchive, createInitialVersion, createNextVersion, restoreVersionFrom } from './constructors';
import type { CreateVersionInput } from './constructors';

function error(code: string, message: string, field?: string): DocumentError {
  return { code, message, field };
}

export function addVersionToArchive(
  archive: DocumentArchive,
  version: DocumentVersion,
): DocumentArchive {
  const next = cloneDocumentArchive(archive);
  next.versions.push(version);
  next.updatedAt = new Date().toISOString();
  return next;
}

export function createVersion(
  archive: DocumentArchive,
  document: DocumentEntity,
  content: DocumentContent,
  input: CreateVersionInput,
  now = new Date().toISOString(),
): { version: DocumentVersion; archive: DocumentArchive } {
  const existingVersions = archive.versions.filter(v => v.documentRef === document.id);

  let version: DocumentVersion;
  if (existingVersions.length === 0) {
    version = createInitialVersion(document, content, input, now);
  } else {
    const latest = existingVersions.reduce((a, b) =>
      a.versionNumber > b.versionNumber ? a : b,
    );
    version = createNextVersion(document, latest, content, input, now);
  }

  const next = addVersionToArchive(archive, version);
  return { version, archive: next };
}

export function setCurrentVersion(
  archive: DocumentArchive,
  documentId: string,
  versionId: string,
): { document: DocumentEntity; archive: DocumentArchive } | DocumentError[] {
  const doc = archive.documents.find(d => d.id === documentId);
  if (!doc) {
    return [error('DOCUMENT_NOT_FOUND', `Document ${documentId} not found`, 'documentId')];
  }

  const version = archive.versions.find(v => v.id === versionId && v.documentRef === documentId);
  if (!version) {
    return [error('VERSION_NOT_FOUND', `Version ${versionId} not found for document ${documentId}`, 'versionId')];
  }

  const next = cloneDocumentArchive(archive);
  const updatedDoc: DocumentEntity = { ...doc, currentVersionRef: versionId as EntityId };
  next.documents = next.documents.map(d => (d.id === documentId ? updatedDoc : d));
  next.updatedAt = new Date().toISOString();

  return { document: updatedDoc, archive: next };
}

export function restoreVersion(
  archive: DocumentArchive,
  document: DocumentEntity,
  sourceVersion: DocumentVersion,
  content: DocumentContent,
  input: CreateVersionInput,
  now = new Date().toISOString(),
): { version: DocumentVersion; archive: DocumentArchive } {
  const newVersion = restoreVersionFrom(document, sourceVersion, content, input, now);
  const next = addVersionToArchive(archive, newVersion);
  return { version: newVersion, archive: next };
}

export function listVersions(
  archive: DocumentArchive,
  documentId: string,
): DocumentVersion[] {
  return archive.versions
    .filter(v => v.documentRef === documentId)
    .sort((a, b) => a.versionNumber - b.versionNumber);
}

export function getLatestVersion(
  archive: DocumentArchive,
  documentId: string,
): DocumentVersion | undefined {
  const versions = listVersions(archive, documentId);
  return versions.length > 0 ? versions[versions.length - 1] : undefined;
}