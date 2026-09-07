import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildCaseScopedCurriculumWorkSession, resumeCaseWorkSession } from '../../domain/curriculum/caseWorkSession';
import { reviewCaseMatchesCurrentUnit } from '../../domain/curriculum/reviewCase';
import {
  getSharedReviewCaseContext,
  mergeAssignedReviewCases,
} from '../../domain/curriculum/sharedReviewCase';
import { resolveCurriculumUnitReference } from '../../domain/curriculum/didacticBinding';
import { getOperationalGroupForDiscipline } from '../../domain/institution/operationalGroups';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import { SupabaseSharedCurriculumReviewCaseRepository } from '../../infrastructure/supabase/sharedCurriculumReviewCaseRepository';
import { schoolYearToInstitutionalLabel } from '../../lib/academicYear';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { CurriculumReviewCase, Proposal, SchoolOrder } from '../../types/curriculum';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

type Props = {
  order: SchoolOrder;
  targetClass: string;
  discipline: string;
  academicYear: string;
  proposals: Proposal[];
};

const replaceCase = (reviewCaseId: string, updater: (reviewCase: CurriculumReviewCase) => CurriculumReviewCase) => {
  useCurriculumStore.setState((state) => ({
    curriculumReviewCases: (state.curriculumReviewCases ?? []).map((reviewCase) => (
      reviewCase.id === reviewCaseId ? updater(reviewCase) : reviewCase
    )),
  }));
};

