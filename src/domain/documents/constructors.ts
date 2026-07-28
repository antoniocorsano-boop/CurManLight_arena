import type {
  ActorReference,
  ContentOrigin,
  EntityReference,
} from '../curriculum/identity';
import {
  generateEntityId,
  createMetadata,
} from '../curriculum/identity';
import type {
  DocumentArchive,
  DocumentContent,
  DocumentEntity,
  DocumentSection,
  DocumentType,
  DocumentVersion,
  InstitutionalSnapshot,
} from './types';
import { DOCUMENT_ARCHIVE_SCHEMA_VERSION } from './vocabularies';

export function createEmptyDocumentArchive(
  now = new Date().toISOString(),
): DocumentArchive {
  return {
    schemaVersion: DOCUMENT_ARCHIVE_SCHEMA_VERSION,
    updatedAt: now,
    documents: [],
    versions: [],
  };
}

export function cloneDocumentArchive(archive: DocumentArchive): DocumentArchive {
  return JSON.parse(JSON.stringify(archive));
}

export interface CreateDocumentInput {
  documentType: DocumentType;
  title: string;
  author?: ActorReference;
  instituteRef?: EntityReference;
  academicYearRef?: EntityReference;
  sourceRefs?: EntityReference[];
  originRefs?: EntityReference[];
  tags?: string[];
  origin?: ContentOrigin;
}

export function createDocument(
  input: CreateDocumentInput,
  now = new Date().toISOString(),
): DocumentEntity {
  const id = generateEntityId();
  return {
    id,
    metadata: createMetadata(
      input.origin ?? 'teacher',
      input.author,
      now,
    ),
    documentType: input.documentType,
    title: input.title,
    status: 'draft',
    currentVersionRef: id,
    instituteRef: input.instituteRef,
    academicYearRef: input.academicYearRef,
    author: input.author,
    sourceRefs: input.sourceRefs ?? [],
    originRefs: input.originRefs ?? [],
    tags: input.tags,
  };
}

export interface CreateVersionInput {
  author?: ActorReference;
  reason?: string;
  sourceRefs?: EntityReference[];
  institutionalSnapshot: InstitutionalSnapshot;
}

export function createInitialVersion(
  document: DocumentEntity,
  content: DocumentContent,
  input: CreateVersionInput,
  now = new Date().toISOString(),
): DocumentVersion {
  return {
    id: generateEntityId(),
    documentRef: document.id,
    versionNumber: 1,
    content: { sections: [...content.sections] },
    createdAt: now,
    author: input.author ?? document.author,
    reason: input.reason,
    sourceRefs: input.sourceRefs ?? [],
    institutionalSnapshot: { ...input.institutionalSnapshot },
    previousVersionRef: undefined,
    frozen: true,
    metadata: createMetadata(
      document.metadata.origin,
      input.author ?? document.author,
      now,
    ),
  };
}

export function createNextVersion(
  document: DocumentEntity,
  previousVersion: DocumentVersion,
  content: DocumentContent,
  input: CreateVersionInput,
  now = new Date().toISOString(),
): DocumentVersion {
  if (!previousVersion.frozen) {
    throw new Error('Previous version must be frozen');
  }
  return {
    id: generateEntityId(),
    documentRef: document.id,
    versionNumber: previousVersion.versionNumber + 1,
    content: { sections: [...content.sections] },
    createdAt: now,
    author: input.author,
    reason: input.reason,
    sourceRefs: input.sourceRefs ?? [],
    institutionalSnapshot: { ...input.institutionalSnapshot },
previousVersionRef: previousVersion.id,
    frozen: true,
    metadata: createMetadata(
      document.metadata.origin,
      input.author,
      now,
    ),
  };
}

export function restoreVersionFrom(
  document: DocumentEntity,
  sourceVersion: DocumentVersion,
  content: DocumentContent,
  input: CreateVersionInput,
  now = new Date().toISOString(),
): DocumentVersion {
  const versionNumber = sourceVersion.versionNumber + 1;
  return {
    id: generateEntityId(),
    documentRef: document.id,
    versionNumber,
    content: { sections: [...content.sections] },
    createdAt: now,
    author: input.author,
    reason: input.reason ?? `Ripristino dalla versione ${sourceVersion.versionNumber}`,
    sourceRefs: input.sourceRefs ?? [...sourceVersion.sourceRefs],
    institutionalSnapshot: { ...input.institutionalSnapshot },
    previousVersionRef: sourceVersion.id,
    frozen: true,
    metadata: createMetadata(
      document.metadata.origin,
      input.author,
      now,
    ),
  };
}

export function createSectionHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): DocumentSection {
  return { type: 'heading', level, text };
}

export function createSectionParagraph(text: string, format?: 'normal' | 'bold' | 'italic' | 'quote'): DocumentSection {
  return { type: 'paragraph', text, format };
}

export function createSectionList(items: string[], ordered = false): DocumentSection {
  return { type: 'list', items: [...items], ordered };
}

export function createSectionTable(headers: string[], rows: string[][]): DocumentSection {
  return { type: 'table', headers: [...headers], rows: rows.map(r => [...r]) };
}

export function createSectionCurriculumReference(refs: EntityReference[], description?: string): DocumentSection {
  return { type: 'curriculum-reference', refs: [...refs], description };
}

export function createSectionSourceReference(refs: EntityReference[], description?: string): DocumentSection {
  return { type: 'source-reference', refs: [...refs], description };
}

export function createSectionTeachingDesign(snapshot: Record<string, unknown>, description?: string): DocumentSection {
  return { type: 'teaching-design', snapshot: { ...snapshot }, description };
}

export function createSectionMetadata(data: Record<string, string>): DocumentSection {
  return { type: 'metadata', data: { ...data } };
}

export function createInstitutionalSnapshot(
  instituteName: string,
  options?: {
    mechanicalCode?: string;
    siteName?: string;
    academicYearLabel?: string;
    declaredRole?: string;
    configured?: boolean;
  },
): InstitutionalSnapshot {
  return {
    instituteName: instituteName || 'Istituto non configurato',
    mechanicalCode: options?.mechanicalCode,
    siteName: options?.siteName,
    academicYearLabel: options?.academicYearLabel,
    declaredRole: options?.declaredRole,
    configured: options?.configured ?? false,
  };
}