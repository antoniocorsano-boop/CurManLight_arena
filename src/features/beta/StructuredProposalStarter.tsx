import { useMemo, useState } from 'react';
import type { DecisionStatus, Proposal, SchoolOrder } from '../../types/curriculum';
import { createEntityReference } from '../../domain/curriculum/identity';
import { addProposal } from '../../domain/revision/repository';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';
import { PlanningHandoffPreview } from './PlanningHandoffPreview';

export interface StructuredProposalStarterProps {
  proposals: Proposal[];
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  discipline: string;
  order: SchoolOrder;
}

const proposedTextFor = (
  proposal: Proposal,
  decision: DecisionStatus,
  customTexts: Record<string, string>
): string | null => {
  if (decision === 'approved') return proposal.newText;
  if (decision === 'custom') return customTexts[proposal.id]?.trim() || null;
  return null;
};

export function StructuredProposalStarter({
  proposals,
  decisions,
  customTexts,
  discipline,
  order,
}: StructuredProposalStarterProps) {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const { revisionArchive, replaceRevisionArchive } = useCurriculumStore();
  const [selectedId, setSelectedId] = useState('');
  const [rationale, setRationale] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (optional.config.status !== 'configured') return null;

  const candidates = proposals.filter((proposal) => {
    const decision = decisions[proposal.id];
    if (!decision || decision === 'rejected') return false;
    if (!proposedTextFor(proposal, decision, customTexts)) return false;
    const targetId = `legacy-gap:${discipline}:${order}:${proposal.id}`;
    return !revisionArchive.proposals.some((item) => item.targetNodeRef.id === targetId);
  });

  const selected = candidates.find((proposal) => proposal.id === selectedId) ?? null;
  const selectedDecision = selected ? decisions[selected.id] : undefined;

  const createStructuredProposal = () => {
    if (!selected || !rationale.trim()) return;
    const decision = decisions[selected.id];
    if (!decision) return;
    const proposedText = proposedTextFor(selected, decision, customTexts);
    if (!proposedText) return;

    const targetRef = createEntityReference(
      `legacy-gap:${discipline}:${order}:${selected.id}` as never,
      'curriculum-node',
      selected.focus
    );
    const baselineRef = createEntityReference(
      `local-baseline:${discipline}:${order}` as never,
      'curriculum-version',
      'Baseline locale non verificata'
    );
    const sourceRef = createEntityReference(
      `legacy-gap-source:${discipline}:${order}:${selected.id}` as never,
      'source',
      'Confronto locale 2012→2025'
    );

    const result = addProposal(revisionArchive, {
      targetNodeRef: targetRef,
      curriculumVersionRef: baselineRef,
      currentTextSnapshot: selected.oldText,
      proposedText,
      rationale: rationale.trim(),
      sourceRefs: [sourceRef],
      evidenceRefs: [sourceRef],
      origin: 'legacy',
    });

    if (!result.success) {
      setMessage(result.errors.map((error) => error.message).join(' · '));
      return;
    }

    replaceRevisionArchive(result.archive);
    setSelectedId('');
    setRationale('');
    setMessage('Proposta strutturata creata. Resta una proposta locale finché non attraversa revisione e decisione istituzionale autenticata.');
  };

  return (
    <section aria-label="Avvio proposta strutturata Beta" className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 text-xs space-y-3">
      <div>
        <strong className="block text-[10px] uppercase tracking-wider text-indigo-800">BETA · dalla scelta locale alla proposta</strong>
        <p className="mt-1 text-slate-700">
          Una scelta locale può diventare una proposta strutturata, ma non diventa per questo decisione o curricolo d’istituto. La provenienza resta esplicitamente locale e non verificata.
        </p>
      </div>

      {candidates.length === 0 ? (
        <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-slate-600">
          Registra prima una scelta locale “Usa testo 2025” oppure una proposta personalizzata. Le scelte “Mantieni testo 2012” non generano una proposta di modifica.
        </p>
      ) : (
        <>
          <label className="block font-semibold">
            Scelta locale da trasformare in proposta
            <select
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setMessage(null);
              }}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2"
            >
              <option value="">Seleziona…</option>
              {candidates.map((proposal) => (
                <option key={proposal.id} value={proposal.id}>{proposal.focus}</option>
              ))}
            </select>
          </label>

          {selected && selectedDecision && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <strong className="block text-[10px] uppercase text-slate-500">Testo di confronto</strong>
                <p className="mt-1">{selected.oldText}</p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-white p-3">
                <strong className="block text-[10px] uppercase text-indigo-700">Testo proposto</strong>
                <p className="mt-1">{proposedTextFor(selected, selectedDecision, customTexts)}</p>
              </div>
            </div>
          )}

          <label className="block font-semibold">
            Motivazione della proposta
            <textarea
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2"
              placeholder="Perché questa modifica merita una revisione formale?"
            />
          </label>

          <button
            type="button"
            disabled={!selected || !rationale.trim()}
            onClick={createStructuredProposal}
            className="rounded-lg bg-indigo-700 px-3 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crea proposta strutturata
          </button>
        </>
      )}

      {message && <p role="status" aria-live="polite" className="rounded-lg bg-white p-2">{message}</p>}

      <PlanningHandoffPreview />
    </section>
  );
}
