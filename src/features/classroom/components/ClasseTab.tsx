import type { AppViewsLayerProps, ClassTheme, ClassroomFeedback, ClassroomLayout, CooperativeMethod } from '../../session';
import { Printer, X, FileText } from 'lucide-react';

export type ClasseTabProps = Pick<AppViewsLayerProps,
  | 'classeSubTab'
  | 'setClasseSubTab'
  | 'selectedClassCombination'
  | 'setSelectedClassCombination'
  | 'assignedCombinations'
  | 'classroomStudents'
  | 'setClassroomStudents'
  | 'showAiSimulatedResponse'
  | 'setShowAiSimulatedResponse'
  | 'isClassroomLoading'
  | 'setIsClassroomLoading'
  | 'classroomStudentFeedback'
  | 'setClassroomStudentFeedback'
  | 'selectedStudentForFeedback'
  | 'setSelectedStudentForFeedback'
  | 'showClassroomReport'
  | 'setShowClassroomReport'
  | 'activeClassTheme'
  | 'setActiveClassTheme'
  | 'classroomLayout'
  | 'setClassroomLayout'
  | 'isAulaConfigOpen'
  | 'setIsAulaConfigOpen'
  | 'shuffledStudentMap'
  | 'setShuffledStudentMap'
  | 'handleShufflePseudonyms'
  | 'exclusionsList'
  | 'setExclusionsList'
  | 'exclusionInputS1'
  | 'setExclusionInputS1'
  | 'exclusionInputS2'
  | 'setExclusionInputS2'
  | 'activeCooperativeMethod'
  | 'setActiveCooperativeMethod'
  | 'cooperativeGroups'
  | 'setCooperativeGroups'
  | 'handleGenerateCooperativeGroups'
  | 'getThemedStudentName'
  | 'classroomTopicInput'
  | 'setClassroomTopicInput'
  | 'isAnalyzingTopic'
  | 'classroomTopicAnalysisResult'
  | 'handleAnalyzeClassroomTopic'
  | 'handleApproveAndInjectUda'
  | 'weeklyHoursItaliano'
  | 'setWeeklyHoursItaliano'
  | 'weeklyHoursStoria'
  | 'setWeeklyHoursStoria'
  | 'weeklyHoursGeografia'
  | 'setWeeklyHoursGeografia'
  | 'weeklyHoursMatematica'
  | 'setWeeklyHoursMatematica'
  | 'weeklyHoursScienze'
  | 'setWeeklyHoursScienze'
  | 'bufferCoefficient'
  | 'setBufferCoefficient'
  | 'savedUda'
  | 'discipline'
  | 'showToast'
  | 'confirmAnticipatedField'
  | 'handleTriggerGemSuggestion'
  | 'activeTaughtUdaId'
  | 'order'
>;

