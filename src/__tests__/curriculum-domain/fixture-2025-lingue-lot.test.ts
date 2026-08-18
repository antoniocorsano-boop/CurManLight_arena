import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R2D — 2025 Lingue lotto verification', () => {
  it('includes English for primaria and secondaria', () => {
    const englishPrimaria = fixture2025.SEGMENTS_2025_PRIMARIA_INGLESE[0];
    const englishSecondaria = fixture2025.SEGMENTS_2025_SECONDARIA_INGLESE[0];

    expect(englishPrimaria).toBeDefined();
    expect(englishPrimaria.disciplineCode).toBe('inglese');
    expect(englishPrimaria.schoolOrder).toBe('primaria');
    expect(englishPrimaria.sourceArea?.kind).toBe('discipline');
    expect(englishPrimaria.status).toBe('complete');
    expect(englishPrimaria.completeness).toBe('complete');

    expect(englishSecondaria).toBeDefined();
    expect(englishSecondaria.disciplineCode).toBe('inglese');
    expect(englishSecondaria.schoolOrder).toBe('secondaria');
    expect(englishSecondaria.sourceArea?.kind).toBe('discipline');
    expect(englishSecondaria.status).toBe('complete');
    expect(englishSecondaria.completeness).toBe('complete');
  });

  it('includes Latino for secondaria', () => {
    const latino = fixture2025.SEGMENTS_2025_SECONDARIA_LATINO[0];

    expect(latino).toBeDefined();
    expect(latino.disciplineCode).toBe('latino');
    expect(latino.schoolOrder).toBe('secondaria');
    expect(latino.sourceArea?.kind).toBe('discipline');
    expect(latino.sourceArea?.code).toBe('in2025-latino');
    expect(latino.sourceArea?.label).toBe('Latino');
    expect(latino.status).toBe('complete');
    expect(latino.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for English segments', () => {
    const englishPrimaria = fixture2025.SEGMENTS_2025_PRIMARIA_INGLESE[0];
    const englishSecondaria = fixture2025.SEGMENTS_2025_SECONDARIA_INGLESE[0];

    expect(englishPrimaria.sourceArea?.code).toBe('in2025-inglese');
    expect(englishPrimaria.sourceArea?.label).toBe('Inglese');

    expect(englishSecondaria.sourceArea?.code).toBe('in2025-inglese');
    expect(englishSecondaria.sourceArea?.label).toBe('Inglese');
  });

  it('passes canonical validation for every language segment', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_INGLESE,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_INGLESE,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_LATINO,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for English', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_INGLESE;
    expect(nodes).toHaveLength(3);

    const competenza = nodes.find(n => n.nodeType === 'competenza');
    const obiettivoGrade3 = nodes.find(n => n.nodeType === 'obiettivo' && n.normativeCheckpoint === 'end-primary-grade-3');
    const conoscenza = nodes.find(n => n.nodeType === 'conoscenza');

    expect(competenza).toBeDefined();
    expect(competenza?.text).toBe('Competenza - fine primaria');
    expect(competenza?.normativeCheckpoint).toBe('end-primary');

    expect(obiettivoGrade3).toBeDefined();
    expect(obiettivoGrade3?.text).toBe('Obiettivo OSA 2025 - classe III');
    expect(obiettivoGrade3?.normativeCheckpoint).toBe('end-primary-grade-3');
    expect(obiettivoGrade3?.normativeNodeKind).toBe('osa-2025');

    expect(conoscenza).toBeDefined();
    expect(conoscenza?.text).toBe('Conoscenza - fine primaria');
    expect(conoscenza?.normativeCheckpoint).toBe('end-primary');
  });

  it('contains required lower-secondary nodes for English', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_INGLESE;
    expect(nodes).toHaveLength(1);

    const competenza = nodes.find(n => n.nodeType === 'competenza');
    expect(competenza).toBeDefined();
    expect(competenza?.text).toBe('Competenza - fine secondaria I grado');
    expect(competenza?.normativeCheckpoint).toBe('end-lower-secondary');
  });

  it('contains required lower-secondary nodes for Latino', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_LATINO;
    expect(nodes).toHaveLength(2);

    const competenza = nodes.find(n => n.nodeType === 'competenza');
    const obiettivo = nodes.find(n => n.nodeType === 'obiettivo');

    expect(competenza).toBeDefined();
    expect(competenza?.text).toBe('Competenza - fine secondaria I grado');
    expect(competenza?.normativeCheckpoint).toBe('end-lower-secondary');

    expect(obiettivo).toBeDefined();
    expect(obiettivo?.text).toBe('Obiettivo LEL - classe II');
    expect(obiettivo?.normativeCheckpoint).toBe('end-lower-secondary');
    expect(obiettivo?.normativeNodeKind).toBe('osa-2025');
  });

  it('marks every language node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_INGLESE,
      ...fixture2025.NODES_2025_SECONDARIA_INGLESE,
      ...fixture2025.NODES_2025_SECONDARIA_LATINO,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every language node', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_INGLESE,
      ...fixture2025.NODES_2025_SECONDARIA_INGLESE,
      ...fixture2025.NODES_2025_SECONDARIA_LATINO,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for English and Latino segments', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_INGLESE[0].title).toBe('Inglese');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_INGLESE[0].title).toBe('Inglese');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_LATINO[0].title).toBe('Latino');
  });
});
