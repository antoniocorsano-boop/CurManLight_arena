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

type ParsedSourceRef = {
  label: string;
  driveId: string | null;
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

function parseSourceRef(sourceRef: string): ParsedSourceRef {
  const marker = ' · Drive ';
  const index = sourceRef.lastIndexOf(marker);
  if (index < 0) return { label: sourceRef, driveId: null };
  return {
    label: sourceRef.slice(0, index),
    driveId: sourceRef.slice(index + marker.length),
  };
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
  const localChangeCount = currentDisciplineProps.filter((proposal) => decisions[proposal.id] === 'custom' && Boolean(customTexts[proposal.id]?.trim())).length;
  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, Math.max(0, totalCount - 1)));
  const current = currentDisciplineProps[safeIndex];
  const currentDecision = current ? decisions[current.id] : undefined;
  const currentCustomText = current ? customTexts[current.id] || '' : '';
  const currentPrepared = current ? isPreparedProposal(current, decisions, customTexts) : false;
  const keepActionLabel = current ? (current.keepLabel || 'Mantieni testo precedente') : 'Mantieni testo precedente';

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

  const deferCurrent = () => {
    if (!current) return;
    setCustomDraft(null);
    if (currentDecision) resetDecision(current.id);
    if (nextPendingIndex >= 0) moveToProposal(nextPendingIndex);
  };

  const customEditorOpen = Boolean(
    current
      && ((customDraft?.proposalId === current.id) || (currentDecision === 'custom' && !currentPrepared)),
  );
  const customDraftValue = customDraft?.proposalId === current?.id ? customDraft.text : currentCustomText;

  if (totalCount === 0) {
    return (
      <div className="fade-in text-left" data-revision-flow="recognition-first">
        <UiEmptyState icon={FileSearch} title="Nessuna scheda da esaminare" description="Non risultano proposte aperte nel contesto disciplinare corrente." />
      </div>
    );
  }

  return (
    <div className="space-y-3 fade-in text-left" data-revision-flow="recognition-first">
      <div className="space-y-3" data-hcm-level="1" data-hcm-purpose="orientation-action">
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4" aria-labelledby="teacher-curriculum-work-title" data-teacher-curriculum-overview>
          <h1 id="teacher-curriculum-work-title" className="text-base font-extrabold text-slate-900 sm:text-lg">Il mio contributo alla revisione del curricolo</h1>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Esamina le schede della disciplina e registra il tuo orientamento professionale in vista del confronto con il gruppo.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Stato del mio contributo">
            <div className="rounded-xl bg-white p-3 text-center shadow-sm">
              <strong className="block text-lg text-slate-900">{pendingCount}</strong>
              <span className="text-[11px] text-slate-500">da esaminare</span>
            </div>
            <div className="rounded-xl bg-white p-3 text-center shadow-sm">
              <strong className="block text-lg text-slate-900">{preparedCount}</strong>
              <span className="text-[11px] text-slate-500">esaminate</span>
            </div>
            <div className="rounded-xl bg-white p-3 text-center shadow-sm">
              <strong className="block text-lg text-slate-900">{localChangeCount}</strong>
              <span className="text-[11px] text-slate-500">modifiche proposte</span>
            </div>
          </div>
        </section>

        <header className="flex items-center justify-between gap-3 px-1" data-revision-recognition-header>
          <span className="text-xs font-bold text-slate-500">Scheda {safeIndex + 1} di {totalCount}</span>
          <details className="relative" data-revision-assurance-on-demand>
            <summary className="cursor-pointer list-none rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">Contributo personale</summary>
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-lg">
              Questa scelta registra il tuo contributo professionale. La decisione del gruppo è un passaggio distinto.
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
                  Esamina la prossima scheda
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onContinueAfterReview}
                  disabled={!onContinueAfterReview}
                  className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  Condividi il contributo con il gruppo
                </button>
              )}
              <button
                type="button"
                onClick={reopenCurrent}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Rivedi la scelta
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
                  <strong className="text-[11px] font-bold text-slate-500">{current.oldLabel || 'Testo precedente'}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{current.oldText}</p>
                </article>
                <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                  <strong className="text-[11px] font-bold text-indigo-700">{current.newLabel || 'Proposta da esaminare'}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">{current.newText}</p>
                </article>
              </div>

              {customEditorOpen ? (
                <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-3" data-revision-custom-draft>
                  <label htmlFor={`custom-${current.id}`} className="text-xs font-bold text-slate-800">Modifica proposta</label>
                  <textarea
                    id={`custom-${current.id}`}
                    value={customDraftValue}
                    onChange={(event) => setCustomDraft({ proposalId: current.id, text: event.target.value })}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/30"
                    placeholder="Scrivi la formulazione che intendi sottoporre al confronto del gruppo…"
                  />
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">La formulazione sarà registrata come tuo contributo personale alla revisione.</p>
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
                <>
                  <p className="text-xs font-semibold text-slate-700">Registra il tuo orientamento</p>
                  <div className="grid gap-2 sm:grid-cols-3" data-revision-decision-actions>
                    <button aria-label="Conferma la proposta" type="button" onClick={() => recordDecision('approved')} className="min-h-11 rounded-xl bg-indigo-700 px-3 py-3 text-sm font-bold text-white">Conferma la proposta</button>
                    <button aria-label="Proponi una modifica" type="button" onClick={startCustomDraft} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-700">Proponi una modifica</button>
                    <button aria-label={keepActionLabel} type="button" onClick={() => recordDecision('rejected')} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-700">{keepActionLabel}</button>
                  </div>
                  <button type="button" onClick={deferCurrent} className="min-h-11 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-left text-xs font-bold text-indigo-700">
                    Rinvia la scheda al confronto
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {!currentPrepared && (
        <details className="rounded-xl border border-slate-200 bg-white" data-hcm-level="2" data-revision-secondary="explanation">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-slate-700">Motivazione e criteri di esame</summary>
          <div className="space-y-4 border-t border-slate-100 px-4 py-4 text-xs leading-relaxed text-slate-600">
            <section data-revision-why>
              <strong className="text-slate-800">Perché questa proposta</strong>
              <p className="mt-1">{current.contextSummary || 'La proposta introduce una formulazione aggiornata da sottoporre al riesame professionale della disciplina.'}</p>
            </section>
            <section data-revision-continuity-check>
              <strong className="text-slate-800">Criteri per il confronto</strong>
              <ul className="mt-2 space-y-1">
                <li>• La formulazione è chiara e adeguata agli alunni?</li>
                <li>• Mantiene una progressione coerente con ciò che viene prima?</li>
                <li>• Prepara in modo efficace ciò che gli alunni affronteranno dopo?</li>
              </ul>
            </section>
          </div>
        </details>
      )}

      {!currentPrepared && (
        <details className="rounded-xl border border-slate-200 bg-white" data-hcm-level="3" data-revision-secondary="traceability">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-slate-700">Fonti e tracciabilità</summary>
          <div className="space-y-4 border-t border-slate-100 px-4 py-4 text-xs leading-relaxed text-slate-600">
            {current.sourceRefs && current.sourceRefs.length > 0 && (
              <section>
                <strong className="text-slate-800">Documentazione di riferimento</strong>
                <ul className="mt-2 space-y-2" data-revision-source-refs>
                  {current.sourceRefs.map((sourceRef) => {
                    const parsed = parseSourceRef(sourceRef);
                    return <li key={sourceRef}>• {parsed.label}</li>;
                  })}
                </ul>
              </section>
            )}
            <details className="rounded-lg border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-3 py-2 font-bold text-slate-700">Identificativi tecnici</summary>
              <div className="space-y-2 border-t border-slate-200 px-3 py-3">
                {current.gateId && <p><strong>Riferimento interno:</strong> <code>{current.gateId}</code></p>}
                {current.sourceRefs?.map((sourceRef) => {
                  const parsed = parseSourceRef(sourceRef);
                  if (!parsed.driveId) return null;
                  return <p key={`${sourceRef}-id`} className="break-all"><strong>Drive:</strong> <code>{parsed.driveId}</code></p>;
                })}
                {current.notes && <p><strong>Nota tecnica:</strong> {current.notes}</p>}
              </div>
            </details>
          </div>
        </details>
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
