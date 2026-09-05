import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DecisionStatus, Proposal } from '../../types/curriculum';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import { fingerprintTeamReviewProposal } from '../../domain/revision/teamReview';
import { SupabaseSharedTeamReviewRepository } from '../../infrastructure/supabase/sharedTeamReviewRepository';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

export interface TeamContributionPublisherProps {
  proposals: Proposal[];
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
}

type FingerprintMap = Record<string, string>;

const localOrientation = (decision?: DecisionStatus) => {
  if (decision === 'approved') return 'confirm-proposal' as const;
  if (decision === 'custom') return 'propose-change' as const;
  if (decision === 'rejected') return 'keep-previous' as const;
  return null;
};

export function TeamContributionPublisher({ proposals, decisions, customTexts }: TeamContributionPublisherProps) {
  const team = useTeamWorkspaceContext();
  const repository = useMemo(
    () => (team.client ? new SupabaseSharedTeamReviewRepository(team.client) : null),
    [team.client],
  );
  const [fingerprints, setFingerprints] = useState<FingerprintMap>({});
  const [currentUserContributionCount, setCurrentUserContributionCount] = useState(0);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

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
    }).catch(() => {
      if (active) setFingerprints({});
    });
    return () => { active = false; };
  }, [proposalIdentityKey]);

  useEffect(() => {
    let active = true;
    if (!repository || !team.selectedMembership || !team.session || Object.keys(fingerprints).length !== proposals.length) {
      setCurrentUserContributionCount(0);
      return () => { active = false; };
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };

    void repository.listContributions(context, team.selectedMembership.workspaceId)
      .then((contributions) => {
        if (!active) return;
        const current = new Set(
          contributions
            .filter((contribution) => contribution.contributorUserId === team.session?.user.id
              && fingerprints[contribution.proposalRef] === contribution.proposalFingerprint)
            .map((contribution) => contribution.proposalRef),
        );
        setCurrentUserContributionCount(current.size);
      })
      .catch(() => {
        if (active) setCurrentUserContributionCount(0);
      });

    return () => { active = false; };
  }, [repository, team.selectedMembership?.workspaceId, team.session?.user.id, proposalIdentityKey, fingerprints, refreshVersion]);

  const localPreparedCount = proposals.filter((proposal) => Boolean(decisions[proposal.id])).length;
  const canContribute = Boolean(team.selectedMembership && ['docente', 'dipartimento', 'referente'].includes(team.selectedMembership.role));

  const publishPreparation = async () => {
    if (!repository || !team.selectedMembership || !team.session || !canContribute || Object.keys(fingerprints).length !== proposals.length) return;
    const publishable = proposals.filter((proposal) => Boolean(localOrientation(decisions[proposal.id])));
    const invalidCustom = publishable.find((proposal) => decisions[proposal.id] === 'custom' && !customTexts[proposal.id]?.trim());

    if (invalidCustom) {
      setFeedback({ kind: 'error', text: `Completa la modifica proposta per “${invalidCustom.focus}” prima di condividerla con il team.` });
      return;
    }
    if (publishable.length === 0) {
      setFeedback({ kind: 'error', text: 'Non ci sono ancora orientamenti individuali da condividere con il team.' });
      return;
    }

    const context: WorkspaceActorContext = {
      membership: team.selectedMembership,
      assurance: 'authenticated-workspace',
    };

    setBusy(true);
    setFeedback(null);
    try {
      for (const proposal of publishable) {
        const orientation = localOrientation(decisions[proposal.id]);
        if (!orientation) continue;
        await repository.upsertContribution(context, {
          workspaceId: team.selectedMembership.workspaceId,
          proposalRef: proposal.id,
          proposalFingerprint: fingerprints[proposal.id],
          orientation,
          customText: orientation === 'propose-change' ? customTexts[proposal.id] : null,
        });
      }
      setRefreshVersion((value) => value + 1);
      setFeedback({
        kind: 'success',
        text: `${publishable.length} ${publishable.length === 1 ? 'scheda condivisa' : 'schede condivise'} con il team. Il contributo resta personale e non costituisce un esito del gruppo.`,
      });
    } catch (error) {
      setFeedback({ kind: 'error', text: error instanceof Error ? error.message : 'Contributi non registrati.' });
    } finally {
      setBusy(false);
    }
  };

  if (!team.configured) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-label="Condivisione del contributo">
        <strong className="block text-sm text-slate-900">Condivisione con il team</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">In modalità locale puoi preparare il tuo orientamento, ma non puoi pubblicarlo nel workspace condiviso.</p>
      </section>
    );
  }

  if (team.loading) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">Verifica del team in corso…</section>;
  }

  if (!team.session) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong className="block text-sm">Accedi per condividere il tuo contributo</strong>
        <p className="mt-1 leading-relaxed">La revisione personale resta locale finché non viene pubblicata esplicitamente nel team autenticato.</p>
        <Link to="/beta-identity" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 py-2 font-bold underline">Accedi</Link>
      </section>
    );
  }

  if (team.activeMemberships.length === 0) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong className="block text-sm">Account collegato, ma nessun team disponibile</strong>
        <p className="mt-1 leading-relaxed">Questo account non risulta associato a un workspace scolastico attivo.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4" aria-label="Condivisione del contributo" data-team-contribution-publisher>
      <div>
        <strong className="block text-base text-slate-900">Condividi il mio contributo</strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">Solo dopo questa azione il team vede il tuo orientamento. La pubblicazione non lo trasforma in voto, esito del team o decisione della scuola.</p>
      </div>

      {team.activeMemberships.length > 1 && (
        <label className="block text-xs font-semibold text-slate-700">Team
          <select value={team.workspaceId} onChange={(event) => team.setWorkspaceId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2">
            {team.activeMemberships.map((membership) => (
              <option key={membership.workspaceId} value={membership.workspaceId}>{membership.workspaceName} · {membership.role}</option>
            ))}
          </select>
        </label>
      )}

      {team.selectedMembership && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          <strong className="text-slate-800">Team selezionato:</strong> {team.selectedMembership.workspaceName}
          <span className="mt-1 block"><strong className="text-slate-800">Il tuo stato:</strong> {localPreparedCount} schede preparate · {currentUserContributionCount} già condivise sulla versione corrente.</span>
        </div>
      )}

      <button
        type="button"
        disabled={busy || !canContribute || localPreparedCount === 0}
        onClick={() => void publishPreparation()}
        className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Condivisione in corso…' : currentUserContributionCount > 0 ? 'Aggiorna il lavoro condiviso' : 'Condividi il mio lavoro con il team'}
      </button>

      {feedback && (
        <div role="status" aria-live="polite" className={`rounded-xl border p-3 text-xs font-semibold leading-relaxed ${feedback.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {feedback.kind === 'success' ? '✓ ' : ''}{feedback.text}
        </div>
      )}

      {team.message && <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">{team.message}</div>}
    </section>
  );
}
