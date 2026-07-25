/**
 * CML-631A — PilotMainView
 *
 * Vista principale per il pilot funzionale.
 * Integra tutti i sotto-componenti.
 */

import { useState } from 'react';
import { useCurriculumPilot } from '../hooks/useCurriculumPilot';
import { PilotStatusPanel } from './PilotStatusPanel';
import { PilotVerticalLinkForm } from './PilotVerticalLinkForm';
import { PilotLinkList } from './PilotLinkList';
import { PilotNodePicker } from './PilotNodePicker';

export function PilotMainView() {
  const pilot = useCurriculumPilot();
  const [selectedSourceNodeId, setSelectedSourceNodeId] = useState<string | null>(null);
  const [selectedTargetNodeId, setSelectedTargetNodeId] = useState<string | null>(null);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string | null>(null);

  const filteredNodes = selectedSegmentFilter
    ? pilot.nodes.filter(n => n.segmentId === selectedSegmentFilter)
    : pilot.nodes;

  const filteredLinks = selectedSegmentFilter
    ? pilot.links.filter(l => {
        const sourceNode = pilot.nodes.find(n => n.id === l.sourceNodeId);
        const targetNode = pilot.nodes.find(n => n.id === l.targetNodeId);
        return sourceNode?.segmentId === selectedSegmentFilter || targetNode?.segmentId === selectedSegmentFilter;
      })
    : pilot.links;

  return (
    <div className="space-y-6 fade-in text-left">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">
            Dominio Produttivo — Pilota Sperimentale
          </span>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            COLLEGAMENTI VERTICALI CURRICOLARI
          </h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">
            {pilot.isContributionAllowed
              ? 'Modalità contributo attiva: puoi proporre, modificare ed eliminare collegamenti verticali bozza.'
              : pilot.isPilotActive
                ? 'Modalità sola lettura: puoi consultare i collegamenti verticali esistenti.'
                : 'Il pilota non è attivo. Attivalo per iniziare.'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {pilot.isPilotActive && (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-[9px] font-bold uppercase tracking-wider">
              ★ Esperimento
            </span>
          )}
        </div>
      </div>

      {/* Status Panel */}
          <PilotStatusPanel
            activationMode={pilot.activationMode}
            isPilotInitialized={pilot.isPilotInitialized}
            pilotDataset={pilot.pilotDataset}
            versions={pilot.versions}
            segments={pilot.segments}
            links={pilot.links}
            lastError={pilot.lastError}
            isLoading={pilot.isLoading}
            asyncOperation={pilot.asyncOperation}
            onInitialize={pilot.initializeDataset}
            onSetMode={pilot.setMode}
          />

      {/* Main Content */}
      {pilot.isPilotActive && pilot.isPilotInitialized && (
        <div className="space-y-6 fade-in">
          {/* Node Picker for Vertical Links */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">
                SELEZIONA I NODI DA COLLEGARE
              </span>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Scegli i due nodi curricolari da collegare
              </h3>
            </div>

            {/* Segment Filter */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Filtro per segmento:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSegmentFilter(null)}
                  aria-pressed={selectedSegmentFilter === null}
                  className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    selectedSegmentFilter === null
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Tutti
                </button>
                {pilot.segments.map(segment => (
                  <button
                    key={segment.id}
                    onClick={() => setSelectedSegmentFilter(segment.id)}
                    aria-pressed={selectedSegmentFilter === segment.id}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                      selectedSegmentFilter === segment.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pilot.getSegmentLabel(segment)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PilotNodePicker
                label="Punto di partenza"
                nodes={filteredNodes}
                selectedNodeId={selectedSourceNodeId}
                onSelect={setSelectedSourceNodeId}
                getNodeLabel={pilot.getNodeLabel}
              />
              <PilotNodePicker
                label="Punto di arrivo"
                nodes={filteredNodes}
                selectedNodeId={selectedTargetNodeId}
                onSelect={setSelectedTargetNodeId}
                getNodeLabel={pilot.getNodeLabel}
              />
            </div>
          </div>

          {/* Vertical Link Form */}
          {selectedSourceNodeId && selectedTargetNodeId && pilot.isContributionAllowed && (
            <PilotVerticalLinkForm
              versionId={pilot.versions[0]?.id || ''}
              sourceNodeId={selectedSourceNodeId}
              targetNodeId={selectedTargetNodeId}
              isLoading={pilot.isLoading}
              asyncOperation={pilot.asyncOperation}
              onPropose={pilot.proposeLink}
            />
          )}

          {/* Link List */}
          <PilotLinkList
            links={filteredLinks}
            nodes={pilot.nodes}
            isContributionAllowed={pilot.isContributionAllowed}
            isLoading={pilot.isLoading}
            asyncOperation={pilot.asyncOperation}
            getRelationTypeLabel={pilot.getRelationTypeLabel}
            getStatusLabel={pilot.getStatusLabel}
            getNodeLabel={pilot.getNodeLabel}
            onDelete={pilot.deleteLink}
          />
        </div>
      )}
    </div>
  );
}
