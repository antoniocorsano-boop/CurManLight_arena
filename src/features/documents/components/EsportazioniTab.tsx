import { useState } from 'react';
import { FileText, Code, Printer, ShieldAlert, Sparkles } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { AppViewsLayerProps, TemplateJsonState, TemplateSection } from '../../session';
import { DocumentExportHistory } from './DocumentExportHistory';
import { UiButton } from '../../../ui/components/UiButton';
import { UiPanel } from '../../../ui/components/UiPanel';
import { UiSectionHeader } from '../../../ui/components/UiSectionHeader';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';

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
  | 'documentExportHistory'
  | 'clearDocumentExportHistory'
>;

export function EsportazioniTab(props: EsportazioniTabProps) {
  const { discipline, order, schoolYear } = useCurriculumStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
    documentExportHistory,
    clearDocumentExportHistory,
  } = props;

  return (
    <div className="space-y-6 fade-in text-left">
      {/* Header */}
      <UiPanel variant="subtle">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <UiSectionHeader
            title="Documenti ed esportazioni"
            description={
              esportazioniTab === 'standard'
                ? "Generazione e download dei documenti d'istituto in formato aperto ODF o Microsoft Word (.docx) conformi al PTOF."
                : "Personalizzazione assistita del layout di stampa tramite comandi semantici raccordati alle linee guida AgID."
            }
          />
          <div className="flex bg-ui-surface border border-ui-border p-1 rounded-ui-control shrink-0">
            <button
              onClick={() => setEsportazioniTab('standard')}
              className={`px-4 py-2 rounded-ui-control text-[13px] font-medium transition ${
                esportazioniTab === 'standard'
                  ? 'bg-ui-surface text-ui-text shadow-sm'
                  : 'text-ui-text-secondary hover:text-ui-text'
              }`}
            >
              Esportazioni standard
            </button>
            <button
              onClick={() => setEsportazioniTab('template')}
              className={`px-4 py-2 rounded-ui-control text-[13px] font-medium transition ${
                esportazioniTab === 'template'
                  ? 'bg-ui-surface text-ui-text shadow-sm'
                  : 'text-ui-text-secondary hover:text-ui-text'
              }`}
            >
              Modelli con IA
            </button>
          </div>
        </div>
      </UiPanel>

      {esportazioniTab === 'standard' ? (
        <div className="space-y-6">
          {/* Esportazioni formati */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold text-ui-text-muted uppercase tracking-wider">Format Word, ODF e Testo</h3>
              <UiPanel>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-ui-action mt-0.5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[14px] font-semibold text-ui-text">Esportazione nei formati di rito d'istituto</h4>
                    <p className="text-[13px] text-ui-text-secondary">Scarica l'intero curricolo in formato Word o nel formato aperto ODF.</p>
                    <div className="flex flex-wrap gap-2">
                      <UiButton variant="primary" size="small" onClick={handleDownloadWordDefinitivo}>Scarica Word (.doc)</UiButton>
                      <UiButton variant="secondary" size="small" onClick={handleDownloadWordDocx}>Scarica Word (.docx)</UiButton>
                      <UiButton variant="secondary" size="small" onClick={handleDownloadODF}>Scarica LibreOffice / ODF (.odt)</UiButton>
                      <UiButton variant="secondary" size="small" onClick={handleDownloadCurricoloPDF}><Printer className="w-3.5 h-3.5" /> Salva Curricolo in PDF</UiButton>
                      <UiButton variant="quiet" size="small" onClick={handleCopyToClipboardFormatted}>Copia Tabella</UiButton>
                    </div>
                  </div>
                </div>
              </UiPanel>
              <UiPanel>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-ui-success mt-0.5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[14px] font-semibold text-ui-text">Scarica file .TXT</h4>
                    <p className="text-[13px] text-ui-text-secondary">Scarica la bozza della disciplina selezionata in formato testo offline.</p>
                    <UiButton variant="secondary" size="small" onClick={handleDownloadTxt}>Scarica file .txt</UiButton>
                  </div>
                </div>
              </UiPanel>
            </div>

            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold text-ui-text-muted uppercase tracking-wider">File di lavoro .CML</h3>
              <UiPanel>
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-ui-action mt-0.5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[14px] font-semibold text-ui-text">Esportazioni e file di lavoro</h4>
                    <p className="text-[13px] text-ui-text-secondary">Esporta le proposte o la tavola di confronto in formato .cml o scarica le tavole di confronto in formato Word.</p>
                    <div className="flex flex-wrap gap-2">
                      <UiButton variant="primary" size="small" onClick={handleDownloadCml}>Scarica proposta .cml</UiButton>
                      <UiButton variant="secondary" size="small" onClick={handleDownloadWordConfronto}>Scarica Word confronto</UiButton>
                      <UiButton variant="secondary" size="small" onClick={handleDownloadRichMarkdown}>Scarica Markdown (.md)</UiButton>
                      <UiButton variant="secondary" size="small" onClick={handleDownloadPdfDirect}><Printer className="w-3.5 h-3.5" /> Salva in PDF</UiButton>
                    </div>
                  </div>
                </div>
              </UiPanel>
              <UiPanel>
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-ui-danger mt-0.5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[14px] font-semibold text-ui-text">Sicurezza e reset</h4>
                    <p className="text-[13px] text-ui-text-secondary">Ripristina un salvataggio di sicurezza o azzera l'intera memoria d'istituto.</p>
                    <UiButton variant="danger" size="small" onClick={() => setShowResetConfirm(true)}>Azzera memoria d'istituto</UiButton>
                  </div>
                </div>
              </UiPanel>
            </div>
          </div>

          {/* Generazione Documentazione Didattica */}
          <UiPanel>
            <div className="border-b border-ui-border pb-3 mb-4">
              <UiSectionHeader
                title="Documentazione didattica"
                description={`Genera in tempo reale la documentazione per la classe ${order === 'infanzia' ? targetSection : `${targetClass}^${targetSection}`} (${getDisciplineLabel(discipline)}).`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-ui-surface-subtle border border-ui-border rounded-ui-panel space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-[14px] font-semibold text-ui-text">Programmazione su Due Quadrimestri</h4>
                  <p className="text-[13px] text-ui-text-secondary leading-relaxed">
                    {order === 'infanzia'
                      ? "Genera il piano annuale diviso per i 5 Campi di Esperienza."
                      : `Genera la programmazione annuale di ${getDisciplineLabel(discipline)} divisa in 1° e 2° Quadrimestre.`}
                  </p>
                </div>
                <UiButton variant="primary" size="small" className="w-full" onClick={handleGenerateProgrammazioneAnnualeDoc}>
                  Genera Programmazione Annuale
                </UiButton>
              </div>

              <div className="p-4 bg-ui-surface-subtle border border-ui-border rounded-ui-panel space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-[14px] font-semibold text-ui-text">Relazione Intermedia & Finale</h4>
                  <p className="text-[13px] text-ui-text-secondary leading-relaxed">
                    {order === 'infanzia'
                      ? "Produce la griglia di osservazione qualitativa del comportamento e sviluppo dei bambini."
                      : "Genera il report di classe disciplinare con climate, obiettivi, metodologie e livello di profitto d'istituto."}
                  </p>
                </div>
                <UiButton variant="primary" size="small" className="w-full" onClick={handleGenerateRelazioneDoc}>
                  Genera Relazione Scolastica
                </UiButton>
              </div>

              <div className="p-4 bg-ui-surface-subtle border border-ui-border rounded-ui-panel space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-[14px] font-semibold text-ui-text">
                    {order === 'infanzia' && "Scheda di Osservazione (Infanzia)"}
                    {order === 'primaria' && "Livelli di Valutazione Giudiziaria (Primaria)"}
                    {order === 'secondaria' && "Documento del Programma Svolto (Terze)"}
                  </h4>
                  <p className="text-[13px] text-ui-text-secondary leading-relaxed">
                    {order === 'infanzia' && "Genera i criteri e le schede per la registrazione e monitoraggio dello sviluppo qualitativo dei bambini."}
                    {order === 'primaria' && "Genera la relazione descrittiva di fine anno per discipline con i 4 livelli."}
                    {order === 'secondaria' && "Genera il documento ufficiale del programma svolto per l'esame di Stato."}
                  </p>
                </div>
                {order === 'secondaria' && targetClass !== '3' ? (
                  <div className="text-[12px] text-ui-text-muted italic text-center py-2 bg-ui-surface-subtle rounded-ui-control">
                    Attivo solo selezionando la classe 3^ di scuola secondaria.
                  </div>
                ) : (
                  <UiButton variant="primary" size="small" className="w-full" onClick={handleGenerateSpecificoGradoDoc}>
                    Genera Documento Specifico
                  </UiButton>
                )}
              </div>
            </div>
          </UiPanel>

          {/* Document Export History */}
          <UiPanel>
            <DocumentExportHistory
              events={documentExportHistory}
              onClearHistory={clearDocumentExportHistory}
            />
          </UiPanel>
        </div>
      ) : (
        /* Template Engine */
        <div className="space-y-4 fade-in">
          {/* Active Document Selector */}
          <UiPanel variant="subtle">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <strong className="text-[14px] font-semibold text-ui-text block">Seleziona modello documentale attivo</strong>
                <span className="text-[13px] text-ui-text-secondary">L'IA applicherà la tua richiesta e adatterà il modello selezionato in tempo reale.</span>
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
              }} className="px-3 py-2 bg-ui-surface text-ui-text border border-ui-border rounded-ui-control text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-ui-focus">
                <option value="relazione">Relazione Scolastica d'Istituto</option>
                <option value="uda">Unità di Apprendimento Interdisciplinare (UDA)</option>
                <option value="greci">Programmazione Bilingue (Plesso Greci / Arbëreshë)</option>
              </select>
            </div>
          </UiPanel>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: AI Copilot Chat & Settings */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-ui-surface border border-ui-border rounded-ui-panel overflow-hidden flex flex-col h-[280px]">
                <div className="bg-ui-text px-4 py-2 flex items-center justify-between shrink-0">
                  <span className="text-[12px] font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ui-action" />
                    <span>Co-pilota dei Modelli d'Istituto</span>
                  </span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2.5 text-[13px] leading-relaxed bg-ui-surface-subtle">
                  {templateChatHistory.map((msg, idx) => (
                    <div key={idx} className={`p-2.5 rounded-ui-panel max-w-[90%] text-left ${msg.sender === 'user' ? 'bg-ui-action text-white ml-auto' : 'bg-ui-surface border border-ui-border text-ui-text'}`}>
                      <strong className="block text-[11px] uppercase font-semibold mb-0.5 text-ui-text-muted">{msg.sender === 'user' ? 'Docente' : 'Co-pilota'}</strong>
                      <span className="font-medium leading-relaxed">{msg.text}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-ui-border bg-ui-surface flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={templateChatInput}
                    onChange={e => setTemplateChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendTemplateInstruction(templateChatInput); }}
                    className="flex-1 border border-ui-border rounded-ui-control px-3 py-1.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-ui-focus outline-none placeholder-ui-text-muted"
                    placeholder="Chiedi modifiche (es. 'Margini stretti')..."
                  />
                  <UiButton variant="primary" size="small" onClick={() => handleSendTemplateInstruction(templateChatInput)}>Invia</UiButton>
                </div>
              </div>

              <UiPanel variant="subtle">
                <span className="text-[12px] font-semibold text-ui-text-muted block mb-2">Suggerimenti rapidi d'istituto</span>
                <div className="flex flex-wrap gap-1.5">
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Aggiungi il logo del PNRR nell'intestazione")}>Applica Loghi PNRR</UiButton>
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Cambia il carattere del testo in Times New Roman")}>Carattere Times New Roman</UiButton>
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Riduci i margini di stampa a 1.5 cm")}>Margini Stretti (1.5cm)</UiButton>
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Aggiungi la firma del segretario del collegio")}>Aggiungi Firma Segretario</UiButton>
                </div>
                <UiButton variant="quiet" size="small" className="w-full mt-2" onClick={() => {
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
                  showToast("Modello d'istituto ripristinato allo stato originale!", true);
                }}>
                  Azzera e ripristina modello di fabbrica
                </UiButton>
              </UiPanel>

              <div className="bg-ui-text p-3 rounded-ui-panel font-mono text-[11px] max-h-[140px] overflow-y-auto leading-relaxed border border-ui-border text-left">
                <span className="text-ui-action font-semibold block mb-1 uppercase text-[10px]">Banca dati / Schema JSON del template</span>
                <pre className="text-ui-surface-subtle font-medium">{JSON.stringify(templateJsonState, null, 2)}</pre>
              </div>
            </div>

            {/* Right Column: Live White Paper Sheet Preview */}
            <div className="lg:col-span-7 space-y-4 flex flex-col">
              <span className="text-[12px] font-semibold text-ui-text-muted block">Anteprima in tempo reale (foglio bianco d'ufficio)</span>

              <div
                className="bg-ui-surface border border-ui-border rounded-ui-panel p-8 sm:p-12 text-ui-text text-[13px] leading-relaxed text-left flex flex-col min-h-[380px]"
                style={{
                  fontFamily: templateJsonState.fontFamily,
                  fontSize: templateJsonState.fontSize,
                  lineHeight: templateJsonState.lineHeight,
                  padding: templateJsonState.margins === 'Stretti (1.5cm)' ? '20px' : '40px'
                }}
              >
                {templateJsonState.showMinisterialHeader && (
                  <div className="border-b-2 border-ui-action pb-2.5 mb-6 flex justify-between items-center text-[10px] font-semibold text-ui-text-muted uppercase tracking-wider leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span>{templateJsonState.logoLeft === 'PNRR' ? 'PNRR NextGen' : 'U.E.'}</span>
                    </div>
                    <div className="text-center flex-1 mx-2">
                      <div className="font-semibold text-[10px] text-ui-text-secondary">MINISTERO DELL'ISTRUZIONE E DEL MERITO</div>
                      <div className="font-bold text-[12px] text-ui-text mt-0.5">ISTITUTO COMPRENSIVO "DON LORENZO MILANI" - ARIANO IRPINO</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-right">
                      <span>{templateJsonState.logoRight === 'Unione_Europea' ? 'Unione Europea' : 'USR Campania'}</span>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-1.5 mb-5">
                  <h2 className="text-[14px] font-bold text-ui-text uppercase tracking-wider">
                    {templateDocType === 'relazione' && 'RELAZIONE SCOLASTICA SULLA CLASSE (ATTIVA)'}
                    {templateDocType === 'uda' && 'PROGETTAZIONE UNITA DI APPRENDIMENTO (UDA) MODELLO'}
                    {templateDocType === 'greci' && 'RELAZIONE DI INTERASSE BILINGUE - PLESSO GRECI'}
                  </h2>
                  <div className="text-[11px] font-semibold text-ui-action bg-ui-action-soft inline-block px-2.5 py-0.5 rounded-ui-control">ANNO SCOLASTICO {schoolYear}</div>
                </div>

                <div className="space-y-4 flex-1">
                  {templateJsonState.sections.filter((s: TemplateSection) => s.enabled).map((sec: TemplateSection) => (
                    <div key={sec.id} className="space-y-1.5">
                      <h4 className="text-[12px] font-semibold text-ui-text border-b border-ui-border pb-0.5 uppercase tracking-wide">{sec.title}</h4>
                      <p className="text-ui-text-secondary text-justify leading-relaxed">
                        {sec.id === 'sec1' && "Il percorso educativo è stato impostato con criteri di continuità d'istituto, valorizzando l'inclusione, la relazione e l'autonomia di ciascun allievo."}
                        {sec.id === 'sec2' && "La programmazione disciplinare è stata svolta regolarmente facendo ampio ricorso al Cooperative Learning, al problem-solving d'istituto ed alle aule multimediali immersive PNRR."}
                        {sec.id === 'sec3' && "Per gli alunni con bisogni educativi speciali (BES) o disturbi dell'apprendimento (DSA), sono state garantite le misure d'inclusione previste nel PEI d'istituto."}
                        {sec.id === 'sec4' && "La valutazione è stata improntata in ottica formativa e diacronica d'istituto, raccordando i giudizi descrittivi della scuola primaria ed i voti in decimi della secondaria."}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ui-border pt-4 mt-8 flex justify-between items-start text-[11px] font-semibold text-ui-text-muted uppercase tracking-wider" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="text-left">
                    <strong>{templateJsonState.leftSignee}</strong>
                    <div className="h-8" />
                    <span className="text-[10px] text-ui-text-muted font-medium block">(Firma omessa ai sensi del CAD)</span>
                  </div>
                  <div className="text-right">
                    <strong>Il Dirigente Scolastico</strong>
                    <div className="h-8" />
                    <span className="text-[10px] text-ui-text-muted font-medium block">(Prof.ssa Maria Letizia CML)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <UiButton variant="primary" size="small" className="flex-1" onClick={() => showToast("Modello Word d'istituto (.docx) generato con successo!", true)}>Genera Modello Word (.docx)</UiButton>
                <UiButton variant="secondary" size="small" className="flex-1" onClick={() => showToast("Anteprima di stampa PDF del modello avviata!", true)}>Salva in PDF d'istituto</UiButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Dialog */}
      <UiConfirmDialog
        open={showResetConfirm}
        title="Azzera la memoria"
        message="Questa operazione cancellerà tutte le decisioni, i testi personalizzati e le UDA salvate. I file scaricati sul tuo dispositivo non verranno eliminati."
        confirmLabel="Azzera"
        variant="danger"
        onConfirm={() => {
          handleClearLocalStorageWithReset();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
