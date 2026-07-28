import { describe, it, expect } from 'vitest';
import {
  validateExportFormat,
  getExportExtension,
  getExportMime,
  buildExportFilename,
  validateExportContent,
  checkFormatConsistency,
  EXPORT_FORMAT_META,
  VALID_EXPORT_FORMATS,
} from '../domain/documents';

describe('validateExportFormat', () => {
  it('accepts html', () => {
    expect(validateExportFormat('html').valid).toBe(true);
  });

  it('accepts json', () => {
    expect(validateExportFormat('json').valid).toBe(true);
  });

  it('accepts pdf-browser', () => {
    expect(validateExportFormat('pdf-browser').valid).toBe(true);
  });

  it('rejects docx', () => {
    const result = validateExportFormat('docx');
    expect(result.valid).toBe(false);
  });

  it('rejects odt', () => {
    expect(validateExportFormat('odt').valid).toBe(false);
  });

  it('rejects odf', () => {
    expect(validateExportFormat('odf').valid).toBe(false);
  });

  it('rejects unknown formats', () => {
    expect(validateExportFormat('pdf').valid).toBe(false);
    expect(validateExportFormat('doc').valid).toBe(false);
    expect(validateExportFormat('xlsx').valid).toBe(false);
  });
});

describe('getExportExtension', () => {
  it('returns .html for html', () => {
    expect(getExportExtension('html')).toBe('.html');
  });

  it('returns .json for json', () => {
    expect(getExportExtension('json')).toBe('.json');
  });

  it('returns .pdf for pdf-browser', () => {
    expect(getExportExtension('pdf-browser')).toBe('.pdf');
  });
});

describe('getExportMime', () => {
  it('returns text/html for html', () => {
    expect(getExportMime('html')).toBe('text/html');
  });

  it('returns application/json for json', () => {
    expect(getExportMime('json')).toBe('application/json');
  });

  it('returns application/pdf for pdf-browser', () => {
    expect(getExportMime('pdf-browser')).toBe('application/pdf');
  });
});

describe('buildExportFilename', () => {
  it('builds filename from title', () => {
    const name = buildExportFilename({ title: 'Progettazione Annuale', format: 'html' });
    expect(name).toBe('progettazione-annuale.html');
  });

  it('includes version number when provided', () => {
    const name = buildExportFilename({ title: 'Report', format: 'json', versionNumber: 2 });
    expect(name).toBe('report-v2.json');
  });

  it('handles special characters', () => {
    const name = buildExportFilename({ title: 'Documento: Test (2024/2025)!', format: 'html' });
    expect(name).toMatch(/^[a-z0-9-]+\.html$/);
  });

  it('truncates long titles', () => {
    const long = 'a'.repeat(200);
    const name = buildExportFilename({ title: long, format: 'html' });
    expect(name.length).toBeLessThan(200);
  });
});

describe('validateExportContent', () => {
  it('validates HTML content', () => {
    const result = validateExportContent('html', '<!DOCTYPE html><html><body><p>Test</p></body></html>');
    expect(result.valid).toBe(true);
  });

  it('rejects empty HTML', () => {
    const result = validateExportContent('html', '');
    expect(result.valid).toBe(false);
  });

  it('validates JSON content', () => {
    const result = validateExportContent('json', JSON.stringify({ key: 'value' }));
    expect(result.valid).toBe(true);
  });

  it('rejects invalid JSON', () => {
    const result = validateExportContent('json', '{broken}');
    expect(result.valid).toBe(false);
  });

  it('validates browser PDF source', () => {
    const result = validateExportContent('pdf-browser', '<!DOCTYPE html><html><body><p>PDF</p></body></html>');
    expect(result.valid).toBe(true);
  });

  it('rejects HTML with script tags', () => {
    const result = validateExportContent('html', '<!DOCTYPE html><script>alert("x")</script>');
    expect(result.valid).toBe(false);
  });
});

describe('checkFormatConsistency', () => {
  it('passes with matching extension and MIME', () => {
    const result = checkFormatConsistency('html', '.html', 'text/html');
    expect(result.valid).toBe(true);
  });

  it('detects extension mismatch', () => {
    const result = checkFormatConsistency('html', '.pdf', 'text/html');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('EXTENSION_MISMATCH');
  });

  it('detects MIME mismatch', () => {
    const result = checkFormatConsistency('json', '.json', 'text/html');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('MIME_MISMATCH');
  });
});

describe('EXPORT_FORMAT_META consistency', () => {
  it('each format has extension and mime', () => {
    for (const format of VALID_EXPORT_FORMATS) {
      const meta = EXPORT_FORMAT_META[format];
      expect(meta.extension).toBeTruthy();
      expect(meta.mime).toBeTruthy();
    }
  });

  it('extension matches format (label → extension → mime → content)', () => {
    // Check format consistency across the board
    for (const format of VALID_EXPORT_FORMATS) {
      const extension = getExportExtension(format);
      const mime = getExportMime(format);
      const result = checkFormatConsistency(format, extension, mime);
      expect(result.valid).toBe(true);
    }
  });
});