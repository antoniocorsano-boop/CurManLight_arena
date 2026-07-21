import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { isQuotaExceededError, dispatchStorageQuotaEvent } from '../../../lib/storage';

const CONSOLIDATED_STATE_KEY = 'curmanlight_stato_consolidato';

const safeLocalStorageSetItem = (key: string, value: string): void => {
  try {
    let state: Record<string, string | { value: string; ts: number }> = {};
    const consolidated = localStorage.getItem(CONSOLIDATED_STATE_KEY);
    if (consolidated) {
      try {
        state = JSON.parse(consolidated);
      } catch {
        state = {};
      }
    }
    state[key] = { value, ts: Date.now() };
    localStorage.setItem(CONSOLIDATED_STATE_KEY, JSON.stringify(state));
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage write blocked by browser security policy in sandboxed preview:", e);
    if (isQuotaExceededError(e)) dispatchStorageQuotaEvent();
  }
};

interface AgentSetupModalProps {
  showAgentSetupModal: boolean;
  setShowAgentSetupModal: (v: boolean) => void;
  detectedDeviceType: 'mobile' | 'desktop';
  localAgentType: 'webgpu' | 'ollama' | 'none';
  setLocalAgentType: (v: 'webgpu' | 'ollama' | 'none') => void;
  localAgentStatus: string;
  setLocalAgentStatus: (v: string) => void;
  localAgentSize: string;
  setLocalAgentSize: (v: string) => void;
  localAgentProgress: number;
  setLocalAgentProgress: (v: number) => void;
  activeHelpModel: string | null;
  setActiveHelpModel: (v: string | null) => void;
  ollamaServerUrl: string;
  setOllamaServerUrl: (v: string) => void;
  ollamaModelName: string;
  setOllamaModelName: (v: string) => void;
  ollamaStatus: string;
  setOllamaStatus: (v: string) => void;
  handleTestOllamaConnection: () => void;
  checkModelRamSafety: (model: string, name: string) => boolean;
  getModelRecommendation: (model: string) => boolean;
  agentIntervalRefs: React.MutableRefObject<number[]>;
  showToast: (msg: string, success?: boolean) => void;
}

