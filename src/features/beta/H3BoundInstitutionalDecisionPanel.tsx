import { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type { InstitutionalDecisionOutcome } from '../../domain/revision/sharedDecisionPort';
import type { InstitutionalReviewHandoffReceipt } from '../../domain/revision/institutionalReviewHandoff';
import {
  isFinalH3BoundInstitutionalDecision,
  type DevelopmentPilotAuthorityAssignment,
  type H3BoundInstitutionalDecisionReceipt,
} from '../../domain/revision/h3BoundInstitutionalDecision';
import { SupabaseH3BoundInstitutionalDecisionRepository } from '../../infrastructure/supabase/h3BoundInstitutionalDecisionRepository';
import { H4CanonicalAdoptionHandoffPanel } from './H4CanonicalAdoptionHandoffPanel';

interface Props {
  client: SupabaseClient;
  context: WorkspaceActorContext;
  handoff: InstitutionalReviewHandoffReceipt;
}

type OutcomeSelection = InstitutionalDecisionOutcome | '';

const OUTCOME_LABELS: Record<InstitutionalDecisionOutcome, string> = {
  approve: 'Approva il passaggio',
  'approve-with-changes': 'Approva con modifiche',
  reject: 'Respinge il passaggio',
  defer: 'Rinvia la decisione',
  'return-for-revision': 'Restituisce per revisione',
};

const explainH4Error = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('REVISION_DECIDE_REQUIRED')) return 'Questo account non possiede l’autorità H4 richiesta.';
  if (message.includes('INSTITUTIONAL_REVIEW_HANDOFF_REQUIRED')) return 'La ricevuta H3 preparata non è più disponibile.';
  if (message.includes('INSTITUTIONAL_REVIEW_HANDOFF_NOT_READY')) return 'Il passaggio H3 non è nello stato richiesto per H4.';
  if (message.includes('H4_STALE_H2_SOURCE')) return 'Una delle fonti H2 è stata superata: occorre riesaminare prima il raccordo.';
  if (message.includes('H4_H2_CONTINUATION_OPEN')) return 'Un punto H2 è stato riaperto: H4 resta bloccato.';
  if (message.includes('H4_STALE_H3')) return 'Esiste un riesame verticale più recente: usa il nuovo H3.';
  if (message.includes('INSTITUTIONAL_DECISION_ALREADY_FINAL')) return 'Su questo passaggio esiste già una decisione H4 finale.';
  return message;
};

