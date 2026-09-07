import { useMemo, useState } from 'react';
import { resolveCurriculumUnitReference } from '../../domain/curriculum/didacticBinding';
import { reviewCaseMatchesCurrentUnit } from '../../domain/curriculum/reviewCase';
import { getSharedReviewCaseContext } from '../../domain/curriculum/sharedReviewCase';
import { schoolYearToInstitutionalLabel } from '../../lib/academicYear';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { CaseScopedCurriculumWorkSession } from './CaseScopedCurriculumWorkSession';
import { CaseScopedExperienceShell } from './CaseScopedExperienceShell';
import { RevisionWorkspace } from './RevisionWorkspace';
import { SharedReviewCaseInbox } from './SharedReviewCaseInbox';

type Props = AppViewsLayerProps & {
  initialNormativeSourceCode?: string | null;
  onInitialNormativeSourceConsumed?: () => void;
};

const completionAcknowledgementKey = (reviewCaseId: string): string => `arena:review-case-completion-ack:${reviewCaseId}`;

const hasCompletionAcknowledgement = (reviewCaseId: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(completionAcknowledgementKey(reviewCaseId)) === '1';
  } catch {
    return false;
  }
};

const recordCompletionAcknowledgement = (reviewCaseId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(completionAcknowledgementKey(reviewCaseId), '1');
  } catch {
    // Il ritorno resta disponibile anche quando sessionStorage non è scrivibile.
  }
};

export function CaseAwareRevisionSurface(props: Props) {
  const curriculumReviewCases = useCurriculumStore((state) => state.curriculumReviewCases ?? []);
  const schoolYear = useCurriculumStore((state) => state.schoolYear);
  const [completionAcknowledgementRevision, setCompletionAcknowledgementRevision] = useState(0);
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

  const completedCaseAwaitingAcknowledgement = useMemo(() => curriculumReviewCases.find((reviewCase) => (
    reviewCase.workSession?.sessionState === 'COMPLETE'
    && reviewCase.caseState === 'PROFESSIONAL_REVIEW_COMPLETE'
    && reviewCase.currentHumanPhase === 'H2_PROFESSIONAL_VALIDATION'
    && reviewCaseMatchesCurrentUnit(reviewCase, currentUnit)
    && !hasCompletionAcknowledgement(reviewCase.id)
  )) ?? null, [curriculumReviewCases, currentUnit, completionAcknowledgementRevision]);

  const focusedCase = activeCase ?? completedCaseAwaitingAcknowledgement;

  if (focusedCase) {
    const sharedAcademicYear = getSharedReviewCaseContext(focusedCase)?.academicYear
      ?? schoolYearToInstitutionalLabel(schoolYear);
    return (
      <div
        data-revision-surface-mode="CASE_SCOPED"
        data-active-curriculum-review-case={focusedCase.id}
        data-ux-consolidation="UX_CONSOLIDATION_R1"
        data-case-completion-awaiting-acknowledgement={focusedCase.workSession?.sessionState === 'COMPLETE' ? 'true' : 'false'}
      >
        <CaseScopedExperienceShell
          reviewCase={focusedCase}
          onReturnToGeneralReview={() => {
            recordCompletionAcknowledgement(focusedCase.id);
            setCompletionAcknowledgementRevision((value) => value + 1);
          }}
        >
          <CaseScopedCurriculumWorkSession
            reviewCase={focusedCase}
            availableProposals={props.currentDisciplineProps}
            discipline={props.discipline}
            order={props.order}
            academicYear={sharedAcademicYear}
          />
        </CaseScopedExperienceShell>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-revision-surface-mode="GENERAL" data-ux-consolidation="UX_CONSOLIDATION_R1">
      <main data-general-review-primary-work>
        <RevisionWorkspace
          {...props}
          initialNormativeSourceCode={props.initialNormativeSourceCode}
          onInitialNormativeSourceConsumed={props.onInitialNormativeSourceConsumed}
        />
      </main>
      <aside data-general-review-assignment-support aria-label="Casi condivisi del gruppo">
        <SharedReviewCaseInbox
          order={props.order}
          targetClass={props.targetClass}
          discipline={props.discipline}
          academicYear={schoolYear}
          proposals={props.currentDisciplineProps}
        />
      </aside>
    </div>
  );
}
