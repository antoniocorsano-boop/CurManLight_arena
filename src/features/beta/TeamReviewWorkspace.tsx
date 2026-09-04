import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { DecisionStatus, Proposal } from '../../types/curriculum';
import type {
  TeamReviewItemSummary,
  TeamReviewOutcome,
  TeamReviewOutcomeReceipt,
  TeamReviewProposalDescriptor,
} from '../../domain/revision/teamReview';
import {
  deriveTeamReviewSummary,
  fingerprintTeamReviewProposal,
} from '../../domain/revision/teamReview';
import type {
  WorkspaceActorContext,
  WorkspaceMemberRole,
  WorkspaceMembership,
} from '../../domain/institution/sharedWorkspacePort';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';
import { SupabaseSharedTeamReviewRepository } from '../../infrastructure/supabase/sharedTeamReviewRepository';
import { resolveRouterBasename } from '../navigation/routerBasename';

interface MembershipRow {
  workspace_id: string;
  user_id: string;
  role: string;
  status: string;
}

export interface TeamReviewWorkspaceProps {
  proposals: Proposal[];
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
}

type FingerprintMap = Record<string, string>;

const VALID_ROLES: readonly WorkspaceMemberRole[] = ['docente', 'dipartimento', 'referente', 'collegio', 'dirigente', 'amministratore'];
const TEAM_OUTCOME_LABELS: Record<TeamReviewOutcome, string> = {
  'accept-proposal': 'Accogli proposta',
  'keep-previous': 'Mantieni testo precedente',
  'shared-text': 'Definisci testo condiviso',
  defer: 'Rinvia',
};

const BUCKET_LABELS: Record<TeamReviewItemSummary['bucket'], string> = {
  shared: 'Già condiviso',
  'change-proposed': 'Modifica proposta',
  divergent: 'Opinioni diverse',
  'needs-clarification': 'Serve chiarimento',
};

const isWorkspaceMemberRole = (value: string): value is WorkspaceMemberRole => VALID_ROLES.includes(value as WorkspaceMemberRole);

