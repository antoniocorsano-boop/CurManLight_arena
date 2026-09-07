import { useEffect, useMemo, useRef, useState } from 'react';
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
import { VerticalReviewPanel } from './VerticalReviewPanel';

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
  const [verticalReviewOpen, setVerticalReviewOpen] = useState(false);
  const returnToGeneralRequested = useRef(false);
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

  useEffect(() => {
    if (focusedCase) setVerticalReviewOpen(false);
  }, [focusedCase]);

  useEffect(() => {
    if (focusedCase || !returnToGeneralRequested.current || typeof window === 'undefined') return;
    returnToGeneralRequested.current = false;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedCase, completionAcknowledgementRevision]);

  if (focusedCase) {
    const sharedAcademicYear = getSharedReviewCaseContext(focusedCase)?.academicYear
      ?? schoolYearToInstitutionalLabel(schoolYear);
    return (
      <div
        data-revision-surface-mode="CASE_SCOPED"
        data-active-curriculum-review-case={focusedCase.id}
        data-ux-consolidation="UX_CONSOLIDATION_R1_1"
        data-case-completion-awaiting-acknowledgement={focusedCase.workSession?.sessionState === 'COMPLETE' ? 'true' : 'false'}
      >
        <CaseScopedExperienceShell
          reviewCase={focusedCase}
          onReturnToGeneralReview={() => {
            returnToGeneralRequested.current = true;
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

  if (verticalReviewOpen) {
    return (
      <div
        data-revision-surface-mode="VERTICAL_REVIEW"
        data-human-phase="H3_VERTICAL_REVIEW"
        data-ux-consolidation="UX_CONSOLIDATION_R1_1"
      >
        <VerticalReviewPanel
          discipline={props.discipline}
          onClose={() => setVerticalReviewOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-revision-surface-mode="GENERAL" data-ux-consolidation="UX_CONSOLIDATION_R1_1" data-general-return-anchor>
      <main data-general-review-primary-work>
        <RevisionWorkspace
          {...props}
          initialNormativeSourceCode={props.initialNormativeSourceCode}
          onInitialNormativeSourceConsumed={props.onInitialNormativeSourceConsumed}
        />
      </main>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4" data-vertical-review-entry>
        <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Fase distinta</span>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="block text-sm text-slate-950">Riesame verticale</strong>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              Quando esistono esiti professionali H2 già registrati, verifica il raccordo tra unità precedenti e successive. H3 si apre solo con un gesto esplicito e resta separato dall’iter istituzionale.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVerticalReviewOpen(true)}
            data-human-secondary-action="open-vertical-review"
            className="min-h-11 shrink-0 rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-bold text-indigo-800"
          >
            Apri il riesame verticale
          </button>
        </div>
      </section>

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
