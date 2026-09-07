import { useEffect, useMemo, useState } from 'react';
import {
  casePreparedCount,
  completeCaseWorkSession,
  getCaseScopedProposals,
  isCasePersonalReviewComplete,
  recordCaseDecision,
  resetCaseDecision,
  transitionCaseWorkSessionStage,
} from '../../domain/curriculum/caseWorkSession';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { CurriculumReviewCase, DecisionStatus, Proposal, SchoolOrder } from '../../types/curriculum';
import { CaseScopedTeamContributionPublisher, type CaseScopedContributionPersistenceState } from './CaseScopedTeamContributionPublisher';
import { CaseScopedTeamCoordinationWorkspace, type CaseScopedTeamCoordinationState } from './CaseScopedTeamCoordinationWorkspace';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

type Props = {
  reviewCase: CurriculumReviewCase;
  availableProposals: Proposal[];
  discipline: string;
  order: SchoolOrder;
  academicYear: string;
};

const emptyShare = (count: number): CaseScopedContributionPersistenceState => ({ requiredCount: count, persistedCurrentCount: 0, complete: false });
const emptyTeam = (): CaseScopedTeamCoordinationState => ({ total: 0, resolvedCount: 0, remainingOutcomeCount: 0, allCurrentOutcomesRecorded: false, canRecordTeamOutcome: false });

const updateStoredCase = (reviewCaseId: string, updater: (reviewCase: CurriculumReviewCase) => CurriculumReviewCase) => {
  useCurriculumStore.setState((state) => ({
    curriculumReviewCases: (state.curriculumReviewCases ?? []).map((reviewCase) => reviewCase.id === reviewCaseId ? updater(reviewCase) : reviewCase),
  }));
};

