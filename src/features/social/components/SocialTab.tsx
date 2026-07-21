import type { AppViewsLayerProps, SocialUda } from '../../session';

export type SocialTabProps = Pick<AppViewsLayerProps,
  | 'selectedClassCombination'
  | 'setSelectedClassCombination'
  | 'classroomStudents'
  | 'assignedCombinations'
  | 'showToast'
  | 'socialUdas'
  | 'newAnnotationInputs'
  | 'setNewAnnotationInputs'
  | 'handleLikeUda'
  | 'handleReuseUda'
  | 'updateSocialUdas'
  | 'setSelectedUdaForOutcomes'
  | 'setShowOutcomesModal'
  | 'handleAddAnnotation'
>;

export function SocialTab({
  selectedClassCombination,
  setSelectedClassCombination,
  classroomStudents,
  assignedCombinations,
  showToast,
  socialUdas,
  newAnnotationInputs,
  setNewAnnotationInputs,
  handleLikeUda,
  handleReuseUda,
  updateSocialUdas,
  setSelectedUdaForOutcomes,
  setShowOutcomesModal,
  handleAddAnnotation,
}: SocialTabProps) {
  return (
    <div className="space-y-6 fade-in text-left">
                   {/* Dynamic Contextual Header Panel */}
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
         <div className="space-y-6">
          {socialUdas.map(u => {
           const annotText = newAnnotationInputs[u.id] || "";
           
           // Calculate OSI Dynamically based on outcomes, self-eval and reuse
           const selfEvalScore = (u.selfEvaluation || 4) * 10; // Max 50
           const advancedScore = (u.studentOutcomes?.avanzato || 50) * 0.5; // Max 50
           const intermediateScore = (u.studentOutcomes?.intermedio || 30) * 0.3; // Max 30
           const reuseScore = (u.reusedCount || 5) * 1.5; // Max 20
           const calculatedOsi = Math.min(100, Math.max(10, Math.round(selfEvalScore + advancedScore + intermediateScore + reuseScore)));

           let osiBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
           let osiStatusLabel = "In Corso di Consolidamento";
           if (calculatedOsi >= 85) {
            osiBadgeColor = "bg-emerald-50 border-emerald-200 text-emerald-800";
            osiStatusLabel = " Eccellenza d'Istituto (Consigliata per il Riuso)";
           } else if (calculatedOsi >= 65) {
            osiBadgeColor = "bg-indigo-50 border-indigo-200 text-indigo-800";
            osiStatusLabel = " Alto Impatto Didattico";
           }

           return (
            <div key={u.id} className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm transition space-y-4 flex flex-col text-xs leading-relaxed">
             
             {/* Header area of Shared UDA with outcomes score */}
             <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b pb-3.5">
              <div className="space-y-1.5 flex-1 text-left">
               <div className="flex flex-wrap items-center gap-1.5 font-bold">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] rounded uppercase tracking-wider">{u.discipline.toUpperCase()} · {u.order.toUpperCase()}</span>
                <span className="text-slate-400 text-[10px]">Autore: <span className="text-slate-600 font-black">{u.author}</span></span>
               </div>
               <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{u.title}</h4>
               <div className={`inline-flex items-center space-x-1.5 border rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${osiBadgeColor}`}>
                <span>Indice d'Esito (OSI): {calculatedOsi}%</span>
                <span>·</span>
                <span>{osiStatusLabel}</span>
               </div>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 self-end sm:self-center justify-end">
               <button 
                onClick={() => handleLikeUda(u.id)} 
                className={`px-2.5 py-1.5 rounded-xl border flex items-center space-x-1.5 font-extrabold text-[10px] transition ${
                 u.likedByMe ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
               >
                <span></span> <span>{u.likes} Preferiti</span>
               </button>
               <button 
                onClick={() => {
                 setSelectedUdaForOutcomes(u);
                 setShowOutcomesModal(true);
                }} 
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl transition border border-indigo-200"
               >
                 Registra Esiti
               </button>
               <button 
                onClick={() => {
                 // Increment reuse count
                 const newList = socialUdas.map(item => {
                  if (item.id === u.id) {
                   return { ...item, reusedCount: (item.reusedCount || 0) + 1 };
                  }
                  return item;
                 });
                 updateSocialUdas(newList);
                 handleReuseUda(u);
                }} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/10"
               >
                 <span>Riusa ed Importa</span>
               </button>
              </div>
             </div>

             {/* Content Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-600 font-semibold leading-relaxed">
              <div className="space-y-3.5">
               <div>
                <strong className="text-slate-400 uppercase text-[8px] tracking-wider block mb-1">Traguardi d'Istituto Associati:</strong>
                <ul className="list-disc pl-4 space-y-1">
                 {u.traguardi.map((t: string, i: number) => <li key={i}>{t}</li>)}
                </ul>
               </div>
               <div>
                <strong className="text-slate-400 uppercase text-[8px] tracking-wider block mb-1">Obiettivi di Apprendimento:</strong>
                <ul className="list-disc pl-4 space-y-1">
                 {u.obiettivi.map((ob: string, i: number) => <li key={i}>{ob}</li>)}
                </ul>
               </div>
               <div className="pt-2 border-t">
                <strong className="text-slate-400 uppercase text-[8px] tracking-wider block mb-1"> Esiti Didattici degli Studenti d'Aula (%):</strong>
                <div className="grid grid-cols-4 gap-2 text-center mt-1 text-[10px]">
                 <div className="bg-emerald-50 p-1.5 border border-emerald-100 rounded-lg">
                  <div className="font-bold text-emerald-800">Avanzato</div>
                  <div className="font-extrabold text-slate-800 text-xs">{u.studentOutcomes?.avanzato || 50}%</div>
                 </div>
                 <div className="bg-blue-50 p-1.5 border border-blue-100 rounded-lg">
                  <div className="font-bold text-blue-800">Intermedio</div>
                  <div className="font-extrabold text-slate-800 text-xs">{u.studentOutcomes?.intermedio || 30}%</div>
                 </div>
                 <div className="bg-amber-50 p-1.5 border border-amber-100 rounded-lg">
                  <div className="font-bold text-amber-800">Base</div>
                  <div className="font-extrabold text-slate-800 text-xs">{u.studentOutcomes?.base || 15}%</div>
                 </div>
                 <div className="bg-rose-50 p-1.5 border border-rose-100 rounded-lg">
                  <div className="font-bold text-rose-800">Iniziale</div>
                  <div className="font-extrabold text-slate-800 text-xs">{u.studentOutcomes?.iniziale || 5}%</div>
                 </div>
                </div>
               </div>
              </div>
              
              <div className="space-y-2 bg-slate-50 p-4 border rounded-xl flex flex-col justify-between">
               <div className="space-y-2">
                <p><strong>Compito di Realtà d'Istituto:</strong> <span className="text-slate-700 italic font-bold">"{u.realTask}"</span></p>
                <p><strong>Ore totali:</strong> {u.hours} ore | <strong>Periodo d'aula:</strong> {u.period}</p>
                <p><strong>Dettagli didattici:</strong> {u.notes}</p>
               </div>
               <div className="pt-2 border-t flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Punteggio Autovalutazione Docente:</span>
                <span className="text-amber-500 font-extrabold text-xs">{"★".repeat(u.selfEvaluation || 4)}{"☆".repeat(5 - (u.selfEvaluation || 4))}</span>
               </div>
               <div className="text-[10px] text-slate-400 font-medium">
                 Questa UDA è stata **clonata e riutilizzata {u.reusedCount || 5} volte** da altri docenti del plesso.
               </div>
              </div>
             </div>

             {/* Annotations / Comments Section (Lessons Learned) */}
             <div className="border-t border-slate-150 pt-4 space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block"> Annotazioni d'Istituto per Lessons Learned & Miglioramento:</span>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
               {u.annotations && u.annotations.length > 0 ? u.annotations.map((ann: SocialUda['annotations'][number], i: number) => (
                <div key={i} className="bg-slate-50 p-2.5 border rounded-xl space-y-1">
                 <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <span> Collega: <span className="text-slate-600">{ann.author}</span></span>
                  <span>Approvato d'Istituto</span>
                 </div>
                 <p className="text-slate-700 font-medium italic">"{ann.text}"</p>
                </div>
               )) : (
                <p className="text-[10px] text-slate-400 italic font-medium">Ancora nessuna annotazione o lesson learned registrata per questa UDA. Inserisci la tua opinione o consiglio didattico qui sotto per migliorarla!</p>
               )}
              </div>

              {/* Add Annotation Form */}
              <div className="flex items-center space-x-2 pt-1">
               <input 
                type="text" 
                value={annotText} 
                onChange={(e) => setNewAnnotationInputs({ ...newAnnotationInputs, [u.id]: e.target.value })} 
                className="border border-slate-200 rounded-xl p-2 text-xs font-bold flex-1 outline-none focus:ring-1 focus:ring-indigo-500" 
                placeholder="Aggiungi una lesson learned o consiglio per il riuso..." 
               />
               <button 
                onClick={() => handleAddAnnotation(u.id)} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
               >
                Invia
               </button>
              </div>
             </div>

            </div>
           );
          })}
         </div>
        </div>
  );
}
