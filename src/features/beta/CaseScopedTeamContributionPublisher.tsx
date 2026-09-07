import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOperationalGroupForDiscipline } from '../../domain/institution/operationalGroups';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import { fingerprintCaseScopedTeamReviewProposal, type CaseScopedTeamReviewScope } from '../../domain/revision/caseScopedTeamReview';
import type { OperationalGroupMembership } from '../../domain/revision/teamReview';
import { SupabaseCaseScopedTeamReviewRepository } from '../../infrastructure/supabase/caseScopedTeamReviewRepository';
import { SupabaseSharedTeamReviewRepository } from '../../infrastructure/supabase/sharedTeamReviewRepository';
import type { DecisionStatus, Proposal, SchoolOrder } from '../../types/curriculum';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

export interface CaseScopedContributionPersistenceState {
  requiredCount: number;
  persistedCurrentCount: number;
  complete: boolean;
}

type Props = {
  reviewCaseId: string;
  proposals: Proposal[];
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  discipline: string;
  order: SchoolOrder;
  academicYear: string;
  onPersistenceStateChange?: (state: CaseScopedContributionPersistenceState) => void;
};

const normalizeText = (value: string | null | undefined): string => value?.trim().replace(/\s+/g, ' ') ?? '';
const orientationFor = (decision?: DecisionStatus) => {
  if (decision === 'approved') return 'confirm-proposal' as const;
  if (decision === 'custom') return 'propose-change' as const;
  if (decision === 'rejected') return 'keep-previous' as const;
  return null;
};

