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
>;

function filterProposals(items: Proposal[], decisions: Record<string, DecisionStatus>, filter: string) {
  return items.filter((proposal) => {
    const state = decisions[proposal.id];
    if (filter === 'pending') return !state;
    if (filter === 'approved') return state === 'approved' || state === 'custom';
    if (filter === 'rejected') return state === 'rejected';
    return true;
  });
}

function reviewStatusLabel(decision?: DecisionStatus) {
  if (decision === 'approved') return 'Proposta confermata';
  if (decision === 'custom') return 'Modifica proposta';
  if (decision === 'rejected') return 'Testo precedente';
  return 'Da esaminare';
}

function pendingWorkLabel(count: number) {
  return count === 1 ? '1 scheda richiede il tuo orientamento' : `${count} schede richiedono il tuo orientamento`;
}

export function RevisioneTab({
  currentDisciplineProps,
  currentDisciplineDecided,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
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

  const filtered = filterProposals(currentDisciplineProps, decisions, activeRevisionFilter);
  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, Math.max(0, filtered.length - 1)));
  const current = filtered[safeIndex];
  const currentDecision = current ? decisions[current.id] : undefined;
  const currentCustomText = current ? customTexts[current.id] || '' : '';
  const totalCount = currentDisciplineProps.length;
  const pendingCount = Math.max(0, totalCount - currentDisciplineDecided);
  const localChangeCount = currentDisciplineProps.filter((proposal) => decisions[proposal.id] === 'custom').length;

  const moveTo = (next: number) => {
    setRevisioneWizardIndex(Math.max(0, Math.min(filtered.length - 1, next)));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPendingWork = () => {
    setActiveRevisionFilter('pending');
    setRevisioneWizardIndex(0);
  };

  return (
    <div className="space-y-4 fade-in text-left" data-revision-flow="focused">
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
            <strong className="block text-lg text-slate-900">{currentDisciplineDecided}</strong>
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
            <p className="mt-1 text-xs leading-relaxed text-slate-600">La prossima azione è esaminare la prima scheda ancora aperta.</p>
            <button
              type="button"
              onClick={showPendingWork}
              className="mt-3 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-sm sm:w-auto"
            >
              Esamina la prossima scheda
            </button>
            <p className="mt-2 text-[11px] text-slate-500">Apre la prima scheda ancora da esaminare.</p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3" data-revision-complete>
            <strong className="block text-sm text-emerald-900">Hai esaminato tutte le schede di questo contesto.</strong>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">Puoi rivedere un orientamento oppure passare alla condivisione del tuo contributo.</p>
          </div>
        )}

        <p className="mt-3 text-xs font-semibold text-indigo-950" data-revision-assurance>
          Il tuo orientamento resta un contributo personale anche dopo la condivisione.
        </p>
      </section>

      <header className="sticky top-16 z-30 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-4" data-revision-sticky-context>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="block text-sm text-slate-900">Schede</strong>
            <p className="mt-1 text-xs text-slate-500">Scegli quali mostrare.</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{currentDisciplineDecided}/{totalCount} esaminate</span>
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
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${currentDecision ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
              {reviewStatusLabel(currentDecision)}
            </span>
          </header>

          <div className="space-y-3 p-4">
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

            {currentDecision === 'custom' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3">
                <label htmlFor={`custom-${current.id}`} className="text-xs font-bold text-slate-700">La modifica che proponi al team</label>
                <textarea
                  id={`custom-${current.id}`}
                  value={currentCustomText}
                  onChange={(event) => setCustomText(current.id, event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/30"
                  placeholder="Scrivi la formulazione che vorresti discutere con il team…"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Questa è una proposta di lavoro. Non sostituisce il testo dell’Istituto finché il percorso di revisione non è concluso.</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-16 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:static" data-revision-sticky-actions data-revision-decision-actions>
            <p className="mb-2 text-xs font-semibold text-slate-700">Qual è il tuo orientamento per il confronto?</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => setDecision(current.id, 'approved')} className={`rounded-xl px-3 py-3 text-xs font-bold ${currentDecision === 'approved' ? 'bg-emerald-700 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Conferma proposta</button>
              <button type="button" onClick={() => setDecision(current.id, 'custom')} className={`rounded-xl px-3 py-3 text-xs font-bold ${currentDecision === 'custom' ? 'bg-amber-500 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Proponi una modifica</button>
              <button type="button" onClick={() => setDecision(current.id, 'rejected')} className={`rounded-xl px-3 py-3 text-xs font-bold ${currentDecision === 'rejected' ? 'bg-slate-700 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Mantieni testo precedente</button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" disabled={safeIndex === 0} onClick={() => moveTo(safeIndex - 1)} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-30"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Precedente</button>
              {currentDecision && <button type="button" onClick={() => resetDecision(current.id)} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">Rimetti da esaminare</button>}
              <button type="button" disabled={safeIndex === filtered.length - 1} onClick={() => moveTo(safeIndex + 1)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-700 px-3 py-2.5 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">Successivo<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            {currentDecision && <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">Rimette la scheda tra quelle da esaminare. Non registra un esito del team.</p>}
          </div>
        </section>
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
