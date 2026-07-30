import { useRef, useCallback } from 'react';
import { Sparkles, X, Eye, Send, Ban, Loader2 } from 'lucide-react';
import { useLocalAiSessionStore } from '../../../features/ai/localAiSessionStore';
import { LocalAiExecutionService } from '../../../features/ai/localAiExecutionService';
import { LocalAiConfiguration } from '../../../features/ai/components/LocalAiConfiguration';
import { LocalAiRequestPreview } from '../../../features/ai/components/LocalAiRequestPreview';
import { LocalAiResponseDraft } from '../../../features/ai/components/LocalAiResponseDraft';
import { createRequestPreview } from '../../../domain/ai/requestPreview';
import type { AiResponse } from '../../../domain/ai/types';

interface CopilotChatSidebarProps {
  isCopilotChatOpen: boolean;
  setIsCopilotChatOpen: (v: boolean) => void;
  copilotChatHistory: Array<{ sender: 'user' | 'assistant'; text: string; isError?: boolean }>;
  isCopilotResponding: boolean;
  copilotChatInput: string;
  setCopilotChatInput: (v: string) => void;
  handleSendCopilotMessage: (customText?: string) => void;
  handleSelectCopilotChip: (text: string) => void;
  handleToggleVoiceTyping: () => void;
  isVoiceListening: boolean;
  handleSpeakController: (text: string, idx: number) => void;
  ttsActiveMsgIndex: number | null;
  ttsPlayingState: 'playing' | 'paused' | 'idle';
  activeTab: string;
  activeProgTab: string;
}