export function H3BoundInstitutionalDecisionPanel({ client, context, handoff }: Props) {
  const repository = useMemo(() => new SupabaseH3BoundInstitutionalDecisionRepository(client), [client]);
  const [developmentAuthority, setDevelopmentAuthority] = useState<DevelopmentPilotAuthorityAssignment | null>(null);
  const [decisions, setDecisions] = useState<H3BoundInstitutionalDecisionReceipt[]>([]);
  const [outcome, setOutcome] = useState<OutcomeSelection>('');
  const [rationale, setRationale] = useState('');
  const [previewed, setPreviewed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canDecide = context.membership.status === 'active' && context.membership.role === 'collegio';
  const latest = decisions[0] ?? null;
  const hasFinalDecision = Boolean(latest && isFinalH3BoundInstitutionalDecision(latest.outcome));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage(null);
    setPreviewed(false);
    setConfirmed(false);
    void Promise.all([
      repository.findActiveDevelopmentAuthority(context),
      repository.listForHandoff(context, handoff.id),
    ]).then(([assignment, receipts]) => {
      if (!active) return;
      setDevelopmentAuthority(assignment);
      setDecisions(receipts);
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setDevelopmentAuthority(null);
      setDecisions([]);
      setLoading(false);
      setMessage(explainH4Error(error));
    });
    return () => { active = false; };
  }, [repository, context.membership.workspaceId, context.membership.userId, context.membership.role, handoff.id]);

  const resetPreview = () => {
    setPreviewed(false);
    setConfirmed(false);
    setMessage(null);
  };

  const record = async () => {
    if (!canDecide || !outcome || !rationale.trim() || !previewed || !confirmed || hasFinalDecision) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await repository.record(context, handoff.id, outcome, rationale.trim(), globalThis.crypto.randomUUID());
      const refreshed = await repository.listForHandoff(context, handoff.id);
      setDecisions(refreshed);
      setOutcome('');
      setRationale('');
      setPreviewed(false);
      setConfirmed(false);
      setMessage('Decisione H4 registrata e riletta dal server. Nessuna adozione, vigenza o promozione del master è stata eseguita.');
    } catch (error) {
      setMessage(explainH4Error(error));
      setPreviewed(false);
      setConfirmed(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-3 rounded-xl border-2 border-violet-200 bg-white p-3 text-xs leading-5 text-slate-700" data-h3-bound-h4-panel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wide text-violet-700">H4 · decisione esplicita</span>
          <strong className="mt-1 block text-sm text-slate-950">Decisione sull’esito del riesame verticale</strong>
        </div>
        {developmentAuthority && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">Autorità di sviluppo · Beta</span>
        )}
      </div>

      <p className="mt-2">
        H4 consuma esclusivamente questa ricevuta H3 preparata. La decisione resta distinta dall’adozione: non rende vigente il curricolo e non promuove automaticamente il master.
      </p>

      {developmentAuthority && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950" data-development-pilot-authority>
          <strong className="block">Autorità di collaudo verificata</strong>
          <span>Questa abilitazione vale soltanto nell’ambiente Beta di sviluppo. L’eventuale ricevuta H4 sarà marcata <code>DEVELOPMENT_PILOT</code> e non rappresenta una deliberazione istituzionale di produzione.</span>
        </div>
      )}

      {loading && <div className="mt-3 rounded-lg bg-slate-50 p-3">Verifica dell’autorità e delle ricevute H4 in corso…</div>}

      {!loading && latest && (
        <div className={`mt-3 rounded-lg border p-3 ${hasFinalDecision ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-slate-50'}`} data-h4-existing-receipt>
          <strong className="block">Ricevuta H4 già presente</strong>
          <span className="block">Esito: {OUTCOME_LABELS[latest.outcome]}</span>
          <span className="block">Registrata: {new Date(latest.decidedAt).toLocaleString('it-IT')}</span>
          <span className="block">Contesto autorità: {latest.authorityContext === 'DEVELOPMENT_PILOT' ? 'sviluppo/pilota' : 'istituzionale'}</span>
          <span className="block">Ricevuta: <code>{latest.id}</code></span>
          <span className="block">{hasFinalDecision ? 'Esito finale per questo handoff.' : 'Esito non finale: il passaggio può essere ripreso con una nuova decisione esplicita.'}</span>
        </div>
      )}

      {!loading && latest && hasFinalDecision && (
        <H4CanonicalAdoptionHandoffPanel
          client={client}
          context={context}
          decision={latest}
        />
      )}

      {!loading && !canDecide && !hasFinalDecision && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950" data-h4-authority-blocked>
          Il passaggio è pronto, ma il ruolo verificato <strong>{context.membership.role}</strong> non possiede <code>REVISION_DECIDE</code>.
        </div>
      )}

      {!loading && canDecide && !hasFinalDecision && (
        <div className="mt-3 grid gap-3" data-h4-human-decision-form>
          <label className="grid gap-1 font-bold text-slate-800">
            Esito H4
            <select
              value={outcome}
              onChange={(event) => { setOutcome(event.target.value as OutcomeSelection); resetPreview(); }}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            >
              <option value="" disabled>Seleziona un esito…</option>
              {Object.entries(OUTCOME_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="grid gap-1 font-bold text-slate-800">
            Motivazione della decisione
            <textarea
              value={rationale}
              onChange={(event) => { setRationale(event.target.value); resetPreview(); }}
              maxLength={4000}
              rows={4}
              placeholder="Esplicita gli elementi considerati e la ragione dell’esito."
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            />
          </label>

          {!previewed ? (
            <button
              type="button"
              disabled={!outcome || !rationale.trim()}
              onClick={() => { setPreviewed(true); setConfirmed(false); }}
              className="min-h-11 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              data-human-next-action="preview-h4-decision"
            >
              Rivedi prima di registrare
            </button>
          ) : (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3" data-h4-decision-preview>
              <strong className="block text-violet-950">Anteprima della decisione</strong>
              <span className="mt-1 block">Handoff: <code>{handoff.id}</code></span>
              <span className="block">H3: <code>{handoff.verticalReviewOutcomeId}</code></span>
              <span className="block">Esito scelto: {outcome ? OUTCOME_LABELS[outcome] : '—'}</span>
              <span className="block">Conseguenza: registra soltanto H4; adozione, vigenza e promozione del master restano separate.</span>
              <label className="mt-3 flex items-start gap-2 font-semibold text-violet-950">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
                <span>Confermo di assumere esplicitamente questo esito nel contesto di autorità indicato.</span>
              </label>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={!confirmed || submitting}
                  onClick={() => void record()}
                  className="min-h-11 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  data-human-next-action="record-h3-bound-h4"
                >
                  {submitting ? 'Registrazione…' : 'Registra la decisione H4'}
                </button>
                <button type="button" disabled={submitting} onClick={() => { setPreviewed(false); setConfirmed(false); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                  Modifica
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {message && <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-indigo-950" aria-live="polite">{message}</div>}
    </section>
  );
}
