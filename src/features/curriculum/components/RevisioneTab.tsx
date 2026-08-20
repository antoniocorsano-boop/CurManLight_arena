import React from 'react';
import { Milestone, Info, Sparkles, ChevronLeft, ChevronRight, FileSearch, Layers, History } from 'lucide-react';
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
import { addProposal } from '../../../domain/revision/repository';
import { createEntityReference } from '../../../domain/curriculum/identity';
import type { EntityId } from '../../../domain/curriculum/identity/types';
import { InstitutionalRevisionWorkflowPanel } from './InstitutionalRevisionWorkflowPanel';

// ─── Canonical Proposal Actions (no double-write) ────────────────────────

function useCanonicalRevisionActions() {
  const { revisionArchive, replaceRevisionArchive } = useCurriculumStore();

  const transitionProposal = (proposalId: string, newStatus: RevisionProposal['status'], rationale?: string) => {
    const prev = revisionArchive;
    const result = transitionProposalStatus(prev, proposalId as EntityId, newStatus, undefined, rationale);
    if (result.success) {
      replaceRevisionArchive(result.archive);
    }
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
    if (result.success) {
      replaceRevisionArchive(result.archive);
    }
    return result;
  };

  return { transitionProposal, createDraft };
}

// ─── Canonical Proposals Section ─────────────────────────────────────────

