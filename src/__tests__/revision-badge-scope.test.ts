import { describe, expect, it } from 'vitest';
import { useCurriculumProgressStats } from '../features/curriculum/hooks/useCurriculumProgressStats';

const proposal = (id: string) => ({
  id,
  focus: id,
  oldText: `prima-${id}`,
  newText: `dopo-${id}`,
});

describe('Arena revision navigation badge', () => {
  const localCurriculum = {
    italiano: {
      secondaria: { proposals: [proposal('it-1'), proposal('it-2')] },
    },
    matematica: {
      secondaria: { proposals: Array.from({ length: 20 }, (_, index) => proposal(`mat-${index + 1}`)) },
    },
  } as any;

  it('counts only pending personal review items in the current discipline/order context', () => {
    const stats = useCurriculumProgressStats({
      localCurriculum,
      decisions: { 'it-1': 'approved', 'it-2': 'rejected' },
      discipline: 'italiano',
      order: 'secondaria',
    });

    expect(stats.totalDecisions).toBe(22);
    expect(stats.currentDisciplineProps).toHaveLength(2);
    expect(stats.currentDisciplineDecided).toBe(2);
    expect(stats.pendingCount).toBe(0);
  });

  it('decrements only when a sheet in the current personal context is examined', () => {
    const stats = useCurriculumProgressStats({
      localCurriculum,
      decisions: { 'it-1': 'approved' },
      discipline: 'italiano',
      order: 'secondaria',
    });

    expect(stats.pendingCount).toBe(1);
  });
});
