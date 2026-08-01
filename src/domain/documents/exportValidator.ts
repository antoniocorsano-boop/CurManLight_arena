import type {
  DocumentArchive,
  DocumentEntity,
  DocumentVersion,
  ExportFormat,
} from './types';
import { getDocument as findDocument, getVersion as findVersionById } from './repository';
import {
  computePreviewKey,
  serializePreviewKey,
  type PreviewState,
  type TeachingDesignMetadata,
  extractTeachingDesignMetadata,
  getAuthorDisplay,
  getRoleDisplay,
} from './preview';
import { renderDocument } from './rendering';

export type ExportBlockCode =
  | 'DOCUMENT_MISSING'
  | 'VERSION_MISSING'
  | 'VERSION_NOT_OWNED_BY_DOCUMENT'
  | 'VERSION_NOT_PERSISTED'
  | 'TEMPLATE_MISSING'
  | 'TITLE_MISSING'
  | 'INSTITUTE_NAME_MISSING'
  | 'SCHOOL_YEAR_MISSING'
  | 'DISCIPLINE_MISSING'
  | 'SCHOOL_LEVEL_OR_CLASS_MISSING'
  | 'AUTHOR_OR_ROLE_MISSING'
  | 'DATE_MISSING'
  | 'CONTENT_NOT_RENDERABLE'
  | 'DOCUMENT_ARCHIVED'
  | 'PREVIEW_REQUIRED'
  | 'PREVIEW_STALE';

export interface ExportError {
  code: ExportBlockCode;
  message: string;
  field?: string;
  action?: string;
}

export interface ExportabilityResult {
  exportable: boolean;
  blockingErrors: ExportError[];
  warnings: ExportError[];
}

export interface ExportabilityContext {
  archive: DocumentArchive;
  document?: DocumentEntity | null;
  version?: DocumentVersion | null;
  selectedVersionId?: string | null;
  previewState?: PreviewState | null;
}

export interface InstitutionalMetadata {
  instituteName?: string;
  academicYearLabel?: string;
  discipline?: string;
  schoolOrderOrClass?: string;
  authorOrRole?: string;
  date?: string;
  versionNumber?: number;
}

function err(code: ExportBlockCode, message: string, field?: string, action?: string): ExportError {
  return { code, message, field, action };
}

export function resolveInstitutionalMetadata(
  version: DocumentVersion,
): InstitutionalMetadata {
  const td: TeachingDesignMetadata = extractTeachingDesignMetadata(version.content);
  const authorDisplay = getAuthorDisplay(version);
  const roleDisplay = getRoleDisplay(version);
  const declaredRole = version.institutionalSnapshot.declaredRole;

  return {
    instituteName:
      version.institutionalSnapshot.instituteName &&
      version.institutionalSnapshot.instituteName !== 'Istituto non configurato'
        ? version.institutionalSnapshot.instituteName
        : undefined,
    academicYearLabel: version.institutionalSnapshot.academicYearLabel,
    discipline: td.discipline,
    schoolOrderOrClass: td.order ?? td.class,
    authorOrRole: authorDisplay ?? roleDisplay ?? declaredRole,
    date: version.createdAt,
    versionNumber: version.versionNumber,
  };
}

export function isTemplateResolvable(version: DocumentVersion): boolean {
  const name = version.institutionalSnapshot?.instituteName;
  return Boolean(name && name !== 'Istituto non configurato');
}

export function isContentRenderable(document: DocumentEntity, version: DocumentVersion): boolean {
  try {
    const html = renderDocument(document, version);
    if (html.length === 0 || !html.includes('<!DOCTYPE html>')) {
      return false;
    }
    const bodyMatch = html.match(/<article>([\s\S]*)<\/article>/);
    const bodyContent = bodyMatch ? bodyMatch[1] : '';
    const textOnly = bodyContent.replace(/<[^>]+>/g, '').trim();
    return textOnly.length > 0;
  } catch {
    return false;
  }
}

