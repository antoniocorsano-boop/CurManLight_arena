import { describe, it, expect } from 'vitest';
import {
  adaptLegacyUdaHtml,
  adaptLegacyExportEvent,
  adaptLegacyHtmlDocument,
  isLegacyDocumentPromotable,
  hasNoPhantomSource,
  hasNoPhantomAuthor,
} from '../domain/documents';

describe('adaptLegacyUdaHtml', () => {
  it('imports legacy HTML as legacy document', () => {
    const result = adaptLegacyUdaHtml('<html><body><p>UDA content</p></body></html>', {
      title: 'UDA Storia',
      date: '2024-01-15',
    });

    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.document.status).toBe('draft');
    expect(result.document.metadata.origin).toBe('legacy');
    expect(result.version.versionNumber).toBe(1);
  });

  it('returns warnings for missing title', () => {
    const result = adaptLegacyUdaHtml('<html></html>');
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.warnings.some(w => w.code === 'MISSING_TITLE')).toBe(true);
  });

  it('returns warnings for missing date', () => {
    const result = adaptLegacyUdaHtml('<html></html>', { title: 'Test' });
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.warnings.some(w => w.code === 'MISSING_DATE')).toBe(true);
  });

  it('returns warnings for missing author', () => {
    const result = adaptLegacyUdaHtml('<html></html>', { title: 'Test', date: '2024-01-01' });
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.warnings.some(w => w.code === 'MISSING_AUTHOR')).toBe(true);
  });

  it('fails on empty HTML', () => {
    const result = adaptLegacyUdaHtml('');
    expect(result.ok).toBe(false);
  });

  it('never promotes to approved', () => {
    const result = adaptLegacyUdaHtml('<html></html>', { title: 'Test' });
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.document.status).not.toBe('completed');
    expect(result.document.status).not.toBe('shared-locally');
  });

  it('never invents author', () => {
    const result = adaptLegacyUdaHtml('<html></html>', { title: 'Test' });
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    if (result.version.author) {
      expect(result.version.author.displayName).not.toBe('');
    }
  });
});

describe('adaptLegacyExportEvent', () => {
  it('imports export event as legacy document', () => {
    const result = adaptLegacyExportEvent({ title: 'Export 2024', date: '2024-06-01', format: 'html' });
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.document.metadata.origin).toBe('legacy');
  });

  it('returns warnings for missing fields', () => {
    const result = adaptLegacyExportEvent({});
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('fails on null event', () => {
    const result = adaptLegacyExportEvent(null as never);
    expect(result.ok).toBe(false);
  });
});

describe('adaptLegacyHtmlDocument', () => {
  it('imports generic HTML', () => {
    const result = adaptLegacyHtmlDocument('<html><body><p>Content</p></body></html>', {
      title: 'Documento Importato',
      date: '2024-01-01',
      author: 'Mario Rossi',
      source: 'export',
    });

    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.document.title).toBe('Documento Importato');
  });

  it('registers missing fields as warnings', () => {
    const result = adaptLegacyHtmlDocument('<html></html>', { title: 'Solo titolo' });
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });
});

describe('isLegacyDocumentPromotable', () => {
  it('allows legacy status', () => {
    expect(isLegacyDocumentPromotable('legacy')).toBe(true);
  });

  it('allows draft status', () => {
    expect(isLegacyDocumentPromotable('draft')).toBe(true);
  });

  it('rejects completed', () => {
    expect(isLegacyDocumentPromotable('completed')).toBe(false);
  });
});

describe('hasNoPhantomSource', () => {
  it('returns true for failed result', () => {
    const result = { ok: false as const, error: { code: 'ERROR', message: '' }, warnings: [] };
    expect(hasNoPhantomSource(result)).toBe(true);
  });

  it('returns true when no phantom source warning', () => {
    const result = { ok: true as const, document: {} as never, version: {} as never, warnings: [] };
    expect(hasNoPhantomSource(result)).toBe(true);
  });
});

describe('hasNoPhantomAuthor', () => {
  it('returns true for failed result', () => {
    const result = { ok: false as const, error: { code: 'ERROR', message: '' }, warnings: [] };
    expect(hasNoPhantomAuthor(result)).toBe(true);
  });

  it('returns true when no phantom author warning with "invented"', () => {
    const result = { ok: true as const, document: {} as never, version: {} as never, warnings: [] };
    expect(hasNoPhantomAuthor(result)).toBe(true);
  });
});