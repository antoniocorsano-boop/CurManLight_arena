import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { RevisionProposal, RevisionProposalVersion } from '../../domain/revision';
import {
  fingerprintRevisionProposalVersion,
  type InstitutionalDecisionOutcome,
  type InstitutionalRevisionDecisionReceipt,
} from '../../domain/revision';
import type {
  WorkspaceActorContext,
  WorkspaceMemberRole,
  WorkspaceMembership,
} from '../../domain/institution/sharedWorkspacePort';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';
import { SupabaseSharedRevisionDecisionRepository } from '../../infrastructure/supabase/sharedRevisionDecisionRepository';
import { resolveRouterBasename } from '../navigation/routerBasename';
import {
  decisionControlsMayOpen,
  previewStillMatchesVersion,
  receiptMatchesCurrentVersion,
  type ReceiptLookupState,
} from './institutionalDecisionBoundary';

interface MembershipRow {
  workspace_id: string;
  user_id: string;
  role: string;
  status: string;
}

export interface InstitutionalDecisionPanelProps {
  proposal: RevisionProposal;
  version: RevisionProposalVersion;
}

type DecisionOutcomeSelection = InstitutionalDecisionOutcome | '';

const VALID_ROLES: readonly WorkspaceMemberRole[] = [
  'docente',
  'dipartimento',
  'referente',
  'collegio',
  'dirigente',
  'amministratore',
];

const OUTCOME_LABELS: Record<InstitutionalDecisionOutcome, string> = {
  approve: 'Approva la proposta',
  'approve-with-changes': 'Approva con modifiche',
  reject: 'Respinge la proposta',
  defer: 'Rinvia la decisione',
  'return-for-revision': 'Restituisce per revisione',
};

const isWorkspaceMemberRole = (value: string): value is WorkspaceMemberRole =>
  VALID_ROLES.includes(value as WorkspaceMemberRole);

const toMembership = (row: MembershipRow): WorkspaceMembership | null => {
  if (!isWorkspaceMemberRole(row.role)) return null;
  if (!['active', 'suspended', 'revoked'].includes(row.status)) return null;
  return {
    workspaceId: row.workspace_id,
    userId: row.user_id,
    role: row.role,
    status: row.status as WorkspaceMembership['status'],
  };
};

