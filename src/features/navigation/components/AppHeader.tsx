import { Bot, DownloadCloud, Layers3, RotateCcw, Save, ServerCog, Settings, ShieldAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';

interface AppHeaderProps {
  toggleSidebar: () => void;
  isCopilotChatOpen: boolean;
  setIsCopilotChatOpen: (value: boolean) => void;
  setShowAgentSetupModal: (value: boolean) => void;
  localAgentStatus: string;
  localAgentType: 'webgpu' | 'ollama' | 'none';
  ollamaStatus: string;
  ollamaModelName: string;
  localAgentSize: 'light' | 'full' | 'none';
  setShowSaveModal: (value: boolean) => void;
  roleDropdownOpen: boolean;
  setRoleDropdownOpen: (value: boolean) => void;
  isWorkspaceLoggedIn: boolean;
  cloudAccountType: 'scolastica' | 'personale';
  workspaceUserEmail: string;
  handleWorkspaceSync: () => void;
  showToast: (message: string, success?: boolean) => void;
  handleClearLocalStorageWithReset: () => void;
  handleWorkspaceLogout: () => void;
  setShowCloudAccountModal: (value: boolean) => void;
}

/** Canonical Arena Beta header. */
export function AppHeader(props: AppHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const assistantReady = props.localAgentStatus === 'ready'
    || (props.localAgentType === 'ollama' && props.ollamaStatus === 'connected');

  useEffect(() => {
    const closeMobileNavigation = () => setMobileNavigationOpen(false);
    window.addEventListener('arena:mobile-navigation-closed', closeMobileNavigation);
    return () => window.removeEventListener('arena:mobile-navigation-closed', closeMobileNavigation);
  }, []);

  const handleNavigationToggle = () => {
    props.toggleSidebar();
    if (window.innerWidth < 768) {
      setMobileNavigationOpen((open) => !open);
    }
  };

  const handleAssistantToggle = () => {
    const nextOpen = !props.isCopilotChatOpen;
    if (nextOpen) {
      window.dispatchEvent(new CustomEvent('arena:assistant-open'));
    }
    props.setIsCopilotChatOpen(nextOpen);
    props.setRoleDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 shrink-0 border-b border-slate-800 bg-slate-900 text-white shadow-md" data-beta-shell="canonical">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleNavigationToggle}
                aria-controls="sidebar"
                aria-label={mobileNavigationOpen ? 'Chiudi la navigazione' : 'Apri la navigazione'}
                aria-expanded={mobileNavigationOpen}
                title={mobileNavigationOpen ? 'Chiudi navigazione' : 'Apri navigazione'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                data-brand-mark="curmanlight"
                data-mobile-navigation-trigger="brand"
              >
                {mobileNavigationOpen
                  ? <X className="h-5 w-5" aria-hidden="true" />
                  : <Layers3 className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />}
              </button>

              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold tracking-tight">CurManLight</div>
                <div className="hidden text-[10px] font-semibold text-slate-400 sm:block">Curricolo d’istituto</div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => props.setRoleDropdownOpen(!props.roleDropdownOpen)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    props.roleDropdownOpen
                      ? 'border-indigo-300 bg-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Impostazioni"
                  aria-label="Impostazioni"
                  aria-expanded={props.roleDropdownOpen}
                  data-settings-entry="canonical"
                >
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </button>

                {props.roleDropdownOpen && (
                  <div className="absolute right-0 z-[180] mt-2 w-[min(18rem,calc(100vw-1.5rem))] divide-y divide-slate-700 rounded-xl border border-slate-700 bg-slate-800 py-1 text-left text-xs shadow-xl" data-settings-menu="canonical">
                    <div className="px-4 py-3 text-slate-400">
                      <p className="font-extrabold text-slate-100">Impostazioni e sessione</p>
                      <p className="mt-1 leading-relaxed">
                        {props.isWorkspaceLoggedIn
                          ? (props.workspaceUserEmail || 'Identità account non disponibile')
                          : 'Sessione locale. Nessun accesso istituzionale verificato da questa voce.'}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleAssistantToggle}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-slate-200 hover:bg-slate-700"
                        data-assistant-entry="bounded"
                      >
                        <span className="relative">
                          <Bot className="h-4 w-4" aria-hidden="true" />
                          <span className={`absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full ${assistantReady ? 'bg-emerald-300' : 'bg-slate-500'}`} aria-hidden="true" />
                        </span>
                        <span>{props.isCopilotChatOpen ? 'Chiudi Assistente Arena' : 'Apri Assistente Arena'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { props.setShowSaveModal(true); props.setRoleDropdownOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-slate-200 hover:bg-slate-700"
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        <span>Gestisci una copia della sessione</span>
                      </button>
                    </div>

                    <div className="py-1">
                      {props.isWorkspaceLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => { props.handleWorkspaceSync(); props.setRoleDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-slate-200 hover:bg-slate-700"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          <span>Sincronizza i file</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { props.setShowCloudAccountModal(true); props.setRoleDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-indigo-300 hover:bg-slate-700"
                        >
                          <DownloadCloud className="h-4 w-4" aria-hidden="true" />
                          <span>Collega un account</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setShowResetConfirm(true); props.setRoleDropdownOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-rose-300 hover:bg-slate-700"
                      >
                        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                        <span>Azzera i dati locali</span>
                      </button>

                      {props.isWorkspaceLoggedIn && (
                        <button
                          type="button"
                          onClick={() => { props.handleWorkspaceLogout(); props.setRoleDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-semibold text-slate-400 hover:bg-slate-700"
                        >
                          <ServerCog className="h-4 w-4" aria-hidden="true" />
                          <span>Disconnetti account</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400 bg-indigo-600 text-xs font-black text-white shadow-sm"
                title={props.isWorkspaceLoggedIn ? 'Account collegato' : 'Sessione locale'}
                aria-label={props.isWorkspaceLoggedIn ? 'Account collegato' : 'Sessione locale'}
                data-session-identity="status"
              >
                {props.isWorkspaceLoggedIn ? 'CL' : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <UiConfirmDialog
        open={showResetConfirm}
        title="Azzera i dati locali"
        message="Questa operazione cancellerà le decisioni locali, i testi personalizzati e le UDA salvate in questo browser. I file già scaricati sul dispositivo non verranno eliminati."
        confirmLabel="Azzera"
        variant="danger"
        onConfirm={() => { props.handleClearLocalStorageWithReset(); setShowResetConfirm(false); }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}