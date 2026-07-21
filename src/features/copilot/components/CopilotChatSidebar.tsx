import { Sparkles, X } from 'lucide-react';

interface CopilotChatSidebarProps {
  isCopilotChatOpen: boolean;
  setIsCopilotChatOpen: (v: boolean) => void;
  copilotChatHistory: Array<{ sender: 'user' | 'assistant'; text: string; isError?: boolean }>;
  isCopilotResponding: boolean;
  copilotChatInput: string;
  setCopilotChatInput: (v: string) => void;
  handleSendCopilotMessage: (customText?: string) => void;
  handleSelectCopilotChip: (text: string) => void;
  handleToggleVoiceTyping: () => void;
  isVoiceListening: boolean;
  handleSpeakController: (text: string, idx: number) => void;
  ttsActiveMsgIndex: number | null;
  ttsPlayingState: 'playing' | 'paused' | 'idle';
  activeTab: string;
  activeProgTab: string;
}

export function CopilotChatSidebar({
  isCopilotChatOpen,
  setIsCopilotChatOpen,
  copilotChatHistory,
  isCopilotResponding,
  copilotChatInput,
  setCopilotChatInput,
  handleSendCopilotMessage,
  handleSelectCopilotChip,
  handleToggleVoiceTyping,
  isVoiceListening,
  handleSpeakController,
  ttsActiveMsgIndex,
  ttsPlayingState,
  activeTab,
  activeProgTab,
}: CopilotChatSidebarProps) {
  if (!isCopilotChatOpen) return null;

  return (
    <div className="fixed top-20 bottom-4 right-4 left-4 md:left-auto md:w-80 z-[150] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden fade-in text-slate-700 text-left">
      <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-slate-800">
       <span className="font-black uppercase tracking-wider text-[9px] flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>Co-pilota d'Istituto</span>
       </span>
       <button onClick={() => setIsCopilotChatOpen(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
        <X className="w-4 h-4" />
       </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[10px] leading-relaxed font-semibold">
       {copilotChatHistory.map((msg, idx) => (
        <div key={idx} className={`flex flex-col space-y-0.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
          {msg.sender === 'user' ? 'Docente' : "Co-pilota IA d'Istituto"}
         </span>
         <div className="flex items-end space-x-1.5 max-w-[95%]">
          <div className={`p-2 rounded-xl border text-justify font-semibold leading-normal ${
            msg.sender === 'user'
              ? 'bg-slate-50 text-slate-800 border-slate-200 rounded-tr-none'
              : (msg.isError
                  ? 'bg-rose-50 border-rose-100 text-rose-800 rounded-tl-none font-bold'
                  : 'bg-indigo-50/40 text-slate-800 border-indigo-100/50 rounded-tl-none')
          }`}>
           {msg.text}
          </div>
          {msg.sender === 'assistant' && !msg.isError && (
           <button
             onClick={() => handleSpeakController(msg.text, idx)}
             className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition shrink-0 cursor-pointer shadow-sm border bg-white"
             title={ttsActiveMsgIndex === idx && ttsPlayingState === 'playing' ? "Metti in pausa la lettura" : "Ascolta la risposta"}
           >
             {ttsActiveMsgIndex === idx && ttsPlayingState === 'playing' ? (
               <svg className="w-3.5 h-3.5 text-indigo-600 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                 <line x1="10" y1="15" x2="10" y2="9" />
                 <line x1="14" y1="15" x2="14" y2="9" />
                 <rect x="3" y="3" width="18" height="18" rx="2" />
               </svg>
             ) : ttsActiveMsgIndex === idx && ttsPlayingState === 'paused' ? (
               <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                 <polygon points="5 3 19 12 5 21" />
               </svg>
             ) : (
               <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                 <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                 <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
               </svg>
             )}
           </button>
          )}
         </div>
        </div>
       ))}
       {isCopilotResponding && (
        <div className="flex flex-col space-y-0.5 items-start">
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Co-pilota IA d'Istituto</span>
         <div className="p-2.5 rounded-xl border bg-indigo-50/20 border-indigo-100/30 text-slate-500 rounded-tl-none italic animate-pulse">
          Elaborazione spunti d'aula in corso...
         </div>
        </div>
       )}
      </div>

      <div className="p-3 border-t bg-slate-50 shrink-0 space-y-1.5">
       <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Suggerimenti contestuali:</span>
       <div className="flex flex-wrap gap-1">
        {(() => {
          let chips: string[] = [];
          if (activeTab === 'dashboard') {
            chips = ["Sintetizza i volumi dell'indagine", "Quali sono le priorità del PdM?"];
          } else if (activeTab === 'curricolo' || activeTab === 'revisione') {
            chips = ["Spiega la diacronia verticale", "Quali scadenze ha il D.M. 221/2025?"];
          } else if (activeTab === 'progetta-annuale') {
            chips = ["Suggerisci un compito di realtà", "Proponi misure inclusive per DSA"];
          } else if (activeProgTab === 'classe' || activeProgTab === 'classe-home') {
            chips = ["Spiega la metodologia Jigsaw", "Consigli banchi a isole"];
          } else {
            chips = ["Informazioni sull'accessibilità", "Manuale d'uso"];
          }
          return chips.map((c, i) => (
            <button
              key={i}
              onClick={() => handleSelectCopilotChip(c)}
              disabled={isCopilotResponding}
              className="text-[9px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 border hover:border-indigo-200 px-2 py-1 rounded-lg transition text-slate-600 text-left cursor-pointer truncate max-w-full"
            >
              {c}
            </button>
          ));
        })()}
       </div>
      </div>

      <div className="p-3 border-t shrink-0 bg-white">
       <div className="flex space-x-1.5">
        <button
         onClick={handleToggleVoiceTyping}
         className={`p-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
           isVoiceListening
             ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse'
             : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
         }`}
         title="Dettatura vocale d'Istituto (Parla)"
        >
         <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
           <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
           <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
           <line x1="12" y1="19" x2="12" y2="22" />
         </svg>
        </button>
        <input
         type="text"
         value={copilotChatInput}
         onChange={(e) => setCopilotChatInput(e.target.value)}
         onKeyDown={(e) => { if (e.key === 'Enter') handleSendCopilotMessage(); }}
         disabled={isCopilotResponding}
         className="flex-1 border rounded-xl px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-[10px] text-slate-800"
         placeholder="Esprime un quesito metodologico..."
        />
        <button
         onClick={() => handleSendCopilotMessage()}
         disabled={isCopilotResponding || !copilotChatInput.trim()}
         className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition shadow-md"
        >
         Invia
        </button>
       </div>
      </div>
     </div>
  );
}

