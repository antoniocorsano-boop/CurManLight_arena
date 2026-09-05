import { useEffect, useState } from 'react';
import { RevisioneTab } from '../curriculum';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { TeamContributionPublisher } from './TeamContributionPublisher';
import { TeamCoordinationWorkspace } from './TeamCoordinationWorkspace';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

type RevisionWorkspacePane = 'mine' | 'team';

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
  const incompleteCustomCount = props.currentDisciplineProps.filter(
    (proposal) => decisions[proposal.id] === 'custom' && !customTexts[proposal.id]?.trim(),
  ).length;
  const reviewComplete = totalReviewCount > 0 && preparedReviewCount === totalReviewCount;
  const sharingAvailable = preparedReviewCount > 0;

  useEffect(() => {
    if (!userSelectedPane && isCoordinator) setPane('team');
  }, [isCoordinator, userSelectedPane]);

  const selectPane = (next: RevisionWorkspacePane) => {
    setUserSelectedPane(true);
    setPane(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const continueToSharing = () => {
    if (typeof document === 'undefined') return;
    document.getElementById('team-contribution-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-3 pb-24 md:pb-0" data-revision-workspace>
      <section className="sticky top-0 z-40 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-3" aria-label="Spazio di lavoro della revisione">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="block text-sm text-slate-900">Revisione del curricolo</strong>
          </div>
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
          <section className="grid gap-2 sm:grid-cols-2" aria-label="Avanzamento del contributo personale" data-revision-process-rail>
            <div className={`rounded-xl border p-3 ${reviewComplete ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-200 bg-indigo-50/50'}`} data-revision-process-step="review">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs text-slate-900">1 · Revisione personale</strong>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${reviewComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                  {reviewComplete ? 'completata' : totalReviewCount === 0 ? 'nessun lavoro' : `${preparedReviewCount}/${totalReviewCount}`}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Esamina le schede e registra il tuo orientamento.</p>
            </div>

            <div className={`rounded-xl border p-3 ${sharingAvailable ? 'border-indigo-200 bg-white' : 'border-slate-200 bg-slate-50'}`} data-revision-process-step="sharing" data-step-state={sharingAvailable ? 'available' : 'locked'}>
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs text-slate-900">2 · Condivisione con il team</strong>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${sharingAvailable ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                  {reviewComplete ? 'prossimo passaggio' : sharingAvailable ? 'disponibile' : 'non ancora disponibile'}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                {sharingAvailable ? 'Compare quando esiste almeno un orientamento completo.' : 'Si attiva dopo il primo orientamento completo.'}
              </p>
            </div>
          </section>

          <RevisioneTab {...props} onContinueAfterReview={continueToSharing} />

          <div id="team-contribution-stage" className="scroll-mt-24" data-revision-sharing-stage>
            {sharingAvailable ? (
              <div className="space-y-3 fade-in" data-revision-stage-revealed="sharing">
                <div className={`rounded-2xl border p-4 ${reviewComplete ? 'border-emerald-200 bg-emerald-50/70' : 'border-indigo-200 bg-indigo-50/40'}`}>
                  <strong className="block text-sm text-slate-900">
                    {reviewComplete ? 'Revisione personale completata' : 'La condivisione è ora disponibile'}
                  </strong>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {reviewComplete
                      ? 'Hai completato il passaggio personale. Ora puoi rendere visibile al team il contributo che hai preparato.'
                      : `Hai ${preparedReviewCount} ${preparedReviewCount === 1 ? 'orientamento completo' : 'orientamenti completi'}. Puoi continuare la revisione oppure condividere ciò che è già pronto.`}
                  </p>
                  {incompleteCustomCount > 0 && (
                    <p className="mt-2 text-xs font-semibold text-amber-800">Completa {incompleteCustomCount === 1 ? 'la modifica ancora aperta' : `le ${incompleteCustomCount} modifiche ancora aperte`} prima della condivisione.</p>
                  )}
                </div>

                <TeamContributionPublisher
                  proposals={props.currentDisciplineProps}
                  decisions={decisions}
                  customTexts={customTexts}
                />
              </div>
            ) : (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4" aria-label="Passaggio successivo" data-revision-stage-locked="sharing">
                <strong className="block text-sm text-slate-800">La condivisione apparirà qui</strong>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">Registra almeno un orientamento completo: Arena mostrerà il passaggio successivo senza cambiare contesto.</p>
              </section>
            )}
          </div>

          <details
            data-hva-revision-guide
            data-revision-learning
            className="rounded-2xl border border-indigo-200 bg-indigo-50/70 text-sm leading-6 text-slate-700"
          >
            <summary className="cursor-pointer px-4 py-3 font-bold text-slate-900">Come funziona questa revisione</summary>
            <div className="border-t border-indigo-100 p-4">
              <p>In questo spazio prepari soltanto il tuo contributo personale; non esprimi l’esito del team.</p>
              <ol className="mt-2 grid gap-1 pl-5 text-sm list-decimal">
                <li>Confronta il testo precedente con quello proposto.</li>
                <li>Registra il tuo orientamento professionale.</li>
                <li>Quando sei pronto, condividilo esplicitamente con il team.</li>
              </ol>
              <p className="mt-2 font-semibold text-indigo-950">Il coordinatore resta un contributore come gli altri quando lavora in questo spazio.</p>
            </div>
          </details>
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
