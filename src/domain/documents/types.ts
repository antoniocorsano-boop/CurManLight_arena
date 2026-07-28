import type {
  EntityId,
  EntityMetadata,
  EntityReference,
  ActorReference,
} from '../curriculum/identity';

export type DocumentType =
  | 'teaching-design'
  | 'annual-plan'
  | 'revision-proposal'
  | 'decision-record'
  | 'meeting-minutes'
  | 'report'
  | 'curriculum-document'
  | 'assessment-rubric'
  | 'generic-local-document';

export type DocumentStatus =
  | 'draft'
  | 'in-progress'
  | 'completed'
  | 'shared-locally'
  | 'archived'
  | 'superseded'
  | 'legacy';

export interface InstitutionalSnapshot {
  instituteName: string;
  mechanicalCode?: string;
  siteName?: string;
  academicYearLabel?: string;
  declaredRole?: string;
  configured: boolean;
}

export interface DocumentEntity {
  id: EntityId;
  metadata: EntityMetadata;
  documentType: DocumentType;
  title: string;
  status: DocumentStatus;
  currentVersionRef: EntityId;
  instituteRef?: EntityReference;
  academicYearRef?: EntityReference;
  author?: ActorReference;
  sourceRefs: EntityReference[];
  originRefs: EntityReference[];
  tags?: string[];
}

export interface DocumentVersion {
  id: EntityId;
  documentRef: EntityId;
  versionNumber: number;
  content: DocumentContent;
  createdAt: string;
  author?: ActorReference;
  reason?: string;
  sourceRefs: EntityReference[];
  institutionalSnapshot: InstitutionalSnapshot;
  previousVersionRef?: EntityId;
  frozen: true;
  metadata: EntityMetadata;
}

export interface DocumentContent {
  sections: DocumentSection[];
}

export type DocumentSection =
  | HeadingSection
  | ParagraphSection
  | ListSection
  | TableSection
  | CurriculumReferenceSection
  | SourceReferenceSection
  | TeachingDesignSection
  | MetadataSection;

export interface HeadingSection {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphSection {
  type: 'paragraph';
  text: string;
  format?: 'normal' | 'bold' | 'italic' | 'quote';
}

export interface ListSection {
  type: 'list';
  items: string[];
  ordered: boolean;
}

export interface TableSection {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface CurriculumReferenceSection {
  type: 'curriculum-reference';
  refs: EntityReference[];
  description?: string;
}

export interface SourceReferenceSection {
  type: 'source-reference';
  refs: EntityReference[];
  description?: string;
}

export interface TeachingDesignSection {
  type: 'teaching-design';
  snapshot: Record<string, unknown>;
  description?: string;
}

export interface MetadataSection {
  type: 'metadata';
  data: Record<string, string>;
}

export interface DocumentArchive {
  schemaVersion: number;
  updatedAt: string;
  documents: DocumentEntity[];
  versions: DocumentVersion[];
}

export type ExportFormat = 'html' | 'json' | 'pdf-browser';

export interface ExportPayload {
  format: ExportFormat;
  document: DocumentEntity;
  version: DocumentVersion;
  archive?: DocumentArchive;
}

export interface DocumentError {
  code: string;
  message: string;
  field?: string;
}

export interface DocumentValidationResult {
  valid: boolean;
  errors: DocumentError[];
  warnings: DocumentError[];
}

export type DocumentArchiveOperationResult =
  | { success: true; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] };

export type DocumentCreationResult =
  | {
      success: true;
      document: DocumentEntity;
      version: DocumentVersion;
      archive: DocumentArchive;
    }
  | { success: false; errors: DocumentError[] };

export type LegacyDocumentAdaptationResult =
  | {
      ok: true;
      document: DocumentEntity;
      version: DocumentVersion;
      warnings: DocumentError[];
    }
  | { ok: false; error: DocumentError; warnings: DocumentError[] };

export interface TransferWarning {
  code: string;
  message: string;
  field?: string;
}

export interface DocumentFilter {
  documentType?: string;
  status?: string;
  instituteRef?: string;
  academicYearRef?: string;
}

export type A04ToA07DocumentResult =
  | {
      status: 'completed';
      document: DocumentEntity;
      version: DocumentVersion;
      archive: DocumentArchive;
      transferId: string;
      warnings: TransferWarning[];
    }
  | {
      status: 'failed';
      errors: DocumentError[];
      transferId: string;
    };