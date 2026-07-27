/**
 * CML-633C — Sources and Curriculum Domain Tests
 *
 * Test unitari per fonti, dominio curricolare canonico, adapter e repository.
 */

import { describe, it, expect } from 'vitest';

import type {
  Source,
  SourceVersion,
} from '../../domain/curriculum/sources/types';

import type {
  CurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  CurriculumLink,
} from '../../domain/curriculum/model/types';

import type { EntityId } from '../../domain/curriculum/identity/types';

import { SCHOOL_ORDERS, resolveDisciplineCode, DISCIPLINES } from '../../domain/curriculum/model/vocabularies';

import {
  createSource,
  createLegacySource,
  createSourceVersion,
  createCurriculumVersion,
  createCurriculumSegment,
  createCurriculumNode,
  createLegacyNode,
  createEvidenceNode,
  createCurriculumLink,
  createSourceReference,
  createCurriculumVersionReference,
  createSegmentReference,
  createNodeReference,
} from '../../domain/curriculum/constructors';

import {
  validateSource,
  validateCurriculumVersion,
  validateCurriculumSegment,
  validateCurriculumNode,
  validateCurriculumLink,
  checkReferentialIntegrity,
  detectDuplicateNodes,
  detectDuplicateSources,
} from '../../domain/curriculum/validation';

import {
  adaptCurriculumKB,
  adaptDiscipline,
  verifyMigrationMatrix,
} from '../../domain/curriculum/adapters';

import {
  serializeCanonicalCurriculumDomain,
  deserializeCanonicalCurriculumDomain,
} from '../../domain/curriculum/serialization';
import { createA02CurriculumReadModel, createA11SourceReadModel } from '../../domain/curriculum/readModels';

import {
  SourceRepository,
  SourceVersionRepository,
  CurriculumVersionRepository,
  CurriculumNodeRepository,
  CurriculumDomainRepository,
} from '../../domain/curriculum/repositories';

import { curriculumKB } from '../../data/curriculumKB';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOW = '2026-07-27T10:00:00Z';
const VERSION_REF = createCurriculumVersionReference('a1b2c3d4-0001-4000-8000-000000000001' as EntityId, 'Test Version');
const SEGMENT_REF = createSegmentReference('a1b2c3d4-0002-4000-8000-000000000002' as EntityId, 'Test Segment');

function makeSource(overrides: Partial<Source> = {}): Source {
  return createSource(overrides.title || 'Test Source', (overrides.sourceType as any) || 'normative-national', {
    schoolOrders: ['primaria'],
    disciplines: ['matematica'],
    isNational: true,
  }, { now: NOW, ...overrides });
}

function makeVersion(overrides: Partial<CurriculumVersion> = {}): CurriculumVersion {
  return createCurriculumVersion('Test Curriculum', 'primaria', {
    disciplines: ['matematica'],
    now: NOW,
    ...overrides,
  });
}

function makeSegment(overrides: Partial<CurriculumSegment> = {}): CurriculumSegment {
  return createCurriculumSegment(VERSION_REF, 'primaria', 'matematica', 'Matematica Primaria', {
    now: NOW,
    ...overrides,
  });
}

function makeNode(overrides: Partial<CurriculumNode> = {}): CurriculumNode {
  return createCurriculumNode(VERSION_REF, SEGMENT_REF, (overrides.nodeType as any) || 'traguardo', overrides.text || 'Test traguardo', {
    now: NOW,
    ...overrides,
  });
}

