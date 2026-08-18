import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import { validateCurriculumSegment, validateCurriculumNode } from '../../domain/curriculum/validation';

describe('CURR-R2D — 2025 representative pilot fixture', () => {
  it('exposes SOURCE_2025 and SOURCE_VERSION_2025', () => {
    expect(fixture2025.SOURCE_2025.id).toBeDefined();
    expect(fixture2025.SOURCE_2025.status).toBe('active');
    expect(fixture2025.SOURCE_VERSION_2025.id).toBeDefined();
    expect(fixture2025.SOURCE_VERSION_2025.status).toBe('active');
  });

  it('includes Italiano for primaria and secondaria', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO[0];
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_ITALIANO[0];

    expect(primaria).toBeDefined();
    expect(primaria.disciplineCode).toBe('italiano');
    expect(primaria.schoolOrder).toBe('primaria');
    expect(primaria.sourceArea?.kind).toBe('discipline');
    expect(primaria.status).toBe('complete');
    expect(primaria.completeness).toBe('complete');

    expect(secondaria).toBeDefined();
    expect(secondaria.disciplineCode).toBe('italiano');
    expect(secondaria.schoolOrder).toBe('secondaria');
    expect(secondaria.sourceArea?.kind).toBe('discipline');
    expect(secondaria.status).toBe('complete');
    expect(secondaria.completeness).toBe('complete');
  });

  it('represents expected-attesa competence without normativeNodeKind', () => {
    const node = fixture2025.NODES_2025_PRIMARIA_ITALIANO.find(n => n.nodeType === 'competenza');
    expect(node).toBeDefined();
    expect(node?.normativeCheckpoint).toBe('end-primary');
    expect(node?.normativeNodeKind).toBeUndefined();
  });

  it('represents OSA 2025 with osa-2025 discriminator', () => {
    const node = fixture2025.NODES_2025_PRIMARIA_ITALIANO.find(n => n.normativeNodeKind === 'osa-2025');
    expect(node).toBeDefined();
    expect(node?.nodeType).toBe('obiettivo');
    expect(node?.normativeCheckpoint).toBe('end-primary-grade-3');
  });

  it('represents conoscenza as native node type', () => {
    const node = fixture2025.NODES_2025_PRIMARIA_ITALIANO.find(n => n.nodeType === 'conoscenza');
    expect(node).toBeDefined();
    expect(node?.normativeCheckpoint).toBe('end-primary');
    expect(node?.normativeNodeKind).toBeUndefined();
  });

  it('assigns correct 2025 checkpoints', () => {
    const grade3 = fixture2025.NODES_2025_PRIMARIA_ITALIANO.find(n => n.normativeCheckpoint === 'end-primary-grade-3');
    const endPrimary = fixture2025.NODES_2025_PRIMARIA_ITALIANO.find(n => n.normativeCheckpoint === 'end-primary');
    const endLowerSecondary = fixture2025.NODES_2025_SECONDARIA_ITALIANO.find(n => n.normativeCheckpoint === 'end-lower-secondary');

    expect(grade3).toBeDefined();
    expect(endPrimary).toBeDefined();
    expect(endLowerSecondary).toBeDefined();
  });

  it('preserves normative provenance and sourceRefs', () => {
    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_ITALIANO,
      ...fixture2025.NODES_2025_SECONDARIA_ITALIANO,
    ];

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for Italiano segments and nodes', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_ITALIANO,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }

    const nodes = [
      ...fixture2025.NODES_2025_PRIMARIA_ITALIANO,
      ...fixture2025.NODES_2025_SECONDARIA_ITALIANO,
    ];

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }
  });

  it('preserves conditional applicability for Strumento musicale', () => {
    const segment = fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0];
    expect(segment).toBeDefined();
    expect(segment.frameworkApplicability).toBeDefined();
    expect(segment.frameworkApplicability?.framework).toBe('IN2025');
    expect(segment.frameworkApplicability?.resolutionStatus).toBe('resolved');
    expect(segment.frameworkApplicability?.resolutionReason).toContain('indirizzo musicale');
    expect(segment.frameworkApplicability?.cohortEntryYear).toBe(2026);
  });

  it('validates Strumento musicale segment', () => {
    const result = validateCurriculumSegment(fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0]);
    expect(result.valid).toBe(true);
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('does not mutate 2025 fixture when validating', () => {
    const beforeSegments = fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO.map(s => s.title);
    const beforeNodes = fixture2025.NODES_2025_PRIMARIA_ITALIANO.map(n => n.text);

    validateCurriculumSegment(fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO[0]);
    validateCurriculumNode(fixture2025.NODES_2025_PRIMARIA_ITALIANO[0]);

    expect(fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO.map(s => s.title)).toEqual(beforeSegments);
    expect(fixture2025.NODES_2025_PRIMARIA_ITALIANO.map(n => n.text)).toEqual(beforeNodes);
  });

  it('uses deterministic ordering for pilot areas', () => {
    expect(fixture2025.SEGMENTS_2025_PRIMARIA_ITALIANO[0].title).toBe('Italiano');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_ITALIANO[0].title).toBe('Italiano');
    expect(fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0].title).toBe('Strumento musicale');
  });
});
