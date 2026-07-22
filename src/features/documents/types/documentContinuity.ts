export type DocumentType = 'uda' | 'programmazione' | 'relazione' | 'curricolo' | 'confronto' | 'programma-svolto' | 'file-lavoro' | 'altro';

export type SourceKind = 'uda' | 'curriculum' | 'revision' | 'planning' | 'class-context' | 'generic';

export type ExportFormat = 'DOC' | 'DOCX' | 'ODF' | 'PDF' | 'TXT' | 'CML' | 'Markdown' | 'SCORM';

export type CoherenceStatus = 'current' | 'modified' | 'unverifiable';

export interface DocumentExportEvent {
  id: string;
  documentType: DocumentType;
  format: ExportFormat;
  label: string;
  sourceKind: SourceKind;
  sourceId?: string;
  sourceTitle?: string;
  discipline: string;
  order: string;
  classLabel?: string;
  workStatus?: string;
  exportedAt: string;
  sourceSignature?: string;
  sourceView?: string;
  coherence: CoherenceStatus;
}
