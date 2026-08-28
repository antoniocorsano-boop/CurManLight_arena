import { DownloadCloud, Menu, RotateCcw, Save, ServerCog, ShieldAlert } from 'lucide-react';
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

/**
 * Canonical Arena Beta header.
 *
 * The first-level header is intentionally limited to orientation and session
 * continuity. Experimental AI controls and unavailable integrations do not
 * belong in the primary Beta shell: the certified journey is institutional
 * curriculum review, decision and handoff.
 */
export function AppHeader(props: AppHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 shrink-0 border-b border-slate-800 bg-slate-900 text-white shadow-md" data-beta-shell="canonical">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={props.toggleSidebar}
                aria-controls="sidebar"
                aria-label="Apri o chiudi la navigazione"
                title="Navigazione"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold tracking-tight">CurManLight</div>
                <div className="hidden text-[10px] font-semibold text-slate-400 sm:block">Curricolo d’istituto</div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => props.setShowSaveModal(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                title="Gestisci una copia della sessione"
                aria-label="Gestisci una copia della sessione"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => props.setRoleDropdownOpen(!props.roleDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-400 bg-indigo-600 text-xs font-black text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  title="Sessione e account"
                  aria-label="Sessione e account"
                  aria-expanded={props.roleDropdownOpen}
                >
                  {props.isWorkspaceLoggedIn ? 'CL' : 'U'}
                </button>

                {props.roleDropdownOpen && (
                  <div className="absolute right-0 z-[180] mt-2 w-64 divide-y divide-slate-700 rounded-xl border border-slate-700 bg-slate-800 py-1 text-left text-xs shadow-xl">
                    <div className="px-4 py-3 text-slate-400">
                      <p className="font-extrabold text-slate-100">
                        {props.isWorkspaceLoggedIn ? 'Account collegato' : 'Sessione locale'}
                      </p>
                      <p className="mt-1 leading-relaxed">
                        {props.isWorkspaceLoggedIn
                          ? (props.workspaceUserEmail || 'Identità account non disponibile')
                          : 'Nessun accesso istituzionale verificato da questa voce.'}
                      </p>
                    </div>

                    <div className="py-1">
                      {props.isWorkspaceLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => { props.handleWorkspaceSync(); props.setRoleDropdownOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-bold text-slate-200 hover:bg-slate-700"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Sincronizza i file</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { props.setShowCloudAccountModal(true); props.setRoleDropdownOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-bold text-indigo-300 hover:bg-slate-700"
                        >
                          <DownloadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Collega un account</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setShowResetConfirm(true); props.setRoleDropdownOpen(false); }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-bold text-rose-300 hover:bg-slate-700"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Azzera i dati locali</span>
                      </button>

                      {props.isWorkspaceLoggedIn && (
                        <button
                          type="button"
                          onClick={() => { props.handleWorkspaceLogout(); props.setRoleDropdownOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-semibold text-slate-400 hover:bg-slate-700"
                        >
                          <ServerCog className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Disconnetti account</span>
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
