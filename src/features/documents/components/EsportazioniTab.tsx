import { useState } from 'react';
import { FileText, Code, Printer, ShieldAlert, Sparkles } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { AppViewsLayerProps, TemplateJsonState, TemplateSection } from '../../session';
import { executeA04ToA07DocumentTransfer } from '../../../domain/documents/contracts';
import { DocumentExportHistory } from './DocumentExportHistory';
import { CanonicalDocumentTab } from './CanonicalDocumentTab';
import { UiButton } from '../../../ui/components/UiButton';
import { UiPanel } from '../../../ui/components/UiPanel';
import { UiSectionHeader } from '../../../ui/components/UiSectionHeader';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';
import { projectA07InstitutionalDocumentHeader } from '../../../domain/institution';

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
  | 'institutionalProfile'
  | 'resetTemplateState'
>;

export function EsportazioniTab(props: EsportazioniTabProps) {
  const { discipline, order, savedUda, documentArchive, replaceDocumentArchive } = useCurriculumStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedCanonicalUdaId, setSelectedCanonicalUdaId] = useState('');
  const [canonicalMessage, setCanonicalMessage] = useState<string | null>(null);
  const [selectedCanonicalDocumentId, setSelectedCanonicalDocumentId] = useState<string | null>(null);
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
    institutionalProfile,
    resetTemplateState,
  } = props;
  const institutionalProjection = projectA07InstitutionalDocumentHeader(institutionalProfile);
  const bilingualSiteLabel = institutionalProfile.siteName || 'Sede non configurata';

  function handleCreateCanonicalDocument() {
    if (!selectedCanonicalUdaId) {
      setCanonicalMessage('Seleziona una progettazione prima di creare il documento.');
      return;
    }

    const selectedUda = savedUda.find((item) => item.id === selectedCanonicalUdaId);
    if (!selectedUda) {
      setCanonicalMessage('La progettazione selezionata non è più disponibile.');
      return;
    }

    const existingTitle = `Progettazione: ${selectedUda.id}`;
    const latestArchive = useCurriculumStore.getState().documentArchive;
    if (latestArchive.documents.some((doc) => doc.title === existingTitle)) {
      setCanonicalMessage('Documento già presente');
      return;
    }

    const institutionalContext = {
      instituteName: institutionalProfile.instituteName || 'Istituto non configurato',
      ...(institutionalProfile.mechanicalCode ? { mechanicalCode: institutionalProfile.mechanicalCode } : {}),
      ...(institutionalProfile.siteName ? { siteName: institutionalProfile.siteName } : {}),
      ...(institutionalProfile.academicYearLabel ? { academicYearLabel: institutionalProfile.academicYearLabel } : {}),
      ...(institutionalProfile.declaredRole ? { declaredRole: institutionalProfile.declaredRole } : {}),
      ...(institutionalProfile.configured !== undefined ? { configured: institutionalProfile.configured } : {}),
    };

    const result = executeA04ToA07DocumentTransfer({
      designId: selectedUda.id,
      curriculumRefs: [selectedUda.id],
      sources: [selectedUda.title, selectedUda.realTask ?? ''].filter(Boolean),
      institutionalContext,
      teachingStructure: {
        title: selectedUda.title,
        discipline: selectedUda.discipline,
        order: selectedUda.order,
        period: selectedUda.period,
        hours: selectedUda.hours,
        status: selectedUda.status,
        realTask: selectedUda.realTask,
        notes: selectedUda.notes,
        traguardi: selectedUda.traguardi ?? [],
        obiettivi: selectedUda.obiettivi ?? [],
        evidenze: selectedUda.evidenze ?? [],
      },
      assistedContentOrigin: 'teacher',
      versionOrSnapshot: 'v1',
      warnings: [],
      metadata: { sessionTimestamp: new Date().toISOString() },
    }, documentArchive);

    if (result.status === 'completed') {
      replaceDocumentArchive(result.archive);
      setCanonicalMessage(`Documento creato per ${selectedUda.title}`);
      const createdDoc = result.archive.documents.find((doc) => doc.title === `Progettazione: ${selectedUda.id}`);
      if (createdDoc) {
        setSelectedCanonicalDocumentId(createdDoc.id);
      }
      return;
    }

    setCanonicalMessage(result.errors[0]?.message ?? 'Impossibile creare il documento.');
  }

  return (
    <div className="space-y-6 fade-in text-left">
      {/* Header */}
      <UiPanel variant="subtle">
        <div className="flex justify-end">
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

      {institutionalProfile.warning && (
        <div role="status" className="rounded-ui-panel border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-900">
          {institutionalProfile.warning} Puoi comunque esportare in modalità personale o dimostrativa.
        </div>
      )}

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
                    <h4 className="text-[14px] font-semibold text-ui-text">Esportazione nei formati disponibili</h4>
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
                    <p className="text-[13px] text-ui-text-secondary">Ripristina un salvataggio di sicurezza o azzera la memoria locale.</p>
                    <UiButton variant="danger" size="small" onClick={() => setShowResetConfirm(true)}>Azzera memoria locale</UiButton>
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
                      : "Genera il report locale di classe con clima, obiettivi, metodologie e livello di profitto."}
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
                    {order === 'secondaria' && "Genera il documento del programma svolto per l'esame di Stato."}
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
                      { id: "sec1", title: "1. DATI GENERALI & CO-PROGETTAZIONE LOCALE", enabled: true },
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
                <option value="relazione">Relazione scolastica locale</option>
                <option value="uda">Unità di Apprendimento Interdisciplinare (UDA)</option>
                <option value="greci">Programmazione bilingue - {bilingualSiteLabel}</option>
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
                    <span>Co-pilota dei modelli locali</span>
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
                <span className="text-[12px] font-semibold text-ui-text-muted block mb-2">Suggerimenti rapidi</span>
                <div className="flex flex-wrap gap-1.5">
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Cambia il carattere del testo in Times New Roman")}>Carattere Times New Roman</UiButton>
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Riduci i margini di stampa a 1.5 cm")}>Margini Stretti (1.5cm)</UiButton>
                  <UiButton variant="secondary" size="small" onClick={() => handleSendTemplateInstruction("Nascondi intestazione")}>Nascondi intestazione</UiButton>
                </div>
                <UiButton variant="quiet" size="small" className="w-full mt-2" onClick={resetTemplateState}>
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
                  <div className="border-b-2 border-ui-action pb-2.5 mb-6 text-center text-[10px] text-ui-text-muted leading-tight space-y-1">
                    {institutionalProjection.primaryHeading && <div className="font-semibold">{institutionalProjection.primaryHeading}</div>}
                    <div className="font-bold text-[12px] text-ui-text">{institutionalProjection.displayName}</div>
                    {institutionalProjection.secondaryLines.map(line => <div key={line}>{line}</div>)}
                  </div>
                )}

                <div className="text-center space-y-1.5 mb-5">
                  <h2 className="text-[14px] font-bold text-ui-text uppercase tracking-wider">
                    {templateDocType === 'relazione' && 'RELAZIONE SCOLASTICA SULLA CLASSE (ATTIVA)'}
                    {templateDocType === 'uda' && 'PROGETTAZIONE UNITA DI APPRENDIMENTO (UDA) MODELLO'}
                    {templateDocType === 'greci' && `RELAZIONE DI INTERASSE BILINGUE - ${bilingualSiteLabel.toUpperCase()}`}
                  </h2>
                </div>

                <div className="space-y-4 flex-1">
                  {templateJsonState.sections.filter((s: TemplateSection) => s.enabled).map((sec: TemplateSection) => (
                    <div key={sec.id} className="space-y-1.5">
                      <h4 className="text-[12px] font-semibold text-ui-text border-b border-ui-border pb-0.5 uppercase tracking-wide">{sec.title}</h4>
                      <p className="text-ui-text-secondary text-justify leading-relaxed">
                        {sec.id === 'sec1' && "Il percorso educativo è stato impostato con criteri di continuità locale, valorizzando l'inclusione, la relazione e l'autonomia di ciascun allievo."}
                        {sec.id === 'sec2' && "La programmazione disciplinare è stata svolta facendo ricorso al Cooperative Learning, al problem-solving e alle risorse multimediali disponibili."}
                        {sec.id === 'sec3' && "Per gli alunni con bisogni educativi speciali (BES) o disturbi dell'apprendimento (DSA), sono state applicate le misure previste nei rispettivi percorsi."}
                        {sec.id === 'sec4' && "La valutazione è stata impostata in ottica formativa e diacronica, raccordando giudizi descrittivi e voti in decimi."}
                      </p>
                    </div>
                  ))}
                </div>

                {institutionalProjection.footer && <div className="border-t border-ui-border pt-4 mt-8 text-center text-[10px] text-ui-text-muted">{institutionalProjection.footer}</div>}
              </div>

              <div className="flex gap-2 pt-1">
                <UiButton variant="primary" size="small" className="flex-1" onClick={() => showToast("Modello Word locale (.docx) generato con successo!", true)}>Genera Modello Word (.docx)</UiButton>
                <UiButton variant="secondary" size="small" className="flex-1" onClick={() => showToast("Anteprima di stampa PDF del modello avviata!", true)}>Salva in PDF</UiButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canonical Documents */}
      <UiPanel variant="subtle">
        <UiSectionHeader
          title="Documenti strutturati"
          description="Documenti canonici con versioni, stato e snapshot istituzionale."
        />
        <div className="space-y-3 rounded-ui-panel border border-ui-border bg-ui-surface-subtle p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <label htmlFor="canonical-uda-select" className="text-[13px] font-semibold text-ui-text">
                Seleziona progettazione
              </label>
              <p className="text-[12px] text-ui-text-secondary">Trasforma una UDA salvata in un documento strutturato A07.</p>
            </div>
            <button
              type="button"
              onClick={handleCreateCanonicalDocument}
              className="inline-flex items-center justify-center rounded-ui-control bg-ui-action px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-ui-action-hover"
            >
              Crea documento
            </button>
          </div>
          <select
            id="canonical-uda-select"
            aria-label="Seleziona progettazione"
            value={selectedCanonicalUdaId}
            onChange={(event) => setSelectedCanonicalUdaId(event.target.value)}
            className="w-full rounded-ui-control border border-ui-border bg-ui-surface px-3 py-2 text-[13px] text-ui-text focus:outline-none focus:ring-2 focus:ring-ui-focus"
          >
            <option value="">Seleziona una progettazione…</option>
            {savedUda.map((uda) => (
              <option key={uda.id} value={uda.id}>
                {uda.title}
              </option>
            ))}
          </select>
          {canonicalMessage && (
            <div className="rounded-ui-control border border-ui-border bg-ui-surface px-3 py-2 text-[13px] text-ui-text-secondary">
              {canonicalMessage}
            </div>
          )}
          {savedUda.length === 0 && (
            <div className="rounded-ui-control border border-dashed border-ui-border px-3 py-2 text-[13px] text-ui-text-secondary">
              Non sono ancora presenti documenti creati dalle progettazioni.
            </div>
          )}
        </div>
        <CanonicalDocumentTab selectedDocumentId={selectedCanonicalDocumentId} onSelectionChange={setSelectedCanonicalDocumentId} />
      </UiPanel>

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
