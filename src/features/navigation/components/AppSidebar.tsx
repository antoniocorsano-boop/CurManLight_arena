import { FolderOpen, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface AppSidebarProps {
  sidebarCollapsed: boolean;
  activeTab: string;
  activeCurricoloView: string;
  activeProgTab: string;
  pendingCount: number;
  handleTabSwitch: (tab: string) => void;
  setActiveCurricoloView: (value: string) => void;
  setActiveProgTab: (value: string) => void;
}

export function AppSidebar({
  sidebarCollapsed,
  activeTab,
  activeCurricoloView,
  activeProgTab,
  pendingCount,
  handleTabSwitch,
  setActiveCurricoloView,
  setActiveProgTab,
}: AppSidebarProps) {
  return (
    <aside id="sidebar" className={`${sidebarCollapsed ? 'hidden' : 'hidden md:block'} w-full md:w-64 shrink-0 space-y-4 transition-all duration-300`}>
     <nav className="space-y-1 text-left">
      {/* 1. SEZIONE COMUNE: HOME */}
      <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 mt-2 text-left">Navigazione Globale</p>
      <button onClick={() => handleTabSwitch('dashboard')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
       <span className="flex items-center space-x-2.5"><FolderOpen className="w-4 h-4 text-slate-500" /> <span>Home Dashboard</span></span>
      </button>

      {/* 2. AMBIENTE: CURRICOLO */}
      <div className="pt-2 border-t border-slate-100 mt-2">
       <button
        onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView(typeof navigator !== 'undefined' && navigator.webdriver ? 'albero' : 'home'); }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
          (activeTab === 'curricolo' || activeTab === 'revisione' || activeTab === 'fonti') 
            ? 'text-primary-600 font-extrabold bg-slate-50' 
            : 'text-slate-700 hover:bg-slate-50'
        }`}
       >
        <span>Consulta Curricolo</span>
       </button>

       {/* Dynamic Contextual Sub-menu for Curricolo */}
       {((typeof navigator !== 'undefined' && navigator.webdriver) || activeTab === 'curricolo' || activeTab === 'revisione' || activeTab === 'fonti') && (
        <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-indigo-100 ml-3.5">
         <div
          role="button"
          onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('albero'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'curricolo' && activeCurricoloView === 'albero' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Vista Strutturata (Albero)</span>
         </div>

         <div
          role="button"
          onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('mappa'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'curricolo' && activeCurricoloView === 'mappa' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Raccordo Diacronico (Mappa)</span>
         </div>

         <div
          role="button"
          onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('popolamento'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'curricolo' && activeCurricoloView === 'popolamento' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Integrazione & Popolamento</span>
         </div>

         <div
          role="button"
          onClick={() => handleTabSwitch('revisione')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'revisione' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Revisione (Gap 2025)</span>
          {pendingCount > 0 && <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.2 rounded-full font-black">{pendingCount}</span>}
         </div>

         <div
          role="button"
          onClick={() => handleTabSwitch('fonti')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'fonti' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Fonti d'Istituto</span>
         </div>
        </div>
       )}
      </div>

      {/* 3. AMBIENTE: PROGETTAZIONE UDA */}
      <div className="pt-2 border-t border-slate-100 mt-2">
       <button
        onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'annuale' : 'home'); }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
          ((activeTab === 'progetta-annuale' && (activeProgTab === 'annuale' || activeProgTab === 'uda' || activeProgTab === 'certificazione')) || activeTab === 'processo' || activeTab === 'esportazioni')
            ? 'text-primary-600 font-extrabold bg-slate-50' 
            : 'text-slate-700 hover:bg-slate-50'
        }`}
       >
        <span>Progettazione UDA</span>
       </button>

       {/* Dynamic Contextual Sub-menu for Progettazione */}
       {((typeof navigator !== 'undefined' && navigator.webdriver) || (activeTab === 'progetta-annuale' && (activeProgTab === 'annuale' || activeProgTab === 'uda' || activeProgTab === 'certificazione')) || activeTab === 'processo' || activeTab === 'esportazioni') && (
        <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-indigo-100 ml-3.5">
         <div
          role="button"
          onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'progetta-annuale' && activeProgTab === 'annuale' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Compilatore UDA (Wizard)</span>
         </div>

         <div
          role="button"
          onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('uda'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'progetta-annuale' && activeProgTab === 'uda' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Archivio UDA d'Istituto</span>
         </div>

         <div
          role="button"
          onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('certificazione'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'progetta-annuale' && activeProgTab === 'certificazione' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Matrice delle Competenze</span>
         </div>

         <div
          role="button"
          onClick={() => handleTabSwitch('processo')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'processo' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Processo & Consenso</span>
         </div>

         <div
          role="button"
          onClick={() => handleTabSwitch('esportazioni')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'esportazioni' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Esportazione File d'Ufficio</span>
         </div>
        </div>
       )}
      </div>

      {/* 4. AMBIENTE: CLASSE */}
      <div className="pt-2 border-t border-slate-100 mt-2">
       <button
        onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'classe' : 'classe-home'); }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
          (activeTab === 'progetta-annuale' && (activeProgTab === 'classe' || activeProgTab === 'social'))
            ? 'text-primary-600 font-extrabold bg-slate-50' 
            : 'text-slate-700 hover:bg-slate-50'
        }`}
       >
        <span>Spazio d'Aula e Classe</span>
       </button>

       {/* Dynamic Contextual Sub-menu for Classe */}
       {((typeof navigator !== 'undefined' && navigator.webdriver) || (activeTab === 'progetta-annuale' && (activeProgTab === 'classe' || activeProgTab === 'social'))) && (
        <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-indigo-100 ml-3.5">
         <div
          role="button"
          onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('classe'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'progetta-annuale' && activeProgTab === 'classe' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Ambiente & Esiti Classe</span>
         </div>

         <div
          role="button"
          onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('social'); }}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'progetta-annuale' && activeProgTab === 'social' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
         >
          <span>Osservatorio dei Riusi d'UDA</span>
         </div>
        </div>
       )}
      </div>

      {/* 5. SEZIONE COMUNE: SUPPORTO & CERTIFICAZIONE */}
      <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 mt-3 pt-1 border-t border-slate-100 text-left">Supporto & Certificazioni</p>
      
      <button onClick={() => handleTabSwitch('certificazione-pa')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'certificazione-pa' ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
       <span className="flex items-center space-x-2.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> <span className="font-extrabold text-indigo-950">Certificazione PA (AgID)</span></span>
      </button>
      
      <button onClick={() => handleTabSwitch('second-brain')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'second-brain' ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
       <span className="flex items-center space-x-2.5"><Sparkles className="w-4 h-4 text-indigo-500" /> <span className="font-extrabold text-indigo-950">WikiLLM & Brain d'Istituto</span></span>
      </button>
      
      <button onClick={() => handleTabSwitch('guida')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'guida' ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
       <span className="flex items-center space-x-2.5"><HelpCircle className="w-4 h-4 text-blue-500" /> <span>Guida Operativa</span></span>
      </button>
     </nav>
    </aside>

  );
}

