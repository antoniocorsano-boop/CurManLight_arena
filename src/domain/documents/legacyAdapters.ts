import type { DocumentError, LegacyDocumentAdaptationResult } from './types';
import { createDocument, createInitialVersion, createInstitutionalSnapshot, createSectionHeading, createSectionParagraph } from './constructors';

export function adaptLegacyUdaHtml(
  html: string,
  metadata?: { title?: string; date?: string; author?: string },
): LegacyDocumentAdaptationResult {
  const warnings: DocumentError[] = [];

  if (!html || html.trim().length === 0) {
    return {
      ok: false,
      error: { code: 'EMPTY_HTML', message: 'Legacy HTML is empty' },
      warnings,
    };
  }

  if (!metadata?.title) {
    warnings.push({ code: 'MISSING_TITLE', message: 'Title not provided, using default' });
  }
  if (!metadata?.date) {
    warnings.push({ code: 'MISSING_DATE', message: 'Date not provided, using current' });
  }
  if (!metadata?.author) {
    warnings.push({ code: 'MISSING_AUTHOR', message: 'Author not provided' });
  }

  const now = metadata?.date ?? new Date().toISOString();
  const title = metadata?.title ?? 'Documento legacy (UDA HTML)';

  const doc = createDocument({
    documentType: 'generic-local-document',
    title,
    origin: 'legacy',
  }, now);

  const snapshot = createInstitutionalSnapshot('Istituto non configurato', { configured: false });

  const content = {
    sections: [
      createSectionHeading(1, title),
      createSectionParagraph('Documento importato da formato legacy UDA HTML.', 'quote'),
      createSectionParagraph(
        'Il contenuto originale è preservato come allegato. Il contenuto strutturato potrebbe essere incompleto.',
        'italic',
      ),
    ],
  };

  const version = createInitialVersion(doc, content, {
    author: metadata?.author ? { displayName: metadata.author, role: 'docente', assertion: 'imported' } : undefined,
    institutionalSnapshot: snapshot,
  }, now);

  return { ok: true, document: doc, version, warnings };
}

export function adaptLegacyExportEvent(
  event: { title?: string; date?: string; format?: string; content?: string },
): LegacyDocumentAdaptationResult {
  const warnings: DocumentError[] = [];

  if (!event) {
    return {
      ok: false,
      error: { code: 'EMPTY_EVENT', message: 'Export event is empty' },
      warnings,
    };
  }

  if (!event.title) {
    warnings.push({ code: 'MISSING_TITLE', message: 'Export title not provided' });
  }
  if (!event.date) {
    warnings.push({ code: 'MISSING_DATE', message: 'Export date not provided' });
  }
  if (!event.content) {
    warnings.push({ code: 'MISSING_CONTENT', message: 'Export content not provided' });
  }

  const now = event.date ?? new Date().toISOString();
  const title = event.title ?? 'Esportazione legacy';

  const doc = createDocument({
    documentType: 'generic-local-document',
    title,
    origin: 'legacy',
  }, now);

  const snapshot = createInstitutionalSnapshot('Istituto non configurato', { configured: false });

  const content = {
    sections: [
      createSectionHeading(1, title),
      createSectionParagraph(`Esportazione legacy (formato: ${event.format ?? 'sconosciuto'})`, 'italic'),
    ],
  };

  const version = createInitialVersion(doc, content, {
    institutionalSnapshot: snapshot,
  }, now);

  return { ok: true, document: doc, version, warnings };
}

export function adaptLegacyHtmlDocument(
  html: string,
  metadata?: { title?: string; date?: string; author?: string; source?: string },
): LegacyDocumentAdaptationResult {
  const warnings: DocumentError[] = [];

  if (!html || html.trim().length === 0) {
    return {
      ok: false,
      error: { code: 'EMPTY_HTML', message: 'Legacy HTML document is empty' },
      warnings,
    };
  }

  if (!metadata?.title) {
    warnings.push({ code: 'MISSING_TITLE', message: 'Title not provided' });
  }
  if (!metadata?.date) {
    warnings.push({ code: 'MISSING_DATE', message: 'Date not provided' });
  }
  if (!metadata?.author) {
    warnings.push({ code: 'MISSING_AUTHOR', message: 'Author not provided' });
  }
  if (!metadata?.source) {
    warnings.push({ code: 'MISSING_SOURCE', message: 'Source not provided' });
  }

  const now = metadata?.date ?? new Date().toISOString();
  const title = metadata?.title ?? 'Documento HTML legacy';

  const doc = createDocument({
    documentType: 'generic-local-document',
    title,
    origin: metadata?.source === 'export' ? 'imported' : 'legacy',
  }, now);

  const snapshot = createInstitutionalSnapshot('Istituto non configurato', { configured: false });

  const content = {
    sections: [
      createSectionHeading(1, title),
      createSectionParagraph('Documento HTML importato in formato legacy.', 'quote'),
    ],
  };

  const version = createInitialVersion(doc, content, {
    author: metadata?.author ? { displayName: metadata.author, role: 'docente', assertion: 'imported' } : undefined,
    institutionalSnapshot: snapshot,
  }, now);

  return { ok: true, document: doc, version, warnings };
}

export function isLegacyDocumentPromotable(status: string): boolean {
  return status === 'legacy' || status === 'draft';
}

export function hasNoPhantomSource(result: LegacyDocumentAdaptationResult): boolean {
  if (!result.ok) return true;
  return result.warnings.every(w => w.code !== 'MISSING_SOURCE' || w.message.includes('invented'));
}

export function hasNoPhantomAuthor(result: LegacyDocumentAdaptationResult): boolean {
  if (!result.ok) return true;
  return result.warnings.every(w => w.code !== 'MISSING_AUTHOR' || w.message.includes('invented'));
}