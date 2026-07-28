import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { EuropeanKeyCompetencies, getDisciplineKeyCompetencies } from '../../../lib/competencies';
import type { AppViewsLayerProps } from '../../session';
import { getA04InstitutionalRead } from '../../../domain/institution';
import { useCurriculumStore } from '../../../store/useCurriculumStore';

export type CertificazioneTabProps = Pick<AppViewsLayerProps,
  | 'localCurriculum'
  | 'selectedEvidenze'
  | 'activeCompetencyExplorer'
  | 'setActiveCompetencyExplorer'
  | 'showToast'
  | 'handleLoadSuggestedUda'
  | 'getDisciplineIcon'
  | 'getDisciplineLabel'
> & {
  discipline: string;
  selectedTraguardi: number[];
};

export function CertificazioneTab({
  localCurriculum,
  discipline,
  selectedTraguardi,
  selectedEvidenze,
  activeCompetencyExplorer,
  setActiveCompetencyExplorer,
  showToast,
  handleLoadSuggestedUda,
  getDisciplineIcon,
  getDisciplineLabel,
}: CertificazioneTabProps) {
  const institutionalArchive = useCurriculumStore(state => state.institutionalArchive);
  const order = useCurriculumStore(state => state.order);
  const institutionalRead = getA04InstitutionalRead(institutionalArchive, order);

  const exportMatrix = () => {
    let text = `${institutionalRead.instituteName} - MATRICE DI LAVORO NON VALIDATA\n`;
    if (institutionalRead.mechanicalCode) text += `Codice Meccanografico: ${institutionalRead.mechanicalCode}\n`;
    if (institutionalRead.academicYearLabel) text += `Anno scolastico: ${institutionalRead.academicYearLabel}\n`;
    if (institutionalRead.order) text += `Ordine: ${institutionalRead.order}\n`;
    if (institutionalRead.orderWarning) text += `Avviso ordine: ${institutionalRead.orderWarning}\n`;
    if (institutionalRead.siteName) text += `Sede: ${institutionalRead.siteName}\n`;
    if (!institutionalRead.configured) text += 'Modalita: PERSONALE - nessuna intestazione istituzionale\n';
    text += `Generato il: ${new Date().toLocaleDateString('it-IT')}\nStato: controllo automatico locale, non validato e privo di autorità formale\n\n`;

    EuropeanKeyCompetencies.forEach(kc => {
      text += `${kc.id}. ${kc.label.toUpperCase()}\n`;
      text += `Definizione: ${kc.desc}\n`;
      text += `Disciplina selezionata: ${getDisciplineLabel(discipline).toUpperCase()} (corrispondenza automatica non verificata)\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      showToast("Matrice di lavoro non validata copiata negli appunti.");
    });
  };

  return (
    <div className="space-y-6 fade-in text-left">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-3">
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">D.M. 14/2024 &amp; Raccomandazione UE 2018</span>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center space-x-2">
              <span>Matrice locale di lavoro sulle competenze</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Questa vista confronta automaticamente i traguardi disponibili con le competenze europee. Il risultato è locale, non validato e non costituisce certificazione.</p>
          </div>
          <button onClick={exportMatrix} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] shadow-sm flex items-center space-x-1.5">
            <Copy className="w-3.5 h-3.5" />
             <span>Copia matrice di lavoro</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Seleziona una competenza per consultare la matrice locale:</span>
          <div className="space-y-2">
            {EuropeanKeyCompetencies.map(kc => {
              const isExpanded = activeCompetencyExplorer === kc.id;
              return (
                <div key={kc.id} className={`border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-primary-400 ring-2 ring-primary-500/5 bg-white' : 'border-slate-200 bg-slate-50/30'}`}>
                  <button onClick={() => setActiveCompetencyExplorer(isExpanded ? null : kc.id)} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800">
                    <span className="flex items-center space-x-2.5">
                      <span className="bg-slate-100 border text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded">{kc.id}</span>
                      <span className="font-extrabold text-slate-800 truncate">{kc.label}</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-150 bg-white space-y-4 text-xs font-medium text-slate-600 leading-relaxed text-left">
                      <div className="space-y-1">
                        <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Definizione Europea</strong>
                        <p className="text-slate-700 font-semibold">{kc.desc}</p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Corrispondenze automatiche non verificate</strong>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.keys(localCurriculum).filter(discKey => getDisciplineKeyCompetencies(discKey).includes(kc.id)).map(discKey => (
                            <span key={discKey} className="bg-slate-100 border text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {getDisciplineIcon(discKey)} {getDisciplineLabel(discKey)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <strong className="text-slate-400 uppercase text-[9px] tracking-wide block mb-2">Rubrica Nazionale dei Livelli di Padronanza (DM 14/2024)</strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 bg-slate-50 border rounded-lg"><span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase block w-max mb-1">A - Avanzato (9-10)</span><p className="text-slate-600 font-medium">Svolge compiti complessi in situazioni non note, compie scelte consapevoli in autonomia d'opinione.</p></div>
                          <div className="p-2.5 bg-slate-50 border rounded-lg"><span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase block w-max mb-1">B - Intermedio (7-8)</span><p className="text-slate-600 font-medium">Risolve problemi e svolge compiti in situazioni nuove in modo autonomo.</p></div>
                          <div className="p-2.5 bg-slate-50 border rounded-lg"><span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase block w-max mb-1">C - Base (6)</span><p className="text-slate-600 font-medium">Applica regole e procedure fondamentali in compiti semplici in contesti noti.</p></div>
                          <div className="p-2.5 bg-slate-50 border rounded-lg"><span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase block w-max mb-1">D - Iniziale (4-5)</span><p className="text-slate-600 font-medium">Se opportunamente guidato, svolge compiti semplici in contesti noti.</p></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
          <div>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Controllo automatico locale</span>
            <h3 className="text-xs font-bold text-slate-800">Confronto UDA non validato</h3>
          </div>

          <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block text-left">Stato delle Selezioni UDA:</span>
            <div className="text-[11px] space-y-1 text-slate-600 leading-normal font-medium text-left">
              <p><strong>Disciplina attiva:</strong> {getDisciplineLabel(discipline).toUpperCase()}</p>
              <p><strong>Traguardi selezionati:</strong> {selectedTraguardi.length}</p>
              <p><strong>Evidenze associate:</strong> {selectedEvidenze.length}</p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Corrispondenze rilevate automaticamente:</span>
            <div className="space-y-2.5">
              {EuropeanKeyCompetencies.map(kc => {
                const isActivatedByDiscipline = getDisciplineKeyCompetencies(discipline).includes(kc.id);
                const hasSelections = selectedTraguardi.length > 0 || selectedEvidenze.length > 0;
                const isActive = isActivatedByDiscipline && hasSelections;
                return (
                  <div key={kc.id} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-slate-700 flex items-center space-x-1.5"><span>{kc.id} - {kc.label}</span></span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>{isActive ? 'Corrispondenza locale' : 'Non rilevata'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-400 w-full' : 'bg-slate-200 w-0'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl space-y-3.5 text-left">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Esito automatico non validato:</span>
              <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                {selectedTraguardi.length === 0
                  ? "Seleziona almeno un traguardo per eseguire un confronto automatico locale."
                  : `Il controllo automatico locale rileva corrispondenze strutturali per ${getDisciplineLabel(discipline).toUpperCase()} con: ${getDisciplineKeyCompetencies(discipline).join(', ')}. Il risultato non è una validazione formale e deve essere verificato dall'utente.`}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-indigo-100/50">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider block">Esempi UDA locali per questa area:</span>
              <div className="space-y-1.5">
                {discipline === 'tecnologia' && <><button onClick={() => handleLoadSuggestedUda('smart-home')} className="w-full text-left p-2 bg-white hover:bg-slate-50 border rounded-lg text-[10px] font-bold text-slate-700 block transition">UDA: Progettiamo una Smart Home con il CAD 3D (Blender)</button><button onClick={() => handleLoadSuggestedUda('etica-ia')} className="w-full text-left p-2 bg-white hover:bg-slate-50 border rounded-lg text-[10px] font-bold text-slate-700 block transition">UDA: Etica e Algoritmi: l'impatto dell'I.A. (Innovaclass PNRR)</button></>}
                {discipline === 'italiano' && <><button onClick={() => handleLoadSuggestedUda('corsivo')} className="w-full text-left p-2 bg-white hover:bg-slate-50 border rounded-lg text-[10px] font-bold text-slate-700 block transition">UDA: Il corsivo come espressione ed apprendimento</button><button onClick={() => handleLoadSuggestedUda('barbiana')} className="w-full text-left p-2 bg-white hover:bg-slate-50 border rounded-lg text-[10px] font-bold text-slate-700 block transition">UDA: Il viaggio di Barbiana (Scrittura Collettiva)</button></>}
                {discipline === 'latino' && <button onClick={() => handleLoadSuggestedUda('etimologia-latino')} className="w-full text-left p-2 bg-white hover:bg-slate-50 border rounded-lg text-[10px] font-bold text-slate-700 block transition">UDA: Archeologia delle parole: l'etimologia come palestra logica</button>}
                {discipline !== 'tecnologia' && discipline !== 'italiano' && discipline !== 'latino' && <div className="text-[10px] text-slate-400 italic">Nessun'UDA d'esempio caricata in archivio per questa disciplina. Puoi compilarne una da zero nel Progettatore!</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
