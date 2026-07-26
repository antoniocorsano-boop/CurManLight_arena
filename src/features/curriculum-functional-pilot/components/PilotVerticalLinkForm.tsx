/**
 * CML-631E/631I — PilotVerticalLinkForm
 *
 * Form per proporre un nuovo collegamento verticale.
 * Include assistenza pedagogica (CML-631I): suggerimenti motivati per il tipo di relazione.
 * Il docente decide sempre: i suggerimenti sono proposte, non imposizioni.
 */

import { useState, useMemo } from 'react';
import type { CurriculumNode, VerticalCurriculumRelationType, VerticalCurriculumLink } from '../../../domain/curriculum';
import type { ServiceResult } from '../application/curriculumPilotService';
import type { PilotAsyncOperation } from '../types';
import { getRelationTypeGuidance } from '../relationTypeGuidance';
import { generatePedagogicalSuggestions, type PedagogicalSuggestion } from '../pedagogicalSuggestionEngine';

export interface PilotVerticalLinkFormProps {
  versionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNode?: CurriculumNode | null;
  targetNode?: CurriculumNode | null;
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
  sourceNode,
  targetNode,
  isLoading,
  asyncOperation,
  onPropose,
}: PilotVerticalLinkFormProps) {
  const [relationType, setRelationType] = useState<VerticalCurriculumRelationType>('continuity');
  const [rationale, setRationale] = useState('');
  const [lastResult, setLastResult] = useState<ServiceResult<VerticalCurriculumLink> | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(false);

  const isSubmitDisabled = isLoading || asyncOperation === 'create-link';

  // CML-631I: Generate suggestions when both nodes are available
  const suggestions: PedagogicalSuggestion[] = useMemo(() => {
    if (!sourceNode || !targetNode) return [];
    return generatePedagogicalSuggestions(sourceNode, targetNode);
  }, [sourceNode, targetNode]);

  const showSuggestions = suggestions.length > 0 && !dismissedSuggestions;

  const handleUseSuggestion = (suggestion: PedagogicalSuggestion) => {
    setRelationType(suggestion.relationType);
    setRationale(suggestion.motivation);
  };

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
      setDismissedSuggestions(false);
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

      {/* CML-631I: Pedagogical Suggestions Section */}
      {showSuggestions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">
              Possibili relazioni suggerite
            </span>
            <button
              onClick={() => setDismissedSuggestions(true)}
              className="text-[9px] font-bold text-amber-600 hover:text-amber-800 uppercase tracking-wider transition"
              aria-label="Ignora tutti i suggerimenti"
            >
              Ignora
            </button>
          </div>
          <p className="text-[9px] text-amber-600 font-semibold">
            Il sistema analizza i due nodi e propone le relazioni più probabili. Puoi usarle come punto di partenza o ignorarle.
          </p>
          <div className="space-y-2">
            {suggestions.map((suggestion) => {
              return (
                <div
                  key={suggestion.relationType}
                  className="bg-white border border-amber-100 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-800 uppercase">
                        {suggestion.relationType === 'continuity' ? 'Continuità' :
                         suggestion.relationType === 'development' ? 'Sviluppo' :
                         suggestion.relationType === 'prerequisite' ? 'Prerequisito' :
                         suggestion.relationType === 'integration' ? 'Integrazione' :
                         suggestion.relationType === 'deepening' ? 'Approfondimento' : 'Discontinuità'}
                      </span>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        suggestion.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                        suggestion.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {suggestion.confidence}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="text-[9px] font-black text-amber-700 hover:text-amber-900 uppercase tracking-wider transition bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg"
                      aria-label={`Usa la proposta: ${suggestion.relationType}`}
                    >
                      Usa questa proposta
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 font-semibold leading-relaxed">
                    {suggestion.motivation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
