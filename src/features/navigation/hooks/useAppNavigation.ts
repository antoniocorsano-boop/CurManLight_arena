import { useEffect, useState } from 'react';

export type AppTab =
  | 'dashboard'
  | 'curricolo'
  | 'revisione'
  | 'progetta-evidenze'
  | 'progetta-annuale'
  | 'processo'
  | 'esportazioni'
  | 'certificazione-pa'
  | 'fonti'
  | 'guida'
  | 'second-brain';

interface UseAppNavigationArgs {
  secondBrainTab: string;
  activeGeneralSubtab: string;
  activeProgTab: string;
  activeProcessoTab: string;
  wikiWorkspaceTab: string;
}

const resetMainScroll = () => {
  const mainEl = document.getElementById('main-content');
  if (mainEl) {
    mainEl.scrollTop = 0;
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.body.scrollTop = 0;
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
};

const closeMobileSidebar = () => {
  if (window.innerWidth >= 768) return;
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.className = "hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300";
  }
};

export const useAppNavigation = ({
  secondBrainTab,
  activeGeneralSubtab,
  activeProgTab,
  activeProcessoTab,
  wikiWorkspaceTab
}: UseAppNavigationArgs) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    resetMainScroll();
  }, [activeTab, secondBrainTab, activeGeneralSubtab, activeProgTab, activeProcessoTab, wikiWorkspaceTab]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        if (sidebar.classList.contains('hidden')) {
          sidebar.className = "fixed inset-y-16 left-4 bg-white border-2 border-slate-200 shadow-2xl z-40 p-4 rounded-2xl w-[280px] space-y-4 overflow-y-auto fade-in block";
        } else {
          sidebar.className = "hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300";
        }
      }
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  const handleTabSwitch = (tab: AppTab) => {
    setActiveTab(tab);
    closeMobileSidebar();
    resetMainScroll();
  };

  return {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    handleTabSwitch
  };
};
