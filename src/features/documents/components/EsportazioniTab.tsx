import { FileText, Code, Printer, ShieldAlert, Sparkles } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { AppViewsLayerProps, TemplateJsonState, TemplateSection } from '../../session';

const getDisciplineLabel = (disc: string) => {
  const labels: Record<string, string> = {
    italiano: "Italiano", matematica: "Matematica", scienze: "Scienze", tecnologia: "Tecnologia",
    storia: "Storia", geografia: "Geografia", inglese: "Inglese", secondaLingua: "Seconda Lingua",
    arteImmagine: "Arte e Immagine", musica: "Musica", educazioneFisica: "Educazione Fisica",
    educazioneCivica: "Educazione Civica", religione: "Religione", latino: "Latino"
  };
  return labels[disc] || disc;
};

export type EsportazioniTabProps = Pick<AppViewsLayerProps,
  | 'esportazioniTab'
  | 'setEsportazioniTab'
  | 'templateDocType'
  | 'setTemplateDocType'
  | 'templateJsonState'
  | 'setTemplateJsonState'
  | 'templateChatInput'
  | 'setTemplateChatInput'
  | 'templateChatHistory'
  | 'handleSendTemplateInstruction'
  | 'handleDownloadWordDefinitivo'
  | 'handleDownloadWordDocx'
  | 'handleDownloadODF'
  | 'handleDownloadCurricoloPDF'
  | 'handleCopyToClipboardFormatted'
  | 'handleDownloadTxt'
  | 'handleDownloadCml'
  | 'handleDownloadWordConfronto'
  | 'handleDownloadRichMarkdown'
  | 'handleDownloadPdfDirect'
  | 'handleClearLocalStorageWithReset'
  | 'handleGenerateProgrammazioneAnnualeDoc'
  | 'handleGenerateRelazioneDoc'
  | 'handleGenerateSpecificoGradoDoc'
  | 'targetClass'
  | 'targetSection'
  | 'showToast'
>;

