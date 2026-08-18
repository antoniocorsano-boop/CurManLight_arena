import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R1E-1 — Lingue lotto verification', () => {
  it('includes English and second community language for primaria and secondaria', () => {
    const englishPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE[0];
    const englishSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE[0];
    const secondaLinguaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0];
    const secondaLinguaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0];

    expect(englishPrimaria).toBeDefined();
    expect(englishPrimaria.disciplineCode).toBe('inglese');
    expect(englishSecondaria).toBeDefined();
    expect(englishSecondaria.disciplineCode).toBe('inglese');
    expect(secondaLinguaPrimaria).toBeDefined();
    expect(secondaLinguaPrimaria.disciplineCode).toBe('seconda-lingua');
    expect(secondaLinguaSecondaria).toBeDefined();
    expect(secondaLinguaSecondaria.disciplineCode).toBe('seconda-lingua');
  });

  it('assigns correct source-native area metadata for English segments', () => {
    const englishPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE[0];
    const englishSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE[0];

    expect(englishPrimaria.sourceArea?.kind).toBe('discipline');
    expect(englishPrimaria.sourceArea?.code).toBe('in2012-inglese');
    expect(englishPrimaria.sourceArea?.label).toBe('Lingua inglese');
    expect(englishPrimaria.schoolOrder).toBe('primaria');
    expect(englishPrimaria.status).toBe('complete');
    expect(englishPrimaria.completeness).toBe('complete');

    expect(englishSecondaria.sourceArea?.kind).toBe('discipline');
    expect(englishSecondaria.sourceArea?.code).toBe('in2012-inglese');
    expect(englishSecondaria.sourceArea?.label).toBe('Lingua inglese');
    expect(englishSecondaria.schoolOrder).toBe('secondaria');
    expect(englishSecondaria.status).toBe('complete');
    expect(englishSecondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for second community language segments', () => {
    const secondaLinguaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0];
    const secondaLinguaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0];

    expect(secondaLinguaPrimaria.sourceArea?.kind).toBe('discipline');
    expect(secondaLinguaPrimaria.sourceArea?.code).toBe('in2012-secondaLingua');
    expect(secondaLinguaPrimaria.sourceArea?.label).toBe('Seconda lingua comunitaria');
    expect(secondaLinguaPrimaria.schoolOrder).toBe('primaria');
    expect(secondaLinguaPrimaria.status).toBe('complete');
    expect(secondaLinguaPrimaria.completeness).toBe('complete');

    expect(secondaLinguaSecondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaLinguaSecondaria.sourceArea?.code).toBe('in2012-secondaLingua');
    expect(secondaLinguaSecondaria.sourceArea?.label).toBe('Seconda lingua comunitaria');
    expect(secondaLinguaSecondaria.schoolOrder).toBe('secondaria');
    expect(secondaLinguaSecondaria.status).toBe('complete');
    expect(secondaLinguaSecondaria.completeness).toBe('complete');
  });

  it('passes canonical validation for every language segment', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for English', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_INGLESE;
    expect(nodes).toHaveLength(3);

    const traguardo = nodes.find(n => n.nodeType === 'traguardo');
    const obiettivoClasseIII = nodes.find(n => n.nodeType === 'obiettivo' && n.normativeCheckpoint === 'end-primary-grade-3');
    const obiettivoFinePrimaria = nodes.find(n => n.nodeType === 'obiettivo' && n.normativeCheckpoint === 'end-primary');

    expect(traguardo).toBeDefined();
    expect(traguardo?.text).toBe('Traguardo - fine primaria');
    expect(traguardo?.normativeCheckpoint).toBe('end-primary');

    expect(obiettivoClasseIII).toBeDefined();
    expect(obiettivoClasseIII?.text).toBe('Obiettivo - classe III');
    expect(obiettivoClasseIII?.normativeCheckpoint).toBe('end-primary-grade-3');

    expect(obiettivoFinePrimaria).toBeDefined();
    expect(obiettivoFinePrimaria?.text).toBe('Obiettivo - fine primaria');
    expect(obiettivoFinePrimaria?.normativeCheckpoint).toBe('end-primary');
  });

  it('contains required lower-secondary nodes for English', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_INGLESE;
    expect(nodes).toHaveLength(2);

    const traguardo = nodes.find(n => n.nodeType === 'traguardo');
    const obiettivo = nodes.find(n => n.nodeType === 'obiettivo');

    expect(traguardo).toBeDefined();
    expect(traguardo?.text).toBe('Traguardo - fine secondaria I grado');
    expect(traguardo?.normativeCheckpoint).toBe('end-lower-secondary');

    expect(obiettivo).toBeDefined();
    expect(obiettivo?.text).toBe('Obiettivo - fine secondaria I grado');
    expect(obiettivo?.normativeCheckpoint).toBe('end-lower-secondary');
  });

  it('contains required primary nodes for second community language', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA;
    expect(nodes).toHaveLength(3);

    const traguardo = nodes.find(n => n.nodeType === 'traguardo');
    const obiettivoClasseIII = nodes.find(n => n.nodeType === 'obiettivo' && n.normativeCheckpoint === 'end-primary-grade-3');
    const obiettivoFinePrimaria = nodes.find(n => n.nodeType === 'obiettivo' && n.normativeCheckpoint === 'end-primary');

    expect(traguardo).toBeDefined();
    expect(traguardo?.text).toBe('Traguardo - fine primaria');
    expect(traguardo?.normativeCheckpoint).toBe('end-primary');

    expect(obiettivoClasseIII).toBeDefined();
    expect(obiettivoClasseIII?.text).toBe('Obiettivo - classe III');
    expect(obiettivoClasseIII?.normativeCheckpoint).toBe('end-primary-grade-3');

    expect(obiettivoFinePrimaria).toBeDefined();
    expect(obiettivoFinePrimaria?.text).toBe('Obiettivo - fine primaria');
    expect(obiettivoFinePrimaria?.normativeCheckpoint).toBe('end-primary');
  });

  it('contains required lower-secondary nodes for second community language', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA;
    expect(nodes).toHaveLength(2);

    const traguardo = nodes.find(n => n.nodeType === 'traguardo');
    const obiettivo = nodes.find(n => n.nodeType === 'obiettivo');

    expect(traguardo).toBeDefined();
    expect(traguardo?.text).toBe('Traguardo - fine secondaria I grado');
    expect(traguardo?.normativeCheckpoint).toBe('end-lower-secondary');

    expect(obiettivo).toBeDefined();
    expect(obiettivo?.text).toBe('Obiettivo - fine secondaria I grado');
    expect(obiettivo?.normativeCheckpoint).toBe('end-lower-secondary');
  });

  it('marks every language node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
      ...fixture2012.NODES_2012_SECONDARIA_INGLESE,
      ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
      ...fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2012.SOURCE_2012.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every language node', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
      ...fixture2012.NODES_2012_SECONDARIA_INGLESE,
      ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
      ...fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for English and second language segments', () => {
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE[0].title).toBe('Lingua inglese');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE[0].title).toBe('Lingua inglese');
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].title).toBe('Seconda lingua comunitaria');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0].title).toBe('Seconda lingua comunitaria');
  });
});
