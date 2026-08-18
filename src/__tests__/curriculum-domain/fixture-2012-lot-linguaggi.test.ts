import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R1E-4 — Linguaggi espressivi e corporei lotto verification', () => {
  it('includes musica, arte e immagine, and educazione fisica for primaria and secondaria', () => {
    const musicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_MUSICA[0];
    const musicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_MUSICA[0];
    const artePrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_ARTE[0];
    const arteSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_ARTE[0];
    const educazioneFisicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0];
    const educazioneFisicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0];

    expect(musicaPrimaria).toBeDefined();
    expect(musicaPrimaria.disciplineCode).toBe('musica');
    expect(musicaSecondaria).toBeDefined();
    expect(musicaSecondaria.disciplineCode).toBe('musica');

    expect(artePrimaria).toBeDefined();
    expect(artePrimaria.disciplineCode).toBe('arte');
    expect(arteSecondaria).toBeDefined();
    expect(arteSecondaria.disciplineCode).toBe('arte');

    expect(educazioneFisicaPrimaria).toBeDefined();
    expect(educazioneFisicaPrimaria.disciplineCode).toBe('educazione-fisica');
    expect(educazioneFisicaSecondaria).toBeDefined();
    expect(educazioneFisicaSecondaria.disciplineCode).toBe('educazione-fisica');
  });

  it('assigns correct source-native area metadata for musica segments', () => {
    const primaria = fixture2012.SEGMENTS_2012_PRIMARIA_MUSICA[0];
    const secondaria = fixture2012.SEGMENTS_2012_SECONDARIA_MUSICA[0];

    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.sourceArea?.code).toBe('in2012-musica');
    expect(primaria.sourceArea?.label).toBe('Musica');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.sourceArea?.code).toBe('in2012-musica');
    expect(secondaria.sourceArea?.label).toBe('Musica');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for arte e immagine segments', () => {
    const primaria = fixture2012.SEGMENTS_2012_PRIMARIA_ARTE[0];
    const secondaria = fixture2012.SEGMENTS_2012_SECONDARIA_ARTE[0];

    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.sourceArea?.code).toBe('in2012-arte-immagine');
    expect(primaria.sourceArea?.label).toBe('Arte e immagine');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.sourceArea?.code).toBe('in2012-arte-immagine');
    expect(secondaria.sourceArea?.label).toBe('Arte e immagine');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for educazione fisica segments', () => {
    const primaria = fixture2012.SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0];
    const secondaria = fixture2012.SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0];

    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.sourceArea?.code).toBe('in2012-educazione-fisica');
    expect(primaria.sourceArea?.label).toBe('Educazione fisica');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.sourceArea?.code).toBe('in2012-educazione-fisica');
    expect(secondaria.sourceArea?.label).toBe('Educazione fisica');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('passes canonical validation for every expressive/corporeal segment', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_PRIMARIA_MUSICA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_MUSICA,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_ARTE,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_ARTE,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for musica', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_MUSICA;
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

  it('contains required lower-secondary nodes for musica', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_MUSICA;
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

  it('contains required primary nodes for arte e immagine', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_ARTE;
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

  it('contains required lower-secondary nodes for arte e immagine', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_ARTE;
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

  it('contains required primary nodes for educazione fisica', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA;
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

  it('contains required lower-secondary nodes for educazione fisica', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA;
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

  it('marks every expressive/corporeal node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
      ...fixture2012.NODES_2012_SECONDARIA_MUSICA,
      ...fixture2012.NODES_2012_PRIMARIA_ARTE,
      ...fixture2012.NODES_2012_SECONDARIA_ARTE,
      ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2012.SOURCE_2012.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every expressive/corporeal node', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
      ...fixture2012.NODES_2012_SECONDARIA_MUSICA,
      ...fixture2012.NODES_2012_PRIMARIA_ARTE,
      ...fixture2012.NODES_2012_SECONDARIA_ARTE,
      ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for expressive/corporeal segments', () => {
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_MUSICA[0].title).toBe('Musica');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_MUSICA[0].title).toBe('Musica');
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_ARTE[0].title).toBe('Arte e immagine');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_ARTE[0].title).toBe('Arte e immagine');
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].title).toBe('Educazione fisica');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0].title).toBe('Educazione fisica');
  });

  it('does not invent invented disciplines or infanzia-style experience fields for expressive/corporeal areas', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_PRIMARIA_MUSICA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_MUSICA,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_ARTE,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_ARTE,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const segment of segments) {
      expect(segment.schoolOrder).toMatch(/^(primaria|secondaria)$/);
      expect(segment.sourceArea?.kind).toBe('discipline');
      expect(['musica', 'arte', 'educazione-fisica']).toContain(segment.disciplineCode);
    }
  });
});
