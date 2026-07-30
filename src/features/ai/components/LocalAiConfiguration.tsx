import { useLocalAiSessionStore } from '../localAiSessionStore';
import { LocalAiModelSelector } from './LocalAiModelSelector';

export function LocalAiConfiguration() {
  const {
    configuration,
    configurationStatus,
    setEndpoint,
    setModel,
    enableConfiguration,
    disableConfiguration,
    invalidateConsent,
  } = useLocalAiSessionStore();

  const handleEndpointChange = (value: string) => {
    setEndpoint(value);
    invalidateConsent();
  };

  const handleModelSelect = (model: string) => {
    setModel(model);
    invalidateConsent();
  };

  const handleEnable = () => {
    enableConfiguration();
  };

  const modelEmpty = !configuration.model.trim();

  return (
    <div className="p-3 space-y-3 text-xs">
      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10px] text-amber-950 font-bold leading-normal">
        La configurazione resta soltanto in questa sessione e non viene salvata.
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
          Provider
        </label>
        <div className="font-bold text-slate-800 text-[11px] bg-slate-50 border rounded-xl px-3 py-2">
          Ollama locale
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="ai-endpoint"
          className="text-[9px] font-black text-slate-400 uppercase tracking-wider block"
        >
          Endpoint
        </label>
        <input
          id="ai-endpoint"
          type="text"
          value={configuration.endpoint}
          onChange={(e) => handleEndpointChange(e.target.value)}
          className="w-full border rounded-xl p-2 font-bold bg-white text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          placeholder="http://localhost:11434"
          disabled={configurationStatus === 'disabled'}
        />
      </div>

      <LocalAiModelSelector
        endpoint={configuration.endpoint}
        selectedModel={configuration.model}
        onModelSelect={handleModelSelect}
        disabled={configurationStatus === 'disabled'}
      />

      {configurationStatus !== 'disabled' && (
        <button
          onClick={handleEnable}
          disabled={modelEmpty}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition shadow-md"
        >
          Usa questa configurazione
        </button>
      )}

      {configurationStatus === 'ready' && (
        <button
          onClick={disableConfiguration}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition"
        >
          Disabilita provider locale
        </button>
      )}

      {configurationStatus === 'disabled' && (
        <div className="bg-slate-50 border p-3 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500">
            Provider locale disabilitato.
          </p>
        </div>
      )}
    </div>
  );
}
