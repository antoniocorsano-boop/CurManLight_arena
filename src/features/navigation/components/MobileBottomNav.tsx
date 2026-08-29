import { BookOpenCheck, ClipboardCheck, FileText, Home, Layers } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  pendingCount: number;
  handleTabSwitch: (tab: string) => void;
}

/** Mobile projection of the canonical Arena Beta journey. */
export function MobileBottomNav({ activeTab, pendingCount, handleTabSwitch }: MobileBottomNavProps) {
  const itemClass = (active: boolean) =>
    `group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 text-[10px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      active ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-800'
    }`;

  const iconShellClass = (active: boolean) =>
    `relative flex h-9 w-11 items-center justify-center rounded-2xl transition ${
      active
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
        : 'text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-800'
    }`;

  const iconClass = 'h-[21px] w-[21px]';

  return (
    <>
      <div
        className="h-[calc(5.75rem+env(safe-area-inset-bottom))] shrink-0 md:hidden"
        aria-hidden="true"
        data-mobile-dock-reserved-space="canonical"
      />
      <nav
        className="fixed left-4 right-4 z-50 grid min-h-[4.25rem] grid-cols-5 items-stretch gap-0.5 rounded-[1.4rem] border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl md:hidden"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        aria-label="Navigazione principale"
        data-beta-mobile-navigation="canonical"
        data-mobile-dock="floating"
      >
        <button type="button" onClick={() => handleTabSwitch('dashboard')} className={itemClass(activeTab === 'dashboard')} aria-current={activeTab === 'dashboard' ? 'page' : undefined}>
          <span className={iconShellClass(activeTab === 'dashboard')}>
            <Home className={iconClass} aria-hidden="true" />
          </span>
          <span>Home</span>
        </button>

        <button type="button" onClick={() => handleTabSwitch('curricolo')} className={itemClass(activeTab === 'curricolo')} aria-current={activeTab === 'curricolo' ? 'page' : undefined}>
          <span className={iconShellClass(activeTab === 'curricolo')}>
            <Layers className={iconClass} aria-hidden="true" />
          </span>
          <span>Curricolo</span>
        </button>

        <button type="button" onClick={() => handleTabSwitch('revisione')} className={itemClass(activeTab === 'revisione')} aria-current={activeTab === 'revisione' ? 'page' : undefined}>
          <span className={iconShellClass(activeTab === 'revisione')}>
            <ClipboardCheck className={iconClass} aria-hidden="true" />
            {pendingCount > 0 && (
              <span className="absolute -right-2 -top-1 min-w-5 rounded-full bg-amber-500 px-1 text-center text-[8px] font-black leading-4 text-white ring-2 ring-white" aria-label={`${pendingCount} elementi da rivedere`}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </span>
          <span>Revisione</span>
        </button>

        <button type="button" onClick={() => handleTabSwitch('fonti')} className={itemClass(activeTab === 'fonti')} aria-current={activeTab === 'fonti' ? 'page' : undefined}>
          <span className={iconShellClass(activeTab === 'fonti')}>
            <BookOpenCheck className={iconClass} aria-hidden="true" />
          </span>
          <span>Fonti</span>
        </button>

        <button type="button" onClick={() => handleTabSwitch('esportazioni')} className={itemClass(activeTab === 'esportazioni')} aria-current={activeTab === 'esportazioni' ? 'page' : undefined}>
          <span className={iconShellClass(activeTab === 'esportazioni')}>
            <FileText className={iconClass} aria-hidden="true" />
          </span>
          <span>Documenti</span>
        </button>
      </nav>
    </>
  );
}