export function validateExportability(context: ExportabilityContext): ExportabilityResult {
  const errors: ExportError[] = [];
  const warnings: ExportError[] = [];

  const {
    archive,
    document,
    version,
    selectedVersionId,
    previewState,
  } = context;

  if (!document) {
    errors.push(err('DOCUMENT_MISSING', "Documento non disponibile nell'archivio canonico.", 'document'));
    return { exportable: false, blockingErrors: errors, warnings };
  }

  const persistedDocument = findDocument(archive, document.id);
  if (!persistedDocument) {
    errors.push(err('DOCUMENT_MISSING', "Documento non disponibile nell'archivio canonico.", 'document'));
    return { exportable: false, blockingErrors: errors, warnings };
  }

  if (!version) {
    errors.push(err('VERSION_MISSING', 'Seleziona una versione prima dell\'esportazione.', 'version'));
    return { exportable: false, blockingErrors: errors, warnings };
  }

  if (version.documentRef !== document.id) {
    errors.push(
      err(
        'VERSION_NOT_OWNED_BY_DOCUMENT',
        'La versione selezionata non appartiene al documento corrente.',
        'version',
      ),
    );
    return { exportable: false, blockingErrors: errors, warnings };
  }

  const persistedVersion = findVersionById(archive, version.id);
  if (!persistedVersion) {
    errors.push(
      err(
        'VERSION_NOT_PERSISTED',
        'Versione corrente non trovata. Apri o rigenera il documento.',
        'version',
      ),
    );
    return { exportable: false, blockingErrors: errors, warnings };
  }

  if (document.status === 'archived') {
    errors.push(
      err(
        'DOCUMENT_ARCHIVED',
        "Il documento è archiviato. Puoi consultarlo, ma non esportarlo. Seleziona o crea una versione attiva.",
        'status',
      ),
    );
    return { exportable: false, blockingErrors: errors, warnings };
  }

  if (!isTemplateResolvable(version)) {
    errors.push(
      err(
        'TEMPLATE_MISSING',
        'Template non risolvibile per la versione selezionata.',
        'institutionalSnapshot',
      ),
    );
  }

  if (!document.title || document.title.trim().length === 0) {
    errors.push(err('TITLE_MISSING', 'Titolo documento mancante.', 'title'));
  }

  const metadata = resolveInstitutionalMetadata(version);

  if (!metadata.instituteName) {
    errors.push(
      err('INSTITUTE_NAME_MISSING', 'Denominazione istituto mancante.', 'institutionalSnapshot.instituteName'),
    );
  }

  if (!metadata.academicYearLabel) {
    errors.push(
      err('SCHOOL_YEAR_MISSING', 'Anno scolastico mancante.', 'institutionalSnapshot.academicYearLabel'),
    );
    warnings.push(
      err(
        'SCHOOL_YEAR_MISSING',
        'L\'anno scolastico non è presente nella versione del documento.',
        'institutionalSnapshot.academicYearLabel',
        'Verifica la configurazione istituzionale prima dell\'esportazione.',
      ),
    );
  }

  if (!metadata.discipline) {
    errors.push(err('DISCIPLINE_MISSING', 'Disciplina mancante.', 'content.discipline'));
  }

  if (!metadata.schoolOrderOrClass) {
    errors.push(
      err('SCHOOL_LEVEL_OR_CLASS_MISSING', 'Ordine di scuola o classe mancante.', 'content.order'),
    );
  }

  if (!metadata.authorOrRole) {
    errors.push(
      err('AUTHOR_OR_ROLE_MISSING', 'Autore o ruolo mancante.', 'author'),
    );
  }

  if (!metadata.date) {
    errors.push(err('DATE_MISSING', 'Data mancante.', 'createdAt'));
  }

  if (!metadata.versionNumber) {
    errors.push(err('VERSION_MISSING', 'Versione non identificata.', 'versionNumber'));
  }

  if (!isContentRenderable(document, version)) {
    errors.push(
      err('CONTENT_NOT_RENDERABLE', 'Anteprima non disponibile. Correggi i dati prima dell\'esportazione.', 'content'),
    );
  }

  if (!previewState) {
    errors.push(
      err(
        'PREVIEW_REQUIRED',
        'Visualizza l\'anteprima aggiornata prima dell\'esportazione.',
        'preview',
        'Genera l\'anteprima prima di stampare.',
      ),
    );
  } else {
    const expectedKey = serializePreviewKey(computePreviewKey(document, version));
    if (previewState.key !== expectedKey) {
      errors.push(
        err(
          'PREVIEW_STALE',
          "L'anteprima non è più aggiornata. Generala nuovamente prima di stampare.",
          'preview',
          'Genera nuovamente l\'anteprima.',
        ),
      );
    }

    if (previewState.versionNumber !== version.versionNumber) {
      errors.push(
        err(
          'PREVIEW_STALE',
          "L'anteprima non è più aggiornata. Generala nuovamente prima di stampare.",
          'preview',
          'Genera nuovamente l\'anteprima.',
        ),
      );
    }
  }

  if (selectedVersionId && selectedVersionId !== version.id) {
    warnings.push(
      err(
        'VERSION_MISSING',
        'La versione selezionata non coincide con la versione in anteprima.',
        'version',
      ),
    );
  }

  const exportable = errors.length === 0;
  return { exportable, blockingErrors: errors, warnings };
}

export function checkExportability(
  archive: DocumentArchive,
  documentId: string,
  versionId: string,
  previewState?: PreviewState | null,
): ExportabilityResult {
  const document = findDocument(archive, documentId);
  const version = findVersionById(archive, versionId);

  return validateExportability({
    archive,
    document,
    version,
    selectedVersionId: versionId,
    previewState,
  });
}

export function getExportPayload(
  archive: DocumentArchive,
  documentId: string,
  versionId: string,
  format: ExportFormat,
): { success: true; html: string; payload: unknown } | { success: false; errors: ExportError[] } {
  const result = validateExportability({
    archive,
    document: findDocument(archive, documentId),
    version: findVersionById(archive, versionId),
    selectedVersionId: versionId,
  });

  if (!result.exportable) {
    return { success: false, errors: result.blockingErrors };
  }

  const doc = findDocument(archive, documentId)!;
  const ver = findVersionById(archive, versionId)!;
  const html = renderDocument(doc, ver);

  return {
    success: true,
    html,
    payload: {
      format,
      document: doc,
      version: ver,
      html,
    },
  };
}
