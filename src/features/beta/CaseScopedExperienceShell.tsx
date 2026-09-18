import { useEffect, useRef, type ReactNode } from 'react';
import { pauseCaseWorkSession } from '../../domain/curriculum/caseWorkSession';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { CurriculumReviewCase } from '../../types/curriculum';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';
import './CaseScopedExperienceShell.css';

type Props = {
  reviewCase: CurriculumReviewCase;
  children: ReactNode;
  onReturnToGeneralReview?: () => void;
};

const STAGES = [
  { id: 'EXAMINE', label: 'Esamina' },
  { id: 'SHARE', label: 'Condividi' },
  { id: 'COMPARE', label: 'Confronta' },
  { id: 'RECORD_TEAM_OUTCOME', label: 'Registra l’esito' },
] as const;

const roleLabel = (role: string | null): string => {
  if (role === 'docente') return 'Docente';
  if (role === 'dipartimento') return 'Dipartimento';
  if (role === 'referente') return 'Referente';
  if (role === 'collegio') return 'Collegio';
  if (role === 'dirigente') return 'Dirigente';
  if (role === 'amministratore') return 'Amministratore';
  return 'Identità in verifica';
};

const updateStoredCase = (reviewCaseId: string, updater: (reviewCase: CurriculumReviewCase) => CurriculumReviewCase) => {
  useCurriculumStore.setState((state) => ({
    curriculumReviewCases: (state.curriculumReviewCases ?? []).map((reviewCase) => (
      reviewCase.id === reviewCaseId ? updater(reviewCase) : reviewCase
    )),
  }));
};

export function CaseScopedExperienceShell({ reviewCase, children, onReturnToGeneralReview }: Props) {
  const team = useTeamWorkspaceContext();
  const session = reviewCase.workSession;
  const workframeRef = useRef<HTMLDivElement | null>(null);
  const completed = session?.sessionState === 'COMPLETE';
  const stageIndex = completed
    ? STAGES.length - 1
    : Math.max(0, STAGES.findIndex((item) => item.id === session?.stage));
  const currentStage = STAGES[stageIndex];
  const activeRole = team.selectedMembership?.role ?? null;
  const activeAccount = team.session?.user.email ?? team.session?.user.id ?? 'non disponibile';

  useEffect(() => {
    if (!workframeRef.current) return;
    workframeRef.current.scrollTop = 0;
  }, [session?.stage, reviewCase.id, completed]);

  const pause = () => {
    if (!session || completed) return;
    updateStoredCase(reviewCase.id, (stored) => ({
      ...stored,
      workSession: pauseCaseWorkSession(session),
    }));
  };

  if (!session) return <>{children}</>;

  return (
    <div
      className="space-y-3"
      data-case-ux-consolidated-shell
      data-ux-layering="L1-L2-L3"
      data-ux-current-stage={completed ? 'COMPLETE' : session.stage}
    >
      <section
        className="sticky top-0 z-30 rounded-2xl border border-indigo-200 bg-white/95 p-3 shadow-sm backdrop-blur"
        data-hcm-level="1"
        data-case-ux-stable-header
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">Riesame mirato</span>
            <h1 className="mt-1 text-lg font-extrabold text-slate-950">
              {completed ? 'Riesame professionale concluso' : currentStage.label}
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              {completed
                ? `Percorso completato · ${reviewCase.targetedProposalRefs.length} ${reviewCase.targetedProposalRefs.length === 1 ? 'scheda' : 'schede'} nel caso`
                : `Passo ${stageIndex + 1} di ${STAGES.length} · ${reviewCase.targetedProposalRefs.length} ${reviewCase.targetedProposalRefs.length === 1 ? 'scheda' : 'schede'} nel caso`}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-800">
            {roleLabel(activeRole)}
          </span>
        </div>

        <ol
          className="mt-3 grid grid-cols-4 gap-1.5"
          aria-label="Percorso del riesame professionale"
          data-case-ux-process-rail
        >
          {STAGES.map((step, index) => {
            const state = completed ? 'complete' : index < stageIndex ? 'complete' : index === stageIndex ? 'active' : 'future';
            return (
              <li
                key={step.id}
                data-case-ux-process-step={step.id}
                data-case-ux-process-step-state={state}
                aria-current={state === 'active' ? 'step' : undefined}
                className={`rounded-lg border px-1.5 py-2 text-center text-[9px] font-bold leading-tight ${
                  state === 'complete'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : state === 'active'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="block text-[9px] font-black">{state === 'complete' ? '✓' : index + 1}</span>
                {step.label}
              </li>
            );
          })}
        </ol>

        {!completed && (
          <button
            type="button"
            onClick={pause}
            className="mt-3 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 sm:w-auto"
          >
            Esci dal caso
          </button>
        )}
      </section>

      <div ref={workframeRef} data-case-ux-workframe data-viewport-anchor="stable-current-task">
        {completed ? (
          <section
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
            data-case-professional-completion-acknowledgement
            data-hcm-level="1"
          >
            <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Conclusione registrata</span>
            <h2 className="mt-1 text-base font-extrabold text-emerald-950">Il lavoro professionale su questo caso è concluso</h2>
            <p className="mt-2 text-xs leading-5 text-emerald-900">
              Gli esiti professionali del caso sono stati registrati. Questa conclusione non modifica il master, non apre automaticamente il riesame verticale e non equivale a una decisione istituzionale.
            </p>
            <button
              type="button"
              onClick={onReturnToGeneralReview}
              disabled={!onReturnToGeneralReview}
              data-human-next-action="return-to-general-review-after-completion"
              className="mt-4 min-h-11 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-40 sm:w-auto"
            >
              Torna a Riesame
            </button>
          </section>
        ) : children}
      </div>

      <details className="rounded-xl border border-slate-200 bg-white" data-hcm-level="2" data-case-ux-communication-layer>
        <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-700">Perché questo riesame?</summary>
        <div className="border-t border-slate-100 p-3 text-xs leading-5 text-slate-600">
          <p>{reviewCase.scopeReason}</p>
          <p className="mt-2">Il lavoro resta limitato alle schede del caso. Il tuo contributo personale non modifica il curricolo e non equivale all’esito del gruppo.</p>
        </div>
      </details>

      <details className="rounded-xl border border-slate-200 bg-slate-50" data-hcm-level="3" data-case-ux-technical-layer>
        <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-600">Verifica e tracciabilità</summary>
        <dl className="grid gap-2 border-t border-slate-200 p-3 text-[11px] leading-5 text-slate-600">
          <div><dt className="font-bold text-slate-700">Caso</dt><dd className="break-all">{reviewCase.id}</dd></div>
          <div><dt className="font-bold text-slate-700">Master</dt><dd>{reviewCase.currentMaster.version}</dd></div>
          <div><dt className="font-bold text-slate-700">Account autenticato</dt><dd className="break-all">{activeAccount}</dd></div>
          <div><dt className="font-bold text-slate-700">Stato interno</dt><dd>{session.sessionState} · {session.stage} · {reviewCase.currentHumanPhase}</dd></div>
        </dl>
      </details>
    </div>
  );
}