export function CaseScopedTeamContributionPublisher({
  reviewCaseId,
  proposals,
  decisions,
  customTexts,
  discipline,
  order,
  academicYear,
  onPersistenceStateChange,
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
  const [operationalMembership, setOperationalMembership] = useState<OperationalGroupMembership | null>(null);
  const [persistedCount, setPersistedCount] = useState(0);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const identityKey = useMemo(() => JSON.stringify([
    reviewCaseId,
    academicYear,
    order,
    discipline,
    proposals.map((proposal) => [proposal.id, proposal.focus, proposal.oldText, proposal.newText]),
  ]), [academicYear, discipline, order, proposals, reviewCaseId]);

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
    }).catch(() => {
      if (active) setFingerprints({});
    });
    return () => { active = false; };
  }, [identityKey, proposals, scope]);

  useEffect(() => {
    let active = true;
    if (!caseRepository || !sharedRepository || !team.selectedMembership || !team.session || !scope || Object.keys(fingerprints).length !== proposals.length) {
      setPersistedCount(0);
      setOperationalMembership(null);
      onPersistenceStateChange?.({ requiredCount: proposals.length, persistedCurrentCount: 0, complete: false });
      return () => { active = false; };
    }
    const context: WorkspaceActorContext = { membership: team.selectedMembership, assurance: 'authenticated-workspace' };
    void Promise.all([
      caseRepository.listContributions(context, team.selectedMembership.workspaceId, scope),
      sharedRepository.getMyOperationalMembership(context, scope),
    ]).then(([contributions, membership]) => {
      if (!active) return;
      const current = new Set(contributions.filter((contribution) => {
        if (contribution.reviewCaseId !== reviewCaseId || contribution.contributorUserId !== team.session?.user.id) return false;
        if (contribution.proposalFingerprint !== fingerprints[contribution.proposalRef]) return false;
        const orientation = orientationFor(decisions[contribution.proposalRef]);
        if (!orientation || contribution.orientation !== orientation) return false;
        if (orientation === 'propose-change') return normalizeText(contribution.customText) === normalizeText(customTexts[contribution.proposalRef]);
        return true;
      }).map((contribution) => contribution.proposalRef));
      setPersistedCount(current.size);
      setOperationalMembership(membership);
      onPersistenceStateChange?.({
        requiredCount: proposals.length,
        persistedCurrentCount: current.size,
        complete: proposals.length > 0 && current.size === proposals.length,
      });
    }).catch(() => {
      if (!active) return;
      setPersistedCount(0);
      setOperationalMembership(null);
      onPersistenceStateChange?.({ requiredCount: proposals.length, persistedCurrentCount: 0, complete: false });
    });
    return () => { active = false; };
  }, [caseRepository, sharedRepository, team.selectedMembership?.workspaceId, team.session?.user.id, scope, fingerprints, decisions, customTexts, proposals.length, refreshVersion, reviewCaseId, onPersistenceStateChange]);

  const preparedCount = proposals.filter((proposal) => {
    const decision = decisions[proposal.id];
    return Boolean(decision && (decision !== 'custom' || customTexts[proposal.id]?.trim()));
  }).length;
  const hasDisciplineCompetence = Boolean(operationalMembership?.disciplines.includes(discipline));
  const canContribute = Boolean(team.selectedMembership && ['docente', 'dipartimento', 'referente'].includes(team.selectedMembership.role) && hasDisciplineCompetence);
  const complete = proposals.length > 0 && persistedCount === proposals.length;

  const publish = async () => {
    if (!caseRepository || !team.selectedMembership || !team.session || !scope || !canContribute || Object.keys(fingerprints).length !== proposals.length) return;
    if (preparedCount !== proposals.length) {
      setMessage('Completa tutte le schede del caso prima di condividere il contributo.');
      return;
    }
    const context: WorkspaceActorContext = { membership: team.selectedMembership, assurance: 'authenticated-workspace' };
    setBusy(true);
    setMessage(null);
    try {
      for (const proposal of proposals) {
        const orientation = orientationFor(decisions[proposal.id]);
        if (!orientation) throw new Error('Orientamento del caso incompleto.');
        await caseRepository.upsertContribution(context, {
          workspaceId: team.selectedMembership.workspaceId,
          ...scope,
          proposalRef: proposal.id,
          proposalFingerprint: fingerprints[proposal.id],
          orientation,
          customText: orientation === 'propose-change' ? customTexts[proposal.id] : null,
        });
      }
      setRefreshVersion((value) => value + 1);
      setMessage('Contributo del caso registrato. Arena verifica caso, scheda, fingerprint e orientamento correnti.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Contributo del caso non registrato.');
    } finally {
      setBusy(false);
    }
  };

  if (!scope || !group) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">Condivisione disciplinare non configurata per questo caso.</section>;
  if (!team.configured) return <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">In modalità locale puoi completare il riesame del caso, ma non condividerlo nel team.</section>;
  if (!team.session) return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
      <strong className="block text-sm">Accedi per condividere il caso</strong>
      <Link to="/beta-identity" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 py-2 font-bold underline">Accedi</Link>
    </section>
  );

  return (
    <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4" data-case-team-contribution-publisher data-review-case-id={reviewCaseId} data-contribution-persistence-complete={complete ? 'true' : 'false'}>
      <div>
        <strong className="block text-base text-slate-900">Condividi il contributo di questo caso</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">Il server registra il riferimento al caso: contributi di riesami precedenti non possono soddisfare questa condivisione.</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-xs text-slate-700">
        <strong>{group.code} · {group.label}</strong>
        <span className="mt-1 block">Schede del caso: {proposals.length} · verificate come correnti: {persistedCount}</span>
      </div>
      {!operationalMembership && <p className="text-xs font-semibold text-amber-800">Registra la competenza operativa per questa disciplina prima della condivisione.</p>}
      <button type="button" disabled={busy || !canContribute || preparedCount !== proposals.length} onClick={() => void publish()} className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
        {busy ? 'Registrazione in corso…' : complete ? 'Aggiorna il contributo del caso' : 'Condividi il contributo del caso'}
      </button>
      {message && <p role="status" className="rounded-lg bg-white p-3 text-xs leading-5 text-slate-700">{message}</p>}
      <p className="text-[11px] leading-5 text-slate-500">ProfessionalContribution del caso ≠ esito del gruppo ≠ decisione istituzionale.</p>
    </section>
  );
}
