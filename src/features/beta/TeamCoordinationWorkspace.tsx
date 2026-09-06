import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Proposal, SchoolOrder } from '../../types/curriculum';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
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
import {
  buildTeamReviewProvenance,
  contributionOrientationLabel,
  contributionOriginLabel,
  deriveTeamDiscussionReason,
  teamReviewContextLabel,
  teamReviewVersionStatusLabel,
} from '../../domain/revision/teamReviewProvenance';
import { SupabaseSharedTeamReviewRepository } from '../../infrastructure/supabase/sharedTeamReviewRepository';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

export interface TeamCoordinationWorkspaceProps {
  proposals: Proposal[];
  discipline: string;
  order: SchoolOrder;
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

const shortFingerprint = (value: string): string => value.length > 16 ? `${value.slice(0, 12)}…${value.slice(-4)}` : value;

export function TeamCoordinationWorkspace({ proposals, discipline, order }: TeamCoordinationWorkspaceProps) {
  const team = useTeamWorkspaceContext();
  const repository = useMemo(
    () => (team.client ? new SupabaseSharedTeamReviewRepository(team.client) : null),
    [team.client],
  );
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

  const proposalIdentityKey = useMemo(
    () => JSON.stringify(proposals.map((proposal) => [proposal.id, proposal.focus, proposal.oldText, proposal.newText])),
    [proposals],
  );

  useEffect(() => {
    let active = true;
    void Promise.all(proposals.map(async (proposal) => [
      proposal.id,
      await fingerprintTeamReviewProposal({
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
  }, [proposalIdentityKey]);

  const descriptors = useMemo<TeamReviewProposalDescriptor[]>(() => proposals
    .filter((proposal) => Boolean(fingerprints[proposal.id]))
    .map((proposal) => ({
      proposalRef: proposal.id,
      focus: proposal.focus,
      proposalFingerprint: fingerprints[proposal.id],
    })), [proposals, fingerprints]);

  useEffect(() => {
    let active = true;
    if (!repository || !team.selectedMembership || !team.session || descriptors.length !== proposals.length) {
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      return () => { active = false; };
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };
    setMessage(null);

    void Promise.all([
      repository.listContributions(context, team.selectedMembership.workspaceId),
      repository.listTeamOutcomes(context, team.selectedMembership.workspaceId),
      repository.getEligibleContributorCount(context, team.selectedMembership.workspaceId),
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
  }, [repository, team.selectedMembership?.workspaceId, team.selectedMembership?.role, team.session?.user.id, descriptors.length, proposalIdentityKey, refreshVersion]);

  const summary = useMemo(
    () => deriveTeamReviewSummary(descriptors, contributions, expectedContributorCount),
    [descriptors, contributions, expectedContributorCount],
  );
  const latestOutcomes = useMemo(() => latestCurrentOutcomes(outcomes, descriptors), [outcomes, descriptors]);
  const openDiscussionItems = summary.items.filter((item) => item.bucket !== 'shared' && !latestOutcomes[item.proposalRef]);
  const sharedItems = summary.items.filter((item) => item.bucket === 'shared');
  const resolvedItems = summary.items.filter((item) => Boolean(latestOutcomes[item.proposalRef]));
  const selectedItem = summary.items.find((item) => item.proposalRef === selectedProposalRef) ?? null;
  const canRecordTeamOutcome = Boolean(team.selectedMembership && ['dipartimento', 'referente'].includes(team.selectedMembership.role));
  const isCoordinator = canRecordTeamOutcome;

  const recordOutcome = async () => {
    if (!repository || !team.selectedMembership || !team.session || !canRecordTeamOutcome || !selectedItem) return;
    if (!rationale.trim()) {
      setMessage('Aggiungi la motivazione sintetica dell’esito concordato dal team.');
      return;
    }
    if (teamOutcome === 'shared-text' && !sharedText.trim()) {
      setMessage('Scrivi il testo condiviso concordato dal team.');
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
      setMessage('Esito del team registrato. Resta separato dalla decisione istituzionale e dal curricolo vigente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esito del team non registrato.');
    } finally {
      setBusy(false);
    }
  };

  const confirmSharedItems = async () => {
    if (!repository || !team.selectedMembership || !team.session || !canRecordTeamOutcome) return;
    const pendingShared = sharedItems.filter((item) => item.coverageComplete && !latestOutcomes[item.proposalRef]);
    if (pendingShared.length === 0) {
      setMessage('Non ci sono punti con copertura completa ancora da registrare come esito del team.');
      return;
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };
    setBusy(true);
    setMessage(null);
    try {
      for (const item of pendingShared) {
        const outcome: TeamReviewOutcome = item.counts['keep-previous'] > 0 ? 'keep-previous' : 'accept-proposal';
        await repository.recordTeamOutcome(context, {
          workspaceId: team.selectedMembership.workspaceId,
          proposalRef: item.proposalRef,
          proposalFingerprint: item.proposalFingerprint,
          outcome,
          sharedText: null,
          rationale: 'Punto confermato dal team con copertura completa dei contributori correnti.',
          clientRequestId: createRequestId(),
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage(`${pendingShared.length} ${pendingShared.length === 1 ? 'punto condiviso registrato' : 'punti condivisi registrati'} come esito del team.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esiti condivisi non registrati.');
    } finally {
      setBusy(false);
    }
  };

  if (!team.configured) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-label="Lavoro del team">
        <strong className="text-sm text-slate-900">Lavoro del team non disponibile in modalità locale</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">La coda condivisa richiede un workspace autenticato.</p>
      </section>
    );
  }

  if (team.loading) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">Caricamento del lavoro del team…</section>;
  }

  if (!team.session) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong className="block text-sm">Accedi per vedere il confronto del team</strong>
        <Link to="/beta-identity" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 py-2 font-bold underline">Accedi</Link>
      </section>
    );
  }

  if (team.activeMemberships.length === 0) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong className="block text-sm">Nessun team scolastico attivo</strong>
        <p className="mt-1 leading-relaxed">L’account è autenticato, ma non è associato a un workspace attivo.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label={isCoordinator ? 'Coordinamento del team' : 'Confronto del team'} data-team-coordination-workspace>
      <header className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Spazio condiviso autenticato</span>
            <h1 className="mt-1 text-lg font-extrabold text-slate-900">{isCoordinator ? 'Coordinamento del team' : 'Confronto del team'}</h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">
              {isCoordinator
                ? 'Qui coordini ciò che richiede confronto. Il tuo contributo personale resta distinto dall’esito che registri per il gruppo.'
                : 'Qui consulti la sintesi dei contributi condivisi. Il tuo orientamento personale resta distinto dall’esito del team.'}
            </p>
          </div>
          {team.selectedMembership && (
            <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-indigo-700">{roleLabel(team.selectedMembership.role)}</span>
          )}
        </div>

        {team.activeMemberships.length > 1 ? (
          <label className="mt-3 block text-xs font-semibold text-slate-700">Team
            <select value={team.workspaceId} onChange={(event) => team.setWorkspaceId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2">
              {team.activeMemberships.map((membership) => (
                <option key={membership.workspaceId} value={membership.workspaceId}>{membership.workspaceName} · {roleLabel(membership.role)}</option>
              ))}
            </select>
          </label>
        ) : team.selectedMembership ? (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3 text-xs text-slate-700"><strong>Team:</strong> {team.selectedMembership.workspaceName}</div>
        ) : null}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4" data-team-review-coverage>
        <strong className="text-sm text-slate-900">Copertura del team</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {expectedContributorCount === null
            ? 'Copertura non verificabile: nessun punto può essere considerato già condiviso.'
            : expectedContributorCount === 1
              ? 'È presente un solo contributore attivo: Arena non può interpretare un singolo contributo come consenso del team.'
              : `${expectedContributorCount} contributori attivi attesi per la versione corrente delle schede.`}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Sintesi del lavoro del team">
        <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.shared}</strong><span className="text-xs text-slate-600">punti già condivisi</span></div>
        <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.changeProposed}</strong><span className="text-xs text-slate-600">modifiche proposte</span></div>
        <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.divergent}</strong><span className="text-xs text-slate-600">opinioni diverse</span></div>
        <div className="rounded-xl border border-slate-100 bg-white p-3"><strong className="block text-xl text-slate-900">{summary.needsClarification}</strong><span className="text-xs text-slate-600">punti da chiarire</span></div>
      </div>

      <section className="space-y-3" aria-labelledby="team-discussion-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="team-discussion-title" className="text-base font-extrabold text-slate-900">Da discutere</h2>
            <p className="mt-1 text-xs text-slate-500">Ogni punto mostra perché è aperto, da quale contesto curricolare proviene e quali contributi lo hanno generato.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{openDiscussionItems.length} aperti</span>
        </div>

        {openDiscussionItems.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">Nessun punto aperto da discutere per le versioni correnti.</div>
        ) : openDiscussionItems.map((item) => {
          const proposal = proposals.find((candidate) => candidate.id === item.proposalRef);
          if (!proposal) return null;
          const reason = deriveTeamDiscussionReason(item);
          const provenance = buildTeamReviewProvenance(proposal, discipline, order, item.proposalFingerprint);
          const currentContributions = item.contributions.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          const versionStatus = teamReviewVersionStatusLabel(item.staleContributionCount);

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
                <strong className="text-xs text-amber-950">Perché è qui · {reason.title}</strong>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{reason.detail}</p>
              </div>

              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3" data-team-discussion-provenance>
                <strong className="text-xs text-indigo-950">Da dove arriva</strong>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{teamReviewContextLabel(discipline, order)}</p>
                <p className={`mt-1 text-[11px] font-semibold ${item.staleContributionCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{versionStatus}</p>
                <p className="mt-1 text-[11px] text-amber-700">Fonti: collegamento canonico ancora da verificare.</p>
              </div>

              <div className="mt-3" aria-label="Situazione del team">
                <strong className="text-xs text-slate-800">Situazione del team</strong>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['confirm-proposal']} confermano</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['propose-change']} propongono modifica</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.counts['keep-previous']} mantengono il precedente</span>
                  {item.staleContributionCount > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{item.staleContributionCount} contributi su versione precedente</span>}
                </div>
              </div>

              <details className="mt-3 rounded-xl border border-slate-200 bg-white" data-team-contribution-provenance>
                <summary className="cursor-pointer p-3 text-xs font-bold text-slate-700">Vedi contributi e provenienza · {currentContributions.length}</summary>
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
                      <p className="mt-1 text-[11px] text-emerald-700">Contributo valido per la versione corrente</p>
                      {contribution.customText && <p className="mt-2 rounded-lg bg-white p-2 leading-relaxed">{contribution.customText}</p>}
                    </div>
                  ))}
                </div>
              </details>

              <details className="mt-3 rounded-xl border border-slate-200 bg-white" data-team-source-trace>
                <summary className="cursor-pointer p-3 text-xs font-bold text-slate-700">Tracciabilità tecnica e fonti</summary>
                <div className="space-y-3 border-t border-slate-100 p-3 text-xs leading-relaxed text-slate-700">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <strong className="text-slate-900">Identità della versione esaminata</strong>
                    <p className="mt-1">Scheda <code className="rounded bg-white px-1 py-0.5 text-[10px]">{provenance.proposalRef}</code></p>
                    <p className="mt-1">Impronta tecnica <code className="rounded bg-white px-1 py-0.5 text-[10px]">{shortFingerprint(provenance.technicalVersionRef)}</code></p>
                    <p className="mt-1 text-[11px] text-slate-500">{provenance.versionLabel}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <strong className="text-slate-900">Testo precedente</strong>
                    <p className="mt-1">{proposal.oldText}</p>
                    <p className="mt-2 text-[11px] text-amber-700">{provenance.previousSource.label} · fonte canonica non collegata</p>
                  </div>
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">
                    <strong className="text-indigo-950">Testo proposto</strong>
                    <p className="mt-1">{proposal.newText}</p>
                    <p className="mt-2 text-[11px] text-amber-700">{provenance.proposedSource.label} · fonte canonica non collegata</p>
                  </div>
                </div>
              </details>

              {canRecordTeamOutcome ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProposalRef(item.proposalRef);
                    setTeamOutcome('accept-proposal');
                    setSharedText('');
                    setRationale('');
                  }}
                  className="mt-3 min-h-10 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white"
                >
                  Registra l’esito del team
                </button>
              ) : (
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Puoi consultare il confronto. Solo una membership di dipartimento o referente può registrare l’esito del team.</p>
              )}
            </article>
          );
        })}
      </section>

      {sharedItems.length > 0 && (
        <details className="rounded-2xl border border-emerald-200 bg-emerald-50/40">
          <summary className="cursor-pointer p-4 text-sm font-bold text-emerald-900">{sharedItems.length} punti già condivisi — mostra solo se serve</summary>
          <div className="space-y-2 border-t border-emerald-100 p-4">
            {sharedItems.map((item) => (
              <div key={item.proposalRef} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-xs">
                <span className="min-w-0 truncate text-slate-700">{item.focus}</span>
                <span className="shrink-0 text-[10px] font-semibold text-emerald-700">{item.contributionCount}/{item.expectedContributorCount ?? '—'} contributi</span>
              </div>
            ))}
            {canRecordTeamOutcome && (
              <button type="button" disabled={busy} onClick={() => void confirmSharedItems()} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Registra i punti condivisi confermati dal team</button>
            )}
          </div>
        </details>
      )}

      {selectedItem && canRecordTeamOutcome && (
        <section className="rounded-2xl border-2 border-indigo-200 bg-white p-4" aria-label="Esito del team">
          <strong className="block text-sm text-slate-900">Esito del team · {selectedItem.focus}</strong>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Registra ciò che il gruppo ha concordato. Questa ricevuta resta separata dalla successiva decisione istituzionale.</p>
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
        </section>
      )}

      {resolvedItems.length > 0 && (
        <details className="rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer p-4 text-sm font-bold text-slate-700">{resolvedItems.length} esiti del team già registrati</summary>
          <div className="space-y-2 border-t border-slate-100 p-4">
            {resolvedItems.map((item) => {
              const receipt = latestOutcomes[item.proposalRef];
              return (
                <div key={item.proposalRef} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <strong>{item.focus}</strong>
                  <span className="mt-1 block">{TEAM_OUTCOME_LABELS[receipt.outcome]} · {new Date(receipt.recordedAt).toLocaleString('it-IT')}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">Registrato da ruolo {roleLabel(receipt.recordedByRole)}. Esito del team, non approvazione istituzionale.</span>
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
