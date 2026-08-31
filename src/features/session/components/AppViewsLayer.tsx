import { CurriculumTab, RevisioneTab } from '../../curriculum';
import { EsportazioniTab, FontiTab, SecondBrainTab } from '../../documents';
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
              Stai consultando una copia locale. Prima di usarla nella progettazione, verifica Fonti, Applicabilità e Stato.
            </p>
            <button
              type="button"
              data-human-next-action="verify-curriculum-validity"
              onClick={() => safeHandleTabSwitch('fonti')}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Verifica se puoi usarlo
            </button>
            <p className="mt-2 text-xs leading-5 text-amber-900">
              Se vuoi solo leggerlo, puoi continuare a consultare i contenuti qui sotto.
            </p>
          </aside>
          <CurriculumTab {...props} />
        </div>
      )}

      {props.activeTab === 'revisione' && (
        <div className="space-y-3" data-teacher-surface="revision">
          <aside
            data-hva-revision-guide
            role="note"
            className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm leading-6 text-slate-700"
          >
            <strong className="block text-base text-slate-900">Qui prepari una proposta. Non approvi il curricolo.</strong>
            <ol className="mt-2 grid gap-1 pl-5 text-sm list-decimal">
              <li>Confronta il testo precedente con quello proposto.</li>
              <li>Scegli quale testo portare avanti come proposta locale.</li>
              <li>Solo dopo, se serve, la proposta può entrare in un percorso di revisione separato.</li>
            </ol>
            <p className="mt-2 font-semibold text-indigo-950">
              La decisione della scuola è un passaggio diverso e richiede identità e autorità verificate. Senza quel contesto, Arena resta in consultazione e preparazione.
            </p>
          </aside>
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
