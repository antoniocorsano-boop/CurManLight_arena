import { BookOpenCheck, ClipboardCheck, FileText, Home, Layers } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  pendingCount: number;
  handleTabSwitch: (tab: string) => void;
}

/** Mobile projection of the canonical Arena Beta journey. */
export function MobileBottomNav({ activeTab, pendingCount, handleTabSwitch }: MobileBottomNavProps) {
  const itemClass = (active: boolean) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-[10px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      active
        ? 'bg-indigo-50 font-extrabold text-indigo-700'
        : 'font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`;

  const iconClass = 'h-[22px] w-[22px]';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 grid min-h-[4.5rem] grid-cols-5 items-stretch gap-1 border-t border-slate-200/90 bg-white/95 px-2 pt-2 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Navigazione principale"
      data-beta-mobile-navigation="canonical"
    >
      <button type="button" onClick={() => handleTabSwitch('dashboard')} className={itemClass(activeTab === 'dashboard')} aria-current={activeTab === 'dashboard' ? 'page' : undefined}>
        <Home className={iconClass} aria-hidden="true" />
        <span>Home</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('curricolo')} className={itemClass(activeTab === 'curricolo')} aria-current={activeTab === 'curricolo' ? 'page' : undefined}>
        <Layers className={iconClass} aria-hidden="true" />
        <span>Curricolo</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('revisione')} className={itemClass(activeTab === 'revisione')} aria-current={activeTab === 'revisione' ? 'page' : undefined}>
        <span className="relative inline-flex">
          <ClipboardCheck className={iconClass} aria-hidden="true" />
          {pendingCount > 0 && (
            <span className="absolute -right-3 -top-2 min-w-5 rounded-full bg-amber-500 px-1 text-center text-[8px] font-black leading-4 text-white ring-2 ring-white" aria-label={`${pendingCount} elementi da rivedere`}>
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </span>
        <span>Revisione</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('fonti')} className={itemClass(activeTab === 'fonti')} aria-current={activeTab === 'fonti' ? 'page' : undefined}>
        <BookOpenCheck className={iconClass} aria-hidden="true" />
        <span>Fonti</span>
      </button>

      <button type="button" onClick={() => handleTabSwitch('esportazioni')} className={itemClass(activeTab === 'esportazioni')} aria-current={activeTab === 'esportazioni' ? 'page' : undefined}>
        <FileText className={iconClass} aria-hidden="true" />
        <span>Documenti</span>
      </button>
    </nav>
  );
}