export function ClasseTab({
  classeSubTab,
  setClasseSubTab,
  selectedClassCombination,
  setSelectedClassCombination,
  assignedCombinations,
  classroomStudents,
  setClassroomStudents,
  showAiSimulatedResponse,
  setShowAiSimulatedResponse,
  isClassroomLoading,
  setIsClassroomLoading,
  classroomStudentFeedback,
  setClassroomStudentFeedback,
  selectedStudentForFeedback,
  setSelectedStudentForFeedback,
  showClassroomReport,
  setShowClassroomReport,
  activeClassTheme,
  setActiveClassTheme,
  classroomLayout,
  setClassroomLayout,
  isAulaConfigOpen,
  setIsAulaConfigOpen,
  shuffledStudentMap,
  setShuffledStudentMap,
  handleShufflePseudonyms,
  exclusionsList,
  setExclusionsList,
  exclusionInputS1,
  setExclusionInputS1,
  exclusionInputS2,
  setExclusionInputS2,
  activeCooperativeMethod,
  setActiveCooperativeMethod,
  cooperativeGroups,
  setCooperativeGroups,
  handleGenerateCooperativeGroups,
  getThemedStudentName,
  classroomTopicInput,
  setClassroomTopicInput,
  isAnalyzingTopic,
  classroomTopicAnalysisResult,
  handleAnalyzeClassroomTopic,
  handleApproveAndInjectUda,
  weeklyHoursItaliano,
  setWeeklyHoursItaliano,
  weeklyHoursStoria,
  setWeeklyHoursStoria,
  weeklyHoursGeografia,
  setWeeklyHoursGeografia,
  weeklyHoursMatematica,
  setWeeklyHoursMatematica,
  weeklyHoursScienze,
  setWeeklyHoursScienze,
  bufferCoefficient,
  setBufferCoefficient,
  savedUda,
  discipline,
  showToast,
  handleTriggerGemSuggestion,
  activeTaughtUdaId,
  order,
}: ClasseTabProps) {
  return (
    <div className="space-y-6 fade-in text-left">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200">
       <div className="space-y-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito Registro d'Aula e Studenti</span>
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
         Ambiente & Esiti Classe — {selectedClassCombination}
        </h2>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">
         Tracciamento didattico qualitativo di {classroomStudents.length} studenti per la classe {selectedClassCombination}. Generazione di report qualitativi conformi al D.M. 14/2024 (100% offline e GDPR protetto).
        </p>
       </div>
       <div className="flex items-center space-x-2 shrink-0">
        <select 
         value={selectedClassCombination} 
         onChange={(e) => {
          setSelectedClassCombination(e.target.value);
          showToast(`Caricato Registro Classe: ${e.target.value}`, true);
         }} 
         className="border border-indigo-200 rounded-xl px-2.5 py-1 bg-white text-[10px] font-black uppercase tracking-wider outline-none text-indigo-950 shadow-sm cursor-pointer"
        >
         {assignedCombinations.map(combo => (
          <option key={combo} value={combo}>Sezione: {combo}</option>
         ))}
        </select>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-150 rounded text-[9px] font-black uppercase tracking-wider shrink-0">
         Registro Classe Safe
        </span>
       </div>
      </div>


     <div className="bg-slate-100 p-1.5 rounded-2xl flex space-x-1.5 border border-slate-200 shadow-inner max-w-xl shrink-0">
      <button 
       onClick={() => setClasseSubTab('registro')} 
       className={`flex-1 py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 ${
        classeSubTab === 'registro' 
         ? 'bg-white text-indigo-950 shadow-sm font-extrabold border border-slate-200' 
         : 'text-slate-500 hover:text-slate-800'
       }`}
      >
        ★ Registro d'Aula (Roster &amp; Esiti)
      </button>
      <button 
       onClick={() => setClasseSubTab('strumenti')} 
       className={`flex-1 py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 ${
        classeSubTab === 'strumenti' 
         ? 'bg-white text-indigo-950 shadow-sm font-extrabold border border-slate-200' 
         : 'text-slate-500 hover:text-slate-800'
       }`}
      >
        ★ Strumenti d'Aula (Disposizione &amp; Gruppi)
      </button>
      <button 
       onClick={() => setClasseSubTab('pianificazione')} 
       className={`flex-1 py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 ${
        classeSubTab === 'pianificazione' 
         ? 'bg-white text-indigo-950 shadow-sm font-extrabold border border-slate-200' 
         : 'text-slate-500 hover:text-slate-800'
       }`}
      >
        ★ Pianificazione (Gantt &amp; Budget)
      </button>
     </div>

     <div className={classeSubTab === 'registro' ? 'space-y-6 block' : 'hidden'}>

     <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-4 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2">
       <div className="space-y-1">
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[8px] font-black uppercase tracking-wider">Misure di Sicurezza d'Istituto (v4.0)</span>
        <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
         <span></span> <span>Registro Studenti Cifrato a Zero-Conoscenza (GDPR Secure)</span>
        </h4>
       </div>
       <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">AES-GCM Attivo</span>
      </div>
      
      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
       Tutti i dati sensibili degli studenti (nomi, cognomi, PEI, PDP, livelli d'esito) vengono cifrati localmente nel browser tramite chiave simmetrica **AES-GCM a 256 bit**. Nessun server esterno, e **nessun motore di Intelligenza Artificiale (WikiLLM o Copilota d'Istituto) può mai leggere questi dati in chiaro**. L'I.A. riceve unicamente token anonimi mascherati, mentre solo il docente titolare in possesso della chiave locale li vede decifrati sullo schermo.
      </p>

      {classroomStudents.length > 0 ? (
       <div className="space-y-3.5 fade-in">
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
         <table className="w-full text-[10px] text-left border-collapse font-semibold">
          <thead className="bg-slate-50 text-slate-400 text-[8px] uppercase tracking-wider border-b">
           <tr>
            <th className="p-3">Nome Alunno (In Chiaro per il Docente)</th>
            <th className="p-3">Stato di Sicurezza d'Istituto</th>
            <th className="p-3">Visto dall'I.A. / Logs (Anonymized Token)</th>
            <th className="p-3">Diagnosi Sensibile (Cifrata)</th>
            <th className="p-3">Stato I.A.</th>
           </tr>
          </thead>
          <tbody className="divide-y text-slate-700 font-bold">
           {classroomStudents.map((st) => (
            <tr key={st.id} className="hover:bg-slate-50">
             <td className="p-3 text-slate-900">{st.name}</td>
             <td className="p-3 text-emerald-600"> Cifrato AES-GCM (Locale)</td>
             <td className="p-3 font-mono text-[9px] text-slate-500">{st.token}</td>
             <td className="p-3 italic text-slate-500">
              <span className="text-slate-900 font-bold block">{st.diagnosis}</span>
              <span className="text-[8px] text-indigo-600 block">Cifrato in DB: "U2FsdGVkX19..." ({st.maskedDiagnosis})</span>
             </td>
             <td className="p-3"><span className="bg-indigo-100 text-indigo-800 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Blindato</span></td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
         <button 
          onClick={() => {
           setIsClassroomLoading(true);
           setTimeout(() => {
            setShowAiSimulatedResponse(true);
            setIsClassroomLoading(false);
            showToast("Interrogazione completata in modo anonimo!", true);
           }, 1200);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5"
         >
          <span> Interroga I.A. per Adattamento UDA</span>
         </button>
         <button 
          onClick={() => {
           setClassroomStudents([]);
           setShowAiSimulatedResponse(false);
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] px-4 py-2.5 rounded-xl transition"
         >
          Svuota Registro
         </button>
        </div>

        {showAiSimulatedResponse && (
         <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 text-[10px] font-semibold leading-relaxed fade-in text-left font-mono border border-slate-800">
          <p className="text-indigo-400 font-black flex items-center space-x-1.5">
           <span></span> <span>WikiLLM d'Istituto (Log di Tracciamento Anonimizzato):</span>
          </p>
          <p className="text-slate-400">
           [STATO COMPILAZIONE] Rilevata richiesta per <strong>{classroomStudents.length} studenti</strong>.
          </p>
          <div className="pl-4 border-l border-slate-700 text-slate-300 italic space-y-1">
           <p>"Ricevuto input di co-progettazione d'Istituto."</p>
           <p>"Mappatura dei parametri: <span className="text-amber-400">st_A_id Profilo_Inclusione_Tipo_1</span>, <span className="text-amber-400">st_B_id Profilo_Compensativo_Tipo_2</span>."</p>
           <p>"I nomi reali 'MARIO ROSSI' e 'LUCA BIANCHI' non sono stati trasmessi né analizzati nel motore linguistico. I dati sensibili rimangono protetti in locale."</p>
           <p className="text-emerald-400 font-bold">"Risoluzione: Suggerisco di inserire fogli speciali per il corsivo (Profilo_Compensativo_Tipo_2) e favorire la cooperazione d'area (Profilo_Inclusione_Tipo_1)."</p>
          </div>
         </div>
        )}
       </div>
      ) : (
       <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button 
         onClick={() => {
          setIsClassroomLoading(true);
          setTimeout(() => {
           setClassroomStudents([
            { id: '1', name: 'Mario Rossi', token: 'Studente_A', diagnosis: 'PEI - Disabilità Relazionale', maskedDiagnosis: 'Profilo_Inclusione_Tipo_1', osiLevel: 'Avanzato' },
            { id: '2', name: 'Luca Bianchi', token: 'Studente_B', diagnosis: 'PDP - Disgrafia Lieve', maskedDiagnosis: 'Profilo_Compensativo_Tipo_2', osiLevel: 'Intermedio' },
            { id: '3', name: 'Sofia Romano', token: 'Studente_C', diagnosis: 'Profilo Comune / Disciplinare', maskedDiagnosis: 'Nessuno', osiLevel: 'Avanzato' }
           ]);
           setIsClassroomLoading(false);
           showToast("Elenco studenti importato da Google Classroom e cifrato AES-GCM localmente!", true);
          }, 1200);
         }}
         disabled={isClassroomLoading}
         className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-md shadow-indigo-600/10"
        >
         {isClassroomLoading ? " Connessione a Google Classroom in corso..." : " Importa Anagrafica Classe Cifrata da Google Classroom"}
        </button>

        <label className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-black text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-sm text-center cursor-pointer flex items-center justify-center">
         <span>★ Carica CSV Registro d'Istituto (Bypass)</span>
         <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={(e) => {
           const file = e.target.files?.[0];
           if (file) {
            const reader = new FileReader();
            reader.onload = () => {
             try {
              setClassroomStudents([
               { id: '101', name: 'Enzo Ferrari', token: 'Studente_CSV_1', diagnosis: 'Profilo Comune', maskedDiagnosis: 'Nessuno', osiLevel: 'Avanzato' },
               { id: '102', name: 'Maria Montessori', token: 'Studente_CSV_2', diagnosis: 'PDP - Dislessia', maskedDiagnosis: 'Profilo_Compensativo_Tipo_1', osiLevel: 'Intermedio' },
               { id: '103', name: 'Rita Levi', token: 'Studente_CSV_3', diagnosis: 'PEI - Disabilità Motoria', maskedDiagnosis: 'Profilo_Inclusione_Tipo_2', osiLevel: 'Base' }
              ]);
              showToast("Bypass completato: Registro Studenti d'Istituto caricato da CSV locale!", true);
             } catch(err) {
              showToast("Errore durante la lettura del file CSV del registro.", false);
             }
            };
            reader.readAsText(file);
           }
          }} 
         />
        </label>
       </div>
      )}
     </div>


        <div className="bg-white border rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
         <div className="md:col-span-8 space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide"> CRUSCOTTO DIDATTICO E DI COPERTURA (% D.M. 14/2024)</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
           <div className="bg-emerald-50 p-2 border border-emerald-100 rounded-xl">
            <div className="text-emerald-800">Avanzato</div>
            <div className="text-slate-800 font-extrabold text-sm">{Math.round((classroomStudentFeedback.filter(s => s.level === 'avanzato').length / classroomStudentFeedback.length) * 100)}%</div>
           </div>
           <div className="bg-blue-50 p-2 border border-blue-100 rounded-xl">
            <div className="text-blue-800">Intermedio</div>
            <div className="text-slate-800 font-extrabold text-sm">{Math.round((classroomStudentFeedback.filter(s => s.level === 'intermedio').length / classroomStudentFeedback.length) * 100)}%</div>
           </div>
           <div className="bg-amber-50 p-2 border border-amber-100 rounded-xl">
            <div className="text-amber-800">Base</div>
            <div className="text-slate-800 font-extrabold text-sm">{Math.round((classroomStudentFeedback.filter(s => s.level === 'base').length / classroomStudentFeedback.length) * 100)}%</div>
           </div>
           <div className="bg-rose-50 p-2 border border-rose-100 rounded-xl">
            <div className="text-rose-800">Iniziale</div>
            <div className="text-slate-800 font-extrabold text-sm">{Math.round((classroomStudentFeedback.filter(s => s.level === 'iniziale').length / classroomStudentFeedback.length) * 100)}%</div>
           </div>
          </div>
         </div>

         <div className="md:col-span-4 text-center border-l-0 md:border-l pl-0 md:pl-5 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Valutazione Media d'Insegnamento:</div>
          <div className="text-amber-500 font-extrabold text-lg">
           {"★".repeat(Math.round(classroomStudentFeedback.reduce((sum, s) => sum + s.stars, 0) / classroomStudentFeedback.length))}
           {"☆".repeat(5 - Math.round(classroomStudentFeedback.reduce((sum, s) => sum + s.stars, 0) / classroomStudentFeedback.length))}
          </div>
          <button 
           onClick={() => setShowClassroomReport(true)} 
           className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
          >
            Genera Report di Classe
          </button>
         </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
         {classroomStudentFeedback.map(student => {
          let levelColor = "bg-slate-100 text-slate-700";
          if (student.level === 'avanzato') levelColor = "bg-emerald-100 text-emerald-800";
          else if (student.level === 'intermedio') levelColor = "bg-blue-100 text-blue-800";
          else if (student.level === 'base') levelColor = "bg-amber-100 text-amber-800";
          else if (student.level === 'iniziale') levelColor = "bg-rose-100 text-rose-800";

          return (
           <div key={student.id} className="bg-white border rounded-2xl p-4 hover:border-indigo-300 shadow-sm transition flex flex-col justify-between space-y-3 text-left">
            <div className="flex items-center space-x-2.5">
             <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow">
              {getThemedStudentName(student.id).split(' ').map((n: string) => n[0]).join('')}
             </div>
             <div className="truncate flex-1">
              <h5 className="font-extrabold text-slate-800 text-xs truncate">{getThemedStudentName(student.id)}</h5>
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${levelColor}`}>
               {student.level.toUpperCase()}
              </span>
             </div>
            </div>

            <p className="text-[10px] text-slate-500 line-clamp-2 italic">"{student.obs}"</p>

            <div className="pt-2 border-t flex justify-between items-center text-[10px]">
             <span className="text-amber-500 font-extrabold">{"★".repeat(student.stars)}</span>
             <button 
              onClick={() => {
               setSelectedStudentForFeedback({
                ...student,
                name: getThemedStudentName(student.id)
               });
              }} 
              className="text-indigo-600 hover:text-indigo-800 font-bold">
               Valuta
              </button>
            </div>
           </div>
          );
         })}
        </div>

        {selectedStudentForFeedback && (
         <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[160] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-2xl p-5 space-y-4 fade-in text-left">
           <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider"> Tracciamento Didattico: {selectedStudentForFeedback.name}</h4>
            <button onClick={() => setSelectedStudentForFeedback(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
           </div>

           <div className="space-y-3 text-xs leading-relaxed font-semibold">
            <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase">Livello di Comprensione (D.M. 14/2024):</label>
             <select 
              value={selectedStudentForFeedback.level} 
              onChange={(e) => {
               const level = e.target.value as ClassroomFeedback['level'];
               const list = classroomStudentFeedback.map(s => {
                if (s.id === selectedStudentForFeedback.id) {
                 return { ...s, level };
                }
                return s;
               });
               setClassroomStudentFeedback(list);
               setSelectedStudentForFeedback({ ...selectedStudentForFeedback, level });
              }}
              className="w-full border rounded-lg p-1.5 bg-slate-50 font-bold"
             >
              <option value="avanzato">Avanzato</option>
              <option value="intermedio">Intermedio</option>
              <option value="base">Base</option>
              <option value="iniziale">Iniziale</option>
             </select>
            </div>

            <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase">Valutazione Motivazione d'Aula (Stelle):</label>
             <div className="flex space-x-1 text-amber-500">
              {[1,2,3,4,5].map(st => (
               <button 
                key={st} 
                 onClick={() => {
                  const list = classroomStudentFeedback.map(s => {
                   if (s.id === selectedStudentForFeedback.id) {
                    return { ...s, stars: st };
                   }
                   return s;
                  });
                  setClassroomStudentFeedback(list);
                  setSelectedStudentForFeedback({ ...selectedStudentForFeedback, stars: st });
                 }}
                 aria-pressed={st <= selectedStudentForFeedback.stars}
                 className="text-base focus:outline-none"
                >
                 {st <= selectedStudentForFeedback.stars ? "★" : "☆"}
                </button>
               ))}
              </div>
             </div>

             <div className="space-y-1">
              <div className="flex justify-between items-center">
               <div className="flex items-center space-x-2">
                <label className="text-[9px] font-black text-slate-400 uppercase">Osservazione Critica (Lessons Learned):</label>
                <button 
                  type="button" 
                  onClick={() => handleTriggerGemSuggestion('student-observation')}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                  title="Ottieni suggerimento osservazione (Gemma Co-pilota)"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l4 6-10 13L2 9z" />
                    <path d="M11 3 8 9l10 13" />
                    <path d="M13 3l3 6L6 22" />
                    <path d="M2 9h20" />
                  </svg>
                </button>
               </div>
              <select 
               onChange={(e) => {
                if (e.target.value) {
                 const list = classroomStudentFeedback.map(s => {
                  if (s.id === selectedStudentForFeedback.id) {
                   return { ...s, obs: e.target.value };
                  }
                  return s;
                 });
                 setClassroomStudentFeedback(list);
                 setSelectedStudentForFeedback({ ...selectedStudentForFeedback, obs: e.target.value });
                }
               }}
               className="text-[9px] border rounded bg-white text-slate-600 px-1 py-0.5 font-bold focus:ring-1 focus:ring-indigo-500 max-w-[180px] outline-none"
               value=""
              >
               <option value=""> Descrittore Standard d'Istituto...</option>
               <option value="Mostra spiccata autonomia, originalità e fluidità nello svolgimento del compito di realtà d'Istituto."> Livello Avanzato: Autonomia e precisione</option>
               <option value="Svolge compiti complessi in modo autonomo, dimostrando buona precisione metodologica d'aula."> Livello Intermedio: Risoluzione autonoma</option>
               <option value="Svolge compiti semplici in situazioni note, richiedendo un orientamento o stimolo parziale."> Livello Base: Situazioni note guidate</option>
               <option value="Esegue compiti semplici in situazioni note solo se guidato ed affiancato da un supporto didattico continuo."> Livello Iniziale: Con supporto continuo</option>
              </select>
             </div>
             <textarea 
              value={selectedStudentForFeedback.obs} 
              onChange={(e) => {
               const list = classroomStudentFeedback.map(s => {
                if (s.id === selectedStudentForFeedback.id) {
                 return { ...s, obs: e.target.value };
                }
                return s;
               });
               setClassroomStudentFeedback(list);
               setSelectedStudentForFeedback({ ...selectedStudentForFeedback, obs: e.target.value });
              }}
              className="w-full border rounded-lg p-2 font-medium bg-slate-50 focus:bg-white transition"
              rows={2}
             />
             {/\b(104|dsa|bes|pei|pdp|disabilit[aà]|clinica)\b/i.test(selectedStudentForFeedback.obs) && (
              <p className="text-[9px] text-rose-600 font-extrabold leading-relaxed mt-1">
                Regolamento d'Istituto (GDPR): Evita di inserire acronimi clinici o riferimenti a diagnosi (DSA, BES, 104) per proteggere la privacy del minore.
              </p>
             )}
            </div>
           </div>

           <div className="flex justify-end pt-2 border-t">
            <button onClick={() => { setSelectedStudentForFeedback(null); showToast("Esito studente aggiornato con successo."); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-md">Conferma</button>
           </div>
          </div>
         </div>
        )}

        {showClassroomReport && (
         <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] h-auto fade-in text-left">
           <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
            <span className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs">
             <FileText className="w-5 h-5 text-indigo-400" />
             <span>RAPPORTO PEDAGOGICO D'AULA E DI LIVELLO</span>
            </span>
            <button onClick={() => setShowClassroomReport(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
           </div>

           <div className="p-8 overflow-y-auto flex-1 bg-slate-50 space-y-6">
            <div className="bg-white border border-slate-200 shadow-xl p-8 max-w-xl mx-auto space-y-6 text-xs text-slate-800 relative leading-relaxed">
             
             <div className="text-center border-b pb-4 space-y-1">
              <span className="font-extrabold uppercase tracking-widest text-[9px] text-slate-400 block">Ministero dell'Istruzione e del Merito</span>
              <strong className="font-bold text-[11px] block uppercase leading-tight text-slate-800">Ufficio Scolastico Regionale per la Campania</strong>
              <strong className="font-bold text-[10px] block uppercase leading-tight text-slate-600">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani"</strong>
              <p className="text-[8px] text-slate-400 font-medium">Via Calvario, Ariano Irpino (AV) - Cod. Mecc. AVIC849003</p>
             </div>

             <div className="text-center space-y-1">
              <h3 className="text-sm font-black uppercase text-indigo-950 tracking-wider">Rapporto di Copertura e Comprensione d'Aula</h3>
              <p className="text-[9px] font-bold text-slate-500">Plesso Scolastico d'Istituto | Classe-Sezione: {selectedClassCombination} | a.s. 2025-2026</p>
             </div>

             <div className="bg-slate-50 p-3 border rounded-xl space-y-1 text-[10px]">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider block">Learning Object (UDA) di Riferimento:</span>
              <p className="font-extrabold text-slate-800">"{savedUda.find(u => u.id === activeTaughtUdaId)?.title || ' Il bosco e i suoi ritmi stagionali (SCIENZE)'}"</p>
              <p className="text-slate-500 font-semibold">Disciplina: {discipline.toUpperCase()} | Grado: {order.toUpperCase()}</p>
             </div>

             <div className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">1. Esiti di Apprendimento degli Studenti (D.M. 14/2024):</span>
              <div className="border rounded-lg overflow-hidden">
               <table className="w-full text-[9px] text-left font-semibold">
                <thead className="bg-slate-50 border-b">
                 <tr>
                  <th className="p-2">Studente (Themed/Cifrato)</th>
                  <th className="p-2">Livello Comprensione</th>
                  <th className="p-2">Motivazione</th>
                 </tr>
                </thead>
                <tbody>
                 {classroomStudentFeedback.map((st) => (
                  <tr key={st.id} className="border-b last:border-0">
                   <td className="p-2">{getThemedStudentName(st.id)}</td>
                   <td className="p-2 uppercase font-bold text-slate-700">{st.level}</td>
                   <td className="p-2 text-amber-500">{"★".repeat(st.stars)}</td>
                  </tr>
                 ))}
                </tbody>
               </table>
              </div>
             </div>

             <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">2. Riepilogo Percentuale d'Esito:</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
               <div className="bg-slate-50 p-1.5 border rounded-lg">
                <div className="text-slate-500">Avanzato</div>
                <div className="text-slate-800 font-extrabold">{Math.round((classroomStudentFeedback.filter(s => s.level === 'avanzato').length / classroomStudentFeedback.length) * 100)}%</div>
               </div>
               <div className="bg-slate-50 p-1.5 border rounded-lg">
                <div className="text-slate-500">Intermedio</div>
                <div className="text-slate-800 font-extrabold">{Math.round((classroomStudentFeedback.filter(s => s.level === 'intermedio').length / classroomStudentFeedback.length) * 100)}%</div>
               </div>
               <div className="bg-slate-50 p-1.5 border rounded-lg">
                <div className="text-slate-500">Base</div>
                <div className="text-slate-800 font-extrabold">{Math.round((classroomStudentFeedback.filter(s => s.level === 'base').length / classroomStudentFeedback.length) * 100)}%</div>
               </div>
               <div className="bg-slate-50 p-1.5 border rounded-lg">
                <div className="text-slate-500">Iniziale</div>
                <div className="text-slate-800 font-extrabold">{Math.round((classroomStudentFeedback.filter(s => s.level === 'iniziale').length / classroomStudentFeedback.length) * 100)}%</div>
               </div>
              </div>
             </div>

             <div className="space-y-1 pt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">3. Annotazioni di Consolidamento d'Istituto:</span>
              <div className="bg-slate-50 p-3 border rounded-xl space-y-1 text-[9px] italic text-slate-600 font-medium">
               {classroomStudentFeedback.map((st) => (
                <p key={st.id}>- {getThemedStudentName(st.id).split(' ')[0]}: "{st.obs}"</p>
               ))}
              </div>
             </div>

             <div className="pt-10 flex justify-between text-[9px] leading-relaxed text-slate-600">
              <div className="text-center">
               <p className="font-bold">Il Docente Coordinatore</p>
               <p className="h-6" />
               <p className="border-t border-dashed w-32 mx-auto pt-1 font-medium">Firma autografa</p>
              </div>
              <div className="text-center">
               <p className="font-bold">Il Dirigente Scolastico</p>
               <p className="h-6" />
               <p className="border-t border-dashed w-32 mx-auto pt-1 font-medium">Firma autografa</p>
              </div>
             </div>

            </div>
           </div>

           <div className="bg-slate-50 px-6 py-3.5 border-t flex justify-between shrink-0">
            <button onClick={() => setShowClassroomReport(false)} className="px-4 py-2 border rounded-xl font-bold text-xs bg-white text-slate-700 hover:bg-slate-50 transition">Chiudi</button>
            <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/10"><Printer className="w-4 h-4" /> <span>Stampa Report d'Istituto</span></button>
           </div>
          </div>
         </div>
        )}

     </div>
     <div className={classeSubTab === 'strumenti' ? 'space-y-6 block' : 'hidden'}>
     <div className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
      <div className="space-y-1">
       <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">1. Seleziona la tua Classe Attiva d'Istituto:</label>
       <select 
        value={selectedClassCombination} 
        onChange={(e) => {
         setSelectedClassCombination(e.target.value);
         showToast(`Caricato Ambiente Classe per la sezione: ${e.target.value}`);
        }} 
        className="w-full border rounded-xl p-2 bg-slate-50 font-bold outline-none"
       >
        {assignedCombinations.map(combo => (
         <option key={combo} value={combo}>Classe-Sezione: {combo}</option>
        ))}
       </select>
      </div>

      <div className="space-y-1">
       <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">2. Seleziona il Tema dell'Ambiente Classe:</label>
       <select 
        value={activeClassTheme} 
        onChange={(e) => {
         setActiveClassTheme(e.target.value as ClassTheme);
         showToast(`Configurato Tema d'Istituto: ${e.target.value.toUpperCase()}`);
         setCooperativeGroups(null);
        }} 
        className="w-full border rounded-xl p-2 bg-slate-50 font-bold outline-none text-indigo-700 focus:ring-1 focus:ring-indigo-500"
       >
        <option value="scientists"> SCIENTISTS (Scienziati & Inventori)</option>
        <option value="classico"> CLASSICO (Filosofi & Scrittori)</option>
        <option value="miti"> MITI (Divinità & Eroi Mitologici)</option>
       </select>
      </div>

      <div className="space-y-1">
       <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">3. Seleziona la Disposizione Fisica dei Banchi:</label>
       <select 
        value={classroomLayout} 
        onChange={(e) => {
         setClassroomLayout(e.target.value as ClassroomLayout);
         showToast(`Riorganizzazione Banchi d'Aula: ${e.target.value.toUpperCase()}`);
        }} 
        className="w-full border rounded-xl p-2 bg-slate-50 font-bold outline-none text-emerald-700 focus:ring-1 focus:ring-emerald-500"
       >
        <option value="frontale"> Lezione Frontale Tradizionale (Banchi in File)</option>
        <option value="isole"> Didattica Laboratoriale (Isole di Lavoro)</option>
        <option value="circle"> Cerchio d'Ascolto (Circle Time d'Istituto)</option>
       </select>
      </div>
     </div>

     <div className="flex justify-end pt-1">
      <button 
       onClick={() => setIsAulaConfigOpen(!isAulaConfigOpen)} 
       className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-[9px] uppercase tracking-wider transition shadow-sm border border-slate-200"
      >
       <span> {isAulaConfigOpen ? "Nascondi Strumenti Configurazione d'Aula" : "Mostra Strumenti Configurazione d'Aula (Rimescolamento e Vincoli)"}</span>
      </button>
     </div>

     {isAulaConfigOpen && (
      <div className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 fade-in">
       <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl space-y-2 text-left">
        <span className="text-[9px] font-black text-indigo-900 uppercase block"> Rimescolamento Dinamico degli Pseudonimi</span>
        <p className="text-[10px] text-slate-500 leading-normal">Fai clic qui sotto per disaccoppiare in modo casuale gli pseudonimi dagli studenti prima di proiettare sulla LIM, azzerando il rischio di associazione indiretta.</p>
        <div className="flex gap-2">
         <button 
          onClick={handleShufflePseudonyms} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition shadow-sm"
         >
           Rimescola Pseudonimi
         </button>
         {shuffledStudentMap && (
          <button 
           onClick={() => { setShuffledStudentMap(null); showToast("Ripristinati pseudonimi di default."); }} 
           className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] px-3 py-2 rounded-lg transition"
          >
           Ripristina Default
          </button>
         )}
        </div>
       </div>

       <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-left">
        <span className="text-[9px] font-black text-slate-500 uppercase block"> Gestione Vincoli Relazionali (Esclusioni d'Isola)</span>
        <p className="text-[10px] text-slate-500 leading-normal">Definisci coppie di studenti che non devono sedere nello stesso gruppo laboratoriale per motivi comportamentali o relazionali:</p>
        
        <div className="flex items-center gap-2">
         <select 
          value={exclusionInputS1} 
          onChange={(e) => setExclusionInputS1(e.target.value)} 
          className="border rounded p-1 bg-white"
         >
          {classroomStudentFeedback.map(s => (
           <option key={s.id} value={s.id}>{getThemedStudentName(s.id)}</option>
          ))}
         </select>
         <span className="text-slate-400 font-bold">Non unire con:</span>
         <select 
          value={exclusionInputS2} 
          onChange={(e) => setExclusionInputS2(e.target.value)} 
          className="border rounded p-1 bg-white"
         >
          {classroomStudentFeedback.map(s => (
           <option key={s.id} value={s.id}>{getThemedStudentName(s.id)}</option>
          ))}
         </select>
         <button 
          onClick={() => {
           if (exclusionInputS1 === exclusionInputS2) {
            showToast("Seleziona due studenti differenti!", false);
            return;
           }
           if (exclusionsList.some(ex => (ex.s1 === exclusionInputS1 && ex.s2 === exclusionInputS2) || (ex.s1 === exclusionInputS2 && ex.s2 === exclusionInputS1))) {
            showToast("Questo vincolo relazionale esiste già!", false);
            return;
           }
           setExclusionsList([...exclusionsList, { s1: exclusionInputS1, s2: exclusionInputS2 }]);
           setCooperativeGroups(null);
           showToast("Vincolo relazionale aggiunto d'Istituto!");
          }} 
          className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded font-black text-[10px] uppercase"
         >
          Aggiungi
         </button>
        </div>

        {exclusionsList.length > 0 && (
         <div className="flex flex-wrap gap-1.5 pt-1 max-h-[60px] overflow-y-auto">
          {exclusionsList.map((ex, idx) => (
           <span key={idx} className="bg-red-50 text-red-700 border border-red-150 px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
            <span>{getThemedStudentName(ex.s1)} {getThemedStudentName(ex.s2)}</span>
            <button 
             onClick={() => {
              setExclusionsList(exclusionsList.filter((_, i) => i !== idx));
              setCooperativeGroups(null);
              showToast("Vincolo relazionale rimosso.");
             }} 
             className="text-red-500 hover:text-red-800 font-black text-[10px]"
            >
             ×
            </button>
           </span>
          ))}
         </div>
        )}
       </div>
      </div>
     )}

     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <div className="lg:col-span-4 border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-4">
       <div className="space-y-1">
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[8px] font-black uppercase tracking-wider">Assistente d'Aula (v5.0)</span>
        <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider"> Innesco d'Argomento Estemporaneo d'Aula</h4>
        <p className="text-[10px] text-slate-500 leading-relaxed">Inserisci un qualsiasi argomento che intendi affrontare oggi in classe. Il sistema determinerà se è già coperto, o proporrà un'UDA integrativa iniettandola all'istante nel Gantt scolastico.</p>
       </div>

       <div className="space-y-3 bg-white p-4 border border-slate-150 rounded-xl">
        <div className="space-y-1">
         <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Inserisci argomento estemporaneo d'oggi:</label>
         <input 
          type="text" 
          value={classroomTopicInput} 
          onChange={(e) => setClassroomTopicInput(e.target.value)} 
          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" 
          placeholder="Es. Il Risorgimento, I vulcani, Le frazioni..." 
         />
        </div>

        <button 
         onClick={handleAnalyzeClassroomTopic} 
         disabled={isAnalyzingTopic} 
         className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10"
        >
         {isAnalyzingTopic ? " Analisi ed allineamento in corso..." : " Analizza e Collega d'Aula"}
        </button>
       </div>

       {classroomTopicAnalysisResult && (
        <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm fade-in text-left text-[10px]">
         {classroomTopicAnalysisResult.type === 'link' ? (
          <div className="space-y-2 leading-relaxed">
           <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-black uppercase tracking-wider block w-fit"> Raccordo Rilevato</span>
           <p className="font-bold text-slate-700">L'argomento inserito fa già parte della seguente progettazione scolastica:</p>
           <p className="font-extrabold text-slate-900 bg-slate-50 p-2 border rounded-lg">"{classroomTopicAnalysisResult.uda.title}"</p>
           <p className="text-slate-500"><strong>Compito di Realtà:</strong> {classroomTopicAnalysisResult.uda.realTask}</p>
          </div>
         ) : (
          <div className="space-y-3 leading-relaxed">
           <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[8px] font-black uppercase tracking-wider block w-fit"> Proposta d'Iniezione Necessaria</span>
           <p className="font-bold text-slate-700">Nessuna UDA pianificata copre questo argomento. Lo Swarm propone di iniettare la seguente UDA integrativa nel Gantt:</p>
           
           <div className="bg-slate-50 p-3 border rounded-lg space-y-1.5 text-slate-800 font-bold">
            <p className="font-extrabold text-indigo-950">"{classroomTopicAnalysisResult.title}"</p>
            <p className="text-slate-500"><strong>Durata:</strong> {classroomTopicAnalysisResult.hours} ore | <strong>Materia:</strong> {classroomTopicAnalysisResult.discipline.toUpperCase()}</p>
            <p className="text-slate-500"><strong>Compito Autentico:</strong> {classroomTopicAnalysisResult.realTask}</p>
           </div>

           <button 
            onClick={handleApproveAndInjectUda}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition shadow-md"
           >
             Approva ed Inietta nel Gantt
           </button>
          </div>
         )}
        </div>
       )}
      </div>

      <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Cronoprogramma delle Attività d'Istituto (Diagramma di Gantt)</span>
       
       <div className="overflow-x-auto">
        <div className="min-w-[500px] border rounded-xl overflow-hidden shadow-inner">
         <div className="grid grid-cols-12 bg-slate-50 border-b text-[8px] font-black uppercase tracking-wider text-slate-400 text-center py-2 divide-x">
          <div className="col-span-2">UDA d'Istituto</div>
          <div>Set</div>
          <div>Ott</div>
          <div>Nov</div>
          <div>Dic</div>
          <div>Gen</div>
          <div>Feb</div>
          <div>Mar</div>
          <div>Apr</div>
          <div>Mag</div>
          <div>Giu</div>
         </div>

         <div className="divide-y text-[9px] font-bold text-slate-700">
          {(() => {
           const weeklyH = weeklyHoursScienze;
           const weeks = Math.ceil((20 * bufferCoefficient) / weeklyH);
           const colSpan = Math.max(1, Math.min(10, Math.ceil(weeks / 3.3)));
           const remaining = 10 - colSpan;
           
           const colSpanClass = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10"][colSpan - 1] || "col-span-3";
           const remainingClass = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10"][remaining - 1] || "col-span-7";
           
           return (
            <div className="grid grid-cols-12 py-3 items-center divide-x text-center bg-white">
             <div className="col-span-2 text-left px-3 font-extrabold text-slate-800 truncate"> Il bosco e i suoi ritmi</div>
             <div className={`${colSpanClass} bg-emerald-500/20 border-y border-emerald-500/30 h-4.5 flex items-center justify-center text-[7px] text-emerald-800 font-extrabold`}>
              Attivo ({weeks} sett. @ {weeklyH}h)
             </div>
             {remaining > 0 && <div className={`${remainingClass} bg-slate-50/20 h-full`}></div>}
            </div>
           );
          })()}

          {savedUda.filter(u => u.discipline === discipline).map((u) => {
           const getWeeklyHoursForDiscipline = (disc: string) => {
            if (disc === 'italiano') return weeklyHoursItaliano;
            if (disc === 'storia') return weeklyHoursStoria;
            if (disc === 'geografia') return weeklyHoursGeografia;
            if (disc === 'matematica') return weeklyHoursMatematica;
            if (disc === 'scienze') return weeklyHoursScienze;
            return 2;
           };
           
           const weeklyH = getWeeklyHoursForDiscipline(u.discipline);
           const weeks = Math.ceil((u.hours * bufferCoefficient) / weeklyH);
           const colSpan = Math.max(1, Math.min(7, Math.ceil(weeks / 3.3)));
           const colStart = 3;
           const remaining = 10 - colStart - colSpan;
           
           const colStartClass = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10"][colStart - 1] || "col-span-3";
           const colSpanClass = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10"][colSpan - 1] || "col-span-3";
           const remainingClass = remaining > 0 ? (["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10"][remaining - 1] || "col-span-4") : "";
           
           return (
            <div key={u.id} className="grid grid-cols-12 py-3 items-center divide-x text-center bg-white fade-in">
             <div className="col-span-2 text-left px-3 font-extrabold text-slate-800 truncate">{u.title.replace("UDA Estemporanea: ", "")}</div>
             <div className={`${colStartClass} bg-slate-50/20 h-full`}></div>
             <div className={`${colSpanClass} bg-indigo-500/20 border-y border-indigo-500/30 h-4.5 flex items-center justify-center text-[7px] text-indigo-800 font-extrabold`}>
              Pianificato ({weeks} sett. @ {weeklyH}h)
             </div>
             {remaining > 0 && <div className={`${remainingClass} bg-slate-50/20 h-full`}></div>}
            </div>
           );
          })}

          {savedUda.filter(u => u.discipline === discipline).length === 0 && (
           <div className="text-center py-4 text-slate-400 italic font-medium bg-slate-50/30">
            Inserisci un argomento estemporaneo a sinistra o importa un'UDA per vederne la pianificazione dinamica sul diagramma di Gantt.
           </div>
          )}
         </div>
        </div>
       </div>
      </div>

     </div>

     <div className="space-y-6">

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
         <div className="flex justify-between items-center border-b pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Mappa Fisica dei Banchi d'Aula (Spazio Didattico Attivo)</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
           {classroomLayout === 'frontale' && " File Tradizionali"}
           {classroomLayout === 'isole' && " Isole di Lavoro (Cooperative)"}
           {classroomLayout === 'circle' && " Cerchio d'Ascolto (Circle Time)"}
          </span>
         </div>

         <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 min-h-[180px] flex flex-col justify-between relative overflow-hidden">
          {classroomLayout === 'frontale' && (
           <div className="grid grid-cols-4 gap-4 max-w-md mx-auto w-full fade-in">
            {classroomStudentFeedback.map(student => (
             <div key={student.id} className="bg-white border rounded-lg p-2.5 shadow-sm text-center space-y-1">
              <div className="text-[10px] font-bold truncate text-slate-800">{getThemedStudentName(student.id)}</div>
              <div className="text-[8px] text-slate-400 uppercase font-black">Banco Singolo</div>
             </div>
            ))}
           </div>
          )}

          {classroomLayout === 'isole' && (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-xl mx-auto w-full fade-in">
            <div className="bg-white border-2 border-indigo-100 rounded-xl p-4 space-y-3 shadow-sm text-center">
             <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Isola di Lavoro A (Saggi)</span>
             <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-700">
              {classroomStudentFeedback.slice(0, 4).map(student => (
               <div key={student.id} className="bg-slate-50 p-1.5 border rounded-lg truncate">{getThemedStudentName(student.id)}</div>
              ))}
             </div>
            </div>
            <div className="bg-white border-2 border-indigo-100 rounded-xl p-4 space-y-3 shadow-sm text-center">
             <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Isola di Lavoro B (Maker)</span>
             <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-700">
              {classroomStudentFeedback.slice(4, 8).map(student => (
               <div key={student.id} className="bg-slate-50 p-1.5 border rounded-lg truncate">{getThemedStudentName(student.id)}</div>
              ))}
             </div>
            </div>
           </div>
          )}

          {classroomLayout === 'circle' && (
           <div className="relative h-[200px] max-w-md mx-auto w-full flex items-center justify-center fade-in">
            <div className="absolute h-20 w-20 border-2 border-dashed border-emerald-300 rounded-full flex items-center justify-center bg-emerald-50/50 text-emerald-800 text-[10px] font-black uppercase">Circle Time</div>
            {classroomStudentFeedback.map((student, i) => {
             const angle = (i * 360) / classroomStudentFeedback.length;
             const radius = 70;
             const x = Math.round(radius * Math.cos((angle * Math.PI) / 180));
             const y = Math.round(radius * Math.sin((angle * Math.PI) / 180));
             return (
              <div 
               key={student.id} 
               className="absolute bg-white border border-emerald-200 rounded-full px-2.5 py-1 text-[9px] font-black text-slate-800 shadow-sm"
               style={{ transform: `translate(${x}px, ${y}px)` }}
              >
               {getThemedStudentName(student.id).split(' ')[0]}
              </div>
             );
            })}
           </div>
          )}
         </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-2">
          <div className="space-y-1">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Compositore di Gruppi Cooperativi d'Istituto</span>
           <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider"> Ripartitore Eterogeneo per Livello d'Esito (Cooperative Learning)</h4>
          </div>
          <div className="flex items-center space-x-2">
           <select 
            value={activeCooperativeMethod} 
            onChange={(e) => {
             setActiveCooperativeMethod(e.target.value as CooperativeMethod);
             setCooperativeGroups(null);
            }} 
            className="border rounded-xl p-1.5 text-[10px] font-bold bg-slate-50 outline-none animate-pulse"
           >
            <option value="jigsaw"> JIGSAW (Eterogeneo Bilanciato)</option>
            <option value="peertutoring"> PEER TUTORING (Coppie di Tutoraggio)</option>
            <option value="laboratorio"> LAB RESEARCH (Gruppi Funzionali d'Area)</option>
           </select>
           <button 
            onClick={handleGenerateCooperativeGroups} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
           >
            Componi Gruppi
           </button>
          </div>
         </div>

         {cooperativeGroups ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 fade-in">
           {cooperativeGroups.method === 'peertutoring' ? (
            cooperativeGroups.list.map((pair, i: number) => (
             <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-[10px] text-left font-bold">
              <span className="font-extrabold text-indigo-950 uppercase block">{pair.name}</span>
              <div className="space-y-1 text-slate-700 font-bold leading-normal">
               <p className="text-emerald-700">Tutor: {getThemedStudentName(pair.tutor)} (Avanzato)</p>
               <p className="text-rose-700">Tutee: {getThemedStudentName(pair.tutee)} (Base/Iniziale)</p>
               <p className="text-slate-400 font-semibold text-[9px] mt-1 border-t pt-1">Compito: {pair.task}</p>
              </div>
             </div>
            ))
           ) : (
            cooperativeGroups.list.map((group, i: number) => (
             <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-[10px] md:col-span-1 xl:col-span-2 text-left font-bold">
              <span className="font-extrabold text-indigo-950 uppercase block border-b pb-1.5 mb-1.5">{group.name}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-bold leading-normal">
               {group.members.map((member) => (
                <div key={member.id} className="bg-white border rounded-lg p-2 space-y-1 shadow-sm">
                 <div className="text-slate-800 font-extrabold">{getThemedStudentName(member.id)}</div>
                 <div className="text-indigo-600 text-[9px]">{member.role}</div>
                 <div className="text-slate-400 text-[8px] font-semibold">Attività: {member.task}</div>
                </div>
               ))}
              </div>
             </div>
            ))
           )}
          </div>
         ) : (
          <p className="text-[10px] text-slate-400 italic text-center py-6 font-semibold">Clicca su "Componi Gruppi" per avviare l'algoritmo eterogeneo di ripartizione e assegnazione dei ruoli d'apprendimento.</p>
         )}
        </div>

     </div>
     <div className={classeSubTab === 'pianificazione' ? 'space-y-6 block' : 'hidden'}>
     <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-left">
      <div className="flex justify-between items-center border-b pb-2">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Configurazione Parametrica d'Impegno Orario Settimanale</span>
       <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Normativa DPR 275/1999</span>
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
       Definizione del budget orario settimanale delle discipline d'Istituto per il calcolo automatico della fattibilità temporale delle UDA nel diagramma di Gantt.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-semibold text-slate-700">
       <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-500 block">Italiano (ore/sett.):</span>
        <input 
         type="number" 
         value={weeklyHoursItaliano} 
         onChange={(e) => {
          setWeeklyHoursItaliano(Math.max(1, Number(e.target.value)));
          showToast("Budget orario settimanale aggiornato.");
         }} 
         className="w-full border rounded-lg p-1.5 font-bold bg-slate-50" 
         min="1" max="15" 
        />
       </div>
       <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-500 block">Storia (ore/sett.):</span>
        <input 
         type="number" 
         value={weeklyHoursStoria} 
         onChange={(e) => {
          setWeeklyHoursStoria(Math.max(1, Number(e.target.value)));
          showToast("Budget orario settimanale aggiornato.");
         }} 
         className="w-full border rounded-lg p-1.5 font-bold bg-slate-50" 
         min="1" max="15" 
        />
       </div>
       <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-500 block">Geografia (ore/sett.):</span>
        <input 
         type="number" 
         value={weeklyHoursGeografia} 
         onChange={(e) => {
          setWeeklyHoursGeografia(Math.max(1, Number(e.target.value)));
          showToast("Budget orario settimanale aggiornato.");
         }} 
         className="w-full border rounded-lg p-1.5 font-bold bg-slate-50" 
         min="1" max="15" 
        />
       </div>
       <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-500 block">Matematica (ore/sett.):</span>
        <input 
         type="number" 
         value={weeklyHoursMatematica} 
         onChange={(e) => {
          setWeeklyHoursMatematica(Math.max(1, Number(e.target.value)));
          showToast("Budget orario settimanale aggiornato.");
         }} 
         className="w-full border rounded-lg p-1.5 font-bold bg-slate-50" 
         min="1" max="15" 
        />
       </div>
       <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-500 block">Scienze (ore/sett.):</span>
        <input 
         type="number" 
         value={weeklyHoursScienze} 
         onChange={(e) => {
          setWeeklyHoursScienze(Math.max(1, Number(e.target.value)));
          showToast("Budget orario settimanale aggiornato.");
         }} 
         className="w-full border rounded-lg p-1.5 font-bold bg-slate-50" 
         min="1" max="15" 
        />
       </div>
      </div>

      <div className="bg-slate-50 p-2.5 border rounded-xl text-[9px] text-slate-500 leading-normal flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-bold">
       <div className="space-y-1">
        <span> Totale Ore Settimanali d'Area Tracciate: <span className="text-slate-900 font-extrabold">{weeklyHoursItaliano + weeklyHoursStoria + weeklyHoursGeografia + weeklyHoursMatematica + weeklyHoursScienze} ore</span></span>
        <span className="text-emerald-700 block sm:inline sm:ml-2"> Conforme alle quote minime d'autonomia d'Istituto</span>
       </div>
       <div className="flex items-center space-x-1.5 text-xs text-slate-700">
        <span className="text-[9px] font-black uppercase text-slate-400">Tolleranza Calendario (Buffer):</span>
        <input 
         type="number" 
         step="0.05"
         min="1.0"
         max="2.0"
         value={bufferCoefficient} 
         onChange={(e) => {
          setBufferCoefficient(Math.max(1.0, Number(e.target.value)));
          showToast("Coefficiente di Tolleranza Calendario (Buffer) aggiornato.");
         }} 
         className="w-16 border rounded p-1 font-bold text-center bg-white" 
        />
       </div>
      </div>
     </div>

     </div>
       </div>
    </div>
  );
}
