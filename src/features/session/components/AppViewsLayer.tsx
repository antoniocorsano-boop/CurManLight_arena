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

      {props.activeTab === 'curricolo' && <CurriculumTab {...props} />}
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
