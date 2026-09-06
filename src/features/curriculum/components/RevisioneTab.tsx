import { FileSearch } from 'lucide-react';
import { useState } from 'react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { UiEmptyState } from '../../../ui/components/UiEmptyState';
import type { DecisionStatus, Proposal } from '../../../types/curriculum';
import type { AppViewsLayerProps } from '../../session';

export type RevisioneTabProps = Pick<AppViewsLayerProps,
  | 'currentDisciplineProps'
  | 'currentDisciplineDecided'
  | 'revisioneMode'
  | 'setRevisioneMode'
  | 'revisioneWizardIndex'
  | 'setRevisioneWizardIndex'
> & {
  onContinueAfterReview?: () => void;
};

type CustomDraft = {
  proposalId: string;
  text: string;
};

function isPreparedProposal(
  proposal: Proposal,
  decisions: Record<string, DecisionStatus>,
  customTexts: Record<string, string>,
) {
  const decision = decisions[proposal.id];
  if (!decision) return false;
  if (decision === 'custom') return Boolean(customTexts[proposal.id]?.trim());
  return true;
}

function reviewStatusLabel(decision?: DecisionStatus, customText = '') {
  if (decision === 'approved') return 'Confermata';
  if (decision === 'custom' && customText.trim()) return 'Modifica registrata';
  if (decision === 'custom') return 'Modifica da completare';
  if (decision === 'rejected') return 'Stato corrente mantenuto';
  return 'Da esaminare';
}

