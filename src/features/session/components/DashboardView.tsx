import { Calendar, GraduationCap, Layers } from 'lucide-react';
import type { UdaModel, UserRole, DocumentExportEvent } from '../../../types/curriculum';
import { safeLocalStorageGetItem } from '../../../lib/consolidatedStorage';
import type { ProgStatus } from '../types/appViewContracts';
import { HomeRoleOverview } from './HomeRoleOverview';
import { RecentActivity } from './RecentActivity';

function readLastSaveTime(): number | null {
  const raw = safeLocalStorageGetItem('curman_lastSaveTime', '');
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

interface DashboardViewProps {
  activeTab: string;
  role: UserRole;
  savedUda: UdaModel[];
  decisions: Record<string, unknown>;
  wizardStep: number;
  progTitle: string;
  progStatus: ProgStatus;
  documentExportHistory: DocumentExportEvent[];
  handleDownloadCml: () => void;
  handleTabSwitch: (tab: string) => void;
  setSelectedBrainDoc: (value: string) => void;
  setWikiWorkspaceTab: (value: 'read') => void;
  setShowSaveModal: (value: boolean) => void;
  setActiveCurricoloView: (value: 'albero' | 'mappa' | 'popolamento') => void;
  setActiveProgTab: (value: string) => void;
  setSelectedUda: (uda: UdaModel | null) => void;
}

export function DashboardView({
  activeTab,
  role,
  savedUda,
  decisions,
  wizardStep,
  progTitle,
  progStatus,
  documentExportHistory,
  handleDownloadCml,
  handleTabSwitch,
  setSelectedBrainDoc,
  setWikiWorkspaceTab,
  setShowSaveModal,
  setActiveCurricoloView,
  setActiveProgTab,
  setSelectedUda,
}: DashboardViewProps) {
  const lastSaveTime = readLastSaveTime();

  return (
    <>
      {activeTab === 'dashboard' && (
        <div className="space-y-5 fade-in text-left font-medium" data-hcm-surface="home">
          <HomeRoleOverview
            role={role}
            savedUdaCount={savedUda.length}
            localChoiceCount={Object.keys(decisions).length}
            wizardStep={wizardStep}
            progTitle={progTitle}
            progStatus={progStatus}
            lastSaveTime={lastSaveTime}
            handleDownloadCml={handleDownloadCml}
            handleTabSwitch={handleTabSwitch}
            setSelectedBrainDoc={setSelectedBrainDoc}
            setWikiWorkspaceTab={setWikiWorkspaceTab}
            setShowSaveModal={setShowSaveModal}
            setActiveProgTab={setActiveProgTab}
          />

          {role === 'insegnante' && (
            <details className="rounded-2xl border border-slate-200 bg-white" data-hcm-secondary-content>
              <summary className="cursor-pointer list-none p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="block text-sm text-slate-900">Attività recenti</strong>
                    <span className="text-xs text-slate-500">Apri solo quando vuoi riprendere un lavoro precedente.</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Mostra</span>
                </div>
              </summary>
              <div className="border-t border-slate-100 p-3">
                <RecentActivity
                  savedUda={savedUda}
                  documentExportHistory={documentExportHistory}
                  handleTabSwitch={handleTabSwitch}
                  setActiveProgTab={setActiveProgTab}
                  setSelectedUda={setSelectedUda}
                />
              </div>
            </details>
          )}

          <section aria-labelledby="home-areas-title" className="space-y-3" data-hia-task-block="home-areas">
            <div>
              <h2 id="home-areas-title" className="text-base font-extrabold text-slate-900">Aree di lavoro</h2>
              <p className="mt-1 text-sm text-slate-600">Scegli l’area che corrisponde a ciò che devi fare adesso.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <article className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Layers className="h-5 w-5" aria-hidden="true" /></div>
                    <span className="rounded bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">Curricolo d’istituto</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Curricolo</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">Consulta la struttura curricolare e prepara aggiornamenti mantenendo distinto il lavoro preparatorio dalle decisioni istituzionali.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => handleTabSwitch('curricolo')} className="rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-bold text-indigo-800 transition hover:bg-indigo-100">Consulta</button>
                  <button onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('popolamento'); }} className="rounded-xl bg-indigo-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600">Aggiorna</button>
                </div>
              </article>

              <article className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Calendar className="h-5 w-5" aria-hidden="true" /></div>
                    <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Progettazione UDA</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Progettazione</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">Prepara e rivedi le UDA passo per passo, poi crea i documenti che ti servono.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'annuale' : 'home'); }} className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100">Apri</button>
                  <button onClick={() => handleTabSwitch('esportazioni')} className="rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600">Documenti</button>
                </div>
              </article>

              <article className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-purple-300 hover:shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><GraduationCap className="h-5 w-5" aria-hidden="true" /></div>
                    <span className="rounded bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">Lavoro in classe</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Classe</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">Organizza attività e gruppi usando dati locali, poi consulta gli esiti senza attribuire identità che il sistema non ha verificato.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'classe' : 'classe-home'); }} className="rounded-xl bg-purple-50 px-3 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-100">Apri classe</button>
                  <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('social'); }} className="rounded-xl bg-purple-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-purple-600">Osserva esiti</button>
                </div>
              </article>
            </div>
          </section>

          <div className="border-t border-slate-100 pt-4 text-center text-xs leading-relaxed text-slate-500">
            I dati di questa sessione vengono conservati localmente quando il browser lo consente. Le verifiche di conformità richiedono controlli dedicati.
          </div>
        </div>
      )}
    </>
  );
}
