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
  const isMobile = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 767px)').matches;

  const configurationForm = (
    <div className="space-y-3" data-local-model-configuration="ollama-optional">
      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10px] text-amber-950 font-bold leading-normal">
        La configurazione resta soltanto in questa sessione e non viene salvata.
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
          Provider opzionale
        </label>
        <div className="font-bold text-slate-800 text-[11px] bg-slate-50 border rounded-xl px-3 py-2">
          Ollama
        </div>
        <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
          Usalo solo se hai già un endpoint raggiungibile da questo dispositivo. Non è necessario per consultare fonti, conoscenza o connessioni.
        </p>
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
          Usa questo modello opzionale
        </button>
      )}

      {configurationStatus === 'ready' && (
        <button
          onClick={disableConfiguration}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition"
        >
          Disabilita modello opzionale
        </button>
      )}

      {configurationStatus === 'disabled' && (
        <div className="bg-slate-50 border p-3 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500">
            Modello opzionale disabilitato. Le funzioni locali dell'Assistente restano disponibili.
          </p>
        </div>
      )}
    </div>
  );

  if (isMobile && configurationStatus !== 'ready') {
    return (
      <div className="p-3 space-y-3 text-xs" data-mobile-local-assistant="primary">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] font-black text-slate-800">Assistente mobile locale</p>
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-600">
            Puoi consultare fonti, conoscenza e connessioni direttamente sul telefono, senza configurare Ollama o altri modelli.
          </p>
          <p className="mt-1.5 text-[9px] font-bold text-emerald-800">
            Le funzioni locali non approvano, modificano o promuovono contenuti istituzionali.
          </p>
        </div>

        <details className="rounded-xl border border-slate-200 bg-white" data-mobile-model-optional="collapsed">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-[10px] font-black text-slate-700">
            Aggiungi un modello (facoltativo)
          </summary>
          <div className="border-t border-slate-100 p-3">
            {configurationForm}
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="p-3 text-xs">
      {configurationForm}
    </div>
  );
}
