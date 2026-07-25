/**
 * CML-631E — PilotMainView
 *
 * Vista principale per il pilot funzionale con flusso guidato
 * di collegamento curricolare.
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

  const sourceNode = pilot.nodes.find(n => n.id === selectedSourceNodeId) || null;
  const targetNode = pilot.nodes.find(n => n.id === selectedTargetNodeId) || null;

  const handleSourceSelect = (nodeId: string | null) => {
    setSelectedSourceNodeId(nodeId);
    if (selectedTargetNodeId && nodeId === selectedTargetNodeId) {
      setSelectedTargetNodeId(null);
    }
  };

  const handleTargetSelect = (nodeId: string | null) => {
    setSelectedTargetNodeId(nodeId);
  };

  const handleClearSelections = () => {
    setSelectedSourceNodeId(null);
    setSelectedTargetNodeId(null);
  };

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
          {/* Step Indicator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">
                CREA UN COLLEGAMENTO NEL CURRICOLO VERTICALE
              </span>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Scegli un elemento della primaria e indica come prosegue nella secondaria
              </h3>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              {[
                { key: 'source', label: 'Da quale elemento vuoi partire?' },
                { key: 'target', label: 'Quale elemento lo sviluppa?' },
                { key: 'relation', label: 'Tipo di relazione' },
                { key: 'rationale', label: 'Motivazione' },
                { key: 'confirm', label: 'Conferma' },
              ].map((step, index) => {
                const isCompleted =
                  (step.key === 'source' && selectedSourceNodeId) ||
                  (step.key === 'target' && selectedTargetNodeId) ||
                  (step.key === 'relation') ||
                  (step.key === 'rationale') ||
                  (step.key === 'confirm');
                const isCurrent =
                  (!selectedSourceNodeId && step.key === 'source') ||
                  (selectedSourceNodeId && !selectedTargetNodeId && step.key === 'target') ||
                  (selectedSourceNodeId && selectedTargetNodeId && step.key === 'relation');
                return (
                  <div key={step.key} className="flex items-center gap-1 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border-2 transition ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isCurrent
                            ? 'bg-white border-indigo-600 text-indigo-600'
                            : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span
                      className={`hidden sm:inline ${
                        isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < 4 && (
                      <div className={`flex-1 h-0.5 rounded ${isCompleted ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Segment Filter */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Filtra per livello scolastico:
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

            {/* Step 1: Source Node Picker */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                1. Da quale elemento vuoi partire?
              </h4>
              <PilotNodePicker
                label="Elemento di partenza"
                nodes={filteredNodes}
                selectedNodeId={selectedSourceNodeId}
                onSelect={handleSourceSelect}
                getNodeLabel={pilot.getNodeLabel}
                getNodeDescription={(node) => {
                  const segment = pilot.segments.find(s => s.id === node.segmentId);
                  const level = segment?.schoolLevel === 'primaria' ? 'Primaria' : 'Secondaria';
                  const grade = segment?.scope.type === 'grade' ? segment.scope.grade : '';
                  return `${level} · classe ${grade} · ${segment?.subjectOrFieldId || ''}`;
                }}
              />
            </div>

            {/* Step 2: Target Node Picker (disabled until source is selected) */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                2. Quale elemento lo sviluppa?
              </h4>
              {!selectedSourceNodeId && (
                <p className="text-[10px] text-slate-400 font-semibold">
                  Prima scegli il punto di partenza.
                </p>
              )}
              <PilotNodePicker
                label="Elemento di destinazione"
                nodes={filteredNodes.filter(n => n.id !== selectedSourceNodeId)}
                selectedNodeId={selectedTargetNodeId}
                onSelect={handleTargetSelect}
                getNodeLabel={pilot.getNodeLabel}
                getNodeDescription={(node) => {
                  const segment = pilot.segments.find(s => s.id === node.segmentId);
                  const level = segment?.schoolLevel === 'primaria' ? 'Primaria' : 'Secondaria';
                  const grade = segment?.scope.type === 'grade' ? segment.scope.grade : '';
                  return `${level} · classe ${grade} · ${segment?.subjectOrFieldId || ''}`;
                }}
                isDisabled={!selectedSourceNodeId}
              />
            </div>

            {/* Step 3-4: Natural Language Summary */}
            {selectedSourceNodeId && selectedTargetNodeId && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                  Hai scelto:
                </h4>
                <div className="space-y-2 text-[11px] text-slate-700 font-semibold">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-black">●</span>
                    <span>{sourceNode ? pilot.getNodeLabel(sourceNode) : selectedSourceNodeId}</span>
                  </div>
                  <div className="text-slate-400 text-center">→</div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-black">●</span>
                    <span>{targetNode ? pilot.getNodeLabel(targetNode) : selectedTargetNodeId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Clear Selections */}
            {(selectedSourceNodeId || selectedTargetNodeId) && (
              <button
                onClick={handleClearSelections}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider transition"
              >
                Cancella selezioni
              </button>
            )}
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

          {/* Link List (secondary position) */}
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