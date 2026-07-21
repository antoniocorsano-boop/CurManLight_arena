import React from 'react';
import { X, DownloadCloud } from 'lucide-react';

interface MicPermissionGuideModalProps {
  showMicPermissionGuide: boolean;
  setShowMicPermissionGuide: (v: boolean) => void;
}

export const MicPermissionGuideModal: React.FC<MicPermissionGuideModalProps> = ({
  showMicPermissionGuide,
  setShowMicPermissionGuide,
}) => {
  if (!showMicPermissionGuide) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4">
     <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col fade-in">
      <div className="bg-gradient-to-r from-rose-700 to-red-600 text-white px-5 py-4 flex justify-between items-center shrink-0">
       <span className="font-black uppercase tracking-wider text-[11px] flex items-center space-x-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        <span>Sblocca Microfono d'Aula</span>
       </span>
       <button onClick={() => setShowMicPermissionGuide(false)} className="text-slate-200 hover:text-white transition cursor-pointer">
        <X className="w-5 h-5" />
       </button>
      </div>

      <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-700 text-left">
       <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl space-y-1">
        <span className="text-[9px] font-black text-rose-700 uppercase block tracking-wider">Stato Rilevato d'Istituto:</span>
        <p className="font-bold text-slate-800 leading-normal">
         L'accesso al microfono è stato <span className="text-rose-700 uppercase">Bloccato o Negato</span> dalle impostazioni di sicurezza del browser o del dispositivo mobile d'aula.
        </p>
       </div>

       <div className="space-y-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Istruzioni operative per sbloccare il microfono:</span>

        <div className="space-y-1 bg-slate-50 border p-3 rounded-xl">
         <strong className="text-slate-800 text-[11px] block">Browser Google Chrome o Microsoft Edge (Desktop & Tablet)</strong>
         <p className="text-[10px] text-slate-500 leading-normal">
          1. Clicca sull'icona del <strong>Lucchetto</strong> o delle <strong>Impostazioni del sito</strong> situata a sinistra della barra degli indirizzi in alto (accanto all'URL).<br />
          2. Trova la voce <strong>Microfono</strong> e seleziona <strong>Consenti (Allow)</strong> dal menù a tendina.<br />
          3. Ricarica la pagina per rendere attiva la dettatura vocale d'Istituto.
         </p>
        </div>

        <div className="space-y-1 bg-slate-50 border p-3 rounded-xl">
         <strong className="text-slate-800 text-[11px] block">Browser Safari (iPad d'Aula, iPhone, Mac)</strong>
         <p className="text-[10px] text-slate-500 leading-normal">
          1. Se sei su iPad/iPhone d'aula, vai su <strong>Impostazioni del Dispositivo &gt; Safari &gt; Microfono</strong>.<br />
          2. Imposta l'autorizzazione su <strong>Chiedi</strong> o <strong>Consenti</strong>.<br />
          3. Su Mac, clicca su <strong>Safari &gt; Impostazioni per questo sito web...</strong> e imposta il microfono su consenti.
         </p>
        </div>
       </div>

       <div className="flex justify-end pt-3 border-t">
        <button
         onClick={() => setShowMicPermissionGuide(false)}
         className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition"
        >
         Ho capito, procedi
        </button>
       </div>
      </div>
     </div>
    </div>
  );
};

interface GemmaSuggestionModalProps {
  gemFieldActive: string | null;
  setGemFieldActive: (v: null) => void;
  gemSuggestedText: string;
  setGemSuggestedText: (v: string) => void;
  isGemGenerating: boolean;
  handleAcceptGemSuggestion: (text: string, editMode: boolean) => void;
}

export const GemmaSuggestionModal: React.FC<GemmaSuggestionModalProps> = ({
  gemFieldActive,
  setGemFieldActive,
  gemSuggestedText,
  setGemSuggestedText,
  isGemGenerating,
  handleAcceptGemSuggestion,
}) => {
  if (!gemFieldActive) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[190] flex items-center justify-center p-4">
     <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col fade-in">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white px-5 py-3.5 flex justify-between items-center shrink-0 border-b">
       <span className="font-black uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
        <svg className="w-4 h-4 text-white animate-pulse shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9z" />
          <path d="M11 3 8 9l10 13" />
          <path d="M13 3l3 6L6 22" />
          <path d="M2 9h20" />
        </svg>
        <span>Gemma Co-pilota d'Istituto</span>
       </span>
       <button onClick={() => { setGemFieldActive(null); setGemSuggestedText(""); }} className="text-slate-200 hover:text-white transition cursor-pointer">
        <X className="w-5 h-5" />
       </button>
      </div>

      <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-700 text-left">
       {isGemGenerating ? (
        <div className="text-center py-8 space-y-3.5">
         <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
         <p className="font-extrabold text-slate-500 animate-pulse text-[10px] uppercase tracking-wider">Elaborazione suggerimento locale...</p>
        </div>
       ) : (
        <div className="space-y-4">
         <div className="space-y-1">
          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider block">Suggerimento Coerente Generato:</span>
          <p className="bg-slate-50 border border-slate-150 p-3 rounded-xl italic font-semibold text-slate-800 leading-normal text-justify">
           "{gemSuggestedText}"
          </p>
         </div>

         <div className="flex flex-col gap-2 pt-2 border-t text-[9px] font-black uppercase tracking-wider">
          <button
           onClick={() => handleAcceptGemSuggestion(gemSuggestedText, false)}
           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
          >
           <span>Accetta ed Inserisci</span>
          </button>
          
          <button
           onClick={() => handleAcceptGemSuggestion(gemSuggestedText, true)}
           className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl border transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
           <span>Inserisci e Modifica</span>
          </button>
         </div>
        </div>
       )}
      </div>
     </div>
    </div>
  );
};

