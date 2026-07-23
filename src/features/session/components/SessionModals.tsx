import { X, Award, Sliders, Save, DownloadCloud, RotateCcw, Smartphone, UserCog, Check, ChevronLeft, ChevronRight, FileText, Printer, Copy } from 'lucide-react';
import { useState } from 'react';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import type { CurriculumMap } from '../types/appViewContracts';

interface MottoModalProps {
  showMottoModal: boolean;
  setShowMottoModal: (v: boolean) => void;
}

export function MottoModal({ showMottoModal, setShowMottoModal }: MottoModalProps) {
  if (!showMottoModal) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
     <div className="bg-white border max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4 fade-in">
      <div className="flex justify-between items-start">
       <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2"><Award className="text-amber-500 w-5 h-5" /> <span>Motto e Metodo Operativo</span></h3>
       <button onClick={() => setShowMottoModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed text-left font-medium">
       <p className="font-extrabold italic text-slate-800 text-center text-sm border-y py-2 bg-slate-50">"Non multa, sed multum"</p>
       <p>Questo antico precetto latino guida l'intera stesura del nostro Curricolo Verticale. Significa letteralmente <strong>"non molte cose, ma molto in profondità"</strong>.</p>
       <p>Applicato alla scuola reale, indica che per ciascuna disciplina non dobbiamo rincorrere una frammentazione enciclopedica di nozioni, ma focalizzare i nostri sforzi didattici su pochi nuclei tematici indagati in modo continuo ed interdisciplinare.</p>
      </div>
      <div className="flex justify-end pt-2 border-t">
       <button onClick={() => setShowMottoModal(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition">Ho capito</button>
      </div>
     </div>
    </div>
  );
}

interface OnboardingModalProps {
  showOnboardingModal: boolean;
  setShowOnboardingModal: (v: boolean) => void;
  onboardingRole: UserRole;
  setOnboardingRoleLocal: (v: UserRole) => void;
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  onboardingOrd: SchoolOrder;
  handleSetOnboardingOrdLocal: (ord: SchoolOrder) => void;
  onboardingIsSostegno: boolean;
  setOnboardingIsSostegno: (v: boolean) => void;
  onboardingDisc: string;
  setOnboardingDiscLocal: (v: string) => void;
  localCurriculum: CurriculumMap;
  onboardingCombinations: string[];
  setOnboardingCombinations: (v: string[]) => void;
  handleToggleOnboardingCombination: (combo: string) => void;
  availableSections: string[];
  setAvailableSections: (v: string[]) => void;
  newSectionInput: string;
  setNewSectionInput: (v: string) => void;
  handleAddSectionLocal: () => void;
  safeLocalStorageSetItem: (key: string, value: string) => void;
  showToast: (msg: string, success?: boolean) => void;
  saveOnboardingProfile: () => void;
  getRoleLabel: (r: UserRole) => string;
  getDisciplineLabel: (disc: string, ord?: SchoolOrder) => string;
}

export function OnboardingModal({
  showOnboardingModal,
  setShowOnboardingModal,
  onboardingRole,
  setOnboardingRoleLocal,
  onboardingStep,
  setOnboardingStep,
  onboardingOrd,
  handleSetOnboardingOrdLocal,
  onboardingIsSostegno,
  setOnboardingIsSostegno,
  onboardingDisc,
  setOnboardingDiscLocal,
  localCurriculum,
  onboardingCombinations,
  setOnboardingCombinations,
  handleToggleOnboardingCombination,
  availableSections,
  setAvailableSections,
  newSectionInput,
  setNewSectionInput,
  handleAddSectionLocal,
  safeLocalStorageSetItem,
  showToast,
  saveOnboardingProfile,
  getRoleLabel,
  getDisciplineLabel,
}: OnboardingModalProps) {
  if (!showOnboardingModal) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
     <div className="bg-white border max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] h-auto fade-in font-medium">
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center shrink-0">
       <span className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs"><UserCog className="w-5 h-5" /> <span> Configurazione Profilo d'Istituto</span></span>
       <button onClick={() => setShowOnboardingModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="flex items-center space-x-1 px-6 py-3 bg-slate-50 border-b border-slate-150">
       {[1, 2, 3, 4].filter(num => {
        if (onboardingRole === 'dirigente' || onboardingRole === 'collegio' || onboardingRole === 'amministratore') {
         return num === 1;
        }
        if (onboardingOrd === 'infanzia' && num === 3) return false;
        if (onboardingIsSostegno && num === 3) return false;
        return true;
       }).map((num) => (
        <div key={num} className="flex-1 flex flex-col space-y-1 text-left">
         <div className={`h-1 rounded-full transition-all duration-300 ${
          num <= onboardingStep ? 'bg-indigo-600' : 'bg-slate-200'
         }`} />
         <span className={`text-[8px] font-black uppercase tracking-wider ${
          num === onboardingStep ? 'text-indigo-600 font-extrabold' : 'text-slate-400'
         } hidden sm:inline`}>
          {num === 1 && "1. Ruolo"}
          {num === 2 && "2. Ordine"}
          {num === 3 && "3. Materia"}
          {num === 4 && "4. Mie Classi"}
         </span>
        </div>
       ))}
      </div>

      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4 text-xs text-slate-700 text-left">
       <div className="text-center space-y-1 pb-1">
        <h4 className="text-sm font-extrabold text-slate-800">
         {onboardingStep === 1 && "Passo 1: Il tuo Ruolo d'Istituto"}
         {onboardingStep === 2 && "Passo 2: Il tuo Grado Scolastico"}
         {onboardingStep === 3 && "Passo 3: La tua Disciplina di Competenza"}
         {onboardingStep === 4 && "Passo 4: Classi & Sezioni di tua pertinenza"}
        </h4>
        <p className="text-[10px] text-slate-500 font-medium">
         {onboardingStep === 1 && "Scegli il tuo livello di governance scolastica."}
         {onboardingStep === 2 && "Scegli l'ordine di scuola per attivare la coerenza programmatoria."}
         {onboardingStep === 3 && "Imposta la materia scolastica coerente con il grado scelto."}
         {onboardingStep === 4 && "Seleziona le singole classi e sezioni (puoi anche aggiungere sezioni personalizzate)."}
        </p>
       </div>
       
       {onboardingStep === 1 && (
        <div className="space-y-1.5 border border-slate-200 p-3 bg-slate-50 rounded-xl fade-in">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Seleziona il tuo ruolo nella scuola</label>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto p-1 bg-white rounded border border-slate-200">
          {(['insegnante', 'dipartimento', 'referente', 'dirigente', 'collegio', 'amministratore'] as UserRole[]).map(r => (
           <button key={r} onClick={() => setOnboardingRoleLocal(r)} className={`p-2 rounded-lg text-left font-bold text-[10px] transition ${onboardingRole === r ? 'bg-primary-600 text-white font-extrabold shadow-sm' : 'bg-slate-50 hover:bg-slate-100'}`}>
            {getRoleLabel(r)}
           </button>
          ))}
         </div>
         {onboardingRole === 'insegnante' && (
          <div className="pt-2 border-t mt-2 space-y-1.5 text-xs font-bold text-slate-700">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tipologia di Cattedra d'Istituto</label>
           <div className="grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => setOnboardingIsSostegno(false)} className={`p-2 rounded-lg text-center font-bold text-[10px] transition border ${!onboardingIsSostegno ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}>
              Posto Comune / Disciplinare
            </button>
            <button type="button" onClick={() => setOnboardingIsSostegno(true)} className={`p-2 rounded-lg text-center font-bold text-[10px] transition border ${onboardingIsSostegno ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}>
              Sostegno (Inclusione PEI)
            </button>
           </div>
          </div>
         )}
        </div>
       )}

       {onboardingStep === 2 && (
        <div className="space-y-2 border border-slate-200 p-4 bg-slate-50 rounded-2xl font-bold fade-in">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ordine di Riferimento</label>
         <div className="grid grid-cols-3 gap-2">
          {(['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).map(o => (
           <button key={o} onClick={() => handleSetOnboardingOrdLocal(o)} className={`p-3 rounded-xl text-center font-bold text-xs transition ${onboardingOrd === o ? 'bg-primary-600 text-white font-extrabold shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{o === 'infanzia' ? ' Infanzia' : o === 'primaria' ? ' Primaria' : ' Secondaria'}</button>
          ))}
         </div>
        </div>
       )}

       {onboardingStep === 3 && (
        <div className="space-y-2 border border-slate-200 p-4 bg-slate-50 rounded-2xl fade-in">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Materia d'insegnamento attiva</label>
         <select value={onboardingDisc} onChange={(e) => setOnboardingDiscLocal(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
          {Object.keys(localCurriculum).filter(disc => {
           if (onboardingOrd !== 'secondaria' && disc === 'latino') return false;
           return true;
          }).map(disc => (
           <option key={disc} value={disc}>{getDisciplineLabel(disc, onboardingOrd)}</option>
          ))}
         </select>
        </div>
       )}

       {onboardingStep === 4 && (
        <div className="fade-in space-y-3">
         
         <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-2xl space-y-2 text-xs">
          <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block"> Gestione Sezioni d'Istituto</label>
          <p className="text-[9px] text-slate-500 font-normal leading-normal">Se le sezioni della tua scuola superano la A, B o C (es. D, E, F o sezioni speciali dell'infanzia), inseriscile qui sotto per generare all'istante le combinazioni:</p>
          <div className="flex items-center space-x-2">
           <input 
            type="text" 
            value={newSectionInput} 
            onChange={(e) => setNewSectionInput(e.target.value.toUpperCase().trim())} 
            maxLength={10} 
            className="border border-slate-200 rounded-xl p-2 text-xs font-bold uppercase flex-1 outline-none focus:ring-1 focus:ring-indigo-500" 
            placeholder="Es. D, E, ROSSA..." 
           />
           <button 
            onClick={handleAddSectionLocal} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
           >
            Aggiungi
           </button>
          </div>

          <div className="space-y-1.5 pt-1 text-left">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sezioni Attive d'Istituto (Modificabili inline):</span>
           <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl shadow-inner">
            {availableSections.map((sec, idx) => (
             <div key={idx} className="flex items-center space-x-1 bg-slate-50 hover:bg-white border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm transition">
              <input 
               type="text" 
               value={sec} 
               onChange={(e) => {
                const newSec = e.target.value.toUpperCase().trim();
                if (newSec) {
                 const updated = [...availableSections];
                 updated[idx] = newSec;
                 setAvailableSections(updated);
                 safeLocalStorageSetItem('curman_availableSections', updated.join(','));
                }
               }}
               className="w-12 border-none bg-transparent outline-none p-0 text-indigo-900 font-extrabold text-center uppercase focus:ring-0"
               title="Fai clic per modificare il nome della sezione"
              />
              {availableSections.length > 1 && (
               <button 
                onClick={() => {
                 const updated = availableSections.filter((_, sIdx) => sIdx !== idx);
                 setAvailableSections(updated);
                 safeLocalStorageSetItem('curman_availableSections', updated.join(','));
                 
                 const filteredCombos = onboardingCombinations.filter(combo => {
                  const comboSec = combo.split('^')[1];
                  return comboSec !== sec;
                 });
                 setOnboardingCombinations(filteredCombos);
                 showToast(`Sezione '${sec}' rimossa con successo!`);
                }} 
                className="text-rose-600 hover:text-rose-800 font-black shrink-0 pl-1.5 border-l border-slate-200 transition"
                title="Elimina questa sezione d'Istituto"
               >
                
               </button>
              )}
             </div>
            ))}
           </div>
          </div>

          <div className="flex justify-end pt-1">
           <button 
            onClick={() => {
             const defaults = onboardingOrd === 'infanzia' ? ['Rossa', 'Verde', 'Blu'] : ['A', 'B', 'C'];
             setAvailableSections(defaults);
             safeLocalStorageSetItem('curman_availableSections', defaults.join(','));
             
             const filteredCombos = onboardingCombinations.filter(combo => {
              const comboSec = combo.split('^')[1];
              return comboSec ? defaults.includes(comboSec) : true;
             });
             setOnboardingCombinations(filteredCombos);
             showToast("Sezioni predefinite d'Istituto ripristinate!", true);
            }} 
            className="text-[9px] text-slate-500 hover:text-indigo-600 font-extrabold flex items-center space-x-1 bg-white border hover:border-slate-300 px-2 py-1 rounded-lg transition"
           >
            <span>Ripristina Predefinite d'Istituto</span>
           </button>
          </div>
         </div>

         {onboardingOrd === 'infanzia' ? (
          <div className="space-y-3">
           <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl text-[10px] leading-relaxed font-bold text-indigo-950">
            <span>Contitolarità d'Istituto attiva:</span>
            <p className="font-normal mt-1 leading-normal text-slate-700">Come docente contitolare della scuola dell'infanzia d'Istituto, non hai una singola disciplina associata. Opererai in modo trasversale su tutti i <strong>5 Campi di Esperienza</strong>. Inserisci, edita e personalizza qui sotto i nomi esatti delle tue sezioni di insegnamento (es. Sezione dei Delfini, Sezione Arcobaleno, Rossa):</p>
           </div>
           <div className="space-y-2 border border-slate-200 p-4 bg-slate-50 rounded-2xl font-bold">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Le Mie Sezioni Attive d'Infanzia (Modificabili liberamente):</label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto p-1">
             {onboardingCombinations.map((combo, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
               <span className="text-slate-400 font-bold shrink-0">#{index+1}</span>
               <input 
                type="text" 
                value={combo} 
                onChange={(e) => {
                 const list = [...onboardingCombinations];
                 list[index] = e.target.value;
                 setOnboardingCombinations(list);
                }} 
                className="border border-slate-200 rounded-lg p-1.5 text-xs font-bold flex-1 outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition" 
                placeholder="Es. Sezione dei Delfini..." 
               />
               {onboardingCombinations.length > 1 && (
                <button 
                 onClick={() => {
                  const list = [...onboardingCombinations];
                  list.splice(index, 1);
                  setOnboardingCombinations(list);
                 }} 
                 className="text-rose-600 hover:text-rose-800 font-bold text-[10px] px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                >
                 Rimuovi
                </button>
               )}
              </div>
             ))}
            </div>

            <button 
             onClick={() => {
              setOnboardingCombinations([...onboardingCombinations, `Sezione Nuova`]);
             }} 
             className="w-full mt-2 p-2 bg-white hover:bg-slate-100 border border-dashed border-slate-300 hover:border-slate-400 text-indigo-600 hover:text-indigo-800 rounded-xl font-bold text-[10px] transition text-center flex items-center justify-center space-x-1"
            >
             <span> Aggiungi un'altra Sezione d'Infanzia</span>
            </button>
           </div>
          </div>
         ) : (
          <div className="space-y-2 border border-slate-200 p-4 bg-slate-50 rounded-2xl font-bold">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Seleziona le combinazioni Classe-Sezione di tua pertinenza d'Istituto:</label>
           <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl shadow-inner">
            {(onboardingOrd === 'primaria' ? ['1', '2', '3', '4', '5'] : ['1', '2', '3']).flatMap(cl => 
             availableSections.map(sec => {
              const combo = `${cl}^${sec}`;
              return (
               <button key={combo} onClick={() => handleToggleOnboardingCombination(combo)} className={`p-2.5 rounded-xl text-center font-black text-[10px] transition border ${
                onboardingCombinations.includes(combo) 
                 ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                 : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'
               }`}>
                {cl}^{sec}
               </button>
              );
             })
            )}
           </div>

           {onboardingCombinations.length > 0 && (
            <div className="space-y-1.5 pt-2 text-left">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Classi Assegnate Attive (Rimovibili con 1 clic):</span>
             <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-xl max-h-[100px] overflow-y-auto">
              {onboardingCombinations.map((combo, idx) => (
               <div key={idx} className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-extrabold text-indigo-950 shadow-sm transition hover:bg-white">
                <span>{combo}</span>
                <button 
                 onClick={() => {
                  const updated = onboardingCombinations.filter((_, cIdx) => cIdx !== idx);
                  setOnboardingCombinations(updated);
                 }} 
                 className="text-rose-600 hover:text-rose-800 font-black shrink-0 pl-1.5 border-l border-slate-200 transition"
                 title="Rimuovi questa combinazione"
                >
                 
                </button>
               </div>
              ))}
             </div>
            </div>
           )}
          </div>
         )}
        </div>
       )}
       <div className="h-2 shrink-0" />
      </div>
      
      <div className="bg-slate-50 px-6 py-3.5 border-t flex justify-between shrink-0">
       <button 
        onClick={() => {
         if (onboardingStep === 4 && (onboardingOrd === 'infanzia' || onboardingIsSostegno)) {
          setOnboardingStep(2);
         } else {
          setOnboardingStep(prev => prev - 1);
         }
        }} 
        disabled={onboardingStep === 1}
        className={`px-4 py-2 border rounded-xl flex items-center space-x-1.5 font-bold text-xs transition ${
         onboardingStep === 1 ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
        }`}
       >
        <ChevronLeft className="w-4 h-4" />
        <span>Precedente</span>
       </button>
       
       {onboardingStep === 1 && (onboardingRole === 'dirigente' || onboardingRole === 'collegio' || onboardingRole === 'amministratore') ? (
        <button 
         onClick={() => { saveOnboardingProfile(); setOnboardingStep(1); }} 
         className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/10"
        >
         <Check className="w-4 h-4" /> 
         <span>Salva Profilo ed Entra</span>
        </button>
       ) : onboardingStep < 4 ? (
        <button 
         onClick={() => {
          if (onboardingStep === 2 && (onboardingOrd === 'infanzia' || onboardingIsSostegno)) {
           setOnboardingStep(4);
          } else {
           setOnboardingStep(prev => prev + 1);
          }
         }}
         className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md"
        >
         <span>Prossimo</span>
         <ChevronRight className="w-4 h-4" />
        </button>
       ) : (
        <button 
         onClick={() => { saveOnboardingProfile(); setOnboardingStep(1); }} 
         className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/10"
        >
         <Check className="w-4 h-4" /> 
         <span>Salva Profilo ed Entra</span>
        </button>
       )}
      </div>
     </div>
    </div>
  );
}

interface SaveSettingsModalProps {
  showSaveModal: boolean;
  setShowSaveModal: (v: boolean) => void;
  setShowOnboardingModal: (v: boolean) => void;
  setShowCloudAccountModal: (v: boolean) => void;
  setShowAgentSetupModal: (v: boolean) => void;
  saveProgDraft: () => void;
  handleDownloadBackup: () => void;
  handleRestoreBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearLocalStorageWithReset: () => void;
  isWorkspaceLoggedIn: boolean;
  workspaceClientId: string;
  setWorkspaceClientId: (v: string) => void;
  safeLocalStorageSetItem: (key: string, value: string) => void;
  showToast: (msg: string, success?: boolean) => void;
  isSyncingWorkspace: boolean;
  handleWorkspaceSync: () => void;
  handleWorkspaceLogout: () => void;
  handleWorkspaceLogin: () => void;
  workspaceUserEmail: string;
  handleRestoreFromLocalEmergencyStorage: () => void;
  setShowMottoModal: (v: boolean) => void;
  triggerPwaInstall: () => void;
}

export function SaveSettingsModal({
  showSaveModal,
  setShowSaveModal,
  setShowOnboardingModal,
  setShowCloudAccountModal,
  setShowAgentSetupModal,
  saveProgDraft,
  handleDownloadBackup,
  handleRestoreBackup,
  handleClearLocalStorageWithReset,
  isWorkspaceLoggedIn,
  workspaceClientId,
  setWorkspaceClientId,
  safeLocalStorageSetItem,
  showToast,
  isSyncingWorkspace,
  handleWorkspaceSync,
  handleWorkspaceLogout,
  handleWorkspaceLogin,
  workspaceUserEmail,
  handleRestoreFromLocalEmergencyStorage,
  setShowMottoModal,
  triggerPwaInstall,
}: SaveSettingsModalProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  if (!showSaveModal) return null;
  return (
    <>
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
     <div className="bg-white border max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] fade-in text-slate-700 text-left">
      <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-slate-800">
       <span className="font-black uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
        <Sliders className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span>Impostazioni d'Istituto</span>
       </span>
       <button 
         onClick={() => {
           setShowOnboardingModal(false);
           setShowCloudAccountModal(false);
           setShowAgentSetupModal(false);
           setShowSaveModal(false);
         }} 
         className="text-slate-400 hover:text-white transition cursor-pointer"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <div className="flex border-b bg-slate-50 shrink-0 overflow-x-auto text-[10px] font-black uppercase text-slate-500">
       <button onClick={() => { setShowOnboardingModal(true); setShowCloudAccountModal(false); setShowAgentSetupModal(false); setShowSaveModal(false); }} className="flex-1 py-3 px-2 border-b-2 text-center transition min-w-[80px] border-transparent hover:bg-slate-100 hover:text-slate-700">Profilo d'Istituto</button>
       <button onClick={() => { setShowOnboardingModal(false); setShowCloudAccountModal(true); setShowAgentSetupModal(false); setShowSaveModal(false); }} className="flex-1 py-3 px-2 border-b-2 text-center transition min-w-[80px] border-transparent hover:bg-slate-100 hover:text-slate-700">Copia & Cloud</button>
       <button onClick={() => { setShowOnboardingModal(false); setShowCloudAccountModal(false); setShowAgentSetupModal(true); setShowSaveModal(false); }} className="flex-1 py-3 px-2 border-b-2 text-center transition min-w-[80px] border-transparent hover:bg-slate-100 hover:text-slate-700">I Saggi IA</button>
       <button onClick={() => { setShowOnboardingModal(false); setShowCloudAccountModal(false); setShowAgentSetupModal(false); setShowSaveModal(true); }} className="flex-1 py-3 px-2 border-b-2 text-center transition min-w-[80px] border-indigo-600 text-indigo-700 bg-white font-extrabold">Memoria Sicura</button>
      </div>

      <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-700 text-left overflow-y-auto flex-1">
       <p className="text-[11px] text-slate-500 font-semibold">Tutti i dati, le decisioni, le bozze di programmazione e le UDA create sono memorizzati in modo automatico, sicuro e asincrono nella memoria locale protetta del tuo browser attuale (memoria protetta d'istituto).</p>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Salvataggio Locale</span>
         <div className="space-y-2">
          <button onClick={() => { saveProgDraft(); setShowSaveModal(false); }} className="w-full p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5 text-left font-bold shadow-sm transition">
           <Save className="w-4 h-4 text-primary-600" />
           <div className="space-y-0.5">
            <div className="text-[11px] text-slate-800">Salva Bozza Attiva</div>
            <div className="text-[9px] text-slate-400 font-medium">Sincronizza programmazione attuale</div>
           </div>
          </button>
          
          <button onClick={() => { handleDownloadBackup(); setShowSaveModal(false); }} className="w-full p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5 text-left font-bold shadow-sm transition">
           <DownloadCloud className="w-4 h-4 text-emerald-600" />
           <div className="space-y-0.5">
            <div className="text-[11px] text-slate-800">Esporta Copia di Sicurezza</div>
            <div className="text-[9px] text-slate-400 font-medium">Scarica file d'Istituto per salvataggio (.json)</div>
           </div>
          </button>
         </div>
        </div>

        <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Importazione e Ripristino</span>
         <div className="space-y-2">
          <label className="w-full p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5 text-left font-bold shadow-sm transition cursor-pointer">
           <DownloadCloud className="w-4 h-4 text-indigo-600" />
           <div className="space-y-0.5">
            <div className="text-[11px] text-slate-800">Carica Copia di Sicurezza</div>
            <div className="text-[9px] text-slate-400 font-medium">Carica file d'Istituto per ripristino (.json)</div>
           </div>
           <input type="file" onChange={(e) => { handleRestoreBackup(e); setShowSaveModal(false); }} className="hidden" accept=".json" />
          </label>

          <button onClick={() => { setShowResetConfirm(true); setShowSaveModal(false); }} className="w-full p-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg flex items-center space-x-2.5 text-left font-bold shadow-sm transition group">
           <RotateCcw className="w-4 h-4 text-rose-600 group-hover:animate-spin" />
           <div className="space-y-0.5">
            <div className="text-[11px] text-slate-800 group-hover:text-red-700">Azzera Memoria d'Istituto</div>
            <div className="text-[9px] text-slate-400 font-medium">Svuota i dati memorizzati d'Istituto</div>
           </div>
          </button>
         </div>
        </div>

       </div>

       <div className="p-4 border-2 border-indigo-100 bg-indigo-50/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
         <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block"> Sincronizzazione Cloud d'Istituto (v2.0)</span>
         {isWorkspaceLoggedIn && (
          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Sincronizzato</span>
         )}
        </div>
        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
         Raccordo automatico, sicuro e asincrono in background per salvare le tue programmazioni e le tue UDA direttamente sul tuo spazio protetto <strong>Google Drive / OneDrive d'Istituto</strong> (@icdonmilani.edu.it).
        </p>

        <div className="bg-white border rounded-xl p-3 space-y-1.5 text-left">
         <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">ID Client Google d'Istituto (Personalizzabile):</label>
         <div className="flex gap-2 items-center">
          <input 
           type="text" 
           value={workspaceClientId} 
           onChange={(e) => {
            setWorkspaceClientId(e.target.value.trim());
            safeLocalStorageSetItem('curman_workspaceClientId', e.target.value.trim());
           }} 
           className="border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[9px] flex-1 outline-none bg-slate-50 focus:bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500" 
           placeholder="Inserisci Client ID d'Istituto..." 
          />
          <button 
           onClick={() => {
            setWorkspaceClientId('312849003-milani.apps.googleusercontent.com');
            safeLocalStorageSetItem('curman_workspaceClientId', '312849003-milani.apps.googleusercontent.com');
            showToast("ID Client di default ripristinato.");
           }} 
           className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[8px] uppercase px-2.5 py-1.5 rounded transition"
          >
           Reset
          </button>
         </div>
        </div>

        {isWorkspaceLoggedIn ? (
         <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-indigo-100 rounded-xl">
          <div className="text-left flex-1 space-y-0.5">
           <p className="text-[10px] font-bold text-slate-700">Account Attivo:</p>
           <p className="text-[11px] font-black text-indigo-950 truncate">{workspaceUserEmail}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
           <button 
            onClick={handleWorkspaceSync} 
            disabled={isSyncingWorkspace}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/10"
           >
            {isSyncingWorkspace ? " Sincronizzazione..." : " Sincronizza Ora"}
           </button>
           <button 
            onClick={handleWorkspaceLogout} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] px-2 py-2 rounded-lg transition"
           >
            Scollega
           </button>
          </div>
         </div>
        ) : (
         <button 
          onClick={handleWorkspaceLogin} 
          disabled={isSyncingWorkspace}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 rounded-xl flex items-center justify-center space-x-2.5 font-black text-[10px] uppercase tracking-wider shadow-md shadow-indigo-600/15 transition"
         >
          <span> Accedi e Sincronizza con Google Workspace d'Istituto</span>
         </button>
        )}
       </div>

       <div className="p-4 border-2 border-rose-100 bg-rose-50/10 rounded-2xl space-y-2.5 text-left">
        <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider block"> Recupero e Ripristino d'Emergenza d'Istituto</span>
        <p className="text-[10px] text-slate-500 leading-relaxed">
         Se per qualsiasi motivo (pulizia aggressiva della cache del browser, navigazione privata o errori del database) le tue programmazioni d'Istituto dovessero apparire vuote, utilizza questo pannello di ripristino istantaneo:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
         <button 
          onClick={() => { handleRestoreFromLocalEmergencyStorage(); setShowSaveModal(false); }} 
          className="p-3 bg-white hover:bg-rose-50/30 border border-rose-200 hover:border-rose-300 rounded-xl flex items-center space-x-2.5 font-bold shadow-sm transition text-left"
         >
          <RotateCcw className="w-5 h-5 text-rose-600" />
          <div className="space-y-0.5">
           <div className="text-[11px] text-slate-800">Recupera da Cache Browser</div>
           <div className="text-[8px] text-slate-400 font-medium">Ripristina da Copia di Sicurezza locale</div>
          </div>
         </button>

         <label className="p-3 bg-white hover:bg-rose-50/30 border border-rose-200 hover:border-rose-300 rounded-xl flex items-center space-x-2.5 font-bold shadow-sm transition text-left cursor-pointer">
          <DownloadCloud className="w-5 h-5 text-indigo-600" />
          <div className="space-y-0.5">
           <div className="text-[11px] text-slate-800">Carica Copia di Sicurezza d'Emergenza</div>
           <div className="text-[8px] text-slate-400 font-medium">Seleziona e carica file .json</div>
          </div>
          <input type="file" onChange={(e) => { handleRestoreBackup(e); setShowSaveModal(false); }} className="hidden" accept=".json" />
         </label>
        </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => { setShowSaveModal(false); setShowOnboardingModal(true); }} className="p-3 border rounded-xl text-center space-y-1 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
         <UserCog className="w-5 h-5 text-slate-500 mx-auto" />
         <strong className="text-[10px] text-slate-800 block font-bold">Impostazioni</strong>
         <span className="text-[8px] text-slate-400 block font-semibold">Configura profilo</span>
        </button>
        <button onClick={() => { setShowSaveModal(false); setShowMottoModal(true); }} className="p-3 border rounded-xl text-center space-y-1 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
         <Award className="w-5 h-5 text-amber-500 mx-auto" />
         <strong className="text-[10px] text-slate-800 block font-bold">Motto e Metodo</strong>
         <span className="text-[8px] text-slate-400 block font-semibold">Non multa sed multum</span>
        </button>
        <button onClick={() => { triggerPwaInstall(); setShowSaveModal(false); }} className="p-3 border rounded-xl text-center space-y-1 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
         <Smartphone className="w-5 h-5 text-blue-500 mx-auto" />
         <strong className="text-[10px] text-slate-800 block font-bold"> Installa App</strong>
         <span className="text-[8px] text-slate-400 block font-semibold">Usa su Desktop/Mobile</span>
        </button>
       </div>

       <div className="h-6 shrink-0" />
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t flex justify-end shrink-0">
       <button onClick={() => setShowSaveModal(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition">Chiudi</button>
      </div>
     </div>
    </div>
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

interface TourModalProps {
  showTourModal: boolean;
  setShowTourModal: (v: boolean) => void;
  handleTabSwitch: (tab: string) => void;
}

export function TourModal({ showTourModal, setShowTourModal, handleTabSwitch }: TourModalProps) {
  if (!showTourModal) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
     <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-4 fade-in text-left font-medium">
      <div className="flex justify-between items-start">
       <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
        <Check className="text-emerald-600 bg-emerald-100 p-1 rounded-lg w-7 h-7" />
        <span>Test Guidato Attivato con Successo!</span>
       </h3>
       <button onClick={() => setShowTourModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
      </div>
      
      <p className="text-xs text-slate-600 leading-relaxed font-bold">I dati di test e allineamento simulati sono stati inseriti correttamente nella memoria locale. Ora puoi esplorare il funzionamento a pieno regime dell'applicazione!</p>
      
      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Elementi di Test Caricati:</span>
       <ul className="space-y-1.5 list-disc pl-4 font-semibold text-[11px]">
        <li><strong>Allineamento Completo</strong>: 46 decisioni di voto pre-compilate in "Revisione (Gap 2025)".</li>
        <li><strong>Unità di Apprendimento (UDA)</strong>: Un'UDA d'esempio intitolata <em>"Il corsivo come espressione"</em> caricata in archivio.</li>
        <li><strong>Filtri e Selezioni</strong>: Traguardi ed evidenze pre-selezionati per la disciplina Italiano.</li>
       </ul>
      </div>

      <div className="text-xs text-slate-500 font-medium">
       <strong className="text-slate-700 font-extrabold block mb-1">Cosa vuoi verificare adesso?</strong>
       <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={() => { handleTabSwitch('progetta-annuale'); setShowTourModal(false); }} className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-center font-bold text-[10px] transition"> Vedi UDA in Archivio</button>
        <button onClick={() => { handleTabSwitch('revisione'); setShowTourModal(false); }} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-center font-bold text-[10px] transition"> Controlla i Voti dei Gap</button>
       </div>
      </div>

      <div className="flex justify-end pt-2 border-t">
       <button onClick={() => setShowTourModal(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition">Ho capito, procedo</button>
      </div>
     </div>
    </div>
  );
}

interface DocumentViewModalProps {
  generatedDocTitle: string | null;
  setGeneratedDocTitle: (v: string | null) => void;
  generatedDocText: string | null;
  setGeneratedDocText: (v: string | null) => void;
  handlePrintDocumentPdf: (title: string | null, text: string | null) => void;
  copyText: (text: string) => void;
  showToast: (msg: string, success?: boolean) => void;
}

export function DocumentViewModal({
  generatedDocTitle,
  setGeneratedDocTitle,
  generatedDocText,
  setGeneratedDocText,
  handlePrintDocumentPdf,
  copyText,
  showToast,
}: DocumentViewModalProps) {
  if (!generatedDocTitle || !generatedDocText) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[170] flex items-center justify-center p-4">
     <div className="bg-white border max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] fade-in text-left font-medium">
      <div className="bg-gradient-to-r from-indigo-600 to-primary-700 text-white px-6 py-4 flex justify-between items-center shrink-0">
       <span className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs"><FileText className="w-5 h-5" /> <span>{generatedDocTitle}</span></span>
       <button onClick={() => { setGeneratedDocTitle(null); setGeneratedDocText(null); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center shadow-inner">
       <div className="bg-white border w-full max-w-2xl p-8 sm:p-12 rounded-xl shadow-lg text-slate-800 text-xs leading-relaxed text-left font-sans space-y-6 select-text border-slate-200">
        <div className="border-b-2 border-indigo-600 pb-3 flex justify-between items-start text-[9px] font-bold text-slate-500 uppercase tracking-wider">
         <div className="space-y-0.5">
          <p>Ministero dell'Istruzione e del Merito</p>
          <p>USR Campania - Ufficio Scolastico Regionale</p>
          <strong className="text-slate-800 text-[10px]">ISTITUTO COMPRENSIVO "DON LORENZO MILANI"</strong>
          <p className="text-[8px] text-slate-400 font-normal">Via Marconi 25, 83031 Ariano Irpino (AV) - Cod. Mecc. AVIC849003</p>
         </div>
         <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 uppercase font-black">Faldone di Rito</span>
        </div>

        <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-xs">{generatedDocText}</pre>

        <div className="border-t border-slate-200 pt-6 grid grid-cols-2 gap-8 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-8">
         <div className="text-left space-y-8">
          <p>Il Segretario del Consiglio</p>
          <p className="border-b border-slate-300 w-32 h-6"></p>
         </div>
         <div className="text-right space-y-8 flex flex-col items-end">
          <p>Il Dirigente Scolastico / Coordinatore</p>
          <p className="border-b border-slate-300 w-32 h-6"></p>
         </div>
        </div>
       </div>
      </div>

      <div className="bg-slate-50 px-6 py-3.5 border-t flex justify-end space-x-3 shrink-0">
       <button 
        onClick={() => handlePrintDocumentPdf(generatedDocTitle, generatedDocText)} 
        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
       >
        <Printer className="w-4 h-4" />
        <span>Salva / Esporta in PDF</span>
       </button>
       <button onClick={() => {
        copyText(generatedDocText);
        showToast("Documento d'Istituto copiato negli appunti con successo!", true);
       }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md">
        <Copy className="w-4 h-4" />
        <span>Copia negli Appunti</span>
       </button>
       <button onClick={() => { setGeneratedDocTitle(null); setGeneratedDocText(null); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition">
        Chiudi
       </button>
      </div>
     </div>
    </div>
  );
}
