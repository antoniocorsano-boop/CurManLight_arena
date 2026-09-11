import { useCallback, useEffect, useMemo, useState } from 'react';
import { RevisioneTab } from '../curriculum';
import { CurriculumReviewCasePanel } from '../curriculum/components/CurriculumReviewCasePanel';
import { RevisionTriggerQualificationPanel } from '../curriculum/components/RevisionTriggerQualificationPanel';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { TeamContributionPublisher, type TeamContributionPersistenceState } from './TeamContributionPublisher';
import {
  TeamCoordinationWorkspace,
  type TeamCoordinationSessionState,
} from './TeamCoordinationWorkspace';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

type CurriculumWorkSessionStage = 'EXAMINE' | 'SHARE' | 'COMPARE' | 'RECORD_TEAM_OUTCOME';
type ExamineSurface = 'OVERVIEW' | 'PERSONAL_REVIEW' | 'REOPEN_CASE';

type RevisionWorkspaceProps = AppViewsLayerProps & {
  initialNormativeSourceCode?: string | null;
  onInitialNormativeSourceConsumed?: () => void;
};

const roleLabel = (role: string | undefined): string | null => {
  if (!role) return null;
  if (role === 'dipartimento') return 'Coordinatore di dipartimento';
  if (role === 'referente') return 'Referente';
  if (role === 'docente') return 'Docente';
  return role;
};

const SESSION_STEPS = [
  { id: 'EXAMINE', label: 'Valuta' },
  { id: 'SHARE', label: 'Condividi' },
  { id: 'COMPARE', label: 'Confronta' },
  { id: 'RECORD_TEAM_OUTCOME', label: 'Esito del gruppo' },
] as const;

const emptyPersistenceState = (requiredCount = 0): TeamContributionPersistenceState => ({
  requiredCount,
  persistedCurrentCount: 0,
  complete: false,
});

const emptyCoordinationState = (): TeamCoordinationSessionState => ({
  total: 0,
  openDiscussionCount: 0,
  pendingSharedOutcomeCount: 0,
  resolvedCount: 0,
  remainingOutcomeCount: 0,
  allCurrentOutcomesRecorded: false,
  canRecordTeamOutcome: false,
});

