import { describe, expect, it } from 'vitest';
import type { CurriculumMap } from '../features/session';
import { createCurriculumConsultationViewModel } from '../features/curriculum/components/curriculumConsultationViewModel';

const curriculum: CurriculumMap = {
  italiano: {
    infanzia: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    primaria: { traguardi: ['Legge testi'], obiettivi: ['Riconosce le informazioni'], evidenze: ['Racconta il contenuto'], proposals: [] },
    secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
  },
  matematica: {
    infanzia: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    primaria: { traguardi: ['Riconosce le forme'], obiettivi: [], evidenze: [], proposals: [] },
    secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
  },
};

describe('curriculum consultation view model', () => {
  it('uses one canonical projection for the active order and discipline', () => {
    const state = createCurriculumConsultationViewModel(curriculum, 'primaria', 'italiano');

    expect(state.items).toHaveLength(3);
    expect(state.listItems).toBe(state.items);
    expect(state.treeItems).toBe(state.items);
    expect(state.version.status).toBe('legacy');
    expect(state.schoolOrder).toBe('primaria');
    expect(state.disciplineCode).toBe('italiano');
    expect(state.items.every(item => item.schoolOrder === 'primaria' && item.disciplineCode === 'italiano')).toBe(true);
  });

  it('keeps the selected canonical node when moving between list and tree projections', () => {
    const first = createCurriculumConsultationViewModel(curriculum, 'primaria', 'italiano');
    const selectedNodeId = first.items[1].nodeId;
    const next = createCurriculumConsultationViewModel(curriculum, 'primaria', 'italiano', selectedNodeId);

    expect(next.selectedNode?.nodeId).toBe(selectedNodeId);
    expect(next.listItems.find(item => item.nodeId === selectedNodeId)?.node.text).toBe(next.treeItems.find(item => item.nodeId === selectedNodeId)?.node.text);
  });

  it('changes both projections together when the canonical context changes', () => {
    const state = createCurriculumConsultationViewModel(curriculum, 'primaria', 'matematica');

    expect(state.items).toHaveLength(1);
    expect(state.listItems.map(item => item.node.text)).toEqual(state.treeItems.map(item => item.node.text));
    expect(state.disciplineCode).toBe('matematica');
  });
});
