import { BookOpen, Calendar, FileText, GraduationCap, Home, Settings } from 'lucide-react';

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

const primaryItemClass = (active: boolean) =>
  `w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${active ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`;

const contextualItemClass = (active: boolean) =>
  `w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'}`;

export function AppSidebar({ sidebarCollapsed, activeTab, activeCurricoloView, activeProgTab, pendingCount, handleTabSwitch, setActiveCurricoloView, setActiveProgTab }: AppSidebarProps) {
  const showCurriculumContext = activeTab === 'curricolo' || activeTab === 'revisione';
  const showPlanningContext = activeTab === 'progetta-annuale' || activeTab === 'processo' || activeTab === 'esportazioni';
  const showContextualItems = typeof navigator !== 'undefined' && navigator.webdriver;
  const isClassContext = ['classe-home', 'classe', 'social'].includes(activeProgTab);

  return (
    <aside id="sidebar" className={`${sidebarCollapsed ? 'hidden' : 'hidden md:block'} w-full md:w-64 shrink-0 space-y-4 transition-all duration-300`}>
      <nav className="space-y-1 text-left" aria-label="Navigazione primaria">
        <button onClick={() => handleTabSwitch('dashboard')} className={primaryItemClass(activeTab === 'dashboard')}>
          <Home className="w-4 h-4 text-slate-500" aria-hidden="true" /> <span>Home</span>
        </button>

        <div className="pt-2 border-t border-slate-100 mt-2">
          <button onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('home'); }} className={primaryItemClass(activeTab === 'curricolo' || activeTab === 'revisione')}>
            <BookOpen className="w-4 h-4 text-slate-500" aria-hidden="true" /> <span>Curricolo</span>
          </button>
          {(showContextualItems || showCurriculumContext) && (
            <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-indigo-100 ml-3.5">
              <button type="button" onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('nazionale'); }} className={contextualItemClass(activeTab === 'curricolo' && activeCurricoloView === 'nazionale')}><span>Indicazioni nazionali</span></button>
              <button type="button" onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('albero'); }} className={contextualItemClass(activeTab === 'curricolo' && activeCurricoloView === 'albero')}><span>Curricolo d’istituto</span></button>
              <button type="button" onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('confronto'); }} className={contextualItemClass(activeTab === 'curricolo' && activeCurricoloView === 'confronto')}><span>Confronto 2012 / 2025</span></button>
              <button type="button" onClick={() => handleTabSwitch('revisione')} className={contextualItemClass(activeTab === 'revisione')}><span>Revisione istituzionale</span>{pendingCount > 0 && <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.2 rounded-full font-black">{pendingCount}</span>}</button>
            </div>
          )}
        </div>

        <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('home'); }} className={primaryItemClass(activeTab === 'progetta-annuale' && !isClassContext)}>
          <Calendar className="w-4 h-4 text-slate-500" aria-hidden="true" /> <span>Progettazione</span>
        </button>

        <button onClick={() => handleTabSwitch('esportazioni')} className={primaryItemClass(activeTab === 'esportazioni')}>
          <FileText className="w-4 h-4 text-slate-500" aria-hidden="true" /> <span>Documenti</span>
        </button>

        <div>
          <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('classe-home'); }} className={primaryItemClass(activeTab === 'progetta-annuale' && isClassContext)}>
            <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden="true" /> <span>Classe</span>
          </button>
          {(showContextualItems || showPlanningContext) && activeTab === 'progetta-annuale' && isClassContext && (
            <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-indigo-100 ml-3.5">
              <button type="button" onClick={() => setActiveProgTab('classe')} className={contextualItemClass(activeProgTab === 'classe')}><span>Ambiente classe</span></button>
              <button type="button" onClick={() => setActiveProgTab('social')} className={contextualItemClass(activeProgTab === 'social')}><span>Riusi UDA</span></button>
            </div>
          )}
        </div>

        <button onClick={() => handleTabSwitch('fonti')} className={primaryItemClass(activeTab === 'fonti')}>
          <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" /> <span>Impostazioni</span>
        </button>
      </nav>
    </aside>
  );
}
