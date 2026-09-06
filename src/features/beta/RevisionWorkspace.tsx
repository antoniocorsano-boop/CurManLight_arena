import { useCallback, useEffect, useMemo, useState } from 'react';
import { RevisioneTab } from '../curriculum';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { TeamContributionPublisher, type TeamContributionPersistenceState } from './TeamContributionPublisher';
import { TeamCoordinationWorkspace } from './TeamCoordinationWorkspace';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

type CurriculumWorkSessionStage = 'EXAMINE' | 'SHARE' | 'COMPARE';

const roleLabel = (role: string | undefined): string | null => {
  if (!role) return null;
  if (role === 'dipartimento') return 'Coordinatore di dipartimento';
  if (role === 'referente') return 'Referente';
  if (role === 'docente') return 'Docente';
  return role;
};

const SESSION_STEPS = [
  { id: 'EXAMINE', label: 'Esamina' },
  { id: 'SHARE', label: 'Condividi' },
  { id: 'COMPARE', label: 'Confronta' },
  { id: 'RECORD_TEAM_OUTCOME', label: 'Esito del gruppo' },
] as const;

const emptyPersistenceState = (requiredCount = 0): TeamContributionPersistenceState => ({
  requiredCount,
  persistedCurrentCount: 0,
  complete: false,
});

