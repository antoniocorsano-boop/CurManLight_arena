import { describe, expect, it } from 'vitest';
import {
  isLocalKnowledgeEvidenceEligible,
  normalizeKnowledgeSourceLifecycle,
  type CustomKbDoc,
} from '../features/documents/lib/localKnowledgeStore';
import wikiHandlersSource from '../features/documents/hooks/useWikiGlossaryHandlers.ts?raw';
import fontiSource from '../features/documents/components/FontiTab.tsx?raw';

const baseSource = (overrides: Partial<CustomKbDoc> = {}) => ({
  id: 'vol-custom-test',
  title: 'Documento di prova',
  subtitle: 'Fonte locale',
  content: 'Contenuto verificabile',
  importedAt: '2026-09-01T02:00:00.000Z',
  authorityStatus: 'LOCAL_UNVERIFIED' as const,
  ingestionMethod: 'PDF_TEXT_EXTRACTION' as const,
  extractionStatus: 'READY' as const,
  sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  ...overrides,
});

describe('Source Lifecycle v1', () => {
  it('makes a new upload consult-only even when text extraction is ready', () => {
    const source = normalizeKnowledgeSourceLifecycle(baseSource());

    expect(source.sourceType).toBe('USER_LOCAL_DOCUMENT');
    expect(source.lifecycleStatus).toBe('PENDING_VERIFICATION');
    expect(source.evidenceEligibility).toBe('CONSULT_ONLY');
    expect(source.sourceVersionId).toBe(`sha256:${baseSource().sha256}`);
    expect(isLocalKnowledgeEvidenceEligible(source)).toBe(false);
  });

  it('allows a verified local source into retrieval only when extraction is evidence-ready', () => {
    const source = normalizeKnowledgeSourceLifecycle(baseSource({
      authorityStatus: 'LOCAL_VERIFIED',
      verifiedAt: '2026-09-01T02:05:00.000Z',
    }));

    expect(source.lifecycleStatus).toBe('VERIFIED_LOCAL');
    expect(source.evidenceEligibility).toBe('LOCAL_EVIDENCE');
    expect(isLocalKnowledgeEvidenceEligible(source)).toBe(true);
  });

  it('keeps partial or OCR-required material out of evidence retrieval even after verification', () => {
    const partial = normalizeKnowledgeSourceLifecycle(baseSource({
      authorityStatus: 'LOCAL_VERIFIED',
      extractionStatus: 'PARTIAL',
    }));
    const ocrRequired = normalizeKnowledgeSourceLifecycle(baseSource({
      authorityStatus: 'LOCAL_VERIFIED',
      extractionStatus: 'OCR_REQUIRED',
    }));

    expect(partial.evidenceEligibility).toBe('CONSULT_ONLY');
    expect(ocrRequired.evidenceEligibility).toBe('CONSULT_ONLY');
    expect(isLocalKnowledgeEvidenceEligible(partial)).toBe(false);
    expect(isLocalKnowledgeEvidenceEligible(ocrRequired)).toBe(false);
  });

  it('filters user uploads before they reach the legacy retrieval engine', () => {
    expect(wikiHandlersSource).toContain('customKbDocs.filter(isLocalKnowledgeEvidenceEligible)');
    expect(wikiHandlersSource).toContain('customDocs: evidenceEligibleCustomDocs');
  });

  it('shows lifecycle and evidence-use state in the source registry', () => {
    expect(fontiSource).toContain('data-source-lifecycle={source.lifecycleStatus}');
    expect(fontiSource).toContain('data-evidence-eligibility={source.evidenceEligibility}');
    expect(fontiSource).toContain('Uso nel retrieval:');
    expect(fontiSource).toContain('sola consultazione');
    expect(fontiSource).toContain('evidenza locale');
  });
});
