import { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import {
  LINK_TYPE_LABELS,
  NODE_TYPE_LABELS,
  getDisciplineDefinition,
  type CurriculumConsultationItem,
} from '../../../domain/curriculum';

export interface CurriculumNodeDetailProps {
  item: CurriculumConsultationItem;
  evidenceItems: CurriculumConsultationItem[];
  onBack: () => void;
  onUseInPlanning?: () => { ok: boolean; message?: string };
}

const NODE_DETAIL_LABELS: Record<string, string> = {
  traguardo: 'Traguardo di sviluppo',
  obiettivo: 'Obiettivo di apprendimento',
  evidenza: 'Evidenza osservabile',
};

export function CurriculumNodeDetail({ item, evidenceItems, onBack, onUseInPlanning }: CurriculumNodeDetailProps) {
  const [transferError, setTransferError] = useState<string | undefined>();
  const nodeLabel = NODE_DETAIL_LABELS[item.node.nodeType] ?? NODE_TYPE_LABELS.get(item.node.nodeType) ?? 'Riferimento curricolare';
  const disciplineLabel = getDisciplineDefinition(item.disciplineCode)?.label ?? item.disciplineCode;
  const sourceRefs = item.sourceRefs;
  const relatedEvidence = evidenceItems.filter(evidence => evidence.nodeId !== item.nodeId);

  return (
    <section className="space-y-4 fade-in" data-testid="curriculum-node-detail" aria-labelledby="curriculum-node-detail-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Torna alla consultazione
        </button>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-800">
          Consultazione in sola lettura
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">{nodeLabel}</span>
            <h2 id="curriculum-node-detail-title" className="mt-1 text-base font-black leading-tight text-slate-900">{item.node.text}</h2>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              {disciplineLabel} · {item.schoolOrder === 'secondaria' ? 'Secondaria di I grado' : item.schoolOrder} · {item.version.title}
            </p>
          </div>
          <span className="self-start rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
            {item.node.status}
          </span>
        </div>

        <div className="grid gap-4 pt-4 lg:grid-cols-2">
          <DetailSection title="Dove si colloca">
            <p className="font-bold text-slate-800">{item.segment.title}</p>
            {item.segment.description && <p className="mt-1">{item.segment.description}</p>}
            {item.node.grade && <p className="mt-2">Classe/fascia: <strong>{item.node.grade}</strong></p>}
            {item.node.period && <p>Periodo: <strong>{item.node.period}</strong></p>}
          </DetailSection>

          <DetailSection title="Contenuto">
            <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{item.node.text}</p>
            {item.node.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.node.keywords.map(keyword => <span key={keyword} className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">{keyword}</span>)}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Relazioni">
            {item.relations.length === 0 ? (
              <p className="font-semibold text-slate-500">Nessuna relazione curricolare registrata</p>
            ) : (
              <div className="space-y-2">
                {item.relations.map(relation => {
                  const target = relation.fromNodeRef.id === item.node.id ? relation.toNodeRef : relation.fromNodeRef;
                  return (
                    <div key={String(relation.id)} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-indigo-700">{LINK_TYPE_LABELS.get(relation.linkType) ?? relation.linkType}</p>
                        <p className="mt-1 font-semibold text-slate-700">{target.snapshotLabel ?? 'Riferimento collegato'}</p>
                        {relation.description && <p className="mt-1 text-[10px] text-slate-500">{relation.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {item.relations.length > 0 && <p className="mt-2 text-[10px] font-semibold text-slate-400">Sono mostrate solo relazioni curricolari registrate.</p>}
          </DetailSection>

          <DetailSection title="Fonte e provenienza">
            <p className="font-semibold text-slate-700">Versione: {item.version.title}</p>
            <p className="mt-1">Provenienza: <strong>{item.provenance}</strong></p>
            <p>Origine dati: <strong>{item.version.dataOrigin}</strong></p>
            {sourceRefs.length > 0 ? (
              <div className="mt-2 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Fonti associate</span>
                {sourceRefs.map(source => <p key={String(source.id)} className="flex items-center gap-1.5 font-semibold text-slate-700"><ExternalLink className="h-3 w-3 text-slate-400" />{source.snapshotLabel ?? 'Fonte curricolare'}</p>)}
              </div>
            ) : <p className="mt-2 font-semibold text-slate-500">Nessuna fonte curricolare disponibile</p>}
          </DetailSection>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Evidenze disponibili</span>
          {relatedEvidence.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[11px] font-semibold text-slate-700">
              {relatedEvidence.map(evidence => <li key={evidence.nodeId}>• {evidence.node.text}</li>)}
            </ul>
          ) : <p className="mt-1 text-[10px] font-semibold text-slate-500">Nessuna evidenza associata disponibile in questa proiezione</p>}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-[10px] font-semibold text-slate-500">Versione e contesto saranno mantenuti quando la progettazione sarà disponibile.</p>
          <button type="button" disabled={!onUseInPlanning} onClick={() => { const result = onUseInPlanning?.(); if (result && !result.ok) setTransferError(result.message ?? 'Impossibile trasferire il riferimento nella progettazione.'); }} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black transition ${onUseInPlanning ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'cursor-not-allowed bg-slate-300 text-slate-600'}`}>
            Usa nella progettazione
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {transferError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">{transferError}</p>}
      </div>
    </section>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-relaxed text-slate-500">
      <h3 className="mb-2 border-b border-slate-100 pb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </div>
  );
}
