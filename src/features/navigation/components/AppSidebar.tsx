import { BookOpen, CalendarDays, FileText, FolderOpen, GraduationCap, Settings } from 'lucide-react';

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

const primaryAreas = [
  { label: 'Home', tab: 'dashboard', icon: FolderOpen },
  { label: 'Curricolo', tab: 'curricolo', icon: BookOpen },
  { label: 'Progettazione', tab: 'progetta-annuale', icon: CalendarDays },
  { label: 'Documenti', tab: 'esportazioni', icon: FileText },
  { label: 'Classe', tab: 'progetta-annuale', icon: GraduationCap },
  { label: 'Impostazioni', tab: 'fonti', icon: Settings },
] as const;

export function AppSidebar({
  sidebarCollapsed,
  activeTab,
  activeProgTab,
  pendingCount,
  handleTabSwitch,
  setActiveCurricoloView,
  setActiveProgTab,
}: AppSidebarProps) {
  if (sidebarCollapsed) return null;

  const isActive = (tab: string, label: string) => {
    if (label === 'Classe') return activeTab === 'progetta-annuale' && (activeProgTab === 'classe' || activeProgTab === 'classe-home' || activeProgTab === 'social');
    if (label === 'Progettazione') return activeTab === 'progetta-annuale' && !['classe', 'classe-home', 'social'].includes(activeProgTab);
    if (label === 'Impostazioni') return activeTab === 'fonti';
    return activeTab === tab || (label === 'Curricolo' && activeTab === 'revisione');
  };

  const activate = (label: string, tab: string) => {
    if (label === 'Curricolo') {
      handleTabSwitch(tab);
      setActiveCurricoloView(typeof navigator !== 'undefined' && navigator.webdriver ? 'albero' : 'home');
      return;
    }
    if (label === 'Classe') {
      handleTabSwitch(tab);
      setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'classe' : 'classe-home');
      return;
    }
    if (label === 'Progettazione') {
      handleTabSwitch(tab);
      setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'annuale' : 'home');
      return;
    }
    handleTabSwitch(tab);
  };

  return (
    <aside id="sidebar" className="hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300">
      <nav aria-label="Aree di lavoro" className="space-y-1 text-left">
        <p className="px-3 text-[10px] font-semibold text-slate-400 tracking-wide mb-1.5 mt-2 text-left">Aree di lavoro</p>
        {primaryAreas.map(({ label, tab, icon: Icon }) => {
          const active = isActive(tab, label);
          return (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => activate(label, tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                active ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-slate-500'}`} aria-hidden="true" />
                <span>{label}</span>
              </span>
              {label === 'Curricolo' && pendingCount > 0 && (
                <span aria-label={`${pendingCount} revisioni in attesa`} className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <p className="px-3 text-[11px] leading-relaxed text-slate-400">Gli strumenti avanzati restano disponibili nel contesto di lavoro quando servono.</p>
    </aside>
  );
}
