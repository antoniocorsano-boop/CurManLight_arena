import { ChevronLeft, ChevronRight, FileSearch, Info, Milestone } from 'lucide-react';
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

function filterProposals(
  items: Proposal[],
  decisions: Record<string, DecisionStatus>,
  customTexts: Record<string, string>,
  filter: string,
) {
  return items.filter((proposal) => {
    const state = decisions[proposal.id];
    const prepared = isPreparedProposal(proposal, decisions, customTexts);
    if (filter === 'pending') return !prepared;
    if (filter === 'approved') return state === 'approved' || (state === 'custom' && prepared);
    if (filter === 'rejected') return state === 'rejected';
    return true;
  });
}

function reviewStatusLabel(decision?: DecisionStatus, customText = '') {
  if (decision === 'approved') return 'Proposta confermata';
  if (decision === 'custom' && customText.trim()) return 'Modifica proposta';
  if (decision === 'custom') return 'Modifica da completare';
  if (decision === 'rejected') return 'Testo precedente';
  return 'Da esaminare';
}

function pendingWorkLabel(count: number) {
  return count === 1 ? '1 scheda richiede il tuo orientamento' : `${count} schede richiedono il tuo orientamento`;
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
    activeRevisionFilter,
    setActiveRevisionFilter,
    setDecision,
    resetDecision,
    setCustomText,
  } = useCurriculumStore();

  const filtered = filterProposals(currentDisciplineProps, decisions, customTexts, activeRevisionFilter);
  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, Math.max(0, filtered.length - 1)));
  const current = filtered[safeIndex];
  const currentDecision = current ? decisions[current.id] : undefined;
  const currentCustomText = current ? customTexts[current.id] || '' : '';
  const currentPrepared = current ? isPreparedProposal(current, decisions, customTexts) : false;
  const totalCount = currentDisciplineProps.length;
  const preparedCount = currentDisciplineProps.filter((proposal) => isPreparedProposal(proposal, decisions, customTexts)).length;
  const pendingCount = Math.max(0, totalCount - preparedCount);
  const localChangeCount = currentDisciplineProps.filter((proposal) => decisions[proposal.id] === 'custom' && isPreparedProposal(proposal, decisions, customTexts)).length;
  const currentIndexInAll = current ? currentDisciplineProps.findIndex((proposal) => proposal.id === current.id) : -1;

  const nextPendingIndex = (() => {
    if (totalCount === 0) return -1;
    const start = currentIndexInAll >= 0 ? currentIndexInAll + 1 : 0;
    for (let index = start; index < totalCount; index += 1) {
      if (!isPreparedProposal(currentDisciplineProps[index], decisions, customTexts)) return index;
    }
    for (let index = 0; index < start; index += 1) {
      if (currentDisciplineProps[index].id !== current?.id && !isPreparedProposal(currentDisciplineProps[index], decisions, customTexts)) return index;
    }
    return -1;
  })();

  const moveTo = (next: number) => {
    setRevisioneWizardIndex(Math.max(0, Math.min(filtered.length - 1, next)));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPendingWork = () => {
    setActiveRevisionFilter('pending');
    setRevisioneWizardIndex(0);
  };

  const stabilizeCurrentCard = () => {
    if (!current || activeRevisionFilter === 'all') return;
    const originalIndex = currentDisciplineProps.findIndex((proposal) => proposal.id === current.id);
    setActiveRevisionFilter('all');
    setRevisioneWizardIndex(Math.max(0, originalIndex));
  };

  const recordDecision = (decision: DecisionStatus) => {
    if (!current) return;
    stabilizeCurrentCard();
    setDecision(current.id, decision);
  };

  const moveToNextPending = () => {
    if (nextPendingIndex < 0) return;
    setActiveRevisionFilter('all');
    setRevisioneWizardIndex(nextPendingIndex);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reopenCurrent = () => {
    if (!current) return;
    stabilizeCurrentCard();
    resetDecision(current.id);
  };

  return (
    <div className="space-y-4 fade-in text-left" data-revision-flow="progressive">
      <section
        className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4"
        aria-labelledby="team-review-work-title"
        data-team-review-overview
        data-revision-operational-summary
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Milestone className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
              <h1 id="team-review-work-title" className="text-base font-extrabold text-slate-900 sm:text-lg">Il mio lavoro nel curricolo</h1>
              <span aria-hidden="true" className="sr-only">Revisione del Curricolo: Gap 2025</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Stato del mio lavoro">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <strong className="block text-lg text-slate-900">{pendingCount}</strong>
            <span className="text-[11px] text-slate-500">da esaminare</span>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <strong className="block text-lg text-slate-900">{preparedCount}</strong>
            <span className="text-[11px] text-slate-500">già esaminate</span>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <strong className="block text-lg text-slate-900">{localChangeCount}</strong>
            <span className="text-[11px] text-slate-500">modifiche proposte</span>
          </div>
        </div>

        {pendingCount > 0 ? (
          <div className="mt-3 rounded-xl border border-indigo-200 bg-white p-3" data-revision-next-action>
            <strong className="block text-sm text-slate-900">{pendingWorkLabel(pendingCount)}</strong>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">La prossima azione è esaminare una scheda ancora aperta.</p>
            <button
              type="button"
              onClick={showPendingWork}
              className="mt-3 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-sm sm:w-auto"
            >
              Esamina la prossima scheda
            </button>
            <p className="mt-2 text-[11px] text-slate-500">Apre la prima scheda ancora da esaminare.</p>
          </div>
        ) : totalCount > 0 ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3" data-revision-complete>
            <strong className="block text-sm text-emerald-900">Hai esaminato tutte le schede di questo contesto.</strong>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">Il passaggio successivo è la condivisione esplicita del tuo contributo.</p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3" data-revision-no-work>
            <strong className="block text-sm text-slate-900">Nessuna scheda da revisionare in questo contesto.</strong>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Non è richiesta alcuna azione personale qui.</p>
          </div>
        )}

        {totalCount > 0 && (
          <p className="mt-3 text-xs font-semibold text-indigo-950" data-revision-assurance>
            Il tuo orientamento resta personale: non approva il curricolo.
          </p>
        )}
      </section>

      <header className="sticky top-16 z-30 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-4" data-revision-sticky-context>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="block text-sm text-slate-900">Schede</strong>
            <p className="mt-1 text-xs text-slate-500">Scegli quali mostrare.</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{preparedCount}/{totalCount} esaminate</span>
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto pb-1 text-xs font-semibold" aria-label="Filtra revisioni">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => { setActiveRevisionFilter(filter); setRevisioneWizardIndex(0); }}
              className={`shrink-0 rounded-full px-3 py-1.5 transition ${activeRevisionFilter === filter ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {filter === 'all' ? 'Tutte' : filter === 'pending' ? 'Da esaminare' : filter === 'approved' ? 'Con proposta' : 'Testo precedente'}
            </button>
          ))}
        </div>
      </header>

      {current ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="current-revision-title" data-revision-current-card>
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Scheda {safeIndex + 1} di {filtered.length}</span>
              <h2 id="current-revision-title" className="mt-1 text-base font-extrabold leading-tight text-slate-900">{current.focus}</h2>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${currentPrepared ? 'bg-indigo-100 text-indigo-800' : currentDecision === 'custom' ? 'bg-amber-100 text-amber-800' : 'bg-amber-100 text-amber-800'}`}>
              {reviewStatusLabel(currentDecision, currentCustomText)}
            </span>
          </header>

          <div className="space-y-3 p-4">
            <details className="rounded-xl border border-slate-200 bg-white" open={!currentDecision} data-revision-progressive-stage="comparison">
              <summary className="cursor-pointer list-none px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">1 · Confronto</span>
                    <strong className="mt-0.5 block text-sm text-slate-900">{currentDecision ? 'Confronto esaminato' : 'Confronta i testi'}</strong>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{currentDecision ? 'Rivedi' : 'Aperto'}</span>
                </div>
              </summary>

              <div className="space-y-3 border-t border-slate-100 p-3">
                <aside className="rounded-xl border border-amber-100 bg-amber-50/70 p-3" data-team-review-why>
                  <strong className="text-xs text-amber-900">Perché è in revisione?</strong>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    Confronta il testo precedente con la proposta aggiornata e valuta chiarezza, adeguatezza e continuità del percorso.
                  </p>
                </aside>

                <div className="grid gap-3 lg:grid-cols-2">
                  <article className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[10px] uppercase tracking-wide text-slate-500">Prima · quadro 2012</strong>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">testo precedente</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{current.oldText}</p>
                  </article>
                  <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[10px] uppercase tracking-wide text-indigo-600">Proposta aggiornata · quadro 2025</strong>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-indigo-600">testo proposto</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">{current.newText}</p>
                  </article>
                </div>

                <details className="rounded-xl border border-slate-200 bg-white" data-team-review-source>
                  <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-700">Da dove vengono questi testi?</summary>
                  <div className="border-t border-slate-100 px-3 py-3 text-xs leading-relaxed text-slate-600">
                    <p><strong>Testo precedente:</strong> collegato al quadro nazionale 2012.</p>
                    <p className="mt-1"><strong>Proposta aggiornata:</strong> costruita per il confronto con il quadro 2025. Eventuali adattamenti dell’Istituto restano proposte finché non vengono esaminati dagli organi competenti.</p>
                  </div>
                </details>

                <details className="rounded-xl border border-slate-200 bg-white" data-team-review-continuity>
                  <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-700">Criteri utili per esaminare la scheda</summary>
                  <ul className="border-t border-slate-100 px-3 py-3 space-y-1 text-xs leading-relaxed text-slate-600">
                    <li>• È adatto alla classe e comprensibile?</li>
                    <li>• Evita ripetizioni inutili con ciò che viene prima?</li>
                    <li>• Prepara bene ciò che gli alunni dovranno affrontare dopo?</li>
                  </ul>
                </details>
              </div>
            </details>

            <section className="rounded-xl border border-slate-200 bg-white p-3" data-revision-progressive-stage="orientation">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">2 · Orientamento</span>
                  <strong className="mt-0.5 block text-sm text-slate-900">{currentDecision ? reviewStatusLabel(currentDecision, currentCustomText) : 'Registra il tuo orientamento'}</strong>
                </div>
                {currentPrepared && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">completato</span>}
              </div>

              {!currentDecision ? (
                <>
                  <p className="mb-2 text-xs font-semibold text-slate-700">Qual è il tuo orientamento per il confronto?</p>
                  <div className="grid gap-2 sm:grid-cols-3" data-revision-decision-actions>
                    <button type="button" onClick={() => recordDecision('approved')} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700">Conferma proposta</button>
                    <button type="button" onClick={() => recordDecision('custom')} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700">Proponi una modifica</button>
                    <button type="button" onClick={() => recordDecision('rejected')} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700">Mantieni testo precedente</button>
                  </div>

                  <div className="mt-3 flex items-center gap-2" data-revision-browse-controls>
                    <button type="button" disabled={safeIndex === 0} onClick={() => moveTo(safeIndex - 1)} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-30"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Precedente</button>
                    <button type="button" disabled={safeIndex === filtered.length - 1} onClick={() => moveTo(safeIndex + 1)} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-30">Salta per ora<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </>
              ) : (
                <>
                  {currentDecision === 'custom' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3" data-revision-custom-draft>
                      <label htmlFor={`custom-${current.id}`} className="text-xs font-bold text-slate-700">La modifica che proponi al team</label>
                      <textarea
                        id={`custom-${current.id}`}
                        value={currentCustomText}
                        onChange={(event) => setCustomText(current.id, event.target.value)}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/30"
                        placeholder="Scrivi la formulazione che vorresti discutere con il team…"
                      />
                      {!currentCustomText.trim() && <p className="mt-2 text-[11px] font-semibold leading-relaxed text-amber-800">Completa la formulazione: finché è vuota, la scheda resta da esaminare.</p>}
                    </div>
                  )}

                  {currentPrepared && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3" data-revision-consequence>
                      <strong className="block text-sm text-emerald-900">Orientamento registrato</strong>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-800">La scheda è ora pronta nel tuo contributo personale.</p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        {nextPendingIndex >= 0 ? (
                          <button type="button" onClick={moveToNextPending} className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white">
                            Esamina la prossima scheda
                          </button>
                        ) : (
                          <button type="button" onClick={onContinueAfterReview} disabled={!onContinueAfterReview} className="min-h-11 flex-1 rounded-xl bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                            Continua alla condivisione
                          </button>
                        )}
                        <button type="button" onClick={reopenCurrent} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700">
                          Modifica orientamento
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      ) : totalCount === 0 ? (
        <UiEmptyState icon={FileSearch} title="Nessuna scheda da revisionare" description="Non ci sono schede di revisione nel contesto personale corrente." />
      ) : pendingCount > 0 && activeRevisionFilter !== 'pending' ? (
        <UiEmptyState
          icon={FileSearch}
          title="Questo filtro non mostra le schede da esaminare"
          description={`${pendingCount} ${pendingCount === 1 ? 'scheda è ancora da esaminare' : 'schede sono ancora da esaminare'} nel tuo contesto corrente.`}
          action={(
            <button type="button" onClick={showPendingWork} className="rounded-xl bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white">
              Mostra {pendingCount === 1 ? 'la scheda da esaminare' : `le ${pendingCount} da esaminare`}
            </button>
          )}
        />
      ) : pendingCount === 0 && activeRevisionFilter === 'pending' ? (
        <UiEmptyState icon={FileSearch} title="Hai completato la revisione personale" description="Non restano schede da esaminare in questo contesto." />
      ) : (
        <UiEmptyState icon={FileSearch} title="Niente da mostrare con questo filtro" description="Non ci sono schede corrispondenti al filtro scelto." />
      )}

      <details className="rounded-2xl border border-slate-200 bg-white" data-revision-secondary="help">
        <summary className="cursor-pointer list-none p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Info className="h-4 w-4 text-amber-500" aria-hidden="true" />Che cosa succede dopo?</div>
        </summary>
        <div className="border-t border-slate-100 p-4 text-xs leading-relaxed text-slate-600">
          Le scelte di questa schermata servono a preparare il confronto professionale. Non sono voti e non sono approvazioni. Le proposte che il gruppo decide di portare avanti seguono poi il percorso di revisione previsto dall’Istituto; la decisione istituzionale resta separata e richiede le responsabilità previste.
        </div>
      </details>
    </div>
  );
}
