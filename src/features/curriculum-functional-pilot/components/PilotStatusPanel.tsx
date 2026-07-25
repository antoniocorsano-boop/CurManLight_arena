/**
 * CML-631A — PilotStatusPanel
 *
 * Pannello di stato per il pilot funzionale.
 * Mostra stato attivazione, dati inizializzati, errori.
 */

import type { CurriculumFunctionalActivationMode, PilotDataset } from '../types';
import type { InstituteCurriculumVersion, CurriculumSegment, VerticalCurriculumLink } from '../../../domain/curriculum';
import type { ServiceError } from '../application/curriculumPilotService';

export interface PilotStatusPanelProps {
  activationMode: CurriculumFunctionalActivationMode;
  isPilotInitialized: boolean;
  pilotDataset: PilotDataset | null;
  versions: InstituteCurriculumVersion[];
  segments: CurriculumSegment[];
  links: VerticalCurriculumLink[];
  lastError: ServiceError | null;
  onInitialize: () => { ok: true; data: PilotDataset } | { ok: false; error: ServiceError };
  onSetMode: (mode: CurriculumFunctionalActivationMode) => void;
}

export function PilotStatusPanel({
  activationMode,
  isPilotInitialized,
  versions,
  segments,
  links,
  lastError,
  onInitialize,
  onSetMode,
}: PilotStatusPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">
          STATO PILOTA
        </span>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
          Configurazione e stato del pilota funzionale
        </h3>
      </div>

      {/* Activation Mode Selector */}
      <div className="space-y-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
          Modalità di attivazione:
        </span>
        <div className="flex flex-wrap gap-2">
          {(['disabled', 'pilot-read-only', 'pilot-contribution'] as CurriculumFunctionalActivationMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onSetMode(mode)}
              aria-pressed={activationMode === mode}
              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                activationMode === mode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mode === 'disabled' ? 'Disattivato' : mode === 'pilot-read-only' ? 'Sola Lettura' : 'Contributo'}
            </button>
          ))}
        </div>
      </div>

      {/* Initialization Status */}
      <div className="space-y-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
          Stato inizializzazione:
        </span>
        {isPilotInitialized ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Dataset inizializzato
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px] font-semibold text-slate-600">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Versioni:</span>
                <span className="text-emerald-800">{versions.length}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Segmenti:</span>
                <span className="text-emerald-800">{segments.length}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Collegamenti:</span>
                <span className="text-emerald-800">{links.length}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <p className="text-[10px] text-slate-600 font-semibold">
              Il dataset pilota non è stato inizializzato.
            </p>
            <button
              onClick={() => onInitialize()}
              aria-label="Inizializza dataset pilota"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              Inizializza Dataset Pilota
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
              Errore
            </span>
          </div>
          <p className="text-[10px] text-rose-700 font-semibold">{lastError.message}</p>
          {lastError.code && (
            <p className="text-[8px] font-mono text-rose-500">Codice: {lastError.code}</p>
          )}
        </div>
      )}
    </div>
  );
}
