import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Proposal, SchoolOrder } from '../../types/curriculum';
import { getOperationalGroupForDiscipline } from '../../domain/institution/operationalGroups';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
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
import {
  contributionOrientationLabel,
  contributionOriginLabel,
  deriveTeamDiscussionReason,
  teamReviewVersionStatusLabel,
} from '../../domain/revision/teamReviewProvenance';
import { SupabaseSharedTeamReviewRepository } from '../../infrastructure/supabase/sharedTeamReviewRepository';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

export type TeamCoordinationMode = 'status' | 'compare' | 'record';

export interface TeamCoordinationSessionState {
  total: number;
  openDiscussionCount: number;
  pendingSharedOutcomeCount: number;
  resolvedCount: number;
  remainingOutcomeCount: number;
  allCurrentOutcomesRecorded: boolean;
  canRecordTeamOutcome: boolean;
}

export interface TeamCoordinationWorkspaceProps {
  proposals: Proposal[];
  discipline: string;
  order: SchoolOrder;
  academicYear: string;
  mode?: TeamCoordinationMode;
  outcomeProposalRef?: string | null;
  onSessionStateChange?: (state: TeamCoordinationSessionState) => void;
  onRequestRecordOutcome?: (proposalRef: string | null) => void;
  onOutcomeRecorded?: () => void;
}

type FingerprintMap = Record<string, string>;

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

