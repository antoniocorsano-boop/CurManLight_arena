import { useEffect, useState } from 'react';
import { RevisioneTab } from '../curriculum';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { TeamContributionPublisher } from './TeamContributionPublisher';
import { TeamCoordinationWorkspace } from './TeamCoordinationWorkspace';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

type RevisionWorkspacePane = 'mine' | 'team';
type PersonalRevisionStage = 'review' | 'sharing';

const roleLabel = (role: string | undefined): string | null => {
  if (!role) return null;
  if (role === 'dipartimento') return 'Coordinatore di dipartimento';
  if (role === 'referente') return 'Referente';
  if (role === 'docente') return 'Docente';
  return role;
};

export function RevisionWorkspace(props: AppViewsLayerProps) {
  const { decisions, customTexts } = useCurriculumStore();
  const team = useTeamWorkspaceContext();
  const [pane, setPane] = useState<RevisionWorkspacePane>('mine');
  const [userSelectedPane, setUserSelectedPane] = useState(false);
  const [personalStage, setPersonalStage] = useState<PersonalRevisionStage>('review');

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

  useEffect(() => {
    if (!userSelectedPane && isCoordinator) setPane('team');
  }, [isCoordinator, userSelectedPane]);

  useEffect(() => {
    setPersonalStage('review');
  }, [props.discipline, props.order]);

  useEffect(() => {
    if (personalStage === 'sharing' && !reviewComplete) setPersonalStage('review');
  }, [personalStage, reviewComplete]);

  const selectPane = (next: RevisionWorkspacePane) => {
    setUserSelectedPane(true);
    setPane(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-24 md:pb-0" data-revision-workspace>
      <section className="sticky top-0 z-40 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-3" aria-label="Spazio di lavoro della revisione">
        <div className="mb-2 flex items-start justify-between gap-3">
          <strong className="block text-sm text-slate-900">Revisione del curricolo</strong>
          {selectedRoleLabel && (
            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{selectedRoleLabel}</span>
          )}
        </div>

        <div role="tablist" aria-label="Contesto della revisione" className="grid grid-cols-2 gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={pane === 'mine'}
            onClick={() => selectPane('mine')}
            className={`min-h-11 rounded-xl px-3 py-2 text-xs font-bold transition ${pane === 'mine' ? 'bg-indigo-700 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700'}`}
          >
            Il mio contributo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pane === 'team'}
            onClick={() => selectPane('team')}
            className={`min-h-11 rounded-xl px-3 py-2 text-xs font-bold transition ${pane === 'team' ? 'bg-indigo-700 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700'}`}
          >
            {isCoordinator ? 'Coordinamento del team' : 'Lavoro del team'}
          </button>
        </div>
      </section>

      {pane === 'mine' ? (
        <div className="space-y-3" role="tabpanel" aria-label="Il mio contributo">
          {personalStage === 'review' ? (
            <div className="space-y-3" data-revision-stage="review">
              <RevisioneTab
                {...props}
                onContinueAfterReview={() => {
                  if (reviewComplete) setPersonalStage('sharing');
                }}
              />

              <details
                data-hva-revision-guide
                data-revision-learning
                className="rounded-2xl border border-indigo-200 bg-indigo-50/70 text-sm leading-6 text-slate-700"
              >
                <summary className="cursor-pointer px-4 py-3 font-bold text-slate-900">Come funziona questa revisione</summary>
                <div className="border-t border-indigo-100 p-4">
                  <p>In questo spazio prepari soltanto il tuo contributo personale; non esprimi l’esito del team.</p>
                  <ol className="mt-2 grid gap-1 pl-5 text-sm list-decimal">
                    <li>Esamina una scheda alla volta.</li>
                    <li>Registra il tuo orientamento.</li>
                    <li>Quando tutte le schede sono complete, passa alla condivisione.</li>
                  </ol>
                  <p className="mt-2 font-semibold text-indigo-950">Il coordinatore resta un contributore come gli altri quando lavora in questo spazio.</p>
                </div>
              </details>
            </div>
          ) : (
            <div className="space-y-3 fade-in" data-revision-stage="sharing">
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4" aria-label="Revisione personale completata">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <strong className="block text-base text-emerald-950">Revisione personale completata</strong>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-800">{preparedReviewCount} di {totalReviewCount} schede completate. Ora il compito attivo è la condivisione con il team.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPersonalStage('review')}
                    className="min-h-10 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-900"
                  >
                    Rivedi la revisione personale
                  </button>
                </div>
              </section>

              <TeamContributionPublisher
                proposals={props.currentDisciplineProps}
                decisions={decisions}
                customTexts={customTexts}
              />
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label={isCoordinator ? 'Coordinamento del team' : 'Lavoro del team'}>
          <TeamCoordinationWorkspace
            proposals={props.currentDisciplineProps}
            discipline={props.discipline}
            order={props.order}
          />
        </div>
      )}
    </div>
  );
}