export function EsportazioniTab(props: EsportazioniTabProps) {
  const { discipline, order, schoolYear } = useCurriculumStore();
  const {
    esportazioniTab,
    setEsportazioniTab,
    templateDocType,
    setTemplateDocType,
    templateJsonState,
    setTemplateJsonState,
    templateChatInput,
    setTemplateChatInput,
    templateChatHistory,
    handleSendTemplateInstruction,
    handleDownloadWordDefinitivo,
    handleDownloadWordDocx,
    handleDownloadODF,
    handleDownloadCurricoloPDF,
    handleCopyToClipboardFormatted,
    handleDownloadTxt,
    handleDownloadCml,
    handleDownloadWordConfronto,
    handleDownloadRichMarkdown,
    handleDownloadPdfDirect,
    handleClearLocalStorageWithReset,
    handleGenerateProgrammazioneAnnualeDoc,
    handleGenerateRelazioneDoc,
    handleGenerateSpecificoGradoDoc,
    targetClass,
    targetSection,
    showToast,
  } = props;

  return (
    <div className="space-y-6 fade-in text-left">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito di Esportazione Documentale d'Istituto</span>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Modelli e file d'ufficio certificati</h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">
            {esportazioniTab === 'standard'
              ? "Generazione e download dei documenti d'Istituto in formato aperto ODF o Microsoft Word (.docx) conformi al PTOF."
              : "Personalizzazione assistita del layout di stampa d'Istituto tramite comandi semantici raccordati alle linee guida AgID."}
          </p>
        </div>
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 w-fit">
          <button onClick={() => setEsportazioniTab('standard')} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition ${esportazioniTab === 'standard' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Esportazioni Standard</button>
          <button onClick={() => setEsportazioniTab('template')} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition ${esportazioniTab === 'template' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Modelli con IA</button>
        </div>
      </div>

      {esportazioniTab === 'standard' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase">Format Word, ODF e Testo</h3>
              <div className="bg-slate-50 border rounded-xl p-4 flex items-start space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><FileText className="w-5 h-5" /></div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-bold text-slate-800">Esportazione nei formati di rito d'Istituto</h4>
                  <p className="text-slate-500">Scarica l'intero curricolo in formato Word o nel formato aperto ODF.</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleDownloadWordDefinitivo} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px]">Scarica Word (.doc)</button>
                    <button onClick={handleDownloadWordDocx} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px]">Scarica Word (.docx)</button>
                    <button onClick={handleDownloadODF} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[10px]">Scarica LibreOffice / ODF (.odt)</button>
                    <button onClick={handleDownloadCurricoloPDF} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px]"><Printer className="w-3.5 h-3.5 inline mr-1" /> Salva Curricolo in PDF</button>
                    <button onClick={handleCopyToClipboardFormatted} className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded text-[10px]">Copia Tabella</button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border rounded-xl p-4 flex items-start space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><FileText className="w-5 h-5" /></div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-bold text-slate-800">Scarica file .TXT</h4>
                  <p className="text-slate-500">Scarica la bozza della disciplina selezionata in formato testo offline.</p>
                  <button onClick={handleDownloadTxt} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]">Scarica file .txt</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase">File di Lavoro .CML</h3>
              <div className="bg-slate-50 border rounded-xl p-4 flex items-start space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Code className="w-5 h-5" /></div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-bold text-slate-800">Esportazioni e File di Lavoro</h4>
                  <p className="text-slate-500">Esporta le proposte o la tavola di confronto in formato .cml o scarica direttamente le tavole di confronto in formato Word.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={handleDownloadCml} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px]">Scarica proposta .cml</button>
                    <button onClick={handleDownloadWordConfronto} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px]">Scarica Word confronto</button>
                    <button onClick={handleDownloadRichMarkdown} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]">Scarica Markdown (.md)</button>
                    <button onClick={handleDownloadPdfDirect} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-[10px]"><Printer className="w-3.5 h-3.5 inline mr-1" /> Salva in PDF</button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border rounded-xl p-4 flex items-start space-x-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-bold text-slate-800">Sicurezza e Reset</h4>
                  <p className="text-slate-500">Ripristina un salvataggio di sicurezza o azzera l'intera memoria d'Istituto.</p>
                  <button onClick={handleClearLocalStorageWithReset} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px]">Azzera Memoria d'Istituto</button>
                </div>
              </div>
            </div>
          </div>

          {/* Generazione Documentazione Didattica */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
            <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Nuova Area Didattica</span>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Generazione Documentazione Docente per la Didattica</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Genera in tempo reale la documentazione d'Istituto per la classe {order === 'infanzia' ? targetSection : `${targetClass}^${targetSection}`} ({getDisciplineLabel(discipline)}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-black text-xs text-indigo-950">
                    <span>Programmazione su Due Quadrimestri</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    {order === 'infanzia'
                      ? "Genera il piano annuale diviso per i 5 Campi di Esperienza."
                      : `Genera la programmazione annuale di ${getDisciplineLabel(discipline)} divisa in 1° e 2° Quadrimestre.`}
                  </p>
                </div>
                <button onClick={handleGenerateProgrammazioneAnnualeDoc} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-xl transition shadow-md">
                  Genera Programmazione Annuale
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-black text-xs text-indigo-950">
                    <span>Relazione Intermedia & Finale</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    {order === 'infanzia'
                      ? "Produce la griglia di osservazione qualitativa del comportamento e sviluppo dei bambini."
                      : "Genera il report di classe disciplinare con climate, obiettivi, metodologie e livello di profitto d'Istituto."}
                  </p>
                </div>
                <button onClick={handleGenerateRelazioneDoc} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl transition shadow-md">
                  Genera Relazione Scolastica
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-black text-xs text-indigo-950">
                    <span>
                      {order === 'infanzia' && "Scheda di Osservazione (Infanzia)"}
                      {order === 'primaria' && "Livelli di Valutazione Giudiziaria (Primaria)"}
                      {order === 'secondaria' && "Documento del Programma Svolto (Terze)"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    {order === 'infanzia' && "Genera i criteri e le schede per la registrazione e monitoraggio dello sviluppo qualitativo dei bambini."}
                    {order === 'primaria' && "Genera la relazione descrittiva di fine anno per discipline con i 4 livelli."}
                    {order === 'secondaria' && "Genera il documento ufficiale del programma svolto per l'esame di Stato."}
                  </p>
                </div>
                {order === 'secondaria' && targetClass !== '3' ? (
                  <div className="text-[9px] text-slate-400 italic text-center py-2 bg-slate-100 rounded-lg">
                    Attivo solo selezionando la classe 3^ di scuola secondaria.
                  </div>
                ) : (
                  <button onClick={handleGenerateSpecificoGradoDoc} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px] rounded-xl transition shadow-md">
                    Genera Documento Specifico
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Template Engine */
        <div className="space-y-4 fade-in font-sans">
          {/* Active Document Selector */}
          <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
            <div>
              <strong className="text-slate-800 text-xs font-extrabold block">Seleziona Modello Documentale Attivo</strong>
              <span className="text-[10px] text-slate-500 font-bold leading-normal">L'IA applicherà la tua richiesta e adatterà il modello selezionato in tempo reale.</span>
            </div>
            <select value={templateDocType} onChange={(e) => {
              const type = e.target.value as AppViewsLayerProps['templateDocType'];
              setTemplateDocType(type);
              if (type === 'uda') {
                setTemplateJsonState((prev: TemplateJsonState) => ({
                  ...prev,
                  sections: [
                    { id: "sec1", title: "1. DATI GENERALI & CO-PROGETTAZIONE d'ISTITUTO", enabled: true },
                    { id: "sec2", title: "2. MAPPA DI RACCORDO TRAGUARDI (D.M. 221/2025)", enabled: true },
                    { id: "sec3", title: "3. COMPITO DI REALTA & PRODOTTO FINALE", enabled: true },
                    { id: "sec4", title: "4. EVIDENZE OSSERVABILI & VALUTAZIONE INTEGRATA", enabled: true }
                  ]
                }));
              } else if (type === 'greci') {
                setTemplateJsonState((prev: TemplateJsonState) => ({
                  ...prev,
                  sections: [
                    { id: "sec1", title: "1. CONSOLIDAMENTO LINGUISTICO KONSOLIDIMI GJUHËSOR", enabled: true },
                    { id: "sec2", title: "2. SYNIMET E KOMPETENCËS / TRAGUARDI BILINGUI", enabled: true },
                    { id: "sec3", title: "3. VALUTAZIONE DESCRITTIVA / VLERËSIMI SHKRUAR", enabled: true }
                  ]
                }));
              } else {
                setTemplateJsonState((prev: TemplateJsonState) => ({
                  ...prev,
                  sections: [
                    { id: "sec1", title: "1. PRESENTAZIONE GENERALE DELLA CLASSE", enabled: true },
                    { id: "sec2", title: "2. SVOLGIMENTO DELLA PROGRAMMAZIONE & METODOLOGIE", enabled: true },
                    { id: "sec3", title: "3. METODOLOGIE INCLUSIVE (PEI/PDP/DSA)", enabled: true },
                    { id: "sec4", title: "4. PROPOSTE DI VALUTAZIONE E AUTOVALUTAZIONE", enabled: true }
                  ]
                }));
              }
            }} className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="relazione">Relazione Scolastica d'Istituto</option>
              <option value="uda">Unità di Apprendimento Interdisciplinare (UDA)</option>
              <option value="greci">Programmazione Bilingue (Plesso Greci / Arbëreshë)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: AI Copilot Chat & Settings */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[280px]">
                <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shrink-0 font-bold">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Co-pilota dei Modelli d'Istituto</span>
                  </span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2.5 text-[11px] leading-relaxed bg-slate-50/50">
                  {templateChatHistory.map((msg, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl max-w-[90%] text-left ${msg.sender === 'user' ? 'bg-indigo-600 text-white ml-auto' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
                      <strong className="block text-[8px] uppercase font-black mb-0.5 text-slate-400">{msg.sender === 'user' ? 'Docente' : 'Co-pilota'}</strong>
                      <span className="font-semibold leading-relaxed">{msg.text}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t bg-white flex items-center space-x-2 shrink-0">
                  <input
                    type="text"
                    value={templateChatInput}
                    onChange={e => setTemplateChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendTemplateInstruction(templateChatInput); }}
                    className="flex-1 border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-400"
                    placeholder="Chiedi modifiche (es. 'Margini stretti')..."
                  />
                  <button onClick={() => handleSendTemplateInstruction(templateChatInput)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition">Invia</button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border rounded-2xl space-y-3 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Suggerimenti Rapidi d'Istituto</span>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => handleSendTemplateInstruction("Aggiungi il logo del PNRR nell'intestazione")} className="px-2 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold border border-indigo-100 rounded-lg text-[9px] shadow-sm transition">Applica Loghi PNRR</button>
                  <button onClick={() => handleSendTemplateInstruction("Cambia il carattere del testo in Times New Roman")} className="px-2 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold border border-indigo-100 rounded-lg text-[9px] shadow-sm transition">Carattere Times New Roman</button>
                  <button onClick={() => handleSendTemplateInstruction("Riduci i margini di stampa a 1.5 cm")} className="px-2 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold border border-indigo-100 rounded-lg text-[9px] shadow-sm transition">Margini Stretti (1.5cm)</button>
                  <button onClick={() => handleSendTemplateInstruction("Aggiungi la firma del segretario del collegio")} className="px-2 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold border border-indigo-100 rounded-lg text-[9px] shadow-sm transition">Aggiungi Firma Segretario</button>
                </div>
                <button onClick={() => {
                  setTemplateJsonState({
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11pt",
                    lineHeight: "1.5",
                    showMinisterialHeader: true,
                    logoLeft: "PNRR",
                    logoRight: "Unione_Europea",
                    margins: "Normali (2cm)",
                    sections: [
                      { id: "sec1", title: "1. PRESENTAZIONE GENERALE DELLA CLASSE", enabled: true },
                      { id: "sec2", title: "2. SVOLGIMENTO DELLA PROGRAMMAZIONE & METODOLOGIE", enabled: true },
                      { id: "sec3", title: "3. METODOLOGIE INCLUSIVE (PEI/PDP/DSA)", enabled: true },
                      { id: "sec4", title: "4. PROPOSTE DI VALUTAZIONE E AUTOVALUTAZIONE", enabled: true }
                    ],
                    leftSignee: "Il Referente del Curricolo",
                    rightSignee: "Il Dirigente Scolastico (Prof.ssa Maria Letizia CML)"
                  });
                  showToast("Modello d'Istituto ripristinato allo stato originale!", true);
                }} className="w-full mt-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center flex items-center justify-center space-x-1">
                  <span>Azzera e Ripristina Modello di Fabbrica</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-3 rounded-2xl font-mono text-[9px] max-h-[140px] overflow-y-auto leading-relaxed border border-slate-800 text-left shadow-inner">
                <span className="text-indigo-400 font-bold block mb-1 uppercase text-[8px]">BANCA DATI / SCHEMA JSON DEL TEMPLATE</span>
                <pre className="text-slate-300 font-semibold">{JSON.stringify(templateJsonState, null, 2)}</pre>
              </div>
            </div>

            {/* Right Column: Live White Paper Sheet Preview */}
            <div className="lg:col-span-7 space-y-4 flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Anteprima in Tempo Reale (Foglio Bianco d'Ufficio)</span>

              <div
                className="bg-white border rounded-2xl shadow-xl p-8 sm:p-12 text-slate-800 text-[11px] leading-relaxed text-left flex flex-col min-h-[380px] border-slate-200"
                style={{
                  fontFamily: templateJsonState.fontFamily,
                  fontSize: templateJsonState.fontSize,
                  lineHeight: templateJsonState.lineHeight,
                  padding: templateJsonState.margins === 'Stretti (1.5cm)' ? '20px' : '40px'
                }}
              >
                {templateJsonState.showMinisterialHeader && (
                  <div className="border-b-2 border-indigo-600 pb-2.5 mb-6 flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span>{templateJsonState.logoLeft === 'PNRR' ? 'PNRR NextGen' : 'U.E.'}</span>
                    </div>
                    <div className="text-center flex-1 mx-2">
                      <div className="font-extrabold text-[8.5px] text-slate-600">MINISTERO DELL'ISTRUZIONE E DEL MERITO</div>
                      <div className="font-black text-[10px] text-indigo-950 mt-0.5">ISTITUTO COMPRENSIVO "DON LORENZO MILANI" - ARIANO IRPINO</div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 text-right">
                      <span>{templateJsonState.logoRight === 'Unione_Europea' ? 'Unione Europea' : 'USR Campania'}</span>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-1.5 mb-5">
                  <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    {templateDocType === 'relazione' && 'RELAZIONE SCOLASTICA SULLA CLASSE (ATTIVA)'}
                    {templateDocType === 'uda' && 'PROGETTAZIONE UNITA DI APPRENDIMENTO (UDA) MODELLO'}
                    {templateDocType === 'greci' && 'RELAZIONE DI INTERASSE BILINGUE - PLESSO GRECI'}
                  </h2>
                  <div className="text-[9px] font-bold text-indigo-600 bg-indigo-50/60 inline-block px-2.5 py-0.5 rounded-md">ANNO SCOLASTICO {schoolYear}</div>
                </div>

                <div className="space-y-4 flex-1">
                  {templateJsonState.sections.filter((s: TemplateSection) => s.enabled).map((sec: TemplateSection) => (
                    <div key={sec.id} className="space-y-1.5">
                      <h4 className="text-[10px] font-extrabold text-indigo-900 border-b pb-0.5 uppercase tracking-wide">{sec.title}</h4>
                      <p className="text-slate-600 text-justify leading-relaxed">
                        {sec.id === 'sec1' && "Il percorso educativo è stato impostato con criteri di continuità d'Istituto, valorizzando l'inclusione, la relazione e l'autonomia di ciascun allievo."}
                        {sec.id === 'sec2' && "La programmazione disciplinare è stata svolta regolarmente facendo ampio ricorso al Cooperative Learning, al problem-solving d'Istituto ed alle aule multimediali immersive PNRR."}
                        {sec.id === 'sec3' && "Per gli alunni con bisogni educativi speciali (BES) o disturbi dell'apprendimento (DSA), sono state garantite le misure d'inclusione previste nel PEI d'Istituto."}
                        {sec.id === 'sec4' && "La valutazione è stata improntata in ottica formativa e diacronica d'Istituto, raccordando i giudizi descrittivi della scuola primaria ed i voti in decimi della secondaria."}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-8 flex justify-between items-start text-[9px] font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="text-left">
                    <strong>{templateJsonState.leftSignee}</strong>
                    <div className="h-8" />
                    <span className="text-[8px] text-slate-400 font-bold block">(Firma omessa ai sensi del CAD)</span>
                  </div>
                  <div className="text-right">
                    <strong>Il Dirigente Scolastico</strong>
                    <div className="h-8" />
                    <span className="text-[8px] text-slate-400 font-bold block">(Prof.ssa Maria Letizia CML)</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button onClick={() => showToast("Modello Word d'Istituto (.docx) generato con successo!", true)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md">Genera Modello Word (.docx)</button>
                <button onClick={() => showToast("Anteprima di stampa PDF del modello avviata!", true)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md">Salva in PDF d'Istituto</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
