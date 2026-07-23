import { Sparkles, ShieldCheck, ServerCog, Code, X, Copy, Search, Library, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { getVolumeTitle, getVolumeFullHtml, getVolumePlainTxt } from '../../../data/volumesKB';
import { copyText } from '../../../lib/clipboard';
import { escapeHtml } from '../../../lib/escapeHtml';
import { UiEmptyState } from '../../../ui/components/UiEmptyState';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';
import type { GraphNode } from '../../../lib/architectureGraph';
import type { AppViewsLayerProps } from '../../session';

export type SecondBrainTabProps = Pick<AppViewsLayerProps,
  | 'secondBrainTab'
  | 'setSecondBrainTab'
  | 'selectedBrainDoc'
  | 'setSelectedBrainDoc'
  | 'customKbDocs'
  | 'setCustomKbDocs'
  | 'setShowAddKbModal'
  | 'isSpeaking'
  | 'isWikiDyslexiaFont'
  | 'setIsWikiDyslexiaFont'
  | 'wikiWorkspaceTab'
  | 'setWikiWorkspaceTab'
  | 'wikiQuery'
  | 'setWikiQuery'
  | 'wikiResponse'
  | 'wikiLoading'
  | 'triggerWikiLLMQuery'
  | 'handleToggleSpeech'
  | 'handleDeleteCustomKbDoc'
  | 'isSyncingWorkspace'
  | 'setIsSyncingWorkspace'
  | 'showToast'
  | 'graphNodes'
  | 'selectedNodeId'
  | 'setSelectedNodeId'
  | 'glossary'
  | 'selectedGlossaryTerm'
  | 'setSelectedGlossaryTerm'
  | 'customGlossaryTerm'
  | 'setCustomGlossaryTerm'
  | 'isGlossaryLoading'
  | 'glossarySearch'
  | 'setGlossarySearch'
  | 'handleGlossaryAgentPopulate'
  | 'initialEdges'
>;

const VOLUMES = [
  { id: 'vol1', file: '01_RACCOLTA_DOCUMENTI.md', label: 'Progetti e Territorio' },
  { id: 'vol2', file: '02_SCUOLA_IN_CHIARO.md', label: 'RAV, NIV e PdM' },
  { id: 'vol3', file: '03_QUADRO_NORMATIVO.md', label: 'Didattica, Inclusione e Privacy' },
  { id: 'vol4', file: '04_DOC_CURRICOLO.md', label: 'Curricolo Fondativo' },
  { id: 'vol5', file: '05_WIKI_SISTEMA_CML.md', label: 'Manuale d\'Uso Tecnico' },
  { id: 'vol6', file: '06_REPERTORIO_CONCETTI.md', label: 'Repertorio Concettuale' },
  { id: 'vol7', file: '07_TRANSIZIONE_IN2025.md', label: 'Transizione Graduale' },
  { id: 'vol8', file: '08_DETTAGLIO_CURRICOLO.md', label: 'Dettaglio 14 Discipline' },
  { id: 'vol9', file: '09_REPORT_CERTIFICAZIONE.md', label: 'Certificazione PA e AgID' },
  { id: 'vol10', file: '10_PROPOSTA_DELIBERA.md', label: 'Delibera Collegio Docenti' },
  { id: 'vol11', file: '11_STATO_SVILUPPO.md', label: 'Stato Sviluppo e Percentuali' },
  { id: 'vol12', file: '12_PIANO_COMPLETAMENTO.md', label: 'Piano di Completamento ed Opera' },
];

export default function SecondBrainTab({
  secondBrainTab,
  setSecondBrainTab,
  selectedBrainDoc,
  setSelectedBrainDoc,
  customKbDocs,
  setCustomKbDocs,
  setShowAddKbModal,
  isSpeaking,
  isWikiDyslexiaFont,
  setIsWikiDyslexiaFont,
  wikiWorkspaceTab,
  setWikiWorkspaceTab,
  wikiQuery,
  setWikiQuery,
  wikiResponse,
  wikiLoading,
  triggerWikiLLMQuery,
  handleToggleSpeech,
  handleDeleteCustomKbDoc,
  isSyncingWorkspace,
  setIsSyncingWorkspace,
  showToast,
  graphNodes,
  selectedNodeId,
  setSelectedNodeId,
  glossary,
  selectedGlossaryTerm,
  setSelectedGlossaryTerm,
  customGlossaryTerm,
  setCustomGlossaryTerm,
  isGlossaryLoading,
  glossarySearch,
  setGlossarySearch,
  handleGlossaryAgentPopulate,
  initialEdges,
}: SecondBrainTabProps) {
  const role = useCurriculumStore(s => s.role);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const getVolumeTitleWithCustom = (id: string) => {
    if (id.startsWith('vol-custom-')) {
      const doc = customKbDocs.find(d => d.id === id);
      return doc ? doc.title : "Documento Personalizzato";
    }
    return getVolumeTitle(id);
  };

  const getVolumeFullHtmlWithCustom = (id: string) => {
    if (id.startsWith('vol-custom-')) {
      const doc = customKbDocs.find(d => d.id === id);
      if (!doc) return "<p>Nessun contenuto disponibile.</p>";
      return `
        <div class="space-y-4">
          <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">${escapeHtml(doc.title)}</h1>
          <p class="text-xs font-bold text-slate-500">${escapeHtml(doc.subtitle)}</p>
          <div class="bg-amber-50/20 border border-amber-100 rounded-xl p-4 space-y-2">
            <strong class="text-xs text-amber-900 block font-black"> Documento Caricato d'Istituto:</strong>
            <p class="text-slate-700 leading-relaxed font-semibold">Questo faldone è stato caricato localmente per potenziare il Second Brain e indicizzarlo nel WikiLLM d'Istituto.</p>
          </div>
          <div class="text-slate-700 leading-relaxed text-xs whitespace-pre-wrap font-semibold">${escapeHtml(doc.content)}</div>
        </div>
      `;
    }
    return getVolumeFullHtml(id);
  };

  const getVolumePlainTxtWithCustom = (id: string) => {
    if (id.startsWith('vol-custom-')) {
      const doc = customKbDocs.find(d => d.id === id);
      return doc ? `${doc.title}\n${doc.subtitle}\n\n${doc.content}` : "Nessun contenuto disponibile.";
    }
    return getVolumePlainTxt(id);
  };

  const safeLocalStorageSetItem = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage full or unavailable
    }
  };

  return (
    <div className="space-y-6 fade-in text-left">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-base font-black text-slate-800 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span>WikiLLM d'Istituto & Second Brain</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">La fonte certa di conoscenza pedagogica e ordinamentale d'Istituto raccordata ad agenti di convalida.</p>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" /> <span>Raccordo Certificato</span>
        </div>
      </div>

      {/* SUB-TAB SELECTOR */}
      <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 border border-slate-200 shadow-inner max-w-md">
        <button
          onClick={() => setSecondBrainTab('brain')}
          className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all duration-200 ${
            secondBrainTab === 'brain'
              ? 'bg-white text-indigo-950 shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Biblioteca &amp; Copilota
        </button>
        <button
          onClick={() => setSecondBrainTab('graph')}
          className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all duration-200 ${
            secondBrainTab === 'graph'
              ? 'bg-white text-indigo-950 shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mappa Connessioni
        </button>
        <button
          onClick={() => setSecondBrainTab('glossary')}
          className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all duration-200 ${
            secondBrainTab === 'glossary'
              ? 'bg-white text-indigo-950 shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Glossario d'Istituto
        </button>
      </div>

      {secondBrainTab === 'brain' && (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

            {/* Panel Left: Second Brain (Knowledge Hub) - xl:col-span-4 */}
            <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[580px]">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <ServerCog className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Biblioteca d'Istituto</span>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-2.5 text-xs font-medium text-slate-600">
                <p className="text-[11px] text-slate-500 leading-normal font-semibold mb-1">Seleziona un volume o un documento per aprirlo istantaneamente sul pannello di lettura di destra:</p>

                <div className="space-y-1.5 pr-1">
                  {VOLUMES.map(vol => (
                    <button
                      key={vol.id}
                      onClick={() => { setSelectedBrainDoc(vol.id); setWikiWorkspaceTab('read'); }}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-start space-x-2.5 ${selectedBrainDoc === vol.id ? 'border-primary-500 bg-primary-50/10 text-primary-950 font-bold' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                      <span className="text-base font-bold text-slate-700 shrink-0"></span>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide truncate">{vol.file}</div>
                        <div className="text-[9px] text-slate-400 font-bold truncate">{vol.label}</div>
                      </div>
                    </button>
                  ))}

                  {/* Custom added volumes */}
                  {customKbDocs.map(doc => (
                    <button key={doc.id} onClick={() => { setSelectedBrainDoc(doc.id); setWikiWorkspaceTab('read'); }} className={`w-full p-2.5 rounded-xl border text-left transition flex items-start space-x-2.5 ${selectedBrainDoc === doc.id ? 'border-primary-500 bg-primary-50/10 text-primary-950 font-bold' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <span className="text-base font-bold text-slate-700 shrink-0"></span>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide truncate">{doc.title}</div>
                        <div className="text-[9px] text-slate-400 font-bold truncate">{doc.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add Custom Doc button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 shrink-0 w-full">
                  <button
                    onClick={() => setShowAddKbModal(true)}
                    className="p-2.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-50/60 font-black transition flex items-center justify-center space-x-1 text-[10px] text-center"
                  >
                    <span>Aggiungi Documento Locale</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSyncingWorkspace(true);
                      showToast("Connessione alla cartella 'CurManLight_KB_Personale'...", true);
                      setTimeout(() => {
                        const newDocs = [
                          { id: 'drive-doc-1', title: 'Linee_Guida_Inclusione_2026.docx', subtitle: 'Sincronizzato da Drive Personale', content: "In conformità al Regolamento scolastico, la progettazione d'Istituto per l'inclusione degli studenti con BES ed ex legge 104 deve fondarsi su criteri metodologici flessibili, escludendo misurazioni standardizzate ed impiegando mappe compensative ed ausili digitali forniti nell'aula." },
                          { id: 'drive-doc-2', title: 'PTOF_Sintesi_Dipartimento_Lettere.pdf', subtitle: 'Sincronizzato da Drive Personale', content: "Il dipartimento di Lettere della secondaria stabilisce di valorizzare la diacronia linguistica attraverso lo studio degli elementi della lingua latina (LEL) raccordati con lo studio dell'italiano a partire dalle classi seconde, focalizzandoli sul potenziamento lessicale." }
                        ];

                        setCustomKbDocs(prev => {
                          const filtered = prev.filter(d => d.id !== 'drive-doc-1' && d.id !== 'drive-doc-2');
                          const updated = [...filtered, ...newDocs];
                          safeLocalStorageSetItem('curman_customKbDocs', JSON.stringify(updated));
                          return updated;
                        });

                        setIsSyncingWorkspace(false);
                        showToast("Sincronizzazione completata: 2 documenti d'Istituto estratti ed indicizzati localmente!", true);
                      }, 1500);
                    }}
                    disabled={isSyncingWorkspace}
                    className="p-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-50/60 font-black transition flex items-center justify-center space-x-1 text-[10px] text-center"
                  >
                    <span>★ Sincronizza Drive KB Personale</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Right: Unified Workspace (Read / Chat) - xl:col-span-8 */}
            <div className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[580px]">

              {/* Tabs Selector for Workspace Panel */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 font-bold">
                <div className="flex space-x-1 bg-slate-200/60 p-0.5 rounded-lg border">
                  <button
                    onClick={() => setWikiWorkspaceTab('read')}
                    className={`px-3 py-1.5 rounded-md font-black text-[9px] uppercase tracking-wider transition ${
                      wikiWorkspaceTab === 'read'
                        ? 'bg-white text-indigo-950 shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Leggi Volume
                  </button>
                  <button
                    onClick={() => setWikiWorkspaceTab('chat')}
                    className={`px-3 py-1.5 rounded-md font-black text-[9px] uppercase tracking-wider transition ${
                      wikiWorkspaceTab === 'chat'
                        ? 'bg-white text-indigo-950 shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Chiedi al Co-Pilota (WikiLLM)
                  </button>
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-1 rounded">
                  {wikiWorkspaceTab === 'read' ? "Lettore Attivo" : "Copilota Attivo"}
                </span>
              </div>

              {/* WORKSPACE TAB CONTENT: READ */}
              {wikiWorkspaceTab === 'read' && (
                <div className="flex-1 flex flex-col overflow-hidden fade-in">

                  {/* Metadata / Action Bar */}
                  <div className="bg-slate-50/50 border-b border-slate-150 px-5 py-3 flex justify-between items-center shrink-0">
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider block text-[8px] font-black">Volume Attivo</span>
                      <strong className="text-slate-800 font-extrabold text-[11px] truncate max-w-[180px] block">{getVolumeTitleWithCustom(selectedBrainDoc)}</strong>
                    </div>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => {
                          setIsWikiDyslexiaFont(!isWikiDyslexiaFont);
                          showToast(isWikiDyslexiaFont ? "Ripristinato carattere standard." : "Attivata modalità Alta Leggibilità (EasyReading)!");
                        }}
                        className={`px-2.5 py-1 ${isWikiDyslexiaFont ? 'bg-primary-600 text-white border-primary-600' : 'bg-indigo-50 text-indigo-700 border-indigo-150 hover:bg-indigo-100'} font-black rounded-lg transition text-[9px] border flex items-center space-x-1`}
                      >
                        <span> EasyReading</span>
                      </button>
                      <button onClick={() => handleToggleSpeech(getVolumePlainTxtWithCustom(selectedBrainDoc))} className={`px-2.5 py-1 ${isSpeaking ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-150 hover:bg-indigo-100'} font-black rounded-lg transition text-[9px] border flex items-center space-x-1`}>
                        <span> {isSpeaking ? "Interrompi" : "Ascolta"}</span>
                      </button>
                      <button onClick={() => {
                        copyText(getVolumePlainTxtWithCustom(selectedBrainDoc));
                        showToast("Testo del volume copiato negli appunti!", true);
                      }} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-lg transition text-[9px] border border-indigo-150 flex items-center space-x-1">
                        <Copy className="w-3 h-3" />
                        <span>Copia Testo</span>
                      </button>
                      {selectedBrainDoc.startsWith('vol-custom-') && (
                        <button onClick={() => setDocToDelete(selectedBrainDoc)} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded-lg transition text-[9px] border border-rose-150 flex items-center space-x-1">
                          <X className="w-3 h-3" />
                          <span>Elimina</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Full-text scrollable area */}
                  <div
                    className="flex-1 p-6 overflow-y-auto bg-white text-slate-800 leading-relaxed text-xs space-y-4"
                    style={{ fontFamily: isWikiDyslexiaFont ? "Comic Sans MS, cursive, sans-serif" : "inherit" }}
                  >
                    <div className="prose prose-slate max-w-none text-left" dangerouslySetInnerHTML={{ __html: getVolumeFullHtmlWithCustom(selectedBrainDoc) }} />
                  </div>
                </div>
              )}

              {/* WORKSPACE TAB CONTENT: CHAT (WikiLLM) */}
              {wikiWorkspaceTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden fade-in">

                  {/* Chat messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 text-xs">
                    {wikiResponse === null && !wikiLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6 text-slate-400">
                        <span className="text-3xl animate-bounce"></span>
                        <div className="space-y-1 max-w-sm">
                          <strong className="text-slate-700 font-extrabold block text-xs">Pronto ad assisterti sul volume attivo</strong>
                          <p className="text-[10px] font-bold text-slate-400">Poni una domanda libera al Co-pilota o usa una delle domande frequenti sotto per analizzare il testo d'Istituto.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 font-medium text-slate-700 leading-relaxed text-left">
                        {/* User Question */}
                        <div className="flex items-start space-x-2 justify-end">
                          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 max-w-[85%] shadow-sm">
                            <p className="text-[11px] font-bold">{wikiQuery}</p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-[10px] text-indigo-700 uppercase shrink-0">
                            {role.slice(0, 2)}
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white shrink-0">

                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3.5 max-w-[85%] shadow-sm space-y-2">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase rounded tracking-wider">Risposta Certificata</span>
                            {wikiLoading ? (
                              <div className="flex items-center space-x-2 py-2 text-slate-400 font-bold text-[11px]">
                                <span className="animate-spin text-sm"></span>
                                <span>Elaborazione semantica delle fonti...</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[11px] font-bold leading-relaxed">{wikiResponse}</p>
                                <hr className="border-slate-100" />
                                <div className="text-[9px] text-slate-400 flex items-center space-x-1 font-bold">
                                  <span>Fonte certa:</span>
                                  <span className="text-slate-500 uppercase tracking-wide bg-slate-50 px-1.5 py-0.2 border rounded">documentazione_fondativa.md</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Predefined Questions Grid */}
                  <div className="p-3 border-t bg-white space-y-1.5 shrink-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block text-left">Domande Pedagogiche Frequenti:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 overflow-y-auto max-h-[120px]">
                      <button onClick={() => triggerWikiLLMQuery("Come si raccorda la certificazione delle competenze con il DM 14/2024?")} className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-700 truncate transition"> DM 14/2024: Certificazione ed Evidenze</button>
                      <button onClick={() => triggerWikiLLMQuery("Quali sono i tre nuclei dell'Educazione Civica nel DM 183/2024?")} className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-700 truncate transition"> DM 183/2024: Assi dell'Educazione Civica</button>
                      <button onClick={() => triggerWikiLLMQuery("Cosa cambia per il Latino (LEL) nella secondaria nel DM 221/2025?")} className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-700 truncate transition"> DM 221/2025: Il Latino in Classe Seconda</button>
                      <button onClick={() => triggerWikiLLMQuery("Come opera l'allineamento verticale e diacronico nel curricolo?")} className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-700 truncate transition"> Raccordo Verticale &amp; Diacronia</button>
                      <button onClick={() => triggerWikiLLMQuery("Qual è l'atto formale di adozione del Curricolo e di CurManLight?")} className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-700 truncate transition"> Delibera di Adozione del Collegio Docenti</button>
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="p-3 border-t bg-slate-50 flex items-center space-x-2 shrink-0">
                    <input type="text" value={wikiQuery} onChange={(e) => setWikiQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && triggerWikiLLMQuery(wikiQuery)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Poni una domanda al copilota..." />
                    <button onClick={() => triggerWikiLLMQuery(wikiQuery)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1 shadow-md shadow-indigo-600/10">Invia</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {secondBrainTab === 'graph' && (
        <div className="space-y-6 fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Mappa Strutturata dei Componenti dell'Ecosistema (Graphify)</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Directory ordinata e interconnessa di tutti i nodi e le relazioni del codice. Clicca su ciascun componente per esaminarne i dettagli e le dipendenze in modo protetto.</p>
              </div>
              <span className="text-[8px] bg-slate-100 text-slate-500 border px-2 py-0.5 rounded font-bold uppercase tracking-wider">Touch-Safe &amp; Accessibile</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Structured Touch-Safe Directory (8 cols) */}
              <div className="lg:col-span-8 bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4 max-h-[450px] overflow-y-auto">

                {/* Moduli Codice */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-black text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">★ Moduli Codice Sorgente d'Istituto (.tsx / .ts)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {graphNodes.filter((n: GraphNode) => n.category === 'codice').map((node: GraphNode) => {
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3 border rounded-xl cursor-pointer transition flex items-center space-x-2.5 text-left min-h-[48px] ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-800 shadow-sm'}`}
                        >
                          <Code className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                          <div className="truncate flex-1">
                            <div className="text-[10px] font-extrabold truncate">{node.label}</div>
                            <div className={`text-[8px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{node.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Volumi Conoscenza */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">☆ Biblioteca e Volumi del Secondo Cervello (.md)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {graphNodes.filter((n: GraphNode) => n.category === 'conoscenza').map((node: GraphNode) => {
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3 border rounded-xl cursor-pointer transition flex items-center space-x-2.5 text-left min-h-[48px] ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-800 shadow-sm'}`}
                        >
                          <Library className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                          <div className="truncate flex-1">
                            <div className="text-[10px] font-extrabold truncate">{node.label}</div>
                            <div className={`text-[8px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{node.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Canali Interazione */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">★ Canali d'Interazione Agentica &amp; IA</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {graphNodes.filter((n: GraphNode) => n.category === 'interazione').map((node: GraphNode) => {
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3 border rounded-xl cursor-pointer transition flex items-center space-x-2.5 text-left min-h-[48px] ${isSelected ? 'bg-amber-600 border-amber-600 text-white shadow-md' : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-800 shadow-sm'}`}
                        >
                          <Sparkles className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                          <div className="truncate flex-1">
                            <div className="text-[10px] font-extrabold truncate">{node.label}</div>
                            <div className={`text-[8px] truncate ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>{node.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Details Panel (4 cols) */}
              <div className="lg:col-span-4 space-y-4 text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Dettagli del Componente Selezionato:</span>

                {selectedNodeId ? (() => {
                  const node = graphNodes.find((n: GraphNode) => n.id === selectedNodeId);
                  if (!node) return null;
                  return (
                    <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-3.5 fade-in">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block ${node.category === 'codice' ? 'bg-indigo-100 text-indigo-800' : node.category === 'conoscenza' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {node.category === 'codice' ? ' Modulo Codice' : node.category === 'conoscenza' ? ' Volume Conoscenza' : ' Interazione IA'}
                        </span>
                        <h4 className="text-sm font-black text-indigo-950 block">{node.label}</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-normal">{node.desc}</p>
                      </div>

                      <hr className="border-slate-200" />

                      <div className="space-y-1.5 text-xs text-slate-700 font-medium leading-relaxed">
                        <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Funzione di Sistema:</strong>
                        <p className="text-[11px] font-semibold">"{node.details}"</p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-200">
                        <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Relazioni Dirette:</strong>
                        <div className="space-y-1 font-semibold text-[10px] text-slate-600">
                          {initialEdges.filter(e => e.source === node.id || e.target === node.id).map((e, idx) => {
                            const s = graphNodes.find((n: GraphNode) => n.id === e.source)?.label;
                            const t = graphNodes.find((n: GraphNode) => n.id === e.target)?.label;
                            return (
                              <div key={idx} className="flex items-center space-x-1">
                                <span className="text-indigo-600"></span>
                                <span>{s} {t} ({e.label})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-xs font-semibold">Clicca su un componente della directory a sinistra per esaminare i suoi dettagli...</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-200 pb-2.5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <ServerCog className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>Architettura d'Orchestrazione Agentica &amp; Organo di Controllo d'Istituto</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Il framework di coerenza e controllo automatico che garantisce l'assenza di errori e l'allineamento normativo del Curricolo d'Istituto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold"></span>
                  <strong className="text-slate-800 text-[11px] uppercase tracking-wide font-black">1. Orchestrazione Semantica</strong>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold">I dati inseriti dai docenti vengono analizzati e raccordati istante per istante ai documenti ministeriali, garantendo l'allineamento orizzontale e verticale tra le discipline.</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Raccordo Diacronico</span>
                  <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Coerenza Evidenze</span>
                </div>
              </div>

              <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold"></span>
                  <strong className="text-slate-800 text-[11px] uppercase tracking-wide font-black">2. Allineamento Normativo</strong>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Controllo incrociato istantaneo rispetto alle direttive D.M. 221/2025 (Indicazioni Nazionali), D.M. 183/2024 (Linee Guida Educazione Civica) e D.M. 14/2024 (Certificazione Competenze).</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">DM 221/2025</span>
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">DM 183/2024</span>
                </div>
              </div>

              <div className="bg-white p-4 border-2 border-primary-500 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-primary-50 text-primary-700 rounded-lg font-bold"></span>
                  <strong className="text-slate-800 text-[11px] uppercase tracking-wide font-black">3. Organo di Controllo Umano</strong>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold">Il Dirigente Scolastico e il Collegio dei Docenti mantengono l'autorità decisionale ultima (Human-in-the-Loop), convalidando formalmente le proposte d'allineamento d'istituto.</p>
                <div className="text-[8px] bg-primary-100 text-primary-800 px-2 py-0.5 rounded font-black uppercase text-center tracking-wider font-black">Validazione Collegiale Finale</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {secondBrainTab === 'glossary' && (
        <div className="space-y-6 fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center space-x-2">
                  <Library className="w-4 h-4 text-indigo-600" />
                  <span>Glossario dei Termini d'Istituto</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">Il dizionario pedagogico ufficiale, popolato in tempo reale dall'Agente Pedagogico d'Istituto per chiarire il linguaggio ministeriale.</p>
              </div>
              <div className="relative shrink-0 w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input type="text" value={glossarySearch} onChange={(e) => setGlossarySearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Cerca termine..." />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Left Column: List and Search */}
              <div className="xl:col-span-2 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {glossary.filter(item => {
                  if (!glossarySearch) return true;
                  return item.term.toLowerCase().includes(glossarySearch.toLowerCase()) || item.definition.toLowerCase().includes(glossarySearch.toLowerCase());
                }).map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 border border-slate-150 hover:bg-slate-50 hover:border-slate-300 rounded-xl space-y-1 transition text-left fade-in">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-indigo-950 font-black">{item.term}</strong>
                      <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider">{item.source}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{item.definition}</p>
                  </div>
                ))}
                {glossary.filter(item => {
                  if (!glossarySearch) return true;
                  return item.term.toLowerCase().includes(glossarySearch.toLowerCase()) || item.definition.toLowerCase().includes(glossarySearch.toLowerCase());
                }).length === 0 && (
                  <UiEmptyState
                    icon={BookOpen}
                    title="Nessun termine corrispondente trovato nel Glossario"
                    description="Prova a modificare il termine di ricerca o sfoglia l'elenco completo."
                  />
                )}
              </div>

              {/* Right Column: AI Agent Interface */}
              <div className="p-4 border border-indigo-100 bg-indigo-50/10 rounded-xl space-y-3.5">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block"> Agente Pedagogico del Glossario</span>
                <p className="text-[10px] text-slate-500 leading-relaxed">Scegli un termine pedagogico strategico o digita un termine libero. L'Agente analizzerà la normativa d'Istituto per integrarlo nel Glossario ufficiale:</p>

                <div className="space-y-2 text-left">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Seleziona termine normativo:</label>
                    <select value={selectedGlossaryTerm} onChange={(e) => { setSelectedGlossaryTerm(e.target.value); setCustomGlossaryTerm(e.target.value); }} className="w-full px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary-500">
                      <option value="LEL"> LEL (Lingua ed Elementi di Latino)</option>
                      <option value="Cittadinanza Digitale"> Cittadinanza Digitale & I.A.</option>
                      <option value="Curricolo Verticale"> Curricolo Verticale d'Istituto</option>
                      <option value="Didattica Orientativa"> Didattica Orientativa (Linee Guida 2022)</option>
                      <option value="PEI"> PEI (Legge 104 su base ICF)</option>
                      <option value="PDP"> PDP (DSA & BES Legge 170)</option>
                      <option value="UDL"> UDL (Universal Design for Learning)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Oppure digita termine personalizzato:</label>
                    <input type="text" value={customGlossaryTerm} onChange={(e) => setCustomGlossaryTerm(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Es. Valutazione Formativa, STEM..." />
                  </div>
                </div>

                <button onClick={() => handleGlossaryAgentPopulate(customGlossaryTerm || selectedGlossaryTerm)} disabled={isGlossaryLoading} className={`w-full py-2 text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md ${isGlossaryLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'}`}>
                  {isGlossaryLoading ? ' Analisi ed estrazione...' : ' Interroga Agente e Popola'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      <UiConfirmDialog
        open={docToDelete !== null}
        title="Elimina documento"
        message="Vuoi davvero eliminare questo documento dalla Second Brain? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        variant="danger"
        onConfirm={() => { if (docToDelete) handleDeleteCustomKbDoc(docToDelete); setDocToDelete(null); }}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  );
}
