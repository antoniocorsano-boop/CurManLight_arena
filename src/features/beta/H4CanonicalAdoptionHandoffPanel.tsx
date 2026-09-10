import { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  isH4OutcomeEligibleForAdoptionHandoff,
  type H4CanonicalAdoptionHandoffReceipt,
} from '../../domain/revision/h4CanonicalAdoptionHandoff';
import type { H3BoundInstitutionalDecisionReceipt } from '../../domain/revision/h3BoundInstitutionalDecision';
import { SupabaseH4CanonicalAdoptionHandoffRepository } from '../../infrastructure/supabase/h4CanonicalAdoptionHandoffRepository';

interface Props {
  client: SupabaseClient;
  context: WorkspaceActorContext;
  decision: H3BoundInstitutionalDecisionReceipt;
}

const explainError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('ADOPTION_HANDOFF_PREPARE_REQUIRED')) return 'Il ruolo corrente non può preparare il passaggio verso l’adozione.';
  if (message.includes('H4_DECISION_NOT_ADOPTION_ELIGIBLE')) return 'La decisione H4 non è eleggibile per l’adozione.';
  if (message.includes('CURRENT_FINAL_H4_DECISION_REQUIRED')) return 'Esiste una decisione H4 più recente: usa la ricevuta corrente.';
  if (message.includes('ADOPTION_HANDOFF_STALE_H2_SOURCE')) return 'Una fonte H2 è stata superata: il passaggio verso l’adozione resta bloccato.';
  if (message.includes('ADOPTION_HANDOFF_H2_CONTINUATION_OPEN')) return 'Un punto H2 è stato riaperto: il passaggio verso l’adozione resta bloccato.';
  if (message.includes('ADOPTION_HANDOFF_STALE_H3')) return 'Esiste un riesame verticale H3 più recente: il passaggio verso l’adozione resta bloccato.';
  return message;
};

export function H4CanonicalAdoptionHandoffPanel({ client, context, decision }: Props) {
  const repository = useMemo(() => new SupabaseH4CanonicalAdoptionHandoffRepository(client), [client]);
  const [receipt, setReceipt] = useState<H4CanonicalAdoptionHandoffReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const eligible = isH4OutcomeEligibleForAdoptionHandoff(decision.outcome);
  const canPrepare = context.membership.status === 'active'
    && (context.membership.role === 'collegio' || context.membership.role === 'dirigente');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage(null);
    void repository.findForDecision(context, decision.id)
      .then((next) => {
        if (!active) return;
        setReceipt(next);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setReceipt(null);
        setLoading(false);
        setMessage(explainError(error));
      });
    return () => { active = false; };
  }, [repository, context.membership.workspaceId, context.membership.userId, context.membership.role, decision.id]);

  const prepare = async () => {
    if (!eligible || !canPrepare || receipt || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const saved = await repository.prepare(context, decision.id, globalThis.crypto.randomUUID());
      setReceipt(saved);
      setMessage('Passaggio H4 verso l’adozione preparato e riletto dal server. Nessuna adozione o vigenza è stata eseguita.');
    } catch (error) {
      setMessage(explainError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!eligible) {
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" data-h4-adoption-not-eligible>
        Questa decisione H4 non autorizza il passaggio verso l’adozione. L’adozione resta chiusa.
      </div>
    );
  }

  return (
    <section className="mt-3 rounded-xl border-2 border-sky-200 bg-sky-50/40 p-3 text-xs leading-5 text-slate-700" data-h4-adoption-handoff-panel>
      <span className="text-[10px] font-black uppercase tracking-wide text-sky-700">Fase successiva · separata</span>
      <strong className="mt-1 block text-sm text-slate-950">Passaggio dalla decisione H4 all’adozione</strong>
      <p className="mt-2">
        La decisione H4 è favorevole, ma non equivale all’adozione. Questo passaggio crea soltanto una ricevuta immutabile per la successiva autorità di adozione.
      </p>

      {loading && <div className="mt-3 rounded-lg bg-white p-3">Verifica del passaggio verso l’adozione…</div>}

      {!loading && receipt && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950" data-h4-adoption-handoff-ready>
          <strong className="block">Pronto per la revisione di adozione</strong>
          <span className="block">Ricevuta H4: <code>{receipt.institutionalDecisionId}</code></span>
          <span className="block">Handoff adozione: <code>{receipt.id}</code></span>
          <span className="block">Autorità richiesta per l’adozione: Dirigente.</span>
          <span className="block">Nessuna adozione, vigenza o promozione del master è stata generata.</span>
        </div>
      )}

      {!loading && !receipt && canPrepare && (
        <div className="mt-3 rounded-lg border border-sky-200 bg-white p-3" data-h4-adoption-handoff-action>
          <p>Con un gesto esplicito puoi consegnare la ricevuta H4 alla fase di adozione. Il gesto non adotta e non rende vigente il curricolo.</p>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void prepare()}
            className="mt-2 min-h-11 w-full rounded-xl bg-sky-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300 sm:w-auto"
            data-human-next-action="prepare-h4-adoption-handoff"
          >
            {submitting ? 'Preparazione…' : 'Prepara per l’adozione'}
          </button>
        </div>
      )}

      {!loading && !receipt && !canPrepare && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
          La decisione H4 è eleggibile, ma il ruolo corrente non può preparare il passaggio verso l’adozione.
        </div>
      )}

      {message && <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-indigo-950" aria-live="polite">{message}</div>}
    </section>
  );
}
