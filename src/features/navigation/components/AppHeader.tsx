import { Bot, DownloadCloud, Layers3, RotateCcw, Save, ServerCog, Settings, ShieldAlert, UserCog, X } from 'lucide-react';
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
  openLocalProfileEditor: () => void;
  setShowCloudAccountModal: (value: boolean) => void;
}

/** Canonical Arena Beta header. */
export function AppHeader(props: AppHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const assistantReady = props.localAgentStatus === 'ready'
    || (props.localAgentType === 'ollama' && props.ollamaStatus === 'connected');

  const activeProfileLabel = !props.isWorkspaceLoggedIn
    ? 'Sessione locale'
    : props.cloudAccountType === 'scolastica'
      ? 'Profilo istituzionale'
      : 'Profilo personale';

  useEffect(() => {
    const closeMobileNavigation = () => setMobileNavigationOpen(false);
    window.addEventListener('arena:mobile-navigation-closed', closeMobileNavigation);
    return () => window.removeEventListener('arena:mobile-navigation-closed', closeMobileNavigation);
  }, []);

  const handleNavigationToggle = () => {
    props.toggleSidebar();
    setProfileMenuOpen(false);
    props.setRoleDropdownOpen(false);
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
    setProfileMenuOpen(false);
  };

  const toggleSettings = () => {
    setProfileMenuOpen(false);
    props.setRoleDropdownOpen(!props.roleDropdownOpen);
  };

  const toggleProfile = () => {
    props.setRoleDropdownOpen(false);
    setProfileMenuOpen((open) => !open);
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
                  onClick={toggleSettings}
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
                  <div className="absolute right-0 z-[180] mt-2 w-[min(17rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 text-left text-xs shadow-2xl" data-settings-menu="canonical">
                    <div className="px-4 py-2.5">
                      <p className="font-extrabold text-slate-100">Strumenti e impostazioni</p>
                    </div>
                    <div className="border-t border-slate-700 py-1">
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
                        <span>Copia della sessione</span>
                      </button>
                    </div>
                    <div className="border-t border-slate-700 py-1">
                      <button
                        type="button"
                        onClick={() => { setShowResetConfirm(true); props.setRoleDropdownOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-rose-300 hover:bg-slate-700"
                      >
                        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                        <span>Azzera i dati locali</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={toggleProfile}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-2 text-xs font-black text-white shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    profileMenuOpen ? 'border-indigo-200 bg-indigo-500' : 'border-indigo-400 bg-indigo-600 hover:bg-indigo-500'
                  }`}
                  title={activeProfileLabel}
                  aria-label={`Profilo: ${activeProfileLabel}`}
                  aria-expanded={profileMenuOpen}
                  data-profile-entry="canonical"
                >
                  {props.isWorkspaceLoggedIn ? 'CL' : 'U'}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 z-[180] mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 text-left text-xs shadow-2xl" data-profile-menu="canonical">
                    <div className="px-4 py-3">
                      <p className="font-extrabold text-slate-100">Profilo e accesso</p>
                      <p className="mt-1 truncate text-slate-400">
                        {props.isWorkspaceLoggedIn
                          ? (props.workspaceUserEmail || 'Account collegato')
                          : 'Stai lavorando in locale su questo dispositivo.'}
                      </p>
                    </div>

                    <div className="grid gap-2 border-t border-slate-700 p-3">
                      <div className="rounded-xl border border-slate-700 bg-slate-900/45 px-3 py-2.5" data-profile-scope="personal">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-100">Personale</span>
                          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                            {props.isWorkspaceLoggedIn && props.cloudAccountType === 'personale' ? 'collegato' : 'locale'}
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed text-slate-400">Spazio e copie di lavoro personali.</p>
                      </div>

                      <div className="rounded-xl border border-slate-700 bg-slate-900/45 px-3 py-2.5" data-profile-scope="institutional">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-100">Scuola</span>
                          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                            {props.isWorkspaceLoggedIn && props.cloudAccountType === 'scolastica' ? 'collegata' : 'non collegata'}
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed text-slate-400" data-development-no-institution="explicit">
                          {props.isWorkspaceLoggedIn && props.cloudAccountType === 'scolastica'
                            ? 'Account scolastico collegato. Le decisioni restano disponibili solo a chi ha l’autorizzazione prevista.'
                            : 'Puoi continuare a lavorare senza collegare una scuola. Le decisioni istituzionali restano non disponibili.'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 py-1">
                      <button
                        type="button"
                        onClick={() => { props.openLocalProfileEditor(); setProfileMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-slate-200 hover:bg-slate-700"
                        data-local-profile-editor="avatar"
                      >
                        <UserCog className="h-4 w-4" aria-hidden="true" />
                        <span>Modifica profilo locale</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-700 py-1">
                      {props.isWorkspaceLoggedIn ? (
                        <>
                          <button
                            type="button"
                            onClick={() => { props.handleWorkspaceSync(); setProfileMenuOpen(false); }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-slate-200 hover:bg-slate-700"
                          >
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            <span>Sincronizza i file</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { props.handleWorkspaceLogout(); setProfileMenuOpen(false); }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-semibold text-slate-400 hover:bg-slate-700"
                          >
                            <ServerCog className="h-4 w-4" aria-hidden="true" />
                            <span>Disconnetti account</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { props.setShowCloudAccountModal(true); setProfileMenuOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-bold text-indigo-300 hover:bg-slate-700"
                        >
                          <DownloadCloud className="h-4 w-4" aria-hidden="true" />
                          <span>Collega un account (facoltativo)</span>
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
