import { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type { H4CanonicalAdoptionHandoffReceipt } from '../../domain/revision/h4CanonicalAdoptionHandoff';
import type {
  DevelopmentPilotAdoptionAuthority,
  H4BoundCanonicalAdoptionReceipt,
} from '../../domain/revision/h4BoundCanonicalAdoption';
import { SupabaseH4BoundCanonicalAdoptionRepository } from '../../infrastructure/supabase/h4BoundCanonicalAdoptionRepository';

interface Props {
  client: SupabaseClient;
  context: WorkspaceActorContext;
  handoff: H4CanonicalAdoptionHandoffReceipt;
}

const explainError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('CURRICULUM_ADOPT_REQUIRED')) return 'Questo account non possiede l’autorità di adozione richiesta.';
  if (message.includes('H4_ADOPTION_HANDOFF_REQUIRED')) return 'La ricevuta di passaggio verso l’adozione non è più disponibile.';
  if (message.includes('H4_ADOPTION_HANDOFF_NOT_READY')) return 'Il passaggio H4 non è nello stato richiesto per l’adozione.';
  if (message.includes('ADOPTION_CURRENT_FINAL_H4_REQUIRED')) return 'Esiste una decisione H4 più recente: occorre usare il passaggio corrente.';
  if (message.includes('ADOPTION_STALE_H2_SOURCE')) return 'Una fonte H2 è stata superata: l’adozione resta bloccata.';
  if (message.includes('ADOPTION_H2_CONTINUATION_OPEN')) return 'Un punto H2 è stato riaperto: l’adozione resta bloccata.';
  if (message.includes('ADOPTION_STALE_H3')) return 'Esiste un riesame verticale H3 più recente: l’adozione resta bloccata.';
  return message;
};

const romanClass = (key: string): string | null => {
  const match = key.match(/:classe-(\d+):/);
  if (!match) return null;
  const roman: Record<string, string> = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V' };
  return roman[match[1]] ?? match[1];
};

const scopeLabel = (handoff: H4CanonicalAdoptionHandoffReceipt): string => {
  const classes = handoff.reviewedUnitKeys.map(romanClass).filter((value): value is string => Boolean(value));
  const unique = [...new Set(classes)];
  if (unique.length > 1) return `Classi ${unique.join(' → ')}`;
  if (unique.length === 1) return `Classe ${unique[0]}`;
  return `${handoff.reviewedUnitKeys.length} unità curricolari`;
};

