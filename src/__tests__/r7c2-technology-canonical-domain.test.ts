import { describe, expect, it } from 'vitest';
import { CURRICULUM_PERSISTENCE_MODE } from '../domain/curriculum/persistence/compatibilityMode';
import {
  buildTechnologyCanonicalDomainSnapshot,
  validateTechnologyCanonicalDomainSnapshot,
} from '../domain/curriculum/technology/technologyCanonicalDomain';

const snapshot = () => buildTechnologyCanonicalDomainSnapshot({
  institutionId: 'istituto-pilota',
  curriculumVersionKey: 'technology:2026-2027:draft-v1',
  createdAt: '2026-09-03T15:00:00+02:00',
});

describe('R7C2 Technology CML-633C materialization', () => {
  it('materializes the working draft as real canonical-domain entities', () => {
    const value = snapshot();

    expect(value.curriculumVersion.status).toBe('draft');
    expect(value.curriculumVersion.dataOrigin).toBe('imported');
    expect(value.curriculumVersion.scope).toMatchObject({
      schoolOrder: 'secondaria',
      disciplines: ['tecnologia'],
      gradeRange: ['prima', 'seconda', 'terza'],
    });
    expect(value.source.status).toBe('draft');
    expect(value.source.sourceType).toBe('institute-curriculum');
    expect(value.segments).toHaveLength(9);
    expect(value.nodes).toHaveLength(36);
    expect(value.links).toHaveLength(9);
  });

  it('uses deterministic identities across repeated materialization', () => {
    const first = snapshot();
    const second = snapshot();

    expect(second.curriculumVersion.id).toBe(first.curriculumVersion.id);
    expect(second.source.id).toBe(first.source.id);
    expect(second.segments.map(segment => segment.id)).toEqual(first.segments.map(segment => segment.id));
    expect(second.nodes.map(node => node.id)).toEqual(first.nodes.map(node => node.id));
    expect(second.links.map(link => link.id)).toEqual(first.links.map(link => link.id));
  });

  it('keeps all institutional nodes proposed and teacher-proposed rather than institutionally adopted', () => {
    const value = snapshot();
    expect(value.nodes.every(node => node.status === 'proposed')).toBe(true);
    expect(value.nodes.every(node => node.provenance === 'teacher-proposed')).toBe(true);
    expect(value.segments.every(segment => segment.status === 'unverified')).toBe(true);
  });

  it('passes CML-633C entity and referential integrity validation', () => {
    const validation = validateTechnologyCanonicalDomainSnapshot(snapshot());
    expect(validation).toEqual({ valid: true, errors: [] });
  });

  it('binds every node to the working-draft source and its real segment', () => {
    const value = snapshot();
    const segmentIds = new Set(value.segments.map(segment => segment.id));
    const sourceId = value.source.id;

    expect(value.nodes.every(node => segmentIds.has(node.segmentRef.id))).toBe(true);
    expect(value.nodes.every(node => node.sourceRefs.some(ref => ref.id === sourceId))).toBe(true);
    expect(value.curriculumVersion.mainSourceRefs.some(ref => ref.id === sourceId)).toBe(true);
  });

  it('does not activate CML-633C as the production persistence source in R7C2', () => {
    expect(CURRICULUM_PERSISTENCE_MODE).toBe('legacy-only');
  });
});