const createRequestId = (): string => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export function InstitutionalDecisionPanel({ proposal, version }: InstitutionalDecisionPanelProps) {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const repository = useMemo(
    () => (client ? new SupabaseSharedRevisionDecisionRepository(client) : null),
    [client]
  );
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [outcome, setOutcome] = useState<DecisionOutcomeSelection>('');
  const [rationale, setRationale] = useState('');
  const [previewFingerprint, setPreviewFingerprint] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [receipt, setReceipt] = useState<InstitutionalRevisionDecisionReceipt | null>(null);
  const [receiptLookupState, setReceiptLookupState] = useState<ReceiptLookupState>('idle');
  const [currentFingerprint, setCurrentFingerprint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeMemberships = memberships.filter((membership) => membership.status === 'active');
  const selectedMembership = activeMemberships.find((membership) => membership.workspaceId === workspaceId) ?? null;
  const canDecide = selectedMembership?.role === 'collegio';

  const clearPreparedDecision = () => {
    setPreviewFingerprint(null);
    setRequestId(null);
    setConfirmed(false);
  };

  const resetPreview = () => {
    clearPreparedDecision();
    setMessage(null);
  };

  useEffect(() => {
    let active = true;
    setCurrentFingerprint(null);
    setReceipt(null);
    setReceiptLookupState('idle');
    clearPreparedDecision();

    void fingerprintRevisionProposalVersion(version)
      .then((fingerprint) => {
        if (active) setCurrentFingerprint(fingerprint);
      })
      .catch((error) => {
        console.warn('[InstitutionalDecisionPanel] Version fingerprint unavailable', error);
        if (active) setMessage('Impossibile verificare in modo affidabile la versione della proposta.');
      });

    return () => {
      active = false;
    };
  }, [version.id]);

  useEffect(() => {
    if (!client) return;

    const refresh = async (nextSession: Session | null) => {
      setSession(nextSession);
      if (!nextSession) {
        setMemberships([]);
        setWorkspaceId('');
        setReceipt(null);
        setReceiptLookupState('idle');
        clearPreparedDecision();
        return;
      }

      const { data, error } = await client
        .from('workspace_memberships')
        .select('workspace_id,user_id,role,status')
        .eq('user_id', nextSession.user.id);

      if (error) {
        console.warn('[InstitutionalDecisionPanel] Membership lookup failed', error);
        setMemberships([]);
        setReceipt(null);
        setReceiptLookupState('error');
        clearPreparedDecision();
        setMessage('Impossibile verificare l’incarico istituzionale. La decisione resta bloccata; riprova quando la connessione è disponibile.');
        return;
      }

      const resolved = ((data ?? []) as MembershipRow[])
        .map(toMembership)
        .filter((membership): membership is WorkspaceMembership => Boolean(membership));
      setMemberships(resolved);
      const active = resolved.filter((membership) => membership.status === 'active');
      const preferred = active.find((membership) => membership.role === 'collegio') ?? active[0];
      setWorkspaceId((current) => current && active.some((membership) => membership.workspaceId === current)
        ? current
        : preferred?.workspaceId ?? '');
    };

    void client.auth.getSession().then(({ data }) => refresh(data.session));
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      void refresh(nextSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    let active = true;

    if (!repository || !selectedMembership || !session) {
      setReceipt(null);
      setReceiptLookupState('idle');
      return () => {
        active = false;
      };
    }

    const context: WorkspaceActorContext = {
      membership: selectedMembership,
      assurance: 'authenticated-workspace',
    };

    setReceipt(null);
    setReceiptLookupState('loading');
    clearPreparedDecision();

    void repository
      .findInstitutionalDecisionForVersion(context, version.id)
      .then((found) => {
        if (!active) return;
        setReceipt(found);
        setReceiptLookupState('resolved');
        if (found) setMessage('Ricevuta istituzionale riletta dall’ambiente istituzionale.');
      })
      .catch((error) => {
        console.warn('[InstitutionalDecisionPanel] Receipt lookup failed', error);
        if (!active) return;
        setReceipt(null);
        setReceiptLookupState('error');
        clearPreparedDecision();
        setMessage('Impossibile verificare la ricevuta della versione. La decisione resta bloccata.');
      });

    return () => {
      active = false;
    };
  }, [repository, selectedMembership?.workspaceId, selectedMembership?.role, session?.user.id, version.id]);

  if (optional.config.status !== 'configured' || !client || proposal.status !== 'accepted-for-decision') {
    return null;
  }

  const routerBasename = resolveRouterBasename(import.meta.env.MODE).replace(/\/$/, '');
  const identityHref = `${routerBasename}/beta-identity`;
  const receiptMatches = receiptMatchesCurrentVersion(receipt, currentFingerprint);
  const controlsMayOpen = decisionControlsMayOpen(receiptLookupState, receipt, currentFingerprint);
  const resumableReceipt = Boolean(receipt && receiptMatches && controlsMayOpen);

  const preparePreview = async () => {
    if (!controlsMayOpen || !outcome) return;
    setBusy(true);
    setMessage(null);
    try {
      const fingerprint = await fingerprintRevisionProposalVersion(version);
      setCurrentFingerprint(fingerprint);
      setPreviewFingerprint(fingerprint);
      setRequestId(createRequestId());
      setConfirmed(false);
    } catch (error) {
      console.warn('[InstitutionalDecisionPanel] Preview fingerprint unavailable', error);
      setMessage('Impossibile preparare l’anteprima in modo affidabile.');
    } finally {
      setBusy(false);
    }
  };

  const recordDecision = async () => {
    if (
      !repository
      || !session
      || !selectedMembership
      || !canDecide
      || !outcome
      || !previewFingerprint
      || !requestId
      || !confirmed
      || !controlsMayOpen
    ) {
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const freshFingerprint = await fingerprintRevisionProposalVersion(version);
      setCurrentFingerprint(freshFingerprint);
      if (!previewStillMatchesVersion(previewFingerprint, freshFingerprint)) {
        clearPreparedDecision();
        setMessage('La versione della proposta è cambiata dopo l’anteprima. La registrazione è stata bloccata: prepara una nuova anteprima.');
        return;
      }

      const context: WorkspaceActorContext = {
        membership: selectedMembership,
        assurance: 'authenticated-workspace',
      };

      const latestReceipt = await repository.findInstitutionalDecisionForVersion(context, version.id);
      setReceipt(latestReceipt);
      setReceiptLookupState('resolved');
      if (!decisionControlsMayOpen('resolved', latestReceipt, freshFingerprint)) {
        clearPreparedDecision();
        setMessage('Lo stato istituzionale della versione è cambiato. La registrazione è stata bloccata e la ricevuta è stata riletta dal sistema.');
        return;
      }

      const nextReceipt = await repository.recordInstitutionalDecision(context, {
        workspaceId: selectedMembership.workspaceId,
        proposalRef: proposal.id,
        proposalVersionRef: version.id,
        proposalVersionFingerprint: freshFingerprint,
        outcome,
        rationale,
        clientRequestId: requestId,
      });
      setReceipt(nextReceipt);
      setReceiptLookupState('resolved');
      clearPreparedDecision();
      setMessage('Decisione istituzionale registrata. Nessuna modifica del curricolo è stata applicata automaticamente.');
    } catch (error) {
      console.warn('[InstitutionalDecisionPanel] Decision record failed', error);
      clearPreparedDecision();
      setReceiptLookupState('error');
      setMessage('Decisione non registrata. Verifica la connessione e lo stato dell’incarico prima di riprovare.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-label="Decisione istituzionale Beta"
      data-hcm-decision-panel
      className="mt-2 w-full rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4 text-xs text-slate-700 space-y-3"
    >
      <div>
        <strong className="block text-[10px] uppercase tracking-wider text-emerald-800">BETA · decisione istituzionale</strong>
        <p className="mt-1">
          Questa azione è distinta dalle scelte locali. Per registrarla devi essere autenticato e avere un incarico istituzionale verificato.
        </p>
        <details className="mt-2" data-hcm-technical-details>
          <summary className="cursor-pointer font-semibold text-slate-500">Dettagli di autorizzazione</summary>
          <div className="mt-2 rounded-lg bg-white p-2 text-[11px] text-slate-600">
            Il controllo tecnico richiede una membership attiva con capacità <code>REVISION_DECIDE</code>. Il ruolo dichiarato localmente nell’app non sostituisce questa verifica.
          </div>
        </details>
      </div>

      {!session ? (
        <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          Nessuna identità Beta autenticata. <a className="font-bold underline" href={identityHref}>Accedi e verifica il tuo incarico</a> prima di assumere una decisione.
        </div>
      ) : activeMemberships.length === 0 ? (
        <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          La sessione è autenticata, ma non risulta alcun incarico istituzionale attivo. La decisione resta bloccata.
        </div>
      ) : (
        <>
          {activeMemberships.length > 1 && (
            <label className="block font-semibold">
              Contesto istituzionale
              <select
                value={workspaceId}
                onChange={(event) => {
                  setWorkspaceId(event.target.value);
                  setReceiptLookupState('loading');
                  resetPreview();
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2"
              >
                {activeMemberships.map((membership, index) => (
                  <option key={membership.workspaceId} value={membership.workspaceId}>
                    Incarico {index + 1} · {membership.role}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div><strong>Incarico verificato:</strong> {selectedMembership?.role ?? '—'}</div>
            <div><strong>Versione proposta:</strong> v{version.versionNumber}</div>
            <details className="mt-2" data-hcm-technical-details>
              <summary className="cursor-pointer font-semibold text-slate-500">Riferimenti tecnici</summary>
              <div className="mt-1 space-y-1 text-[11px] text-slate-500">
                <div>Workspace: <code className="break-all">{selectedMembership?.workspaceId ?? '—'}</code></div>
                <div>Versione: <code className="break-all">{version.id}</code></div>
              </div>
            </details>
          </div>

          {receiptLookupState === 'loading' && canDecide && (
            <div role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
              Verifica delle ricevute istituzionali in corso. La registrazione resta bloccata fino a esito certo.
            </div>
          )}

          {receiptLookupState === 'error' && canDecide && (
            <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-900">
              Impossibile verificare in modo affidabile le ricevute della versione. La registrazione resta bloccata.
            </div>
          )}

          {receipt && (
            <div role="status" className={`rounded-lg border p-3 ${receiptMatches ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
              <strong className="block">Ricevuta istituzionale già presente</strong>
              <div>Esito: {OUTCOME_LABELS[receipt.outcome]}</div>
              <div>Registrata: {new Date(receipt.decidedAt).toLocaleString('it-IT')}</div>
              <div>Ruolo: {receipt.authorityRole}</div>
              <div className="mt-1">
                {!receiptMatches
                  ? 'ATTENZIONE: la ricevuta non corrisponde alla versione attualmente mostrata. La registrazione resta bloccata.'
                  : resumableReceipt
                    ? 'Esito non finale: la deliberazione può essere ripresa con una nuova anteprima e una nuova ricevuta.'
                    : 'La ricevuta corrisponde alla versione attualmente mostrata e l’esito è finale per questa versione.'}
              </div>
              <details className="mt-2" data-hcm-technical-details>
                <summary className="cursor-pointer font-semibold text-slate-500">Dettagli tecnici della ricevuta</summary>
                <div className="mt-1 text-[11px] text-slate-500">ID: <code className="break-all">{receipt.id}</code></div>
              </details>
            </div>
          )}

          {!canDecide ? (
            <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              L’incarico <strong>{selectedMembership?.role}</strong> consente di consultare questo ambiente, ma non autorizza la registrazione di decisioni istituzionali. Un ruolo dichiarato localmente non può sbloccare questa azione.
            </div>
          ) : controlsMayOpen ? (
            <div className="space-y-3">
              <div role="note" className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-indigo-950">
                Nessun esito è preselezionato. Scegli esplicitamente l’esito istituzionale prima di preparare l’anteprima.
              </div>
              <label className="block font-semibold">
                Esito proposto
                <select
                  value={outcome}
                  onChange={(event) => {
                    setOutcome(event.target.value as DecisionOutcomeSelection);
                    resetPreview();
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2"
                >
                  <option value="" disabled>Seleziona un esito…</option>
                  {Object.entries(OUTCOME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="block font-semibold">
                Motivazione della decisione
                <textarea
                  value={rationale}
                  onChange={(event) => {
                    setRationale(event.target.value);
                    resetPreview();
                  }}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2"
                  placeholder="Esplicita gli elementi considerati e la ragione dell’esito."
                />
              </label>

              {!previewFingerprint ? (
                <button
                  type="button"
                  disabled={busy || !outcome || !rationale.trim()}
                  onClick={() => void preparePreview()}
                  className="rounded-lg bg-indigo-600 px-3 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Rivedi prima di registrare
                </button>
              ) : (
                <div className="space-y-3 rounded-lg border-2 border-indigo-200 bg-white p-3">
                  <strong className="block text-indigo-900">Anteprima della conseguenza</strong>
                  <div><strong>Esito:</strong> {outcome ? OUTCOME_LABELS[outcome] : '—'}</div>
                  <div><strong>Motivazione:</strong> {rationale}</div>
                  <div><strong>Versione della proposta:</strong> v{version.versionNumber}</div>
                  <p className="font-semibold text-slate-800">
                    La registrazione crea una ricevuta istituzionale non modificabile. Non sostituisce la proposta, non modifica automaticamente il curricolo e non equivale a firma digitale o protocollazione.
                  </p>
                  <details data-hcm-technical-details>
                    <summary className="cursor-pointer font-semibold text-slate-500">Dettagli tecnici della registrazione</summary>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Impronta SHA-256: <code className="break-all">{previewFingerprint}</code>. La ricevuta è conservata con semantica append-only.
                    </div>
                  </details>
                  <label className="flex items-start gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) => setConfirmed(event.target.checked)}
                      className="mt-0.5"
                    />
                    <span>Confermo di aver verificato contenuto, esito e conseguenze della registrazione.</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy || !confirmed}
                      onClick={() => void recordDecision()}
                      className="rounded-lg bg-emerald-700 px-3 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Conferma e registra decisione
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={resetPreview}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-bold text-slate-700"
                    >
                      Torna a modificare
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}

      {message && <p role="status" aria-live="polite" className="rounded-lg bg-white p-2">{message}</p>}
    </section>
  );
}
