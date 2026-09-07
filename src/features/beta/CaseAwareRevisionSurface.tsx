import { useMemo } from 'react';
import { resolveCurriculumUnitReference } from '../../domain/curriculum/didacticBinding';
import { reviewCaseMatchesCurrentUnit } from '../../domain/curriculum/reviewCase';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { CaseScopedCurriculumWorkSession } from './CaseScopedCurriculumWorkSession';
import { RevisionWorkspace } from './RevisionWorkspace';
import { SharedReviewCaseInbox } from './SharedReviewCaseInbox';

type Props = AppViewsLayerProps & {
  initialNormativeSourceCode?: string | null;
  onInitialNormativeSourceConsumed?: () => void;
};

export function CaseAwareRevisionSurface(props: Props) {
  const curriculumReviewCases = useCurriculumStore((state) => state.curriculumReviewCases ?? []);
  const schoolYear = useCurriculumStore((state) => state.schoolYear);
  const currentUnit = useMemo(() => resolveCurriculumUnitReference({
    order: props.order,
    targetClass: props.targetClass,
    disciplineOrField: props.discipline,
  }), [props.discipline, props.order, props.targetClass]);

  const activeCase = useMemo(() => curriculumReviewCases.find((reviewCase) => (
    reviewCase.workSession?.sessionState === 'ACTIVE'
    && reviewCase.caseState === 'PROFESSIONAL_VALIDATION_IN_PROGRESS'
    && reviewCase.currentHumanPhase === 'H2_PROFESSIONAL_VALIDATION'
    && reviewCaseMatchesCurrentUnit(reviewCase, currentUnit)
  )) ?? null, [curriculumReviewCases, currentUnit]);

  if (activeCase) {
    return (
      <div
        data-revision-surface-mode="CASE_SCOPED"
        data-active-curriculum-review-case={activeCase.id}
      >
        <CaseScopedCurriculumWorkSession
          reviewCase={activeCase}
          availableProposals={props.currentDisciplineProps}
          discipline={props.discipline}
          order={props.order}
          academicYear={schoolYear}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-revision-surface-mode="GENERAL">
      <SharedReviewCaseInbox
        order={props.order}
        targetClass={props.targetClass}
        discipline={props.discipline}
        academicYear={schoolYear}
        proposals={props.currentDisciplineProps}
      />
      <RevisionWorkspace
        {...props}
        initialNormativeSourceCode={props.initialNormativeSourceCode}
        onInitialNormativeSourceConsumed={props.onInitialNormativeSourceConsumed}
      />
    </div>
  );
}
