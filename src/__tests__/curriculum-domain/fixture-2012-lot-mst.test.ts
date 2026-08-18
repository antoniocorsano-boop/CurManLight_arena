import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R1E-3 — Area matematico-scientifico-tecnologica lotto verification', () => {
  it('includes matematica, scienze, and tecnologia for primaria and secondaria', () => {
    const matematicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_MATEMATICA[0];
    const matematicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_MATEMATICA[0];
    const scienzePrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_SCIENZE[0];
    const scienzeSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_SCIENZE[0];
    const tecnologiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0];
    const tecnologiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0];

    expect(matematicaPrimaria).toBeDefined();
    expect(matematicaPrimaria.disciplineCode).toBe('matematica');
    expect(matematicaSecondaria).toBeDefined();
    expect(matematicaSecondaria.disciplineCode).toBe('matematica');

    expect(scienzePrimaria).toBeDefined();
    expect(scienzePrimaria.disciplineCode).toBe('scienze');
    expect(scienzeSecondaria).toBeDefined();
    expect(scienzeSecondaria.disciplineCode).toBe('scienze');

    expect(tecnologiaPrimaria).toBeDefined();
    expect(tecnologiaPrimaria.disciplineCode).toBe('tecnologia');
    expect(tecnologiaSecondaria).toBeDefined();
    expect(tecnologiaSecondaria.disciplineCode).toBe('tecnologia');
  });

  it('assigns correct source-native area metadata for matematica segments', () => {
    const primaria = fixture2012.SEGMENTS_2012_PRIMARIA_MATEMATICA[0];
    const secondaria = fixture2012.SEGMENTS_2012_SECONDARIA_MATEMATICA[0];

    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.sourceArea?.code).toBe('in2012-matematica');
    expect(primaria.sourceArea?.label).toBe('Matematica');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.sourceArea?.code).toBe('in2012-matematica');
    expect(secondaria.sourceArea?.label).toBe('Matematica');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for scienze segments', () => {
    const primaria = fixture2012.SEGMENTS_2012_PRIMARIA_SCIENZE[0];
    const secondaria = fixture2012.SEGMENTS_2012_SECONDARIA_SCIENZE[0];

    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.sourceArea?.code).toBe('in2012-scienze');
    expect(primaria.sourceArea?.label).toBe('Scienze');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.sourceArea?.code).toBe('in2012-scienze');
    expect(secondaria.sourceArea?.label).toBe('Scienze');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for tecnologia segments', () => {
    const primaria = fixture2012.SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0];
    const secondaria = fixture2012.SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0];

    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.sourceArea?.code).toBe('in2012-tecnologia');
    expect(primaria.sourceArea?.label).toBe('Tecnologia');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.sourceArea?.code).toBe('in2012-tecnologia');
    expect(secondaria.sourceArea?.label).toBe('Tecnologia');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('passes canonical validation for every MST segment', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_PRIMARIA_MATEMATICA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_MATEMATICA,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_SCIENZE,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_SCIENZE,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_TECNOLOGIA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_TECNOLOGIA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for matematica', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_MATEMATICA;
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

  it('contains required lower-secondary nodes for matematica', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_MATEMATICA;
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

  it('contains required primary nodes for scienze', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_SCIENZE;
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

  it('contains required lower-secondary nodes for scienze', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_SCIENZE;
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

  it('contains required primary nodes for tecnologia', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA;
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

  it('contains required lower-secondary nodes for tecnologia', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA;
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

  it('marks every MST node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
      ...fixture2012.NODES_2012_SECONDARIA_MATEMATICA,
      ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
      ...fixture2012.NODES_2012_SECONDARIA_SCIENZE,
      ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
      ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2012.SOURCE_2012.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every MST node', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
      ...fixture2012.NODES_2012_SECONDARIA_MATEMATICA,
      ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
      ...fixture2012.NODES_2012_SECONDARIA_SCIENZE,
      ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
      ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for MST segments', () => {
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_MATEMATICA[0].title).toBe('Matematica');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_MATEMATICA[0].title).toBe('Matematica');
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_SCIENZE[0].title).toBe('Scienze');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_SCIENZE[0].title).toBe('Scienze');
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].title).toBe('Tecnologia');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0].title).toBe('Tecnologia');
  });

  it('does not invent synthetic curriculumKB-style nuclei for tecnologia', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
      ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
    ];

    const syntheticNucleiTexts = nodes
      .map(n => n.text)
      .filter(text => /nucleo|nuclei|tema|modulo|progetto/i.test(text));

    expect(syntheticNucleiTexts).toHaveLength(0);
  });
});
