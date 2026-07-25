/**
 * CML-631E — PilotNodePicker
 *
 * Selettore di elementi curricolari per il pilot.
 * Mostra schede visibili oltre alla ricerca.
 * Supporta la selezione progressiva (disabilitato finché il primo non è selezionato).
 */

import { useState } from 'react';
import type { CurriculumNode } from '../../../domain/curriculum';

export interface PilotNodePickerProps {
  label: string;
  nodes: CurriculumNode[];
  selectedNodeId: string | null;
  onSelect: (nodeId: string | null) => void;
  getNodeLabel: (node: CurriculumNode) => string;
  getNodeDescription?: (node: CurriculumNode) => string;
  isDisabled?: boolean;
}

export function PilotNodePicker({
  label,
  nodes,
  selectedNodeId,
  onSelect,
  getNodeLabel,
  getNodeDescription,
  isDisabled = false,
}: PilotNodePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodes.filter(node =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-2 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
        {label}:
      </span>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca un obiettivo, un traguardo o una competenza"
        aria-label={`Cerca tra gli elementi del curricolo per ${label}`}
        disabled={isDisabled}
        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
      <div className="max-h-[280px] overflow-y-auto space-y-2">
        {filteredNodes.length === 0 && (
          <p className="text-[10px] text-slate-400 font-semibold text-center py-3">
            {searchTerm ? 'Nessun elemento corrisponde alla ricerca.' : 'Nessun elemento disponibile.'}
          </p>
        )}
        {filteredNodes.map(node => (
          <button
            key={node.id}
            onClick={() => onSelect(node.id === selectedNodeId ? null : node.id)}
            aria-label={`${getNodeLabel(node)}${selectedNodeId === node.id ? ' (selezionato)' : ''}`}
            aria-pressed={selectedNodeId === node.id}
            disabled={isDisabled}
            className={`w-full text-left p-3 rounded-xl text-[10px] font-semibold transition border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
              selectedNodeId === node.id
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <span className="block truncate font-bold">{getNodeLabel(node)}</span>
                {getNodeDescription && (
                  <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
                    {getNodeDescription(node)}
                  </span>
                )}
              </div>
              {selectedNodeId === node.id && (
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider shrink-0">
                  Selezionato
                </span>
              )}
            </div>
            {node.description && (
              <span className="text-[9px] text-slate-500 font-medium block mt-1 line-clamp-2">
                {node.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}