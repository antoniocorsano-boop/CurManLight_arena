import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { DecisionStatus, Proposal, SchoolOrder } from '../../types/curriculum';
import {
  getOperationalGroupForDiscipline,
  type OperationalGroupDefinition,
} from '../../domain/institution/operationalGroups';
import type {
  OperationalGroupMembership,
  TeamReviewItemSummary,
  TeamReviewOutcome,
  TeamReviewOutcomeReceipt,
  TeamReviewProposalDescriptor,
  TeamReviewScope,
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
  discipline: string;
  order: SchoolOrder;
  academicYear: string;
}

type FingerprintMap = Record<string, string>;

const VALID_ROLES: readonly WorkspaceMemberRole[] = ['docente', 'dipartimento', 'referente', 'collegio', 'dirigente', 'amministratore'];
const ROLE_LABELS: Record<WorkspaceMemberRole, string> = {
  docente: 'Docente',
  dipartimento: 'Dipartimento',
  referente: 'Referente',
  collegio: 'Collegio',
  dirigente: 'Dirigente',
  amministratore: 'Amministratore',
};
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
const MEETING_REASON_LABELS: Record<TeamReviewItemSummary['bucket'], string> = {
  shared: 'Su questo punto i pareri raccolti coincidono.',
  'change-proposed': 'Ci sono modifiche proposte da confrontare insieme.',
  divergent: 'I pareri non coincidono: serve una decisione condivisa del team.',
  'needs-clarification': 'Manca ancora qualche parere oppure un parere deve essere aggiornato.',
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

const stateLabel = (membership: OperationalGroupMembership | null): string => {
  if (!membership) return 'Profilo operativo da completare';
  return membership.membershipState === 'FORMALIZZATO' ? 'Gruppo formalizzato' : 'Gruppo operativo provvisorio';
};

const UnsupportedReviewScope = ({ order, discipline }: { order: SchoolOrder; discipline: string }) => {
  if (discipline === 'educazioneCivica') {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" data-team-meeting-workspace>
        <strong className="text-sm text-amber-950">Educazione civica è un asse trasversale</strong>
        <p className="mt-1 text-xs leading-relaxed text-amber-900">La validazione non viene assegnata a un gruppo fisso: Arena deve conoscere il nucleo interno della singola formulazione e il gruppo responsabile collegato a quel nucleo.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4" data-team-meeting-workspace>
      <strong className="text-sm text-slate-900">Lavoro di gruppo non configurato per questo contesto</strong>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">I gruppi operativi di questa fase riguardano scuola primaria e scuola secondaria di primo grado. Il contesto corrente è {order} · {discipline}.</p>
    </section>
  );
};

export function TeamReviewWorkspace({
  proposals,
  decisions,
  customTexts,
  discipline,
  order,
  academicYear,
}: TeamReviewWorkspaceProps) {
  const group = useMemo<OperationalGroupDefinition | null>(
    () => getOperationalGroupForDiscipline(order, discipline),
    [order, discipline],
  );
  const scope = useMemo<TeamReviewScope | null>(() => group ? ({
    academicYear,
    order: group.order,
    groupCode: group.code,
    discipline,
  }) : null, [academicYear, discipline, group]);

  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const repository = useMemo(() => (client ? new SupabaseSharedTeamReviewRepository(client) : null), [client]);
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [operationalMembership, setOperationalMembership] = useState<OperationalGroupMembership | null>(null);
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
  const [guidedMeeting, setGuidedMeeting] = useState(false);

  const activeMemberships = memberships.filter((membership) => membership.status === 'active');
  const selectedMembership = activeMemberships.find((membership) => membership.workspaceId === workspaceId) ?? null;
  const hasDisciplineCompetence = Boolean(operationalMembership?.disciplines.includes(discipline));
  const canContribute = Boolean(
    selectedMembership
    && ['docente', 'dipartimento', 'referente'].includes(selectedMembership.role)
    && hasDisciplineCompetence,
  );
  const canRecordTeamOutcome = Boolean(
    selectedMembership
    && ['docente', 'dipartimento', 'referente'].includes(selectedMembership.role)
    && operationalMembership?.memberRole === 'coordinatore',
  );

  const proposalIdentityKey = useMemo(
    () => JSON.stringify([academicYear, order, discipline, group?.code, proposals.map((proposal) => [proposal.id, proposal.focus, proposal.oldText, proposal.newText])]),
    [academicYear, order, discipline, group?.code, proposals],
  );

  useEffect(() => {
    let active = true;
    if (!scope) {
      setFingerprints({});
      return () => { active = false; };
    }
    const compute = async () => {
      const entries = await Promise.all(proposals.map(async (proposal) => [
        proposal.id,
        await fingerprintTeamReviewProposal({
          ...scope,
          proposalRef: proposal.id,
          focus: proposal.focus,
          oldText: proposal.oldText,
          newText: proposal.newText,
        }),
      ] as const));
      if (active) setFingerprints(Object.fromEntries(entries));
    };
    void compute().catch(() => {
      if (active) setMessage('Non riesco a preparare le schede del team. Riprova tra poco.');
    });
    return () => { active = false; };
  }, [proposalIdentityKey, scope]);

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
        setMessage('Non riesco a verificare il tuo accesso al team. Riprova tra poco.');
        return;
      }
      const resolved = ((data ?? []) as MembershipRow[])
        .map(toMembership)
        .filter((membership): membership is WorkspaceMembership => Boolean(membership));
      setMemberships(resolved);
      const active = resolved.filter((membership) => membership.status === 'active');
      const preferred = active.find((membership) => ['dipartimento', 'referente', 'docente'].includes(membership.role)) ?? active[0];
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

  const descriptors = useMemo<TeamReviewProposalDescriptor[]>(() => scope ? proposals
    .filter((proposal) => Boolean(fingerprints[proposal.id]))
    .map((proposal) => ({
      ...scope,
      proposalRef: proposal.id,
      focus: proposal.focus,
      proposalFingerprint: fingerprints[proposal.id],
    })) : [], [proposals, fingerprints, scope]);

  useEffect(() => {
    let active = true;
    if (!repository || !selectedMembership || !session || !scope || descriptors.length !== proposals.length) {
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      setOperationalMembership(null);
      return () => { active = false; };
    }
    const context: WorkspaceActorContext = { membership: selectedMembership, assurance: 'authenticated-workspace' };
    setMessage(null);
    void Promise.all([
      repository.listContributions(context, selectedMembership.workspaceId, scope),
      repository.listTeamOutcomes(context, selectedMembership.workspaceId, scope),
      repository.getEligibleContributorCount(context, selectedMembership.workspaceId, scope),
      repository.getMyOperationalMembership(context, scope),
    ]).then(([nextContributions, nextOutcomes, nextExpectedContributorCount, nextOperationalMembership]) => {
      if (!active) return;
      setContributions(nextContributions);
      setOutcomes(nextOutcomes);
      setExpectedContributorCount(nextExpectedContributorCount);
      setOperationalMembership(nextOperationalMembership);
    }).catch(() => {
      if (!active) return;
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      setOperationalMembership(null);
      setMessage('Non riesco a caricare il lavoro del team. Riprova tra poco.');
    });
    return () => { active = false; };
  }, [repository, selectedMembership?.workspaceId, selectedMembership?.role, session?.user.id, descriptors.length, proposalIdentityKey, refreshVersion, scope]);

  const summary = useMemo(
    () => deriveTeamReviewSummary(descriptors, contributions, expectedContributorCount),
    [descriptors, contributions, expectedContributorCount],
  );
  const latestOutcomes = useMemo(() => latestCurrentOutcomes(outcomes, descriptors), [outcomes, descriptors]);
  const openDiscussionItems = summary.items.filter((item) => item.bucket !== 'shared' && !latestOutcomes[item.proposalRef]);
  const sharedItems = summary.items.filter((item) => item.bucket === 'shared');
  const resolvedItems = summary.items.filter((item) => Boolean(latestOutcomes[item.proposalRef]));
  const selectedItem = summary.items.find((item) => item.proposalRef === selectedProposalRef) ?? null;
  const guidedItem = guidedMeeting ? openDiscussionItems[0] ?? null : null;
  const localPreparedCount = proposals.filter((proposal) => Boolean(decisions[proposal.id])).length;

  if (!scope || !group) return <UnsupportedReviewScope order={order} discipline={discipline} />;

  if (optional.config.status !== 'configured' || !client) {
    return (
      <section aria-label="Lavoro del team" className="rounded-2xl border border-slate-200 bg-white p-4" data-team-meeting-workspace>
        <strong className="text-sm text-slate-900">Il lavoro del team</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{group.code} · {group.label}. Senza accesso condiviso puoi preparare le tue scelte; i pareri del gruppo richiedono un accesso autenticato.</p>
      </section>
    );
  }

  const routerBasename = resolveRouterBasename(import.meta.env.MODE).replace(/\/$/, '');
  const identityHref = `${routerBasename}/beta-identity`;

  const openDecision = (proposalRef: string) => {
    setSelectedProposalRef(proposalRef);
    setTeamOutcome('accept-proposal');
    setSharedText('');
    setRationale('');
  };

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
      setMessage('Non hai ancora preparato nessuna scheda da condividere con il team.');
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
          ...scope,
          proposalRef: proposal.id,
          proposalFingerprint: fingerprints[proposal.id],
          orientation,
          customText: orientation === 'propose-change' ? customTexts[proposal.id] : null,
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage(`${publishable.length} schede condivise con il team. Sono i tuoi pareri personali: non sono ancora una decisione del team.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Non riesco a condividere il tuo lavoro con il team. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const recordOutcome = async () => {
    if (!repository || !selectedMembership || !session || !canRecordTeamOutcome || !selectedItem) return;
    if (!rationale.trim()) {
      setMessage('Aggiungi una breve motivazione della decisione del team.');
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
        ...scope,
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
      setMessage(guidedMeeting
        ? 'Decisione registrata. Arena prepara il prossimo punto ancora aperto.'
        : 'Decisione del team registrata. Non è ancora l’approvazione dell’Istituto e non modifica da sola il curricolo vigente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Non riesco a registrare la decisione del team. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const confirmSharedItems = async () => {
    if (!repository || !selectedMembership || !session || !canRecordTeamOutcome) return;
    const pendingShared = sharedItems.filter((item) => item.coverageComplete && !latestOutcomes[item.proposalRef]);
    if (pendingShared.length === 0) {
      setMessage('Non ci sono punti già condivisi da confermare in riunione.');
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
          ...scope,
          proposalRef: item.proposalRef,
          proposalFingerprint: item.proposalFingerprint,
          outcome,
          sharedText: null,
          rationale: 'Il gruppo ha confermato durante la riunione un punto su cui tutti i docenti competenti avevano già espresso lo stesso orientamento.',
          clientRequestId: createRequestId(),
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage(`${pendingShared.length} punti già condivisi registrati come decisione del team senza rileggerli uno per uno.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Non riesco a registrare i punti già condivisi. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="Lavoro del team" className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4" data-team-meeting-workspace>
      <div>
        <strong className="block text-base text-slate-900">Il lavoro del team</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">Arena porta in riunione soprattutto ciò che richiede confronto. Quello che indichi tu è un parere personale; la decisione del team viene registrata a parte; l’approvazione dell’Istituto avviene ancora dopo.</p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-white p-3 text-xs leading-relaxed text-slate-700" data-operational-group-context>
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-indigo-950">{group.code} · {group.label}</strong>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-800">{discipline}</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${operationalMembership?.membershipState === 'FORMALIZZATO' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{stateLabel(operationalMembership)}</span>
        </div>
        <p className="mt-2">L’appartenenza al gruppo e la competenza disciplinare restano distinte. Per questa scheda Arena considera soltanto chi ha dichiarato competenza in <strong>{discipline}</strong>.</p>
        {operationalMembership?.memberRole === 'coordinatore' && <p className="mt-1 font-semibold text-indigo-900">Sei coordinatore operativo di questo gruppo. Puoi guidare il confronto e registrare l’esito; questo non ti attribuisce competenza nelle altre discipline.</p>}
        {operationalMembership?.membershipState === 'OPERATIVO_PROVVISORIO' && <p className="mt-1 text-amber-800">Gli esiti registrati restano esiti professionali del gruppo operativo provvisorio e non costituiscono approvazione istituzionale.</p>}
      </div>

      {!session ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Per vedere il lavoro condiviso, <a href={identityHref} className="font-bold underline">accedi ad Arena</a>.</div>
      ) : activeMemberships.length === 0 ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Il tuo accesso è attivo, ma non risulti ancora associato a uno spazio condiviso.</div>
      ) : !operationalMembership ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Completa il profilo operativo indicando le discipline di competenza. Arena assocerà automaticamente il gruppo in base alla disciplina.</div>
      ) : (
        <>
          {activeMemberships.length > 1 && (
            <label className="block text-xs font-semibold text-slate-700">Scegli lo spazio condiviso
              <select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2">
                {activeMemberships.map((membership, index) => <option key={membership.workspaceId} value={membership.workspaceId}>Spazio {index + 1} · {ROLE_LABELS[membership.role]}</option>)}
              </select>
            </label>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600"><strong className="text-slate-800">Il tuo lavoro:</strong> hai preparato {localPreparedCount} schede.</div>
            <button type="button" disabled={busy || !canContribute || localPreparedCount === 0} onClick={() => void publishPreparation()} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Condividi il mio lavoro con il team</button>
          </div>

          {!hasDisciplineCompetence && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Appartieni al gruppo, ma non hai dichiarato questa disciplina tra le tue competenze. Puoi seguire il confronto, ma il tuo parere non entra nella validazione disciplinare.</div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600" data-team-review-coverage>
            <strong className="text-slate-800">Partecipazione del team:</strong>{' '}
            {expectedContributorCount === null
              ? 'non riesco a verificarla in questo momento.'
              : expectedContributorCount === 0
                ? `nessun docente competente in ${discipline} risulta ancora associato a questo spazio.`
                : `Per considerare un punto già condiviso servono i pareri di tutti i ${expectedContributorCount} docenti competenti in ${discipline}.`}
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Sintesi del lavoro del team">
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.shared}</strong><span className="text-xs text-slate-600">punti già condivisi</span><span className="mt-1 block text-[10px] text-slate-400">solo quando hanno partecipato tutti i competenti</span></div>
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.changeProposed}</strong><span className="text-xs text-slate-600">modifiche proposte</span><span className="mt-1 block text-[10px] text-slate-400">da esaminare</span></div>
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.divergent}</strong><span className="text-xs text-slate-600">opinioni diverse</span><span className="mt-1 block text-[10px] text-slate-400">da decidere insieme</span></div>
            <div className="rounded-xl bg-white p-3"><strong className="block text-xl text-slate-900">{summary.needsClarification}</strong><span className="text-xs text-slate-600">punti da chiarire</span><span className="mt-1 block text-[10px] text-slate-400">manca ancora qualche parere o va aggiornato</span></div>
          </div>

          {canRecordTeamOutcome && (
            <section className="rounded-xl border border-indigo-200 bg-white p-4" data-guided-team-meeting aria-label="Riunione guidata">
              {!guidedMeeting ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <strong className="block text-sm text-slate-900">Riunione guidata</strong>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{openDiscussionItems.length > 0 ? `Ci sono ${openDiscussionItems.length} punti che richiedono ancora una decisione. Arena può accompagnarvi uno alla volta.` : 'Non ci sono punti aperti da discutere in questo momento.'}</p>
                  </div>
                  {openDiscussionItems.length > 0 && <button type="button" onClick={() => setGuidedMeeting(true)} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Inizia dai punti da discutere</button>}
                </div>
              ) : guidedItem ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Punto da affrontare ora</span><strong className="mt-1 block text-base text-slate-900">{guidedItem.focus}</strong><p className="mt-1 text-xs text-slate-500">{openDiscussionItems.length} {openDiscussionItems.length === 1 ? 'punto ancora aperto' : 'punti ancora aperti'}.</p></div>
                    <button type="button" onClick={() => setGuidedMeeting(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Esci dalla riunione guidata</button>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-slate-700"><strong className="text-amber-900">Perché ne parliamo?</strong><span className="mt-1 block">{MEETING_REASON_LABELS[guidedItem.bucket]}</span></div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600"><span className="rounded-full bg-slate-100 px-2 py-1">{guidedItem.counts['confirm-proposal']} confermano</span><span className="rounded-full bg-slate-100 px-2 py-1">{guidedItem.counts['propose-change']} propongono modifica</span><span className="rounded-full bg-slate-100 px-2 py-1">{guidedItem.counts['keep-previous']} mantengono il precedente</span></div>
                  {guidedItem.proposedTexts.length > 0 && <details className="rounded-lg border border-amber-100 bg-amber-50/40"><summary className="cursor-pointer p-2 text-xs font-semibold text-amber-900">Leggi le formulazioni proposte</summary><div className="space-y-2 border-t border-amber-100 p-2 text-xs leading-relaxed text-slate-700">{guidedItem.proposedTexts.map((text) => <p key={text} className="rounded-lg bg-white p-2">{text}</p>)}</div></details>}
                  <button type="button" onClick={() => openDecision(guidedItem.proposalRef)} className="rounded-lg bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white">Decidi questo punto con il team</button>
                </div>
              ) : (
                <div><strong className="block text-sm text-emerald-800">Avete affrontato tutti i punti aperti.</strong><p className="mt-1 text-xs leading-relaxed text-slate-600">Sono state registrate {resolvedItems.length} decisioni del team. Gli eventuali punti già condivisi possono essere confermati senza rileggerli uno per uno.</p><button type="button" onClick={() => setGuidedMeeting(false)} className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Chiudi la riunione guidata</button></div>
              )}
            </section>
          )}

          {sharedItems.length > 0 && (
            <details className="rounded-xl border border-emerald-200 bg-emerald-50/50">
              <summary className="cursor-pointer p-3 text-xs font-bold text-emerald-900">{sharedItems.length} punti già condivisi — mostra solo se serve</summary>
              <div className="space-y-2 border-t border-emerald-100 p-3">
                {sharedItems.map((item) => <div key={item.proposalRef} className="flex items-center justify-between gap-3 rounded-lg bg-white p-2 text-xs"><span className="min-w-0 truncate text-slate-700">{item.focus}</span><span className="shrink-0 text-[10px] font-semibold text-emerald-700">{item.contributionCount} di {item.expectedContributorCount ?? '—'} hanno partecipato</span></div>)}
                {canRecordTeamOutcome && <button type="button" disabled={busy} onClick={() => void confirmSharedItems()} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Conferma in riunione i punti già condivisi</button>}
              </div>
            </details>
          )}

          {!guidedMeeting && (
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-3"><div><strong className="text-sm text-slate-900">Da discutere</strong><p className="text-xs text-slate-500">Solo ciò che richiede ancora un confronto del team.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">{openDiscussionItems.length} aperti</span></div>
              {openDiscussionItems.length === 0 ? <div className="rounded-xl border border-emerald-200 bg-white p-3 text-xs text-emerald-800">Non ci sono punti da discutere in questo momento.</div> : openDiscussionItems.map((item) => (
                <article key={item.proposalRef} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><strong className="block text-sm text-slate-900">{item.focus}</strong><span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{BUCKET_LABELS[item.bucket]}</span></div><span className="text-[10px] text-slate-500">{item.contributionCount} di {item.expectedContributorCount ?? '—'} hanno partecipato</span></div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600"><span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['confirm-proposal']} confermano</span><span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['propose-change']} propongono modifica</span><span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['keep-previous']} mantengono il precedente</span>{item.staleContributionCount > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{item.staleContributionCount} pareri da aggiornare</span>}{!item.coverageComplete && item.bucket === 'needs-clarification' && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">manca ancora qualche parere</span>}</div>
                  {item.proposedTexts.length > 0 && <details className="mt-3 rounded-lg border border-amber-100 bg-amber-50/40"><summary className="cursor-pointer p-2 text-xs font-semibold text-amber-900">Leggi le modifiche proposte</summary><div className="space-y-2 border-t border-amber-100 p-2 text-xs leading-relaxed text-slate-700">{item.proposedTexts.map((text) => <p key={text} className="rounded-lg bg-white p-2">{text}</p>)}</div></details>}
                  {canRecordTeamOutcome ? <button type="button" onClick={() => openDecision(item.proposalRef)} className="mt-3 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Registra la decisione del team</button> : <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Puoi consultare il confronto. La decisione del team viene registrata dal coordinatore operativo. Non è ancora l’approvazione dell’Istituto.</p>}
                </article>
              ))}
            </div>
          )}

          {selectedItem && canRecordTeamOutcome && (
            <div className="rounded-xl border-2 border-indigo-200 bg-white p-4" aria-label="Decisione del team">
              <strong className="block text-sm text-slate-900">Decisione del team · {selectedItem.focus}</strong>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Registra ciò che il gruppo ha concordato durante il confronto. Questa registrazione non è l’approvazione dell’Istituto.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{(Object.entries(TEAM_OUTCOME_LABELS) as [TeamReviewOutcome, string][]).map(([value, label]) => <button key={value} type="button" onClick={() => setTeamOutcome(value)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${teamOutcome === value ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{label}</button>)}</div>
              {teamOutcome === 'shared-text' && <textarea value={sharedText} onChange={(event) => setSharedText(event.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Testo condiviso concordato dal team…" />}
              <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Breve motivazione della decisione…" />
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void recordOutcome()} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Registra decisione del team</button><button type="button" disabled={busy} onClick={() => setSelectedProposalRef(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">Annulla</button></div>
            </div>
          )}

          {resolvedItems.length > 0 && (
            <details className="rounded-xl border border-slate-200 bg-white">
              <summary className="cursor-pointer p-3 text-xs font-bold text-slate-700">{resolvedItems.length} decisioni del team già registrate</summary>
              <div className="space-y-2 border-t border-slate-100 p-3">{resolvedItems.map((item) => { const receipt = latestOutcomes[item.proposalRef]; return <div key={item.proposalRef} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700"><strong>{item.focus}</strong><span className="mt-1 block">{TEAM_OUTCOME_LABELS[receipt.outcome]} · {new Date(receipt.recordedAt).toLocaleString('it-IT')}</span><span className="mt-1 block text-[10px] text-slate-500">{receipt.authorityState === 'FORMALIZZATO' ? 'Gruppo formalizzato' : 'Gruppo operativo provvisorio'} · Decisione del team, non approvazione dell’Istituto.</span></div>; })}</div>
            </details>
          )}

          {message && <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">{message}</div>}
        </>
      )}
    </section>
  );
}