function makeLink(overrides: Partial<CurriculumLink> = {}): CurriculumLink {
  return createCurriculumLink(
    createNodeReference('c0de0001-0001-4000-8000-000000000001' as EntityId),
    createNodeReference('c0de0002-0002-4000-8000-000000000002' as EntityId),
    'progression',
    { now: NOW, ...overrides }
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARIES TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CML-633C — Vocabularies', () => {
  it('SCHOOL_ORDERS contains 3 orders', () => {
    expect(SCHOOL_ORDERS).toHaveLength(3);
    expect(SCHOOL_ORDERS).toContain('infanzia');
    expect(SCHOOL_ORDERS).toContain('primaria');
    expect(SCHOOL_ORDERS).toContain('secondaria');
  });

  it('DISCIPLINES contains 14 disciplines', () => {
    expect(DISCIPLINES).toHaveLength(14);
  });

  it('resolveDisciplineCode resolves known alias', () => {
    expect(resolveDisciplineCode('italiano')).toBe('italiano');
    expect(resolveDisciplineCode('Italiano')).toBe('italiano');
    expect(resolveDisciplineCode('Lingua Italiana')).toBe('italiano');
  });

  it('resolveDisciplineCode returns undefined for unknown', () => {
    expect(resolveDisciplineCode('fisica')).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CML-633C — Constructors', () => {
  describe('Source Constructors', () => {
    it('createSource creates a valid source', () => {
      const source = makeSource();
      expect(source.id).toBeTruthy();
      expect(source.title).toBe('Test Source');
      expect(source.sourceType).toBe('normative-national');
      expect(source.status).toBe('unverified');
    });

  it('createLegacySource creates a legacy source', () => {
      const source = createLegacySource('Legacy Source', 'legacy', {}, NOW);
      expect(source.status).toBe('legacy');
      expect(source.metadata.origin).toBe('legacy');
    });
  });

  it('createSourceVersion keeps the logical source reference and version state', () => {
    const source = makeSource();
    const version = createSourceVersion(createSourceReference(source.id), 1, { now: NOW });
    expect(version.sourceRef.id).toBe(source.id);
    expect(version.versionNumber).toBe(1);
    expect(version.status).toBe('unverified');
  });

  describe('Curriculum Version Constructors', () => {
    it('createCurriculumVersion creates a valid version', () => {
      const v = makeVersion();
      expect(v.id).toBeTruthy();
      expect(v.title).toBe('Test Curriculum');
      expect(v.scope.schoolOrder).toBe('primaria');
      expect(v.status).toBe('draft');
    });
  });

  describe('Curriculum Segment Constructors', () => {
    it('createCurriculumSegment creates a valid segment', () => {
      const s = makeSegment();
      expect(s.id).toBeTruthy();
      expect(s.schoolOrder).toBe('primaria');
      expect(s.disciplineCode).toBe('matematica');
      expect(s.status).toBe('empty');
    });
  });

  describe('Curriculum Node Constructors', () => {
    it('createCurriculumNode creates a valid node', () => {
      const n = makeNode();
      expect(n.id).toBeTruthy();
      expect(n.nodeType).toBe('traguardo');
      expect(n.text).toBe('Test traguardo');
      expect(n.status).toBe('active');
    });

    it('createLegacyNode creates a legacy node with info', () => {
      const n = createLegacyNode(VERSION_REF, SEGMENT_REF, 'traguardo', 'Legacy text', 'legacy_key', NOW);
      expect(n.provenance).toBe('legacy');
      expect(n.legacy?.isLegacy).toBe(true);
      expect(n.legacy?.originalKey).toBe('legacy_key');
      expect(n.legacy?.migrationDate).toBe(NOW);
    });

    it('createEvidenceNode creates an evidence node', () => {
      const n = createEvidenceNode(VERSION_REF, SEGMENT_REF, 'Evidence text');
      expect(n.nodeType).toBe('evidenza');
      expect(n.text).toBe('Evidence text');
    });
  });

  describe('Curriculum Link Constructors', () => {
    it('createCurriculumLink creates a valid link', () => {
      const l = makeLink();
      expect(l.id).toBeTruthy();
      expect(l.linkType).toBe('progression');
      expect(l.status).toBe('active');
    });
  });

  describe('Entity Reference Helpers', () => {
    it('createSourceReference creates valid reference', () => {
      const ref = createSourceReference('a1b2c3d4-0000-4000-8000-000000000001' as EntityId, 'v1');
      expect(ref.id).toBe('a1b2c3d4-0000-4000-8000-000000000001');
      expect(ref.entityType).toBe('source');
    });

    it('createNodeReference creates valid reference', () => {
      const ref = createNodeReference('a1b2c3d4-0000-4000-8000-000000000002' as EntityId);
      expect(ref.id).toBe('a1b2c3d4-0000-4000-8000-000000000002');
      expect(ref.entityType).toBe('curriculum-node');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CML-633C — Validation', () => {
  describe('Source Validation', () => {
    it('valid source passes', () => {
      const result = validateSource(makeSource());
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('source without title fails', () => {
      const source = createSource('', 'legacy', {}, { now: NOW });
      const result = validateSource(source);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'SRC-003')).toBe(true);
    });

    it('source with invalid type fails', () => {
      const source = makeSource({ sourceType: 'invalid' as any });
      const result = validateSource(source);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'SRC-004')).toBe(true);
    });
  });

  describe('Curriculum Version Validation', () => {
    it('valid version passes', () => {
      const result = validateCurriculumVersion(makeVersion());
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('version without title fails', () => {
      const v = createCurriculumVersion('', 'primaria', { now: NOW });
      const result = validateCurriculumVersion(v);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'CUR-003')).toBe(true);
    });

    it('version with invalid status fails', () => {
      const v = makeVersion({ status: 'invalid' as any });
      const result = validateCurriculumVersion(v);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'CUR-006')).toBe(true);
    });
  });

  describe('Curriculum Segment Validation', () => {
    it('valid segment passes', () => {
      const result = validateCurriculumSegment(makeSegment());
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('segment without discipline fails', () => {
      const s = createCurriculumSegment(VERSION_REF, 'primaria', '' as any, 'Test', { now: NOW });
      const result = validateCurriculumSegment(s);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'SEG-005')).toBe(true);
    });
  });

  describe('Curriculum Node Validation', () => {
    it('valid node passes', () => {
      const result = validateCurriculumNode(makeNode());
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('node without text fails', () => {
      const n = createCurriculumNode(VERSION_REF, SEGMENT_REF, 'traguardo', '', { now: NOW });
      const result = validateCurriculumNode(n);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'NODE-006')).toBe(true);
    });

    it('node without source gets warning', () => {
      const n = makeNode();
      const result = validateCurriculumNode(n);
      expect(result.errors.some(e => e.code === 'NODE-009')).toBe(true);
    });

    it('legacy node without legacy info gets warning', () => {
      const n = makeNode({ provenance: 'legacy', legacy: undefined });
      const result = validateCurriculumNode(n);
      expect(result.errors.some(e => e.code === 'NODE-010')).toBe(true);
    });
  });

  describe('Curriculum Link Validation', () => {
    it('valid link passes', () => {
      const result = validateCurriculumLink(makeLink());
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('self-referencing link fails', () => {
      const ref = createNodeReference('a1b2c3d4-0003-4000-8000-000000000003' as EntityId);
      const l = createCurriculumLink(ref, ref, 'progression', { now: NOW });
      const result = validateCurriculumLink(l);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'LINK-008')).toBe(true);
    });
  });

  describe('Referential Integrity', () => {
    it('detects broken references', () => {
      const segment = makeSegment();
      const node = createCurriculumNode(
        VERSION_REF,
        createSegmentReference(segment.id),
        'traguardo',
        'Test traguardo',
        { now: NOW }
      );
      const brokenLink = createCurriculumLink(
        createNodeReference('aaaaaaaa-0000-4000-8000-000000000000' as EntityId),
        createNodeReference(node.id),
        'progression',
        { now: NOW }
      );
      const result = checkReferentialIntegrity([node], [segment], [brokenLink]);
      expect(result.broken.length).toBeGreaterThan(0);
    });

    it('valid references pass', () => {
      const segment = makeSegment();
      const node = createCurriculumNode(
        VERSION_REF,
        createSegmentReference(segment.id),
        'traguardo',
        'Test traguardo',
        { now: NOW }
      );
      const link = createCurriculumLink(
        createNodeReference(node.id),
        createNodeReference(node.id),
        'progression',
        { now: NOW }
      );
      const result = checkReferentialIntegrity([node], [segment], [link]);
      expect(result.broken).toHaveLength(0);
    });
  });

  describe('Duplicate Detection', () => {
    it('detects duplicate nodes', () => {
      const n1 = makeNode({ id: 'n1' as any });
      const n2 = makeNode({ id: 'n2' as any, text: 'Test traguardo' });
      const duplicates = detectDuplicateNodes([n1, n2]);
      expect(duplicates.length).toBeGreaterThan(0);
    });

    it('detects duplicate sources', () => {
      const s1 = createSource('Same Title', 'legacy', {}, { now: NOW });
      const s2 = createSource('Same Title', 'legacy', {}, { now: NOW });
      const duplicates = detectDuplicateSources([s1, s2]);
      expect(duplicates.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPOSITORY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CML-633C — Repositories', () => {
  describe('SourceRepository', () => {
    it('add and getById', () => {
      const repo = new SourceRepository();
      const source = makeSource();
      repo.add(source);
      expect(repo.getById(source.id)).toBe(source);
    });

    it('findByType', () => {
      const repo = new SourceRepository();
      repo.add(makeSource({ sourceType: 'normative-national' }));
      repo.add(makeSource({ sourceType: 'legacy' }));
      expect(repo.findByType('normative-national')).toHaveLength(1);
    });

    it('count', () => {
      const repo = new SourceRepository();
      repo.add(makeSource());
      expect(repo.count()).toBe(1);
    });

    it('finds sources by available authority', () => {
      const repo = new SourceRepository();
      repo.add(makeSource({ authority: 'Ministero' }));
      expect(repo.findByAuthority('ministero')).toHaveLength(1);
    });
  });

  describe('SourceVersionRepository', () => {
    it('finds versions by their logical source', () => {
      const source = makeSource();
      const version: SourceVersion = createSourceVersion(createSourceReference(source.id), 1, { now: NOW });
      const repo = new SourceVersionRepository();
      repo.add(version);
      expect(repo.findBySource(source.id)).toEqual([version]);
    });
  });

  describe('CurriculumVersionRepository', () => {
    it('add and getById', () => {
      const repo = new CurriculumVersionRepository();
      const v = makeVersion();
      repo.add(v);
      expect(repo.getById(v.id)).toBe(v);
    });

    it('findActive', () => {
      const repo = new CurriculumVersionRepository();
      repo.add(makeVersion({ status: 'active' }));
      repo.add(makeVersion({ status: 'draft' }));
      expect(repo.findActive()).toHaveLength(1);
    });
  });

  describe('CurriculumNodeRepository', () => {
    it('add and getByType', () => {
      const repo = new CurriculumNodeRepository();
      repo.add(makeNode({ nodeType: 'traguardo' }));
      repo.add(makeNode({ nodeType: 'obiettivo' }));
      expect(repo.findByType('traguardo')).toHaveLength(1);
    });

    it('findLegacy', () => {
      const repo = new CurriculumNodeRepository();
      repo.add(makeNode({ provenance: 'legacy' }));
      repo.add(makeNode({ provenance: 'normative' }));
      expect(repo.findLegacy()).toHaveLength(1);
    });

    it('findWithoutSource', () => {
      const repo = new CurriculumNodeRepository();
      repo.add(makeNode({ sourceRefs: [] }));
      expect(repo.findWithoutSource()).toHaveLength(1);
    });
  });

  describe('CurriculumDomainRepository', () => {
    it('stats reports all counts', () => {
      const repo = new CurriculumDomainRepository();
      repo.sources.add(makeSource());
      repo.versions.add(makeVersion());
      repo.segments.add(makeSegment());
      repo.nodes.add(makeNode());
      repo.links.add(makeLink());
      const stats = repo.stats();
      expect(stats.sources).toBe(1);
      expect(stats.versions).toBe(1);
      expect(stats.segments).toBe(1);
      expect(stats.nodes).toBe(1);
      expect(stats.links).toBe(1);
    });

    it('clear resets all', () => {
      const repo = new CurriculumDomainRepository();
      repo.sources.add(makeSource());
      repo.nodes.add(makeNode());
      repo.clear();
      expect(repo.stats().sources).toBe(0);
      expect(repo.stats().nodes).toBe(0);
    });

    it('filters nodes through their segments and resolves missing sources', () => {
      const repo = new CurriculumDomainRepository();
      const segment = makeSegment();
      repo.segments.add(segment);
      repo.nodes.add(createCurriculumNode(VERSION_REF, createSegmentReference(segment.id), 'evidenza', 'Evidence', { now: NOW }));
      expect(repo.findNodes({ order: 'primaria', discipline: 'matematica', nodeType: 'evidenza' })).toHaveLength(1);
      expect(repo.resolveNodeSources(repo.nodes.getAll()[0]).missing).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CML-633C — CurriculumKB Adapter', () => {
  it('adaptCurriculumKB processes all disciplines', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    expect(result.segments.length).toBeGreaterThan(0);
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.version).toBeTruthy();
  });

  it('adapts deterministically without changing legacy data', () => {
    const first = adaptCurriculumKB(curriculumKB, NOW);
    const second = adaptCurriculumKB(curriculumKB, NOW);
    expect(first.sources.map(source => source.id)).toEqual(second.sources.map(source => source.id));
    expect(first.segments.map(segment => segment.id)).toEqual(second.segments.map(segment => segment.id));
    expect(first.nodes.map(node => node.id)).toEqual(second.nodes.map(node => node.id));
    expect(first.nodes.map(node => node.text)).toEqual(second.nodes.map(node => node.text));
  });

  it('creates a legacy provenance source without inventing external metadata', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toMatchObject({
      title: 'curriculumKB legacy',
      sourceType: 'legacy',
      status: 'legacy',
    });
    expect(result.sources[0].authority).toBeUndefined();
    expect(result.sources[0].issuedAt).toBeUndefined();
    expect(result.sources[0].versionLabel).toBeUndefined();
  });

  it('assigns each segment to a curriculum version of the same school order', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    const versionsById = new Map(result.versions.map(version => [version.id, version]));
    for (const segment of result.segments) {
      expect(versionsById.get(segment.curriculumVersionRef.id)?.scope.schoolOrder).toBe(segment.schoolOrder);
    }
  });

  it('preserves original text', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    const legacyNodes = result.nodes.filter(n => n.provenance === 'legacy');
    expect(legacyNodes.length).toBeGreaterThan(0);
    for (const node of legacyNodes) {
      expect(node.text).toBeTruthy();
      expect(node.legacy?.originalText).toBe(node.text);
    }
  });

  it('classifies nodes without source correctly', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    expect(result.stats.nodesWithoutSource).toBe(result.stats.totalNodes);
  });

  it('reports evidences', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    expect(result.stats.evidences).toBeGreaterThan(0);
  });

  it('reports legacy nodes', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    expect(result.stats.legacyNodes).toBe(result.stats.totalNodes);
  });

  it('reports proposals as experimental', () => {
    const result = adaptCurriculumKB(curriculumKB, NOW);
    expect(result.stats.proposals).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('Proposta trovata'))).toBe(true);
  });

  it('verifyMigrationMatrix covers all 14 disciplines', () => {
    const matrix = verifyMigrationMatrix(curriculumKB);
    expect(matrix.disciplines).toHaveLength(14);
    expect(matrix.orders).toHaveLength(3);
  });

  it('adaptDiscipline works for single discipline', () => {
    const result = adaptDiscipline('matematica', curriculumKB['matematica'], NOW);
    expect(result.segments.length).toBeGreaterThan(0);
    expect(result.nodes.length).toBeGreaterThan(0);
  });
});

describe('CML-633C — Serialization', () => {
  it('round-trips the adapted domain without losing canonical identity', () => {
    const adapted = adaptCurriculumKB(curriculumKB, NOW);
    const result = deserializeCanonicalCurriculumDomain(serializeCanonicalCurriculumDomain(adapted));
    expect(result.success).toBe(true);
    expect(result.data?.nodes.map(node => node.id)).toEqual(adapted.nodes.map(node => node.id));
    expect(result.data?.sources[0].metadata.origin).toBe('legacy');
  });

  it('rejects a future schema without returning domain data', () => {
    const result = deserializeCanonicalCurriculumDomain(JSON.stringify({ schemaVersion: 999, data: {} }));
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors[0]).toContain('non supportata');
  });
});

describe('CML-633C — Read contracts', () => {
  it('exposes source completeness and missing references for A11', () => {
    const adapted = adaptCurriculumKB(curriculumKB, NOW);
    const sources = createA11SourceReadModel(adapted).list();
    expect(sources[0]).toMatchObject({ status: 'legacy', completeness: 'partial' });
    expect(sources[0].nodesWithoutSource).toBe(adapted.stats.nodesWithoutSource);
  });

  it('filters canonical consultation data for A02 without mutating the KB', () => {
    const adapted = adaptCurriculumKB(curriculumKB, NOW);
    const nodes = createA02CurriculumReadModel(adapted).search({ discipline: 'inglese', nodeType: 'evidenza' });
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every(node => node.nodeType === 'evidenza')).toBe(true);
  });
});