export function SharedReviewCaseInbox({ order, targetClass, discipline, academicYear, proposals }: Props) {
  const team = useTeamWorkspaceContext();
  const curriculumReviewCases = useCurriculumStore((state) => state.curriculumReviewCases ?? []);
  const curriculumUnit = useMemo(() => resolveCurriculumUnitReference({
    order,
    targetClass,
    disciplineOrField: discipline,
  }), [discipline, order, targetClass]);
  const group = useMemo(() => getOperationalGroupForDiscipline(order, discipline), [discipline, order]);
  const repository = useMemo(() => team.client ? new SupabaseSharedCurriculumReviewCaseRepository(team.client) : null, [team.client]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const preferredAcademicYear = useMemo(() => schoolYearToInstitutionalLabel(academicYear), [academicYear]);
  const operationalMembership = useMemo(() => {
    if (!group) return null;
    const matches = team.operationalMemberships.filter((membership) => (
      membership.schoolOrder === group.order
      && membership.groupCode === group.code
      && membership.disciplines.includes(discipline)
    ));
    return matches.find((membership) => membership.academicYear === preferredAcademicYear)
      ?? (matches.length === 1 ? matches[0] : null);
  }, [discipline, group, preferredAcademicYear, team.operationalMemberships]);
  const sharedAcademicYear = operationalMembership?.academicYear ?? '';

  const relevantCases = useMemo(() => curriculumReviewCases.filter((reviewCase) => (
    reviewCaseMatchesCurrentUnit(reviewCase, curriculumUnit)
  )), [curriculumReviewCases, curriculumUnit]);
  const assignedCases = useMemo(() => relevantCases.filter((reviewCase) => {
    const shared = getSharedReviewCaseContext(reviewCase);
    return shared?.source === 'SERVER_ASSIGNMENT'
      && shared.academicYear === sharedAcademicYear
      && shared.discipline === discipline
      && (!group || shared.groupCode === group.code);
  }), [discipline, group, relevantCases, sharedAcademicYear]);
  const selectedRole = team.selectedMembership?.role;
  const canAssign = selectedRole === 'dipartimento' || selectedRole === 'referente';
  const publishableCases = useMemo(() => relevantCases.filter((reviewCase) => (
    !getSharedReviewCaseContext(reviewCase)
    && reviewCase.openedBy.actorId === team.session?.user.id
    && reviewCase.openedBy.roleContext === selectedRole
    && reviewCase.targetedProposalRefs.length > 0
    && reviewCase.caseState !== 'PROFESSIONAL_REVIEW_COMPLETE'
  )), [relevantCases, selectedRole, team.session?.user.id]);

  const context = useMemo<WorkspaceActorContext | null>(() => (
    team.selectedMembership && team.session
      ? { membership: team.selectedMembership, assurance: 'authenticated-workspace' }
      : null
  ), [team.selectedMembership, team.session]);

  const syncAssigned = useCallback(async (silent = false) => {
    if (!repository || !context || !group || !operationalMembership) return;
    if (!silent) setBusy(true);
    setMessage(null);
    try {
      const assigned = await repository.listMyAssignedCases(context, {
        workspaceId: context.membership.workspaceId,
        academicYear: operationalMembership.academicYear,
        groupCode: group.code,
        discipline,
      });
      useCurriculumStore.setState((state) => ({
        curriculumReviewCases: mergeAssignedReviewCases(state.curriculumReviewCases ?? [], assigned),
      }));
      setLastSyncAt(new Date().toISOString());
      if (!silent) {
        setMessage(assigned.length > 0
          ? `${assigned.length} caso${assigned.length === 1 ? '' : 'i'} assegnato${assigned.length === 1 ? '' : 'i'} disponibile${assigned.length === 1 ? '' : 'i'} nel Riesame.`
          : 'Non risultano casi condivisi assegnati per questo ambito.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Casi condivisi non leggibili.');
    } finally {
      if (!silent) setBusy(false);
    }
  }, [context, discipline, group, operationalMembership, repository]);

  useEffect(() => {
    if (!team.configured || !team.session || !team.selectedMembership || !group) return;
    if (!operationalMembership) {
      setMessage('La membership operativa verificata non espone un anno univoco per questa disciplina e questo gruppo.');
      return;
    }
    void syncAssigned(true);
  }, [group, operationalMembership, syncAssigned, team.configured, team.selectedMembership?.workspaceId, team.session?.user.id]);

  const publish = async (reviewCase: CurriculumReviewCase) => {
    if (!repository || !context || !group || !canAssign || !operationalMembership) return;
    setBusy(true);
    setMessage(null);
    try {
      const receipt = await repository.publishCase(context, {
        workspaceId: context.membership.workspaceId,
        academicYear: operationalMembership.academicYear,
        groupCode: group.code,
        discipline,
        reviewCase,
      });
      useCurriculumStore.setState((state) => ({
        curriculumReviewCases: mergeAssignedReviewCases(state.curriculumReviewCases ?? [], [receipt.reviewCase]),
      }));
      setMessage(`Caso assegnato a ${receipt.assignmentCount} partecipant${receipt.assignmentCount === 1 ? 'e' : 'i'} attiv${receipt.assignmentCount === 1 ? 'o' : 'i'} e competent${receipt.assignmentCount === 1 ? 'e' : 'i'}. Nessuna sessione professionale è stata avviata automaticamente.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Caso non assegnato al gruppo.');
    } finally {
      setBusy(false);
    }
  };

  const startOrResume = (reviewCase: CurriculumReviewCase) => {
    try {
      const nextSession = reviewCase.workSession
        ? resumeCaseWorkSession(reviewCase.workSession, team.session?.user.id)
        : buildCaseScopedCurriculumWorkSession({
            reviewCase,
            availableProposals: proposals,
            actorId: team.session?.user.id,
          });
      replaceCase(reviewCase.id, (stored) => ({
        ...stored,
        workSession: nextSession,
        caseState: 'PROFESSIONAL_VALIDATION_IN_PROGRESS',
        currentHumanPhase: 'H2_PROFESSIONAL_VALIDATION',
        professionalValidationState: 'IN_PROGRESS',
      }));
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Il riesame assegnato non può essere avviato con il contesto corrente.');
    }
  };

  if (!team.configured || !team.session || !team.selectedMembership || !group) return null;
  if (assignedCases.length === 0 && publishableCases.length === 0 && !message) return null;

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm" data-shared-review-case-inbox data-last-sync-at={lastSyncAt ?? ''} data-shared-academic-year={sharedAcademicYear}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">Riesame condiviso</span>
          <h2 className="mt-1 text-sm font-extrabold text-slate-900">Casi assegnati al mio gruppo</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">Arena mostra soltanto i casi che il server assegna alla tua membership attiva e alla tua competenza disciplinare. Ricevere un caso non avvia automaticamente la validazione.</p>
        </div>
        <button type="button" disabled={busy || !operationalMembership} onClick={() => void syncAssigned()} className="min-h-10 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800 disabled:opacity-40">{busy ? 'Aggiornamento…' : 'Aggiorna casi'}</button>
      </div>

      {operationalMembership && (
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px] leading-5 text-slate-600" data-operational-review-scope>
          Ambito operativo verificato: {operationalMembership.academicYear} · {group.code} · {discipline} · {operationalMembership.membershipState === 'FORMALIZZATO' ? 'formalizzato' : 'operativo provvisorio'}.
        </p>
      )}

      {assignedCases.length > 0 && (
        <div className="mt-4 space-y-2" data-assigned-review-case-list>
          {assignedCases.map((reviewCase) => {
            const shared = getSharedReviewCaseContext(reviewCase);
            const missing = reviewCase.targetedProposalRefs.filter((proposalRef) => !proposals.some((proposal) => proposal.id === proposalRef));
            return (
              <article key={reviewCase.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3" data-assigned-review-case={reviewCase.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <strong className="block text-sm text-slate-900">{reviewCase.targetedProposalRefs.length} schede · {reviewCase.scopeReason}</strong>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">Caso {reviewCase.id} · master {reviewCase.currentMaster.version} · assegnati {shared?.assignmentCount ?? 0}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-800">Assegnato</span>
                </div>
                {missing.length > 0 ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Il caso resta bloccato: {missing.length} scheda{missing.length === 1 ? '' : 'e'} del perimetro congelato non è disponibile nel contesto corrente.</p>
                ) : reviewCase.workSession?.sessionState === 'COMPLETE' ? (
                  <p className="mt-3 text-xs font-semibold text-emerald-800">Il tuo lavoro professionale su questo caso risulta completato.</p>
                ) : (
                  <button type="button" onClick={() => startOrResume(reviewCase)} data-human-next-action="start-assigned-review-case" className="mt-3 min-h-11 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white">
                    {reviewCase.workSession ? 'Riprendi il riesame assegnato' : 'Avvia il riesame assegnato'}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {canAssign && publishableCases.length > 0 && operationalMembership && (
        <div className="mt-4 border-t border-slate-100 pt-4" data-review-case-assignment-actions>
          <strong className="text-xs text-slate-800">Casi locali da assegnare</strong>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">L’assegnazione è un’azione distinta dall’apertura del caso. Il server individua i partecipanti attivi e competenti; non puoi autoattribuire ruoli o membership.</p>
          <div className="mt-2 space-y-2">
            {publishableCases.map((reviewCase) => (
              <div key={reviewCase.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs leading-5 text-slate-700"><strong>{reviewCase.targetedProposalRefs.length} schede</strong> · {reviewCase.scopeReason}</span>
                <button type="button" disabled={busy} onClick={() => void publish(reviewCase)} data-human-next-action="assign-review-case-to-team" className="min-h-10 shrink-0 rounded-xl bg-indigo-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Condividi e assegna al gruppo</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && <p role="status" className="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-slate-700">{message}</p>}
      <p className="mt-3 text-[11px] leading-5 text-slate-500">Assegnazione del caso ≠ avvio H2 ≠ contributo professionale ≠ esito del gruppo ≠ decisione istituzionale.</p>
    </section>
  );
}
