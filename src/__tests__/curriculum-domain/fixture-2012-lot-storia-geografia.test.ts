import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R1E-2 — Area storico-geografica lotto verification', () => {
  it('includes storia and geografia for primaria and secondaria', () => {
    const storiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_STORIA[0];
    const storiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_STORIA[0];
    const geografiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0];
    const geografiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0];

    expect(storiaPrimaria).toBeDefined();
    expect(storiaPrimaria.disciplineCode).toBe('storia');
    expect(storiaSecondaria).toBeDefined();
    expect(storiaSecondaria.disciplineCode).toBe('storia');
    expect(geografiaPrimaria).toBeDefined();
    expect(geografiaPrimaria.disciplineCode).toBe('geografia');
    expect(geografiaSecondaria).toBeDefined();
    expect(geografiaSecondaria.disciplineCode).toBe('geografia');
  });

  it('assigns correct source-native area metadata for storia segments', () => {
    const storiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_STORIA[0];
    const storiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_STORIA[0];

    expect(storiaPrimaria.sourceArea?.kind).toBe('discipline');
    expect(storiaPrimaria.sourceArea?.code).toBe('in2012-storia');
    expect(storiaPrimaria.sourceArea?.label).toBe('Storia');
    expect(storiaPrimaria.schoolOrder).toBe('primaria');
    expect(storiaPrimaria.status).toBe('complete');
    expect(storiaPrimaria.completeness).toBe('complete');

    expect(storiaSecondaria.sourceArea?.kind).toBe('discipline');
    expect(storiaSecondaria.sourceArea?.code).toBe('in2012-storia');
    expect(storiaSecondaria.sourceArea?.label).toBe('Storia');
    expect(storiaSecondaria.schoolOrder).toBe('secondaria');
    expect(storiaSecondaria.status).toBe('complete');
    expect(storiaSecondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for geografia segments', () => {
    const geografiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0];
    const geografiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0];

    expect(geografiaPrimaria.sourceArea?.kind).toBe('discipline');
    expect(geografiaPrimaria.sourceArea?.code).toBe('in2012-geografia');
    expect(geografiaPrimaria.sourceArea?.label).toBe('Geografia');
    expect(geografiaPrimaria.schoolOrder).toBe('primaria');
    expect(geografiaPrimaria.status).toBe('complete');
    expect(geografiaPrimaria.completeness).toBe('complete');

    expect(geografiaSecondaria.sourceArea?.kind).toBe('discipline');
    expect(geografiaSecondaria.sourceArea?.code).toBe('in2012-geografia');
    expect(geografiaSecondaria.sourceArea?.label).toBe('Geografia');
    expect(geografiaSecondaria.schoolOrder).toBe('secondaria');
    expect(geografiaSecondaria.status).toBe('complete');
    expect(geografiaSecondaria.completeness).toBe('complete');
  });

  it('passes canonical validation for every storico-geografica segment', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_PRIMARIA_STORIA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_STORIA,
      ...fixture2012.SEGMENTS_2012_PRIMARIA_GEOGRAFIA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA_GEOGRAFIA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for storia', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_STORIA;
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

  it('contains required lower-secondary nodes for storia', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_STORIA;
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

  it('contains required primary nodes for geografia', () => {
    const nodes = fixture2012.NODES_2012_PRIMARIA_GEOGRAFIA;
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

  it('contains required lower-secondary nodes for geografia', () => {
    const nodes = fixture2012.NODES_2012_SECONDARIA_GEOGRAFIA;
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

  it('marks every storico-geografica node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_STORIA,
      ...fixture2012.NODES_2012_SECONDARIA_STORIA,
      ...fixture2012.NODES_2012_PRIMARIA_GEOGRAFIA,
      ...fixture2012.NODES_2012_SECONDARIA_GEOGRAFIA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2012.SOURCE_2012.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every storico-geografica node', () => {
    const nodes = [
      ...fixture2012.NODES_2012_PRIMARIA_STORIA,
      ...fixture2012.NODES_2012_SECONDARIA_STORIA,
      ...fixture2012.NODES_2012_PRIMARIA_GEOGRAFIA,
      ...fixture2012.NODES_2012_SECONDARIA_GEOGRAFIA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for storia and geografia segments', () => {
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_STORIA[0].title).toBe('Storia');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_STORIA[0].title).toBe('Storia');
    expect(fixture2012.SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].title).toBe('Geografia');
    expect(fixture2012.SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0].title).toBe('Geografia');
  });

  it('does not invent synthetic narrative-link nodes between primary and lower-secondary storia', () => {
    const storiaNodes = [
      ...fixture2012.NODES_2012_PRIMARIA_STORIA,
      ...fixture2012.NODES_2012_SECONDARIA_STORIA,
    ];

    const syntheticLinkTexts = storiaNodes
      .map(n => n.text)
      .filter(text => /\bda\b.*\ba\b|\bverso\b|\bpassaggio\b|\btransizione\b/i.test(text));

    expect(syntheticLinkTexts).toHaveLength(0);
  });
});
