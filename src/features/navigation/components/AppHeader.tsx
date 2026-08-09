import { Menu, RotateCcw, Save, ServerCog, ShieldAlert, Sparkles } from 'lucide-react';
import { useState } from 'react';
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
  setShowSaveModal,
  roleDropdownOpen,
  setRoleDropdownOpen,
  isWorkspaceLoggedIn,
  cloudAccountType,
  workspaceUserEmail,
  handleWorkspaceSync,
  handleClearLocalStorageWithReset,
  handleWorkspaceLogout,
  setShowCloudAccountModal,
}: AppHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50 shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button type="button" onClick={toggleSidebar} className="flex p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white" title="Apri o chiudi le aree di lavoro" aria-label="Apri o chiudi le aree di lavoro">
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <img src="images/curmanlight_v20_logo.png" alt="CurManLight" className="h-9 w-auto" />
              <span className="text-lg font-semibold tracking-tight text-slate-100">CurManLight</span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                type="button"
                onClick={() => setIsCopilotChatOpen(!isCopilotChatOpen)}
                className={`p-2 rounded-xl border transition focus:outline-none flex items-center space-x-1.5 ${isCopilotChatOpen ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                title="Apri l'assistente contestuale"
                aria-label="Apri Assistente"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <span className="hidden lg:inline font-semibold">Assistente</span>
              </button>

              <button type="button" onClick={() => setShowSaveModal(true)} className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl border border-slate-700 transition focus:outline-none" title="Salva i dati locali" aria-label="Salva i dati locali">
                <Save className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="relative">
                <button type="button" onClick={() => setRoleDropdownOpen(!roleDropdownOpen)} className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs border border-indigo-400 shrink-0 shadow-md focus:outline-none" title="Apri profilo e dati locali" aria-label="Apri profilo e dati locali">
                  {isWorkspaceLoggedIn ? 'CL' : 'U'}
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-[180] text-xs text-left divide-y divide-slate-700">
                    <div className="px-4 py-2.5 text-slate-400 font-medium">
                      <p className="font-semibold text-slate-100 truncate">{isWorkspaceLoggedIn ? `Account dichiarato ${cloudAccountType === 'scolastica' ? 'scolastico' : 'personale'} (non verificato)` : 'Sessione locale'}</p>
                      <p className="text-[9px] truncate mt-0.5">{isWorkspaceLoggedIn ? (workspaceUserEmail || 'Identità account non disponibile') : 'Nessun accesso privilegiato'}</p>
                    </div>
                    <div className="py-1">
                      <button type="button" onClick={() => { handleWorkspaceSync(); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200 flex items-center space-x-2 font-semibold">
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Sincronizza dati locali</span>
                      </button>
                    </div>
                    <div className="py-1">
                      <button type="button" onClick={() => { setShowResetConfirm(true); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-rose-400 flex items-center space-x-2 font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Azzera dati locali</span>
                      </button>
                      {isWorkspaceLoggedIn ? (
                        <button type="button" onClick={() => { handleWorkspaceLogout(); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-400 flex items-center space-x-2 font-semibold">
                          <ServerCog className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Disconnetti account</span>
                        </button>
                      ) : (
                        <button type="button" onClick={() => { setShowCloudAccountModal(true); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-indigo-400 flex items-center space-x-2 font-semibold">
                          <span>Collega un account</span>
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
      <UiConfirmDialog open={showResetConfirm} title="Azzera la memoria" message="Questa operazione cancellerà tutte le decisioni, i testi personalizzati e le UDA salvate. I file scaricati sul tuo dispositivo non verranno eliminati." confirmLabel="Azzera" variant="danger" onConfirm={() => { handleClearLocalStorageWithReset(); setShowResetConfirm(false); }} onCancel={() => setShowResetConfirm(false)} />
    </>
  );
}
