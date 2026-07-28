/**
 * CML-630C — Curriculum e-Twin Domain Validation Prototype
 *
 * Componente principale del prototipo sperimentale.
 * Mostra la vista generale del curricolo verticale con confronto
 * tra modello A (relazioni incorporate) e modello B (relazioni esplicite).
 */

import type { CurriculumNode, InstitutionalRole, LinkRelationType } from '../domain/types';
import { useEtwinPrototype } from '../hooks/useEtwinPrototype';

const roleLabels: Record<InstitutionalRole, string> = {
  docente: 'Docente',
  dipartimento: 'Dipartimento',
  referente: 'Referente',
  collegio: 'Collegio',
};

const linkRelationLabels: Record<LinkRelationType, string> = {
  prerequisite: 'Prerequisito',
  continuity: 'Continuità',
  development: 'Sviluppo',
  deepening: 'Approfondimento',
  integration: 'Integrazione',
  discontinuity: 'Discontinuità',
};

const linkStatusLabels: Record<string, string> = {
  draft: 'Bozza',
  proposed: 'Proposto',
  validated: 'Validato',
  rejected: 'Rifiutato',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  'under-review': 'bg-yellow-100 text-yellow-700',
  'proposed-to-collegio': 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  superseded: 'bg-red-100 text-red-700',
  'not-started': 'bg-gray-100 text-gray-500',
  'open-for-contributions': 'bg-blue-100 text-blue-600',
  'ready-for-consolidation': 'bg-purple-100 text-purple-700',
  'included-in-proposal': 'bg-indigo-100 text-indigo-700',
  effective: 'bg-green-100 text-green-700',
  'legacy-imported': 'bg-orange-100 text-orange-700',
};

export function EtwinMainView() {
  const {
    versions,
    selectedVersion,
    versionSegments,
    selectedSegment,
    segmentNodes,
    selectedNode,
    nodeLinks,
    allVersionLinks,
    activeRole,
    viewMode,
    setSelectedVersionId,
    setSelectedSegmentId,
    setSelectedNodeId,
    setActiveRole,
    setViewMode,
    canPerformAction,
    handleTransitionLink,
  } = useEtwinPrototype();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Prototipo e-Twin su dati locali non verificati
          </h1>
          <p className="text-sm text-gray-600">
            CML-630C — Validazione sperimentale del modello di dominio
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Ruolo Simulato</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(roleLabels) as InstitutionalRole[]).map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>

        {/* Version Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Versione del Curricolo</h2>
          <div className="flex flex-wrap gap-2">
            {versions.map(version => (
              <button
                key={version.id}
                onClick={() => {
                  setSelectedVersionId(version.id);
                  setSelectedSegmentId(null);
                  setSelectedNodeId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedVersion.id === version.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {version.title}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${statusColors[version.status]}`}>
                  {version.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Modello di Rappresentazione</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('model-a')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'model-a'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Modello A — Relazioni Incorporate
            </button>
            <button
              onClick={() => setViewMode('model-b')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'model-b'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Modello B — Relazioni Esplicite
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Segments Panel */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Segmenti Curricolari</h2>
            <div className="space-y-2">
              {versionSegments.map(segment => (
                <button
                  key={segment.id}
                  onClick={() => {
                    setSelectedSegmentId(segment.id);
                    setSelectedNodeId(null);
                  }}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedSegment?.id === segment.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {segment.disciplineOrField}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors[segment.institutionalContentStatus]}`}>
                      {segment.institutionalContentStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {segment.schoolOrder} — {segment.scope.type === 'grade' ? segment.scope.grade : 'Fascia'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Framework: {segment.applicableFramework}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nodes Panel */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Nodi Curricolari
              {selectedSegment && (
                <span className="ml-2 text-gray-500 font-normal">
                  ({selectedSegment.disciplineOrField})
                </span>
              )}
            </h2>
            {selectedSegment ? (
              <div className="space-y-2">
                {segmentNodes.map((node: CurriculumNode) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedNode?.id === node.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {node.title}
                      </span>
                      <span className="text-xs text-gray-500">{node.type}</span>
                    </div>
                    {node.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {node.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Seleziona un segmento per visualizzare i nodi
              </p>
            )}
          </div>

          {/* Links Panel */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {viewMode === 'model-a' ? 'Relazioni Incorporate' : 'Relazioni Esplicite'}
            </h2>
            {viewMode === 'model-a' ? (
              <div className="space-y-2">
                {allVersionLinks.filter(l => l.relationType === 'prerequisite' || l.relationType === 'continuity' || l.relationType === 'development').length > 0 ? (
                  allVersionLinks
                    .filter(l => l.relationType === 'prerequisite' || l.relationType === 'continuity' || l.relationType === 'development')
                    .map(link => (
                      <div
                        key={link.id}
                        className="p-3 rounded-md border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {linkRelationLabels[link.relationType]}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors[link.status]}`}>
                            {linkStatusLabels[link.status]}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {link.sourceNodeId} → {link.targetNodeId}
                        </div>
                        {link.rationale && (
                          <p className="text-xs text-gray-600 mt-1">
                            {link.rationale}
                          </p>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Le relazioni incorporate sono rappresentate attraverso proprietà dei segmenti
                    (sourceSegmentId, replacesSegmentId) e continuità implicita.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedNode ? (
                  nodeLinks.length > 0 ? (
                    nodeLinks.map(link => (
                      <div
                        key={link.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          link.id === selectedNode?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {linkRelationLabels[link.relationType]}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors[link.status]}`}>
                            {linkStatusLabels[link.status]}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {link.sourceNodeId === selectedNode.id ? '→ ' : '← '}
                          {link.sourceNodeId === selectedNode.id ? link.targetNodeId : link.sourceNodeId}
                        </div>
                        {link.rationale && (
                          <p className="text-xs text-gray-600 mt-1">
                            {link.rationale}
                          </p>
                        )}
                        {canPerformAction('validate-link') && link.status === 'proposed' && (
                          <div className="mt-2 flex gap-1">
                            <button
                              onClick={() => handleTransitionLink(link.id, 'validated')}
                              className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Valida
                            </button>
                            <button
                              onClick={() => handleTransitionLink(link.id, 'rejected')}
                              className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Rifiuta
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nessuna relazione per questo nodo
                    </p>
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    Seleziona un nodo per visualizzare le sue relazioni
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validation Matrix */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Matrice di Confronto — Modello A vs Modello B
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Criterio</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Modello A</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Modello B</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Evidenza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Comprensibilità</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Semplice ma impreciso</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Esplicito e dettagliato</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Precisione pedagogica</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Bassa</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Alta</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Carico cognitivo</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Basso</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Medio</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Revisione per ruolo</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Limitata</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Completa</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Relazioni interdisciplinari</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Non rappresentabili</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Rappresentabili</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Motivazione della relazione</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Implicita</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Esplicita</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Validazione della relazione</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Non disponibile</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Disponibile</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900">Confronto tra versioni</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Difficile</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Possibile</td>
                  <td className="px-4 py-2 text-sm text-gray-600">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
