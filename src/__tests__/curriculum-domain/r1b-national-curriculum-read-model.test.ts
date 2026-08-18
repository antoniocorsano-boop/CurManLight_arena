import { describe, it, expect } from 'vitest';
import { createR1BNationalCurriculumReadModel } from '../../domain/curriculum/r1bNationalCurriculumReadModel';
import { fixture2012 } from '../../domain/curriculum/fixture2012';

describe('CURR-R1B — National Curriculum Read Model', () => {
  const readModel = createR1BNationalCurriculumReadModel(fixture2012);

  it('lists 3 versions in deterministic order', () => {
    const versions = readModel.listVersions();
    expect(versions).toHaveLength(3);
    expect(versions[0].title).toBe('Indicazioni nazionali 2012 — Infanzia');
    expect(versions[1].title).toBe('Indicazioni nazionali 2012 — Primaria');
    expect(versions[2].title).toBe('Indicazioni nazionali 2012 — Secondaria');
  });

  it('lists 7 infanzia segments with disciplineCode=null', () => {
    const segments = readModel.listSegments({ schoolOrder: 'infanzia' });
    expect(segments).toHaveLength(7);
    for (const segment of segments) {
      expect(segment.disciplineCode).toBeNull();
    }
  });

  it('filters by disciplineCode=null explicitly', () => {
    const segments = readModel.listSegments({ disciplineCode: null });
    expect(segments).toHaveLength(15);
    for (const segment of segments) {
      expect(segment.disciplineCode).toBeNull();
    }
  });

  it('does not filter discipline when disciplineCode is omitted', () => {
    const segments = readModel.listSegments({});
    expect(segments).toHaveLength(33);
  });

  it('filters by sourceAreaKind=experience-field', () => {
    const segments = readModel.listSegments({ sourceAreaKind: 'experience-field' });
    expect(segments).toHaveLength(5);
  });

  it('filters nodes by normativeCheckpoint=end-lower-secondary', () => {
    const nodes = readModel.listNodes({ normativeCheckpoint: 'end-lower-secondary' });
    expect(nodes).toHaveLength(2);
  });

  it('getVersion aggregates segments and nodes by ID', () => {
    const result = readModel.getVersion(fixture2012.VERSION_2012_INFANZIA.id);
    expect(result).toBeDefined();
    expect(result!.segments).toHaveLength(7);
    expect(result!.nodes).toHaveLength(7);
  });

  it('getVersion returns undefined for unknown ID', () => {
    expect(readModel.getVersion('unknown')).toBeUndefined();
  });

  it('does not mutate fixture objects', () => {
    const segmentsBefore = fixture2012.SEGMENTS_2012_INFANZIA.map(s => s.title);
    readModel.listSegments({ schoolOrder: 'infanzia' });
    const segmentsAfter = fixture2012.SEGMENTS_2012_INFANZIA.map(s => s.title);
    expect(segmentsAfter).toEqual(segmentsBefore);
  });

  it('orders nodes by checkpoint rank then text', () => {
    const nodes = readModel.listNodes({ schoolOrder: 'primaria' });
    const texts = nodes.map(n => n.text);
    expect(texts).toEqual([
      'Obiettivo - classe III',
      'Obiettivo - fine primaria',
      'Traguardo - fine primaria',
    ]);
  });

  it('performs case-insensitive text search', () => {
    const nodes = readModel.listNodes({ text: 'TRAGUARDO' });
    expect(nodes.length).toBeGreaterThanOrEqual(1);
    for (const node of nodes) {
      expect(node.text.toLowerCase()).toContain('traguardo');
    }
  });
});
