import React from 'react';
import { ChevronLeft, ChevronRight, FileSearch, History, Info, Layers, Milestone, Sparkles } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { UiEmptyState } from '../../../ui/components/UiEmptyState';
import type { DecisionStatus, Proposal } from '../../../types/curriculum';
import type { AppViewsLayerProps } from '../../session';
import {
  PROPOSAL_STATUS_LABELS,
  DECISION_OUTCOME_LABELS,
  DECISION_STATUS_LABELS,
} from '../../../domain/revision/vocabularies';
import { getLatestProposalVersion, findDecisionsByProposal, getEventsByProposal } from '../../../domain/revision';
import type { RevisionProposal } from '../../../domain/revision';
import { transitionProposalStatus } from '../../../domain/revision/repository';
import type { EntityId } from '../../../domain/curriculum/identity/types';
import { HumanTaskSummary, evaluateRevisionHumanTask } from '../../guided-workflow';
import { InstitutionalDecisionPanel, StructuredProposalStarter } from '../../beta';

function useCanonicalRevisionActions() {
  const { revisionArchive, replaceRevisionArchive } = useCurriculumStore();

  const transitionProposal = (proposalId: string, newStatus: RevisionProposal['status'], rationale?: string) => {
    const result = transitionProposalStatus(
      revisionArchive,
      proposalId as EntityId,
      newStatus,
      undefined,
      rationale,
    );
    if (result.success) replaceRevisionArchive(result.archive);
    return result;
  };

  return { transitionProposal };
}

