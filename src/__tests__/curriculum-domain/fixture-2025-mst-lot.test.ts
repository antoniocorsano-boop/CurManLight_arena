import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R2E-4 — 2025 Matematica + Scienze + Tecnologia lotto verification', () => {
  it('includes Matematica for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('matematica');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('matematica');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('includes Scienze for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('scienze');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('scienze');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('includes Tecnologia for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('tecnologia');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('tecnologia');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('does not introduce STEM as a discipline segment', () => {
    const allSegments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA,
    ];

    const stemSegments = allSegments.filter(s => s.sourceArea?.code === 'stem');
    expect(stemSegments).toHaveLength(0);
  });

  it('assigns correct source-native area metadata for MST segments', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA[0].sourceArea?.code).toBe('in2025-matematica');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA[0].sourceArea?.code).toBe('in2025-matematica');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE[0].sourceArea?.code).toBe('in2025-scienze');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE[0].sourceArea?.code).toBe('in2025-scienze');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].sourceArea?.code).toBe('in2025-tecnologia');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0].sourceArea?.code).toBe('in2025-tecnologia');
  });

  it('passes canonical validation for every MST segment', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for Matematica', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_MATEMATICA;
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

  it('contains required lower-secondary nodes for Matematica', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_MATEMATICA;
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

  it('contains required primary nodes for Scienze', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_SCIENZE;
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

  it('contains required lower-secondary nodes for Scienze', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_SCIENZE;
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

  it('contains required primary nodes for Tecnologia', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_TECNOLOGIA;
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

  it('contains required lower-secondary nodes for Tecnologia', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_TECNOLOGIA;
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

  it('marks every MST node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_MATEMATICA,
      ...fixture2025.NODES_2025_SECONDARIA_MATEMATICA,
      ...fixture2025.NODES_2025_PRIMARIA_SCIENZE,
      ...fixture2025.NODES_2025_SECONDARIA_SCIENZE,
      ...fixture2025.NODES_2025_PRIMARIA_TECNOLOGIA,
      ...fixture2025.NODES_2025_SECONDARIA_TECNOLOGIA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every MST node', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_MATEMATICA,
      ...fixture2025.NODES_2025_SECONDARIA_MATEMATICA,
      ...fixture2025.NODES_2025_PRIMARIA_SCIENZE,
      ...fixture2025.NODES_2025_SECONDARIA_SCIENZE,
      ...fixture2025.NODES_2025_PRIMARIA_TECNOLOGIA,
      ...fixture2025.NODES_2025_SECONDARIA_TECNOLOGIA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for MST segments', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_MATEMATICA[0].title).toBe('Matematica');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_MATEMATICA[0].title).toBe('Matematica');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_SCIENZE[0].title).toBe('Scienze');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_SCIENZE[0].title).toBe('Scienze');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].title).toBe('Tecnologia');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0].title).toBe('Tecnologia');
  });
});
