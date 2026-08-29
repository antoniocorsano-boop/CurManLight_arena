import { CurriculumTab, RevisioneTab } from '../../curriculum';
import { EsportazioniTab, SecondBrainTab } from '../../documents';
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
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
          >
            <strong className="block font-bold text-amber-950">Prima di usare questo curricolo</strong>
            <span>
              Stai consultando una copia locale. Per sapere se è valida per la scuola, controlla Fonti, Applicabilità e Stato.
            </span>
          </aside>
          <CurriculumTab {...props} />
        </div>
      )}

      {props.activeTab === 'revisione' && (
        <div data-teacher-surface="revision">
          <RevisioneTab {...props} />
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
        <div data-teacher-surface="documents">
          <EsportazioniTab {...props} />
        </div>
      )}

      <InfoViews
        activeTab={props.activeTab}
        activeGeneralSubtab={props.activeGeneralSubtab}
        setActiveGeneralSubtab={props.setActiveGeneralSubtab}
      />

      {props.activeTab === 'second-brain' && (
        <div data-teacher-surface="knowledge">
          <SecondBrainTab {...props} />
        </div>
      )}
    </>
  );
}
