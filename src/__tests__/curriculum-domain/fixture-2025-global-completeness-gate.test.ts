import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R2F — 2025 Global completeness gate', () => {
  const allSegments = [
    ...fixture2025.SEGMENTS_2025_INFANZIA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_INGLESE,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_STORIA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_GEOGRAFIA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_ARTE,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA,
    ...fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_ITALIANO,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_INGLESE,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_LATINO,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_STORIA,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_GEOGRAFIA,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_MUSICA,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_ARTE,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA,
    ...fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS,
  ];

  const allNodes = [
    ...fixture2025.NODES_2025_INFANZIA,
    ...fixture2025.NODES_2025_PRIMARIA_ITALIANO,
    ...fixture2025.NODES_2025_PRIMARIA_INGLESE,
    ...fixture2025.NODES_2025_PRIMARIA_STORIA,
    ...fixture2025.NODES_2025_PRIMARIA_GEOGRAFIA,
    ...fixture2025.NODES_2025_PRIMARIA_MATEMATICA,
    ...fixture2025.NODES_2025_PRIMARIA_SCIENZE,
    ...fixture2025.NODES_2025_PRIMARIA_TECNOLOGIA,
    ...fixture2025.NODES_2025_PRIMARIA_MUSICA,
    ...fixture2025.NODES_2025_PRIMARIA_ARTE,
    ...fixture2025.NODES_2025_PRIMARIA_EDUCAZIONE_FISICA,
    ...fixture2025.NODES_2025_SECONDARIA_ITALIANO,
    ...fixture2025.NODES_2025_SECONDARIA_INGLESE,
    ...fixture2025.NODES_2025_SECONDARIA_STRUMENTO_MUSICALE,
    ...fixture2025.NODES_2025_SECONDARIA_LATINO,
    ...fixture2025.NODES_2025_SECONDARIA_STORIA,
    ...fixture2025.NODES_2025_SECONDARIA_GEOGRAFIA,
    ...fixture2025.NODES_2025_SECONDARIA_MATEMATICA,
    ...fixture2025.NODES_2025_SECONDARIA_SCIENZE,
    ...fixture2025.NODES_2025_SECONDARIA_TECNOLOGIA,
    ...fixture2025.NODES_2025_SECONDARIA_MUSICA,
    ...fixture2025.NODES_2025_SECONDARIA_ARTE,
    ...fixture2025.NODES_2025_SECONDARIA_EDUCAZIONE_FISICA,
  ];

  it('validates every 2025 segment without errors', () => {
    for (const segment of allSegments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }
  });

  it('validates every 2025 node without errors', () => {
    for (const node of allNodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }
  });

  it('ensures every segment has valid sourceRefs and normative provenance', () => {
    for (const segment of allSegments) {
      expect(segment.sourceRefs).toHaveLength(1);
      expect(segment.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(segment.metadata.origin).toBe('normative-source');
      expect(segment.dataOrigin).toBe('normative-source');
      expect(segment.legacy).toBeUndefined();
    }
  });

  it('ensures every node has valid sourceRefs and normative provenance', () => {
    for (const node of allNodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('verifies node type coverage across all 2025 nodes', () => {
    const competenze = allNodes.filter(n => n.nodeType === 'competenza');
    const obiettivi = allNodes.filter(n => n.nodeType === 'obiettivo');
    const conoscenze = allNodes.filter(n => n.nodeType === 'conoscenza');

    expect(competenze.length).toBeGreaterThan(0);
    expect(obiettivi.length).toBeGreaterThan(0);
    expect(conoscenze.length).toBeGreaterThan(0);
  });

  it('ensures every obiettivo node has correct normativeNodeKind', () => {
    const obiettivi = allNodes.filter(n => n.nodeType === 'obiettivo');

    for (const node of obiettivi) {
      if (node.segmentRef.id.includes('PRIMARIA')) {
        expect(node.normativeNodeKind).toBe('osa-2025');
      }
    }
  });

  it('ensures every node has a valid normative checkpoint', () => {
    const validCheckpoints = new Set([
      'end-infanzia',
      'end-primary-grade-3',
      'end-primary',
      'end-lower-secondary',
    ]);

    for (const node of allNodes) {
      if (node.normativeCheckpoint) {
        expect(validCheckpoints.has(node.normativeCheckpoint)).toBe(true);
      }
    }
  });

  it('preserves frameworkApplicability only on Strumento musicale', () => {
    for (const segment of allSegments) {
      if (segment.sourceArea?.code === 'in2025-strumento-musicale') {
        expect(segment.frameworkApplicability).toBeDefined();
        expect(segment.frameworkApplicability?.framework).toBe('IN2025');
        expect(segment.frameworkApplicability?.resolutionStatus).toBe('resolved');
      } else {
        expect(segment.frameworkApplicability).toBeUndefined();
      }
    }
  });

  it('does not introduce synthetic disciplines', () => {
    const validDisciplineCodes = new Set([
      'italiano',
      'inglese',
      'latino',
      'seconda-lingua',
      'storia',
      'geografia',
      'matematica',
      'scienze',
      'tecnologia',
      'musica',
      'arte',
      'educazione-fisica',
    ]);

    for (const segment of allSegments) {
      if (segment.disciplineCode && segment.sourceArea?.kind === 'discipline') {
        expect(validDisciplineCodes.has(segment.disciplineCode)).toBe(true);
      }
    }
  });

  it('does not invent synthetic narrative-link nodes', () => {
    const syntheticLinkTexts = allNodes
      .map(n => n.text)
      .filter(text => /\bda\b.*\ba\b|\bverso\b|\bpassaggio\b|\btransizione\b/i.test(text));

    expect(syntheticLinkTexts).toHaveLength(0);
  });

  it('verifies complete fixture2025 export surface', () => {
    expect(fixture2025.SEGMENTS_2025_INFANZIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_INGLESE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_STORIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_GEOGRAFIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_ARTE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_ITALIANO.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_INGLESE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_LATINO.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_STORIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_GEOGRAFIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_MUSICA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_ARTE.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA.length).toBeGreaterThan(0);
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS.length).toBeGreaterThan(0);

    expect(fixture2025.NODES_2025_INFANZIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_ITALIANO.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_INGLESE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_STORIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_GEOGRAFIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_MATEMATICA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_SCIENZE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_TECNOLOGIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_MUSICA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_ARTE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_PRIMARIA_EDUCAZIONE_FISICA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_ITALIANO.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_INGLESE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_STRUMENTO_MUSICALE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_LATINO.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_STORIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_GEOGRAFIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_MATEMATICA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_SCIENZE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_TECNOLOGIA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_MUSICA.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_ARTE.length).toBeGreaterThan(0);
    expect(fixture2025.NODES_2025_SECONDARIA_EDUCAZIONE_FISICA.length).toBeGreaterThan(0);
  });
});