export function H4BoundCanonicalAdoptionPanel({ client, context, handoff }: Props) {
  const repository = useMemo(() => new SupabaseH4BoundCanonicalAdoptionRepository(client), [client]);
  const [pilotAuthority, setPilotAuthority] = useState<DevelopmentPilotAdoptionAuthority | null>(null);
  const [receipt, setReceipt] = useState<H4BoundCanonicalAdoptionReceipt | null>(null);
  const [rationale, setRationale] = useState('');
  const [previewed, setPreviewed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formalAuthority = context.membership.status === 'active' && context.membership.role === 'dirigente';
  const canAdopt = context.membership.status === 'active' && (formalAuthority || Boolean(pilotAuthority));
  const scope = scopeLabel(handoff);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage(null);
    setPreviewed(false);
    setConfirmed(false);
    void Promise.all([
      repository.findActiveDevelopmentAuthority(context),
      repository.findForHandoff(context, handoff.id),
    ]).then(([authority, existing]) => {
      if (!active) return;
      setPilotAuthority(authority);
      setReceipt(existing);
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setPilotAuthority(null);
      setReceipt(null);
      setLoading(false);
      setMessage(explainError(error));
    });
    return () => { active = false; };
  }, [repository, context.membership.workspaceId, context.membership.userId, context.membership.role, handoff.id]);

  const resetPreview = () => {
    setPreviewed(false);
    setConfirmed(false);
    setMessage(null);
  };

  const record = async () => {
    if (!canAdopt || !rationale.trim() || !previewed || !confirmed || receipt || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const saved = await repository.record(context, handoff.id, rationale.trim(), globalThis.crypto.randomUUID());
      setReceipt(saved);
      setRationale('');
      setPreviewed(false);
      setConfirmed(false);
      setMessage('Adozione registrata e riletta dal server. Materializzazione, pubblicazione e vigenza restano separate e non sono state eseguite.');
    } catch (error) {
      setMessage(explainError(error));
      setPreviewed(false);
      setConfirmed(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-3 rounded-xl border-2 border-teal-200 bg-white p-3 text-xs leading-5 text-slate-700" data-h4-bound-adoption-panel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wide text-teal-700">Adozione · gesto separato</span>
          <strong className="mt-1 block text-sm text-slate-950">Adozione del perimetro approvato</strong>
        </div>
        {pilotAuthority && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">Autorità di sviluppo · Dirigente</span>
        )}
      </div>

      <p className="mt-2">
        Questa fase registra l’adozione del solo perimetro approvato dalla catena H2 → H3 → H4. Non materializza una nuova versione, non pubblica e non rende vigente il curricolo.
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3" data-adoption-subject-preview>
        <strong className="block text-slate-950">Oggetto dell’adozione</strong>
        <span className="block">Master: <code>{handoff.masterId}@{handoff.masterVersion}</code></span>
        <span className="block">Disciplina: {handoff.discipline}</span>
        <span className="block">Perimetro: {scope}</span>
        <span className="block">Decisione H4: <code>{handoff.institutionalDecisionId}</code> · {handoff.h4Outcome === 'approve' ? 'approvata' : 'approvata con modifiche'}</span>
        <span className="block">Handoff adozione: <code>{handoff.id}</code></span>
      </div>

      {pilotAuthority && !receipt && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950" data-development-pilot-adoption-authority>
          <strong className="block">Autorità di adozione del pilot verificata</strong>
          <span>Questa autorità vale soltanto nell’ambiente Beta di sviluppo. La ricevuta sarà marcata <code>DEVELOPMENT_PILOT</code> e non rappresenta un atto di produzione.</span>
        </div>
      )}

      {loading && <div className="mt-3 rounded-lg bg-slate-50 p-3">Verifica dell’autorità e delle ricevute di adozione…</div>}

      {!loading && receipt && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950" data-adoption-receipt>
          <strong className="block">Adozione registrata · in attesa di materializzazione</strong>
          <span className="block">Ricevuta: <code>{receipt.id}</code></span>
          <span className="block">Registrata: {new Date(receipt.adoptedAt).toLocaleString('it-IT')}</span>
          <span className="block">Contesto autorità: {receipt.authorityContext === 'DEVELOPMENT_PILOT' ? 'sviluppo/pilota' : 'istituzionale'}</span>
          <span className="block">Stato: adottato, ma non ancora materializzato né vigente.</span>
        </div>
      )}

      {!loading && !receipt && !canAdopt && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950" data-adoption-authority-blocked>
          Il passaggio è pronto, ma serve l’autorità di adozione <strong>Dirigente</strong>.
        </div>
      )}

      {!loading && !receipt && canAdopt && (
        <div className="mt-3 grid gap-3" data-adoption-human-form>
          <label className="grid gap-1 font-bold text-slate-800">
            Motivazione dell’adozione
            <textarea
              value={rationale}
              onChange={(event) => { setRationale(event.target.value); resetPreview(); }}
              maxLength={4000}
              rows={4}
              placeholder="Esplicita perché il perimetro approvato viene adottato nel contesto indicato."
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            />
          </label>

          {!previewed ? (
            <button
              type="button"
              disabled={!rationale.trim()}
              onClick={() => { setPreviewed(true); setConfirmed(false); }}
              className="min-h-11 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              data-human-next-action="preview-h4-bound-adoption"
            >
              Rivedi prima di adottare
            </button>
          ) : (
            <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-3" data-adoption-decision-preview>
              <strong className="block text-teal-950">Anteprima dell’adozione</strong>
              <span className="mt-1 block">Master: <code>{handoff.masterId}@{handoff.masterVersion}</code></span>
              <span className="block">Perimetro: {scope}</span>
              <span className="block">H4: <code>{handoff.institutionalDecisionId}</code></span>
              <span className="block">Conseguenza: crea una ricevuta <code>ADOPTED_PENDING_MATERIALIZATION</code>. Materializzazione, pubblicazione e vigenza restano separate.</span>
              <label className="mt-3 flex items-start gap-2 font-semibold text-teal-950">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
                <span>Confermo di adottare esplicitamente questo perimetro nel contesto di autorità indicato.</span>
              </label>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={!confirmed || submitting}
                  onClick={() => void record()}
                  className="min-h-11 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  data-human-next-action="record-h4-bound-adoption"
                >
                  {submitting ? 'Registrazione…' : 'Registra l’adozione'}
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