function CanonicalProposalsSection() {
  const { revisionArchive } = useCurriculumStore();
  const { transitionProposal } = useCanonicalRevisionActions();
  const proposals = revisionArchive.proposals.filter(p => p.status !== 'legacy');

  if (proposals.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Proposte strutturate</span>
          <span className="text-[10px] font-normal text-slate-500">— Registro locale, non protocollo ufficiale</span>
        </h2>
        <UiEmptyState
          icon={Layers}
          title="Nessuna proposta canonica"
          description="Le proposte di revisione create con il nuovo modello appariranno qui. Le valutazioni personali precedenti sono nella sezione sottostante."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
        <Layers className="w-4 h-4 text-indigo-500" />
        <span>Proposte strutturate</span>
        <span className="text-[10px] font-normal text-slate-500">— Registro locale, non protocollo ufficiale</span>
      </h2>

      {proposals.map(proposal => {
        const version = getLatestProposalVersion(revisionArchive, proposal);
        const decisions = findDecisionsByProposal(revisionArchive, proposal.id);
        const latestDecision = decisions.length > 0 ? decisions[decisions.length - 1] : undefined;
        const events = getEventsByProposal(revisionArchive, proposal.id);

        const statusLabel = PROPOSAL_STATUS_LABELS[proposal.status];
        const nodeLabel = proposal.targetNodeRef.snapshotLabel || proposal.targetNodeRef.id;

        return (
          <div key={proposal.id} className="bg-white border-2 border-indigo-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center space-x-2">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">{nodeLabel}</span>
                <span className="text-slate-600">{statusLabel}</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                v{version?.versionNumber ?? 1} | {proposal.metadata.createdAt.slice(0, 10)}
              </span>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 text-xs leading-relaxed">
              <div className="space-y-1">
                <strong className="text-slate-400 block text-[9px] uppercase">Testo vigente</strong>
                <p className="bg-slate-50 p-2.5 border rounded-lg italic">"{proposal.currentTextSnapshot}"</p>
              </div>
              <div className="space-y-1">
                <strong className="text-slate-400 block text-[9px] uppercase">Testo proposto</strong>
                <p className="bg-indigo-50/30 p-2.5 border border-indigo-100 rounded-lg">"{version?.proposedText ?? proposal.proposedText}"</p>
              </div>
            </div>

            {/* Rationale */}
            {proposal.rationale && (
              <div className="px-4 pb-3">
                <strong className="text-[9px] uppercase text-slate-400">Motivazione</strong>
                <p className="text-xs text-slate-600 mt-0.5">{proposal.rationale}</p>
              </div>
            )}

            {/* Decisions */}
            {latestDecision && (
              <div className="px-4 pb-3 text-xs">
                <strong className="text-[9px] uppercase text-slate-400">
                  Decisione: {DECISION_STATUS_LABELS[latestDecision.status]}
                </strong>
                <p className="text-slate-600 mt-0.5">
                  {DECISION_OUTCOME_LABELS[latestDecision.outcome]} — {latestDecision.authority.declaredRole}
                  {latestDecision.rationale && ` — ${latestDecision.rationale}`}
                </p>
              </div>
            )}

            {/* Event history (minimal) */}
            {events.length > 0 && (
              <details className="px-4 pb-3">
                <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600">
                  <History className="w-3 h-3 inline mr-1" />
                  Registro locale ({events.length} eventi)
                </summary>
                <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto text-[10px] text-slate-500">
                  {events.slice(-5).reverse().map(e => (
                    <div key={e.id} className="flex space-x-2">
                      <span className="text-slate-400 shrink-0">{e.timestamp.slice(11, 19)}</span>
                      <span>{e.eventType}{e.rationale ? ` — ${e.rationale.slice(0, 60)}` : ''}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* State-aware actions */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex flex-wrap gap-1.5">
              {proposal.status === 'draft' && (
                <>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'ready-for-review', proposal.rationale || undefined)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-xs transition"
                    disabled={!proposal.rationale}
                    title={!proposal.rationale ? 'Motivazione richiesta' : undefined}
                  >
                    Prepara per revisione
                  </button>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'archived')}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
                  >
                    Archivia
                  </button>
                  {!proposal.rationale && (
                    <span className="text-[10px] text-amber-600 self-center">⚠ Motivazione obbligatoria</span>
                  )}
                </>
              )}
              {proposal.status === 'ready-for-review' && (
                <button
                  onClick={() => transitionProposal(proposal.id, 'submitted')}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-xs transition"
                >
                  Invia
                </button>
              )}
              {proposal.status === 'submitted' && (
                <>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'under-review')}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-xs transition"
                  >
                    Prendi in carico
                  </button>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'withdrawn')}
                    className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded text-xs transition"
                  >
                    Ritira
                  </button>
                </>
              )}
              {proposal.status === 'under-review' && (
                <>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'changes-requested', 'Modifiche richieste dal revisore')}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded text-xs transition"
                  >
                    Richiedi modifiche
                  </button>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'accepted-for-decision')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition"
                  >
                    Ammetti alla decisione
                  </button>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'rejected')}
                    className="px-2.5 py-1 bg-rose-200 hover:bg-rose-300 text-rose-700 font-bold rounded text-xs transition"
                  >
                    Rigetta
                  </button>
                </>
              )}
              {proposal.status === 'changes-requested' && (
                <>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'ready-for-review')}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-xs transition"
                  >
                    Nuova versione pronta
                  </button>
                  <button
                    onClick={() => transitionProposal(proposal.id, 'withdrawn')}
                    className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded text-xs transition"
                  >
                    Ritira
                  </button>
                </>
              )}
              {proposal.status === 'accepted-for-decision' && (
                <span className="text-[10px] text-slate-500 self-center">
                  In attesa di registrazione decisione — usare il pannello decisioni
                </span>
              )}
              {proposal.status === 'rejected' && (
                <button
                  onClick={() => transitionProposal(proposal.id, 'archived')}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
                >
                  Archivia
                </button>
              )}
              {proposal.status === 'withdrawn' && (
                <button
                  onClick={() => transitionProposal(proposal.id, 'archived')}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
                >
                  Archivia
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main RevisioneTab ───────────────────────────────────────────────────

export type RevisioneTabProps = Pick<AppViewsLayerProps,
  | 'currentDisciplineProps'
  | 'currentDisciplineDecided'
  | 'revisioneMode'
  | 'setRevisioneMode'
  | 'revisioneWizardIndex'
  | 'setRevisioneWizardIndex'
  | 'curriculumVersions'
>;

export function RevisioneTab({
  currentDisciplineProps,
  currentDisciplineDecided,
  revisioneMode,
  setRevisioneMode,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
  curriculumVersions,
}: RevisioneTabProps) {
  const { decisions, customTexts, revisionArchive, activeRevisionFilter, setActiveRevisionFilter, setDecision, resetDecision, setCustomText } = useCurriculumStore();

  return (
    <div className="space-y-6 fade-in text-left">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
            <Milestone className="w-5 h-5 text-amber-500" />
            <span>Revisione del Curricolo: Gap 2025</span>
          </h1>
          <p className="text-[11px] text-slate-500">Confronta i testi e registra proposte locali non autoritative.</p>
        </div>
        <span className="font-extrabold text-slate-700 text-xs">{currentDisciplineDecided}/{currentDisciplineProps.length} scelte locali</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3 leading-relaxed">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Istruzioni operative:</strong> registra una scelta locale tra <strong>Usa testo 2025</strong>, <strong>Mantieni testo 2012</strong> o una proposta personalizzata. Nessuna scelta costituisce voto o approvazione.
        </div>
      </div>

      {/* Gradual Transition Banner */}
      <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 text-xs text-indigo-950 flex items-start space-x-3 leading-relaxed shadow-sm">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <strong className="text-indigo-950 font-black block uppercase text-[10px] tracking-wider">Scelte locali di confronto</strong>
          <p className="font-semibold text-slate-700 leading-normal">Le scelte registrate sono note di lavoro non obbligatorie e non determinano applicabilità o adozione.</p>
        </div>
      </div>

      {/* Canonical Proposals Section */}
      <CanonicalProposalsSection />

      <InstitutionalRevisionWorkflowPanel
        revisionArchive={revisionArchive}
        versions={curriculumVersions ?? []}
      />

      {/* Layout selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Riepilogo delle scelte locali</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Scegli come esaminare le proposte e registrare note locali</div>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-bold shadow-sm self-stretch sm:self-auto">
          <button onClick={() => setRevisioneMode('list')} className={`px-3 py-1.5 rounded-lg transition ${revisioneMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Elenco Completo</button>
          <button onClick={() => { setRevisioneMode('wizard'); setRevisioneWizardIndex(0); }} className={`px-3 py-1.5 rounded-lg transition ${revisioneMode === 'wizard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Passo-Passo (Monoscheda)</button>
        </div>
      </div>

      {/* Revision Filters */}
      <div className="flex items-center space-x-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
        <span className="mx-2">Filtro:</span>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => { setActiveRevisionFilter(f); setRevisioneWizardIndex(0); }} className={`px-2.5 py-1 rounded-lg transition ${activeRevisionFilter === f ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100'}`}>
            {f === 'all' ? 'Tutte' : f === 'pending' ? 'Senza scelta' : f === 'approved' ? 'Testo proposto' : 'Testo precedente'}
          </button>
        ))}
      </div>

      {revisioneMode === 'list' ? (
        /* Stack comparison cards */
        (() => {
          const filteredList = currentDisciplineProps.filter(p => {
            const s = decisions[p.id];
            if (activeRevisionFilter === 'pending' && s) return false;
            if (activeRevisionFilter === 'approved' && s !== 'approved' && s !== 'custom') return false;
            if (activeRevisionFilter === 'rejected' && s !== 'rejected') return false;
            return true;
          });
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
          {filteredList.map(p => {
            const s = decisions[p.id];
            const cText = customTexts[p.id] || "";
            let cardBorder = "border-slate-200";
            if (s === 'approved') cardBorder = "border-emerald-500 shadow-md shadow-emerald-500/5";
            else if (s === 'rejected') cardBorder = "border-rose-400";
            else if (s === 'custom') cardBorder = "border-amber-500 shadow-md shadow-amber-500/5";

            return (
              <div key={p.id} className={`bg-white border-2 ${cardBorder} rounded-xl overflow-hidden transition-all duration-200`}>
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-2">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">{p.id.toUpperCase()}</span>
                    <span>{p.focus}</span>
                  </span>
                  <span>{s === 'approved' ? 'Scelta: testo proposto' : s === 'rejected' ? 'Scelta: testo precedente' : s === 'custom' ? 'Scelta: personalizzato' : 'Senza scelta'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-xs leading-relaxed">
                  <div className="space-y-1">
                    <strong className="text-slate-400 block text-[9px] uppercase">DM 254/2012 (Vigente)</strong>
                    <p className="bg-slate-50 p-2.5 border rounded-lg italic">"{p.oldText}"</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-400 block text-[9px] uppercase">DM 221/2025 (Proposta)</strong>
                    <p className="bg-indigo-50/30 p-2.5 border border-indigo-100 rounded-lg">"{p.newText}"</p>
                  </div>
                </div>
                {s === 'custom' && (
                  <div className="p-4 border-t border-slate-100 bg-amber-50/20">
                    <textarea value={cText} onChange={(e) => setCustomText(p.id, e.target.value)} className="w-full border border-amber-200 rounded-lg p-2.5 text-xs bg-white" rows={2} placeholder="Scrivi la tua proposta personalizzata..." />
                  </div>
                )}
                <div className="bg-slate-50/50 border-t border-slate-100 px-4 py-2 flex justify-between items-center gap-2">
                  <div className="flex space-x-1.5">
                    <button onClick={() => setDecision(p.id, 'approved')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition">Usa testo 2025</button>
                    <button onClick={() => setDecision(p.id, 'rejected')} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs transition">Mantieni 2012</button>
                    <button onClick={() => setDecision(p.id, 'custom')} className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded text-xs transition">Modifica</button>
                  </div>
                  {s && <button onClick={() => resetDecision(p.id)} className="text-slate-400 hover:text-slate-600 text-xs">Annulla</button>}
                </div>
              </div>
            );
          })}
        </div>
          );
        })()
      ) : (
        /* Step-by-Step Wizard */
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
  );
}

interface RevisioneWizardProps {
  currentDisciplineProps: Proposal[];
  activeRevisionFilter: string;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  revisioneWizardIndex: number;
  setRevisioneWizardIndex: React.Dispatch<React.SetStateAction<number>>;
  setDecision: (id: string, status: DecisionStatus) => void;
  resetDecision: (id: string) => void;
  setCustomText: (id: string, text: string) => void;
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
  const filteredProps = currentDisciplineProps.filter(p => {
    const s = decisions[p.id];
    if (activeRevisionFilter === 'pending' && s) return false;
    if (activeRevisionFilter === 'approved' && s !== 'approved' && s !== 'custom') return false;
    if (activeRevisionFilter === 'rejected' && s !== 'rejected') return false;
    return true;
  });

  if (filteredProps.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed rounded-3xl p-8 text-center space-y-3.5">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-sm">Nessuna variazione da mostrare</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">Non ci sono schede corrispondenti alla categoria selezionata.</p>
        </div>
      </div>
    );
  }

  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, filteredProps.length - 1));
  const p = filteredProps[safeIndex];
  const s = decisions[p.id];
  const cText = customTexts[p.id] || "";

  let cardBorder = "border-slate-200";
  if (s === 'approved') cardBorder = "border-emerald-500 shadow-md shadow-emerald-500/10";
  else if (s === 'rejected') cardBorder = "border-rose-400 shadow-md shadow-rose-400/5";
  else if (s === 'custom') cardBorder = "border-amber-500 shadow-md shadow-amber-500/10";

  return (
    <div className={`bg-white border-2 ${cardBorder} rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between`}>
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex justify-between items-center text-xs font-bold text-slate-700">
        <span className="flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{p.id.toUpperCase()}</span>
          <span className="font-black text-slate-800 text-xs">{p.focus}</span>
        </span>
        <span className="bg-slate-200 px-2.5 py-1 rounded-full text-[10px]">
          Scheda {safeIndex + 1} di {filteredProps.length}
        </span>
      </div>

      {/* Comparative body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 text-xs leading-relaxed">
        <div className="space-y-1.5">
          <strong className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">DM 254/2012 (Ordinamento Previgente)</strong>
          <p className="bg-slate-50 p-4 border rounded-2xl italic text-slate-700">"{p.oldText}"</p>
        </div>
        <div className="space-y-1.5">
          <strong className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">DM 221/2025 (Ordinamento Riformato)</strong>
          <p className="bg-indigo-50/20 p-4 border border-indigo-100 rounded-2xl text-slate-800 font-medium">"{p.newText}"</p>
        </div>
      </div>

      {/* Custom text area */}
      {s === 'custom' && (
        <div className="p-6 border-t border-slate-100 bg-amber-50/10 text-xs">
          <label className="text-[10px] font-black uppercase text-amber-800 block mb-2">Inserisci una proposta personale locale:</label>
          <textarea value={cText} onChange={(e) => setCustomText(p.id, e.target.value)} className="w-full border border-amber-200 rounded-xl p-3 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 outline-none leading-relaxed" rows={3} placeholder="Digita una modifica locale non verificata..." />
        </div>
      )}

      {/* Local choices and navigation */}
      <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDecision(p.id, 'approved')} className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${s === 'approved' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border text-slate-700'}`}>
            <span>Usa testo 2025</span>
          </button>
          <button onClick={() => setDecision(p.id, 'rejected')} className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${s === 'rejected' ? 'bg-rose-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border text-slate-700'}`}>
            <span>Mantieni 2012</span>
          </button>
          <button onClick={() => setDecision(p.id, 'custom')} className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${s === 'custom' ? 'bg-amber-500 text-white shadow-md' : 'bg-white hover:bg-slate-100 border text-slate-700'}`}>
            <span>Personalizza</span>
          </button>
          {s && (
            <button onClick={() => resetDecision(p.id)} className="px-3 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs">
              Resetta
            </button>
          )}
        </div>

        <div className="flex space-x-2 self-stretch sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setRevisioneWizardIndex(prev => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
            className={`flex-1 sm:flex-initial px-4 py-2 border rounded-xl flex items-center justify-center space-x-1 font-bold text-xs transition ${
              safeIndex === 0 ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Precedente</span>
          </button>
          <button
            onClick={() => setRevisioneWizardIndex(prev => Math.min(filteredProps.length - 1, prev + 1))}
            disabled={safeIndex === filteredProps.length - 1}
            className={`flex-1 sm:flex-initial px-4 py-2 border rounded-xl flex items-center justify-center space-x-1 font-bold text-xs transition ${
              safeIndex === filteredProps.length - 1 ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
            }`}
          >
            <span>Successivo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
