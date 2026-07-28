import type { ExportFormat, DocumentError, DocumentValidationResult } from './types';
import { VALID_EXPORT_FORMATS, EXPORT_FORMAT_META } from './vocabularies';

export function validateExportFormat(format: string): DocumentValidationResult {
  const errors: DocumentError[] = [];
  if (!VALID_EXPORT_FORMATS.includes(format as ExportFormat)) {
    errors.push({
      code: 'UNSUPPORTED_FORMAT',
      message: `Unsupported export format: "${format}". Supported: ${VALID_EXPORT_FORMATS.join(', ')}`,
    });
  }
  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors: [], warnings: [] };
}

export function getExportExtension(format: ExportFormat): string {
  return EXPORT_FORMAT_META[format].extension;
}

export function getExportMime(format: ExportFormat): string {
  return EXPORT_FORMAT_META[format].mime;
}

export interface ExportFilenameOptions {
  title: string;
  format: ExportFormat;
  versionNumber?: number;
}

export function buildExportFilename(options: ExportFilenameOptions): string {
  const base = options.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
  const version = options.versionNumber ? `-v${options.versionNumber}` : '';
  return `${base}${version}${EXPORT_FORMAT_META[options.format].extension}`;
}

export function validateExportContent(format: ExportFormat, content: string): DocumentValidationResult {
  const errors: DocumentError[] = [];

  if (content.length === 0) {
    errors.push({ code: 'EMPTY_CONTENT', message: 'Export content is empty' });
    return { valid: false, errors, warnings: [] };
  }

  switch (format) {
    case 'html': {
      if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
        errors.push({ code: 'INVALID_HTML', message: 'Export must contain valid HTML' });
      }
      if (/<script\b/.test(content)) {
        errors.push({ code: 'SCRIPT_IN_HTML', message: 'Export must not contain script tags' });
      }
      break;
    }
    case 'json': {
      try {
        JSON.parse(content);
      } catch {
        errors.push({ code: 'INVALID_JSON', message: 'Export must contain valid JSON' });
      }
      break;
    }
    case 'pdf-browser': {
      if (!content.includes('<!DOCTYPE html>')) {
        errors.push({ code: 'INVALID_PDF_SOURCE', message: 'Browser PDF export must contain valid HTML' });
      }
      break;
    }
  }

  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors: [], warnings: [] };
}

export function checkFormatConsistency(
  format: ExportFormat,
  extension: string,
  mime: string,
): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const expected = EXPORT_FORMAT_META[format];

  if (extension !== expected.extension) {
    errors.push({
      code: 'EXTENSION_MISMATCH',
      message: `Expected extension "${expected.extension}" for format "${format}", got "${extension}"`,
    });
  }

  if (mime !== expected.mime) {
    errors.push({
      code: 'MIME_MISMATCH',
      message: `Expected MIME "${expected.mime}" for format "${format}", got "${mime}"`,
    });
  }

  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors: [], warnings: [] };
}