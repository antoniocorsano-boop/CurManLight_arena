import { useState, useCallback, useRef } from 'react';
import { OllamaModelDiscoveryClient, formatModelSize, getModelFamilyLabel } from '../../../domain/ai/ollamaModelDiscovery';
import type { OllamaModelDiscoveryResult, OllamaInstalledModel } from '../../../domain/ai/ollamaModelDiscovery';

export type ModelSelectorState =
  | { phase: 'idle' }
  | { phase: 'searching' }
  | { phase: 'success'; models: OllamaInstalledModel[] }
  | { phase: 'empty'; message: string }
  | { phase: 'error'; message: string };

interface LocalAiModelSelectorProps {
  endpoint: string;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  disabled?: boolean;
}

export function LocalAiModelSelector({
  endpoint,
  selectedModel,
  onModelSelect,
  disabled = false,
}: LocalAiModelSelectorProps) {
  const [selectorState, setSelectorState] = useState<ModelSelectorState>({ phase: 'idle' });
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualModel, setManualModel] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const handleDiscover = useCallback(async () => {
    setSelectorState({ phase: 'searching' });
    setShowManualInput(false);

    const client = new OllamaModelDiscoveryClient(endpoint);
    const result: OllamaModelDiscoveryResult = await client.discoverModels();

    if (result.status === 'success') {
      if (result.models.length === 0) {
        setSelectorState({
          phase: 'empty',
          message: 'Nessun modello è installato in Ollama. Installa un modello tramite Ollama, quindi aggiorna l\'elenco.',
        });
      } else {
        setSelectorState({ phase: 'success', models: result.models });
        setTimeout(() => listRef.current?.focus(), 0);
      }
    } else if (result.status === 'unavailable') {
      setSelectorState({
        phase: 'error',
        message: `Ollama locale non è raggiungibile. Verifica che sia avviato.`,
      });
    } else if (result.status === 'invalid_response') {
      setSelectorState({
        phase: 'error',
        message: 'Ollama ha restituito un elenco di modelli non riconosciuto.',
      });
    } else {
      setSelectorState({
        phase: 'error',
        message: result.message || 'Errore durante la ricerca dei modelli.',
      });
    }
  }, [endpoint]);

  const handleRefresh = useCallback(() => {
    handleDiscover();
  }, [handleDiscover]);

  const selectedModelStillAvailable = selectorState.phase === 'success'
    && selectedModel
    && selectorState.models.some(m => m.name === selectedModel);

  return (
    <div className="space-y-2" role="region" aria-label="Selezione modello locale">
      {selectorState.phase === 'idle' && (
        <button
          onClick={handleDiscover}
          disabled={disabled}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition shadow-md"
          aria-label="Controlla modelli disponibili"
        >
          Controlla modelli disponibili
        </button>
      )}

      {selectorState.phase === 'searching' && (
        <div
          className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center space-y-1"
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-indigo-800">Ricerca dei modelli locali in corso...</p>
        </div>
      )}

      {selectorState.phase === 'success' && (
        <div
          ref={listRef}
          tabIndex={-1}
          className="space-y-2"
          aria-label="Modelli disponibili"
        >
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Modelli disponibili: {selectorState.models.length}
            </span>
            <button
              onClick={handleRefresh}
              disabled={disabled}
              className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold underline"
            >
              Aggiorna
            </button>
          </div>

          <div
            className="max-h-[180px] overflow-y-auto space-y-1"
            role="listbox"
            aria-label="Elenco modelli installati"
          >
            {selectorState.models.map((model) => {
              const isSelected = selectedModel === model.name;
              const family = getModelFamilyLabel(model);
              const size = formatModelSize(model.size);
              const paramSize = model.details?.parameterSize || '';

              return (
                <button
                  key={model.name}
                  onClick={() => onModelSelect(model.name)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full text-left p-2 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-[10px] font-mono">{model.name}</div>
                  <div className="text-[8px] font-semibold text-inherit opacity-70">
                    {[size, family, paramSize].filter(Boolean).join(' · ')}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedModel && !selectedModelStillAvailable && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[9px] font-bold text-amber-800"
              role="alert"
            >
              Il modello selezionato non è più presente nell\'istanza locale. Selezionane un altro.
            </div>
          )}
        </div>
      )}

      {selectorState.phase === 'empty' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-2">
          <p className="text-[10px] font-bold text-slate-600">{selectorState.message}</p>
          <button
            onClick={handleRefresh}
            disabled={disabled}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition"
          >
            Aggiorna elenco
          </button>
        </div>
      )}

      {selectorState.phase === 'error' && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center space-y-2">
          <p className="text-[10px] font-bold text-rose-700" role="alert">{selectorState.message}</p>
          <button
            onClick={handleRefresh}
            disabled={disabled}
            className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition"
          >
            Riprova
          </button>
        </div>
      )}

      {selectorState.phase !== 'idle' && selectorState.phase !== 'searching' && (
        <div className="pt-1">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[9px] text-slate-400 hover:text-slate-600 font-bold underline"
            aria-expanded={showManualInput}
          >
            {showManualInput ? 'Nascondi inserimento manuale' : 'Inserimento manuale avanzato'}
          </button>

          {showManualInput && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[8px] text-amber-600 font-bold">
                Usa il nome completo, incluso il tag, ad esempio llama3.2:3b. Un modello inesistente produrrà un errore durante l\'esecuzione.
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualModel}
                  onChange={(e) => setManualModel(e.target.value)}
                  className="flex-1 border rounded-xl p-2 font-bold bg-white text-[10px] outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="Es. llama3.2:3b"
                  disabled={disabled}
                />
                <button
                  onClick={() => {
                    if (manualModel.trim()) {
                      onModelSelect(manualModel.trim());
                      setShowManualInput(false);
                      setManualModel('');
                    }
                  }}
                  disabled={disabled || !manualModel.trim()}
                  className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 font-black text-[9px] px-3 py-1.5 rounded-xl transition"
                >
                  Usa
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
