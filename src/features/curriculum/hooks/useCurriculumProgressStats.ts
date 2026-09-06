import type { Proposal, SchoolOrder } from '../../../types/curriculum';
import { resolveOperationalReviewProposals } from '../../../domain/curriculum/validation/technologyClass1Review';
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
      const schoolOrder = ord as SchoolOrder;
      const fallback = (localCurriculum[disc][schoolOrder].proposals || []) as Proposal[];
      const props = resolveOperationalReviewProposals(disc, schoolOrder, fallback);
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

  const fallbackCurrent = (localCurriculum[discipline]?.[order]?.proposals || []) as Proposal[];
  const currentDisciplineProps = resolveOperationalReviewProposals(discipline, order, fallbackCurrent);
  let currentDisciplineDecided = 0;
  currentDisciplineProps.forEach(p => {
    if (decisions[p.id]) currentDisciplineDecided++;
  });

  // Navigation badge contract: only the user's current personal review context.
  // Team discussion items have their own counters inside the team workspace and
  // must not be mixed with the teacher's individual review backlog.
  const pendingCount = Math.max(0, currentDisciplineProps.length - currentDisciplineDecided);

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
