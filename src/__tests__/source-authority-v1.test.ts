import { describe, expect, it } from 'vitest';
import {
  RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS,
  USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES,
  describeKnowledgeAuthorityClass,
  getBuiltInKnowledgeSource,
} from '../features/documents/lib/knowledgeBuiltInSources';
import {
  isLocalKnowledgeEvidenceEligible,
  normalizeKnowledgeSourceLifecycle,
  type CustomKbDoc,
} from '../features/documents/lib/localKnowledgeStore';
import wikiHandlersSource from '../features/documents/hooks/useWikiGlossaryHandlers.ts?raw';
import fontiSource from '../features/documents/components/FontiTab.tsx?raw';

const localSource = (overrides: Partial<CustomKbDoc> = {}) => normalizeKnowledgeSourceLifecycle({
  id: 'vol-custom-authority',
  title: 'Fonte locale di prova',
  subtitle: 'Documento caricato',
  content: 'Contenuto della fonte',
  importedAt: '2026-09-01T03:00:00.000Z',
  authorityStatus: 'LOCAL_VERIFIED',
  ingestionMethod: 'TEXT_FILE',
  extractionStatus: 'READY',
  ...overrides,
});

describe('Source Authority v1', () => {
  it('defaults every user upload to LOCAL authority and does not promote it through local verification', () => {
    const source = localSource();

    expect(source.authorityClass).toBe('LOCAL');
    expect(source.authorityStatus).toBe('LOCAL_VERIFIED');
    expect(isLocalKnowledgeEvidenceEligible(source)).toBe(true);
  });

  it('fails closed if a user-local document is assigned a higher authority class without a governed promotion path', () => {
    const institutionalClaim = localSource({ authorityClass: 'INSTITUTIONAL' });
    const normativeClaim = localSource({ authorityClass: 'NORMATIVE' });

    expect(isLocalKnowledgeEvidenceEligible(institutionalClaim)).toBe(false);
    expect(isLocalKnowledgeEvidenceEligible(normativeClaim)).toBe(false);
  });

  it('classifies bundled materials explicitly and keeps derived material out of retrieval', () => {
    expect(getBuiltInKnowledgeSource('vol4')?.authorityClass).toBe('ARCHIVED_REFERENCE');
    expect(getBuiltInKnowledgeSource('vol6')?.authorityClass).toBe('DERIVED');
    expect(getBuiltInKnowledgeSource('vol5')?.authorityClass).toBe('DERIVED');
    expect(RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS.has('vol4')).toBe(true);
    expect(RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS.has('vol6')).toBe(false);
    expect(RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS.has('vol5')).toBe(false);
  });

  it('does not expose technical system sources in the human source registry', () => {
    expect(USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES.some((source) => source.technical)).toBe(false);
  });

  it('filters bundled volumes before the legacy retrieval engine', () => {
    expect(wikiHandlersSource).toContain('RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS.has(volume.id)');
    expect(wikiHandlersSource).toContain('volumes: evidenceEligibleBuiltIns');
  });

  it('shows authority class separately from verification and retrieval eligibility', () => {
    expect(fontiSource).toContain('data-authority-class={source.authorityClass}');
    expect(fontiSource).toContain('Autorità:');
    expect(fontiSource).toContain('L’autorità resta locale');
    expect(describeKnowledgeAuthorityClass('ARCHIVED_REFERENCE')).toBe('archivio di riferimento');
    expect(describeKnowledgeAuthorityClass('DERIVED')).toBe('materiale derivato');
  });
});
