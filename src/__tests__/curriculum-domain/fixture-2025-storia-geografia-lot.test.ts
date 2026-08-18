import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R2E-3 — 2025 Storia + Geografia lotto verification', () => {
  it('includes Storia for primaria and secondaria', () => {
    const storiaPrimaria = fixture2025.SEGMENTS_2025_PRIMARIA_STORIA[0];
    const storiaSecondaria = fixture2025.SEGMENTS_2025_SECONDARIA_STORIA[0];

    expect(storiaPrimaria).toBeDefined();
    expect(storiaPrimaria.disciplineCode).toBe('storia');
    expect(storiaPrimaria.schoolOrder).toBe('primaria');
    expect(storiaPrimaria.sourceArea?.kind).toBe('discipline');
    expect(storiaPrimaria.status).toBe('complete');
    expect(storiaPrimaria.completeness).toBe('complete');

    expect(storiaSecondaria).toBeDefined();
    expect(storiaSecondaria.disciplineCode).toBe('storia');
    expect(storiaSecondaria.schoolOrder).toBe('secondaria');
    expect(storiaSecondaria.sourceArea?.kind).toBe('discipline');
    expect(storiaSecondaria.status).toBe('complete');
    expect(storiaSecondaria.completeness).toBe('complete');
  });

  it('includes Geografia for primaria and secondaria', () => {
    const geografiaPrimaria = fixture2025.SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0];
    const geografiaSecondaria = fixture2025.SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0];

    expect(geografiaPrimaria).toBeDefined();
    expect(geografiaPrimaria.disciplineCode).toBe('geografia');
    expect(geografiaPrimaria.schoolOrder).toBe('primaria');
    expect(geografiaPrimaria.sourceArea?.kind).toBe('discipline');
    expect(geografiaPrimaria.status).toBe('complete');
    expect(geografiaPrimaria.completeness).toBe('complete');

    expect(geografiaSecondaria).toBeDefined();
    expect(geografiaSecondaria.disciplineCode).toBe('geografia');
    expect(geografiaSecondaria.schoolOrder).toBe('secondaria');
    expect(geografiaSecondaria.sourceArea?.kind).toBe('discipline');
    expect(geografiaSecondaria.status).toBe('complete');
    expect(geografiaSecondaria.completeness).toBe('complete');
  });

  it('assigns correct source-native area metadata for Storia segments', () => {
    const storiaPrimaria = fixture2025.SEGMENTS_2025_PRIMARIA_STORIA[0];
    const storiaSecondaria = fixture2025.SEGMENTS_2025_SECONDARIA_STORIA[0];

    expect(storiaPrimaria.sourceArea?.code).toBe('in2025-storia');
    expect(storiaPrimaria.sourceArea?.label).toBe('Storia');
    expect(storiaSecondaria.sourceArea?.code).toBe('in2025-storia');
    expect(storiaSecondaria.sourceArea?.label).toBe('Storia');
  });

  it('assigns correct source-native area metadata for Geografia segments', () => {
    const geografiaPrimaria = fixture2025.SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0];
    const geografiaSecondaria = fixture2025.SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0];

    expect(geografiaPrimaria.sourceArea?.code).toBe('in2025-geografia');
    expect(geografiaPrimaria.sourceArea?.label).toBe('Geografia');
    expect(geografiaSecondaria.sourceArea?.code).toBe('in2025-geografia');
    expect(geografiaSecondaria.sourceArea?.label).toBe('Geografia');
  });

  it('passes canonical validation for every storico-geografica segment', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_STORIA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_STORIA,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_GEOGRAFIA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_GEOGRAFIA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for Storia', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_STORIA;
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

  it('contains required lower-secondary nodes for Storia', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_STORIA;
    expect(nodes).toHaveLength(2);

    const competenza = nodes.find(n => n.nodeType === 'competenza');
    const obiettivo = nodes.find(n => n.nodeType === 'obiettivo');

    expect(competenza).toBeDefined();
    expect(competenza?.text).toBe('Competenza - fine secondaria I grado');
    expect(competenza?.normativeCheckpoint).toBe('end-lower-secondary');

    expect(obiettivo).toBeDefined();
    expect(obiettivo?.text).toBe('Obiettivo - fine secondaria I grado');
    expect(obiettivo?.normativeCheckpoint).toBe('end-lower-secondary');
  });

  it('contains required primary nodes for Geografia', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_GEOGRAFIA;
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

  it('contains required lower-secondary nodes for Geografia', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_GEOGRAFIA;
    expect(nodes).toHaveLength(2);

    const competenza = nodes.find(n => n.nodeType === 'competenza');
    const obiettivo = nodes.find(n => n.nodeType === 'obiettivo');

    expect(competenza).toBeDefined();
    expect(competenza?.text).toBe('Competenza - fine secondaria I grado');
    expect(competenza?.normativeCheckpoint).toBe('end-lower-secondary');

    expect(obiettivo).toBeDefined();
    expect(obiettivo?.text).toBe('Obiettivo - fine secondaria I grado');
    expect(obiettivo?.normativeCheckpoint).toBe('end-lower-secondary');
  });

  it('marks every storico-geografica node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_STORIA,
      ...fixture2025.NODES_2025_SECONDARIA_STORIA,
      ...fixture2025.NODES_2025_PRIMARIA_GEOGRAFIA,
      ...fixture2025.NODES_2025_SECONDARIA_GEOGRAFIA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every storico-geografica node', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_STORIA,
      ...fixture2025.NODES_2025_SECONDARIA_STORIA,
      ...fixture2025.NODES_2025_PRIMARIA_GEOGRAFIA,
      ...fixture2025.NODES_2025_SECONDARIA_GEOGRAFIA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for Storia and Geografia segments', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_STORIA[0].title).toBe('Storia');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_STORIA[0].title).toBe('Storia');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].title).toBe('Geografia');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0].title).toBe('Geografia');
  });

  it('does not invent synthetic narrative-link nodes between primary and lower-secondary Storia', () => {
    const storiaNodes = [
      ...fixture2025.NODES_2025_PRIMARIA_STORIA,
      ...fixture2025.NODES_2025_SECONDARIA_STORIA,
    ];

    const syntheticLinkTexts = storiaNodes
      .map(n => n.text)
      .filter(text => /\bda\b.*\ba\b|\bverso\b|\bpassaggio\b|\btransizione\b/i.test(text));

    expect(syntheticLinkTexts).toHaveLength(0);
  });
});
