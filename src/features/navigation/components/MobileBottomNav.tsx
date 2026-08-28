import { BookOpenCheck, FileText, FolderOpen, Layers, RotateCcw } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  pendingCount: number;
  handleTabSwitch: (tab: string) => void;
}

/** Mobile projection of the canonical Arena Beta journey. */
export function MobileBottomNav({ activeTab, pendingCount, handleTabSwitch }: MobileBottomNavProps) {
  const itemClass = (active: boolean) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 transition ${
      active ? 'font-extrabold text-indigo-700' : 'font-medium text-slate-500'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-1 shadow-2xl md:hidden" aria-label="Navigazione principale" data-beta-mobile-navigation="canonical">
      <button type="button" onClick={() => handleTabSwitch('dashboard')} className={itemClass(activeTab === 'dashboard')}>
        <FolderOpen className="h-5 w-5" aria-hidden="true" />
        <span className="text-[9px]">Home</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('curricolo')} className={itemClass(activeTab === 'curricolo')}>
        <Layers className="h-5 w-5" aria-hidden="true" />
        <span className="text-[9px]">Curricolo</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('revisione')} className={itemClass(activeTab === 'revisione')}>
        <RotateCcw className="h-5 w-5" aria-hidden="true" />
        <span className="text-[9px]">Revisione</span>
        {pendingCount > 0 && (
          <span className="absolute right-[22%] top-0 rounded-full bg-amber-500 px-1.5 text-[8px] font-black text-white" aria-label={`${pendingCount} elementi da rivedere`}>
            {pendingCount}
          </span>
        )}
      </button>

      <button type="button" onClick={() => handleTabSwitch('fonti')} className={itemClass(activeTab === 'fonti')}>
        <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        <span className="text-[9px]">Fonti</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('esportazioni')} className={itemClass(activeTab === 'esportazioni')}>
        <FileText className="h-5 w-5" aria-hidden="true" />
        <span className="text-[9px]">Documenti</span>
      </button>
    </nav>
  );
}