const toMembership = (row: MembershipRow): WorkspaceMembership | null => {
  if (!isWorkspaceMemberRole(row.role) || !['active', 'suspended', 'revoked'].includes(row.status)) return null;
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

const localOrientation = (decision?: DecisionStatus) => {
  if (decision === 'approved') return 'confirm-proposal' as const;
  if (decision === 'custom') return 'propose-change' as const;
  if (decision === 'rejected') return 'keep-previous' as const;
  return null;
};

const latestCurrentOutcomes = (
  outcomes: TeamReviewOutcomeReceipt[],
  descriptors: TeamReviewProposalDescriptor[],
): Record<string, TeamReviewOutcomeReceipt> => {
  const currentFingerprintByProposal = new Map(descriptors.map((item) => [item.proposalRef, item.proposalFingerprint]));
  const result: Record<string, TeamReviewOutcomeReceipt> = {};
  outcomes.forEach((receipt) => {
    if (result[receipt.proposalRef]) return;
    if (currentFingerprintByProposal.get(receipt.proposalRef) !== receipt.proposalFingerprint) return;
    result[receipt.proposalRef] = receipt;
  });
  return result;
};

export function TeamReviewWorkspace({ proposals, decisions, customTexts }: TeamReviewWorkspaceProps) {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const repository = useMemo(() => (client ? new SupabaseSharedTeamReviewRepository(client) : null), [client]);
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [fingerprints, setFingerprints] = useState<FingerprintMap>({});
  const [contributions, setContributions] = useState<Awaited<ReturnType<SupabaseSharedTeamReviewRepository['listContributions']>>>([]);
  const [outcomes, setOutcomes] = useState<TeamReviewOutcomeReceipt[]>([]);
  const [expectedContributorCount, setExpectedContributorCount] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedProposalRef, setSelectedProposalRef] = useState<string | null>(null);
  const [teamOutcome, setTeamOutcome] = useState<TeamReviewOutcome>('accept-proposal');
  const [sharedText, setSharedText] = useState('');
  const [rationale, setRationale] = useState('');

  const activeMemberships = memberships.filter((membership) => membership.status === 'active');
  const selectedMembership = activeMemberships.find((membership) => membership.workspaceId === workspaceId) ?? null;
  const canContribute = Boolean(selectedMembership && ['docente', 'dipartimento', 'referente'].includes(selectedMembership.role));
  const canRecordTeamOutcome = Boolean(selectedMembership && ['dipartimento', 'referente'].includes(selectedMembership.role));

  const proposalIdentityKey = useMemo(
    () => JSON.stringify(proposals.map((proposal) => [proposal.id, proposal.focus, proposal.oldText, proposal.newText])),
    [proposals],
  );

  useEffect(() => {
    let active = true;
    const compute = async () => {
      const entries = await Promise.all(proposals.map(async (proposal) => [
        proposal.id,
        await fingerprintTeamReviewProposal({
          proposalRef: proposal.id,
          focus: proposal.focus,
          oldText: proposal.oldText,
          newText: proposal.newText,
        }),
      ] as const));
      if (active) setFingerprints(Object.fromEntries(entries));
    };
    void compute().catch((error) => {
      if (active) setMessage(error instanceof Error ? error.message : 'Impossibile identificare le schede del team.');
    });
    return () => { active = false; };
  }, [proposalIdentityKey]);

  useEffect(() => {
    if (!client) return;
    const refreshSession = async (nextSession: Session | null) => {
      setSession(nextSession);
      if (!nextSession) {
        setMemberships([]);
        setWorkspaceId('');
        return;
      }
      const { data, error } = await client
        .from('workspace_memberships')
        .select('workspace_id,user_id,role,status')
        .eq('user_id', nextSession.user.id);
      if (error) {
        setMemberships([]);
        setMessage(`Membership non leggibile: ${error.message}`);
        return;
      }
      const resolved = ((data ?? []) as MembershipRow[])
        .map(toMembership)
        .filter((membership): membership is WorkspaceMembership => Boolean(membership));
      setMemberships(resolved);
      const active = resolved.filter((membership) => membership.status === 'active');
      const preferred = active.find((membership) => membership.role === 'dipartimento')
        ?? active.find((membership) => membership.role === 'referente')
        ?? active.find((membership) => membership.role === 'docente')
        ?? active[0];
      setWorkspaceId((current) => current && active.some((membership) => membership.workspaceId === current)
        ? current
        : preferred?.workspaceId ?? '');
    };

    void client.auth.getSession().then(({ data }) => refreshSession(data.session));
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      void refreshSession(nextSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, [client]);

  const descriptors = useMemo<TeamReviewProposalDescriptor[]>(() => proposals
    .filter((proposal) => Boolean(fingerprints[proposal.id]))
    .map((proposal) => ({
      proposalRef: proposal.id,
      focus: proposal.focus,
      proposalFingerprint: fingerprints[proposal.id],
    })), [proposals, fingerprints]);

  useEffect(() => {
    let active = true;
    if (!repository || !selectedMembership || !session || descriptors.length !== proposals.length) {
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      return () => { active = false; };
    }
    const context: WorkspaceActorContext = { membership: selectedMembership, assurance: 'authenticated-workspace' };
    setMessage(null);
    void Promise.all([
      repository.listContributions(context, selectedMembership.workspaceId),
      repository.listTeamOutcomes(context, selectedMembership.workspaceId),
      repository.getEligibleContributorCount(context, selectedMembership.workspaceId),
    ]).then(([nextContributions, nextOutcomes, nextExpectedContributorCount]) => {
      if (!active) return;
      setContributions(nextContributions);
      setOutcomes(nextOutcomes);
      setExpectedContributorCount(nextExpectedContributorCount);
    }).catch((error) => {
      if (!active) return;
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      setMessage(error instanceof Error ? error.message : 'Lavoro del team non leggibile.');
    });
    return () => { active = false; };
  }, [repository, selectedMembership?.workspaceId, selectedMembership?.role, session?.user.id, descriptors.length, proposalIdentityKey, refreshVersion]);

  const summary = useMemo(
    () => deriveTeamReviewSummary(descriptors, contributions, expectedContributorCount),
    [descriptors, contributions, expectedContributorCount],
  );
  const latestOutcomes = useMemo(() => latestCurrentOutcomes(outcomes, descriptors), [outcomes, descriptors]);
  const openDiscussionItems = summary.items.filter((item) => item.bucket !== 'shared' && !latestOutcomes[item.proposalRef]);
  const sharedItems = summary.items.filter((item) => item.bucket === 'shared');
  const resolvedItems = summary.items.filter((item) => Boolean(latestOutcomes[item.proposalRef]));
  const selectedItem = summary.items.find((item) => item.proposalRef === selectedProposalRef) ?? null;
  const localPreparedCount = proposals.filter((proposal) => Boolean(decisions[proposal.id])).length;

  if (optional.config.status !== 'configured' || !client) {
    return (
      <section aria-label="Lavoro del team" className="rounded-2xl border border-slate-200 bg-white p-4" data-team-meeting-workspace>
        <strong className="text-sm text-slate-900">Il lavoro del team</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">La sintesi condivisa è disponibile nel workspace autenticato. In modalità locale restano visibili e modificabili solo le tue scelte preparatorie.</p>
      </section>
    );
  }

  const routerBasename = resolveRouterBasename(import.meta.env.MODE).replace(/\/$/, '');
  const identityHref = `${routerBasename}/beta-identity`;

  const publishPreparation = async () => {
    if (!repository || !selectedMembership || !session || !canContribute || descriptors.length !== proposals.length) return;
    const context: WorkspaceActorContext = { membership: selectedMembership, assurance: 'authenticated-workspace' };
    const publishable = proposals.filter((proposal) => Boolean(localOrientation(decisions[proposal.id])));
    const invalidCustom = publishable.find((proposal) => decisions[proposal.id] === 'custom' && !customTexts[proposal.id]?.trim());
    if (invalidCustom) {
      setMessage(`Completa la modifica proposta per “${invalidCustom.focus}” prima di condividerla con il team.`);
      return;
    }
    if (publishable.length === 0) {
      setMessage('Non ci sono ancora orientamenti individuali da condividere con il team.');
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      for (const proposal of publishable) {
        const orientation = localOrientation(decisions[proposal.id]);
        if (!orientation) continue;
        await repository.upsertContribution(context, {
          workspaceId: selectedMembership.workspaceId,
          proposalRef: proposal.id,
          proposalFingerprint: fingerprints[proposal.id],
          orientation,
          customText: orientation === 'propose-change' ? customTexts[proposal.id] : null,
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage(`${publishable.length} contributi aggiornati nel workspace. Restano orientamenti preparatori, non decisioni del team.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Contributi non registrati.');
    } finally {
      setBusy(false);
    }
  };

  const recordOutcome = async () => {
    if (!repository || !selectedMembership || !session || !canRecordTeamOutcome || !selectedItem) return;
    if (!rationale.trim()) {
      setMessage('Aggiungi la motivazione sintetica dell’esito concordato dal team.');
      return;
    }
    if (teamOutcome === 'shared-text' && !sharedText.trim()) {
      setMessage('Scrivi il testo condiviso concordato dal team.');
      return;
    }
    const context: WorkspaceActorContext = { membership: selectedMembership, assurance: 'authenticated-workspace' };
    setBusy(true);
    setMessage(null);
    try {
      await repository.recordTeamOutcome(context, {
        workspaceId: selectedMembership.workspaceId,
        proposalRef: selectedItem.proposalRef,
        proposalFingerprint: selectedItem.proposalFingerprint,
        outcome: teamOutcome,
        sharedText: teamOutcome === 'shared-text' ? sharedText : null,
        rationale,
        clientRequestId: createRequestId(),
      });
      setSelectedProposalRef(null);
      setSharedText('');
      setRationale('');
      setTeamOutcome('accept-proposal');
      setRefreshVersion((value) => value + 1);
      setMessage('Esito del team registrato. Non è un’approvazione istituzionale e non modifica automaticamente il curricolo vigente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esito del team non registrato.');
    } finally {
      setBusy(false);
    }
  };

  const confirmSharedItems = async () => {
    if (!repository || !selectedMembership || !session || !canRecordTeamOutcome) return;
    const pendingShared = sharedItems.filter((item) => item.coverageComplete && !latestOutcomes[item.proposalRef]);
    if (pendingShared.length === 0) {
      setMessage('Non ci sono punti con copertura completa ancora da registrare come esito del team.');
      return;
    }
    const context: WorkspaceActorContext = { membership: selectedMembership, assurance: 'authenticated-workspace' };
    setBusy(true);
    setMessage(null);
    try {
      for (const item of pendingShared) {
        const outcome: TeamReviewOutcome = item.counts['keep-previous'] > 0 ? 'keep-previous' : 'accept-proposal';
        await repository.recordTeamOutcome(context, {
          workspaceId: selectedMembership.workspaceId,
          proposalRef: item.proposalRef,
          proposalFingerprint: item.proposalFingerprint,
          outcome,
          sharedText: null,
          rationale: 'Punto confermato dal team come già condiviso durante la riunione, con copertura completa dei contributori del workspace.',
          clientRequestId: createRequestId(),
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage(`${pendingShared.length} punti con copertura completa registrati come esito del team senza riaprire la lettura delle schede.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esiti condivisi non registrati.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="Lavoro del team" className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4" data-team-meeting-workspace>
      <div>
        <strong className="block text-base text-slate-900">Il lavoro del team</strong>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">Arena raccoglie i contributi autenticati e porta in riunione soprattutto ciò che richiede confronto. Il parere individuale, l’esito del team e la decisione istituzionale restano tre passaggi distinti.</p>
      </div>

      {!session ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Per vedere o condividere il lavoro del team, <a href={identityHref} className="font-bold underline">accedi</a>.</div>
      ) : activeMemberships.length === 0 ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">La sessione è autenticata, ma non esiste una membership attiva per un workspace.</div>
      ) : (
        <>
          {activeMemberships.length > 1 && (
            <label className="block text-xs font-semibold text-slate-700">Workspace
              <select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2">
                {activeMemberships.map((membership) => <option key={membership.workspaceId} value={membership.workspaceId}>{membership.workspaceId} · {membership.role}</option>)}
              </select>
            </label>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600"><strong className="text-slate-800">Il tuo lavoro:</strong> {localPreparedCount} schede preparate localmente.</div>
            <button type="button" disabled={busy || !canContribute || localPreparedCount === 0} onClick={() => void publishPreparation()} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Condividi il mio lavoro con il team</button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600" data-team-review-coverage>
            <strong className="text-slate-800">Copertura del team:</strong>{' '}
            {expectedContributorCount === null
              ? 'non verificabile — nessun punto può essere considerato già condiviso.'
              : `${expectedContributorCount} contributori attivi attesi nel workspace selezionato.`}
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Sintesi del lavoro del team">
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.shared}</strong><span className="text-xs text-slate-600">punti già condivisi</span><span className="mt-1 block text-[10px] text-slate-400">solo con copertura completa</span></div>
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.changeProposed}</strong><span className="text-xs text-slate-600">modifiche proposte</span><span className="mt-1 block text-[10px] text-slate-400">da esaminare</span></div>
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.divergent}</strong><span className="text-xs text-slate-600">opinioni diverse</span><span className="mt-1 block text-[10px] text-slate-400">da decidere insieme</span></div>
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.needsClarification}</strong><span className="text-xs text-slate-600">punti da chiarire</span><span className="mt-1 block text-[10px] text-slate-400">manca copertura o un contributo corrente</span></div>
          </div>

          {sharedItems.length > 0 && (
            <details className="rounded-xl border border-emerald-200 bg-emerald-50/50">
              <summary className="cursor-pointer p-3 text-xs font-bold text-emerald-900">{sharedItems.length} punti già condivisi — mostra solo se serve</summary>
              <div className="space-y-2 border-t border-emerald-100 p-3">
                {sharedItems.map((item) => (
                  <div key={item.proposalRef} className="flex items-center justify-between gap-3 rounded-lg bg-white p-2 text-xs">
                    <span className="min-w-0 truncate text-slate-700">{item.focus}</span>
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-700">{item.contributionCount}/{item.expectedContributorCount ?? '—'} contributi correnti</span>
                  </div>
                ))}
                {canRecordTeamOutcome && <button type="button" disabled={busy} onClick={() => void confirmSharedItems()} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Registra i punti condivisi confermati dal team</button>}
              </div>
            </details>
          )}

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <div><strong className="text-sm text-slate-900">Da discutere</strong><p className="text-xs text-slate-500">Solo i punti che richiedono confronto o chiarimento e non hanno ancora un esito del team.</p></div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">{openDiscussionItems.length} aperti</span>
            </div>

            {openDiscussionItems.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-white p-3 text-xs text-emerald-800">Nessun punto aperto da discutere per le versioni correnti.</div>
            ) : openDiscussionItems.map((item) => (
              <article key={item.proposalRef} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0"><strong className="block text-sm text-slate-900">{item.focus}</strong><span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{BUCKET_LABELS[item.bucket]}</span></div>
                  <span className="text-[10px] text-slate-500">{item.contributionCount}/{item.expectedContributorCount ?? '—'} contributi correnti</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['confirm-proposal']} confermano</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['propose-change']} propongono modifica</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['keep-previous']} mantengono il precedente</span>
                  {item.staleContributionCount > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{item.staleContributionCount} contributi da aggiornare</span>}
                  {!item.coverageComplete && item.bucket === 'needs-clarification' && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">copertura incompleta</span>}
                </div>
                {item.proposedTexts.length > 0 && (
                  <details className="mt-3 rounded-lg border border-amber-100 bg-amber-50/40">
                    <summary className="cursor-pointer p-2 text-xs font-semibold text-amber-900">Leggi le modifiche proposte</summary>
                    <div className="space-y-2 border-t border-amber-100 p-2 text-xs leading-relaxed text-slate-700">{item.proposedTexts.map((text) => <p key={text} className="rounded-lg bg-white p-2">{text}</p>)}</div>
                  </details>
                )}
                {canRecordTeamOutcome ? (
                  <button type="button" onClick={() => { setSelectedProposalRef(item.proposalRef); setTeamOutcome('accept-proposal'); setSharedText(''); setRationale(''); }} className="mt-3 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Registra l’esito del team</button>
                ) : (
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Puoi consultare il confronto. L’esito del team può essere registrato da una membership di dipartimento o referente; non è una deliberazione istituzionale.</p>
                )}
              </article>
            ))}
          </div>

          {selectedItem && canRecordTeamOutcome && (
            <div className="rounded-xl border-2 border-indigo-200 bg-white p-4" aria-label="Esito del team">
              <strong className="block text-sm text-slate-900">Esito del team · {selectedItem.focus}</strong>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Registra ciò che il gruppo ha concordato durante il confronto. Questa ricevuta resta separata dalla successiva decisione istituzionale.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(Object.entries(TEAM_OUTCOME_LABELS) as [TeamReviewOutcome, string][]).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setTeamOutcome(value)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${teamOutcome === value ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{label}</button>
                ))}
              </div>
              {teamOutcome === 'shared-text' && <textarea value={sharedText} onChange={(event) => setSharedText(event.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Testo condiviso concordato dal team…" />}
              <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Motivazione sintetica dell’esito concordato…" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => void recordOutcome()} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Registra esito del team</button>
                <button type="button" disabled={busy} onClick={() => setSelectedProposalRef(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">Annulla</button>
              </div>
            </div>
          )}

          {resolvedItems.length > 0 && (
            <details className="rounded-xl border border-slate-200 bg-white">
              <summary className="cursor-pointer p-3 text-xs font-bold text-slate-700">{resolvedItems.length} esiti del team già registrati</summary>
              <div className="space-y-2 border-t border-slate-100 p-3">
                {resolvedItems.map((item) => {
                  const receipt = latestOutcomes[item.proposalRef];
                  return <div key={item.proposalRef} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700"><strong>{item.focus}</strong><span className="mt-1 block">{TEAM_OUTCOME_LABELS[receipt.outcome]} · {new Date(receipt.recordedAt).toLocaleString('it-IT')}</span><span className="mt-1 block text-[10px] text-slate-500">Esito del team, non approvazione istituzionale.</span></div>;
                })}
              </div>
            </details>
          )}
        </>
      )}

      {message && <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">{message}</div>}
    </section>
  );
}
