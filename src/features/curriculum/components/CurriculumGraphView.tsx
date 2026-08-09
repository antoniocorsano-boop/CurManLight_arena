import { ArrowDown, ArrowRight, CircleDot, ExternalLink } from 'lucide-react';
import {
  getDisciplineDefinition,
  LINK_TYPE_LABELS,
  NODE_TYPE_LABELS,
  type CurriculumConsultationItem,
  type CanonicalCurriculumVersion as CurriculumVersion,
  type DisciplineCode,
} from '../../../domain/curriculum';
import type { SchoolOrder } from '../../../types/curriculum';

export interface CurriculumGraphNode {
  id: string;
  item: CurriculumConsultationItem;
  selected: boolean;
}

export interface CurriculumGraphEdge {
  id: string;
  source: string;
  target: string;
  type: CurriculumConsultationItem['relations'][number]['linkType'];
  status: CurriculumConsultationItem['relations'][number]['status'];
  origin: CurriculumConsultationItem['relations'][number]['origin'];
  sourceRefs: CurriculumConsultationItem['relations'][number]['sourceRefs'];
}

export interface CurriculumGraphProjection {
  nodes: CurriculumGraphNode[];
  edges: CurriculumGraphEdge[];
  selectedNode: CurriculumGraphNode | undefined;
}

export function createCurriculumGraphProjection(
  items: CurriculumConsultationItem[],
  selectedNodeId?: string,
  filteredItems: CurriculumConsultationItem[] = items,
): CurriculumGraphProjection {
  const allowedIds = new Set(filteredItems.map(item => item.nodeId));
  const relations = new Map<string, CurriculumGraphEdge>();

  for (const item of filteredItems) {
    for (const relation of item.relations) {
      const source = String(relation.fromNodeRef.id);
      const target = String(relation.toNodeRef.id);
      if (!allowedIds.has(source) || !allowedIds.has(target)) continue;
      relations.set(String(relation.id), {
        id: String(relation.id),
        source,
        target,
        type: relation.linkType,
        status: relation.status,
        origin: relation.origin,
        sourceRefs: relation.sourceRefs,
      });
    }
  }

  const activeId = selectedNodeId && allowedIds.has(selectedNodeId)
    ? selectedNodeId
    : filteredItems[0]?.nodeId;
  const edges = [...relations.values()].sort((left, right) => left.id.localeCompare(right.id));
  const contextualIds = activeId
    ? new Set([activeId, ...edges.flatMap(edge => edge.source === activeId || edge.target === activeId ? [edge.source, edge.target] : [])])
    : new Set<string>();
  const nodes = filteredItems
    .filter(item => contextualIds.has(item.nodeId))
    .map(item => ({ id: item.nodeId, item, selected: item.nodeId === activeId }));
  const visibleIds = new Set(nodes.map(node => node.id));
  const contextualEdges = edges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target));

  return {
    nodes,
    edges: contextualEdges,
    selectedNode: nodes.find(node => node.selected),
  };
}

export interface CurriculumGraphViewProps {
  items: CurriculumConsultationItem[];
  selectedNodeId?: string;
  version: CurriculumVersion;
  schoolOrder: SchoolOrder;
  disciplineCode: DisciplineCode | undefined;
  onSelectNode: (nodeId: string) => void;
  onOpenNodeDetail: (nodeId: string, returnView: 'home' | 'albero' | 'mappa') => void;
}

export function CurriculumGraphView({ items, selectedNodeId, version, schoolOrder, disciplineCode, onSelectNode, onOpenNodeDetail }: CurriculumGraphViewProps) {
  const projection = createCurriculumGraphProjection(items, selectedNodeId);
  const disciplineLabel = disciplineCode ? getDisciplineDefinition(disciplineCode)?.label ?? disciplineCode : 'Curricolo';
  const orderLabel = schoolOrder === 'secondaria' ? 'Secondaria di I grado' : schoolOrder === 'primaria' ? 'Primaria' : 'Infanzia';

  return (
    <section className="space-y-4 fade-in" data-testid="curriculum-graph-view" aria-labelledby="curriculum-graph-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">CURR-03 · Proiezione canonica</span>
            <h2 id="curriculum-graph-title" className="mt-1 text-base font-black text-slate-900">Grafo curricolare contestuale</h2>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">{disciplineLabel} · {orderLabel} · {version.title}</p>
          </div>
          <span className="self-start rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-800">Solo relazioni registrate</span>
        </div>

        {!items.length ? (
          <p className="py-10 text-center text-sm font-semibold text-slate-500">Nessun elemento per i filtri correnti</p>
        ) : (
          <>
            <div className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Nodi del grafo">
              {projection.nodes.map(node => (
                <button key={node.id} type="button" aria-pressed={node.selected} onClick={() => onSelectNode(node.id)} className={`rounded-xl border p-3 text-left transition ${node.selected ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white'}`}>
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-700"><CircleDot className="h-3 w-3" />{NODE_TYPE_LABELS.get(node.item.node.nodeType) ?? node.item.node.nodeType}</span>
                  <span className="mt-1 block text-xs font-bold leading-relaxed text-slate-800">{node.item.node.text}</span>
                  {node.selected && <span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-indigo-600">Nodo attivo</span>}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Relazioni del grafo">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Relazioni canoniche</h3>
                <span className="text-[9px] font-bold text-slate-400">{projection.edges.length} edge</span>
              </div>
              {projection.edges.length === 0 ? (
                <p className="text-[11px] font-semibold text-slate-500">Nessuna relazione curricolare registrata</p>
              ) : (
                <div className="space-y-2">
                  {projection.edges.map(edge => {
                    const source = projection.nodes.find(node => node.id === edge.source)?.item;
                    const target = projection.nodes.find(node => node.id === edge.target)?.item;
                    return (
                      <div key={edge.id} data-testid="curriculum-graph-edge" className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-[10px] font-semibold text-slate-700">
                        <button type="button" onClick={() => onSelectNode(edge.source)} className="text-left font-bold text-indigo-700 hover:underline">{source?.node.text ?? 'Nodo sorgente'}</button>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        <button type="button" onClick={() => onSelectNode(edge.target)} className="text-left font-bold text-indigo-700 hover:underline">{target?.node.text ?? 'Nodo destinazione'}</button>
                        <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">{LINK_TYPE_LABELS.get(edge.type) ?? edge.type}</span>
                        <span className="flex w-full items-center gap-1 text-[9px] text-slate-400"><ArrowDown className="h-3 w-3" /> stato: {edge.status} · provenienza: {edge.origin}{edge.sourceRefs.length > 0 ? <><ExternalLink className="ml-1 h-3 w-3" /> fonte associata</> : null}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {projection.selectedNode && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                <p className="text-[10px] font-semibold text-slate-600">Selezionato: <strong>{projection.selectedNode.item.node.text}</strong></p>
                <button type="button" onClick={() => onOpenNodeDetail(projection.selectedNode!.id, 'mappa')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-indigo-700">Apri dettaglio <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