export function CaseScopedCurriculumWorkSession({ reviewCase, availableProposals, discipline, order, academicYear }: Props) {
  const team = useTeamWorkspaceContext();
  const session = reviewCase.workSession;
  const proposals = useMemo(() => getCaseScopedProposals(reviewCase, availableProposals), [reviewCase, availableProposals]);
  const [index, setIndex] = useState(0);
  const [customDraft, setCustomDraft] = useState('');
  const [share, setShare] = useState<CaseScopedContributionPersistenceState>(() => emptyShare(proposals.length));
  const [coordination, setCoordination] = useState<CaseScopedTeamCoordinationState>(() => emptyTeam());
  const [outcomeProposalRef, setOutcomeProposalRef] = useState<string | null>(null);

  useEffect(() => {
    setShare(emptyShare(proposals.length));
    setCoordination(emptyTeam());
    setOutcomeProposalRef(null);
  }, [reviewCase.id, proposals.length]);

  if (!session) return null;
  if (session.reviewCaseId !== reviewCase.id) {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">La sessione persistita non appartiene al caso corrente. Il lavoro è bloccato per evitare contaminazioni tra riesami.</section>;
  }
  if (proposals.length !== reviewCase.targetedProposalRefs.length) {
    return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Una o più schede congelate nel caso non sono disponibili nella versione corrente. La sessione resta bloccata.</section>;
  }

  const preparedCount = casePreparedCount(session);
  const personalComplete = isCasePersonalReviewComplete(session);
  const safeIndex = Math.max(0, Math.min(index, proposals.length - 1));
  const current = proposals[safeIndex];
  const currentDecision = current ? session.decisions[current.id] : undefined;
  const currentCustomText = current ? session.customTexts[current.id] ?? '' : '';
  const activeRole = team.selectedMembership?.role ?? null;
  const isCoordinator = activeRole === 'dipartimento' || activeRole === 'referente';

  const replaceSession = (nextSession: NonNullable<CurriculumReviewCase['workSession']>, casePatch?: Partial<CurriculumReviewCase>) => {
    updateStoredCase(reviewCase.id, (stored) => ({ ...stored, ...casePatch, workSession: nextSession }));
  };

  const record = (decision: DecisionStatus, customText?: string) => {
    if (!current) return;
    try {
      const next = recordCaseDecision({ session, proposalRef: current.id, decision, customText });
      replaceSession(next, { caseState: 'PROFESSIONAL_VALIDATION_IN_PROGRESS', currentHumanPhase: 'H2_PROFESSIONAL_VALIDATION', professionalValidationState: 'IN_PROGRESS' });
      setCustomDraft('');
      const nextPending = proposals.findIndex((proposal, proposalIndex) => proposalIndex > safeIndex && !next.decisions[proposal.id]);
      if (nextPending >= 0) setIndex(nextPending);
    } catch {
      // La scheda corrente resta visibile; le transizioni non vengono anticipate.
    }
  };

  const reset = () => {
    if (!current) return;
    replaceSession(resetCaseDecision(session, current.id));
    setCustomDraft('');
  };

  const setStage = (nextStage: NonNullable<CurriculumReviewCase['workSession']>['stage']) => {
    try {
      const next = transitionCaseWorkSessionStage({
        session,
        nextStage,
        persistedShareComplete: share.complete,
        teamOutcomeComplete: coordination.allCurrentOutcomesRecorded,
      });
      replaceSession(next);
    } catch {
      // Fail closed: nessuna fase avanza senza i prerequisiti correnti.
    }
  };

  useEffect(() => {
    if ((session.stage === 'COMPARE' || session.stage === 'RECORD_TEAM_OUTCOME') && !share.complete) {
      try {
        const next = transitionCaseWorkSessionStage({ session, nextStage: 'SHARE' });
        replaceSession(next);
      } catch {
        // Se il lavoro personale non è più completo, il dominio impedisce avanzamenti incoerenti.
      }
    }
  }, [session.stage, share.complete]);

  const closeProfessionalSession = () => {
    if (!coordination.allCurrentOutcomesRecorded) return;
    const next = completeCaseWorkSession(session);
    replaceSession(next, {
      caseState: 'PROFESSIONAL_REVIEW_COMPLETE',
      currentHumanPhase: 'H2_PROFESSIONAL_VALIDATION',
      professionalValidationState: 'TEAM_OUTCOMES_RECORDED',
    });
  };

  return (
    <div className="space-y-3" data-case-scoped-curriculum-work-session data-review-case-id={reviewCase.id} data-work-session-stage={session.stage} data-case-content-hierarchy="CURRENT_TASK_ONLY">
      {session.stage === 'EXAMINE' && current && (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" data-case-review-examine data-hcm-level="1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500">Scheda {safeIndex + 1} di {proposals.length}</span>
            <span className="text-xs font-bold text-indigo-700">{preparedCount}/{proposals.length} esaminate</span>
          </div>
          <div>
            {current.scopeLabel && <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{current.scopeLabel}</p>}
            <h2 className="mt-1 text-base font-extrabold text-slate-900">{current.focus}</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <article className="rounded-xl bg-slate-50 p-3"><strong className="text-[11px] text-slate-500">{current.oldLabel || 'Testo precedente'}</strong><p className="mt-2 text-sm leading-6 text-slate-700">{current.oldText}</p></article>
            <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3"><strong className="text-[11px] text-indigo-700">{current.newLabel || 'Proposta da esaminare'}</strong><p className="mt-2 text-sm leading-6 text-slate-800">{current.newText}</p></article>
          </div>
          {currentDecision ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <strong>Orientamento registrato</strong>
              <span className="mt-1 block">{currentDecision === 'approved' ? 'Conferma della proposta' : currentDecision === 'rejected' ? 'Mantenimento del testo precedente' : `Modifica proposta: ${currentCustomText}`}</span>
              <button type="button" onClick={reset} className="mt-2 min-h-9 rounded-lg border border-emerald-300 bg-white px-3 text-xs font-bold">Rivedi questa scelta</button>
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => record('approved')} className="min-h-11 rounded-xl bg-indigo-700 px-3 py-3 text-sm font-bold text-white">Conferma proposta</button>
                <button type="button" onClick={() => setCustomDraft(currentCustomText || ' ')} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-700">Proponi modifica</button>
                <button type="button" onClick={() => record('rejected')} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-700">{current.keepLabel || 'Mantieni testo precedente'}</button>
              </div>
              {customDraft !== '' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3">
                  <textarea value={customDraft.trimStart()} onChange={(event) => setCustomDraft(event.target.value)} rows={4} className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm" placeholder="Scrivi la formulazione da sottoporre al gruppo…" />
                  <button type="button" disabled={!customDraft.trim()} onClick={() => record('custom', customDraft)} className="mt-2 min-h-10 rounded-xl bg-indigo-700 px-4 text-xs font-bold text-white disabled:opacity-40">Registra modifica nel caso</button>
                </div>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {safeIndex > 0 && <button type="button" onClick={() => setIndex(safeIndex - 1)} className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold">Precedente</button>}
            {safeIndex < proposals.length - 1 && <button type="button" onClick={() => setIndex(safeIndex + 1)} className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold">Successiva</button>}
            {personalComplete && <button type="button" onClick={() => setStage('SHARE')} data-human-next-action="share-case-contribution" className="min-h-10 rounded-xl bg-indigo-700 px-4 text-xs font-bold text-white">Passa alla condivisione</button>}
          </div>
        </section>
      )}

      {session.stage === 'SHARE' && (
        <div className="space-y-3" data-case-review-share>
          <CaseScopedTeamContributionPublisher reviewCaseId={reviewCase.id} proposals={proposals} decisions={session.decisions} customTexts={session.customTexts} discipline={discipline} order={order} academicYear={academicYear} onPersistenceStateChange={setShare} />
          {share.complete && isCoordinator && <button type="button" onClick={() => setStage('COMPARE')} data-human-next-action="compare-case-team" className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white">Apri il confronto del caso</button>}
          {share.complete && !isCoordinator && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><strong className="text-sm text-emerald-950">Il tuo contributo è condiviso</strong><p className="mt-1 text-xs text-emerald-800">Per ora il tuo compito termina qui. Il coordinatore proseguirà quando il gruppo avrà la copertura richiesta.</p><div className="mt-3"><CaseScopedTeamCoordinationWorkspace reviewCaseId={reviewCase.id} proposals={proposals} discipline={discipline} order={order} academicYear={academicYear} mode="status" /></div></div>
          )}
          <button type="button" onClick={() => setStage('EXAMINE')} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700">Rivedi il contributo</button>
        </div>
      )}

      {session.stage === 'COMPARE' && share.complete && isCoordinator && (
        <div className="space-y-3" data-case-review-compare>
          <CaseScopedTeamCoordinationWorkspace reviewCaseId={reviewCase.id} proposals={proposals} discipline={discipline} order={order} academicYear={academicYear} mode="compare" onSessionStateChange={setCoordination} onRequestRecordOutcome={(proposalRef) => { setOutcomeProposalRef(proposalRef); setStage('RECORD_TEAM_OUTCOME'); }} />
          <button type="button" onClick={() => setStage('SHARE')} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold">Torna alla condivisione</button>
        </div>
      )}

      {session.stage === 'RECORD_TEAM_OUTCOME' && share.complete && isCoordinator && (
        <div className="space-y-3" data-case-review-team-outcome>
          <CaseScopedTeamCoordinationWorkspace reviewCaseId={reviewCase.id} proposals={proposals} discipline={discipline} order={order} academicYear={academicYear} mode="record" outcomeProposalRef={outcomeProposalRef} onSessionStateChange={setCoordination} onOutcomeRecorded={() => { setOutcomeProposalRef(null); setStage('COMPARE'); }} />
          <button type="button" onClick={() => setStage('COMPARE')} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold">Torna al confronto del caso</button>
        </div>
      )}

      {coordination.allCurrentOutcomesRecorded && session.stage === 'COMPARE' && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" data-case-professional-review-ready-to-close data-hcm-level="1">
          <strong className="text-sm text-emerald-950">Tutti gli esiti professionali del caso sono registrati</strong>
          <p className="mt-1 text-xs leading-5 text-emerald-800">Puoi concludere il lavoro professionale. La conclusione non modifica il master e non equivale a una decisione istituzionale.</p>
          <button type="button" onClick={closeProfessionalSession} data-human-next-action="complete-case-professional-review" className="mt-3 min-h-11 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Concludi il riesame professionale</button>
        </section>
      )}
    </div>
  );
}
