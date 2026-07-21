interface GlobalAlertsProps {
  isDatabaseVolatile: boolean;
  isFileProtocol: boolean;
  isWorkspaceLoggedIn: boolean;
  workspaceTokenExpiry: number;
  cloudAccountType: 'scolastica' | 'personale';
  handleWorkspaceLogin: (type: 'scolastica' | 'personale') => void;
}

export function GlobalAlerts({
  isDatabaseVolatile,
  isFileProtocol,
  isWorkspaceLoggedIn,
  workspaceTokenExpiry,
  cloudAccountType,
  handleWorkspaceLogin,
}: GlobalAlertsProps) {
  return (
     <div className="px-6 pt-4 space-y-3 shrink-0">
      {isDatabaseVolatile && (
       <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-start space-x-3 text-xs leading-normal font-semibold text-rose-950 shadow-sm fade-in text-left">
        <span className="text-xl shrink-0"></span>
        <div className="space-y-1">
         <strong className="font-extrabold uppercase tracking-wide text-rose-900 block text-[10px]">Attenzione: Memoria Temporanea Volatile Attiva d'Istituto</strong>
         <p className="text-[11px] text-rose-800 font-medium leading-relaxed">
          Il browser ha inibito l'accesso al database permanente locale (IndexedDB / localStorage) a causa di restrizioni di sicurezza (es. modalità navigazione in incognito o Sandbox Iframe bloccato). 
          <strong>Qualsiasi programmazione, bozza o UDA inserita verrà persa alla chiusura di questa pagina.</strong> 
          Si raccomanda di utilizzare la <strong>Sincronizzazione Cloud Google Drive d'Istituto</strong> in "Gestione File" o di esportare regolarmente una <strong>Copia di Sicurezza d'Istituto</strong> (.json) sul computer.
         </p>
        </div>
       </div>
      )}

      {isFileProtocol && (
       <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl flex items-start space-x-3 text-xs leading-normal font-semibold text-amber-950 shadow-sm fade-in text-left">
        <span className="text-xl shrink-0"></span>
        <div className="space-y-1">
         <strong className="font-extrabold uppercase tracking-wide text-amber-900 block text-[10px]">Avviso Protocollo Locale USB (file://) Attivo</strong>
         <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
          L'applicazione è stata avviata localmente tramite un supporto di memorizzazione USB (chiavetta) o cartella fisica. I browser moderni (Chrome, Safari, Edge) bloccano l'accesso alle risorse in-cloud ed inibiscono la sincronizzazione automatica sotto questo protocollo. Per ovviare a questo limite e sincronizzare i tuoi verbali ed UDA in sicurezza, puoi:
         </p>
         <ul className="list-disc pl-4 space-y-1 text-[10px] text-amber-900 font-bold">
          <li>Accedere ed operare dal portale sicuro d'Istituto: <a href="http://curmanlight-donmilani.surge.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-950 font-black">http://curmanlight-donmilani.surge.sh</a></li>
          <li>Utilizzare regolarmente i pulsanti <strong>Esporta/Carica Copia di Sicurezza d'Istituto</strong> (.json) in "Gestione File" per salvare i tuoi dati sul computer d'aula.</li>
         </ul>
        </div>
       </div>
      )}

      {isWorkspaceLoggedIn && workspaceTokenExpiry > 0 && Date.now() > workspaceTokenExpiry - 300000 && (
       <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs leading-normal font-semibold text-amber-950 shadow-sm fade-in text-left">
        <span className="flex items-center space-x-2">
         <span className="text-xl"></span>
         <div>
          <strong className="font-extrabold uppercase tracking-wide text-amber-900 block text-[10px]">Sessione Cloud Google Workspace in Scadenza</strong>
          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">La tua connessione di sicurezza d'Istituto scadrà tra meno di 5 minuti. Fai clic su "Rinnova Sessione" per rinfrescare il token per un'altra ora d'aula.</p>
         </div>
        </span>
        <button 
         onClick={() => handleWorkspaceLogin(cloudAccountType)} 
         className="bg-amber-600 hover:bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition shadow-md"
        >
         Rinnova Sessione
        </button>
       </div>
      )}
     </div>

  );
}

