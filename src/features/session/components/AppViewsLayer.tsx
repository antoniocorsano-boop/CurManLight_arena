import { CurriculumTab } from '../../curriculum';
import { EsportazioniTab, FontiTab, SecondBrainTab } from '../../documents';
import { PlanningHandoffPreview } from '../../beta/PlanningHandoffPreview';
import { RevisionWorkspace } from '../../beta';
import { ProcessoTab } from '../../processo';
import { ProgettazioneTab } from '../../progettazione';
import { DashboardView } from './DashboardView';
import { InfoViews } from './InfoViews';
import type { ActiveProgTab, AppViewsLayerProps } from '../types/appViewContracts';
import type { AppTab } from '../../navigation';

export type { AppViewsLayerProps } from '../types/appViewContracts';

const APP_TABS = ['dashboard', 'curricolo', 'revisione', 'progetta-evidenze', 'progetta-annuale', 'processo', 'esportazioni', 'certificazione-pa', 'fonti', 'guida', 'second-brain'] as const;
const ACTIVE_PROG_TABS = ['home', 'annuale', 'uda', 'certificazione'] as const;

const isAppTab = (tab: string): tab is AppTab => (APP_TABS as readonly string[]).includes(tab);
const isActiveProgTab = (tab: string): tab is ActiveProgTab => (ACTIVE_PROG_TABS as readonly string[]).includes(tab);

export function AppViewsLayer(props: AppViewsLayerProps) {
  const safeHandleTabSwitch = (tab: string) => {
    if (isAppTab(tab)) props.handleTabSwitch(tab);
  };

  const safeSetActiveProgTab = (tab: string) => {
    if (isActiveProgTab(tab)) props.setActiveProgTab(tab);
  };

  return (
    <>
      <DashboardView
        {...props}
        handleTabSwitch={safeHandleTabSwitch}
        setActiveProgTab={safeSetActiveProgTab}
      />

      {props.activeTab === 'curricolo' && (
        <div className="space-y-3" data-teacher-surface="curriculum">
          <aside
            data-human-task="curriculum-authority-context"
            role="note"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950"
          >
            <strong className="block text-base font-bold text-amber-950">Adesso: controlla se puoi usare questo curricolo</strong>
            <p className="mt-1">
              Stai consultando una copia locale. Prima di usarla nella progettazione, verifica nel Fascicolo fonti, applicabilità e stato.
            </p>
            <button
              type="button"
              data-human-next-action="verify-curriculum-validity"
              onClick={() => safeHandleTabSwitch('fonti')}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Verifica se puoi usarlo
            </button>

            <div
              data-human-next-step="after-curriculum-check"
              className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-3 text-slate-700"
            >
              <strong className="block text-sm text-slate-900">Dopo il controllo, scegli cosa devi fare</strong>
              <p className="mt-1 text-sm leading-6">
                Se il curricolo va bene, passa alla progettazione. Se invece vuoi proporre una modifica, apri Revisione.
              </p>
              <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  data-human-next-action="open-planning-handoff"
                  onClick={() => safeHandleTabSwitch('esportazioni')}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 font-semibold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Passa alla progettazione
                </button>
                <button
                  type="button"
                  data-human-next-action="open-curriculum-revision"
                  onClick={() => safeHandleTabSwitch('revisione')}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus-visible:ring-slate-400 focus:ring-offset-2"
                >
                  Proponi una modifica
                </button>
              </div>
            </div>

            <p className="mt-2 text-xs leading-5 text-amber-900">
              Se vuoi solo leggerlo, puoi continuare a consultare i contenuti qui sotto.
            </p>
          </aside>
          <CurriculumTab {...props} />
        </div>
      )}

      {props.activeTab === 'revisione' && (
        <div className="space-y-3" data-teacher-surface="revision">
          <RevisionWorkspace {...props} />
        </div>
      )}

      {props.activeTab === 'progetta-annuale' && (
        <div data-teacher-surface="planning">
          <ProgettazioneTab
            {...props}
            handleTabSwitch={safeHandleTabSwitch}
          />
        </div>
      )}

      {props.activeTab === 'processo' && (
        <div data-teacher-surface="process">
          <ProcessoTab {...props} />
        </div>
      )}

      {props.activeTab === 'esportazioni' && (
        <div className="space-y-4" data-teacher-surface="documents">
          <PlanningHandoffPreview />
          <EsportazioniTab {...props} />
        </div>
      )}

      {props.activeTab === 'fonti' && <FontiTab {...props} />}

      {props.activeTab !== 'fonti' && (
        <InfoViews
          activeTab={props.activeTab}
          activeGeneralSubtab={props.activeGeneralSubtab}
          setActiveGeneralSubtab={props.setActiveGeneralSubtab}
        />
      )}

      {props.activeTab === 'second-brain' && (
        <div data-teacher-surface="knowledge">
          <SecondBrainTab {...props} />
        </div>
      )}
    </>
  );
}
