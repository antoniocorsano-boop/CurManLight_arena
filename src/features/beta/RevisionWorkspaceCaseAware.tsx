import { useMemo } from 'react';
import { resolveCurriculumUnitReference } from '../../domain/curriculum/didacticBinding';
import { reviewCaseMatchesCurrentUnit } from '../../domain/curriculum/reviewCase';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { CaseScopedCurriculumWorkSession } from './CaseScopedCurriculumWorkSession';
import { RevisionWorkspace as GeneralRevisionWorkspace } from './RevisionWorkspace';
import { SharedReviewCaseInbox } from './SharedReviewCaseInbox';

type Props = AppViewsLayerProps & {
  initialNormativeSourceCode?: string | null;
  onInitialNormativeSourceConsumed?: () => void;
};

export function RevisionWorkspace(props: Props) {
  const curriculumReviewCases = useCurriculumStore((state) => state.curriculumReviewCases ?? []);
  const schoolYear = useCurriculumStore((state) => state.schoolYear);
  const curriculumUnit = useMemo(() => resolveCurriculumUnitReference({
    order: props.order,
    targetClass: props.targetClass,
    disciplineOrField: props.discipline,
  }), [props.discipline, props.order, props.targetClass]);

  const activeCase = useMemo(() => curriculumReviewCases.find((reviewCase) => (
    reviewCaseMatchesCurrentUnit(reviewCase, curriculumUnit)
    && reviewCase.workSession?.sessionState === 'ACTIVE'
  )), [curriculumReviewCases, curriculumUnit]);

  if (activeCase) {
    return (
      <CaseScopedCurriculumWorkSession
        reviewCase={activeCase}
        availableProposals={props.currentDisciplineProps}
        discipline={props.discipline}
        order={props.order}
        academicYear={schoolYear}
      />
    );
  }

  return (
    <div className="space-y-3" data-case-aware-revision-workspace>
      <SharedReviewCaseInbox
        order={props.order}
        targetClass={props.targetClass}
        discipline={props.discipline}
        academicYear={schoolYear}
        proposals={props.currentDisciplineProps}
      />
      <GeneralRevisionWorkspace {...props} />
    </div>
  );
}
