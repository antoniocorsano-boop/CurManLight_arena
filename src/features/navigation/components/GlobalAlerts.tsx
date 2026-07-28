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
         <strong className="font-extrabold uppercase tracking-wide text-rose-900 block text-[10px]">Attenzione: memoria temporanea volatile</strong>
         <p className="text-[11px] text-rose-800 font-medium leading-relaxed">
          Il browser ha inibito l'accesso al database permanente locale (IndexedDB / localStorage) a causa di restrizioni di sicurezza (es. modalità navigazione in incognito o Sandbox Iframe bloccato). 
          <strong>Qualsiasi programmazione, bozza o UDA inserita verrà persa alla chiusura di questa pagina.</strong> 
           Esporta regolarmente una copia JSON sul dispositivo o prova il caricamento sul Google Drive dell'account selezionato. Destinazione e protezione non sono verificate dall'app.
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
           L'applicazione è stata avviata tramite un supporto USB o una cartella fisica. I browser possono bloccare risorse cloud e sincronizzazione; puoi tentare queste alternative:
         </p>
         <ul className="list-disc pl-4 space-y-1 text-[10px] text-amber-900 font-bold">
           <li>Aprire CurManLight dall'indirizzo web fornito dalla propria scuola.</li>
          <li>Utilizzare i pulsanti di esportazione e caricamento JSON in "Gestione File".</li>
         </ul>
        </div>
       </div>
      )}

      {isWorkspaceLoggedIn && workspaceTokenExpiry > 0 && Date.now() > workspaceTokenExpiry - 300000 && (
       <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs leading-normal font-semibold text-amber-950 shadow-sm fade-in text-left">
        <span className="flex items-center space-x-2">
         <span className="text-xl"></span>
         <div>
           <strong className="font-extrabold uppercase tracking-wide text-amber-900 block text-[10px]">Sessione Google in scadenza</strong>
           <p className="text-[11px] text-amber-800 font-medium leading-relaxed">La sessione Google scadrà tra meno di 5 minuti. Fai clic su "Rinnova Sessione" per richiedere un nuovo token.</p>
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

