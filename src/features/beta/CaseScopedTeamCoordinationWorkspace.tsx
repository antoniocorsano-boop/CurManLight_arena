import { useEffect, useMemo, useState } from 'react';
import { getOperationalGroupForDiscipline } from '../../domain/institution/operationalGroups';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  fingerprintCaseScopedTeamReviewProposal,
  type CaseScopedTeamReviewOutcomeReceipt,
  type CaseScopedTeamReviewScope,
} from '../../domain/revision/caseScopedTeamReview';
import {
  deriveTeamReviewSummary,
  type OperationalGroupMembership,
  type TeamReviewItemSummary,
  type TeamReviewOutcome,
  type TeamReviewProposalDescriptor,
} from '../../domain/revision/teamReview';
import { SupabaseCaseScopedTeamReviewRepository } from '../../infrastructure/supabase/caseScopedTeamReviewRepository';
import { SupabaseSharedTeamReviewRepository } from '../../infrastructure/supabase/sharedTeamReviewRepository';
import type { Proposal, SchoolOrder } from '../../types/curriculum';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

export type CaseScopedTeamCoordinationMode = 'status' | 'compare' | 'record';

export interface CaseScopedTeamCoordinationState {
  total: number;
  resolvedCount: number;
  remainingOutcomeCount: number;
  allCurrentOutcomesRecorded: boolean;
  canRecordTeamOutcome: boolean;
}

type Props = {
  reviewCaseId: string;
  proposals: Proposal[];
  discipline: string;
  order: SchoolOrder;
  academicYear: string;
  mode: CaseScopedTeamCoordinationMode;
  outcomeProposalRef?: string | null;
  onSessionStateChange?: (state: CaseScopedTeamCoordinationState) => void;
  onRequestRecordOutcome?: (proposalRef: string | null) => void;
  onOutcomeRecorded?: () => void;
};

const TEAM_OUTCOME_LABELS: Record<TeamReviewOutcome, string> = {
  'accept-proposal': 'Accogli proposta',
  'keep-previous': 'Mantieni testo precedente',
  'shared-text': 'Definisci testo condiviso',
  defer: 'Rinvia',
};

const BUCKET_LABELS: Record<TeamReviewItemSummary['bucket'], string> = {
  shared: 'Contributi convergenti',
  'change-proposed': 'Modifica convergente',
  divergent: 'Opinioni diverse',
  'needs-clarification': 'Confronto necessario',
};

