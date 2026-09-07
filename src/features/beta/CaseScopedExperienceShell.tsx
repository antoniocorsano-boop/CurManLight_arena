import { useEffect, useRef, type ReactNode } from 'react';
import { pauseCaseWorkSession } from '../../domain/curriculum/caseWorkSession';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { CurriculumReviewCase } from '../../types/curriculum';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';
import './CaseScopedExperienceShell.css';

type Props = {
  reviewCase: CurriculumReviewCase;
  children: ReactNode;
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

export function CaseScopedExperienceShell({ reviewCase, children }: Props) {
  const team = useTeamWorkspaceContext();
  const session = reviewCase.workSession;
  const workframeRef = useRef<HTMLDivElement | null>(null);
  const stageIndex = Math.max(0, STAGES.findIndex((item) => item.id === session?.stage));
  const currentStage = STAGES[stageIndex];
  const activeRole = team.selectedMembership?.role ?? null;
  const activeAccount = team.session?.user.email ?? team.session?.user.id ?? 'non disponibile';

  useEffect(() => {
    if (!workframeRef.current) return;
    workframeRef.current.scrollTop = 0;
  }, [session?.stage, reviewCase.id]);

  const pause = () => {
    if (!session) return;
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
      data-ux-current-stage={session.stage}
    >
      <section
        className="sticky top-0 z-30 rounded-2xl border border-indigo-200 bg-white/95 p-3 shadow-sm backdrop-blur"
        data-hcm-level="1"
        data-case-ux-stable-header
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">Riesame mirato</span>
            <h1 className="mt-1 text-lg font-extrabold text-slate-950">{currentStage.label}</h1>
            <p className="mt-1 text-xs text-slate-600">
              Passo {stageIndex + 1} di {STAGES.length} · {reviewCase.targetedProposalRefs.length} {reviewCase.targetedProposalRefs.length === 1 ? 'scheda' : 'schede'} nel caso
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-800">
            {roleLabel(activeRole)}
          </span>
        </div>
        <button
          type="button"
          onClick={pause}
          className="mt-3 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 sm:w-auto"
        >
          Esci dal caso
        </button>
      </section>

      <div ref={workframeRef} data-case-ux-workframe data-viewport-anchor="stable-current-task">
        {children}
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
          <div><dt className="font-bold text-slate-700">Stato interno</dt><dd>{session.stage} · {reviewCase.currentHumanPhase}</dd></div>
        </dl>
      </details>
    </div>
  );
}
