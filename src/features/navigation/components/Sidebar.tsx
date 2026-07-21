import { FolderOpen, GitBranch, Award, Calendar, LibraryBig, GraduationCap } from 'lucide-react';
import { useNavigationStore } from '../../../stores';

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { activeTab, setActiveTab } = useNavigationStore();

  const navItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: FolderOpen, section: 'Navigazione Globale' },
    { id: 'curricolo', label: 'Consulta Curricolo', icon: GitBranch, section: 'Consulta Curricolo' },
    { id: 'progetta-annuale', label: 'Progettazione UDA', icon: Calendar, section: 'Progettazione UDA' },
    { id: 'processo', label: 'Spazio d\'Aula e Classe', icon: GraduationCap, section: 'Spazio d\'Aula' },
    { id: 'certificazione-pa', label: 'Certificazione PA', icon: Award, section: 'Supporto & Certificazioni' },
    { id: 'second-brain', label: 'WikiLLM & Brain', icon: LibraryBig, section: 'Supporto & Certificazioni' },
  ];

  if (collapsed) return null;

  return (
    <aside id="sidebar" className="hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300">
      <nav className="space-y-1 text-left">
        {navItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => setActiveTab(item.id as Parameters<typeof setActiveTab>[0])}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <item.icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </span>
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