export function AgentSetupModal({
  showAgentSetupModal,
  setShowAgentSetupModal,
  detectedDeviceType,
  localAgentType,
  setLocalAgentType,
  localAgentStatus,
  setLocalAgentStatus,
  localAgentSize: _localAgentSize,
  setLocalAgentSize,
  localAgentProgress,
  setLocalAgentProgress,
  activeHelpModel,
  setActiveHelpModel,
  ollamaServerUrl,
  setOllamaServerUrl,
  ollamaModelName,
  setOllamaModelName,
  ollamaStatus,
  setOllamaStatus: _setOllamaStatus,
  handleTestOllamaConnection,
  checkModelRamSafety,
  getModelRecommendation,
  agentIntervalRefs,
  showToast,
}: AgentSetupModalProps) {
  if (!showAgentSetupModal && !activeHelpModel) return null;

  return (
    <>
    {showAgentSetupModal && (
     <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[170] flex items-center justify-center p-4">
      <div className="bg-white border max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] fade-in">
       <div className="bg-gradient-to-r from-indigo-700 to-primary-700 text-white px-5 py-4 flex justify-between items-center shrink-0">
        <span className="font-black uppercase tracking-wider text-[11px]">Configurazione Connettore LLM Locale d'Istituto</span>
        <button onClick={() => setShowAgentSetupModal(false)} className="text-slate-300 hover:text-white transition">
         <X className="w-5 h-5" />
        </button>
       </div>

       <div className="p-4 md:p-6 space-y-4 text-xs leading-relaxed text-slate-700 text-left overflow-y-auto flex-1">

        <div className="bg-slate-50 border p-3.5 rounded-xl space-y-1">
         <span className="text-[9px] font-black text-indigo-600 uppercase block tracking-wider">Rilevatore Hardware d'Istituto:</span>
         <p className="font-bold text-slate-800">
          Strumento Rilevato: <span className="uppercase text-indigo-700">{detectedDeviceType === 'mobile' ? 'Dispositivo Mobile (Tablet / Smartphone)' : 'Postazione Fissa (Desktop / PC / Mac)'}</span>
         </p>
         <p className="text-[10px] text-slate-500 font-medium">
          {detectedDeviceType === 'mobile'
            ? "Consigliato: Collegamento a Server d'Istituto (Ollama LAN) per non consumare banda e spazio sul dispositivo mobile d'aula."
            : "Consigliato: Browser WebGPU (Local) o Connessione Ollama locale su localhost."
          }
         </p>
        </div>

        <div className="flex space-x-1 bg-slate-100 p-1 border rounded-xl w-fit text-[9px] font-black uppercase shadow-sm">
         <button
          onClick={() => setLocalAgentType('webgpu')}
          className={`px-3 py-1.5 rounded-lg transition ${localAgentType === 'webgpu' ? 'bg-white text-indigo-950 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}
         >
          IA nel Browser (WebGPU)
         </button>
         <button
          onClick={() => setLocalAgentType('ollama')}
          className={`px-3 py-1.5 rounded-lg transition ${localAgentType === 'ollama' ? 'bg-white text-indigo-950 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}
         >
          Server d'Istituto / Personale (Ollama)
         </button>
         <button
          onClick={() => setLocalAgentType('none')}
          className={`px-3 py-1.5 rounded-lg transition ${localAgentType === 'none' ? 'bg-white text-indigo-950 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}
         >
          Nessuno (0 MB)
         </button>
        </div>

        {localAgentType === 'webgpu' && (
         <div className="space-y-3 fade-in">
          <p className="font-semibold text-slate-500 text-[11px]">
           L'assistente locale viene eseguito offline tramite WebGPU. Seleziona un modello gratuito d'Istituto:
          </p>

          {localAgentStatus === 'downloading' ? (
           <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl text-center space-y-2.5">
            <span className="text-[10px] font-black text-indigo-700 tracking-wider block uppercase">Inizializzazione Banca Dati WebGPU...</span>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
             <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${localAgentProgress}%` }}></div>
            </div>
            <span className="font-black text-[10px] text-indigo-900">{localAgentProgress}% completato</span>
           </div>
          ) : (
           <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
            {detectedDeviceType === 'mobile' ? (
             <>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10px] text-amber-950 font-bold leading-normal mb-2">
               ★ Rilevato dispositivo Mobile: Si consigliano modelli leggeri o API native.
              </div>

              <div className="w-full flex items-center justify-between p-2 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 20;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("Chrome Gemini Nano (Built-in) configurato con successo!");
                        setShowAgentSetupModal(false);
                      }
                    }, 80);
                     agentIntervalRefs.current.push(iv);
                  }}
                  className="flex items-center space-x-2 flex-1 text-left cursor-pointer"
                >
                  <svg className="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c-.3 0-.6.2-.7.5L9.5 8.3l-5.8 1.8c-.3.1-.5.4-.5.7s.2.6.5.7l5.8 1.8 1.8 5.8c.1.3.4.5.7.5s.6-.2.7-.5l1.8-5.8 5.8-1.8c.3-.1.5-.4.5-.7s-.2-.6-.5-.7l-5.8-1.8-1.8-5.8c-.1-.3-.4-.5-.7-.5z" />
                  </svg>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-slate-800 text-[10px] font-extrabold truncate">Ermes <span className="text-slate-400 font-medium text-[9px] ml-1">(Chrome Gemini Nano, 0 MB)</span></span>
                    {getModelRecommendation('gemini-nano') && (
                      <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveHelpModel('gemini-nano'); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full flex items-center justify-between p-2 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 10;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("Qwen-2.5-0.5B (Super Leggero) installato con successo!");
                        setShowAgentSetupModal(false);
                      }
                    }, 100);
                     agentIntervalRefs.current.push(iv);
                  }}
                  className="flex items-center space-x-2 flex-1 text-left cursor-pointer"
                >
                  <svg className="w-4 h-4 text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.5 19A5.5 5.5 0 0 0 18 8.02a1 1 0 0 0-.82-.7A7 7 0 0 0 3.5 11.5a1 1 0 0 0 .58.91 5.5 5.5 0 0 0 2.5 10" />
                    <path d="M6 19h11.5" />
                  </svg>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-slate-800 text-[10px] font-extrabold truncate">Socrate <span className="text-slate-400 font-medium text-[9px] ml-1">(Qwen-2.5-0.5B-Instruct, ~350 MB)</span></span>
                    {getModelRecommendation('qwen-0.5b') && (
                      <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveHelpModel('qwen-0.5b'); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full flex items-center justify-between p-2 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    if (!checkModelRamSafety('llama-1b', 'Platone')) return;
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 5;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("Llama-3.2-1B (Leggero) installato con successo!");
                        setShowAgentSetupModal(false);
                      }
                    }, 120);
                     agentIntervalRefs.current.push(iv);
                  }}
                  className="flex items-center space-x-2 flex-1 text-left cursor-pointer"
                >
                  <svg className="w-4 h-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 12c0-3.3 2.7-6 6-6s6 6 10 6 4-2.7 4-6" />
                    <path d="M20 12c0 3.3-2.7 6-6 6s-6-6-10-6-4 2.7-4 6" />
                  </svg>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-slate-800 text-[10px] font-extrabold truncate">Platone <span className="text-slate-400 font-medium text-[9px] ml-1">(Llama-3.2-1B-Instruct, ~1.2 GB)</span></span>
                    {getModelRecommendation('llama-1b') && (
                      <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveHelpModel('llama-1b'); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full flex items-center justify-between p-2 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    if (!checkModelRamSafety('deepseek-1.5b', 'Aristotele')) return;
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 15;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("DeepSeek-R1-Distill-Qwen-1.5B (Ragionamento) installato!");
                        setShowAgentSetupModal(false);
                      }
                    }, 90);
                     agentIntervalRefs.current.push(iv);
                  }}
                  className="flex items-center space-x-2 flex-1 text-left cursor-pointer"
                >
                  <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                    <path d="M12 2v20" />
                    <path d="M12 12l10-6.5" />
                    <path d="M12 12L2 5.5" />
                  </svg>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-slate-800 text-[10px] font-extrabold truncate">Aristotele <span className="text-slate-400 font-medium text-[9px] ml-1">(DeepSeek-R1-Distill-Qwen-1.5B, ~900 MB)</span></span>
                    {getModelRecommendation('deepseek-1.5b') && (
                      <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveHelpModel('deepseek-1.5b'); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full flex items-center justify-between p-2 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    if (!checkModelRamSafety('gemma-2b', 'Minerva')) return;
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 8;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("Gemma-2-2B-Instruct (Google) installato con successo!");
                        setShowAgentSetupModal(false);
                      }
                    }, 110);
                     agentIntervalRefs.current.push(iv);
                  }}
                  className="flex items-center space-x-2 flex-1 text-left cursor-pointer"
                >
                  <svg className="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c-.3 0-.6.2-.7.5L9.5 8.3l-5.8 1.8c-.3.1-.5.4-.5.7s.2.6.5.7l5.8 1.8 1.8 5.8c.1.3.4.5.7.5s.6-.2.7-.5l1.8-5.8 5.8-1.8c.3-.1.5-.4.5-.7s-.2-.6-.5-.7l-5.8-1.8-1.8-5.8c-.1-.3-.4-.5-.7-.5z" />
                  </svg>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-slate-800 text-[10px] font-extrabold truncate">Minerva <span className="text-slate-400 font-medium text-[9px] ml-1">(Gemma-2-2B-Instruct, ~1.6 GB)</span></span>
                    {getModelRecommendation('gemma-2b') && (
                      <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveHelpModel('gemma-2b'); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
             </>
            ) : (
             <>
              <div className="w-full flex items-center justify-between p-2.5 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 10;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("Llama-3.2-1B-Instruct (Leggero) installato con successo!");
                        setShowAgentSetupModal(false);
                      }
                     }, 120);
                     agentIntervalRefs.current.push(iv);
                   }}
                   className="flex items-center space-x-2.5 flex-1 text-left cursor-pointer"
                 >
                   <svg className="w-4 h-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                     <path d="M4 12c0-3.3 2.7-6 6-6s6 6 10 6 4-2.7 4-6" />
                     <path d="M20 12c0 3.3-2.7 6-6 6s-6-6-10-6-4 2.7-4 6" />
                   </svg>
                   <span className="text-slate-800 text-[10px] font-extrabold truncate">Llama-3.2-1B-Instruct (~1.2 GB)</span>
                 </div>
                 <button
                   onClick={(e) => { e.stopPropagation(); setActiveHelpModel('llama-1b'); }}
                   className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                 >
                   <HelpCircle className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="w-full flex items-center justify-between p-2.5 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    if (!checkModelRamSafety('deepseek-1.5b', 'Aristotele')) return;
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 15;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("DeepSeek-R1-Distill-Qwen-1.5B (Ragionamento) installato!");
                        setShowAgentSetupModal(false);
                      }
                     }, 90);
                     agentIntervalRefs.current.push(iv);
                   }}
                   className="flex items-center space-x-2.5 flex-1 text-left cursor-pointer"
                 >
                   <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                     <path d="M12 2v20" />
                     <path d="M12 12l10-6.5" />
                     <path d="M12 12L2 5.5" />
                   </svg>
                   <span className="text-slate-800 text-[10px] font-extrabold truncate">DeepSeek-R1-Distill-Qwen-1.5B (~900 MB)</span>
                 </div>
                 <button
                   onClick={(e) => { e.stopPropagation(); setActiveHelpModel('deepseek-1.5b'); }}
                   className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                 >
                   <HelpCircle className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="w-full flex items-center justify-between p-2.5 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 12;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('light');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'light');
                        showToast("Qwen-2.5-1.5B-Instruct (Multilingue) installato!");
                        setShowAgentSetupModal(false);
                      }
                     }, 100);
                     agentIntervalRefs.current.push(iv);
                   }}
                   className="flex items-center space-x-2.5 flex-1 text-left cursor-pointer"
                 >
                   <svg className="w-4 h-4 text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M17.5 19A5.5 5.5 0 0 0 18 8.02a1 1 0 0 0-.82-.7A7 7 0 0 0 3.5 11.5a1 1 0 0 0 .58.91 5.5 5.5 0 0 0 2.5 10" />
                     <path d="M6 19h11.5" />
                   </svg>
                   <div className="flex flex-col text-left truncate flex-1">
                     <span className="text-slate-800 text-[10px] font-extrabold truncate">Cicerone <span className="text-slate-400 font-medium text-[9px] ml-1">(Qwen-2.5-1.5B-Instruct, ~1.1 GB)</span></span>
                     {getModelRecommendation('qwen-1.5b') && (
                       <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                     )}
                   </div>
                 </div>
                 <button
                   onClick={(e) => { e.stopPropagation(); setActiveHelpModel('qwen-1.5b'); }}
                   className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                 >
                   <HelpCircle className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="w-full flex items-center justify-between p-2.5 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 6;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('full');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'full');
                        showToast("Phi-3-Mini-Instruct (Microsoft Alta Logica) installato!");
                        setShowAgentSetupModal(false);
                      }
                     }, 120);
                     agentIntervalRefs.current.push(iv);
                   }}
                   className="flex items-center space-x-2.5 flex-1 text-left cursor-pointer"
                 >
                   <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                     <circle cx="12" cy="12" r="5" />
                     <line x1="12" y1="2" x2="12" y2="22" />
                   </svg>
                   <div className="flex flex-col text-left truncate flex-1">
                     <span className="text-slate-800 text-[10px] font-extrabold truncate">Ipazia <span className="text-slate-400 font-medium text-[9px] ml-1">(Phi-3-Mini-Instruct, ~2.2 GB)</span></span>
                     {getModelRecommendation('phi-3') && (
                       <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                     )}
                   </div>
                 </div>
                 <button
                   onClick={(e) => { e.stopPropagation(); setActiveHelpModel('phi-3'); }}
                   className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                 >
                   <HelpCircle className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="w-full flex items-center justify-between p-2.5 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm shrink-0">
                <div
                  onClick={() => {
                    if (!checkModelRamSafety('llama-1b', 'Platone')) return;
                    setLocalAgentStatus('downloading');
                    setLocalAgentProgress(0);
                    let prog = 0;
                    const iv = setInterval(() => {
                      prog += 5;
                      setLocalAgentProgress(prog);
                      if (prog >= 100) {
                        clearInterval(iv);
                        setLocalAgentStatus('installed');
                        setLocalAgentSize('full');
                        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
                        safeLocalStorageSetItem('curman_localAgentSize', 'full');
                        showToast("Llama-3.2-3B-Instruct (Completo, ~3.2 GB) installato!");
                        setShowAgentSetupModal(false);
                      }
                    }, 150);
                     agentIntervalRefs.current.push(iv);
                  }}
                  className="flex items-center space-x-2.5 flex-1 text-left cursor-pointer"
                >
                  <svg className="w-4 h-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 12c0-3.3 2.7-6 6-6s6 6 10 6 4-2.7 4-6" />
                    <path d="M20 12c0 3.3-2.7 6-6 6s-6-6-10-6-4 2.7-4 6" />
                  </svg>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-slate-800 text-[10px] font-extrabold truncate">Leonardo <span className="text-slate-400 font-medium text-[9px] ml-1">(Llama-3.2-3B-Instruct, ~3.2 GB)</span></span>
                    {getModelRecommendation('llama-3b') && (
                      <span className="text-emerald-700 text-[7px] font-black uppercase tracking-wider block mt-0.5">★ Consigliato per questo dispositivo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveHelpModel('llama-3b'); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
             </>
            )}
           </div>
          )}
         </div>
        )}
        {localAgentType === 'ollama' && (
         <div className="space-y-3.5 fade-in">
          <p className="font-semibold text-slate-500 text-[11px]">
           Connetti la piattaforma ad un'istanza locale o remota di Ollama/Llama.cpp in esecuzione nella LAN d'Istituto o sul tuo computer personale (localhost).
          </p>

          <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
           <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Indirizzo API del Server d'Istituto (con CORS abilitato):</label>
            <input
             type="text"
             value={ollamaServerUrl}
             onChange={(e) => setOllamaServerUrl(e.target.value.trim())}
             className="w-full border rounded-xl p-2 font-bold bg-white text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
             placeholder="Es. http://localhost:11434 o http://192.168.1.100:11434"
            />
           </div>

           <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Modello LLM Locale attivo:</label>
            <input
             type="text"
             value={ollamaModelName}
             onChange={(e) => setOllamaModelName(e.target.value.trim())}
             className="w-full border rounded-xl p-2 font-bold bg-white text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
             placeholder="Es. llama3.2 o phi3"
            />
           </div>

           <button
            onClick={handleTestOllamaConnection}
            disabled={ollamaStatus === 'testing'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10"
           >
            {ollamaStatus === 'testing' ? 'Verifica connessione in corso...' : 'Verifica Connessione Server'}
           </button>

           {ollamaStatus === 'connected' && (
            <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-center">
             Connessione stabilita con il Server Ollama! Il co-pilota IA d'Istituto utilizzerà il modello '{ollamaModelName}' in esecuzione sul server.
            </p>
           )}

           {ollamaStatus === 'error' && (
            <p className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-center leading-normal">
             Impossibile raggiungere il Server. Assicurati che Ollama/Llama.cpp sia attivo e che i permessi CORS siano abilitati (OLLAMA_ORIGINS="*" ollama serve).
            </p>
           )}
          </div>
         </div>
        )}

        {localAgentType === 'none' && (
         <div className="space-y-3.5 fade-in text-center p-5 border border-dashed rounded-xl bg-slate-50/50">
          <p className="font-semibold text-slate-500 text-[11px]">
           Nessun connettore locale o server attivo. L'applicazione utilizzerà unicamente la Banca Dati baseline ministeriale standard d'Istituto d'emergenza (funzionamento offline 0 MB).
          </p>
          <button
           onClick={() => {
             setLocalAgentStatus('not_installed');
             setLocalAgentSize('none');
             safeLocalStorageSetItem('curman_localAgentStatus', 'not_installed');
             safeLocalStorageSetItem('curman_localAgentSize', 'none');
             showToast("Configurazione completata. Assistente locale disattivato.");
             setShowAgentSetupModal(false);
           }}
           className="mx-auto bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-md"
          >
           Salva e Continua
          </button>
         </div>
        )}

       </div>
      </div>
     </div>
    )}
    {activeHelpModel && (() => {
      const modelInfo: Record<string, { title: string; spec: string; desc: string; icon: React.ReactNode }> = {
        'gemini-nano': {
          title: "Ermes (Chrome Gemini Nano)",
          spec: "API Integrata, Gratuito, 0 MB Download",
          desc: "Sfrutta l'IA integrata nativamente nel tuo telefono o tablet tramite 'window.ai'. Non richiede alcun download di file e non consuma spazio d'archiviazione sul dispositivo. L'elaborazione avviene offline sul coprocessore neurale integrato nel tuo hardware d'Istituto.",
          icon: (
            <svg className="w-8 h-8 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-.3 0-.6.2-.7.5L9.5 8.3l-5.8 1.8c-.3.1-.5.4-.5.7s.2.6.5.7l5.8 1.8 1.8 5.8c.1.3.4.5.7.5s.6-.2.7-.5l1.8-5.8 5.8-1.8c.3-.1.5-.4.5-.7s-.2-.6-.5-.7l-5.8-1.8-1.8-5.8c-.1-.3-.4-.5-.7-.5z" />
            </svg>
          )
        },
        'qwen-0.5b': {
          title: "Socrate (Qwen-2.5-0.5B-Instruct)",
          spec: "Modello Super Leggero, Gratuito, ~350 MB",
          desc: "Modello ultracompatto ed efficiente ottimizzato per carichi di lavoro d'aula su tablet o smartphone con poca memoria RAM (4-6 GB). Offre risposte di allineamento e de-gergonizzazione rapide con ingombro minimo.",
          icon: (
            <svg className="w-8 h-8 text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19A5.5 5.5 0 0 0 18 8.02a1 1 0 0 0-.82-.7A7 7 0 0 0 3.5 11.5a1 1 0 0 0 .58.91 5.5 5.5 0 0 0 2.5 10" />
              <path d="M6 19h11.5" />
            </svg>
          )
        },
        'deepseek-1.5b': {
          title: "Aristotele (DeepSeek-R1-Distill-Qwen-1.5B)",
          spec: "Modello di Ragionamento, Gratuito, ~900 MB",
          desc: "Modello avanzato ad alta capacità euristica. Esegue una catena di pensieri interna (Chain-of-Thought) esplicitando la deduzione logica prima di dare la risposta. Straordinario per de-gergonizzare concetti e redigere raccordi interdisciplinari d'aula.",
          icon: (
            <svg className="w-8 h-8 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <path d="M12 2v20" />
              <path d="M12 12l10-6.5" />
              <path d="M12 12L2 5.5" />
            </svg>
          )
        },
        'llama-1b': {
          title: "Platone (Llama-3.2-1B-Instruct)",
          spec: "Modello Leggero, Gratuito, ~1.2 GB",
          desc: "Sviluppato da Meta, questo modello offre un'eccellente comprensione sintattica e fluidità linguistica in italiano. Ottimo compromesso d'uso per tablet di ultima generazione (RAM >= 8 GB) e computer portatili d'Istituto.",
          icon: (
            <svg className="w-8 h-8 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 12c0-3.3 2.7-6 6-6s6 6 10 6 4-2.7 4-6" />
              <path d="M20 12c0 3.3-2.7 6-6 6s-6-6-10-6-4 2.7-4 6" />
            </svg>
          )
        },
        'gemma-2b': {
          title: "Minerva (Gemma-2-2B-Instruct)",
          spec: "Google Intermedio, Gratuito, ~1.6 GB",
          desc: "Modello Google ad alte prestazioni logico-semantiche. Presenta ottimi punteggi di accuratezza e una eccellente aderenza alle linee guida d'apprendimento nazionali. Richiede postazioni tablet o PC moderne.",
          icon: (
            <svg className="w-8 h-8 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-.3 0-.6.2-.7.5L9.5 8.3l-5.8 1.8c-.3.1-.5.4-.5.7s.2.6.5.7l5.8 1.8 1.8 5.8c.1.3.4.5.7.5s.6-.2.7-.5l1.8-5.8 5.8-1.8c.3-.1.5-.4.5-.7s-.2-.6-.5-.7l-5.8-1.8-1.8-5.8c-.1-.3-.4-.5-.7-.5z" />
            </svg>
          )
        },
        'qwen-1.5b': {
          title: "Cicerone (Qwen-2.5-1.5B-Instruct)",
          spec: "Multilingue Ottimizzato, Gratuito, ~1.1 GB",
          desc: "Versione del modello Qwen ideale per compiti di scrittura formale, mappatura delle competenze ed elaborazione didattica. Ottima comprensione della grammatica italiana e dei nessi disciplinari d'Istituto.",
          icon: (
            <svg className="w-8 h-8 text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19A5.5 5.5 0 0 0 18 8.02a1 1 0 0 0-.82-.7A7 7 0 0 0 3.5 11.5a1 1 0 0 0 .58.91 5.5 5.5 0 0 0 2.5 10" />
              <path d="M6 19h11.5" />
            </svg>
          )
        },
        'phi-3': {
          title: "Ipazia (Phi-3-Mini-Instruct)",
          spec: "Microsoft Alta Logica, Gratuito, ~2.2 GB",
          desc: "Modello Microsoft con eccezionale ragionamento offline e classificazione semantica delle materie scolastiche. Particolarmente efficace nell'interconnessione automatica del piano di studio curricolare.",
          icon: (
            <svg className="w-8 h-8 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
          )
        },
        'llama-3b': {
          title: "Leonardo (Llama-3.2-3B-Instruct)",
          spec: "Modello Completo, Gratuito, ~3.2 GB",
          desc: "Il modello a pesi completi consigliato per postazioni PC fisse d'Istituto. Brilla per flessibilità, precisione sintattica, pianificazione e simulazione dei percorsi degli Agenti Umani Virtuali offline.",
          icon: (
            <svg className="w-8 h-8 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 12c0-3.3 2.7-6 6-6s6 6 10 6 4-2.7 4-6" />
              <path d="M20 12c0 3.3-2.7 6-6 6s-6-6-10-6-4 2.7-4 6" />
            </svg>
          )
        }
      };

      const info = modelInfo[activeHelpModel];
      if (!info) return null;

      return (
        <div key="help-modal" role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-[180] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-xl overflow-hidden flex flex-col p-5 space-y-4 fade-in font-medium text-slate-700">
            <div className="flex items-center space-x-3 border-b pb-3 shrink-0">
              {info.icon}
              <div className="text-left">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{info.title}</h4>
                <span className="text-[10px] text-indigo-600 font-bold block">{info.spec}</span>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 text-left font-semibold">
              {info.desc}
            </p>
            <button
              onClick={() => setActiveHelpModel(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
            >
              Chiudi Dettagli
            </button>
          </div>
        </div>
      );
    })()}
    </>
  );
}
