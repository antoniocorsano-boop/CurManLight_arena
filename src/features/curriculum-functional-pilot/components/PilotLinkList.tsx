/**
 * CML-631E — PilotLinkList
 *
 * Lista dei collegamenti verticali proposti.
 * Posizionata in modo secondario rispetto alla creazione.
 */

import { useState } from 'react';
import type { VerticalCurriculumLink, VerticalCurriculumRelationType, CurriculumNode } from '../../../domain/curriculum';
import type { ServiceResult } from '../application/curriculumPilotService';
import type { PilotAsyncOperation } from '../types';

export interface PilotLinkListProps {
  links: VerticalCurriculumLink[];
  nodes: CurriculumNode[];
  isContributionAllowed: boolean;
  isLoading: boolean;
  asyncOperation: PilotAsyncOperation;
  getRelationTypeLabel: (type: VerticalCurriculumRelationType) => string;
  getStatusLabel: (status: string) => string;
  getNodeLabel: (node: CurriculumNode) => string;
  onDelete: (linkId: string) => ServiceResult<boolean>;
}

export function PilotLinkList({
  links,
  nodes,
  isContributionAllowed,
  isLoading,
  asyncOperation,
  getRelationTypeLabel,
  getStatusLabel,
  getNodeLabel,
  onDelete,
}: PilotLinkListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const getNodeById = (id: string): CurriculumNode | undefined => nodes.find(n => n.id === id);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">
          COLLEGAMENTI PROPOSTI
        </span>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
          Collegamenti salvati ({links.length})
        </h3>
      </div>

      {links.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-[10px] text-slate-500 font-semibold">
            Non hai ancora creato collegamenti.
          </p>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">
            Seleziona due elementi del curricolo e proponi un collegamento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => {
            const sourceNode = getNodeById(link.sourceNodeId);
            const targetNode = getNodeById(link.targetNodeId);
            return (
              <div
                key={link.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        {getRelationTypeLabel(link.relationType)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        link.status === 'draft' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                        link.status === 'validated' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {getStatusLabel(link.status)}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700">
                      <span className="text-indigo-700">{sourceNode ? getNodeLabel(sourceNode) : link.sourceNodeId}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-indigo-700">{targetNode ? getNodeLabel(targetNode) : link.targetNodeId}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-semibold italic">
                      "{link.rationale}"
                    </p>
                  </div>
                  {isContributionAllowed && link.status === 'draft' && (
                    <div className="flex space-x-1">
                      {pendingDeleteId === link.id ? (
                        <div className="flex space-x-1 items-center">
                          <span className="text-[8px] text-rose-600 font-semibold">
                            Eliminare {getRelationTypeLabel(link.relationType)}?
                          </span>
                          <button
                            onClick={() => { onDelete(link.id); setPendingDeleteId(null); }}
                            disabled={isLoading && asyncOperation === 'delete-link'}
                            className={`px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-bold uppercase tracking-wider rounded border border-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${isLoading && asyncOperation === 'delete-link' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isLoading && asyncOperation === 'delete-link' ? 'Eliminazione...' : 'Conferma'}
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[8px] font-bold uppercase tracking-wider rounded border border-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPendingDeleteId(link.id)}
                          aria-label={`Elimina collegamento ${getRelationTypeLabel(link.relationType)}`}
                          className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[8px] font-bold uppercase tracking-wider rounded border border-rose-200 transition focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                        >
                          Elimina
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}