const createRequestId = (): string => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `case-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const latestCurrentOutcomes = (
  outcomes: CaseScopedTeamReviewOutcomeReceipt[],
  descriptors: TeamReviewProposalDescriptor[],
): Record<string, CaseScopedTeamReviewOutcomeReceipt> => {
  const fingerprintByProposal = new Map(descriptors.map((item) => [item.proposalRef, item.proposalFingerprint]));
  const result: Record<string, CaseScopedTeamReviewOutcomeReceipt> = {};
  for (const receipt of outcomes) {
    if (result[receipt.proposalRef]) continue;
    if (fingerprintByProposal.get(receipt.proposalRef) !== receipt.proposalFingerprint) continue;
    result[receipt.proposalRef] = receipt;
  }
  return result;
};

export function CaseScopedTeamCoordinationWorkspace({
  reviewCaseId,
  proposals,
  discipline,
  order,
  academicYear,
  mode,
  outcomeProposalRef = null,
  onSessionStateChange,
  onRequestRecordOutcome,
  onOutcomeRecorded,
}: Props) {
  const team = useTeamWorkspaceContext();
  const group = useMemo(() => getOperationalGroupForDiscipline(order, discipline), [order, discipline]);
  const caseRepository = useMemo(() => team.client ? new SupabaseCaseScopedTeamReviewRepository(team.client) : null, [team.client]);
  const sharedRepository = useMemo(() => team.client ? new SupabaseSharedTeamReviewRepository(team.client) : null, [team.client]);
  const scope = useMemo<CaseScopedTeamReviewScope | null>(() => group ? ({
    academicYear,
    order: group.order,
    groupCode: group.code,
    discipline,
    reviewCaseId,
  }) : null, [academicYear, discipline, group, reviewCaseId]);
  const [fingerprints, setFingerprints] = useState<Record<string, string>>({});
  const [contributions, setContributions] = useState<Awaited<ReturnType<SupabaseCaseScopedTeamReviewRepository['listContributions']>>>([]);
  const [outcomes, setOutcomes] = useState<CaseScopedTeamReviewOutcomeReceipt[]>([]);
  const [expectedContributorCount, setExpectedContributorCount] = useState<number | null>(null);
  const [operationalMembership, setOperationalMembership] = useState<OperationalGroupMembership | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [teamOutcome, setTeamOutcome] = useState<TeamReviewOutcome | ''>('');
  const [sharedText, setSharedText] = useState('');
  const [rationale, setRationale] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!scope) return () => { active = false; };
    void Promise.all(proposals.map(async (proposal) => [
      proposal.id,
      await fingerprintCaseScopedTeamReviewProposal({
        ...scope,
        proposalRef: proposal.id,
        focus: proposal.focus,
        oldText: proposal.oldText,
        newText: proposal.newText,
      }),
    ] as const)).then((items) => {
      if (active) setFingerprints(Object.fromEntries(items));
    });
    return () => { active = false; };
  }, [scope, proposals]);

  const descriptors = useMemo<TeamReviewProposalDescriptor[]>(() => scope ? proposals
    .filter((proposal) => Boolean(fingerprints[proposal.id]))
    .map((proposal) => ({
      academicYear: scope.academicYear,
      order: scope.order,
      groupCode: scope.groupCode,
      discipline: scope.discipline,
      proposalRef: proposal.id,
      focus: proposal.focus,
      proposalFingerprint: fingerprints[proposal.id],
    })) : [], [scope, proposals, fingerprints]);

  useEffect(() => {
    let active = true;
    if (!caseRepository || !sharedRepository || !team.selectedMembership || !team.session || !scope || descriptors.length !== proposals.length) {
      setContributions([]);
      setOutcomes([]);
      setExpectedContributorCount(null);
      setOperationalMembership(null);
      return () => { active = false; };
    }
    const context: WorkspaceActorContext = { membership: team.selectedMembership, assurance: 'authenticated-workspace' };
    void Promise.all([
      caseRepository.listContributions(context, team.selectedMembership.workspaceId, scope),
      caseRepository.listTeamOutcomes(context, team.selectedMembership.workspaceId, scope),
      sharedRepository.getEligibleContributorCount(context, team.selectedMembership.workspaceId, scope),
      sharedRepository.getMyOperationalMembership(context, scope),
    ]).then(([nextContributions, nextOutcomes, expected, membership]) => {
      if (!active) return;
      setContributions(nextContributions);
      setOutcomes(nextOutcomes);
      setExpectedContributorCount(expected);
      setOperationalMembership(membership);
    }).catch((error) => {
      if (!active) return;
      setMessage(error instanceof Error ? error.message : 'Confronto del caso non leggibile.');
    });
    return () => { active = false; };
  }, [caseRepository, sharedRepository, team.selectedMembership?.workspaceId, team.session?.user.id, scope, descriptors.length, proposals.length, refreshVersion]);

  const summary = useMemo(() => deriveTeamReviewSummary(descriptors, contributions, expectedContributorCount), [descriptors, contributions, expectedContributorCount]);
  const latest = useMemo(() => latestCurrentOutcomes(outcomes, descriptors), [outcomes, descriptors]);
  const resolved = summary.items.filter((item) => Boolean(latest[item.proposalRef]));
  const remaining = Math.max(0, summary.total - resolved.length);
  const hasDisciplineCompetence = Boolean(operationalMembership?.disciplines.includes(discipline));
  const canRecordTeamOutcome = Boolean(team.selectedMembership && ['dipartimento', 'referente'].includes(team.selectedMembership.role) && hasDisciplineCompetence);
  const allCurrentOutcomesRecorded = descriptors.length > 0 && descriptors.length === proposals.length && resolved.length === descriptors.length;
  const selectedItem = outcomeProposalRef ? summary.items.find((item) => item.proposalRef === outcomeProposalRef) ?? null : null;

  useEffect(() => {
    if (mode !== 'record') return;
    setTeamOutcome('');
    setSharedText('');
    setRationale('');
    setMessage(null);
  }, [mode, outcomeProposalRef]);

  useEffect(() => {
    onSessionStateChange?.({
      total: summary.total,
      resolvedCount: resolved.length,
      remainingOutcomeCount: remaining,
      allCurrentOutcomesRecorded,
      canRecordTeamOutcome,
    });
  }, [summary.total, resolved.length, remaining, allCurrentOutcomesRecorded, canRecordTeamOutcome, onSessionStateChange]);

  const recordOutcome = async () => {
    if (!caseRepository || !team.selectedMembership || !team.session || !scope || !selectedItem || !canRecordTeamOutcome) return;
    if (!teamOutcome) {
      setMessage('Seleziona l’esito professionale realmente concordato dal gruppo.');
      return;
    }
    if (!selectedItem.coverageComplete && teamOutcome !== 'defer') {
      setMessage('La copertura del caso è incompleta: puoi soltanto rinviare il punto oppure attendere i contributi mancanti.');
      return;
    }
    if (!rationale.trim()) {
      setMessage('Aggiungi la motivazione sintetica dell’esito concordato dal gruppo.');
      return;
    }
    if (teamOutcome === 'shared-text' && !sharedText.trim()) {
      setMessage('Scrivi il testo condiviso concordato dal gruppo.');
      return;
    }
    const context: WorkspaceActorContext = { membership: team.selectedMembership, assurance: 'authenticated-workspace' };
    setBusy(true);
    setMessage(null);
    try {
      await caseRepository.recordTeamOutcome(context, {
        workspaceId: team.selectedMembership.workspaceId,
        ...scope,
        proposalRef: selectedItem.proposalRef,
        proposalFingerprint: selectedItem.proposalFingerprint,
        outcome: teamOutcome,
        sharedText: teamOutcome === 'shared-text' ? sharedText : null,
        rationale,
        clientRequestId: createRequestId(),
      });
      setTeamOutcome('');
      setSharedText('');
      setRationale('');
      setRefreshVersion((value) => value + 1);
      setMessage('Esito professionale del caso registrato. Non è una decisione istituzionale.');
      onOutcomeRecorded?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Esito del caso non registrato.');
    } finally {
      setBusy(false);
    }
  };

  if (!scope || !group) return <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Confronto non configurato per questo ambito.</section>;
  if (!team.session) return <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Accedi al team per il confronto condiviso del caso.</section>;

  if (mode === 'status') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700" data-case-team-status data-case-team-coordination-mode="status" data-review-case-id={reviewCaseId} data-hcm-level="1">
        <strong>Stato del lavoro del gruppo</strong>
        <span className="mt-1 block">Esiti professionali registrati: {resolved.length} di {summary.total}.</span>
      </section>
    );
  }

  if (mode === 'record') {
    const outcomeOptions = selectedItem && !selectedItem.coverageComplete
      ? ([['defer', TEAM_OUTCOME_LABELS.defer]] as const)
      : (Object.entries(TEAM_OUTCOME_LABELS) as [TeamReviewOutcome, string][]);
    return (
      <section className="space-y-3 rounded-2xl border border-indigo-200 bg-white p-4" data-case-team-outcome-recording data-case-team-coordination-mode="record" data-ux-layering="L1-L3">
        <div data-hcm-level="1">
          {!selectedItem ? (
            <p className="text-xs text-slate-600">Seleziona dal confronto la scheda per cui il gruppo ha maturato un esito.</p>
          ) : (
            <>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700">Esito professionale</span>
                <strong className="mt-1 block text-sm text-slate-900">{selectedItem.focus}</strong>
                {!selectedItem.coverageComplete && <p className="mt-1 text-xs text-amber-800">Copertura incompleta: in questo stato il punto può soltanto essere rinviato.</p>}
              </div>
              <label className="mt-3 block text-xs font-bold text-slate-700">Esito
                <select value={teamOutcome} onChange={(event) => setTeamOutcome(event.target.value as TeamReviewOutcome | '')} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3">
                  <option value="" disabled>Seleziona l’esito concordato</option>
                  {outcomeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {teamOutcome === 'shared-text' && (
                <textarea value={sharedText} onChange={(event) => setSharedText(event.target.value)} rows={3} className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Testo condiviso concordato…" />
              )}
              <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} rows={3} className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Motivazione dell’esito professionale…" />
              <button type="button" disabled={busy || !canRecordTeamOutcome || !teamOutcome || (!selectedItem.coverageComplete && teamOutcome !== 'defer')} onClick={() => void recordOutcome()} className="mt-3 min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{busy ? 'Registrazione…' : 'Registra l’esito del caso'}</button>
            </>
          )}
          {message && <p role="status" className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{message}</p>}
        </div>
        <details className="rounded-xl border border-slate-200 bg-slate-50" data-hcm-level="3" data-case-coordination-technical-layer>
          <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-600">Verifica e tracciabilità dell’esito</summary>
          <div className="space-y-2 border-t border-slate-200 p-3 text-[11px] leading-5 text-slate-600">
            <p className="break-all"><strong className="text-slate-700">Caso:</strong> {reviewCaseId}</p>
            <p><strong className="text-slate-700">Ambito:</strong> {academicYear} · {group.code} · {discipline}</p>
            {selectedItem && <p className="break-all"><strong className="text-slate-700">Fingerprint corrente:</strong> {selectedItem.proposalFingerprint}</p>}
            <p>L’esito è registrabile soltanto dall’autorità professionale prevista e resta distinto da una decisione istituzionale.</p>
          </div>
        </details>
      </section>
    );
  }

  return (
    <section className="space-y-3" data-case-team-comparison data-case-team-coordination-mode="compare" data-review-case-id={reviewCaseId} data-ux-layering="L1-L3">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4" data-hcm-level="1">
        <strong className="text-sm text-indigo-950">Confronta i punti del caso</strong>
        <p className="mt-1 text-xs leading-5 text-indigo-800">Arena porta in primo piano convergenze, differenze e punti che richiedono un esito professionale.</p>
      </div>
      <div className="space-y-3" data-hcm-level="1">
        {summary.items.map((item) => {
          const outcome = latest[item.proposalRef];
          return (
            <article key={item.proposalRef} className="rounded-xl border border-slate-200 bg-white p-3" data-team-review-coverage={item.coverageComplete ? 'complete' : 'incomplete'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-sm text-slate-900">{item.focus}</strong>
                  <p className="mt-1 text-xs text-slate-600">{BUCKET_LABELS[item.bucket]} · contributi correnti {item.contributionCount}{item.expectedContributorCount !== null ? `/${item.expectedContributorCount}` : ''}</p>
                </div>
                {outcome && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">Esito registrato</span>}
              </div>
              {!outcome && canRecordTeamOutcome && (
                <button
                  type="button"
                  onClick={() => onRequestRecordOutcome?.(item.proposalRef)}
                  data-human-next-action={item.coverageComplete ? 'record-case-outcome' : 'defer-case-outcome'}
                  className="mt-3 min-h-10 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-900"
                >
                  {item.coverageComplete ? 'Porta all’esito' : 'Rinvia il punto'}
                </button>
              )}
            </article>
          );
        })}
        {message && <p role="status" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{message}</p>}
      </div>
      <details className="rounded-xl border border-slate-200 bg-slate-50" data-hcm-level="3" data-case-coordination-technical-layer>
        <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-slate-600">Verifica e tracciabilità del confronto</summary>
        <div className="space-y-2 border-t border-slate-200 p-3 text-[11px] leading-5 text-slate-600">
          <p className="break-all"><strong className="text-slate-700">Caso:</strong> {reviewCaseId}</p>
          <p><strong className="text-slate-700">Ambito:</strong> {academicYear} · {group.code} · {discipline}</p>
          <p>Il confronto tecnico include soltanto contributi con lo stesso review_case_id e lo stesso fingerprint corrente della scheda; contributi generali o di altri casi non soddisfano la copertura.</p>
        </div>
      </details>
    </section>
  );
}
