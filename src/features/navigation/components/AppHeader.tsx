import { Building, DownloadCloud, Layers, PanelLeftClose, RotateCcw, Save, ServerCog, ShieldAlert, Sparkles } from 'lucide-react';
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

export function AppHeader({
  toggleSidebar,
  isCopilotChatOpen,
  setIsCopilotChatOpen,
  setShowAgentSetupModal,
  localAgentStatus,
  localAgentType,
  ollamaStatus,
  ollamaModelName,
  localAgentSize,
  setShowSaveModal,
  roleDropdownOpen,
  setRoleDropdownOpen,
  isWorkspaceLoggedIn,
  cloudAccountType,
  workspaceUserEmail,
  handleWorkspaceSync,
  showToast,
  handleClearLocalStorageWithReset,
  handleWorkspaceLogout,
  setShowCloudAccountModal,
}: AppHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768,
  );

  useEffect(() => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const syncFromSidebar = () => {
      const mobile = window.innerWidth < 768;
      setNavigationOpen(
        mobile
          ? !sidebar.classList.contains('hidden')
          : sidebar.classList.contains('md:block'),
      );
    };

    syncFromSidebar();
    const observer = new MutationObserver(syncFromSidebar);
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', syncFromSidebar);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncFromSidebar);
    };
  }, []);

  const handleNavigationToggle = () => {
    toggleSidebar();
    requestAnimationFrame(() => {
      const sidebar = document.getElementById('sidebar');
      if (!sidebar) return;
      const mobile = window.innerWidth < 768;
      setNavigationOpen(
        mobile
          ? !sidebar.classList.contains('hidden')
          : sidebar.classList.contains('md:block'),
      );
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 shrink-0 border-b border-slate-800 bg-slate-900 text-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 min-w-0 items-center justify-between">
            <div className="flex min-w-0 items-center space-x-3">
              <button
                type="button"
                onClick={handleNavigationToggle}
                aria-controls="sidebar"
                aria-expanded={navigationOpen}
                aria-label={navigationOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
                title={navigationOpen ? 'Chiudi menu' : 'Apri menu'}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                  navigationOpen
                    ? 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'border-slate-700 bg-slate-800 text-indigo-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {navigationOpen ? (
                  <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Layers className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex min-w-0 items-center space-x-2">
                  <span className="truncate bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                    CurManLight
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center space-x-2 text-xs sm:space-x-3">
              <button
                onClick={() => setIsCopilotChatOpen(!isCopilotChatOpen)}
                className={`flex items-center space-x-1.5 rounded-xl border p-2 transition focus:outline-none ${
                  isCopilotChatOpen
                    ? 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Apri assistente contestuale locale"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="hidden font-bold lg:inline">Co-pilota Chat</span>
              </button>

              <div
                onClick={() => setShowAgentSetupModal(true)}
                className={`hidden cursor-pointer items-center space-x-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider shadow-sm transition sm:flex ${
                  localAgentStatus === 'installed'
                    ? (localAgentType === 'ollama' && ollamaStatus === 'connected'
                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'border-indigo-500/30 bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25')
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                }`}
                title="Stato del connettore LLM locale (clicca per configurare)"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  localAgentStatus === 'installed'
                    ? (localAgentType === 'ollama' && ollamaStatus !== 'connected' ? 'animate-pulse bg-amber-400' : 'animate-pulse bg-emerald-400')
                    : 'bg-slate-500'
                }`} />
                <span>
                  {localAgentStatus === 'installed'
                    ? (localAgentType === 'ollama'
                        ? `Ollama: ${ollamaModelName}`
                        : `WebGPU: ${localAgentSize === 'full' ? 'Completo' : 'Leggero'}`)
                    : 'IA: Baseline d\'Aula'}
                </span>
              </div>

              <div className="sr-only">
                <span>Supervisione</span>
                <span>Progettazione Attiva</span>
              </div>

              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center space-x-1 rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white focus:outline-none"
                title="Salvataggio della sessione locale"
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">Salvataggio</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-400 bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-black text-white shadow-md focus:outline-none"
                  title="Menu della sessione locale"
                >
                  {isWorkspaceLoggedIn ? 'CL' : 'U'}
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 z-[180] mt-2 w-56 divide-y divide-slate-700 rounded-xl border border-slate-700 bg-slate-800 py-1 text-left text-xs shadow-xl">
                    <div className="px-4 py-2.5 font-medium text-slate-400">
                      <p className="truncate font-extrabold text-slate-100">
                        {isWorkspaceLoggedIn ? `Account dichiarato ${cloudAccountType === 'scolastica' ? 'scolastico' : 'personale'} (non verificato)` : 'Sessione locale'}
                      </p>
                      <p className="mt-0.5 truncate text-[9px]">
                        {isWorkspaceLoggedIn ? (workspaceUserEmail || 'Identità account non disponibile') : 'Nessun accesso privilegiato'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { handleWorkspaceSync(); setRoleDropdownOpen(false); }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left font-bold text-slate-200 hover:bg-slate-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Sincronizza Drive</span>
                      </button>
                      <button
                        onClick={() => { showToast('Pubblicazione SCORM non disponibile: integrazione Classroom non configurata.', false); setRoleDropdownOpen(false); }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left font-bold text-slate-200 hover:bg-slate-700"
                      >
                        <Building className="h-3.5 w-3.5" />
                        <span>Pubblicazione SCORM non disponibile</span>
                      </button>
                      <button
                        onClick={() => { showToast('Importazione studenti non disponibile: integrazione Classroom non configurata.', false); setRoleDropdownOpen(false); }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left font-bold text-slate-200 hover:bg-slate-700"
                      >
                        <DownloadCloud className="h-3.5 w-3.5" />
                        <span>Importazione studenti non disponibile</span>
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setShowResetConfirm(true); setRoleDropdownOpen(false); }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left font-bold text-rose-400 hover:bg-slate-700"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Azzera dati locali</span>
                      </button>
                      {isWorkspaceLoggedIn ? (
                        <button
                          onClick={() => { handleWorkspaceLogout(); setRoleDropdownOpen(false); }}
                          className="flex w-full items-center space-x-2 px-4 py-2 text-left font-semibold text-slate-400 hover:bg-slate-700"
                        >
                          <ServerCog className="h-3.5 w-3.5" />
                          <span>Disconnetti Account</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { setShowCloudAccountModal(true); setRoleDropdownOpen(false); }}
                          className="flex w-full items-center space-x-2 px-4 py-2 text-left font-bold text-indigo-400 hover:bg-slate-700"
                        >
                          <DownloadCloud className="h-3.5 w-3.5" />
                          <span>Connetti Cloud</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <UiConfirmDialog
        open={showResetConfirm}
        title="Azzera la memoria"
        message="Questa operazione cancellerà tutte le decisioni, i testi personalizzati e le UDA salvate. I file scaricati sul tuo dispositivo non verranno eliminati."
        confirmLabel="Azzera"
        variant="danger"
        onConfirm={() => { handleClearLocalStorageWithReset(); setShowResetConfirm(false); }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}