export function RevisioneTab({
  currentDisciplineProps,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
  onContinueAfterReview,
}: RevisioneTabProps) {
  const {
    decisions,
    customTexts,
    setDecision,
    resetDecision,
    setCustomText,
  } = useCurriculumStore();
  const [customDraft, setCustomDraft] = useState<CustomDraft | null>(null);

  const totalCount = currentDisciplineProps.length;
  const preparedCount = currentDisciplineProps.filter((proposal) => isPreparedProposal(proposal, decisions, customTexts)).length;
  const pendingCount = Math.max(0, totalCount - preparedCount);
  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, Math.max(0, totalCount - 1)));
  const current = currentDisciplineProps[safeIndex];
  const currentDecision = current ? decisions[current.id] : undefined;
  const currentCustomText = current ? customTexts[current.id] || '' : '';
  const currentPrepared = current ? isPreparedProposal(current, decisions, customTexts) : false;

  const nextPendingIndex = (() => {
    if (!current || pendingCount === 0) return -1;
    for (let index = safeIndex + 1; index < totalCount; index += 1) {
      if (!isPreparedProposal(currentDisciplineProps[index], decisions, customTexts)) return index;
    }
    for (let index = 0; index < safeIndex; index += 1) {
      if (!isPreparedProposal(currentDisciplineProps[index], decisions, customTexts)) return index;
    }
    return -1;
  })();

  const moveToProposal = (index: number) => {
    setCustomDraft(null);
    setRevisioneWizardIndex(Math.max(0, Math.min(totalCount - 1, index)));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recordDecision = (decision: 'approved' | 'rejected') => {
    if (!current) return;
    setCustomDraft(null);
    setDecision(current.id, decision);
  };

  const startCustomDraft = () => {
    if (!current) return;
    setCustomDraft({ proposalId: current.id, text: currentCustomText });
  };

  const cancelCustomDraft = () => {
    if (current && currentDecision === 'custom' && !currentPrepared) resetDecision(current.id);
    setCustomDraft(null);
  };

  const commitCustomDraft = () => {
    if (!current) return;
    const value = customDraft?.proposalId === current.id ? customDraft.text.trim() : currentCustomText.trim();
    if (!value) return;
    setCustomText(current.id, value);
    setDecision(current.id, 'custom');
    setCustomDraft(null);
  };

  const reopenCurrent = () => {
    if (!current) return;
    setCustomDraft(null);
    resetDecision(current.id);
  };

  const customEditorOpen = Boolean(
    current
      && ((customDraft?.proposalId === current.id) || (currentDecision === 'custom' && !currentPrepared)),
  );
  const customDraftValue = customDraft?.proposalId === current?.id ? customDraft.text : currentCustomText;

  if (totalCount === 0) {
    return (
      <div className="fade-in text-left" data-revision-flow="recognition-first">
        <UiEmptyState icon={FileSearch} title="Nessuna scheda da revisionare" description="Non ci sono schede nel contesto personale corrente." />
      </div>
    );
  }

  return (
    <div className="space-y-3 fade-in text-left" data-revision-flow="recognition-first">
      <header className="flex items-center justify-between gap-3 px-1" data-revision-recognition-header>
        <span className="text-xs font-bold text-slate-500">{safeIndex + 1} di {totalCount}</span>
        <details className="relative" data-revision-assurance-on-demand>
          <summary className="cursor-pointer list-none rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">Personale</summary>
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-lg">
            Il tuo contributo resta personale. Non approva il curricolo.
          </div>
        </details>
      </header>

      {currentPrepared ? (
        <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm" data-revision-completed-card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {current.scopeLabel && <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{current.scopeLabel}</p>}
              <h2 className="text-base font-extrabold leading-tight text-slate-900">{current.focus}</h2>
              <p className="mt-1 text-xs font-bold text-emerald-700">✓ {reviewStatusLabel(currentDecision, currentCustomText)}</p>
            </div>
          </div>

          {currentDecision === 'custom' && (
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{currentCustomText}</p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row" data-revision-consequence>
            {nextPendingIndex >= 0 ? (
              <button
                type="button"
                onClick={() => moveToProposal(nextPendingIndex)}
                className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white"
              >
                Prossima scheda
              </button>
            ) : (
              <button
                type="button"
                onClick={onContinueAfterReview}
                disabled={!onContinueAfterReview}
                className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Vai alla condivisione
              </button>
            )}
            <button
              type="button"
              onClick={reopenCurrent}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600"
            >
              Cambia scelta
            </button>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="current-revision-title" data-revision-current-card>
          <header className="border-b border-slate-100 px-4 py-3">
            {current.scopeLabel && <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{current.scopeLabel}</p>}
            <h2 id="current-revision-title" className="text-base font-extrabold leading-tight text-slate-900">{current.focus}</h2>
          </header>

          <div className="space-y-3 p-4">
            <div className="grid gap-3 lg:grid-cols-2" data-revision-comparison>
              <article className="rounded-xl bg-slate-50 p-3">
                <strong className="text-[11px] font-bold text-slate-500">{current.oldLabel || 'Precedente'}</strong>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{current.oldText}</p>
              </article>
              <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                <strong className="text-[11px] font-bold text-indigo-700">{current.newLabel || 'Proposta'}</strong>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{current.newText}</p>
              </article>
            </div>

            <details className="rounded-xl border border-slate-200 bg-white" data-revision-secondary="context">
              <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-600">Contesto e fonti</summary>
              <div className="space-y-3 border-t border-slate-100 px-3 py-3 text-xs leading-relaxed text-slate-600">
                <p>{current.contextSummary || 'Il testo precedente e la proposta appartengono a due stati distinti del lavoro curricolare. Verifica formulazione, continuità verticale e adeguatezza al contesto.'}</p>
                {current.gateId && <p><strong>Gate:</strong> {current.gateId}</p>}
                {current.sourceRefs && current.sourceRefs.length > 0 && (
                  <ul className="space-y-1" data-revision-source-refs>
                    {current.sourceRefs.map((sourceRef) => <li key={sourceRef}>• {sourceRef}</li>)}
                  </ul>
                )}
                {current.notes && <p className="text-slate-500">{current.notes}</p>}
              </div>
            </details>

            {customEditorOpen ? (
              <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-3" data-revision-custom-draft>
                <label htmlFor={`custom-${current.id}`} className="text-xs font-bold text-slate-800">La tua modifica</label>
                <textarea
                  id={`custom-${current.id}`}
                  value={customDraftValue}
                  onChange={(event) => setCustomDraft({ proposalId: current.id, text: event.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/30"
                  placeholder="Scrivi la formulazione alternativa…"
                />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={commitCustomDraft}
                    disabled={!customDraftValue.trim()}
                    className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Registra modifica
                  </button>
                  <button
                    type="button"
                    onClick={cancelCustomDraft}
                    className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600"
                  >
                    Annulla
                  </button>
                </div>
              </section>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3" data-revision-decision-actions>
                <button type="button" onClick={() => recordDecision('approved')} className="min-h-11 rounded-xl bg-indigo-700 px-3 py-3 text-sm font-bold text-white">Conferma</button>
                <button type="button" onClick={startCustomDraft} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-700">Modifica</button>
                <button type="button" onClick={() => recordDecision('rejected')} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-700">{current.keepLabel || 'Mantieni precedente'}</button>
              </div>
            )}
          </div>
        </section>
      )}

      <details className="rounded-xl border border-slate-200 bg-white" data-revision-secondary="review-list">
        <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-slate-600">Tutte le schede · {preparedCount}/{totalCount}</summary>
        <div className="grid gap-2 border-t border-slate-100 p-3">
          {currentDisciplineProps.map((proposal, index) => {
            const decision = decisions[proposal.id];
            const customText = customTexts[proposal.id] || '';
            const prepared = isPreparedProposal(proposal, decisions, customTexts);
            return (
              <button
                key={proposal.id}
                type="button"
                onClick={() => moveToProposal(index)}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left ${index === safeIndex ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}
              >
                <span className="min-w-0 text-xs font-semibold text-slate-800">{proposal.focus}</span>
                <span className={`shrink-0 text-[10px] font-bold ${prepared ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {prepared ? '✓' : reviewStatusLabel(decision, customText)}
                </span>
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}
