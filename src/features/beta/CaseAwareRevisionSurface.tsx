import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveCurriculumUnitReference } from '../../domain/curriculum/didacticBinding';
import { reviewCaseMatchesCurrentUnit } from '../../domain/curriculum/reviewCase';
import { getSharedReviewCaseContext } from '../../domain/curriculum/sharedReviewCase';
import {
  resolveClassAwareOperationalReviewProposals,
  type TechnologySecondaryTargetClass,
} from '../../domain/curriculum/validation/technologySecondaryClassReview';
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

const technologyClassLabel = (targetClass: string): string => {
  if (targetClass === '1') return 'Classe I';
  if (targetClass === '2') return 'Classe II';
  if (targetClass === '3') return 'Classe III';
  return `Classe ${targetClass}`;
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
  const operationalProposals = useMemo(() => resolveClassAwareOperationalReviewProposals(
    props.discipline,
    props.order,
    props.targetClass,
    props.currentDisciplineProps,
  ), [props.currentDisciplineProps, props.discipline, props.order, props.targetClass]);
  const isTechnologySecondary = props.order === 'secondaria'
    && props.discipline.trim().toLocaleLowerCase('it-IT') === 'tecnologia';

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
        data-ux-consolidation="UX_CONSOLIDATION_R1_2"
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
            availableProposals={operationalProposals}
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
        data-ux-consolidation="UX_CONSOLIDATION_R1_2"
      >
        <VerticalReviewPanel
          discipline={props.discipline}
          onClose={() => setVerticalReviewOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-revision-surface-mode="GENERAL" data-ux-consolidation="UX_CONSOLIDATION_R1_2" data-general-return-anchor>
      {isTechnologySecondary && (
        <section
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          data-technology-secondary-class-selector
          data-current-curriculum-unit={currentUnit.unitKey}
        >
          <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Scegli la classe</span>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <strong className="block text-base text-slate-950">Tecnologia · Secondaria di primo grado</strong>
              <p className="mt-1 text-sm font-semibold text-indigo-800">Stai lavorando sulla {technologyClassLabel(props.targetClass)}.</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Ogni classe ha le proprie schede. Se cambi classe, il lavoro già fatto resta associato alla classe in cui lo hai svolto.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2" aria-label="Seleziona la classe di Tecnologia">
              {(['1', '2', '3'] as TechnologySecondaryTargetClass[]).map((targetClass) => {
                const selected = props.targetClass === targetClass;
                return (
                  <button
                    key={targetClass}
                    type="button"
                    onClick={() => props.setTargetClass(targetClass)}
                    aria-pressed={selected}
                    data-technology-target-class={targetClass}
                    className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-bold ${selected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700'}`}
                  >
                    {targetClass === '1' ? 'Classe I' : targetClass === '2' ? 'Classe II' : 'Classe III'}
                  </button>
                );
              })}
            </div>
          </div>

          {props.targetClass === '2' && (
            <p className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-950" data-class2-h2-pilot-context>
              La Classe II ha schede proprie, centrate sul percorso previsto per questa annualità. Le schede della Classe I non vengono riutilizzate.
            </p>
          )}
          {props.targetClass === '3' && operationalProposals.length === 0 && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" data-class3-h2-not-materialized>
              La Classe III è prevista nel curricolo, ma le sue schede di riesame non sono ancora disponibili in Arena. Per sicurezza non vengono usate quelle di un’altra classe.
            </p>
          )}
        </section>
      )}

      <main data-general-review-primary-work>
        {isTechnologySecondary && operationalProposals.length === 0 ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4" data-class-aware-review-blocked>
            <strong className="block text-sm text-amber-950">Le schede di questa classe non sono ancora pronte</strong>
            <p className="mt-1 text-xs leading-5 text-amber-900">Scegli una classe con schede disponibili. Arena non sostituisce automaticamente il lavoro con quello di un’altra annualità.</p>
          </section>
        ) : (
          <RevisionWorkspace
            key={currentUnit.unitKey}
            {...props}
            currentDisciplineProps={operationalProposals}
            initialNormativeSourceCode={props.initialNormativeSourceCode}
            onInitialNormativeSourceConsumed={props.onInitialNormativeSourceConsumed}
          />
        )}
      </main>

      <details className="rounded-2xl border border-slate-200 bg-slate-50" data-vertical-review-entry>
        <summary className="cursor-pointer px-4 py-4 text-sm font-bold text-slate-900">
          Dopo: controlla il raccordo tra le classi
        </summary>
        <div className="border-t border-slate-200 px-4 pb-4 pt-3">
          <p className="text-xs leading-5 text-slate-600">
            Questo passaggio serve dopo il lavoro del gruppo: controlla che tra una classe e la successiva non ci siano salti, ripetizioni o prerequisiti mancanti. Non è ancora una decisione dell’Istituto.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Nei documenti di processo questo passaggio è chiamato riesame verticale.
          </p>
          <button
            type="button"
            onClick={() => setVerticalReviewOpen(true)}
            data-human-secondary-action="open-vertical-review"
            className="mt-3 min-h-11 w-full rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-bold text-indigo-800 sm:w-auto"
          >
            Controlla il raccordo tra le classi
          </button>
        </div>
      </details>

      <aside data-general-review-assignment-support aria-label="Casi condivisi del gruppo">
        <SharedReviewCaseInbox
          order={props.order}
          targetClass={props.targetClass}
          discipline={props.discipline}
          academicYear={schoolYear}
          proposals={operationalProposals}
        />
      </aside>
    </div>
  );
}
