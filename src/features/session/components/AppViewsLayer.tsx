import { useEffect, useState } from 'react';
import { CurriculumTab } from '../../curriculum';
import { EsportazioniTab, FontiTab, SecondBrainTab } from '../../documents';
import {
  NORMATIVE_REVIEW_REQUEST_EVENT,
  readNormativeReviewRequest,
} from '../../documents/lib/normativeReviewIntent';
import { PlanningHandoffPreview } from '../../beta/PlanningHandoffPreview';
import { CaseAwareRevisionSurface } from '../../beta/CaseAwareRevisionSurface';
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
  const [normativeReviewSourceCode, setNormativeReviewSourceCode] = useState<string | null>(null);

  const safeHandleTabSwitch = (tab: string) => {
    if (isAppTab(tab)) props.handleTabSwitch(tab);
  };

  const safeSetActiveProgTab = (tab: string) => {
    if (isActiveProgTab(tab)) props.setActiveProgTab(tab);
  };

  useEffect(() => {
    const handleNormativeReviewRequest = (event: Event) => {
      const sourceCode = readNormativeReviewRequest(event);
      if (!sourceCode) return;
      setNormativeReviewSourceCode(sourceCode);
      props.handleTabSwitch('revisione');
    };

    window.addEventListener(NORMATIVE_REVIEW_REQUEST_EVENT, handleNormativeReviewRequest);
    return () => window.removeEventListener(NORMATIVE_REVIEW_REQUEST_EVENT, handleNormativeReviewRequest);
  }, [props.handleTabSwitch]);

  return (
    <>
      <DashboardView
        {...props}
        handleTabSwitch={safeHandleTabSwitch}
        setActiveProgTab={safeSetActiveProgTab}
      />

      {props.activeTab === 'curricolo' && (
        <div className="space-y-3" data-teacher-surface="curriculum">
          <CurriculumTab {...props} />
        </div>
      )}

      {props.activeTab === 'revisione' && (
        <div className="space-y-3" data-teacher-surface="revision">
          <CaseAwareRevisionSurface
            {...props}
            initialNormativeSourceCode={normativeReviewSourceCode}
            onInitialNormativeSourceConsumed={() => setNormativeReviewSourceCode(null)}
          />
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
