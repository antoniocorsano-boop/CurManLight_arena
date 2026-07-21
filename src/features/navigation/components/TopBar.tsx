import { Menu, Sparkles, Save } from 'lucide-react';
import { useNavigationStore } from '../../../stores';

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleCopilot: () => void;
  onShowSave: () => void;
  onShowAgentSetup: () => void;
}

export function TopBar({ onToggleSidebar, onToggleCopilot, onShowSave, onShowAgentSetup }: TopBarProps) {
  const copilotChatOpen = useNavigationStore(s => s.copilotChatOpen);

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50 shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button onClick={onToggleSidebar} className="flex p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white" title="Espandi/Riduci Menu">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center shrink-0">
              <img src="images/curmanlight_v20_logo.png" alt="CurManLight" className="h-9 w-auto" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">CurManLight</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button 
              onClick={onToggleCopilot} 
              className={`p-2 rounded-xl border transition focus:outline-none flex items-center space-x-1.5 ${
                copilotChatOpen 
                  ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Apri Assistente Co-pilota"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline font-bold">Co-pilota Chat</span>
            </button>

            <div 
              onClick={onShowAgentSetup}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-wider uppercase transition cursor-pointer shadow-sm bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300"
              title="Stato del Connettore LLM Locale"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>IA: Baseline d'Aula</span>
            </div>

            <button 
              onClick={onShowSave} 
              className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl border border-slate-700 transition focus:outline-none flex items-center space-x-1"
              title="Salvataggio della sessione"
            >
              <Save className="w-4 h-4" />
              <span className="sr-only">Salvataggio</span>
            </button>

            <div className="relative">
              <button 
                className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs border border-indigo-400 shrink-0 shadow-md focus:outline-none"
                title="Menu Utente"
              >
                DS
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