interface CloudAccountModalProps {
  showCloudAccountModal: boolean;
  setShowCloudAccountModal: (v: boolean) => void;
  workspaceUserEmail: string;
  setWorkspaceUserEmail: (v: string) => void;
  personalUserEmail: string;
  setPersonalUserEmail: (v: string) => void;
  safeLocalStorageSetItem: (key: string, value: string) => void;
  handleWorkspaceLogin: (type: string) => void;
  handleLocalDriveSync: () => void;
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  showCloudAccountModal,
  setShowCloudAccountModal,
  workspaceUserEmail,
  setWorkspaceUserEmail,
  personalUserEmail,
  setPersonalUserEmail,
  safeLocalStorageSetItem,
  handleWorkspaceLogin,
  handleLocalDriveSync,
}) => {
  if (!showCloudAccountModal) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4">
     <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] fade-in">
      <div className="bg-gradient-to-r from-indigo-700 to-primary-700 text-white px-5 py-4 flex justify-between items-center shrink-0 border-b">
       <span className="font-black uppercase tracking-wider text-[11px] flex items-center space-x-2">
        <DownloadCloud className="w-4 h-4 text-white shrink-0" />
        <span>Configurazione Copia di Sicurezza Cloud</span>
       </span>
       <button onClick={() => setShowCloudAccountModal(false)} className="text-slate-200 hover:text-white transition cursor-pointer">
        <X className="w-5 h-5" />
       </button>
      </div>

      <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-700 text-left overflow-y-auto flex-1">
       
       <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
        <span className="text-[9px] font-black text-indigo-600 uppercase block tracking-wider border-b pb-1">Anagrafica Utenze di Sicurezza:</span>
        
        <div className="space-y-1">
         <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Email Istituzionale Scolastica (@icdonmilani.edu.it):</label>
         <input
          type="email"
          value={workspaceUserEmail}
          onChange={(e) => {
            setWorkspaceUserEmail(e.target.value.trim());
            safeLocalStorageSetItem('curman_workspaceUserEmail', e.target.value.trim());
          }}
          className="w-full border rounded-xl px-2.5 py-1.5 font-bold bg-white text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          placeholder="Es. m.letizia@icdonmilani.edu.it"
         />
        </div>

        <div className="space-y-1">
         <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Email Personale d'Appoggio (@gmail.com):</label>
         <input
          type="email"
          value={personalUserEmail}
          onChange={(e) => {
            setPersonalUserEmail(e.target.value.trim());
            safeLocalStorageSetItem('curman_personalUserEmail', e.target.value.trim());
          }}
          className="w-full border rounded-xl px-2.5 py-1.5 font-bold bg-white text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          placeholder="Es. maria.letizia@gmail.com"
         />
        </div>
       </div>

       <p className="font-semibold text-slate-500 text-[10px] leading-relaxed">
        Scegli la modalità di connessione o allineamento della copia di sicurezza sul tuo Google Drive:
       </p>

       <div className="space-y-2.5">
        <button
         onClick={() => {
           setShowCloudAccountModal(false);
           handleWorkspaceLogin('scolastica');
         }}
         className="w-full text-left p-3 border hover:border-indigo-300 rounded-xl hover:bg-indigo-50/10 transition block bg-white shadow-sm cursor-pointer"
        >
         <strong className="text-slate-800 text-[10px] block flex items-center space-x-1.5">
           <span>Utenza Scolastica (Prioritaria via OAuth2)</span>
         </strong>
         <span className="text-[9.5px] text-slate-500 leading-normal block mt-1">
           Allineamento centrale cifrato d'Istituto su Drive scolastico associato all'email <strong>{workspaceUserEmail}</strong>.
         </span>
        </button>

        <button
         onClick={() => {
           setShowCloudAccountModal(false);
           handleWorkspaceLogin('personale');
         }}
         className="w-full text-left p-3 border hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition block bg-white shadow-sm cursor-pointer"
        >
         <strong className="text-slate-800 text-[10px] block flex items-center space-x-1.5">
           <span>Utenza Personale (Alternativa via OAuth2)</span>
         </strong>
         <span className="text-[9.5px] text-slate-500 leading-normal block mt-1">
           Copia di sicurezza sul tuo account Gmail personale associato all'email <strong>{personalUserEmail}</strong>.
         </span>
        </button>

        <button
         onClick={handleLocalDriveSync}
         className="w-full text-left p-3 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl hover:bg-emerald-50/10 transition block bg-white shadow-sm cursor-pointer"
        >
         <strong className="text-emerald-800 text-[10px] block flex items-center space-x-1.5">
           <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
           </svg>
           <span>Connettore Locale (Senza OAuth2 - Offline First)</span>
         </strong>
         <span className="text-[9.5px] text-emerald-950/75 leading-normal block mt-1">
           <strong>Consigliato per massima privacy:</strong> Dialoga direttamente con l'App locale di Google Drive del tuo PC fissa d'aula o del tablet (via Cartella Condivisa o Condivisione Nativa), bypassando l'autenticazione online OAuth2.
         </span>
        </button>
       </div>

       <div className="bg-slate-50 border p-3 rounded-xl text-[9.5px] text-slate-500 leading-normal">
        <strong>Allineamento di Fallback:</strong> Se non possiedi ancora le credenziali scolastiche d'area o se riscontri errori di rete, usa il connettore locale: l'applicazione eseguirà comunque il salvataggio tramite l'applicazione Google Drive nativa del tuo dispositivo.
       </div>
      </div>
     </div>
    </div>
  );
};
