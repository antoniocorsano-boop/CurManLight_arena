import { BookOpenCheck, FileText, FolderOpen, HelpCircle, Layers, RotateCcw, ShieldCheck } from 'lucide-react';

interface AppSidebarProps {
  sidebarCollapsed: boolean;
  activeTab: string;
  activeCurricoloView: string;
  activeProgTab: string;
  pendingCount: number;
  handleTabSwitch: (tab: string) => void;
  setActiveCurricoloView: (value: string) => void;
  setActiveProgTab: (value: string) => void;
}

/**
 * Primary navigation for the controlled Arena Beta.
 *
 * It follows the canonical institutional journey rather than exposing the
 * historical feature inventory. Classroom, social, generic AI and broad UDA
 * authoring remain outside the first Beta navigation surface.
 */
export function AppSidebar(props: AppSidebarProps) {
  if (props.sidebarCollapsed) return null;

  const itemClass = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition ${
      active
        ? 'border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <aside id="sidebar" className="hidden w-full shrink-0 space-y-5 transition-all duration-300 md:block md:w-64" data-beta-navigation="canonical">
      <nav className="space-y-5 text-left" aria-label="Navigazione principale">
        <section aria-labelledby="nav-orientamento">
          <p id="nav-orientamento" className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Orientamento</p>
          <button type="button" onClick={() => props.handleTabSwitch('dashboard')} className={itemClass(props.activeTab === 'dashboard')}>
            <FolderOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Home</span>
          </button>
        </section>

        <section aria-labelledby="nav-curricolo" className="border-t border-slate-100 pt-4">
          <p id="nav-curricolo" className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Curricolo d’istituto</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { props.handleTabSwitch('curricolo'); props.setActiveCurricoloView('home'); }}
              className={itemClass(props.activeTab === 'curricolo')}
            >
              <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Consulta il curricolo</span>
            </button>

            <button
              type="button"
              onClick={() => props.handleTabSwitch('revisione')}
              className={itemClass(props.activeTab === 'revisione')}
            >
              <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">Rivedi le proposte</span>
              {props.pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800" aria-label={`${props.pendingCount} elementi da rivedere`}>
                  {props.pendingCount}
                </span>
              )}
            </button>

            <button type="button" onClick={() => props.handleTabSwitch('fonti')} className={itemClass(props.activeTab === 'fonti')}>
              <BookOpenCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Controlla le fonti</span>
            </button>

            <button type="button" onClick={() => props.handleTabSwitch('esportazioni')} className={itemClass(props.activeTab === 'esportazioni')}>
              <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Crea un documento</span>
            </button>
          </div>

          {props.activeTab === 'curricolo' && (
            <details className="mt-2 rounded-xl border border-slate-100 bg-slate-50" data-beta-secondary-navigation>
              <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-600">Altre viste del curricolo</summary>
              <div className="space-y-1 border-t border-slate-100 p-2">
                <button type="button" onClick={() => props.setActiveCurricoloView('albero')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-white">Struttura</button>
                <button type="button" onClick={() => props.setActiveCurricoloView('mappa')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-white">Confronto nel tempo</button>
                <button type="button" onClick={() => props.setActiveCurricoloView('popolamento')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-white">Aggiornamento</button>
              </div>
            </details>
          )}
        </section>

        <section aria-labelledby="nav-supporto" className="border-t border-slate-100 pt-4">
          <p id="nav-supporto" className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Supporto</p>
          <div className="space-y-1">
            <button type="button" onClick={() => props.handleTabSwitch('certificazione-pa')} className={itemClass(props.activeTab === 'certificazione-pa')}>
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Controlli e checklist</span>
            </button>
            <button type="button" onClick={() => props.handleTabSwitch('guida')} className={itemClass(props.activeTab === 'guida')}>
              <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Guida</span>
            </button>
          </div>
        </section>
      </nav>
    </aside>
  );
}
