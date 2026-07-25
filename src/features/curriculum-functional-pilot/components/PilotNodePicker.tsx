/**
 * CML-631A — PilotNodePicker
 *
 * Selettore di nodi curricolari per il pilot.
 */

import { useState } from 'react';
import type { CurriculumNode } from '../../../domain/curriculum';

export interface PilotNodePickerProps {
  label: string;
  nodes: CurriculumNode[];
  selectedNodeId: string | null;
  onSelect: (nodeId: string | null) => void;
  getNodeLabel: (node: CurriculumNode) => string;
}

export function PilotNodePicker({
  label,
  nodes,
  selectedNodeId,
  onSelect,
  getNodeLabel,
}: PilotNodePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodes.filter(node =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
        {label}:
      </span>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca nodo curricolare..."
        aria-label={`Cerca tra i nodi per ${label}`}
        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
      <div className="max-h-[200px] overflow-y-auto space-y-1">
        {filteredNodes.map(node => (
          <button
            key={node.id}
            onClick={() => onSelect(node.id === selectedNodeId ? null : node.id)}
            aria-label={`${getNodeLabel(node)}${selectedNodeId === node.id ? ' (selezionato)' : ''}`}
            className={`w-full text-left p-2.5 rounded-xl text-[10px] font-semibold transition border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
              selectedNodeId === node.id
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="truncate">{getNodeLabel(node)}</span>
              {selectedNodeId === node.id && (
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider">
                  Selezionato
                </span>
              )}
            </div>
            <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
              {node.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