export function RevisionWorkspace(props: AppViewsLayerProps) {
  const { decisions, customTexts, schoolYear } = useCurriculumStore();
  const team = useTeamWorkspaceContext();
  const [stage, setStage] = useState<CurriculumWorkSessionStage>('EXAMINE');
  const [sharePersistence, setSharePersistence] = useState<TeamContributionPersistenceState>(() => emptyPersistenceState());

  const selectedRole = team.selectedMembership?.role;
  const isCoordinator = selectedRole === 'dipartimento' || selectedRole === 'referente';
  const selectedRoleLabel = roleLabel(selectedRole);
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
      schoolYear,
      props.currentDisciplineProps.map((proposal) => [
        proposal.id,
        decisions[proposal.id] ?? null,
        customTexts[proposal.id]?.trim().replace(/\s+/g, ' ') ?? '',
      ]),
    ]),
    [props.discipline, props.order, props.currentDisciplineProps, schoolYear, decisions, customTexts],
  );

  const handlePersistenceStateChange = useCallback((next: TeamContributionPersistenceState) => {
    setSharePersistence(next);
  }, []);

  useEffect(() => {
    setStage('EXAMINE');
  }, [props.discipline, props.order]);

  useEffect(() => {
    setSharePersistence(emptyPersistenceState(totalReviewCount));
  }, [personalContributionIdentityKey, team.selectedMembership?.workspaceId, team.session?.user.id, totalReviewCount]);

  useEffect(() => {
    if (!reviewComplete && stage !== 'EXAMINE') setStage('EXAMINE');
  }, [reviewComplete, stage]);

  useEffect(() => {
    if (stage === 'COMPARE' && !sharePersistence.complete) setStage('SHARE');
  }, [stage, sharePersistence.complete]);

  const stepState = (index: number): 'complete' | 'active' | 'future' => {
    if (stage === 'EXAMINE') return index === 0 ? 'active' : 'future';
    if (stage === 'SHARE') {
      if (index === 0) return 'complete';
      if (index === 1) return sharePersistence.complete ? 'complete' : 'active';
      return 'future';
    }
    if (index < 2) return 'complete';
    return index === 2 ? 'active' : 'future';
  };

  return (
    <div
      className="space-y-3 pb-24 md:pb-0"
      data-revision-workspace
      data-curriculum-work-session
      data-work-session-stage={stage}
      data-persisted-share-ready={sharePersistence.complete ? 'true' : 'false'}
    >
      <section
        className="sticky top-0 z-40 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-4"
        aria-label="Sessione di lavoro sul curricolo"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Validazione professionale</span>
            <strong className="mt-1 block text-base text-slate-900">Il mio lavoro sul curricolo</strong>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Un solo percorso: prima esamini e condividi il tuo contributo; il confronto del gruppo arriva dopo.
            </p>
          </div>
          {selectedRoleLabel && (
            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{selectedRoleLabel}</span>
          )}
        </div>

        <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Avanzamento della sessione">
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
        <div className="space-y-3" data-revision-stage="review" aria-label="Esamina il tuo contributo">
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
            <summary className="cursor-pointer px-4 py-3 font-bold text-slate-900">Come funziona questa revisione</summary>
            <div className="border-t border-indigo-100 p-4">
              <p>Qui prepari soltanto il tuo contributo personale; non esprimi l’esito del gruppo.</p>
              <ol className="mt-2 grid gap-1 pl-5 text-sm list-decimal">
                <li>Esamina una scheda alla volta.</li>
                <li>Registra il tuo orientamento professionale.</li>
                <li>Quando tutte le schede sono complete, passa alla condivisione.</li>
              </ol>
              <p className="mt-2 font-semibold text-indigo-950">Anche il coordinatore completa prima il proprio contributo personale.</p>
            </div>
          </details>
        </div>
      )}

      {stage === 'SHARE' && (
        <div className="space-y-3 fade-in" data-revision-stage="sharing" aria-label="Condividi il tuo contributo">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4" aria-label="Revisione personale completata">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong className="block text-base text-emerald-950">Il contributo personale è pronto</strong>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                  {preparedReviewCount} di {totalReviewCount} schede completate. Ora rendi esplicitamente visibile il tuo contributo al gruppo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStage('EXAMINE')}
                className="min-h-10 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-900"
              >
                Rivedi il mio contributo
              </button>
            </div>
          </section>

          <TeamContributionPublisher
            proposals={props.currentDisciplineProps}
            decisions={decisions}
            customTexts={customTexts}
            discipline={props.discipline}
            order={props.order}
            academicYear={schoolYear}
            onPersistenceStateChange={handlePersistenceStateChange}
          />

          {isCoordinator && !sharePersistence.complete && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="Confronto non ancora disponibile" data-team-comparison-blocked-by-share>
              <strong className="block text-sm text-amber-950">Il confronto si apre dopo la condivisione verificata</strong>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                Arena abilita il confronto soltanto quando tutte le {sharePersistence.requiredCount || totalReviewCount} schede del tuo contributo corrente risultano registrate nel team.
              </p>
            </section>
          )}

          {isCoordinator && sharePersistence.complete && (
            <section className="rounded-2xl border border-indigo-200 bg-white p-4" aria-label="Passaggio al confronto del gruppo" data-team-comparison-ready>
              <strong className="block text-sm text-slate-900">Condivisione verificata</strong>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Il tuo contributo corrente è registrato nel team. Ora puoi aprire il confronto come coordinatore; il ruolo di coordinamento resta distinto dal contributo individuale.
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
              <strong className="block text-sm text-slate-900">Il tuo contributo è condiviso</strong>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Per ora non devi fare altro. Il coordinatore avvierà il confronto quando i contributi necessari saranno disponibili.
              </p>
              <details className="mt-3 rounded-xl border border-slate-200 bg-white">
                <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-slate-700">Vedi lo stato del confronto</summary>
                <div className="border-t border-slate-100 p-3">
                  <TeamCoordinationWorkspace
                    proposals={props.currentDisciplineProps}
                    discipline={props.discipline}
                    order={props.order}
                    academicYear={schoolYear}
                  />
                </div>
              </details>
            </section>
          )}
        </div>
      )}

      {stage === 'COMPARE' && isCoordinator && sharePersistence.complete && (
        <div className="space-y-3 fade-in" data-revision-stage="compare" aria-label="Confronto ed esito del gruppo">
          <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong className="block text-base text-indigo-950">Confronto del gruppo</strong>
                <p className="mt-1 text-xs leading-relaxed text-indigo-800">
                  Ora lavori come coordinatore: confronta i contributi e registra l’esito solo quando i prerequisiti del gruppo sono soddisfatti.
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
            academicYear={schoolYear}
          />
        </div>
      )}
    </div>
  );
}