export function RevisionWorkspace(props: RevisionWorkspaceProps) {
  const { decisions, customTexts, schoolYear } = useCurriculumStore();
  const team = useTeamWorkspaceContext();
  const [stage, setStage] = useState<CurriculumWorkSessionStage>('EXAMINE');
  const [examineSurface, setExamineSurface] = useState<ExamineSurface>(
    props.initialNormativeSourceCode ? 'REOPEN_CASE' : 'OVERVIEW',
  );
  const [sharePersistence, setSharePersistence] = useState<TeamContributionPersistenceState>(() => emptyPersistenceState());
  const [coordinationState, setCoordinationState] = useState<TeamCoordinationSessionState>(() => emptyCoordinationState());
  const [outcomeProposalRef, setOutcomeProposalRef] = useState<string | null>(null);

  const selectedRole = team.selectedMembership?.role;
  const isCoordinator = selectedRole === 'dipartimento' || selectedRole === 'referente';
  const selectedRoleLabel = roleLabel(selectedRole);
  const matchingOperationalAcademicYears = useMemo(
    () => Array.from(new Set(
      team.operationalMemberships
        .filter((membership) => (
          membership.schoolOrder === props.order
          && membership.disciplines.includes(props.discipline)
        ))
        .map((membership) => membership.academicYear),
    )),
    [team.operationalMemberships, props.order, props.discipline],
  );
  const authenticatedOperationalAcademicYear = matchingOperationalAcademicYears.length === 1
    ? matchingOperationalAcademicYears[0]
    : null;
  const sharedReviewAcademicYear = team.configured && team.session
    ? authenticatedOperationalAcademicYear ?? ''
    : schoolYear;
  const totalReviewCount = props.currentDisciplineProps.length;
  const preparedReviewCount = props.currentDisciplineProps.filter((proposal) => {
    const decision = decisions[proposal.id];
    if (!decision) return false;
    if (decision === 'custom') return Boolean(customTexts[proposal.id]?.trim());
    return true;
  }).length;
  const reviewComplete = totalReviewCount > 0 && preparedReviewCount === totalReviewCount;
  const personalContributionIdentityKey = useMemo(
    () => JSON.stringify([
      props.discipline,
      props.order,
      sharedReviewAcademicYear,
      props.currentDisciplineProps.map((proposal) => [
        proposal.id,
        decisions[proposal.id] ?? null,
        customTexts[proposal.id]?.trim().replace(/\s+/g, ' ') ?? '',
      ]),
    ]),
    [props.discipline, props.order, props.currentDisciplineProps, sharedReviewAcademicYear, decisions, customTexts],
  );

  const handlePersistenceStateChange = useCallback((next: TeamContributionPersistenceState) => {
    setSharePersistence(next);
  }, []);

  const handleCoordinationStateChange = useCallback((next: TeamCoordinationSessionState) => {
    setCoordinationState(next);
  }, []);

  const openOutcomeStage = useCallback((proposalRef: string | null) => {
    setOutcomeProposalRef(proposalRef);
    setStage('RECORD_TEAM_OUTCOME');
  }, []);

  useEffect(() => {
    setStage('EXAMINE');
    setExamineSurface(props.initialNormativeSourceCode ? 'REOPEN_CASE' : 'OVERVIEW');
    setOutcomeProposalRef(null);
    setCoordinationState(emptyCoordinationState());
  }, [props.discipline, props.order, props.initialNormativeSourceCode]);

  useEffect(() => {
    if (props.initialNormativeSourceCode) setExamineSurface('REOPEN_CASE');
  }, [props.initialNormativeSourceCode]);

  useEffect(() => {
    setSharePersistence(emptyPersistenceState(totalReviewCount));
  }, [personalContributionIdentityKey, team.selectedMembership?.workspaceId, team.session?.user.id, totalReviewCount]);

  useEffect(() => {
    if (!reviewComplete && stage !== 'EXAMINE') {
      setStage('EXAMINE');
      setExamineSurface('PERSONAL_REVIEW');
    }
  }, [reviewComplete, stage]);

  useEffect(() => {
    if ((stage === 'COMPARE' || stage === 'RECORD_TEAM_OUTCOME') && !sharePersistence.complete) {
      setOutcomeProposalRef(null);
      setStage('SHARE');
    }
  }, [stage, sharePersistence.complete]);

  const stepState = (index: number): 'complete' | 'active' | 'future' => {
    if (stage === 'EXAMINE') return index === 0 ? 'active' : 'future';
    if (stage === 'SHARE') {
      if (index === 0) return 'complete';
      if (index === 1) return sharePersistence.complete ? 'complete' : 'active';
      return 'future';
    }
    if (stage === 'COMPARE') {
      if (index < 2) return 'complete';
      return index === 2 ? 'active' : 'future';
    }
    if (index < 3) return 'complete';
    return coordinationState.allCurrentOutcomesRecorded ? 'complete' : 'active';
  };

  return (
    <div
      className="space-y-3 pb-24 md:pb-0"
      data-revision-workspace
      data-curriculum-work-session
      data-work-session-stage={stage}
      data-examine-surface={stage === 'EXAMINE' ? examineSurface : undefined}
      data-persisted-share-ready={sharePersistence.complete ? 'true' : 'false'}
      data-team-outcome-complete={coordinationState.allCurrentOutcomesRecorded ? 'true' : 'false'}
    >
      <section
        className="sticky top-0 z-40 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-4"
        aria-label="Percorso di revisione del curricolo"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Il tuo percorso</span>
            <strong className="mt-1 block text-base text-slate-900">Rivedi il curricolo con i colleghi</strong>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Adesso pensa soltanto al tuo parere. I passaggi successivi si aprono quando servono.
            </p>
          </div>
          {selectedRoleLabel && (
            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{selectedRoleLabel}</span>
          )}
        </div>

        <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Avanzamento della revisione">
          {SESSION_STEPS.map((step, index) => {
            const state = stepState(index);
            return (
              <li
                key={step.id}
                data-work-session-step={step.id}
                data-work-session-step-state={state}
                className={`rounded-lg border px-2 py-2 text-center text-[10px] font-bold leading-tight ${
                  state === 'complete'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : state === 'active'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="block text-[9px] font-black">{state === 'complete' ? '✓' : index + 1}</span>
                {step.label}
              </li>
            );
          })}
        </ol>
      </section>

      {stage === 'EXAMINE' && (
        <div className="space-y-3" data-revision-stage="review" aria-label="Valuta le schede del curricolo">
          {examineSurface === 'OVERVIEW' && (
            <section className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm" data-general-review-overview>
              <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Adesso</span>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <strong className="block text-lg text-slate-950">Esprimi il tuo parere</strong>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Hai esaminato {preparedReviewCount} di {totalReviewCount} schede. Aprile una alla volta e indica se vanno bene o cosa cambieresti.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {preparedReviewCount}/{totalReviewCount}
                </span>
              </div>
              <button
                type="button"
                data-human-next-action="open-personal-review"
                onClick={() => setExamineSurface('PERSONAL_REVIEW')}
                className="mt-4 min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white"
              >
                {preparedReviewCount > 0 ? 'Continua da qui' : 'Inizia da qui'}
              </button>
              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50" data-targeted-review-disclosure>
                <summary className="cursor-pointer px-3 py-3 text-xs font-bold text-slate-700">
                  Devo rivedere solo alcune schede
                </summary>
                <div className="border-t border-slate-200 p-3">
                  <p className="text-xs leading-5 text-slate-600">
                    Usa questa strada solo se c’è un motivo preciso e il riesame riguarda una parte limitata del curricolo.
                  </p>
                  <button
                    type="button"
                    data-human-secondary-action="open-targeted-review-tools"
                    onClick={() => setExamineSurface('REOPEN_CASE')}
                    className="mt-3 min-h-10 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 sm:w-auto"
                  >
                    Scegli le schede da rivedere
                  </button>
                </div>
              </details>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Prima dai il tuo parere. Poi lo confronti con il gruppo. Le decisioni dell’Istituto vengono dopo, in un passaggio separato.
              </p>
            </section>
          )}

          {examineSurface === 'PERSONAL_REVIEW' && (
            <div className="space-y-3" data-general-personal-review>
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <button
                  type="button"
                  onClick={() => setExamineSurface('OVERVIEW')}
                  className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Torna all’inizio del riesame
                </button>
              </section>
              <RevisioneTab
                {...props}
                onContinueAfterReview={() => {
                  if (reviewComplete) setStage('SHARE');
                }}
              />
              <details
                data-hva-revision-guide
                data-revision-learning
                className="rounded-2xl border border-indigo-200 bg-indigo-50/70 text-sm leading-6 text-slate-700"
              >
                <summary className="cursor-pointer px-4 py-3 font-bold text-slate-900">Se hai bisogno di aiuto</summary>
                <div className="border-t border-indigo-100 p-4">
                  <p>Qui registri il tuo parere; non stai decidendo per il gruppo o per l’Istituto.</p>
                  <ol className="mt-2 grid gap-1 pl-5 text-sm list-decimal">
                    <li>Leggi una scheda alla volta.</li>
                    <li>Indica se la confermi o cosa cambieresti.</li>
                    <li>Quando hai finito tutte le schede, passa alla condivisione.</li>
                  </ol>
                  <p className="mt-2 font-semibold text-indigo-950">Anche chi coordina il gruppo comincia dal proprio parere personale.</p>
                </div>
              </details>
            </div>
          )}

          {examineSurface === 'REOPEN_CASE' && (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3" data-targeted-review-tools>
              <div className="flex items-start justify-between gap-3 px-1">
                <div>
                  <strong className="block text-base text-slate-950">Rivedi solo le schede interessate</strong>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Indica perché serve il riesame e scegli soltanto le schede coinvolte.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExamineSurface('OVERVIEW')}
                  className="shrink-0 min-h-10 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Chiudi
                </button>
              </div>

              <RevisionTriggerQualificationPanel
                order={props.order}
                targetClass={props.targetClass}
                discipline={props.discipline}
                initialNormativeSourceCode={props.initialNormativeSourceCode}
                onInitialNormativeSourceConsumed={props.onInitialNormativeSourceConsumed}
              />

              <CurriculumReviewCasePanel
                order={props.order}
                targetClass={props.targetClass}
                discipline={props.discipline}
                proposals={props.currentDisciplineProps}
                actorId={team.session?.user.id}
                roleContext={selectedRole}
              />
            </section>
          )}
        </div>
      )}

      {stage === 'SHARE' && (
        <div className="space-y-3 fade-in" data-revision-stage="sharing" aria-label="Condividi il tuo contributo">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4" aria-label="Revisione personale completata">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong className="block text-base text-emerald-950">Il tuo parere è pronto</strong>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                  Hai completato {preparedReviewCount} di {totalReviewCount} schede. Ora puoi condividerle con il gruppo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExamineSurface('PERSONAL_REVIEW');
                  setStage('EXAMINE');
                }}
                className="min-h-10 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-900"
              >
                Rivedi il mio parere
              </button>
            </div>
          </section>

          <TeamContributionPublisher
            proposals={props.currentDisciplineProps}
            decisions={decisions}
            customTexts={customTexts}
            discipline={props.discipline}
            order={props.order}
            academicYear={sharedReviewAcademicYear}
            onPersistenceStateChange={handlePersistenceStateChange}
          />

          {isCoordinator && !sharePersistence.complete && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="Confronto non ancora disponibile" data-team-comparison-blocked-by-share>
              <strong className="block text-sm text-amber-950">Prima completa la condivisione</strong>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                Il confronto si apre quando tutte le {sharePersistence.requiredCount || totalReviewCount} schede del tuo lavoro risultano condivise con il gruppo.
              </p>
            </section>
          )}

          {isCoordinator && sharePersistence.complete && (
            <section className="rounded-2xl border border-indigo-200 bg-white p-4" aria-label="Passaggio al confronto del gruppo" data-team-comparison-ready>
              <strong className="block text-sm text-slate-900">Condivisione completata</strong>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Il tuo parere è nel gruppo. Ora puoi aprire il confronto come coordinatore; il tuo ruolo di coordinamento resta separato dal parere personale.
              </p>
              <button
                type="button"
                data-human-next-action="open-team-comparison"
                onClick={() => setStage('COMPARE')}
                className="mt-3 min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white sm:w-auto"
              >
                Apri il confronto del gruppo
              </button>
            </section>
          )}

          {!isCoordinator && sharePersistence.complete && (
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label="Attesa del confronto del gruppo" data-personal-work-complete>
              <strong className="block text-sm text-slate-900">Il tuo parere è condiviso</strong>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Per ora non devi fare altro. Il coordinatore proseguirà con il confronto e registrerà gli esiti quando il gruppo sarà pronto.
              </p>
              <details className="mt-3 rounded-xl border border-slate-200 bg-white">
                <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-slate-700">Vedi lo stato del confronto</summary>
                <div className="border-t border-slate-100 p-3">
                  <TeamCoordinationWorkspace
                    proposals={props.currentDisciplineProps}
                    discipline={props.discipline}
                    order={props.order}
                    academicYear={sharedReviewAcademicYear}
                    mode="status"
                  />
                </div>
              </details>
            </section>
          )}
        </div>
      )}

      {stage === 'COMPARE' && isCoordinator && sharePersistence.complete && (
        <div className="space-y-3 fade-in" data-revision-stage="compare" aria-label="Confronto del gruppo">
          <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong className="block text-base text-indigo-950">Confronta i punti ancora aperti</strong>
                <p className="mt-1 text-xs leading-relaxed text-indigo-800">
                  Leggi i pareri del gruppo e porta all’esito soltanto ciò su cui avete raggiunto un accordo professionale.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStage('SHARE')}
                className="min-h-10 rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs font-bold text-indigo-900"
              >
                Torna alla condivisione
              </button>
            </div>
          </section>

          <TeamCoordinationWorkspace
            proposals={props.currentDisciplineProps}
            discipline={props.discipline}
            order={props.order}
            academicYear={sharedReviewAcademicYear}
            mode="compare"
            onSessionStateChange={handleCoordinationStateChange}
            onRequestRecordOutcome={openOutcomeStage}
          />
        </div>
      )}

      {stage === 'RECORD_TEAM_OUTCOME' && isCoordinator && sharePersistence.complete && (
        <div className="space-y-3 fade-in" data-revision-stage="team-outcome" aria-label="Registra l’esito del gruppo">
          <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong className="block text-base text-indigo-950">Registra l’esito del gruppo</strong>
                <p className="mt-1 text-xs leading-relaxed text-indigo-800">
                  Registra soltanto ciò che il gruppo ha già concordato. Questo esito non è ancora una decisione dell’Istituto.
                </p>
              </div>
              <button
                type="button"
                data-human-next-action="return-to-team-comparison"
                onClick={() => {
                  setOutcomeProposalRef(null);
                  setStage('COMPARE');
                }}
                className="min-h-10 rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs font-bold text-indigo-900"
              >
                Torna al confronto
              </button>
            </div>
          </section>

          <TeamCoordinationWorkspace
            proposals={props.currentDisciplineProps}
            discipline={props.discipline}
            order={props.order}
            academicYear={sharedReviewAcademicYear}
            mode="record"
            outcomeProposalRef={outcomeProposalRef}
            onSessionStateChange={handleCoordinationStateChange}
            onRequestRecordOutcome={setOutcomeProposalRef}
            onOutcomeRecorded={() => setOutcomeProposalRef(null)}
          />

          {coordinationState.allCurrentOutcomesRecorded && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" data-curriculum-work-session-complete>
              <strong className="block text-sm text-emerald-950">Il lavoro del gruppo su queste schede è completo</strong>
              <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                Gli esiti sono registrati. Il curricolo non è ancora approvato: il controllo tra le classi e l’eventuale decisione dell’Istituto vengono dopo, in passaggi separati.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