export function CopilotChatSidebar({
  isCopilotChatOpen,
  setIsCopilotChatOpen,
  copilotChatHistory: _copilotChatHistory,
  isCopilotResponding: _isCopilotResponding,
  copilotChatInput: _copilotChatInput,
  setCopilotChatInput: _setCopilotChatInput,
  handleSendCopilotMessage: _handleSendCopilotMessage,
  handleSelectCopilotChip,
  handleToggleVoiceTyping: _handleToggleVoiceTyping,
  isVoiceListening: _isVoiceListening,
  handleSpeakController: _handleSpeakController,
  ttsActiveMsgIndex: _ttsActiveMsgIndex,
  ttsPlayingState: _ttsPlayingState,
  activeTab,
  activeProgTab,
}: CopilotChatSidebarProps) {
  const executionServiceRef = useRef<LocalAiExecutionService | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  const {
    configuration,
    configurationStatus,
    draftText,
    preview,
    consentGiven,
    executionStatus,
    activeRequestId,
    response,
    errorMessage,
    setDraftText,
    setPreview,
    setConsentGiven,
    invalidateConsent,
    setExecutionStatus,
    setActiveRequestId,
    setResponse,
    setErrorMessage,
    enterPreview,
    exitPreview,
  } = useLocalAiSessionStore();

  const getService = useCallback(() => {
    if (!executionServiceRef.current) {
      executionServiceRef.current = new LocalAiExecutionService();
    }
    return executionServiceRef.current;
  }, []);

  const handleCheckPreview = () => {
    const text = draftText.trim();
    if (!text) return;

    const service = getService();
    service.configure(configuration.endpoint, configuration.model);

    const providerConfig = {
      id: 'local-ollama',
      kind: 'local' as const,
      status: 'available' as const,
      capabilities: {
        textGeneration: true,
        structuredCompletion: false,
        analysisOrClassification: false,
        streamingAvailable: false,
        localExecution: true,
        remoteExecution: false,
      },
      label: 'Ollama Locale',
      description: 'Provider locale per Ollama.',
      requiresConsent: true,
      endpoint: configuration.endpoint,
      model: configuration.model,
    };

    const request = {
      requestId: `preview-${Date.now()}`,
      providerId: 'local-ollama',
      capability: 'textGeneration' as const,
      prompt: text,
      consentGiven: true,
      timestamp: Date.now(),
    };

    const previewResult = createRequestPreview(providerConfig, request);
    setPreview(previewResult);
    enterPreview();
  };

  const handleExecute = async () => {
    const text = preview?.outgoingText || draftText.trim();
    if (!text) return;

    const service = getService();
    service.configure(configuration.endpoint, configuration.model);

    const requestId = service.createRequestId();
    setActiveRequestId(requestId);
    setExecutionStatus('running');
    setErrorMessage(null);
    setResponse(null);

    const executePromise = service.execute(text, requestId);

    executePromise.then((res: AiResponse<string>) => {
      if (res.status === 'success') {
        setResponse(res);
        setExecutionStatus('success');
      } else if (res.status === 'cancelled') {
        setExecutionStatus('cancelled');
      } else {
        setExecutionStatus('error');

        const messages: Record<string, string> = {
          provider_not_configured: 'Configura endpoint e modello prima di procedere.',
          provider_disabled: 'Il provider locale è disabilitato.',
          provider_unavailable: 'Ollama locale non è raggiungibile. Verifica che sia avviato.',
          capability_not_supported: 'Il provider non supporta questa operazione.',
          invalid_request: 'Controlla testo, configurazione e consenso.',
          cancelled: 'Richiesta annullata.',
          failed: 'La risposta del modello locale non è valida.',
          provider_not_found: 'Il provider configurato non è disponibile.',
        };

        setErrorMessage(messages[res.status] || 'Errore durante la richiesta.');
      }

      setConsentGiven(false);
      setActiveRequestId(null);
    }).catch(() => {
      setExecutionStatus('error');
      setErrorMessage('Errore durante la richiesta al modello locale.');
      setConsentGiven(false);
      setActiveRequestId(null);
    });
  };

  const handleCancel = () => {
    if (!activeRequestId) return;
    const service = getService();
    const cancelled = service.cancel(activeRequestId);
    if (cancelled) {
      setExecutionStatus('cancelled');
      setConsentGiven(false);
    }
  };

  const handleCopyResponse = () => {
    if (response?.result) {
      navigator.clipboard.writeText(response.result).catch(() => {});
    }
  };

  const handleNewRequest = () => {
    setExecutionStatus('idle');
    setPreview(null);
    setResponse(null);
    setErrorMessage(null);
    setActiveRequestId(null);
    setConsentGiven(false);
    setDraftText('');
  };

  const handleConsentChange = () => {
    const newValue = !consentGiven;
    setConsentGiven(newValue);
  };

  const handleDraftTextChange = (value: string) => {
    setDraftText(value);
    if (preview || executionStatus === 'preview') {
      invalidateConsent();
    }
  };

  if (!isCopilotChatOpen) return null;

  const isAiConfigured = configurationStatus === 'ready';
  const isComposing = executionStatus === 'idle';
  const isPreviewing = executionStatus === 'preview';
  const isRunning = executionStatus === 'running';
  const isSuccess = executionStatus === 'success';
  const isError = executionStatus === 'error';
  const isCancelled = executionStatus === 'cancelled';

  const activeText = draftText.trim();
  const canPreview = isAiConfigured && activeText.length > 0 && !isRunning;
  const canExecute = isPreviewing && preview !== null && consentGiven;
  const canCancel = isRunning && activeRequestId !== null;

  return (
    <div
      className="fixed top-20 bottom-4 right-4 left-4 md:left-auto md:w-80 z-[150] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden fade-in text-slate-700 text-left"
      aria-busy={isRunning}
    >
      <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-slate-800">
       <span className="font-black uppercase tracking-wider text-[9px] flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>Assistente locale non verificato</span>
       </span>
       <button onClick={() => setIsCopilotChatOpen(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
        <X className="w-4 h-4" />
       </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[10px] leading-relaxed font-semibold" role="region" aria-label="Area contenuto assistente">
        {!isAiConfigured && (
          <LocalAiConfiguration />
        )}

        {isAiConfigured && isComposing && (
          <>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 space-y-1 text-[9px]">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Provider</span>
                <span className="font-bold text-slate-800">Ollama locale</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Modello</span>
                <span className="font-bold text-slate-800">{configuration.model}</span>
              </div>
              <div className="text-[8px] text-slate-400 font-bold mt-1">
                Sarà inviato soltanto il testo visibile. Nessun contesto nascosto.
              </div>
            </div>

            <textarea
              value={draftText}
              onChange={(e) => {
                handleDraftTextChange(e.target.value);
              }}
              className="w-full border rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-[10px] text-slate-800 resize-none min-h-[80px]"
              placeholder="Inserisci il testo da inviare al modello locale..."
              rows={4}
              disabled={isRunning}
              aria-label="Testo da inviare al modello"
            />

            <div className="flex space-x-2">
              <button
                onClick={handleCheckPreview}
                disabled={!canPreview}
                className="flex-1 flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-[9px] uppercase tracking-wider py-2.5 rounded-xl transition shadow-md"
                aria-label="Controlla prima dell'invio"
              >
                <Eye className="w-3 h-3" />
                <span>Controlla prima dell'invio</span>
              </button>
            </div>
          </>
        )}

        {isAiConfigured && isPreviewing && preview && (
          <div ref={previewRef} tabIndex={-1} className="space-y-3">
            <LocalAiRequestPreview preview={preview} />

            <label className="flex items-start space-x-2.5 bg-white border rounded-xl p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={handleConsentChange}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                aria-label="Conferma invio"
              />
              <span className="text-[10px] font-bold text-slate-700 leading-relaxed">
                Confermo di voler inviare questo testo al modello locale indicato.
              </span>
            </label>

            <div className="flex space-x-2">
              <button
                onClick={exitPreview}
                disabled={isRunning}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
              >
                Torna alla modifica
              </button>
              <button
                onClick={handleExecute}
                disabled={!canExecute}
                className="flex-1 flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition shadow-md"
              >
                <Send className="w-3 h-3" />
                <span>Invia al modello locale</span>
              </button>
            </div>
          </div>
        )}

        {isAiConfigured && isRunning && (
          <div className="space-y-3 text-center" role="status" aria-live="polite">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-[10px] font-bold text-indigo-800">
                Invio al modello locale in corso...
              </p>
              <div className="text-[9px] text-slate-500 font-bold space-y-0.5">
                <p>Provider: Ollama locale</p>
                <p>Modello: {configuration.model}</p>
                <p>Endpoint: {configuration.endpoint}</p>
              </div>
            </div>

            {canCancel && (
              <button
                onClick={handleCancel}
                className="flex items-center justify-center space-x-1 mx-auto bg-rose-600 hover:bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-md"
                aria-label="Annulla richiesta"
              >
                <Ban className="w-3 h-3" />
                <span>Annulla richiesta</span>
              </button>
            )}
          </div>
        )}

        {isAiConfigured && isSuccess && response && (
          <div ref={responseRef} tabIndex={-1} className="space-y-3" role="status" aria-live="polite">
            <LocalAiResponseDraft
              response={response}
              onCopy={handleCopyResponse}
              onNewRequest={handleNewRequest}
              onClose={handleNewRequest}
            />
          </div>
        )}

        {isAiConfigured && isCancelled && (
          <div className="bg-slate-50 border rounded-xl p-4 text-center space-y-2" role="status" aria-live="polite">
            <p className="text-[10px] font-black text-slate-500">Richiesta annullata</p>
            <button
              onClick={handleNewRequest}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-md"
            >
              Nuova richiesta
            </button>
          </div>
        )}

        {isAiConfigured && isError && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center space-y-2" role="alert" aria-live="assertive">
            <p className="text-[10px] font-black text-rose-700">{errorMessage || 'Errore durante la richiesta.'}</p>
            <button
              onClick={exitPreview}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[9px] uppercase tracking-wider px-4 py-2 rounded-xl transition"
            >
              Torna alla modifica
            </button>
          </div>
        )}

        {isAiConfigured && (isComposing || isPreviewing) && _copilotChatHistory.length === 0 && !activeText && (
          <div className="text-center text-slate-400 py-4">
            <p className="text-[10px] font-bold">
              Componi il testo da inviare al modello locale.
            </p>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-slate-50 shrink-0 space-y-1.5">
       <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Suggerimenti contestuali:</span>
       <div className="flex flex-wrap gap-1">
        {(() => {
          let chips: string[] = [];
          if (activeTab === 'dashboard') {
            chips = ["Sintetizza i volumi dell'indagine", "Quali sono le priorità del PdM?"];
          } else if (activeTab === 'curricolo' || activeTab === 'revisione') {
            chips = ["Spiega la diacronia verticale", "Quali scadenze ha il D.M. 221/2025?"];
          } else if (activeTab === 'progetta-annuale') {
            chips = ["Suggerisci un compito di realtà", "Proponi misure inclusive per DSA"];
          } else if (activeProgTab === 'classe' || activeProgTab === 'classe-home') {
            chips = ["Spiega la metodologia Jigsaw", "Consigli banchi a isole"];
          } else {
            chips = ["Informazioni sull'accessibilità", "Manuale d'uso"];
          }
          return chips.map((c, i) => (
            <button
              key={i}
              onClick={() => handleSelectCopilotChip(c)}
              disabled={_isCopilotResponding}
              className="text-[9px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 border hover:border-indigo-200 px-2 py-1 rounded-lg transition text-slate-600 text-left cursor-pointer truncate max-w-full"
            >
              {c}
            </button>
          ));
        })()}
       </div>
      </div>
    </div>
  );
}