const roleLabel = (role: string): string => {
  if (role === 'dipartimento') return 'Coordinatore di dipartimento';
  if (role === 'referente') return 'Referente';
  if (role === 'docente') return 'Docente';
  return role;
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

export function TeamCoordinationWorkspace({
  proposals,
  discipline,
  order,
  academicYear,
  mode = 'compare',
  outcomeProposalRef = null,
  onSessionStateChange,
  onRequestRecordOutcome,
  onOutcomeRecorded,
}: TeamCoordinationWorkspaceProps) {
  const team = useTeamWorkspaceContext();
  const repository = useMemo(
    () => (team.client ? new SupabaseSharedTeamReviewRepository(team.client) : null),
    [team.client],
  );
  const group = useMemo(() => getOperationalGroupForDiscipline(order, discipline), [order, discipline]);
  const scope = useMemo<TeamReviewScope | null>(() => group ? ({
    academicYear,
    order: group.order,
    groupCode: group.code,
    discipline,
  }) : null, [academicYear, group, discipline]);
  const [operationalMembership, setOperationalMembership] = useState<OperationalGroupMembership | null>(null);
  const [fingerprints, setFingerprints] = useState<FingerprintMap>({});
  const [contributions, setContributions] = useState<Awaited<ReturnType<SupabaseSharedTeamReviewRepository['listContributions']>>>([]);
  const [outcomes, setOutcomes] = useState<TeamReviewOutcomeReceipt[]>([]);
  const [expectedContributorCount, setExpectedContributorCount] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [teamOutcome, setTeamOutcome] = useState<TeamReviewOutcome>('accept-proposal');
  const [sharedText, setSharedText] = useState('');
  const [rationale, setRationale] = useState('');

  const proposalIdentityKey = useMemo(
    () => JSON.stringify([academicYear, order, discipline, group?.code, proposals.map((proposal) => [proposal.id, proposal.focus, proposal.oldText, proposal.newText])]),
    [academicYear, order, discipline, group?.code, proposals],
  );

  useEffect(() => {
    setTeamOutcome('accept-proposal');
    setSharedText('');
    setRationale('');
    setMessage(null);
  }, [outcomeProposalRef, mode]);

  useEffect(() => {
    let active = true;
    if (!scope) {
      setFingerprints({});
      return () => { active = false; };
    }
    void Promise.all(proposals.map(async (proposal) => [
      proposal.id,
      await fingerprintTeamReviewProposal({
        ...scope,
        proposalRef: proposal.id,
        focus: proposal.focus,
        oldText: proposal.oldText,
        newText: proposal.newText,
      }),
    ] as const)).then((entries) => {
      if (active) setFingerprints(Object.fromEntries(entries));
    }).catch((error) => {
      if (active) setMessage(error instanceof Error ? error.message : 'Impossibile identificare le versioni delle schede.');
    });
    return () => { active = false; };
  }, [proposalIdentityKey, scope, proposals]);

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
    if (!repository || !team.selectedMembership || !team.session || !scope || descriptors.length !== proposals.length) {
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      setOperationalMembership(null);
      return () => { active = false; };
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };
    setMessage(null);

    void Promise.all([
      repository.listContributions(context, team.selectedMembership.workspaceId, scope),
      repository.listTeamOutcomes(context, team.selectedMembership.workspaceId, scope),
      repository.getEligibleContributorCount(context, team.selectedMembership.workspaceId, scope),
      repository.getMyOperationalMembership(context, scope),
    ]).then(([nextContributions, nextOutcomes, nextExpectedContributorCount, nextOperationalMembership]) => {
      if (!active) return;
      setContributions(nextContributions);
      setOutcomes(nextOutcomes);
      setExpectedContributorCount(nextExpectedContributorCount);
      setOperationalMembership(nextOperationalMembership);
    }).catch((error) => {
      if (!active) return;
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      setOperationalMembership(null);
      setMessage(error instanceof Error ? error.message : 'Lavoro del team non leggibile.');
    });

    return () => { active = false; };
  }, [repository, team.selectedMembership?.workspaceId, team.selectedMembership?.role, team.session?.user.id, descriptors.length, proposalIdentityKey, refreshVersion, scope, proposals.length]);

  const summary = useMemo(
    () => deriveTeamReviewSummary(descriptors, contributions, expectedContributorCount),
    [descriptors, contributions, expectedContributorCount],
  );
  const latestOutcomes = useMemo(() => latestCurrentOutcomes(outcomes, descriptors), [outcomes, descriptors]);
  const openDiscussionItems = summary.items.filter((item) => item.bucket !== 'shared' && !latestOutcomes[item.proposalRef]);
  const sharedItems = summary.items.filter((item) => item.bucket === 'shared');
  const pendingSharedItems = sharedItems.filter((item) => item.coverageComplete && !latestOutcomes[item.proposalRef]);
  const resolvedItems = summary.items.filter((item) => Boolean(latestOutcomes[item.proposalRef]));
  const selectedItem = outcomeProposalRef
    ? summary.items.find((item) => item.proposalRef === outcomeProposalRef) ?? null
    : null;
  const hasDisciplineCompetence = Boolean(operationalMembership?.disciplines.includes(discipline));
  const hasVerifiedCoordinationRole = Boolean(team.selectedMembership && ['dipartimento', 'referente'].includes(team.selectedMembership.role));
  const canRecordTeamOutcome = hasVerifiedCoordinationRole && hasDisciplineCompetence;
  const remainingOutcomeCount = Math.max(0, summary.total - resolvedItems.length);
  const allCurrentOutcomesRecorded = descriptors.length === proposals.length
    && descriptors.length > 0
    && resolvedItems.length === descriptors.length;

  const sessionState = useMemo<TeamCoordinationSessionState>(() => ({
    total: summary.total,
    openDiscussionCount: openDiscussionItems.length,
    pendingSharedOutcomeCount: pendingSharedItems.length,
    resolvedCount: resolvedItems.length,
    remainingOutcomeCount,
    allCurrentOutcomesRecorded,
    canRecordTeamOutcome,
  }), [summary.total, openDiscussionItems.length, pendingSharedItems.length, resolvedItems.length, remainingOutcomeCount, allCurrentOutcomesRecorded, canRecordTeamOutcome]);

  useEffect(() => {
    onSessionStateChange?.(sessionState);
  }, [onSessionStateChange, sessionState]);

  const recordOutcome = async () => {
    if (!repository || !team.selectedMembership || !team.session || !scope || !canRecordTeamOutcome || !selectedItem) return;
    if (!rationale.trim()) {
      setMessage('Aggiungi la motivazione sintetica dell’esito concordato dal gruppo.');
      return;
    }
    if (teamOutcome === 'shared-text' && !sharedText.trim()) {
      setMessage('Scrivi il testo condiviso concordato dal gruppo.');
      return;
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };
    setBusy(true);
    setMessage(null);
    try {
      await repository.recordTeamOutcome(context, {
        workspaceId: team.selectedMembership.workspaceId,
        ...scope,
        proposalRef: selectedItem.proposalRef,
        proposalFingerprint: selectedItem.proposalFingerprint,
        outcome: teamOutcome,
        sharedText: teamOutcome === 'shared-text' ? sharedText : null,
        rationale,
        clientRequestId: createRequestId(),
      });
      setSharedText('');
      setRationale('');
      setTeamOutcome('accept-proposal');
      setRefreshVersion((value) => value + 1);
      setMessage('Esito del gruppo registrato. Non è una decisione istituzionale e non modifica da solo il curricolo.');
      onOutcomeRecorded?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esito del gruppo non registrato.');
    } finally {
      setBusy(false);
    }
  };

  const confirmSharedItems = async () => {
    if (!repository || !team.selectedMembership || !team.session || !scope || !canRecordTeamOutcome) return;
    if (pendingSharedItems.length === 0) {
      setMessage('Non ci sono punti già condivisi ancora da registrare.');
      return;
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };
    setBusy(true);
    setMessage(null);
    try {
      for (const item of pendingSharedItems) {
        const outcome: TeamReviewOutcome = item.counts['keep-previous'] > 0 ? 'keep-previous' : 'accept-proposal';
        await repository.recordTeamOutcome(context, {
          workspaceId: team.selectedMembership.workspaceId,
          ...scope,
          proposalRef: item.proposalRef,
          proposalFingerprint: item.proposalFingerprint,
          outcome,
          sharedText: null,
          rationale: 'Punto confermato dal gruppo dopo il confronto professionale dei contributi correnti.',
          clientRequestId: createRequestId(),
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage(`${pendingSharedItems.length} ${pendingSharedItems.length === 1 ? 'esito registrato' : 'esiti registrati'} per i punti già condivisi.`);
      onOutcomeRecorded?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esiti condivisi non registrati.');
    } finally {
      setBusy(false);
    }
  };

  if (!scope || !group) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="Confronto del gruppo">
        <strong className="block text-sm text-amber-950">Confronto disciplinare non configurato</strong>
        <p className="mt-1 text-xs leading-relaxed text-amber-900">
          {discipline === 'educazioneCivica'
            ? 'Educazione civica resta un asse trasversale: prima di aprire un esito di gruppo serve l’instradamento per nucleo.'
            : 'I gruppi operativi di questa fase riguardano le discipline della scuola primaria e secondaria di primo grado.'}
        </p>
      </section>
    );
  }

  if (!team.configured) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-label="Confronto del gruppo">
        <strong className="text-sm text-slate-900">Confronto non disponibile in modalità locale</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">Il confronto condiviso richiede un accesso autenticato al team.</p>
      </section>
    );
  }

  if (team.loading) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">Caricamento del confronto…</section>;
  }

  if (!team.session) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong className="block text-sm">Accedi per vedere il confronto del gruppo</strong>
        <Link to="/beta-identity" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 py-2 font-bold underline">Accedi</Link>
      </section>
    );
  }

  if (team.activeMemberships.length === 0) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong className="block text-sm">Nessun team scolastico attivo</strong>
        <p className="mt-1 leading-relaxed">L’account è autenticato, ma non è associato a un team attivo.</p>
      </section>
    );
  }

  if (mode === 'status') {
    return (
      <section
        className="rounded-xl border border-slate-200 bg-white p-3"
        aria-label="Stato del confronto del gruppo"
        data-team-coordination-workspace
        data-team-coordination-mode="status"
      >
        <strong className="block text-xs text-slate-800">Stato del confronto</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {allCurrentOutcomesRecorded
            ? 'Il gruppo ha registrato gli esiti per tutte le schede correnti.'
            : expectedContributorCount === null
              ? 'La partecipazione richiesta non è ancora verificabile.'
              : `${resolvedItems.length} esiti registrati; ${remainingOutcomeCount} ancora da chiudere nel confronto del gruppo.`}
        </p>
      </section>
    );
  }

  const summaryCards = (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Sintesi del confronto del gruppo">
      <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.shared}</strong><span className="text-xs text-slate-600">punti già condivisi</span></div>
      <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.changeProposed}</strong><span className="text-xs text-slate-600">modifiche proposte</span></div>
      <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.divergent}</strong><span className="text-xs text-slate-600">opinioni diverse</span></div>
      <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.needsClarification}</strong><span className="text-xs text-slate-600">punti da chiarire</span></div>
    </div>
  );

  if (mode === 'record') {
    return (
      <section
        className="space-y-4"
        aria-label="Registrazione dell’esito del gruppo"
        data-team-coordination-workspace
        data-team-coordination-mode="record"
      >
        {allCurrentOutcomesRecorded && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" data-team-outcomes-complete>
            <strong className="block text-sm text-emerald-950">Gli esiti correnti del gruppo sono registrati</strong>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">Questo conclude il passaggio professionale del gruppo per queste schede. Il successivo riesame verticale e l’iter istituzionale restano passaggi distinti.</p>
          </section>
        )}

        {!allCurrentOutcomesRecorded && !canRecordTeamOutcome && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <strong className="block text-sm text-amber-950">Puoi consultare, ma non registrare l’esito</strong>
            <p className="mt-1 text-xs leading-relaxed text-amber-900">Per registrare l’esito servono il ruolo verificato di Dipartimento o Referente e la competenza nella disciplina corrente.</p>
          </section>
        )}

        {selectedItem && canRecordTeamOutcome && !latestOutcomes[selectedItem.proposalRef] && (
          <section className="rounded-2xl border-2 border-indigo-200 bg-white p-4" aria-label="Esito del gruppo" data-team-outcome-form>
            <strong className="block text-sm text-slate-900">Registra l’esito · {selectedItem.focus}</strong>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Documenta ciò che il gruppo ha concordato. Questa ricevuta non è una decisione istituzionale.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(Object.entries(TEAM_OUTCOME_LABELS) as [TeamReviewOutcome, string][]).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setTeamOutcome(value)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${teamOutcome === value ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{label}</button>
              ))}
            </div>
            {teamOutcome === 'shared-text' && <textarea value={sharedText} onChange={(event) => setSharedText(event.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Testo condiviso concordato dal gruppo…" />}
            <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Motivazione sintetica dell’esito concordato…" />
            <button type="button" disabled={busy} onClick={() => void recordOutcome()} className="mt-3 min-h-11 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Registra l’esito del gruppo</button>
          </section>
        )}

        {!selectedItem && !allCurrentOutcomesRecorded && (
          <div className="space-y-3" data-team-outcome-queue>
            {pendingSharedItems.length > 0 && canRecordTeamOutcome && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <strong className="block text-sm text-emerald-950">Punti già condivisi</strong>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800">{pendingSharedItems.length} {pendingSharedItems.length === 1 ? 'punto ha' : 'punti hanno'} partecipazione completa e orientamenti coincidenti. Registrali soltanto dopo che il gruppo li ha confermati.</p>
                <button type="button" disabled={busy} onClick={() => void confirmSharedItems()} className="mt-3 min-h-10 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Registra i punti condivisi confermati dal gruppo</button>
              </section>
            )}

            {openDiscussionItems.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <strong className="block text-sm text-slate-900">Scegli il punto di cui registrare l’esito</strong>
                <div className="mt-3 space-y-2">
                  {openDiscussionItems.map((item) => (
                    <button
                      key={item.proposalRef}
                      type="button"
                      disabled={!canRecordTeamOutcome}
                      onClick={() => onRequestRecordOutcome?.(item.proposalRef)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                      <span>{item.focus}</span>
                      <span className="shrink-0 text-indigo-700">Apri</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {resolvedItems.length > 0 && (
          <details className="rounded-2xl border border-slate-200 bg-white">
            <summary className="cursor-pointer p-4 text-sm font-bold text-slate-700">{resolvedItems.length} esiti già registrati</summary>
            <div className="space-y-2 border-t border-slate-100 p-4">
              {resolvedItems.map((item) => {
                const receipt = latestOutcomes[item.proposalRef];
                return (
                  <div key={item.proposalRef} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                    <strong>{item.focus}</strong>
                    <span className="mt-1 block">{TEAM_OUTCOME_LABELS[receipt.outcome]} · {new Date(receipt.recordedAt).toLocaleString('it-IT')}</span>
                    <span className="mt-1 block text-[10px] text-slate-500">Esito professionale del gruppo; non approvazione istituzionale.</span>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {(message || team.message) && <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">{message ?? team.message}</div>}
      </section>
    );
  }

  return (
    <section
      className="space-y-4"
      aria-label="Confronto del gruppo"
      data-team-coordination-workspace
      data-team-coordination-mode="compare"
    >
      <section className="rounded-2xl border border-indigo-200 bg-white p-4" data-operational-group-context>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="text-sm text-indigo-950">{group.label}</strong>
            <p className="mt-1 text-xs text-slate-600">{discipline} · anno scolastico {academicYear}</p>
          </div>
          {team.selectedMembership && <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">{roleLabel(team.selectedMembership.role)}</span>}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {expectedContributorCount === null
            ? 'La partecipazione richiesta non è ancora verificabile: nessun punto viene considerato condiviso automaticamente.'
            : expectedContributorCount === 1
              ? `È presente un solo docente competente in ${discipline}: un singolo contributo non viene interpretato come consenso del gruppo.`
              : `${expectedContributorCount} docenti attivi competenti in ${discipline} sono attesi per le schede correnti.`}
        </p>
      </section>

      {summaryCards}

      <section className="space-y-3" aria-labelledby="team-discussion-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="team-discussion-title" className="text-base font-extrabold text-slate-900">Da discutere</h2>
            <p className="mt-1 text-xs text-slate-500">Concentrati sui punti in cui manca un contributo, è stata proposta una modifica o i pareri non coincidono.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{openDiscussionItems.length} aperti</span>
        </div>

        {openDiscussionItems.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">Nessun punto aperto da discutere per le versioni correnti.</div>
        ) : openDiscussionItems.map((item) => {
          const reason = deriveTeamDiscussionReason(item);
          const currentContributions = item.contributions.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          return (
            <article key={item.proposalRef} className="rounded-2xl border border-slate-200 bg-white p-4" data-team-discussion-item>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <strong className="block text-base text-slate-900">{item.focus}</strong>
                  <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{BUCKET_LABELS[item.bucket]}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{item.contributionCount}/{item.expectedContributorCount ?? '—'} contributi correnti</span>
              </div>

              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3" data-team-discussion-reason>
                <strong className="text-xs text-amber-950">Perché ne parliamo · {reason.title}</strong>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{reason.detail}</p>
              </div>

              <div className="mt-3" aria-label="Situazione del gruppo">
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['confirm-proposal']} confermano</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['propose-change']} propongono modifica</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['keep-previous']} mantengono il precedente</span>
                  {item.staleContributionCount > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{item.staleContributionCount} da aggiornare</span>}
                </div>
                <p className={`mt-2 text-[11px] font-semibold ${item.staleContributionCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{teamReviewVersionStatusLabel(item.staleContributionCount)}</p>
              </div>

              <details className="mt-3 rounded-xl border border-slate-200 bg-white" data-team-contribution-provenance>
                <summary className="cursor-pointer p-3 text-xs font-bold text-slate-700">Vedi i contributi · {currentContributions.length}</summary>
                <div className="space-y-2 border-t border-slate-100 p-3">
                  {currentContributions.length === 0 ? (
                    <p className="text-xs text-slate-500">Nessun contributo corrente disponibile.</p>
                  ) : currentContributions.map((contribution) => (
                    <div key={`${contribution.contributorUserId}-${contribution.updatedAt}`} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>{contributionOriginLabel(contribution, team.session?.user.id ?? null)}</strong>
                        <span className="text-[10px] text-slate-500">{new Date(contribution.updatedAt).toLocaleString('it-IT')}</span>
                      </div>
                      <p className="mt-1 font-semibold">{contributionOrientationLabel(contribution)}</p>
                      {contribution.customText && <p className="mt-2 rounded-lg bg-white p-2 leading-relaxed">{contribution.customText}</p>}
                    </div>
                  ))}
                </div>
              </details>

              {canRecordTeamOutcome && onRequestRecordOutcome ? (
                <button
                  type="button"
                  data-human-next-action="record-team-outcome"
                  onClick={() => onRequestRecordOutcome(item.proposalRef)}
                  className="mt-3 min-h-10 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white"
                >
                  Porta questo punto all’esito
                </button>
              ) : !canRecordTeamOutcome ? (
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Puoi partecipare al confronto; la registrazione dell’esito spetta al ruolo autorizzato e competente nella disciplina.</p>
              ) : null}
            </article>
          );
        })}
      </section>

      {sharedItems.length > 0 && (
        <details className="rounded-2xl border border-emerald-200 bg-emerald-50/40">
          <summary className="cursor-pointer p-4 text-sm font-bold text-emerald-900">{sharedItems.length} punti già condivisi — apri solo se serve</summary>
          <div className="space-y-2 border-t border-emerald-100 p-4">
            {sharedItems.map((item) => (
              <div key={item.proposalRef} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-xs">
                <span className="min-w-0 truncate text-slate-700">{item.focus}</span>
                <span className="shrink-0 text-[10px] font-semibold text-emerald-700">{latestOutcomes[item.proposalRef] ? 'esito registrato' : 'da registrare dopo conferma'}</span>
              </div>
            ))}
            {pendingSharedItems.length > 0 && canRecordTeamOutcome && onRequestRecordOutcome && (
              <button type="button" onClick={() => onRequestRecordOutcome(null)} className="min-h-10 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Passa alla registrazione dei punti condivisi</button>
            )}
          </div>
        </details>
      )}

      {allCurrentOutcomesRecorded && canRecordTeamOutcome && onRequestRecordOutcome && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <strong className="block text-sm text-emerald-950">Il confronto sulle schede correnti è chiuso</strong>
          <p className="mt-1 text-xs leading-relaxed text-emerald-800">Gli esiti professionali del gruppo risultano registrati. Puoi aprire il riepilogo dell’ultimo passaggio della sessione.</p>
          <button type="button" onClick={() => onRequestRecordOutcome(null)} className="mt-3 min-h-10 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Vedi gli esiti registrati</button>
        </section>
      )}

      {resolvedItems.length > 0 && (
        <details className="rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer p-4 text-sm font-bold text-slate-700">{resolvedItems.length} esiti già registrati</summary>
          <div className="space-y-2 border-t border-slate-100 p-4">
            {resolvedItems.map((item) => {
              const receipt = latestOutcomes[item.proposalRef];
              return <div key={item.proposalRef} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700"><strong>{item.focus}</strong><span className="mt-1 block">{TEAM_OUTCOME_LABELS[receipt.outcome]}</span></div>;
            })}
          </div>
        </details>
      )}

      {(message || team.message) && <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">{message ?? team.message}</div>}
    </section>
  );
}
