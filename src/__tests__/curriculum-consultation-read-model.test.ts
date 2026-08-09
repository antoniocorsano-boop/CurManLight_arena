import { describe, expect, it } from 'vitest';
import { adaptCurriculumKB } from '../domain/curriculum/adapters';
import { createCurriculumLink, createNodeReference } from '../domain/curriculum/constructors';
import { createCurriculumConsultationReadModel } from '../domain/curriculum';

function makeDomain() {
  const domain = adaptCurriculumKB({
    italiano: {
      primaria: {
        traguardi: ['Comprende testi'],
        obiettivi: ['Legge con autonomia'],
        evidenze: ['Racconta il contenuto'],
      },
    },
  } as never, '2026-08-09T00:00:00.000Z');

  const [fromNode, toNode] = domain.nodes;
  domain.links.push(createCurriculumLink(
    createNodeReference(fromNode.id, fromNode.text),
    createNodeReference(toNode.id, toNode.text),
    'progression',
    { origin: 'institute', isVertical: true, fromOrder: 'primaria', toOrder: 'primaria' },
  ));

  return domain;
}

describe('canonical curriculum consultation read model', () => {
  it('projects one node with version, segment, provenance and real relations', () => {
    const model = createCurriculumConsultationReadModel(makeDomain());

    const result = model.query({ order: 'primaria', discipline: 'italiano' });

    expect(result).toHaveLength(3);
    const traguardo = result.find(item => item.node.nodeType === 'traguardo');
    expect(traguardo).toBeDefined();
    expect(traguardo).toMatchObject({
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      node: { nodeType: 'traguardo', provenance: 'legacy' },
      version: { scope: { schoolOrder: 'primaria' } },
      segment: { schoolOrder: 'primaria', disciplineCode: 'italiano' },
    });
    expect(traguardo?.curriculumVersionRef.id).toBe(traguardo?.version.id);
    expect(traguardo?.nodeId).toBe(traguardo?.node.id);
    expect(traguardo?.relations).toHaveLength(1);
    expect(traguardo?.relations[0].linkType).toBe('progression');
    expect(traguardo?.relations[0].origin).toBe('institute');
  });

  it('returns deterministic results and explicit absence when no real relations exist', () => {
    const domain = adaptCurriculumKB({
      italiano: {
        primaria: { traguardi: ['A'], obiettivi: [], evidenze: [] },
      },
    } as never, '2026-08-09T00:00:00.000Z');
    const model = createCurriculumConsultationReadModel(domain);

    const first = model.query({ order: 'primaria', discipline: 'italiano' });
    const second = model.query({ order: 'primaria', discipline: 'italiano' });

    expect(first).toEqual(second);
    expect(first[0].relations).toEqual([]);
  });

  it('finds a canonical node without changing the query projection', () => {
    const model = createCurriculumConsultationReadModel(makeDomain());
    const all = model.query({ order: 'primaria', discipline: 'italiano' });
    const node = model.getNode(all[1].nodeId);

    expect(node?.nodeId).toBe(all[1].nodeId);
    expect(node?.curriculumVersionRef.id).toBe(all[1].curriculumVersionRef.id);
    expect(node?.provenance).toBe(all[1].provenance);
  });
});
