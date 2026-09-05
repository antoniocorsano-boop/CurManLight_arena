import { FileSearch, Milestone } from 'lucide-react';
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
  if (decision === 'approved') return 'Proposta confermata';
  if (decision === 'custom' && customText.trim()) return 'Modifica proposta';
  if (decision === 'custom') return 'Modifica da completare';
  if (decision === 'rejected') return 'Testo precedente mantenuto';
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
  const localChangeCount = currentDisciplineProps.filter(
    (proposal) => decisions[proposal.id] === 'custom' && isPreparedProposal(proposal, decisions, customTexts),
  ).length;

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
      <div className="space-y-4 fade-in text-left" data-revision-flow="single-task">
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4" data-revision-operational-summary>
          <div className="flex items-center gap-2">
            <Milestone className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
            <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">Il mio lavoro nel curricolo</h1>
          </div>
        </section>
        <UiEmptyState icon={FileSearch} title="Nessuna scheda da revisionare" description="Non ci sono schede di revisione nel contesto personale corrente." />
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in text-left" data-revision-flow="single-task">
      <section
        className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4"
        aria-labelledby="personal-review-title"
        data-revision-operational-summary
      >
        <div className="flex items-center gap-2">
          <Milestone className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
          <h1 id="personal-review-title" className="text-base font-extrabold text-slate-900 sm:text-lg">Il mio lavoro nel curricolo</h1>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-white px-3 py-1.5 font-bold text-slate-800">{preparedCount}/{totalCount} completate</span>
          {pendingCount > 0 && <span className="rounded-full bg-amber-100 px-3 py-1.5 font-bold text-amber-800">{pendingCount} da esaminare</span>}
          {localChangeCount > 0 && <span className="rounded-full bg-indigo-100 px-3 py-1.5 font-bold text-indigo-800">{localChangeCount} con modifica</span>}
        </div>

        <p className="mt-3 text-xs font-semibold text-indigo-950" data-revision-assurance>
          Il tuo contributo resta personale. Non approva il curricolo.
        </p>
      </section>

      {currentPrepared ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm" data-revision-completed-card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Scheda {safeIndex + 1} di {totalCount}</span>
              <h2 className="mt-1 text-base font-extrabold leading-tight text-slate-900">{current.focus}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">completata</span>
          </div>

          <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3">
            <strong className="block text-sm text-emerald-950">{reviewStatusLabel(currentDecision, currentCustomText)}</strong>
            {currentDecision === 'custom' && (
              <p className="mt-1 text-xs leading-relaxed text-slate-700">{currentCustomText}</p>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row" data-revision-consequence>
            {nextPendingIndex >= 0 ? (
              <button
                type="button"
                onClick={() => moveToProposal(nextPendingIndex)}
                className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white"
              >
                Esamina la prossima scheda
              </button>
            ) : (
              <button
                type="button"
                onClick={onContinueAfterReview}
                disabled={!onContinueAfterReview}
                className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Passa alla condivisione
              </button>
            )}
            <button
              type="button"
              onClick={reopenCurrent}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              Modifica orientamento
            </button>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="current-revision-title" data-revision-current-card>
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Scheda {safeIndex + 1} di {totalCount}</span>
              <h2 id="current-revision-title" className="mt-1 text-base font-extrabold leading-tight text-slate-900">{current.focus}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
              {reviewStatusLabel(currentDecision, currentCustomText)}
            </span>
          </header>

          <div className="space-y-3 p-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <article className="rounded-xl bg-slate-50 p-3">
                <strong className="text-[10px] uppercase tracking-wide text-slate-500">Testo precedente · quadro 2012</strong>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{current.oldText}</p>
              </article>
              <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                <strong className="text-[10px] uppercase tracking-wide text-indigo-600">Proposta aggiornata · quadro 2025</strong>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{current.newText}</p>
              </article>
            </div>

            <details className="rounded-xl border border-slate-200 bg-white" data-team-review-source>
              <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-700">Contesto, provenienza e criteri</summary>
              <div className="space-y-3 border-t border-slate-100 px-3 py-3 text-xs leading-relaxed text-slate-600">
                <div>
                  <strong className="text-slate-800">Perché è in revisione?</strong>
                  <p className="mt-1">Confronta il testo precedente con la proposta aggiornata e valuta chiarezza, adeguatezza e continuità del percorso.</p>
                </div>
                <div>
                  <strong className="text-slate-800">Da dove vengono i testi?</strong>
                  <p className="mt-1">Il testo precedente è collegato al quadro nazionale 2012; la proposta aggiornata è costruita per il confronto con il quadro 2025.</p>
                </div>
                <ul className="space-y-1">
                  <li>• È adatto alla classe e comprensibile?</li>
                  <li>• Evita ripetizioni inutili con ciò che viene prima?</li>
                  <li>• Prepara bene ciò che gli alunni dovranno affrontare dopo?</li>
                </ul>
              </div>
            </details>

            <section className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3" aria-label="Orientamento personale">
              {customEditorOpen ? (
                <div data-revision-custom-draft>
                  <label htmlFor={`custom-${current.id}`} className="text-xs font-bold text-slate-800">La modifica che proponi</label>
                  <textarea
                    id={`custom-${current.id}`}
                    value={customDraftValue}
                    onChange={(event) => setCustomDraft({ proposalId: current.id, text: event.target.value })}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/30"
                    placeholder="Scrivi la formulazione alternativa…"
                  />
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">La scheda resta da esaminare finché non registri una formulazione completa.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={commitCustomDraft}
                      disabled={!customDraftValue.trim()}
                      className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Registra la modifica
                    </button>
                    <button
                      type="button"
                      onClick={cancelCustomDraft}
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <strong className="block text-sm text-slate-900">Qual è il tuo orientamento?</strong>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3" data-revision-decision-actions>
                    <button type="button" onClick={() => recordDecision('approved')} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700">Conferma proposta</button>
                    <button type="button" onClick={startCustomDraft} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700">Proponi una modifica</button>
                    <button type="button" onClick={() => recordDecision('rejected')} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700">Mantieni testo precedente</button>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-slate-200 bg-white" data-revision-secondary="review-list">
        <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-700">Rivedi le schede · {totalCount}</summary>
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
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${prepared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {reviewStatusLabel(decision, customText)}
                </span>
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}
