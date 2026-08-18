import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumVersion,
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R1A — 2012 Normative Fixture', () => {
  it('exposes one source, one source version, and three curriculum versions', () => {
    expect(fixture2012.SOURCE_2012).toBeDefined();
    expect(fixture2012.SOURCE_VERSION_2012).toBeDefined();
    expect(fixture2012.VERSION_2012_INFANZIA).toBeDefined();
    expect(fixture2012.VERSION_2012_PRIMARIA).toBeDefined();
    expect(fixture2012.VERSION_2012_SECONDARIA).toBeDefined();
  });

  it('freezes documented entity counts', () => {
    expect(fixture2012.SEGMENTS_2012_INFANZIA).toHaveLength(7);
    expect(fixture2012.NODES_2012_INFANZIA.length).toBeGreaterThanOrEqual(5);
    expect(fixture2012.SEGMENTS_2012_PRIMARIA).toHaveLength(13);
    expect(fixture2012.NODES_2012_PRIMARIA.length).toBeGreaterThanOrEqual(3);
    expect(fixture2012.SEGMENTS_2012_SECONDARIA).toHaveLength(13);
    expect(fixture2012.NODES_2012_SECONDARIA.length).toBeGreaterThanOrEqual(2);
  });

  it('attributes every segment and node to SOURCE_2012 via sourceRefs', () => {
    const sourceId = fixture2012.SOURCE_2012.id;
    const allSegments = [
      ...fixture2012.SEGMENTS_2012_INFANZIA,
      ...fixture2012.SEGMENTS_2012_PRIMARIA,
      ...fixture2012.SEGMENTS_2012_SECONDARIA,
    ];
    const allNodes = [
      ...fixture2012.NODES_2012_INFANZIA,
      ...fixture2012.NODES_2012_PRIMARIA,
      ...fixture2012.NODES_2012_SECONDARIA,
    ];
    for (const segment of allSegments) {
      expect(segment.sourceRefs.some((ref) => ref.id === sourceId)).toBe(true);
    }
    for (const node of allNodes) {
      expect(node.sourceRefs.some((ref) => ref.id === sourceId)).toBe(true);
    }
  });

  it('marks every entity with normative-source origin', () => {
    expect(fixture2012.SOURCE_2012.metadata.origin).toBe('normative-source');
    expect(fixture2012.SOURCE_VERSION_2012.metadata.origin).toBe('normative-source');
    expect(fixture2012.VERSION_2012_INFANZIA.metadata.origin).toBe('normative-source');
    expect(fixture2012.VERSION_2012_INFANZIA.dataOrigin).toBe('normative-source');
    for (const segment of fixture2012.SEGMENTS_2012_INFANZIA) {
      expect(segment.metadata.origin).toBe('normative-source');
      expect(segment.dataOrigin).toBe('normative-source');
    }
    for (const node of fixture2012.NODES_2012_INFANZIA) {
      expect(node.metadata.origin).toBe('normative-source');
    }
  });

  it('does not derive any node from legacy provenance', () => {
    const allNodes = [
      ...fixture2012.NODES_2012_INFANZIA,
      ...fixture2012.NODES_2012_PRIMARIA,
      ...fixture2012.NODES_2012_SECONDARIA,
    ];
    for (const node of allNodes) {
      expect(node.provenance).not.toBe('legacy');
    }
  });

  it('uses controlled normative checkpoints only', () => {
    const validCheckpoints = new Set([
      'end-infanzia',
      'end-primary-grade-3',
      'end-primary',
      'end-lower-secondary',
    ]);
    const allNodes = [
      ...fixture2012.NODES_2012_INFANZIA,
      ...fixture2012.NODES_2012_PRIMARIA,
      ...fixture2012.NODES_2012_SECONDARIA,
    ];
    for (const node of allNodes) {
      if (node.normativeCheckpoint !== undefined) {
        expect(validCheckpoints.has(node.normativeCheckpoint)).toBe(true);
      }
    }
  });

  it('represents infanzia experience fields without inventing disciplines', () => {
    const experienceFields = fixture2012.SEGMENTS_2012_INFANZIA.filter(s => s.sourceArea?.kind === 'experience-field');
    expect(experienceFields).toHaveLength(5);
    for (const segment of experienceFields) {
      expect(segment.disciplineCode).toBeNull();
      expect(segment.sourceArea?.kind).toBe('experience-field');
    }
  });

  it('passes canonical validation without error severity issues', () => {
    expect(validateCurriculumVersion(fixture2012.VERSION_2012_INFANZIA).valid).toBe(true);
    expect(validateCurriculumVersion(fixture2012.VERSION_2012_PRIMARIA).valid).toBe(true);
    expect(validateCurriculumVersion(fixture2012.VERSION_2012_SECONDARIA).valid).toBe(true);
    for (const segment of fixture2012.SEGMENTS_2012_INFANZIA) {
      expect(validateCurriculumSegment(segment).valid).toBe(true);
    }
    for (const segment of fixture2012.SEGMENTS_2012_PRIMARIA) {
      expect(validateCurriculumSegment(segment).valid).toBe(true);
    }
    for (const segment of fixture2012.SEGMENTS_2012_SECONDARIA) {
      expect(validateCurriculumSegment(segment).valid).toBe(true);
    }
    const allNodes = [
      ...fixture2012.NODES_2012_INFANZIA,
      ...fixture2012.NODES_2012_PRIMARIA,
      ...fixture2012.NODES_2012_SECONDARIA,
    ];
    for (const node of allNodes) {
      expect(validateCurriculumNode(node).valid).toBe(true);
    }
  });
});
