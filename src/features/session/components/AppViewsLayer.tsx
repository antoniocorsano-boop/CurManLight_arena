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
        <div className="space-y-3">
          <aside
            data-human-task="curriculum-authority-context"
            role="note"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-950"
          >
            <strong className="block text-[10px] uppercase tracking-wider text-amber-800">Stato del contesto curricolare</strong>
            <span>
              Questa è una copia locale di consultazione: non attesta configurazione o adozione istituzionale. Verifica sempre fonti, applicabilità e stato prima di usarla come baseline autorevole.
            </span>
          </aside>
          <CurriculumTab {...props} />
        </div>
      )}
      {props.activeTab === 'revisione' && <RevisioneTab {...props} />}

      {props.activeTab === 'progetta-annuale' && (
        <ProgettazioneTab
          {...props}
          handleTabSwitch={safeHandleTabSwitch}
        />
      )}

      {props.activeTab === 'processo' && <ProcessoTab {...props} />}
      {props.activeTab === 'esportazioni' && <EsportazioniTab {...props} />}

      <InfoViews
        activeTab={props.activeTab}
        activeGeneralSubtab={props.activeGeneralSubtab}
        setActiveGeneralSubtab={props.setActiveGeneralSubtab}
      />

      {props.activeTab === 'second-brain' && <SecondBrainTab {...props} />}
    </>
  );
}
