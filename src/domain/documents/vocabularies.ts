import type { DocumentType, DocumentStatus, ExportFormat } from './types';

export const DOCUMENT_ARCHIVE_SCHEMA_VERSION = 1;

export const VALID_DOCUMENT_TYPES: readonly DocumentType[] = [
  'teaching-design',
  'annual-plan',
  'revision-proposal',
  'decision-record',
  'meeting-minutes',
  'report',
  'curriculum-document',
  'assessment-rubric',
  'generic-local-document',
] as const;

export const VALID_DOCUMENT_STATUSES: readonly DocumentStatus[] = [
  'draft',
  'in-progress',
  'completed',
  'shared-locally',
  'archived',
  'superseded',
  'legacy',
] as const;

export const VALID_EXPORT_FORMATS: readonly ExportFormat[] = [
  'html',
  'json',
  'pdf-browser',
] as const;

export const EXPORT_FORMAT_META: Record<ExportFormat, { extension: string; mime: string }> = {
  html: { extension: '.html', mime: 'text/html' },
  json: { extension: '.json', mime: 'application/json' },
  'pdf-browser': { extension: '.pdf', mime: 'application/pdf' },
};

export const DOCUMENT_STATUS_TRANSITIONS: Record<DocumentStatus, readonly DocumentStatus[]> = {
  'draft': ['in-progress'],
  'in-progress': ['completed'],
  'completed': ['shared-locally', 'archived'],
  'shared-locally': ['archived'],
  'archived': [],
  'superseded': [],
  'legacy': ['draft', 'archived'],
};

export function canTransitionDocumentStatus(
  current: DocumentStatus,
  next: DocumentStatus,
): boolean {
  if (current === next) return false;
  return DOCUMENT_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'teaching-design': 'Progettazione didattica',
  'annual-plan': 'Pianificazione annuale',
  'revision-proposal': 'Proposta di revisione',
  'decision-record': 'Verbale di decisione',
  'meeting-minutes': 'Verbale di riunione',
  'report': 'Relazione',
  'curriculum-document': 'Documento curricolare',
  'assessment-rubric': 'Rubrica valutativa',
  'generic-local-document': 'Documento locale',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  'draft': 'Bozza',
  'in-progress': 'In lavorazione',
  'completed': 'Completato',
  'shared-locally': 'Condiviso localmente',
  'archived': 'Archiviato',
  'superseded': 'Sostituito',
  'legacy': 'Legacy',
};