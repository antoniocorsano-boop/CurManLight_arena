/**
 * CML-631E — PilotVerticalLinkForm
 *
 * Form per proporre un nuovo collegamento verticale.
 * I tipi di relazione sono accessibili tramite tocco, tastiera e mouse.
 */

import { useState } from 'react';
import type { VerticalCurriculumRelationType, VerticalCurriculumLink } from '../../../domain/curriculum';
import type { ServiceResult } from '../application/curriculumPilotService';
import type { PilotAsyncOperation } from '../types';
import { getRelationTypeGuidance } from '../relationTypeGuidance';

export interface PilotVerticalLinkFormProps {
  versionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  isLoading: boolean;
  asyncOperation: PilotAsyncOperation;
  onPropose: (input: {
    versionId: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationType: VerticalCurriculumRelationType;
    rationale: string;
  }) => ServiceResult<VerticalCurriculumLink>;
}

export function PilotVerticalLinkForm({
  versionId,
  sourceNodeId,
  targetNodeId,
  isLoading,
  asyncOperation,
  onPropose,
}: PilotVerticalLinkFormProps) {
  const [relationType, setRelationType] = useState<VerticalCurriculumRelationType>('continuity');
  const [rationale, setRationale] = useState('');
  const [lastResult, setLastResult] = useState<ServiceResult<VerticalCurriculumLink> | null>(null);

  const isSubmitDisabled = isLoading || asyncOperation === 'create-link';

  const handleSubmit = () => {
    const result = onPropose({
      versionId,
      sourceNodeId,
      targetNodeId,
      relationType,
      rationale,
    });
    setLastResult(result);
    if (result.ok) {
      setRationale('');
      setRelationType('continuity');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">
          PROPONI COLLEGAMENTO VERTICALE
        </span>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
          Definisci la relazione tra i due elementi selezionati
        </h3>
      </div>

      {/* Relation Type Selector — touch accessible */}
      <div className="space-y-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
          Tipo di relazione:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo di relazione">
          {(['continuity', 'development', 'prerequisite', 'integration', 'deepening', 'discontinuity'] as VerticalCurriculumRelationType[]).map(type => {
            const guidance = getRelationTypeGuidance(type);
            const isSelected = relationType === type;
            return (
              <button
                key={type}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setRelationType(type)}
                className={`w-full text-left p-3 rounded-xl text-[10px] font-semibold transition border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] mb-1">
                  {type === 'continuity' ? 'Continuità' :
                   type === 'development' ? 'Sviluppo' :
                   type === 'prerequisite' ? 'Prerequisito' :
                   type === 'integration' ? 'Integrazione' :
                   type === 'deepening' ? 'Approfondimento' : 'Discontinuità'}
                </div>
                <p className={`text-[9px] leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {guidance.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rationale */}
      <div className="space-y-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
          Motivazione pedagogica (obbligatoria):
        </span>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Descrivi brevemente la motivazione pedagogica di questo collegamento..."
          aria-label="Motivazione pedagogica del collegamento"
          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none disabled:bg-slate-100"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled || !rationale.trim()}
        className={`w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isSubmitDisabled || !rationale.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitDisabled && asyncOperation === 'create-link' ? 'Invio in corso...' : 'Proponi Collegamento'}
      </button>

      {/* Result Display */}
      {lastResult && (
        <div className={`rounded-xl p-3 space-y-1 ${
          lastResult.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
        }`}>
          {lastResult.ok ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Collegamento proposto con successo
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">
                ID: {lastResult.data.id} | Stato: {lastResult.data.status}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  Errore
                </span>
              </div>
              <p className="text-[10px] text-rose-700 font-semibold">
                {lastResult.error.message}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}