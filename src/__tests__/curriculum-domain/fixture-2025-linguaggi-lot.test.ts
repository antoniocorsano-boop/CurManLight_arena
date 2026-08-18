import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R2E-5 — 2025 Musica + Arte e immagine + Educazione fisica lotto verification', () => {
  it('includes Musica for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_MUSICA[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('musica');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('musica');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('includes Arte e immagine for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_ARTE[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_ARTE[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('arte');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('arte');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('includes Educazione fisica for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('educazione-fisica');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('educazione-fisica');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('preserves Musica as distinct from Strumento musicale', () => {
    const musica = fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA[0];
    const strumento = fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0];

    expect(musica.title).toBe('Musica');
    expect(strumento.title).toBe('Strumento musicale');
    expect(musica.disciplineCode).toBe('musica');
    expect(strumento.disciplineCode).toBe('musica');
    expect(musica.id).not.toBe(strumento.id);
  });

  it('assigns correct source-native area metadata for expressive language segments', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA[0].sourceArea?.code).toBe('in2025-musica');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_MUSICA[0].sourceArea?.code).toBe('in2025-musica');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_ARTE[0].sourceArea?.code).toBe('in2025-arte');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_ARTE[0].sourceArea?.code).toBe('in2025-arte');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].sourceArea?.code).toBe('in2025-educazione-fisica');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0].sourceArea?.code).toBe('in2025-educazione-fisica');
  });

  it('passes canonical validation for every expressive language segment', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_MUSICA,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_ARTE,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_ARTE,
      ...fixture2025.SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('contains required primary nodes for Musica', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_MUSICA;
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

  it('contains required lower-secondary nodes for Musica', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_MUSICA;
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

  it('contains required primary nodes for Arte e immagine', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_ARTE;
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

  it('contains required lower-secondary nodes for Arte e immagine', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_ARTE;
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

  it('contains required primary nodes for Educazione fisica', () => {
    const nodes = fixture2025.NODES_2025_PRIMARIA_EDUCAZIONE_FISICA;
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

  it('contains required lower-secondary nodes for Educazione fisica', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_EDUCAZIONE_FISICA;
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

  it('marks every expressive language node as normative provenance with sourceRefs', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_MUSICA,
      ...fixture2025.NODES_2025_SECONDARIA_MUSICA,
      ...fixture2025.NODES_2025_PRIMARIA_ARTE,
      ...fixture2025.NODES_2025_SECONDARIA_ARTE,
      ...fixture2025.NODES_2025_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2025.NODES_2025_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for every expressive language node', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_MUSICA,
      ...fixture2025.NODES_2025_SECONDARIA_MUSICA,
      ...fixture2025.NODES_2025_PRIMARIA_ARTE,
      ...fixture2025.NODES_2025_SECONDARIA_ARTE,
      ...fixture2025.NODES_2025_PRIMARIA_EDUCAZIONE_FISICA,
      ...fixture2025.NODES_2025_SECONDARIA_EDUCAZIONE_FISICA,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('preserves deterministic ordering for expressive language segments', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA[0].title).toBe('Musica');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_MUSICA[0].title).toBe('Musica');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_ARTE[0].title).toBe('Arte e immagine');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_ARTE[0].title).toBe('Arte e immagine');
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].title).toBe('Educazione fisica');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0].title).toBe('Educazione fisica');
  });
});
