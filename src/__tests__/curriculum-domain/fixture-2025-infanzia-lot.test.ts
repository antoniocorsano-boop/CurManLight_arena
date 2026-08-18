import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import { validateCurriculumSegment, validateCurriculumNode } from '../../domain/curriculum/validation';

describe('CURR-R2E-1 — 2025 Quadro generale + Infanzia lot', () => {
  it('covers infanzia experience fields from official index', () => {
    const titles = fixture2025.SEGMENTS_2025_INFANZIA.map(s => s.title);
    expect(titles).toEqual([
      'Il sé e l\'altro',
      'Il corpo e il movimento',
      'Immagini, suoni e colori',
      'I discorsi e le parole',
      'La conoscenza del mondo',
      'Dalla scuola dell\'infanzia alla scuola primaria',
    ]);
  });

  it('preserves source-native area kinds', () => {
    const experienceFields = fixture2025.SEGMENTS_2025_INFANZIA.filter(
      s => s.sourceArea?.kind === 'experience-field'
    );
    expect(experienceFields).toHaveLength(5);

    const generalSections = fixture2025.SEGMENTS_2025_INFANZIA.filter(
      s => s.sourceArea?.kind === 'general-section'
    );
    expect(generalSections).toHaveLength(1);
    expect(generalSections[0].title).toBe('Dalla scuola dell\'infanzia alla scuola primaria');
  });

  it('does not create artificial curriculum nodes for general sections', () => {
    const generalSectionNode = fixture2025.NODES_2025_INFANZIA.find(
      n => n.text.includes('Dalla scuola dell\'infanzia')
    );
    expect(generalSectionNode).toBeUndefined();
  });

  it('creates traguardo nodes only for experience fields', () => {
    expect(fixture2025.NODES_2025_INFANZIA).toHaveLength(5);
    for (const node of fixture2025.NODES_2025_INFANZIA) {
      expect(node.nodeType).toBe('traguardo');
      expect(node.normativeCheckpoint).toBe('end-infanzia');
      expect(node.normativeNodeKind).toBeUndefined();
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.legacy).toBeUndefined();
    }
  });

  it('verifies deterministic ordering of infanzia segments', () => {
    expect(fixture2025.SEGMENTS_2025_INFANZIA[0].title).toBe('Il sé e l\'altro');
    expect(fixture2025.SEGMENTS_2025_INFANZIA[1].title).toBe('Il corpo e il movimento');
    expect(fixture2025.SEGMENTS_2025_INFANZIA[4].title).toBe('La conoscenza del mondo');
    expect(fixture2025.SEGMENTS_2025_INFANZIA[5].title).toBe('Dalla scuola dell\'infanzia alla scuola primaria');
  });

  it('passes canonical validation for infanzia segments and nodes', () => {
    for (const segment of fixture2025.SEGMENTS_2025_INFANZIA) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }

    for (const node of fixture2025.NODES_2025_INFANZIA) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }
  });

  it('does not mutate 2025 fixture when validating', () => {
    const beforeSegmentTitles = fixture2025.SEGMENTS_2025_INFANZIA.map(s => s.title);
    const beforeNodeTexts = fixture2025.NODES_2025_INFANZIA.map(n => n.text);

    validateCurriculumSegment(fixture2025.SEGMENTS_2025_INFANZIA[0]);
    validateCurriculumNode(fixture2025.NODES_2025_INFANZIA[0]);

    expect(fixture2025.SEGMENTS_2025_INFANZIA.map(s => s.title)).toEqual(beforeSegmentTitles);
    expect(fixture2025.NODES_2025_INFANZIA.map(n => n.text)).toEqual(beforeNodeTexts);
  });

  it('preserves source provenance across infanzia entities', () => {
    for (const segment of fixture2025.SEGMENTS_2025_INFANZIA) {
      expect(segment.metadata.origin).toBe('normative-source');
      expect(segment.dataOrigin).toBe('normative-source');
      expect(segment.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
    }

    for (const node of fixture2025.NODES_2025_INFANZIA) {
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
    }
  });
});
