import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CurriculumMap } from '../features/session';
import { createCurriculumConsultationViewModel } from '../features/curriculum/components/curriculumConsultationViewModel';
import { CurriculumGraphView, createCurriculumGraphProjection } from '../features/curriculum/components/CurriculumGraphView';

const curriculum: CurriculumMap = {
  tecnologia: {
    infanzia: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    secondaria: {
      traguardi: ['Comprende il rapporto tra tecnologia e ambiente'],
      obiettivi: ['Progetta una soluzione tecnica'],
      evidenze: ['Presenta il procedimento seguito'],
      proposals: [],
    },
  },
};

function consultationItems() {
  return createCurriculumConsultationViewModel(curriculum, 'secondaria', 'tecnologia').items;
}

function withRelation() {
  const items = consultationItems();
  return items.map((item, index) => index === 1
    ? {
      ...item,
      relations: [{
        id: item.node.id,
        metadata: item.node.metadata,
        fromNodeRef: { id: item.node.id, entityType: 'curriculum-node' as const, snapshotLabel: item.node.text },
        toNodeRef: { id: items[2].node.id, entityType: 'curriculum-node' as const, snapshotLabel: items[2].node.text },
        linkType: 'progression' as const,
        sourceRefs: [],
        origin: 'legacy' as const,
        status: 'active' as const,
        isVertical: true,
        fromOrder: 'secondaria' as const,
        toOrder: 'secondaria' as const,
      }],
    }
    : item);
}

describe('CURR-03 canonical curriculum graph', () => {
  it('projects exactly the real links within the active filter', () => {
    const items = withRelation();
    const projection = createCurriculumGraphProjection(items, items[1].nodeId);

    expect(projection.nodes.map(node => node.id)).toContain(items[1].nodeId);
    expect(projection.edges).toHaveLength(1);
    expect(projection.edges[0]).toMatchObject({
      source: items[1].nodeId,
      target: items[2].nodeId,
      type: 'progression',
      status: 'active',
    });
  });

  it('does not synthesize an edge when links are absent or leave the active filter', () => {
    const items = consultationItems();
    const noLinks = createCurriculumGraphProjection(items, items[0].nodeId);
    const outsideFilter = createCurriculumGraphProjection(withRelation(), items[1].nodeId, items.slice(0, 2));

    expect(noLinks.edges).toEqual([]);
    expect(outsideFilter.edges).toEqual([]);
  });

  it('renders an explicit empty relation state for a filtered node without links', () => {
    const items = consultationItems();

    render(
      <CurriculumGraphView
        items={[items[0]]}
        selectedNodeId={items[0].nodeId}
        version={items[0].version}
        schoolOrder={items[0].schoolOrder}
        disciplineCode={items[0].disciplineCode}
        onSelectNode={vi.fn()}
        onOpenNodeDetail={vi.fn()}
      />,
    );

    expect(screen.getByTestId('curriculum-graph-view')).toBeInTheDocument();
    expect(screen.getByText('Nessuna relazione curricolare registrata')).toBeInTheDocument();
    expect(screen.queryByTestId('curriculum-graph-edge')).not.toBeInTheDocument();
  });
});
