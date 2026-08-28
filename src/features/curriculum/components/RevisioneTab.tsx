import React from 'react';
import { ChevronLeft, ChevronRight, FileSearch, History, Info, Layers, Milestone } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { UiEmptyState } from '../../../ui/components/UiEmptyState';
import type { DecisionStatus, Proposal } from '../../../types/curriculum';
import type { AppViewsLayerProps } from '../../session';
import {
  PROPOSAL_STATUS_LABELS,
  DECISION_OUTCOME_LABELS,
  DECISION_STATUS_LABELS,
} from '../../../domain/revision/vocabularies';
import { findDecisionsByProposal, getEventsByProposal, getLatestProposalVersion } from '../../../domain/revision';
import type { RevisionProposal } from '../../../domain/revision';
import { addProposal, transitionProposalStatus } from '../../../domain/revision/repository';
import { createEntityReference } from '../../../domain/curriculum/identity';
import type { EntityId } from '../../../domain/curriculum/identity/types';
import { InstitutionalDecisionPanel, StructuredProposalStarter } from '../../beta';

function useCanonicalRevisionActions() {
  const { revisionArchive, replaceRevisionArchive } = useCurriculumStore();

  const transitionProposal = (proposalId: string, newStatus: RevisionProposal['status'], rationale?: string) => {
    const result = transitionProposalStatus(revisionArchive, proposalId as EntityId, newStatus, undefined, rationale);
    if (result.success) replaceRevisionArchive(result.archive);
    return result;
  };

  const createDraft = (targetLabel: string, currentText: string) => {
    const result = addProposal(revisionArchive, {
      targetNodeRef: createEntityReference(`node-${Date.now()}` as never, 'curriculum-node' as never, targetLabel),
      curriculumVersionRef: createEntityReference('cv-current' as never, 'curriculum-version' as never),
      currentTextSnapshot: currentText,
      proposedText: currentText,
      rationale: '',
    });
    if (result.success) replaceRevisionArchive(result.archive);
    return result;
  };

  return { transitionProposal, createDraft };
}