function CanonicalProposalsSection() {
  const { revisionArchive } = useCurriculumStore();
  const { transitionProposal } = useCanonicalRevisionActions();
  const proposals = revisionArchive.proposals.filter((proposal) => proposal.status !== 'legacy');

  if (proposals.length === 0) return null;

  return (
    <section aria-label="Proposte strutturate" className="space-y-3" data-hia-task-block="structured-proposals">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
        <Layers className="h-4 w-4 text-indigo-500" aria-hidden="true" />
        <h2>Proposte strutturate</h2>
        <span className="text-xs font-normal text-slate-500">Registro locale</span>
      </div>

      {proposals.map((proposal) => {
        const version = getLatestProposalVersion(revisionArchive, proposal);
        const decisions = findDecisionsByProposal(revisionArchive, proposal.id);
        const latestDecision = decisions.length > 0 ? decisions[decisions.length - 1] : undefined;
        const events = getEventsByProposal(revisionArchive, proposal.id);
        const statusLabel = PROPOSAL_STATUS_LABELS[proposal.status];
        const nodeLabel = proposal.targetNodeRef.snapshotLabel || proposal.targetNodeRef.id;
        const humanTask = evaluateRevisionHumanTask(proposal);
        const decisionFocused = proposal.status === 'accepted-for-decision' && Boolean(version);

        return (
          <article key={proposal.id} className="overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-3">
              <div className="min-w-0">
                <strong className="block text-sm text-slate-900">{nodeLabel}</strong>
                <span className="text-xs font-semibold text-slate-600">{statusLabel}</span>
              </div>
              <span className="shrink-0 text-xs text-slate-500">v{version?.versionNumber ?? 1}</span>
            </header>

            {decisionFocused && version && (
              <div className="border-b border-indigo-100 p-3 sm:p-4" data-hia-task-block="institutional-decision">
                <p className="mb-3 max-w-[75ch] text-sm font-semibold text-slate-700">
                  Prossimo passo: verifica autorità, conseguenza ed esito prima di registrare una decisione istituzionale.
                </p>
                <InstitutionalDecisionPanel proposal={proposal} version={version} />
              </div>
            )}

            <details defaultOpen={!decisionFocused} className="border-b border-slate-100">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Contenuto, motivazione e provenienza
              </summary>
              <div className="space-y-3 px-4 pb-4">
                <HumanTaskSummary projection={humanTask.projection} receipt={humanTask.receipt} />

                <div className="grid grid-cols-1 gap-3 text-sm leading-relaxed md:grid-cols-2">
                  <div className="space-y-1">
                    <strong className="block text-xs uppercase text-slate-500">Testo vigente</strong>
                    <p className="rounded-lg border bg-slate-50 p-3 italic">“{proposal.currentTextSnapshot}”</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="block text-xs uppercase text-indigo-700">Testo proposto</strong>
                    <p className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">“{version?.proposedText ?? proposal.proposedText}”</p>
                  </div>
                </div>

                {proposal.rationale && (
                  <div>
                    <strong className="text-xs uppercase text-slate-500">Motivazione</strong>
                    <p className="mt-1 max-w-[75ch] text-sm leading-relaxed text-slate-700">{proposal.rationale}</p>
                  </div>
                )}

                {latestDecision && (
                  <div className="text-sm">
                    <strong className="text-xs uppercase text-slate-500">
                      Decisione: {DECISION_STATUS_LABELS[latestDecision.status]}
                    </strong>
                    <p className="mt-1 text-slate-700">
                      {DECISION_OUTCOME_LABELS[latestDecision.outcome]} — {latestDecision.authority.declaredRole}
                      {latestDecision.rationale && ` — ${latestDecision.rationale}`}
                    </p>
                  </div>
                )}

                {events.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                      <History className="mr-1 inline h-3 w-3" aria-hidden="true" />
                      Registro locale ({events.length} eventi)
                    </summary>
                    <div className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-500">
                      {events.slice(-5).reverse().map((event) => (
                        <div key={event.id} className="flex gap-2">
                          <span className="shrink-0 text-slate-400">{event.timestamp.slice(11, 19)}</span>
                          <span>{event.eventType}{event.rationale ? ` — ${event.rationale.slice(0, 60)}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </details>

            {!decisionFocused && (
              <div className="flex flex-wrap gap-2 bg-slate-50 px-4 py-3">
                {proposal.status === 'draft' && (
                  <>
                    <button
                      data-hia-primary-action="revision-prepare"
                      onClick={() => transitionProposal(proposal.id, 'ready-for-review', proposal.rationale || undefined)}
                      className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!proposal.rationale}
                      title={!proposal.rationale ? 'Motivazione richiesta' : undefined}
                    >
                      Prepara per revisione
                    </button>
                    <button
                      data-hia-support-action
                      onClick={() => transitionProposal(proposal.id, 'archived')}
                      className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                    >
                      Archivia
                    </button>
                    {!proposal.rationale && <span className="self-center text-xs text-amber-700">Motivazione obbligatoria</span>}
                  </>
                )}

                {proposal.status === 'ready-for-review' && (
                  <button
                    data-hia-primary-action="revision-submit"
                    onClick={() => transitionProposal(proposal.id, 'submitted')}
                    className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Invia
                  </button>
                )}

                {proposal.status === 'submitted' && (
                  <>
                    <button
                      data-hia-primary-action="revision-take-over"
                      onClick={() => transitionProposal(proposal.id, 'under-review')}
                      className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      Prendi in carico
                    </button>
                    <button
                      data-hia-support-action
                      onClick={() => transitionProposal(proposal.id, 'withdrawn')}
                      className="rounded-lg bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700"
                    >
                      Ritira
                    </button>
                  </>
                )}

                {proposal.status === 'under-review' && (
                  <>
                    <button
                      data-hia-primary-action="revision-admit-decision"
                      onClick={() => transitionProposal(proposal.id, 'accepted-for-decision')}
                      className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      Ammetti alla decisione
                    </button>
                    <button
                      data-hia-support-action
                      onClick={() => transitionProposal(proposal.id, 'changes-requested', 'Modifiche richieste dal revisore')}
                      className="rounded-lg bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-900"
                    >
                      Richiedi modifiche
                    </button>
                    <button
                      data-hia-support-action
                      onClick={() => transitionProposal(proposal.id, 'rejected')}
                      className="rounded-lg bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700"
                    >
                      Rigetta
                    </button>
                  </>
                )}

                {proposal.status === 'changes-requested' && (
                  <>
                    <button
                      data-hia-primary-action="revision-new-version"
                      onClick={() => transitionProposal(proposal.id, 'ready-for-review')}
                      className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      Nuova versione pronta
                    </button>
                    <button
                      data-hia-support-action
                      onClick={() => transitionProposal(proposal.id, 'withdrawn')}
                      className="rounded-lg bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700"
                    >
                      Ritira
                    </button>
                  </>
                )}

                {proposal.status === 'rejected' && (
                  <button
                    data-hia-primary-action="revision-archive-rejected"
                    onClick={() => transitionProposal(proposal.id, 'archived')}
                    className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                  >
                    Archivia
                  </button>
                )}

                {proposal.status === 'withdrawn' && (
                  <button
                    data-hia-primary-action="revision-archive-withdrawn"
                    onClick={() => transitionProposal(proposal.id, 'archived')}
                    className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                  >
                    Archivia
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </section>
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

export function RevisioneTab({
  currentDisciplineProps,
  currentDisciplineDecided,
  revisioneMode,
  setRevisioneMode,
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
    revisionArchive,
  } = useCurriculumStore();

  const hasStructuredProposals = revisionArchive.proposals.some((proposal) => proposal.status !== 'legacy');

  return (
    <div className="mx-auto max-w-5xl space-y-4 text-left fade-in" data-hia-task-surface="revision">
      <section className="rounded-2xl border border-slate-200 bg-white p-4" data-hia-task-block="orientation">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">
              <Milestone className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
              <span>Revisione del Curricolo: Gap 2025</span>
            </h1>
            <p className="mt-1 max-w-[75ch] text-sm leading-relaxed text-slate-600">
              Confronta i testi, registra una scelta locale e trasformala in proposta quando serve.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {currentDisciplineDecided}/{currentDisciplineProps.length}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <div className="min-w-0">
            <strong>Confine:</strong> una scelta locale non è un voto, un’approvazione o un’adozione istituzionale.
            <details className="mt-1">
              <summary className="cursor-pointer text-xs font-semibold text-amber-900">Come funziona</summary>
              <p className="mt-1 max-w-[75ch] text-sm leading-relaxed">
                Puoi usare il testo 2025, mantenere il testo 2012 oppure personalizzare. Solo una scelta di modifica può diventare una proposta strutturata.
              </p>
            </details>
          </div>
        </div>
      </section>

      <StructuredProposalStarter
        proposals={currentDisciplineProps}
        decisions={decisions}
        customTexts={customTexts}
        discipline={discipline}
        order={order}
      />

      <CanonicalProposalsSection />

      <details
        id="local-choice-workspace"
        defaultOpen={!hasStructuredProposals}
        className="rounded-2xl border border-slate-200 bg-white"
        data-hia-task-block="local-choice-workspace"
      >
        <summary className="cursor-pointer list-none p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              <div>
                <strong className="block text-sm text-slate-900">Scelte locali di confronto</strong>
                <span className="text-xs text-slate-500">Apri il registro completo solo quando serve.</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">{currentDisciplineDecided}/{currentDisciplineProps.length}</span>
          </div>
        </summary>

        <div className="space-y-4 border-t border-slate-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-700">Modalità di confronto</div>
            <div className="flex self-stretch rounded-xl bg-slate-100 p-1 text-sm font-bold sm:self-auto">
              <button
                onClick={() => setRevisioneMode('list')}
                className={`flex-1 rounded-lg px-3 py-2 transition sm:flex-initial ${revisioneMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Elenco completo
              </button>
              <button
                onClick={() => {
                  setRevisioneMode('wizard');
                  setRevisioneWizardIndex(0);
                }}
                className={`flex-1 rounded-lg px-3 py-2 transition sm:flex-initial ${revisioneMode === 'wizard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Passo-passo
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm font-semibold text-slate-600">
            <span className="px-1">Filtro:</span>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveRevisionFilter(filter);
                  setRevisioneWizardIndex(0);
                }}
                className={`rounded-lg px-3 py-2 transition ${activeRevisionFilter === filter ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100'}`}
              >
                {filter === 'all' ? 'Tutte' : filter === 'pending' ? 'Senza scelta' : filter === 'approved' ? 'Testo proposto' : 'Testo precedente'}
              </button>
            ))}
          </div>

          {revisioneMode === 'list' ? (
            <RevisionList
              currentDisciplineProps={currentDisciplineProps}
              activeRevisionFilter={activeRevisionFilter}
              decisions={decisions}
              customTexts={customTexts}
              setDecision={setDecision}
              resetDecision={resetDecision}
              setCustomText={setCustomText}
            />
          ) : (
            <RevisioneWizard
              currentDisciplineProps={currentDisciplineProps}
              activeRevisionFilter={activeRevisionFilter}
              decisions={decisions}
              customTexts={customTexts}
              revisioneWizardIndex={revisioneWizardIndex}
              setRevisioneWizardIndex={setRevisioneWizardIndex}
              setDecision={setDecision}
              resetDecision={resetDecision}
              setCustomText={setCustomText}
            />
          )}
        </div>
      </details>
    </div>
  );
}

interface RevisionChoiceProps {
  currentDisciplineProps: Proposal[];
  activeRevisionFilter: string;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  setDecision: (id: string, status: DecisionStatus) => void;
  resetDecision: (id: string) => void;
  setCustomText: (id: string, text: string) => void;
}

function filterRevisionProps(
  proposals: Proposal[],
  activeRevisionFilter: string,
  decisions: Record<string, DecisionStatus>,
) {
  return proposals.filter((proposal) => {
    const status = decisions[proposal.id];
    if (activeRevisionFilter === 'pending' && status) return false;
    if (activeRevisionFilter === 'approved' && status !== 'approved' && status !== 'custom') return false;
    if (activeRevisionFilter === 'rejected' && status !== 'rejected') return false;
    return true;
  });
}

function RevisionList({
  currentDisciplineProps,
  activeRevisionFilter,
  decisions,
  customTexts,
  setDecision,
  resetDecision,
  setCustomText,
}: RevisionChoiceProps) {
  const filteredList = filterRevisionProps(currentDisciplineProps, activeRevisionFilter, decisions);

  if (filteredList.length === 0) {
    return (
      <UiEmptyState
        icon={FileSearch}
        title="Nessuna variazione da mostrare"
        description="Non ci sono schede corrispondenti alla categoria selezionata."
      />
    );
  }

  return (
    <div id="gap-comparison-container" className="space-y-4">
      {filteredList.map((proposal) => {
        const status = decisions[proposal.id];
        const customText = customTexts[proposal.id] || '';
        const borderClass = status === 'approved'
          ? 'border-emerald-500'
          : status === 'rejected'
            ? 'border-rose-400'
            : status === 'custom'
              ? 'border-amber-500'
              : 'border-slate-200';

        return (
          <article key={proposal.id} className={`overflow-hidden rounded-xl border-2 bg-white ${borderClass}`}>
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              <span>{proposal.focus}</span>
              <span className="text-xs text-slate-500">
                {status === 'approved' ? 'Testo 2025' : status === 'rejected' ? 'Testo 2012' : status === 'custom' ? 'Personalizzato' : 'Senza scelta'}
              </span>
            </header>

            <div className="grid grid-cols-1 gap-3 p-4 text-sm leading-relaxed md:grid-cols-2">
              <div className="space-y-1">
                <strong className="block text-xs uppercase text-slate-500">DM 254/2012</strong>
                <p className="rounded-lg border bg-slate-50 p-3 italic">“{proposal.oldText}”</p>
              </div>
              <div className="space-y-1">
                <strong className="block text-xs uppercase text-indigo-700">DM 221/2025</strong>
                <p className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">“{proposal.newText}”</p>
              </div>
            </div>

            {status === 'custom' && (
              <div className="border-t border-slate-100 bg-amber-50/20 p-4">
                <textarea
                  value={customText}
                  onChange={(event) => setCustomText(proposal.id, event.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-white p-3 text-sm"
                  rows={3}
                  placeholder="Scrivi la proposta personalizzata..."
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3">
              <button onClick={() => setDecision(proposal.id, 'approved')} className="rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white">Usa testo 2025</button>
              <button onClick={() => setDecision(proposal.id, 'rejected')} className="rounded-lg bg-rose-700 px-3 py-2.5 text-sm font-bold text-white">Mantieni 2012</button>
              <button onClick={() => setDecision(proposal.id, 'custom')} className="rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-bold text-white">Personalizza</button>
              {status && <button onClick={() => resetDecision(proposal.id)} className="px-3 py-2 text-sm font-semibold text-slate-500">Annulla</button>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

interface RevisioneWizardProps extends RevisionChoiceProps {
  revisioneWizardIndex: number;
  setRevisioneWizardIndex: React.Dispatch<React.SetStateAction<number>>;
}

function RevisioneWizard({
  currentDisciplineProps,
  activeRevisionFilter,
  decisions,
  customTexts,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
  setDecision,
  resetDecision,
  setCustomText,
}: RevisioneWizardProps) {
  const filteredProps = filterRevisionProps(currentDisciplineProps, activeRevisionFilter, decisions);

  if (filteredProps.length === 0) {
    return (
      <UiEmptyState
        icon={FileSearch}
        title="Nessuna variazione da mostrare"
        description="Non ci sono schede corrispondenti alla categoria selezionata."
      />
    );
  }

  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, filteredProps.length - 1));
  const proposal = filteredProps[safeIndex];
  const status = decisions[proposal.id];
  const customText = customTexts[proposal.id] || '';
  const borderClass = status === 'approved'
    ? 'border-emerald-500'
    : status === 'rejected'
      ? 'border-rose-400'
      : status === 'custom'
        ? 'border-amber-500'
        : 'border-slate-200';

  return (
    <article className={`overflow-hidden rounded-2xl border-2 bg-white ${borderClass}`}>
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <strong className="text-sm text-slate-900">{proposal.focus}</strong>
        <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
          {safeIndex + 1}/{filteredProps.length}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 p-4 text-sm leading-relaxed md:grid-cols-2">
        <div className="space-y-1">
          <strong className="block text-xs uppercase text-slate-500">DM 254/2012</strong>
          <p className="rounded-xl border bg-slate-50 p-3 italic">“{proposal.oldText}”</p>
        </div>
        <div className="space-y-1">
          <strong className="block text-xs uppercase text-indigo-700">DM 221/2025</strong>
          <p className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">“{proposal.newText}”</p>
        </div>
      </div>

      {status === 'custom' && (
        <div className="border-t border-slate-100 bg-amber-50/20 p-4">
          <label className="mb-2 block text-sm font-semibold text-amber-900">Proposta personale locale</label>
          <textarea
            value={customText}
            onChange={(event) => setCustomText(proposal.id, event.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm"
            rows={3}
            placeholder="Digita una modifica locale non verificata..."
          />
        </div>
      )}

      <div className="space-y-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDecision(proposal.id, 'approved')} className={`rounded-lg px-3 py-2.5 text-sm font-bold ${status === 'approved' ? 'bg-emerald-700 text-white' : 'border bg-white text-slate-700'}`}>Usa testo 2025</button>
          <button onClick={() => setDecision(proposal.id, 'rejected')} className={`rounded-lg px-3 py-2.5 text-sm font-bold ${status === 'rejected' ? 'bg-rose-700 text-white' : 'border bg-white text-slate-700'}`}>Mantieni 2012</button>
          <button onClick={() => setDecision(proposal.id, 'custom')} className={`rounded-lg px-3 py-2.5 text-sm font-bold ${status === 'custom' ? 'bg-amber-500 text-white' : 'border bg-white text-slate-700'}`}>Personalizza</button>
          {status && <button onClick={() => resetDecision(proposal.id)} className="px-3 py-2 text-sm font-semibold text-slate-500">Annulla</button>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRevisioneWizardIndex((previous) => Math.max(0, previous - 1))}
            disabled={safeIndex === 0}
            className="flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40 sm:flex-initial"
          >
            <ChevronLeft className="mr-1 inline h-4 w-4" aria-hidden="true" />
            Precedente
          </button>
          <button
            onClick={() => setRevisioneWizardIndex((previous) => Math.min(filteredProps.length - 1, previous + 1))}
            disabled={safeIndex === filteredProps.length - 1}
            className="flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40 sm:flex-initial"
          >
            Successivo
            <ChevronRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
