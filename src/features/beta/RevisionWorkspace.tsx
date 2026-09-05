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

  useEffect(() => {
    if (!userSelectedPane && isCoordinator) setPane('team');
  }, [isCoordinator, userSelectedPane]);

  const selectPane = (next: RevisionWorkspacePane) => {
    setUserSelectedPane(true);
    setPane(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-24 md:pb-0" data-revision-workspace>
      <section className="sticky top-0 z-40 -mx-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-3" aria-label="Spazio di lavoro della revisione">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="block text-sm text-slate-900">Revisione del curricolo</strong>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Il contributo personale resta separato dal lavoro del gruppo.
            </p>
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
          <aside
            data-hva-revision-guide
            role="note"
            className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm leading-6 text-slate-700"
          >
            <strong className="block text-base text-slate-900">Qui prepari il confronto. Non approvi il curricolo.</strong>
            <p className="mt-1">In questo spazio prepari soltanto il tuo contributo personale; non esprimi l’esito del team.</p>
            <ol className="mt-2 grid gap-1 pl-5 text-sm list-decimal">
              <li>Confronta il testo precedente con quello proposto.</li>
              <li>Registra il tuo orientamento professionale.</li>
              <li>Quando sei pronto, condividilo esplicitamente con il team.</li>
            </ol>
            <p className="mt-2 font-semibold text-indigo-950">Il coordinatore resta un contributore come gli altri quando lavora in questo spazio.</p>
          </aside>

          <RevisioneTab {...props} />
          <TeamContributionPublisher
            proposals={props.currentDisciplineProps}
            decisions={decisions}
            customTexts={customTexts}
          />
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
