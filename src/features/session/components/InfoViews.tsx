import { BookOpenCheck, HelpCircle, Layers, Sparkles } from 'lucide-react';

type GeneralSubtab = 'premessa' | 'riforma' | 'obiettivi' | 'livelli';

interface InfoViewsProps {
  activeTab: string;
  activeGeneralSubtab: GeneralSubtab;
  setActiveGeneralSubtab: (value: GeneralSubtab) => void;
}

export function InfoViews({ activeTab, activeGeneralSubtab, setActiveGeneralSubtab }: InfoViewsProps) {
  return (
    <>
     {/* VIEW: FONTI & SEZIONI GENERALI */}
     {activeTab === 'fonti' && (
      <div className="space-y-6 fade-in text-left">
       <div className="border-b border-slate-100 pb-3 flex justify-between items-center text-xs font-bold shadow-sm">
         <div>Fonti e sezioni generali disponibili</div>
        <div className="bg-slate-100 p-0.5 rounded-xl flex space-x-1 border border-slate-200">
         <button onClick={() => setActiveGeneralSubtab('premessa')} className={`px-2.5 py-1 rounded-lg transition ${activeGeneralSubtab === 'premessa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>1. Premessa & Profilo</button>
         <button onClick={() => setActiveGeneralSubtab('riforma')} className={`px-2.5 py-1 rounded-lg transition ${activeGeneralSubtab === 'riforma' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>2. Riforma IN 2025</button>
         <button onClick={() => setActiveGeneralSubtab('obiettivi')} className={`px-2.5 py-1 rounded-lg transition ${activeGeneralSubtab === 'obiettivi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>3. Obiettivi Formativi</button>
         <button onClick={() => setActiveGeneralSubtab('livelli')} className={`px-2.5 py-1 rounded-lg transition ${activeGeneralSubtab === 'livelli' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>4. Livelli di Valutazione</button>
        </div>
       </div>

       {activeGeneralSubtab === 'premessa' && (
        <div className="space-y-4 fade-in text-xs leading-relaxed font-medium">
         <div className="bg-slate-50 p-4 border rounded-xl space-y-2">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center space-x-1.5"><BookOpenCheck className="w-4 h-4 text-primary-500" /> <span>1.1 Premessa e Principi Ispiratori</span></h3>
          <p className="text-slate-600">Il presente Curricolo, ispirandosi ai principi della Costituzione Italiana e alle Nuove Indicazioni Nazionali (D.M. 221/2025), pone la persona al centro del processo educativo. La scuola si configura come una comunità educante che, in alleanza con le famiglie e il territorio, accompagna ogni studente in un percorso di formazione integrale, valorizzandone l'identità, i talenti e le potenzialità. L'obiettivo è sviluppare cittadini consapevoli, in grado di conoscere se stessi, elaborare un proprio progetto di vita e contribuire al bene comune.</p>
         </div>
        </div>
       )}

       {activeGeneralSubtab === 'riforma' && (
        <div className="space-y-4 fade-in text-xs leading-relaxed font-medium">
         <div className="bg-slate-50 p-4 border rounded-xl space-y-2">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center space-x-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> <span>2.1 La Svolta delle Nuove Indicazioni Nazionali 2025</span></h3>
          <p className="text-slate-600">Le Nuove Indicazioni 2025 propongono temi quali scrittura in corsivo, educazione economico-finanziaria, studio dell'intelligenza artificiale e sostenibilità. Verifica sempre le fonti normative applicabili.</p>
         </div>
        </div>
       )}

       {activeGeneralSubtab === 'obiettivi' && (
        <div className="bg-slate-50 p-4 border rounded-xl space-y-2 fade-in text-xs leading-relaxed font-medium">
         <h3 className="font-extrabold text-slate-800 text-xs flex items-center space-x-1.5"><Layers className="w-4 h-4 text-emerald-500" /> <span>3.1 Declinazione degli Obiettivi per Competenze</span></h3>
         <p className="text-slate-500 font-semibold">La vista consente di scegliere e collegare evidenze locali alle competenze europee; il collegamento non è validato.</p>
        </div>
       )}

       {activeGeneralSubtab === 'livelli' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in text-xs">
         <div className="border-l-4 border-indigo-500 bg-slate-50 p-3.5 rounded-r-xl shadow-sm space-y-1">
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[9px] rounded-full uppercase">Livello A — Avanzato (Voto 9-10)</span>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">L'alunno/a svolge compiti e risolve problemi complessi, mostrando padronanza nell'uso di conoscenze e abilità; propone e sostiene le proprie opinioni e assume decisioni consapevoli.</p>
         </div>
         <div className="border-l-4 border-emerald-500 bg-slate-50 p-3.5 rounded-r-xl shadow-sm space-y-1">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full uppercase">Livello B — Intermedio (Voto 7-8)</span>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">L'alunno/a svolge compiti e risolve problemi in situazioni nuove, compie scelte consapevoli, mostrando di saper utilizzare le conoscenze e le abilità acquisite.</p>
         </div>
         <div className="border-l-4 border-amber-500 bg-slate-50 p-3.5 rounded-r-xl shadow-sm space-y-1">
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[9px] rounded-full uppercase">Livello C — Base (Voto 6)</span>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">L'alunno/a svolge compiti semplici anche in situazioni nuove, mostrando di possedere conoscenze e abilità fondamentali e di saper applicare basilari regole e procedure apprese.</p>
         </div>
         <div className="border-l-4 border-rose-500 bg-slate-50 p-3.5 rounded-r-xl shadow-sm space-y-1">
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[9px] rounded-full uppercase">Livello D — Iniziale (Voto 4-5)</span>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">L'alunno/a, se opportunamente guidato/a, svolge compiti semplici in situazioni note.</p>
         </div>
        </div>
       )}
      </div>
     )}

     {/* VIEW: GUIDA */}
     {activeTab === 'guida' && (
      <div className="space-y-8 fade-in text-left text-xs leading-relaxed text-slate-700">
       {/* Header */}
       <div className="border-b border-slate-150 pb-4">
        <h1 className="text-base font-black text-slate-800 flex items-center space-x-2">
         <HelpCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
         <span>Guida Utente e Manuale d'Uso della Piattaforma</span>
        </h1>
         <p className="text-[11px] text-slate-500 font-medium">Manuale operativo per la programmazione, l'allineamento dei curricoli e l'esportazione dei documenti.</p>
       </div>

       {/* GUIDA UTENTE SECTIONS */}
       <div className="space-y-6">
        
        {/* 1. CONFIGURAZIONE PROFILO */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
         <h3 className="font-extrabold text-indigo-950 text-xs flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black">1</span>
          <span className="uppercase tracking-wide text-[11px]">Profilo personale e contesto di lavoro</span>
         </h3>
         <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
           Al primo avvio puoi dichiarare un contesto personale di consultazione. Le scelte non sono autenticate e non attribuiscono ruoli o autorità:
         </p>
         <ul className="list-disc pl-4 space-y-2 text-[10px] text-slate-500 font-bold leading-relaxed">
           <li><strong>Ruolo dichiarato</strong>: è un'etichetta personale non verificata.</li>
           <li><strong>Ordine di consultazione</strong>: seleziona l'ordine utile alla sessione senza configurare l'offerta della scuola.</li>
           <li><strong>Classi e sezioni</strong>: aggiungi solo combinazioni utili al lavoro locale.</li>
         </ul>
        </div>

        {/* 2. CONSULTAZIONE CURRICOLO */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
         <h3 className="font-extrabold text-indigo-950 text-xs flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black">2</span>
          <span className="uppercase tracking-wide text-[11px]">Consultazione dei contenuti curriculari locali</span>
         </h3>
         <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
           Nel tab <strong>"Consulta Curricolo"</strong> puoi esplorare i contenuti disponibili. La vista non ne verifica completezza o adozione:
         </p>
         <ul className="list-disc pl-4 space-y-2 text-[10px] text-slate-500 font-bold leading-relaxed">
           <li><strong>Mappe di senso e albero disciplinare</strong>: esplora traguardi e obiettivi disponibili per la selezione corrente.</li>
          <li><strong>Filtro Termini Rapido</strong>: Digita parole chiave (es. <em>corsivo</em> o <em>Blender</em>) per estrarre istantaneamente gli obiettivi e traguardi associati.</li>
          <li><strong>Traduzione Olistica per l'Infanzia</strong>: Se selezioni l'Infanzia come ordine, il sistema traduce all'istante le materie nei relativi 5 Campi di Esperienza ministeriali (es. <em>Italiano</em> diventa <em> I discorsi e le parole</em>), prevenendo errori terminologici.</li>
         </ul>
        </div>

        {/* 3. REVISIONI DEI GAP */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
         <h3 className="font-extrabold text-indigo-950 text-xs flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black">3</span>
          <span className="uppercase tracking-wide text-[11px]">Confronto locale dei testi 2012-2025</span>
         </h3>
         <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
           Il tab <strong>"Revisione (Gap 2025)"</strong> registra scelte personali di lavoro prive di valore deliberativo:
         </p>
         <ul className="list-disc pl-4 space-y-2 text-[10px] text-slate-500 font-bold leading-relaxed">
          <li><strong>Carousel Monoscheda</strong>: Esamina ciascun gap ordinamentale (DM 254/2012 vs DM 221/2025) focalizzandoti su una singola scheda comparativa alla volta per azzerare l'affaticamento visivo.</li>
           <li><strong>Scelta locale</strong>: usa il testo 2025, mantieni il testo 2012 o scrivi una proposta personale.</li>
           <li><strong>Esportazione tecnica</strong>: scarica un file `.cml` locale; l'esportazione non costituisce invio o approvazione.</li>
         </ul>
        </div>

        {/* 4. PROGETTAZIONE UDA */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
         <h3 className="font-extrabold text-indigo-950 text-xs flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black">4</span>
          <span className="uppercase tracking-wide text-[11px]">Progettazione Guidata Unità di Apprendimento (UDA)</span>
         </h3>
         <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
           L'area di progettazione consente di preparare una bozza UDA locale tramite un wizard a cinque passi:
         </p>
         <ul className="list-disc pl-4 space-y-2 text-[10px] text-slate-500 font-bold leading-relaxed">
           <li><strong>Dati introduttivi (Step 1)</strong>: inserisci titolo, monte ore, periodo e discipline coinvolte nella bozza personale.</li>
           <li><strong>Traguardi &amp; Obiettivi (Step 2)</strong>: seleziona i contenuti disponibili nella copia locale non validata.</li>
          <li><strong>Evidenze d'Inclusione (Step 3)</strong>: Associa le evidenze di comportamento osservabili per la certificazione delle competenze.</li>
           <li><strong>Inclusione e Compito (Step 4)</strong>: Inserisci il prodotto finale atteso. Sotto le note BES/DSA, usa i pulsanti rapidi per font ad alta leggibilità, sintesi vocale, mappe concettuali e altre misure definite nel contesto locale.</li>
          <li><strong>Salva in Archivio (Step 5)</strong>: Verifica il codice sorgente, copia il tracciato, ed aggiungi l'UDA nella tua biblioteca locale del browser.</li>
         </ul>
        </div>

        {/* 5. ESPORTAZIONI */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
         <h3 className="font-extrabold text-indigo-950 text-xs flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black">5</span>
          <span className="uppercase tracking-wide text-[11px]">Esportazione File, PDF, ODF e Tracciato Registro Elettronico</span>
         </h3>
         <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
           Nel tab <strong>"Esportazione File"</strong> puoi generare copie tecniche locali, da verificare prima dell'uso:
         </p>
         <ul className="list-disc pl-4 space-y-2 text-[10px] text-slate-500 font-bold leading-relaxed">
           <li><strong>Documenti di lavoro</strong>: genera bozze di programmazione o relazione di classe.</li>
           <li><strong>ODF (.odt)</strong>: esporta una copia in formato aperto; l'app non certifica conformità CAD o PA.</li>
          <li><strong>Stampa e Salva in PDF</strong>: Esporta ed impagina i tuoi documenti in formato PDF pulito esente da pulsanti web.</li>
          <li><strong>Copia per Registro (Argo/ClasseViva)</strong>: Nel pannello dei dettagli UDA, clicca sul tasto smeraldo per copiare un tracciato di testo tabulato, pronto per essere incollato direttamente sui registri elettronici DidUp o Spaggiari.</li>
         </ul>
        </div>

       </div>
      </div>
     )}
    </>
  );
}
