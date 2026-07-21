import type { Proposal, SchoolOrder } from '../../../types/curriculum';
import type { CurriculumMap } from '../../session';

interface UseCurriculumProgressStatsArgs {
  localCurriculum: CurriculumMap;
  decisions: Record<string, string>;
  discipline: string;
  order: SchoolOrder;
}

export const useCurriculumProgressStats = ({
  localCurriculum,
  decisions,
  discipline,
  order
}: UseCurriculumProgressStatsArgs) => {
  let totalDecisions = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let customCount = 0;

  Object.keys(localCurriculum).forEach(disc => {
    Object.keys(localCurriculum[disc]).forEach(ord => {
      const props = (localCurriculum[disc][ord as SchoolOrder].proposals || []) as Proposal[];
      totalDecisions += props.length;
      props.forEach(p => {
        const s = decisions[p.id];
        if (s === 'approved') approvedCount++;
        if (s === 'custom') customCount++;
        if (s === 'rejected') rejectedCount++;
      });
    });
  });

  const progressPercent = totalDecisions > 0 ? Math.round(((approvedCount + rejectedCount + customCount) / totalDecisions) * 100) : 0;
  const pendingCount = totalDecisions - (approvedCount + rejectedCount + customCount);

  const currentDisciplineProps = (localCurriculum[discipline]?.[order]?.proposals || []) as Proposal[];
  let currentDisciplineDecided = 0;
  currentDisciplineProps.forEach(p => {
    if (decisions[p.id]) currentDisciplineDecided++;
  });

  return {
    totalDecisions,
    approvedCount,
    rejectedCount,
    customCount,
    progressPercent,
    pendingCount,
    currentDisciplineProps,
    currentDisciplineDecided
  };
};