function CanonicalProposalsSection() {
  const { revisionArchive } = useCurriculumStore();
  const { transitionProposal } = useCanonicalRevisionActions();
  const proposals = revisionArchive.proposals.filter((proposal) => proposal.status !== 'legacy');

  if (proposals.length === 0) return null;

  return (
    <details open className="rounded-2xl border border-indigo-100 bg-white" data-revision-secondary="structured-proposals">
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
            <div className="min-w-0">
              <strong className="block text-sm text-slate-900">Proposte strutturate</strong>
              <span className="block text-xs text-slate-500">{proposals.length} nel registro locale</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-700">Apri / chiudi</span>
        </div>
      </summary>

      <div className="space-y-3 border-t border-slate-100 p-3 sm:p-4">
        {proposals.map((proposal) => {
          const version = getLatestProposalVersion(revisionArchive, proposal);
          const decisions = findDecisionsByProposal(revisionArchive, proposal.id);
          const latestDecision = decisions.at(-1);
          const events = getEventsByProposal(revisionArchive, proposal.id);
          const nodeLabel = proposal.targetNodeRef.snapshotLabel || proposal.targetNodeRef.id;

          return (
            <article key={proposal.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <header className="flex items-start justify-between gap-3 bg-slate-50 px-3 py-3">
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-slate-900">{nodeLabel}</strong>
                  <span className="mt-0.5 block text-xs text-slate-500">{PROPOSAL_STATUS_LABELS[proposal.status]}</span>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">v{version?.versionNumber ?? 1}</span>
              </header>

              <div className="space-y-3 p-3 text-xs leading-relaxed sm:p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Testo vigente</span>
                    <p className="mt-1 text-slate-700">{proposal.currentTextSnapshot}</p>
                  </div>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                    <span className="text-[10px] font-bold uppercase text-indigo-500">Testo proposto</span>
                    <p className="mt-1 text-slate-800">{version?.proposedText ?? proposal.proposedText}</p>
                  </div>
                </div>

                {proposal.rationale && <p className="text-slate-600"><strong>Motivazione:</strong> {proposal.rationale}</p>}

                {latestDecision && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-slate-700">
                    <strong>{DECISION_STATUS_LABELS[latestDecision.status]}:</strong> {DECISION_OUTCOME_LABELS[latestDecision.outcome]}
                    {latestDecision.rationale ? ` — ${latestDecision.rationale}` : ''}
                  </div>
                )}

                {events.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold text-slate-500"><History className="mr-1 inline h-3 w-3" aria-hidden="true" />Cronologia locale</summary>
                    <div className="mt-2 space-y-1 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                      {events.slice(-5).reverse().map((event) => <div key={event.id}>{event.eventType}{event.rationale ? ` — ${event.rationale.slice(0, 80)}` : ''}</div>)}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-3 py-3">
                {proposal.status === 'draft' && (
                  <>
                    <button disabled={!proposal.rationale} onClick={() => transitionProposal(proposal.id, 'ready-for-review', proposal.rationale || undefined)} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prepara per revisione</button>
                    <button onClick={() => transitionProposal(proposal.id, 'archived')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">Archivia</button>
                  </>
                )}
                {proposal.status === 'ready-for-review' && <button onClick={() => transitionProposal(proposal.id, 'submitted')} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Invia</button>}
                {proposal.status === 'submitted' && (
                  <>
                    <button onClick={() => transitionProposal(proposal.id, 'under-review')} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Prendi in carico</button>
                    <button onClick={() => transitionProposal(proposal.id, 'withdrawn')} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700">Ritira</button>
                  </>
                )}
                {proposal.status === 'under-review' && (
                  <>
                    <button onClick={() => transitionProposal(proposal.id, 'changes-requested', 'Modifiche richieste dal revisore')} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-800">Richiedi modifiche</button>
                    <button onClick={() => transitionProposal(proposal.id, 'accepted-for-decision')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Ammetti alla decisione</button>
                    <button onClick={() => transitionProposal(proposal.id, 'rejected')} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700">Rigetta</button>
                  </>
                )}
                {proposal.status === 'changes-requested' && <button onClick={() => transitionProposal(proposal.id, 'ready-for-review')} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Nuova versione pronta</button>}
                {(proposal.status === 'rejected' || proposal.status === 'withdrawn') && <button onClick={() => transitionProposal(proposal.id, 'archived')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">Archivia</button>}
              </div>

              {proposal.status === 'accepted-for-decision' && version && (
                <div className="border-t border-emerald-100 p-3 sm:p-4">
                  <InstitutionalDecisionPanel proposal={proposal} version={version} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </details>
  );
}

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
    discipline,
    order,
  } = useCurriculumStore();

  const filtered = filterProposals(currentDisciplineProps, decisions, activeRevisionFilter);
  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, Math.max(0, filtered.length - 1)));
  const current = filtered[safeIndex];
  const currentDecision = current ? decisions[current.id] : undefined;
  const currentCustomText = current ? customTexts[current.id] || '' : '';

  const moveTo = (next: number) => {
    setRevisioneWizardIndex(Math.max(0, Math.min(filtered.length - 1, next)));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4 fade-in pb-24 text-left sm:pb-6" data-revision-flow="focused">
      <header className="sticky top-16 z-30 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-4" data-revision-sticky-context>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Milestone className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
              <h1 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">Revisione del Curricolo: Gap 2025</h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">Confronta una scheda alla volta. La scelta locale non è una decisione ufficiale.</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{currentDisciplineDecided}/{currentDisciplineProps.length}</span>
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto pb-1 text-xs font-semibold" aria-label="Filtra revisioni">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => { setActiveRevisionFilter(filter); setRevisioneWizardIndex(0); }}
              className={`shrink-0 rounded-full px-3 py-1.5 transition ${activeRevisionFilter === filter ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {filter === 'all' ? 'Tutte' : filter === 'pending' ? 'Da rivedere' : filter === 'approved' ? 'Proposte' : 'Precedenti'}
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
              <span className="mt-1 block text-[11px] text-slate-500">{current.id.toUpperCase()}</span>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${currentDecision ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
              {currentDecision === 'approved' ? 'Testo 2025' : currentDecision === 'rejected' ? 'Testo 2012' : currentDecision === 'custom' ? 'Personalizzato' : 'Da rivedere'}
            </span>
          </header>

          <div className="space-y-3 p-4">
            <article className="rounded-xl bg-slate-50 p-3">
              <strong className="text-[10px] uppercase tracking-wide text-slate-500">Testo precedente · D.M. 254/2012</strong>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{current.oldText}</p>
            </article>
            <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
              <strong className="text-[10px] uppercase tracking-wide text-indigo-600">Testo proposto · D.M. 221/2025</strong>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">{current.newText}</p>
            </article>

            {currentDecision === 'custom' && (
              <div>
                <label htmlFor={`custom-${current.id}`} className="text-xs font-bold text-slate-700">La tua proposta locale</label>
                <textarea
                  id={`custom-${current.id}`}
                  value={currentCustomText}
                  onChange={(event) => setCustomText(current.id, event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/30"
                  placeholder="Scrivi una proposta da sottoporre a revisione…"
                />
              </div>
            )}
          </div>

          <div className="sticky bottom-16 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:static" data-revision-sticky-actions>
            <p className="mb-2 text-xs font-semibold text-slate-600">Quale testo vuoi portare avanti come scelta locale?</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setDecision(current.id, 'approved')} className={`rounded-xl px-2 py-2.5 text-xs font-bold ${currentDecision === 'approved' ? 'bg-emerald-700 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Usa testo 2025</button>
              <button type="button" onClick={() => setDecision(current.id, 'rejected')} className={`rounded-xl px-2 py-2.5 text-xs font-bold ${currentDecision === 'rejected' ? 'bg-rose-700 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Mantieni 2012</button>
              <button type="button" onClick={() => setDecision(current.id, 'custom')} className={`rounded-xl px-2 py-2.5 text-xs font-bold ${currentDecision === 'custom' ? 'bg-amber-500 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Personalizza</button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button type="button" disabled={safeIndex === 0} onClick={() => moveTo(safeIndex - 1)} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-30"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Precedente</button>
              {currentDecision && <button type="button" onClick={() => resetDecision(current.id)} className="px-2 py-2 text-xs font-semibold text-slate-500">Annulla</button>}
              <button type="button" disabled={safeIndex === filtered.length - 1} onClick={() => moveTo(safeIndex + 1)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-700 px-3 py-2.5 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">Successivo<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
        </section>
      ) : (
        <UiEmptyState icon={FileSearch} title="Nessuna variazione da mostrare" description="Non ci sono schede corrispondenti al filtro selezionato." />
      )}

      <StructuredProposalStarter
        proposals={currentDisciplineProps}
        decisions={decisions}
        customTexts={customTexts}
        discipline={discipline}
        order={order}
      />

      <CanonicalProposalsSection />

      <details className="rounded-2xl border border-slate-200 bg-white" data-revision-secondary="help">
        <summary className="cursor-pointer list-none p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Info className="h-4 w-4 text-amber-500" aria-hidden="true" />Come funziona questa revisione</div>
        </summary>
        <div className="border-t border-slate-100 p-4 text-xs leading-relaxed text-slate-600">
          Le tre scelte servono a preparare il lavoro. Non sono voti né approvazioni. Una proposta strutturata segue poi il proprio percorso di revisione; l’eventuale decisione istituzionale è separata e richiede identità e autorità verificate.
        </div>
      </details>
    </div>
  );
}
